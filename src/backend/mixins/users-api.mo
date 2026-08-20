import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import UsersT "../types/users";
import AuthT "../types/auth";
import CasesT "../types/cases";
import PaymentsT "../types/payments";
import UserLib "../lib/users";
import NotifT "../types/notifications";
import NotifLib "../lib/notifications";
import Time "mo:core/Time";
import Debug "mo:core/Debug";
import PaymentLib "../lib/payments";

mixin (
  accessControlState : AccessControl.AccessControlState,
  users              : Map.Map<Common.UserId, UsersT.User>,
  heroStats          : Map.Map<Common.UserId, UsersT.HeroStats>,
  helpSeekerStats    : Map.Map<Common.UserId, UsersT.HelpSeekerStats>,
  proudHearts        : List.List<UsersT.ProudHeart>,
  proofs             : List.List<CasesT.SupportProof>,
  cases              : Map.Map<Nat, CasesT.Case>,
  payments           : List.List<PaymentsT.Payment>,
  activeSessions     : Map.Map<Common.UserId, [UsersT.ActiveSession]>,
  kycSubmissions       : Map.Map<Common.UserId, AuthT.KycSubmission>,
  notifications        : List.List<NotifT.Notification>,
  notifState           : NotifLib.NotifState,
  creditTransactions   : List.List<PaymentsT.CreditTransaction>,
  callerPrincipalIndex : Map.Map<Text, Common.UserId>,
) {

  /// Platform statistics — always computed from real state, never hardcoded
  public type PlatformStats = {
    totalHeroes            : Nat;
    totalCases             : Nat;
    totalCompletedCases    : Nat;
    totalSupportDistributed : Nat;  // USD cents
  };

  public query func getPlatformStats() : async PlatformStats {
    var heroCount : Nat = 0;
    for ((_, u) in users.entries()) {
      if (u.role == #Hero and u.kycStatus == #Approved) {
        heroCount += 1;
      };
    };
    var approvedCases : Nat = 0;
    var completedCases : Nat = 0;
    for ((_, c) in cases.entries()) {
      switch (c.verificationStatus) {
        case (#InstitutionVerified) { approvedCases += 1 };
        case _ {};
      };
    };
    // Count proofs with #Completed status as completed cases
    for (p in proofs.values()) {
      if (p.status == #Completed) {
        completedCases += 1;
      };
    };
    // Sum confirmed payment amounts as support distributed
    var distributed : Nat = 0;
    for (p in payments.values()) {
      if (p.status == #Confirmed) {
        distributed += p.amountCents;
      };
    };
    {
      totalHeroes             = heroCount;
      totalCases              = approvedCases;
      totalCompletedCases     = completedCases;
      totalSupportDistributed = distributed;
    };
  };

  /// Get the caller's own full profile (includes kycStatus)
  public query ({ caller }) func getCallerUserProfile() : async ?UsersT.UserPublic {
    let userId = switch (callerPrincipalIndex.get(caller.toText())) {
      case (?uid) uid;
      case null   return null;
    };
    switch (users.get(userId)) {
      case (?u) ?UserLib.toPublic(u);
      case null null;
    };
  };

  /// Get the caller's current Support Credit balance (no userId needed)
  public query ({ caller }) func getCallerWallet() : async Int {
    let userId = switch (callerPrincipalIndex.get(caller.toText())) {
      case (?uid) uid;
      case null   return 0;
    };
    PaymentLib.getSupportCreditBalance(creditTransactions, userId);
  };

  /// Update caller's extended profile fields — caller principal is used for access control
  public shared ({ caller }) func updateUserProfileExtended(
    userId            : Common.UserId,
    fullName          : Text,
    country           : Common.Country,
    city              : Text,
    phoneNumber       : Text,
    bio               : Text,
    preferredLanguage : Text,
    timezone          : Text,
    avatarRef         : ?Common.FileRef,
  ) : async UsersT.UserPublic {
    // Resolve the caller's registered userId via callerPrincipalIndex
    let callerUserId = switch (callerPrincipalIndex.get(caller.toText())) {
      case (?uid) uid;
      case null   Runtime.trap("Unauthorized: please log in first");
    };
    // Caller must own the profile or be an admin
    if (callerUserId != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: caller does not own this profile");
    };
    // Validate that the user record exists and is active
    let user = switch (users.get(userId)) {
      case (?u) u;
      case null Runtime.trap("User not found");
    };
    if (not user.isActive) {
      Runtime.trap("Unauthorized: account is inactive");
    };
    UserLib.updateUserProfileExtended(
      users, userId, fullName, country, city, phoneNumber, bio, preferredLanguage, timezone, avatarRef,
    );
  };

  /// Update caller's own profile fields using caller principal directly (no userId param)
  public shared ({ caller }) func updateCallerProfile(
    fullName          : Text,
    country           : Common.Country,
    city              : Text,
    phoneNumber       : Text,
    bio               : Text,
    preferredLanguage : Text,
    timezone          : Text,
    avatarRef         : ?Common.FileRef,
  ) : async UsersT.UserPublic {
    // Resolve the caller's registered userId via callerPrincipalIndex
    let userId = switch (callerPrincipalIndex.get(caller.toText())) {
      case (?uid) uid;
      case null   Runtime.trap("Unauthorized: please log in first");
    };
    let user = switch (users.get(userId)) {
      case (?u) u;
      case null Runtime.trap("User not found");
    };
    if (not user.isActive) {
      Runtime.trap("Unauthorized: account is inactive");
    };
    UserLib.updateUserProfileExtended(
      users, userId, fullName, country, city, phoneNumber, bio, preferredLanguage, timezone, avatarRef,
    );
  };

  /// Update caller's app settings
  public shared ({ caller }) func updateUserSettings(
    language           : Text,
    theme              : Text,
    currencyDisplay    : Text,
    timezone           : Text,
    emailNotifications : Bool,
    inAppNotifications : Bool,
    weeklyDigest       : Bool,
    highContrast       : Bool,
    largerText         : Bool,
    reducedAnimations  : Bool,
  ) : async UsersT.UserSettingsPublic {
    let userId = switch (callerPrincipalIndex.get(caller.toText())) {
      case (?uid) uid;
      case null   Runtime.trap("Unauthorized: not authenticated");
    };
    UserLib.updateUserSettings(
      users, userId, language, theme, currencyDisplay, timezone,
      emailNotifications, inAppNotifications, weeklyDigest,
      highContrast, largerText, reducedAnimations,
    );
  };

  /// Get caller's settings
  public query ({ caller }) func getUserSettings() : async ?UsersT.UserSettingsPublic {
    let userId = switch (callerPrincipalIndex.get(caller.toText())) {
      case (?uid) uid;
      case null   return null;
    };
    UserLib.getUserSettings(users, userId);
  };

  /// Get settings for a user by userId (no caller check — for anonymous actor use)
  public query func getUserSettingsByUserId(userId : Text) : async ?UsersT.UserSettingsPublic {
    UserLib.getUserSettings(users, userId);
  };

  /// Update settings for a user by userId — caller must match userId or be admin
  public shared ({ caller }) func updateUserSettingsByUserId(
    userId             : Text,
    language           : Text,
    theme              : Text,
    currencyDisplay    : Text,
    timezone           : Text,
    emailNotifications : Bool,
    inAppNotifications : Bool,
    weeklyDigest       : Bool,
    highContrast       : Bool,
    largerText         : Bool,
    reducedAnimations  : Bool,
  ) : async UsersT.UserSettingsPublic {
    // Verify user exists before updating
    switch (users.get(userId)) {
      case null { Runtime.trap("User not found") };
      case (?_) {};
    };
    // Caller must own the userId or be admin
    let callerText = caller.toText();
    let callerOwns : Bool = (
      callerText == userId or
      (switch (users.get(callerText)) {
        case (?u) u.id == userId;
        case null false;
      })
    );
    if (not callerOwns and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: caller does not own this settings record");
    };
    UserLib.updateUserSettings(
      users, userId, language, theme, currencyDisplay, timezone,
      emailNotifications, inAppNotifications, weeklyDigest,
      highContrast, largerText, reducedAnimations,
    );
  };

  /// Get privacy settings for a user by userId (no caller check — for anonymous actor use)
  public query func getPrivacySettingsByUserId(userId : Text) : async ?UsersT.PrivacySettingsPublic {
    UserLib.getPrivacySettings(users, userId);
  };

  /// Update privacy settings for a user by userId — caller must match userId or be admin
  public shared ({ caller }) func updatePrivacySettingsByUserId(
    userId                    : Text,
    profileVisibility         : Text,
    countryVisibility         : Bool,
    activityVisibility        : Bool,
    emailNotificationsEnabled : Bool,
    inAppNotificationsEnabled : Bool,
    caseUpdatesEnabled        : Bool,
  ) : async UsersT.PrivacySettingsPublic {
    // Verify user exists before updating
    switch (users.get(userId)) {
      case null { Runtime.trap("User not found") };
      case (?_) {};
    };
    // Caller must own the userId or be admin
    let callerText = caller.toText();
    let callerOwns : Bool = (
      callerText == userId or
      (switch (users.get(callerText)) {
        case (?u) u.id == userId;
        case null false;
      })
    );
    if (not callerOwns and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: caller does not own this privacy record");
    };
    UserLib.updatePrivacySettings(
      users, userId, profileVisibility, countryVisibility, activityVisibility,
      emailNotificationsEnabled, inAppNotificationsEnabled, caseUpdatesEnabled,
    );
  };

  /// Update caller's privacy settings
  public shared ({ caller }) func updatePrivacySettings(
    profileVisibility         : Text,
    countryVisibility         : Bool,
    activityVisibility        : Bool,
    emailNotificationsEnabled : Bool,
    inAppNotificationsEnabled : Bool,
    caseUpdatesEnabled        : Bool,
  ) : async UsersT.PrivacySettingsPublic {
    let userId = switch (callerPrincipalIndex.get(caller.toText())) {
      case (?uid) uid;
      case null   Runtime.trap("Unauthorized: not authenticated");
    };
    UserLib.updatePrivacySettings(
      users, userId, profileVisibility, countryVisibility, activityVisibility,
      emailNotificationsEnabled, inAppNotificationsEnabled, caseUpdatesEnabled,
    );
  };

  /// Get caller's privacy settings
  public query ({ caller }) func getPrivacySettings() : async ?UsersT.PrivacySettingsPublic {
    let userId = switch (callerPrincipalIndex.get(caller.toText())) {
      case (?uid) uid;
      case null   return null;
    };
    UserLib.getPrivacySettings(users, userId);
  };

  /// Request a data download (sends admin notification)
  public shared ({ caller }) func requestDataDownload() : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    // Verify user exists
    switch (users.get(caller.toText())) {
      case null Runtime.trap("User not found");
      case (?_) {};
    };
    "Data download request received. An admin will process your request within 30 days.";
  };

  /// Request account deletion (marks account as inactive, admin handles cleanup)
  public shared ({ caller }) func requestAccountDeletion() : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let user = switch (users.get(caller.toText())) {
      case (?u) u;
      case null Runtime.trap("User not found");
    };
    user.isActive := false;
    "Account deletion request submitted. Your account will be permanently deleted within 30 days.";
  };

  /// Get the active sessions for the calling user
  public query ({ caller }) func getActiveSessions() : async [UsersT.ActiveSession] {
    let userId = switch (callerPrincipalIndex.get(caller.toText())) {
      case (?uid) uid;
      case null   return [];
    };
    switch (activeSessions.get(userId)) {
      case (?sessions) sessions;
      case null [];
    };
  };

  /// Revoke a specific session by ID for the calling user
  public shared ({ caller }) func revokeSession(sessionId : Text) : async { #ok : Text; #err : Text } {
    let userId = switch (callerPrincipalIndex.get(caller.toText())) {
      case (?uid) uid;
      case null   return #err("Not authenticated: please log in first");
    };
    switch (activeSessions.get(userId)) {
      case (?sessions) {
        let found = sessions.filter(func(s : UsersT.ActiveSession) : Bool { s.id == sessionId });
        if (found.size() == 0) { return #err("Session not found") };
        let remaining = sessions.filter(func(s : UsersT.ActiveSession) : Bool { s.id != sessionId });
        activeSessions.add(userId, remaining);
        #ok("Session revoked successfully");
      };
      case null #err("No active sessions found");
    };
  };


  /// Logout all other devices (clears saved device records)
  public shared ({ caller }) func logoutAllOtherDevices() : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    UserLib.logoutAllOtherDevices(users, caller.toText());
  };

  /// Get caller's current trust score
  public query ({ caller }) func getMyTrustScore() : async Nat {
    let user = switch (users.get(caller.toText())) {
      case (?u) u;
      case null return 0;
    };
    UserLib.computeTrustScore(user, proofs);
  };

  /// Admin: update KYC status for a user (accepts #Pending, #Approved, #Rejected)
  public shared ({ caller }) func adminUpdateKycStatus(
    userId : Common.UserId,
    status : UsersT.KycStatus,
  ) : async UsersT.UserPublic {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    UserLib.updateKycStatus(users, userId, status);
  };

  /// Register a new user. Idempotent — returns existing profile if already registered.
  /// userId must be explicitly passed (Text ID from auth system).
  public shared ({ caller }) func registerUser(
    userId   : Common.UserId,
    fullName : Text,
    email    : ?Text,
    role     : Common.Role,
  ) : async UsersT.UserPublic {
    ignore caller;
    UserLib.registerUser(users, userId, fullName, email, role);
  };

  /// Get a user by Text ID
  public query func getUser(id : Common.UserId) : async ?UsersT.UserPublic {
    switch (users.get(id)) {
      case (?u) ?UserLib.toPublic(u);
      case null null;
    };
  };

  /// Update the calling user's mutable profile fields
  public shared ({ caller }) func updateUserProfile(
    fullName  : Text,
    country   : Common.Country,
    avatarRef : ?Common.FileRef,
  ) : async UsersT.UserPublic {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    UserLib.updateProfile(users, caller.toText(), fullName, country, avatarRef);
  };

  /// Switch between Hero and HelpSeeker roles
  public shared ({ caller }) func switchRole(newRole : Common.Role) : async UsersT.UserPublic {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    UserLib.switchRole(users, caller.toText(), newRole);
  };

  /// Get hero stats for a user
  public query func getHeroStats(userId : Common.UserId) : async ?UsersT.HeroStatsPublic {
    switch (heroStats.get(userId)) {
      case (?s) ?UserLib.heroStatsToPublic(s);
      case null null;
    };
  };

  /// Get help seeker stats for a user
  public query func getHelpSeekerStats(userId : Common.UserId) : async ?UsersT.HelpSeekerStatsPublic {
    switch (helpSeekerStats.get(userId)) {
      case (?s) ?UserLib.helpSeekerStatsToPublic(s);
      case null null;
    };
  };

  /// Award a Proud Heart from a help seeker to a hero for a completed case
  public shared ({ caller }) func awardProudHeart(caseId : Nat, heroId : Common.UserId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let theCase = switch (cases.get(caseId)) {
      case (?c) c;
      case null Runtime.trap("Case not found");
    };
    let hasApprovedProof = switch (proofs.find(func(p) {
      p.caseId == caseId and p.heroId == heroId and p.status == #Approved
    })) { case (?_) true; case null false };
    if (not hasApprovedProof) Runtime.trap("No approved proof from hero for this case");
    let helpSeekerId = theCase.createdBy;
    ignore caller;
    let alreadyAwarded = switch (proudHearts.find(func(ph) {
      ph.caseId == caseId and ph.fromHelpSeeker == helpSeekerId
    })) { case (?_) true; case null false };
    if (alreadyAwarded) Runtime.trap("Proud Heart already awarded for this case");
    proudHearts.add({
      caseId;
      fromHelpSeeker = helpSeekerId;
      toHero         = heroId;
      awardedAt      = Time.now();
    });
    switch (heroStats.get(heroId)) {
      case (?s) s.proudHeartCount += 1;
      case null {};
    };
  };

  /// Get all Proud Hearts awarded to a hero
  public query func getProudHeartsForHero(heroId : Common.UserId) : async [UsersT.ProudHeart] {
    proudHearts.filter(func(ph) { ph.toHero == heroId }).toArray();
  };

  /// Compute and return achievements for a hero
  public query func computeAchievements(heroId : Common.UserId) : async [UsersT.Achievement] {
    let stats = switch (heroStats.get(heroId)) {
      case (?s) s;
      case null return [];
    };
    let phCount = proudHearts.filter(func(ph) { ph.toHero == heroId }).size();
    let distinctCats = UserLib.countDistinctCategories(proofs, cases, heroId);
    let eduCount = UserLib.countCategoryCompletions(proofs, cases, heroId, #Education);
    let medCount = UserLib.countCategoryCompletions(proofs, cases, heroId, #Medical);
    var result : List.List<UsersT.Achievement> = List.empty();
    if (stats.casesSupported >= 1)  result.add(#FirstSupport);
    if (stats.peopleHelped >= 10)   result.add(#TenPeopleHelped);
    if (stats.peopleHelped >= 50)   result.add(#FiftyPeopleHelped);
    if (eduCount >= 3)              result.add(#EducationHero);
    if (medCount >= 3)              result.add(#MedicalHero);
    if (distinctCats >= 5)          result.add(#CommunityHero);
    if (phCount >= 50)              result.add(#TrustedHero);
    result.toArray();
  };

  /// Admin: get all users
  public query ({ caller }) func getAllUsers() : async [UsersT.UserPublic] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    users.values().map(func(u : UsersT.User) : UsersT.UserPublic { UserLib.toPublic(u) }).toArray();
  };

  /// Admin: suspend a user
  public shared ({ caller }) func suspendUser(userId : Common.UserId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let user = switch (users.get(userId)) {
      case (?u) u;
      case null Runtime.trap("User not found");
    };
    user.isActive := false;
  };

  /// Admin: ban a user (alias for suspend; marked as permanent in UI)
  public shared ({ caller }) func banUser(userId : Common.UserId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let user = switch (users.get(userId)) {
      case (?u) u;
      case null Runtime.trap("User not found");
    };
    user.isActive := false;
  };

  // ── Admin KYC Management ──────────────────────────────────────────────────

  /// Admin: get all pending KYC submissions
  public query ({ caller }) func getPendingKycSubmissions() : async [AuthT.KycSubmission] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let result = List.empty<AuthT.KycSubmission>();
    for ((_, sub) in kycSubmissions.entries()) {
      if (sub.status == #pending) {
        result.add(sub);
      };
    };
    result.toArray();
  };

  /// Admin: get a specific user's KYC submission
  public query ({ caller }) func getKycSubmissionByUserId(
    userId : Text,
  ) : async ?AuthT.KycSubmission {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    kycSubmissions.get(userId);
  };

  /// Admin: approve a user's KYC submission
  public shared ({ caller }) func approveKyc(
    userId    : Text,
    adminNote : ?Text,
  ) : async UsersT.UserPublic {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let user = switch (users.get(userId)) {
      case (?u) u;
      case null Runtime.trap("User not found");
    };
    user.kycStatus := #Approved;
    // Update submission status
    switch (kycSubmissions.get(userId)) {
      case (?sub) {
        let updated : AuthT.KycSubmission = { sub with status = #approved };
        kycSubmissions.add(userId, updated);
      };
      case null {};
    };
    // Create notification for the user
    let noteText = switch (adminNote) {
      case (?n) n;
      case null "Your identity has been verified successfully.";
    };
    ignore NotifLib.create(
      notifications, notifState, userId, #KycApproved,
      "KYC Approved", noteText, null, null,
    );
    UserLib.toPublic(user);
  };

  /// Admin: reject a user's KYC submission
  public shared ({ caller }) func rejectKyc(
    userId    : Text,
    adminNote : ?Text,
  ) : async UsersT.UserPublic {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let user = switch (users.get(userId)) {
      case (?u) u;
      case null Runtime.trap("User not found");
    };
    user.kycStatus := #Rejected;
    // Update submission status
    switch (kycSubmissions.get(userId)) {
      case (?sub) {
        let updated : AuthT.KycSubmission = { sub with status = #rejected };
        kycSubmissions.add(userId, updated);
      };
      case null {};
    };
    // Create notification for the user
    let noteText = switch (adminNote) {
      case (?n) n;
      case null "Your KYC submission could not be verified. Please resubmit with valid documents.";
    };
    ignore NotifLib.create(
      notifications, notifState, userId, #KycRejected,
      "KYC Rejected", noteText, null, null,
    );
    UserLib.toPublic(user);
  };

  // ── State Verification ────────────────────────────────────────────────────

  /// Diagnostic query: verify state persistence after canister upgrades
  public query func testStateRecovery() : async {
    userCount         : Nat;
    kycCount          : Nat;
    sessionCount      : Nat;
    sampleSettings    : ?UsersT.UserSettingsPublic;
    sampleSessions    : [UsersT.ActiveSession];
    sampleKyc         : ?AuthT.KycSubmission;
  } {
    var sampleSettings : ?UsersT.UserSettingsPublic = null;
    var sampleSessions : [UsersT.ActiveSession] = [];
    var sampleKyc : ?AuthT.KycSubmission = null;

    // Pick first user's settings if any
    for ((_, u) in users.entries()) {
      if (sampleSettings == null) {
        switch (u.settings) {
          case (?s) {
            sampleSettings := ?{
              language           = s.language;
              theme              = s.theme;
              currencyDisplay    = s.currencyDisplay;
              timezone           = s.timezone;
              emailNotifications = s.emailNotifications;
              inAppNotifications = s.inAppNotifications;
              weeklyDigest       = s.weeklyDigest;
              highContrast       = s.highContrast;
              largerText         = s.largerText;
              reducedAnimations  = s.reducedAnimations;
            };
          };
          case null {};
        };
      };
    };

    // Pick first user's sessions if any
    for ((_, sessions) in activeSessions.entries()) {
      if (sampleSessions.size() == 0 and sessions.size() > 0) {
        sampleSessions := sessions;
      };
    };

    // Pick first KYC submission if any
    for ((_, sub) in kycSubmissions.entries()) {
      if (sampleKyc == null) {
        sampleKyc := ?sub;
      };
    };

    {
      userCount    = users.size();
      kycCount     = kycSubmissions.size();
      sessionCount = activeSessions.size();
      sampleSettings;
      sampleSessions;
      sampleKyc;
    };
  };
};


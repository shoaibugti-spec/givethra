import Time "mo:core/Time";
import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Runtime "mo:core/Runtime";
import Common "../types/common";
import Users "../types/users";
import Cases "../types/cases";
import Int "mo:core/Int";

module {

  /// Convert User mutable record to shared UserPublic
  public func toPublic(u : Users.User) : Users.UserPublic {
    {
      id               = u.id;
      fullName         = u.fullName;
      email            = u.email;
      role             = u.role;
      country          = u.country;
      city             = u.city;
      phoneNumber      = u.phoneNumber;
      bio              = u.bio;
      preferredLanguage = u.preferredLanguage;
      timezone         = u.timezone;
      avatarRef        = u.avatarRef;
      createdAt        = u.createdAt;
      isActive         = u.isActive;
      kycStatus        = u.kycStatus;
      lastLoginAt      = u.lastLoginAt;
      isPhoneVerified  = u.isPhoneVerified;
      isEmailVerified  = u.isEmailVerified;
      authMethod       = u.authMethod;
    };
  };

  /// Convert HeroStats to shared
  public func heroStatsToPublic(s : Users.HeroStats) : Users.HeroStatsPublic {
    {
      proudHeartCount = s.proudHeartCount;
      peopleHelped    = s.peopleHelped;
      casesSupported  = s.casesSupported;
      casesCompleted  = s.casesCompleted;
      achievements    = s.achievements;
    };
  };

  /// Convert UserSettings to shared
  public func settingsToPublic(s : Users.UserSettings) : Users.UserSettingsPublic {
    {
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

  /// Convert PrivacySettings to shared
  public func privacyToPublic(p : Users.PrivacySettings) : Users.PrivacySettingsPublic {
    {
      profileVisibility         = p.profileVisibility;
      countryVisibility         = p.countryVisibility;
      activityVisibility        = p.activityVisibility;
      emailNotificationsEnabled = p.emailNotificationsEnabled;
      inAppNotificationsEnabled = p.inAppNotificationsEnabled;
      caseUpdatesEnabled        = p.caseUpdatesEnabled;
    };
  };

  /// Default UserSettings
  func defaultSettings() : Users.UserSettings {
    {
      var language           = "en";
      var theme              = "system";
      var currencyDisplay    = "USD";
      var timezone           = "UTC";
      var emailNotifications = true;
      var inAppNotifications = true;
      var weeklyDigest       = false;
      var highContrast       = false;
      var largerText         = false;
      var reducedAnimations  = false;
    };
  };

  /// Default PrivacySettings
  func defaultPrivacy() : Users.PrivacySettings {
    {
      var profileVisibility         = "public";
      var countryVisibility         = true;
      var activityVisibility        = true;
      var emailNotificationsEnabled = true;
      var inAppNotificationsEnabled = true;
      var caseUpdatesEnabled        = true;
    };
  };

  /// Convert HelpSeekerStats to shared
  public func helpSeekerStatsToPublic(s : Users.HelpSeekerStats) : Users.HelpSeekerStatsPublic {
    {
      requestsSubmitted = s.requestsSubmitted;
      requestsApproved  = s.requestsApproved;
      requestsCompleted = s.requestsCompleted;
    };
  };

  /// Create a brand-new user record with the given Text ID
  public func createUser(
    users      : Map.Map<Common.UserId, Users.User>,
    userId     : Common.UserId,
    fullName   : Text,
    email      : ?Text,
    role       : Common.Role,
    authMethod : Users.AuthMethod,
  ) : Users.User {
    let user : Users.User = {
      id                   = userId;
      var fullName          = fullName;
      var email             = email;
      var role              = role;
      var country           = "";
      var city              = "";
      var phoneNumber       = null;
      var bio               = "";
      var preferredLanguage = "";
      var timezone          = "";
      var avatarRef         = null;
      createdAt             = Time.now();
      var isActive          = true;
      var kycStatus         = #Pending;
      var settings          = null;
      var privacySettings   = null;
      var loginDevices      = [];
      var lastLoginAt       = Time.now();
      var authMethod        = authMethod;
      var googleId          = null;
      var passwordHash      = null;
      var phoneOtpCode      = null;
      var phoneOtpExpiry    = null;
      var emailOtpCode      = null;
      var emailOtpExpiry    = null;
      var isPhoneVerified   = false;
      var isEmailVerified   = false;
    };
    users.add(userId, user);
    user;
  };

  /// Register or update a user; return existing or new user
  public func registerUser(
    users     : Map.Map<Common.UserId, Users.User>,
    userId    : Common.UserId,
    fullName  : Text,
    email     : ?Text,
    role      : Common.Role,
  ) : Users.UserPublic {
    switch (users.get(userId)) {
      case (?existing) {
        toPublic(existing);
      };
      case null {
        let user = createUser(users, userId, fullName, email, role, #email);
        toPublic(user);
      };
    };
  };

  /// Get user by Text ID
  public func getUserById(
    users  : Map.Map<Common.UserId, Users.User>,
    userId : Common.UserId,
  ) : ?Users.UserPublic {
    switch (users.get(userId)) {
      case (?u) ?toPublic(u);
      case null null;
    };
  };

  /// Update mutable profile fields
  public func updateProfile(
    users    : Map.Map<Common.UserId, Users.User>,
    caller   : Common.UserId,
    fullName : Text,
    country  : Common.Country,
    avatarRef : ?Common.FileRef,
  ) : Users.UserPublic {
    let user = switch (users.get(caller)) {
      case (?u) u;
      case null Runtime.trap("User not found");
    };
    user.fullName  := fullName;
    user.country   := country;
    user.avatarRef := avatarRef;
    toPublic(user);
  };

  /// Update all extended profile fields
  public func updateUserProfileExtended(
    users             : Map.Map<Common.UserId, Users.User>,
    caller            : Common.UserId,
    fullName          : Text,
    country           : Common.Country,
    city              : Text,
    phoneNumber       : Text,
    bio               : Text,
    preferredLanguage : Text,
    timezone          : Text,
    avatarRef         : ?Common.FileRef,
  ) : Users.UserPublic {
    let user = switch (users.get(caller)) {
      case (?u) u;
      case null Runtime.trap("User not found");
    };
    user.fullName          := fullName;
    user.country           := country;
    user.city              := city;
    user.phoneNumber       := ?phoneNumber;
    user.bio               := bio;
    user.preferredLanguage := preferredLanguage;
    user.timezone          := timezone;
    user.avatarRef         := avatarRef;
    toPublic(user);
  };

  /// Update user settings
  public func updateUserSettings(
    users              : Map.Map<Common.UserId, Users.User>,
    caller             : Common.UserId,
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
  ) : Users.UserSettingsPublic {
    let user = switch (users.get(caller)) {
      case (?u) u;
      case null Runtime.trap("User not found");
    };
    let s : Users.UserSettings = switch (user.settings) {
      case (?existing) existing;
      case null {
        let fresh = defaultSettings();
        user.settings := ?fresh;
        fresh;
      };
    };
    s.language           := language;
    s.theme              := theme;
    s.currencyDisplay    := currencyDisplay;
    s.timezone           := timezone;
    s.emailNotifications := emailNotifications;
    s.inAppNotifications := inAppNotifications;
    s.weeklyDigest       := weeklyDigest;
    s.highContrast       := highContrast;
    s.largerText         := largerText;
    s.reducedAnimations  := reducedAnimations;
    settingsToPublic(s);
  };

  /// Get user settings (returns defaults if not yet set)
  public func getUserSettings(
    users  : Map.Map<Common.UserId, Users.User>,
    caller : Common.UserId,
  ) : ?Users.UserSettingsPublic {
    switch (users.get(caller)) {
      case null null;
      case (?u) {
        let s = switch (u.settings) {
          case (?existing) existing;
          case null defaultSettings();
        };
        ?settingsToPublic(s);
      };
    };
  };

  /// Update privacy settings
  public func updatePrivacySettings(
    users                     : Map.Map<Common.UserId, Users.User>,
    caller                    : Common.UserId,
    profileVisibility         : Text,
    countryVisibility         : Bool,
    activityVisibility        : Bool,
    emailNotificationsEnabled : Bool,
    inAppNotificationsEnabled : Bool,
    caseUpdatesEnabled        : Bool,
  ) : Users.PrivacySettingsPublic {
    let user = switch (users.get(caller)) {
      case (?u) u;
      case null Runtime.trap("User not found");
    };
    let p : Users.PrivacySettings = switch (user.privacySettings) {
      case (?existing) existing;
      case null {
        let fresh = defaultPrivacy();
        user.privacySettings := ?fresh;
        fresh;
      };
    };
    p.profileVisibility         := profileVisibility;
    p.countryVisibility         := countryVisibility;
    p.activityVisibility        := activityVisibility;
    p.emailNotificationsEnabled := emailNotificationsEnabled;
    p.inAppNotificationsEnabled := inAppNotificationsEnabled;
    p.caseUpdatesEnabled        := caseUpdatesEnabled;
    privacyToPublic(p);
  };

  /// Get privacy settings (returns defaults if not yet set)
  public func getPrivacySettings(
    users  : Map.Map<Common.UserId, Users.User>,
    caller : Common.UserId,
  ) : ?Users.PrivacySettingsPublic {
    switch (users.get(caller)) {
      case null null;
      case (?u) {
        let p = switch (u.privacySettings) {
          case (?existing) existing;
          case null defaultPrivacy();
        };
        ?privacyToPublic(p);
      };
    };
  };

  /// Get login devices for a user
  public func getLoginDevices(
    users  : Map.Map<Common.UserId, Users.User>,
    caller : Common.UserId,
  ) : [Users.LoginDevice] {
    switch (users.get(caller)) {
      case null [];
      case (?u) u.loginDevices;
    };
  };

  /// Clear all login devices (logout all other sessions)
  /// Returns count of sessions cleared
  public func logoutAllOtherDevices(
    users  : Map.Map<Common.UserId, Users.User>,
    caller : Common.UserId,
  ) : Nat {
    let user = switch (users.get(caller)) {
      case (?u) u;
      case null Runtime.trap("User not found");
    };
    let count = user.loginDevices.size();
    user.loginDevices := [];
    count;
  };

  /// Compute trust score for a user
  /// - KYC Approved: +50
  /// - Each approved proof: +10 (max 30)
  /// - Account age: +1 per 10 days (max 20)
  public func computeTrustScore(
    user   : Users.User,
    proofs : List.List<Cases.SupportProof>,
  ) : Nat {
    var score : Nat = 0;
    if (user.kycStatus == #Approved) { score += 50 };
    var approvedCount : Nat = 0;
    proofs.forEach(func(p) {
      if (p.heroId == user.id and p.status == #Approved) {
        approvedCount += 1;
      };
    });
    let proofBonus = if (approvedCount * 10 > 30) 30 else approvedCount * 10;
    score += proofBonus;
    let nowNs   = Time.now();
    let ageNs   = nowNs - user.createdAt;
    let ageDays = ageNs / 86_400_000_000_000;
    let ageBonusRaw : Int = ageDays / 10;
    let ageBonus : Nat = if (ageBonusRaw <= 0) 0 else if (ageBonusRaw > 20) 20 else ageBonusRaw.toNat();
    score += ageBonus;
    score;
  };

  /// Switch role between Hero and HelpSeeker
  public func switchRole(
    users  : Map.Map<Common.UserId, Users.User>,
    caller : Common.UserId,
    newRole : Common.Role,
  ) : Users.UserPublic {
    let user = switch (users.get(caller)) {
      case (?u) u;
      case null Runtime.trap("User not found");
    };
    user.role := newRole;
    toPublic(user);
  };

  /// Compute achievements for a hero based on their stats and distinct help seekers helped
  public func computeAchievements(
    heroStats         : Users.HeroStats,
    distinctCategories : Nat,
    proudHearts       : Nat,
  ) : [Users.Achievement] {
    let result : List.List<Users.Achievement> = List.empty();
    if (heroStats.casesSupported >= 1) result.add(#FirstSupport);
    if (heroStats.peopleHelped >= 10) result.add(#TenPeopleHelped);
    if (heroStats.peopleHelped >= 50) result.add(#FiftyPeopleHelped);
    if (distinctCategories >= 5)      result.add(#CommunityHero);
    if (proudHearts >= 50)            result.add(#TrustedHero);
    result.toArray();
  };

  /// Count distinct categories a hero has supported
  public func countDistinctCategories(
    proofs : List.List<Cases.SupportProof>,
    cases  : Map.Map<Nat, Cases.Case>,
    heroId : Common.UserId,
  ) : Nat {
    let cats : Set.Set<Text> = Set.empty();
    proofs.forEach(func(p) {
      if (p.heroId == heroId and p.status == #Approved) {
        switch (cases.get(p.caseId)) {
          case (?c) cats.add(debug_show(c.category));
          case null {};
        };
      };
    });
    cats.size();
  };

  /// Count distinct help seekers a hero has helped
  public func countDistinctHelpSeekers(
    proofs : List.List<Cases.SupportProof>,
    cases  : Map.Map<Nat, Cases.Case>,
    heroId : Common.UserId,
  ) : Nat {
    let seekers : Set.Set<Text> = Set.empty();
    proofs.forEach(func(p) {
      if (p.heroId == heroId and p.status == #Approved) {
        switch (cases.get(p.caseId)) {
          case (?c) seekers.add(c.createdBy);
          case null {};
        };
      };
    });
    seekers.size();
  };

  /// Count category completions for a hero
  public func countCategoryCompletions(
    proofs    : List.List<Cases.SupportProof>,
    cases     : Map.Map<Nat, Cases.Case>,
    heroId    : Common.UserId,
    category  : Cases.Category,
  ) : Nat {
    var count = 0;
    proofs.forEach(func(p) {
      if (p.heroId == heroId and p.status == #Approved) {
        switch (cases.get(p.caseId)) {
          case (?c) if (c.category == category) count += 1;
          case null {};
        };
      };
    });
    count;
  };
  /// Update KYC status for a user (admin action)
  public func updateKycStatus(
    users    : Map.Map<Common.UserId, Users.User>,
    userId   : Common.UserId,
    status   : Users.KycStatus,
  ) : Users.UserPublic {
    let user = switch (users.get(userId)) {
      case (?u) u;
      case null Runtime.trap("User not found");
    };
    user.kycStatus := status;
    toPublic(user);
  };
};

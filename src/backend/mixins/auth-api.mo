import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Common "../types/common";
import UsersT "../types/users";
import AuthT "../types/auth";

mixin (
  users          : Map.Map<Common.UserId, UsersT.User>,
  heroStats      : Map.Map<Common.UserId, UsersT.HeroStats>,
  helpSeekerStats : Map.Map<Common.UserId, UsersT.HelpSeekerStats>,
  authGoogleIndex : Map.Map<Text, Common.UserId>,
  authPhoneIndex  : Map.Map<Text, Common.UserId>,
  authEmailIndex  : Map.Map<Text, Common.UserId>,
) {


  // ── Internal helpers ─────────────────────────────────────────────────────

  func generateOtp() : Text {
    let t = Int.abs(Time.now());
    let otp = t % 1_000_000;
    let s = otp.toText();
    let pad = if (s.size() >= 6) { "" }
              else if (s.size() == 5) { "0" }
              else if (s.size() == 4) { "00" }
              else if (s.size() == 3) { "000" }
              else if (s.size() == 2) { "0000" }
              else { "00000" };
    pad # s;
  };

  func userToPublic(user : UsersT.User) : UsersT.UserPublic {
    {
      id                = user.id;
      fullName          = user.fullName;
      email             = user.email;
      role              = user.role;
      country           = user.country;
      city              = user.city;
      phoneNumber       = user.phoneNumber;
      bio               = user.bio;
      preferredLanguage = user.preferredLanguage;
      timezone          = user.timezone;
      avatarRef         = user.avatarRef;
      createdAt         = user.createdAt;
      isActive          = user.isActive;
      kycStatus         = user.kycStatus;
      lastLoginAt       = user.lastLoginAt;
      isPhoneVerified   = user.isPhoneVerified;
      isEmailVerified   = user.isEmailVerified;
      authMethod        = user.authMethod;
    };
  };

  func makeUser(
    userId        : Common.UserId,
    fullName      : Text,
    email         : ?Text,
    phoneNumber   : ?Text,
    authMethod    : UsersT.AuthMethod,
    googleId      : ?Text,
    password      : ?Text,
    emailVerified : Bool,
    phoneVerified : Bool,
  ) : UsersT.User {
    let now = Time.now();
    {
      id                   = userId;
      var fullName          = fullName;
      var email             = email;
      var role              = #HelpSeeker;
      var country           = "";
      var city              = "";
      var phoneNumber       = phoneNumber;
      var bio               = "";
      var preferredLanguage = "en";
      var timezone          = "UTC";
      var avatarRef         = null;
      createdAt             = now;
      var isActive          = true;
      var kycStatus         = #Pending;
      var settings          = null;
      var privacySettings   = null;
      var loginDevices      = [];
      var lastLoginAt       = now;
      var authMethod        = authMethod;
      var googleId          = googleId;
      var passwordHash      = password;
      var phoneOtpCode      = null;
      var phoneOtpExpiry    = null;
      var emailOtpCode      = null;
      var emailOtpExpiry    = null;
      var isPhoneVerified   = phoneVerified;
      var isEmailVerified   = emailVerified;
    };
  };

  func initStats(userId : Common.UserId) {
    heroStats.add(userId, {
      var proudHeartCount = 0;
      var peopleHelped    = 0;
      var casesSupported  = 0;
      var casesCompleted  = 0;
      var achievements    = [] : [UsersT.Achievement];
    });
    helpSeekerStats.add(userId, {
      var requestsSubmitted = 0;
      var requestsApproved  = 0;
      var requestsCompleted = 0;
    });
  };

  // ── Google Auth ─────────────────────────────────────────────────────────

  public shared ({ caller }) func registerWithGoogle(
    googleId : Text,
    fullName : Text,
    email    : Text,
    photoUrl : ?Common.FileRef,
  ) : async { #ok : UsersT.UserPublic; #err : Text } {
    switch (authGoogleIndex.get(googleId)) {
      case (?existingId) {
        switch (users.get(existingId)) {
          case (?user) { return #ok(userToPublic(user)) };
          case null {};
        };
      };
      case null {};
    };
    switch (authEmailIndex.get(email)) {
      case (?existingId) {
        if (existingId != caller) {
          return #err("Email already registered");
        };
      };
      case null {};
    };
    let userId = caller;
    let user   = makeUser(userId, fullName, ?email, null, #google, ?googleId, null, true, false);
    switch (photoUrl) {
      case (?ref) { user.avatarRef := ?ref };
      case null {};
    };
    users.add(userId, user);
    authGoogleIndex.add(googleId, userId);
    authEmailIndex.add(email, userId);
    initStats(userId);
    #ok(userToPublic(user));
  };

  public shared func loginWithGoogle(
    googleId : Text,
  ) : async { #ok : UsersT.UserPublic; #err : Text } {
    switch (authGoogleIndex.get(googleId)) {
      case (?userId) {
        switch (users.get(userId)) {
          case (?user) {
            if (not user.isActive) { return #err("Account suspended") };
            user.lastLoginAt := Time.now();
            #ok(userToPublic(user));
          };
          case null { #err("User record not found") };
        };
      };
      case null { #err("Google account not registered") };
    };
  };

  // ── Phone Auth ───────────────────────────────────────────────────────────

  public shared ({ caller }) func sendPhoneOtp(
    phoneNumber : Text,
  ) : async { #ok : Text; #err : Text } {
    let otpCode = generateOtp();
    let expiry  = Time.now() + 600_000_000_000;
    switch (authPhoneIndex.get(phoneNumber)) {
      case (?userId) {
        switch (users.get(userId)) {
          case (?user) {
            user.phoneOtpCode   := ?otpCode;
            user.phoneOtpExpiry := ?expiry;
          };
          case null {};
        };
      };
      case null {
        let userId = caller;
        let user   = makeUser(userId, "", null, ?phoneNumber, #phone, null, null, false, false);
        user.phoneOtpCode   := ?otpCode;
        user.phoneOtpExpiry := ?expiry;
        users.add(userId, user);
        authPhoneIndex.add(phoneNumber, userId);
        initStats(userId);
      };
    };
    #ok(otpCode);
  };

  public shared func verifyPhoneOtp(
    phoneNumber : Text,
    otpCode     : Text,
  ) : async { #ok : UsersT.UserPublic; #err : Text } {
    switch (authPhoneIndex.get(phoneNumber)) {
      case (?userId) {
        switch (users.get(userId)) {
          case (?user) {
            switch (user.phoneOtpCode) {
              case (?stored) {
                if (stored != otpCode) { return #err("Invalid OTP") };
                switch (user.phoneOtpExpiry) {
                  case (?expiry) {
                    if (Time.now() > expiry) { return #err("OTP expired") };
                  };
                  case null {};
                };
                user.isPhoneVerified := true;
                user.phoneOtpCode    := null;
                user.phoneOtpExpiry  := null;
                user.lastLoginAt     := Time.now();
                #ok(userToPublic(user));
              };
              case null { #err("No OTP pending - call sendPhoneOtp first") };
            };
          };
          case null { #err("User not found") };
        };
      };
      case null { #err("Phone number not registered - call sendPhoneOtp first") };
    };
  };

  // ── Email Auth ───────────────────────────────────────────────────────────

  public shared ({ caller }) func registerWithEmail(
    email    : Text,
    fullName : Text,
    password : Text,
  ) : async { #ok : Text; #err : Text } {
    switch (authEmailIndex.get(email)) {
      case (?existingId) {
        if (existingId != caller) {
          return #err("Email already registered");
        };
      };
      case null {};
    };
    let otpCode = generateOtp();
    let expiry  = Time.now() + 600_000_000_000;
    let userId  = caller;
    let user    = makeUser(userId, fullName, ?email, null, #email, null, ?password, false, false);
    user.emailOtpCode   := ?otpCode;
    user.emailOtpExpiry := ?expiry;
    users.add(userId, user);
    authEmailIndex.add(email, userId);
    initStats(userId);
    #ok(otpCode);
  };

  public shared func verifyEmailOtp(
    email   : Text,
    otpCode : Text,
  ) : async { #ok : UsersT.UserPublic; #err : Text } {
    switch (authEmailIndex.get(email)) {
      case (?userId) {
        switch (users.get(userId)) {
          case (?user) {
            switch (user.emailOtpCode) {
              case (?stored) {
                if (stored != otpCode) { return #err("Invalid OTP") };
                switch (user.emailOtpExpiry) {
                  case (?expiry) {
                    if (Time.now() > expiry) { return #err("OTP expired") };
                  };
                  case null {};
                };
                user.isEmailVerified := true;
                user.emailOtpCode    := null;
                user.emailOtpExpiry  := null;
                #ok(userToPublic(user));
              };
              case null { #err("No OTP pending") };
            };
          };
          case null { #err("User not found") };
        };
      };
      case null { #err("Email not registered") };
    };
  };

  public shared func sendEmailOtp(
    email : Text,
  ) : async { #ok : Text; #err : Text } {
    switch (authEmailIndex.get(email)) {
      case (?userId) {
        switch (users.get(userId)) {
          case (?user) {
            let otpCode = generateOtp();
            let expiry  = Time.now() + 600_000_000_000;
            user.emailOtpCode   := ?otpCode;
            user.emailOtpExpiry := ?expiry;
            #ok(otpCode);
          };
          case null { #err("User record not found") };
        };
      };
      case null { #err("Email not registered") };
    };
  };

  public shared func loginWithEmail(
    email    : Text,
    password : Text,
  ) : async { #ok : UsersT.UserPublic; #err : Text } {
    switch (authEmailIndex.get(email)) {
      case (?userId) {
        switch (users.get(userId)) {
          case (?user) {
            if (not user.isActive) { return #err("Account suspended") };
            if (not user.isEmailVerified) { return #err("Email not verified - check your inbox for the OTP") };
            switch (user.passwordHash) {
              case (?hash) {
                if (hash != password) { return #err("Invalid password") };
                user.lastLoginAt := Time.now();
                #ok(userToPublic(user));
              };
              case null { #err("No password set for this account") };
            };
          };
          case null { #err("User not found") };
        };
      };
      case null { #err("Email not registered") };
    };
  };

  // ── Session Management ───────────────────────────────────────────────────

  public query func getCurrentUser(
    userId : Common.UserId,
  ) : async { #ok : UsersT.UserPublic; #err : Text } {
    switch (users.get(userId)) {
      case (?user) { #ok(userToPublic(user)) };
      case null    { #err("User not found") };
    };
  };

  public shared func updateUserProfileById(
    userId  : Common.UserId,
    updates : AuthT.ProfileUpdate,
  ) : async { #ok : UsersT.UserPublic; #err : Text } {
    switch (users.get(userId)) {
      case (?user) {
        switch (updates.fullName) {
          case (?v) { user.fullName := v };
          case null {};
        };
        switch (updates.country) {
          case (?v) { user.country := v };
          case null {};
        };
        switch (updates.city) {
          case (?v) { user.city := v };
          case null {};
        };
        switch (updates.bio) {
          case (?v) { user.bio := v };
          case null {};
        };
        switch (updates.preferredLanguage) {
          case (?v) { user.preferredLanguage := v };
          case null {};
        };
        switch (updates.timezone) {
          case (?v) { user.timezone := v };
          case null {};
        };
        #ok(userToPublic(user));
      };
      case null { #err("User not found") };
    };
  };

  public shared func logoutUser(
    userId : Common.UserId,
  ) : async { #ok : (); #err : Text } {
    ignore userId;
    #ok(());
  };
};

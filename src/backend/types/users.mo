import Common "common";

module {
  /// Achievement badge enum
  public type Achievement = {
    #FirstSupport;
    #TenPeopleHelped;
    #FiftyPeopleHelped;
    #EducationHero;
    #MedicalHero;
    #CommunityHero;
    #TrustedHero;
  };

  /// KYC verification status — #UnderReview removed; use #Pending for submitted but not yet decided
  public type KycStatus = {
    #Pending;
    #Approved;
    #Rejected;
  };

  /// Active session record for real session tracking
  public type ActiveSession = {
    id          : Text;
    deviceName  : Text;
    os          : Text;
    browser     : Text;
    ipAddress   : Text;
    lastAccess  : Int;
    createdAt   : Int;
    isCurrent   : Bool;
  };

  /// Authentication method variants
  public type AuthMethod = {
    #google;
    #phone;
    #email;
  };

  /// User settings (preferences)
  public type UserSettings = {
    var language             : Text;
    var theme                : Text;     // 'system' | 'light' | 'dark'
    var currencyDisplay      : Text;     // ISO 4217 code, default 'USD'
    var timezone             : Text;
    var emailNotifications   : Bool;
    var inAppNotifications   : Bool;
    var weeklyDigest         : Bool;
    var highContrast         : Bool;
    var largerText           : Bool;
    var reducedAnimations    : Bool;
  };

  /// Shared user settings
  public type UserSettingsPublic = {
    language             : Text;
    theme                : Text;
    currencyDisplay      : Text;
    timezone             : Text;
    emailNotifications   : Bool;
    inAppNotifications   : Bool;
    weeklyDigest         : Bool;
    highContrast         : Bool;
    largerText           : Bool;
    reducedAnimations    : Bool;
  };

  /// Privacy settings
  public type PrivacySettings = {
    var profileVisibility          : Text;  // 'public' | 'private' | 'friends'
    var countryVisibility          : Bool;
    var activityVisibility         : Bool;
    var emailNotificationsEnabled  : Bool;
    var inAppNotificationsEnabled  : Bool;
    var caseUpdatesEnabled         : Bool;
  };

  /// Shared privacy settings
  public type PrivacySettingsPublic = {
    profileVisibility          : Text;
    countryVisibility          : Bool;
    activityVisibility         : Bool;
    emailNotificationsEnabled  : Bool;
    inAppNotificationsEnabled  : Bool;
    caseUpdatesEnabled         : Bool;
  };

  /// Login device record
  public type LoginDevice = {
    id         : Text;
    deviceName : Text;
    os         : Text;
    lastAccess : Int;
    ipAddress  : Text;
  };

  /// Core user record (stored in actor state)
  public type User = {
    id                  : Common.UserId;
    var fullName         : Text;
    var email            : ?Text;
    var role             : Common.Role;
    var country          : Common.Country;
    var city             : Text;
    var phoneNumber      : ?Text;
    var bio              : Text;
    var preferredLanguage : Text;
    var timezone         : Text;
    var avatarRef        : ?Common.FileRef;
    createdAt            : Common.Timestamp;
    var isActive         : Bool;
    var kycStatus        : KycStatus;
    var settings         : ?UserSettings;
    var privacySettings  : ?PrivacySettings;
    var loginDevices     : [LoginDevice];
    var lastLoginAt      : Int;
    // Auth fields
    var authMethod       : AuthMethod;
    var googleId         : ?Text;
    var passwordHash     : ?Text;
    var phoneOtpCode     : ?Text;
    var phoneOtpExpiry   : ?Int;
    var emailOtpCode     : ?Text;
    var emailOtpExpiry   : ?Int;
    var isPhoneVerified  : Bool;
    var isEmailVerified  : Bool;
  };

  /// Shared (API-boundary) user record — no var fields
  public type UserPublic = {
    id               : Common.UserId;
    fullName         : Text;
    email            : ?Text;
    role             : Common.Role;
    country          : Common.Country;
    city             : Text;
    phoneNumber      : ?Text;
    bio              : Text;
    preferredLanguage : Text;
    timezone         : Text;
    avatarRef        : ?Common.FileRef;
    createdAt        : Common.Timestamp;
    isActive         : Bool;
    kycStatus        : KycStatus;
    lastLoginAt      : Int;
    isPhoneVerified  : Bool;
    isEmailVerified  : Bool;
    authMethod       : AuthMethod;
  };

  /// Hero profile stats (stored per Hero principal)
  public type HeroStats = {
    var proudHeartCount  : Nat;
    var peopleHelped     : Nat;
    var casesSupported   : Nat;
    var casesCompleted   : Nat;
    var achievements     : [Achievement];  // append-only in practice
  };

  /// Shared Hero profile stats
  public type HeroStatsPublic = {
    proudHeartCount  : Nat;
    peopleHelped     : Nat;
    casesSupported   : Nat;
    casesCompleted   : Nat;
    achievements     : [Achievement];
  };

  /// Help Seeker profile stats (stored per HelpSeeker principal)
  public type HelpSeekerStats = {
    var requestsSubmitted : Nat;
    var requestsApproved  : Nat;
    var requestsCompleted : Nat;
  };

  /// Shared Help Seeker profile stats
  public type HelpSeekerStatsPublic = {
    requestsSubmitted : Nat;
    requestsApproved  : Nat;
    requestsCompleted : Nat;
  };

  /// Proud Heart record — one per completed case, irreversible
  public type ProudHeart = {
    caseId          : Nat;
    fromHelpSeeker  : Common.UserId;
    toHero          : Common.UserId;
    awardedAt       : Common.Timestamp;
  };
};

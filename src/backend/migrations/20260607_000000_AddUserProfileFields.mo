import Map "mo:core/Map";
import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  // ── Inlined types (no project imports allowed in migrations) ────────────

  type UserId    = Principal;
  type Timestamp = Int;
  type Country   = Text;
  type City      = Text;
  type USDCents  = Nat;

  type Role         = { #Hero; #HelpSeeker; #Admin };
  type FileRef      = { storageId : Text; fileName : Text; mimeType : Text };
  type KycStatus    = { #Pending; #UnderReview; #Approved; #Rejected };

  type Achievement = {
    #FirstSupport; #TenPeopleHelped; #FiftyPeopleHelped;
    #EducationHero; #MedicalHero; #CommunityHero; #TrustedHero;
  };

  type HeroStats = {
    var proudHeartCount : Nat;
    var peopleHelped    : Nat;
    var casesSupported  : Nat;
    var casesCompleted  : Nat;
    var achievements    : [Achievement];
  };

  type HelpSeekerStats = {
    var requestsSubmitted : Nat;
    var requestsApproved  : Nat;
    var requestsCompleted : Nat;
  };

  type ProudHeart = {
    caseId         : Nat;
    fromHelpSeeker : UserId;
    toHero         : UserId;
    awardedAt      : Timestamp;
  };

  type Category = {
    #Education; #SchoolFees; #UniversityFees; #Books; #Uniform;
    #Medical; #Surgery; #Medicines; #Utilities; #Housing; #Food;
    #Employment; #Transportation; #DisabilitySupport; #Orphans;
    #Widows; #DebtRelief; #EmergencyNeeds; #Other;
  };

  type VerificationStatus = { #Unverified; #DocumentsSubmitted; #InstitutionVerified };

  type Case = {
    id                     : Nat;
    createdBy              : UserId;
    var title              : Text;
    var description        : Text;
    category               : Category;
    country                : Country;
    city                   : City;
    var amountNeeded       : USDCents;
    deadline               : Timestamp;
    var isPublic           : Bool;
    var verificationStatus : VerificationStatus;
    var documents          : [FileRef];
    createdAt              : Timestamp;
    var adminNote          : ?Text;
  };

  type CaseUnlock = { caseId : Nat; heroId : UserId; unlockedAt : Timestamp };

  type ReviewStatus = { #Submitted; #UnderReview; #Approved; #Completed; #Rejected };

  type SupportProof = {
    id                  : Nat;
    caseId              : Nat;
    heroId              : UserId;
    var files           : [FileRef];
    var referenceNumber : ?Text;
    var status          : ReviewStatus;
    var adminNote       : ?Text;
    createdAt           : Timestamp;
  };

  type FeeType       = { #ListingFee; #UnlockFee };
  type PaymentStatus = { #Pending; #Confirmed; #Failed };

  type Payment = {
    id              : Nat;
    paidBy          : UserId;
    feeType         : FeeType;
    caseId          : ?Nat;
    amountCents     : USDCents;
    stripeSessionId : Text;
    var status      : PaymentStatus;
    createdAt       : Timestamp;
  };

  type WalletEntry = {
    id          : Nat;
    userId      : UserId;
    feeType     : FeeType;
    amountCents : USDCents;
    paymentId   : Nat;
    createdAt   : Timestamp;
  };

  type StripeConfiguration = { secretKey : Text; allowedCountries : [Text] };
  type StripeConfig = { var config : ?StripeConfiguration };
  type CaseState    = { var nextCaseId : Nat; var nextProofId : Nat };
  type PaymentState = { var nextPaymentId : Nat; var nextWalletId : Nat };

  type NotificationType = {
    #CaseApproved; #CaseRejected; #VerificationUpdate;
    #ProudHeartReceived; #UnlockPurchased; #SupportSubmitted; #NewMessage;
  };

  type Notification = {
    id            : Nat;
    userId        : UserId;
    notifType     : NotificationType;
    title         : Text;
    message       : Text;
    relatedCaseId : ?Nat;
    relatedUserId : ?UserId;
    var isRead    : Bool;
    createdAt     : Timestamp;
  };

  type Message = {
    id             : Nat;
    conversationId : Nat;
    senderId       : UserId;
    receiverId     : UserId;
    caseId         : ?Nat;
    content        : Text;
    var isRead     : Bool;
    createdAt      : Timestamp;
  };

  type Conversation = {
    id                     : Nat;
    participantIds         : [UserId];
    caseId                 : ?Nat;
    var lastMessageContent : ?Text;
    var lastMessageAt      : ?Timestamp;
    var unreadCount        : Nat;
  };

  type NotifState = { var nextNotifId : Nat };
  type MsgState   = { var nextMessageId : Nat; var nextConversationId : Nat };

  type CreditTxnKind = {
    #Purchase; #SpentOnCase; #SpentOnUnlock; #AdminGrant;
  };

  type CreditTransaction = {
    id        : Nat;
    userId    : UserId;
    kind      : CreditTxnKind;
    amount    : Int;
    note      : ?Text;
    createdAt : Timestamp;
  };

  type CreditState = { var nextCreditTxnId : Nat };

  // OldUser — matches NewActor.User from 20260606_120000_AddSupportCredits.mo
  // (kycStatus added, but no profile extension fields yet)
  type OldUser = {
    id           : UserId;
    var fullName  : Text;
    var email     : Text;
    var role      : Role;
    var country   : Country;
    var avatarRef : ?FileRef;
    createdAt     : Timestamp;
    var isActive  : Bool;
    var kycStatus : KycStatus;
  };

  // NewUser — adds city, phoneNumber, bio, preferredLanguage, timezone,
  // settings, privacySettings, loginDevices, lastLoginAt
  type UserSettings = {
    var language             : Text;
    var theme                : Text;
    var currencyDisplay      : Text;
    var timezone             : Text;
    var emailNotifications   : Bool;
    var inAppNotifications   : Bool;
    var weeklyDigest         : Bool;
    var highContrast         : Bool;
    var largerText           : Bool;
    var reducedAnimations    : Bool;
  };

  type PrivacySettings = {
    var profileVisibility          : Text;
    var countryVisibility          : Bool;
    var activityVisibility         : Bool;
    var emailNotificationsEnabled  : Bool;
    var inAppNotificationsEnabled  : Bool;
    var caseUpdatesEnabled         : Bool;
  };

  type LoginDevice = {
    id         : Text;
    deviceName : Text;
    os         : Text;
    lastAccess : Int;
    ipAddress  : Text;
  };

  type NewUser = {
    id                    : UserId;
    var fullName           : Text;
    var email              : Text;
    var role               : Role;
    var country            : Country;
    var city               : Text;
    var phoneNumber        : Text;
    var bio                : Text;
    var preferredLanguage  : Text;
    var timezone           : Text;
    var avatarRef          : ?FileRef;
    createdAt              : Timestamp;
    var isActive           : Bool;
    var kycStatus          : KycStatus;
    var settings           : ?UserSettings;
    var privacySettings    : ?PrivacySettings;
    var loginDevices       : [LoginDevice];
    var lastLoginAt        : Int;
  };

  // ── OldActor — matches NewActor from 20260606_120000_AddSupportCredits.mo ──
  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    users              : Map.Map<UserId, OldUser>;
    heroStats          : Map.Map<UserId, HeroStats>;
    helpSeekerStats    : Map.Map<UserId, HelpSeekerStats>;
    proudHearts        : List.List<ProudHeart>;
    cases              : Map.Map<Nat, Case>;
    unlocks            : Map.Map<Text, CaseUnlock>;
    proofs             : List.List<SupportProof>;
    payments           : List.List<Payment>;
    wallets            : List.List<WalletEntry>;
    caseState          : CaseState;
    paymentState       : PaymentState;
    stripeConfig       : StripeConfig;
    notifications      : List.List<Notification>;
    messages           : List.List<Message>;
    conversations      : List.List<Conversation>;
    notifState         : NotifState;
    msgState           : MsgState;
    creditTransactions : List.List<CreditTransaction>;
    creditState        : CreditState;
  };

  // ── NewActor — same fields + expanded User type ────────────────────────
  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    users              : Map.Map<UserId, NewUser>;
    heroStats          : Map.Map<UserId, HeroStats>;
    helpSeekerStats    : Map.Map<UserId, HelpSeekerStats>;
    proudHearts        : List.List<ProudHeart>;
    cases              : Map.Map<Nat, Case>;
    unlocks            : Map.Map<Text, CaseUnlock>;
    proofs             : List.List<SupportProof>;
    payments           : List.List<Payment>;
    wallets            : List.List<WalletEntry>;
    caseState          : CaseState;
    paymentState       : PaymentState;
    stripeConfig       : StripeConfig;
    notifications      : List.List<Notification>;
    messages           : List.List<Message>;
    conversations      : List.List<Conversation>;
    notifState         : NotifState;
    msgState           : MsgState;
    creditTransactions : List.List<CreditTransaction>;
    creditState        : CreditState;
  };

  public func migration(old : OldActor) : NewActor {
    // Migrate users: add new profile fields with sensible defaults
    let newUsers = Map.empty<UserId, NewUser>();
    for ((id, u) in old.users.entries()) {
      newUsers.add(id, {
        id                    = u.id;
        var fullName           = u.fullName;
        var email              = u.email;
        var role               = u.role;
        var country            = u.country;
        var city               = "";
        var phoneNumber        = "";
        var bio                = "";
        var preferredLanguage  = "";
        var timezone           = "";
        var avatarRef          = u.avatarRef;
        createdAt              = u.createdAt;
        var isActive           = u.isActive;
        var kycStatus          = u.kycStatus;
        var settings           = null : ?UserSettings;
        var privacySettings    = null : ?PrivacySettings;
        var loginDevices       = [] : [LoginDevice];
        var lastLoginAt        = 0 : Int;
      });
    };
    {
      accessControlState = old.accessControlState;
      users              = newUsers;
      heroStats          = old.heroStats;
      helpSeekerStats    = old.helpSeekerStats;
      proudHearts        = old.proudHearts;
      cases              = old.cases;
      unlocks            = old.unlocks;
      proofs             = old.proofs;
      payments           = old.payments;
      wallets            = old.wallets;
      caseState          = old.caseState;
      paymentState       = old.paymentState;
      stripeConfig       = old.stripeConfig;
      notifications      = old.notifications;
      messages           = old.messages;
      conversations      = old.conversations;
      notifState         = old.notifState;
      msgState           = old.msgState;
      creditTransactions = old.creditTransactions;
      creditState        = old.creditState;
    };
  };
};

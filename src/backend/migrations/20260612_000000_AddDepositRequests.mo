import Map "mo:core/Map";
import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";

module {

  // ── Inlined types (no project imports allowed) ────────────────────────────

  type UserId    = Text;
  type Timestamp = Int;
  type Country   = Text;
  type City      = Text;
  type USDCents  = Nat;

  type Role = { #Hero; #HelpSeeker; #Admin; #SuperAdmin };

  type AuthMethod = { #google; #phone; #email };

  type FileRef = { storageId : Text; fileName : Text; mimeType : Text };

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

  type KycStatus = { #Pending; #Approved; #Rejected };

  type KycSubmission = {
    documentType    : { #nationalId; #passport };
    documentFileUrl : Text;
    liveVideoUrl    : Text;
    status          : { #pending; #approved; #rejected };
    submittedAt     : Int;
    userId          : Text;
  };

  type ActiveSession = {
    id          : Text;
    deviceName  : Text;
    os          : Text;
    browser     : Text;
    ipAddress   : Text;
    lastAccess  : Int;
    createdAt   : Int;
    isCurrent   : Bool;
  };

  type User = {
    id                    : UserId;
    var fullName           : Text;
    var email              : ?Text;
    var role               : Role;
    var country            : Country;
    var city               : Text;
    var phoneNumber        : ?Text;
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
    var authMethod         : AuthMethod;
    var googleId           : ?Text;
    var passwordHash       : ?Text;
    var phoneOtpCode       : ?Text;
    var phoneOtpExpiry     : ?Int;
    var emailOtpCode       : ?Text;
    var emailOtpExpiry     : ?Int;
    var isPhoneVerified    : Bool;
    var isEmailVerified    : Bool;
  };

  type ProudHeart = {
    caseId         : Nat;
    fromHelpSeeker : UserId;
    toHero         : UserId;
    awardedAt      : Timestamp;
  };

  type VerificationStatus = {
    #Unverified; #DocumentsSubmitted; #InstitutionVerified;
  };

  type ReviewStatus = {
    #Submitted; #UnderReview; #Approved; #Completed; #Rejected;
  };

  type Category = {
    #Education; #SchoolFees; #UniversityFees; #Books; #Uniform;
    #Medical; #Surgery; #Medicines; #Utilities; #Housing; #Food;
    #Employment; #Transportation; #DisabilitySupport; #Orphans;
    #Widows; #DebtRelief; #EmergencyNeeds; #Other;
  };

  type FeeType = { #ListingFee; #UnlockFee };

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

  type CaseUnlock = {
    caseId     : Nat;
    heroId     : UserId;
    unlockedAt : Timestamp;
  };

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

  type NotificationType = {
    #CaseApproved;
    #CaseRejected;
    #CaseCompleted;
    #VerificationUpdate;
    #ProudHeartReceived;
    #UnlockPurchased;
    #SupportSubmitted;
    #NewMessage;
    #CreditsAdded;
    #KycApproved;
    #KycRejected;
    #KycPending;
    #SupportReceived;
    #SystemAnnouncement;
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

  type NotifState = { var nextNotifId : Nat };

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

  type MsgState = { var nextMessageId : Nat; var nextConversationId : Nat };

  type CaseState    = { var nextCaseId : Nat; var nextProofId : Nat };
  type PaymentState = { var nextPaymentId : Nat; var nextWalletId : Nat };
  type CreditState  = { var nextCreditTxnId : Nat };

  type StripeConfiguration = { secretKey : Text; allowedCountries : [Text] };
  type StripeConfig         = { var config : ?StripeConfiguration };

  // ── New types for this migration ─────────────────────────────────────────

  type DepositMethod = {
    #EasyPaisa;
    #JazzCash;
    #BankTransfer;
    #USDT;
    #ICP;
  };

  type DepositStatus = {
    #PendingApproval;
    #Approved;
    #Rejected;
  };

  type DepositRequest = {
    id            : Text;
    userId        : Text;
    method        : DepositMethod;
    tid           : Text;
    proofImageUrl : Text;
    amountSent    : Float;
    currency      : Text;
    createdAt     : Int;
    updatedAt     : Int;
    status        : DepositStatus;
    adminNotes    : Text;
  };

  type DepositState = { var nextDepositId : Nat };

  // ── OldActor: exactly NewActor from 20260611_000000_AddActiveSessionsAndUpdateKyc.mo ──
  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    users              : Map.Map<UserId, User>;
    heroStats          : Map.Map<UserId, HeroStats>;
    helpSeekerStats    : Map.Map<UserId, HelpSeekerStats>;
    proudHearts        : List.List<ProudHeart>;
    cases              : Map.Map<Nat, Case>;
    unlocks            : Map.Map<Text, CaseUnlock>;
    proofs             : List.List<SupportProof>;
    payments           : List.List<Payment>;
    wallets            : List.List<WalletEntry>;
    creditTransactions : List.List<CreditTransaction>;
    creditState        : CreditState;
    notifications      : List.List<Notification>;
    notifState         : NotifState;
    messages           : List.List<Message>;
    conversations      : List.List<Conversation>;
    msgState           : MsgState;
    nextUserId         : { var id : Nat };
    authGoogleIndex    : Map.Map<Text, UserId>;
    authPhoneIndex     : Map.Map<Text, UserId>;
    authEmailIndex     : Map.Map<Text, UserId>;
    kycSubmissions     : Map.Map<UserId, KycSubmission>;
    activeSessions     : Map.Map<UserId, [ActiveSession]>;
    caseState          : CaseState;
    paymentState       : PaymentState;
    stripeConfig       : StripeConfig;
  };

  // ── NewActor: adds depositRequests and depositState ───────────────────────
  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    users              : Map.Map<UserId, User>;
    heroStats          : Map.Map<UserId, HeroStats>;
    helpSeekerStats    : Map.Map<UserId, HelpSeekerStats>;
    proudHearts        : List.List<ProudHeart>;
    cases              : Map.Map<Nat, Case>;
    unlocks            : Map.Map<Text, CaseUnlock>;
    proofs             : List.List<SupportProof>;
    payments           : List.List<Payment>;
    wallets            : List.List<WalletEntry>;
    creditTransactions : List.List<CreditTransaction>;
    creditState        : CreditState;
    notifications      : List.List<Notification>;
    notifState         : NotifState;
    messages           : List.List<Message>;
    conversations      : List.List<Conversation>;
    msgState           : MsgState;
    nextUserId         : { var id : Nat };
    authGoogleIndex    : Map.Map<Text, UserId>;
    authPhoneIndex     : Map.Map<Text, UserId>;
    authEmailIndex     : Map.Map<Text, UserId>;
    kycSubmissions     : Map.Map<UserId, KycSubmission>;
    activeSessions     : Map.Map<UserId, [ActiveSession]>;
    caseState          : CaseState;
    paymentState       : PaymentState;
    stripeConfig       : StripeConfig;
    depositRequests    : Map.Map<Text, DepositRequest>;
    depositState       : DepositState;
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      users              = old.users;
      heroStats          = old.heroStats;
      helpSeekerStats    = old.helpSeekerStats;
      proudHearts        = old.proudHearts;
      cases              = old.cases;
      unlocks            = old.unlocks;
      proofs             = old.proofs;
      payments           = old.payments;
      wallets            = old.wallets;
      creditTransactions = old.creditTransactions;
      creditState        = old.creditState;
      notifications      = old.notifications;
      notifState         = old.notifState;
      messages           = old.messages;
      conversations      = old.conversations;
      msgState           = old.msgState;
      nextUserId         = old.nextUserId;
      authGoogleIndex    = old.authGoogleIndex;
      authPhoneIndex     = old.authPhoneIndex;
      authEmailIndex     = old.authEmailIndex;
      kycSubmissions     = old.kycSubmissions;
      activeSessions     = old.activeSessions;
      caseState          = old.caseState;
      paymentState       = old.paymentState;
      stripeConfig       = old.stripeConfig;
      depositRequests    = Map.empty<Text, DepositRequest>();
      depositState       = { var nextDepositId = 0 };
    };
  };
};

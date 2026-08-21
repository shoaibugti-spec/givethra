import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  // ── Inlined types (no project imports allowed in migrations) ───────────────

  type UserId    = Principal;
  type Timestamp = Int;
  type Country   = Text;
  type City      = Text;
  type USDCents  = Nat;

  type Role         = { #Hero; #HelpSeeker; #Admin };
  type ReviewStatus = { #Submitted; #UnderReview; #Approved; #Completed; #Rejected };
  type FileRef      = { storageId : Text; fileName : Text; mimeType : Text };

  type Achievement = {
    #FirstSupport; #TenPeopleHelped; #FiftyPeopleHelped;
    #EducationHero; #MedicalHero; #CommunityHero; #TrustedHero;
  };

  type User = {
    id           : UserId;
    var fullName  : Text;
    var email     : Text;
    var role      : Role;
    var country   : Country;
    var avatarRef : ?FileRef;
    createdAt     : Timestamp;
    var isActive  : Bool;
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

  type FeeType      = { #ListingFee; #UnlockFee };
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

  // ── New types for notifications and messages ───────────────────────────────

  type NotificationType = {
    #CaseApproved;
    #CaseRejected;
    #VerificationUpdate;
    #ProudHeartReceived;
    #UnlockPurchased;
    #SupportSubmitted;
    #NewMessage;
  };

  type Notification = {
    id              : Nat;
    userId          : UserId;
    notifType       : NotificationType;
    title           : Text;
    message         : Text;
    relatedCaseId   : ?Nat;
    relatedUserId   : ?UserId;
    var isRead      : Bool;
    createdAt       : Timestamp;
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
    id                      : Nat;
    participantIds          : [UserId];
    caseId                  : ?Nat;
    var lastMessageContent  : ?Text;
    var lastMessageAt       : ?Timestamp;
    var unreadCount         : Nat;
  };

  type NotifState = { var nextNotifId : Nat };
  type MsgState   = { var nextMessageId : Nat; var nextConversationId : Nat };

  // ── Migration ──────────────────────────────────────────────────────────────

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
    caseState          : CaseState;
    paymentState       : PaymentState;
    stripeConfig       : StripeConfig;
  };

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
    caseState          : CaseState;
    paymentState       : PaymentState;
    stripeConfig       : StripeConfig;
    // new fields
    notifications      : List.List<Notification>;
    messages           : List.List<Message>;
    conversations      : List.List<Conversation>;
    notifState         : NotifState;
    msgState           : MsgState;
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
      caseState          = old.caseState;
      paymentState       = old.paymentState;
      stripeConfig       = old.stripeConfig;
      // initialize new state
      notifications      = List.empty<Notification>();
      messages           = List.empty<Message>();
      conversations      = List.empty<Conversation>();
      notifState         = { var nextNotifId = 0 };
      msgState           = { var nextMessageId = 0; var nextConversationId = 0 };
    };
  };
};

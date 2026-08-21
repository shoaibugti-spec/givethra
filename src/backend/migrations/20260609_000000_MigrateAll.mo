import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import AccessControl "mo:caffeineai-authorization/access-control";
import Principal "mo:core/Principal";

module {
  // ── All types inlined — no project imports allowed in migrations ──────────

  // ── Shared primitives ────────────────────────────────────────────────────
  type Timestamp          = Int;
  type Country            = Text;
  type City               = Text;
  type USDCents           = Nat;

  // ── Old types (Principal-based) ───────────────────────────────────────────
  type OldUserId = Principal;

  type OldRole = { #Hero; #HelpSeeker; #Admin };

  type FileRef = { storageId : Text; fileName : Text; mimeType : Text };

  type KycStatus = { #Pending; #UnderReview; #Approved; #Rejected };

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

  type OldProudHeart = {
    caseId         : Nat;
    fromHelpSeeker : OldUserId;
    toHero         : OldUserId;
    awardedAt      : Timestamp;
  };

  type Category = {
    #Education; #SchoolFees; #UniversityFees; #Books; #Uniform;
    #Medical; #Surgery; #Medicines; #Utilities; #Housing; #Food;
    #Employment; #Transportation; #DisabilitySupport; #Orphans;
    #Widows; #DebtRelief; #EmergencyNeeds; #Other;
  };

  type VerificationStatus = {
    #Unverified; #DocumentsSubmitted; #InstitutionVerified;
  };

  type OldCase = {
    id                     : Nat;
    createdBy              : OldUserId;
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

  type OldCaseUnlock = {
    caseId    : Nat;
    heroId    : OldUserId;
    unlockedAt : Timestamp;
  };

  type ReviewStatus = {
    #Submitted; #UnderReview; #Approved; #Completed; #Rejected;
  };

  type OldSupportProof = {
    id                  : Nat;
    caseId              : Nat;
    heroId              : OldUserId;
    var files           : [FileRef];
    var referenceNumber : ?Text;
    var status          : ReviewStatus;
    var adminNote       : ?Text;
    createdAt           : Timestamp;
  };

  type FeeType = { #ListingFee; #UnlockFee };
  type PaymentStatus = { #Pending; #Confirmed; #Failed };

  type OldPayment = {
    id              : Nat;
    paidBy          : OldUserId;
    feeType         : FeeType;
    caseId          : ?Nat;
    amountCents     : USDCents;
    stripeSessionId : Text;
    var status      : PaymentStatus;
    createdAt       : Timestamp;
  };

  type OldWalletEntry = {
    id          : Nat;
    userId      : OldUserId;
    feeType     : FeeType;
    amountCents : USDCents;
    paymentId   : Nat;
    createdAt   : Timestamp;
  };

  type StripeConfiguration = { secretKey : Text; allowedCountries : [Text] };
  type StripeConfig         = { var config : ?StripeConfiguration };
  type CaseState            = { var nextCaseId : Nat; var nextProofId : Nat };
  type PaymentState         = { var nextPaymentId : Nat; var nextWalletId : Nat };

  // 7 variants — matches the .old/ snapshot (20260607 NewActor exactly)
  type OldNotificationType = {
    #CaseApproved;
    #CaseRejected;
    #VerificationUpdate;
    #ProudHeartReceived;
    #UnlockPurchased;
    #SupportSubmitted;
    #NewMessage;
  };

  type OldNotification = {
    id            : Nat;
    userId        : OldUserId;
    notifType     : OldNotificationType;
    title         : Text;
    message       : Text;
    relatedCaseId : ?Nat;
    relatedUserId : ?OldUserId;
    var isRead    : Bool;
    createdAt     : Timestamp;
  };

  type OldMessage = {
    id             : Nat;
    conversationId : Nat;
    senderId       : OldUserId;
    receiverId     : OldUserId;
    caseId         : ?Nat;
    content        : Text;
    var isRead     : Bool;
    createdAt      : Timestamp;
  };

  type OldConversation = {
    id                     : Nat;
    participantIds         : [OldUserId];
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

  type OldCreditTransaction = {
    id        : Nat;
    userId    : OldUserId;
    kind      : CreditTxnKind;
    amount    : Int;
    note      : ?Text;
    createdAt : Timestamp;
  };

  type CreditState = { var nextCreditTxnId : Nat };

  // Old User — from 20260607 NewActor (has settings/privacy/devices fields)
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

  type OldUser = {
    id                    : OldUserId;
    var fullName           : Text;
    var email              : Text;
    var role               : OldRole;
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

  // ── New types (Text-based) ────────────────────────────────────────────────
  type NewUserId = Text;

  type NewRole = { #Hero; #HelpSeeker; #Admin; #SuperAdmin };

  type AuthMethod = { #google; #phone; #email };

  type NewUser = {
    id                    : NewUserId;
    var fullName           : Text;
    var email              : ?Text;
    var role               : NewRole;
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

  type NewProudHeart = {
    caseId         : Nat;
    fromHelpSeeker : NewUserId;
    toHero         : NewUserId;
    awardedAt      : Timestamp;
  };

  type NewCase = {
    id                     : Nat;
    createdBy              : NewUserId;
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

  type NewCaseUnlock = {
    caseId    : Nat;
    heroId    : NewUserId;
    unlockedAt : Timestamp;
  };

  type NewSupportProof = {
    id                  : Nat;
    caseId              : Nat;
    heroId              : NewUserId;
    var files           : [FileRef];
    var referenceNumber : ?Text;
    var status          : ReviewStatus;
    var adminNote       : ?Text;
    createdAt           : Timestamp;
  };

  type NewPayment = {
    id              : Nat;
    paidBy          : NewUserId;
    feeType         : FeeType;
    caseId          : ?Nat;
    amountCents     : USDCents;
    stripeSessionId : Text;
    var status      : PaymentStatus;
    createdAt       : Timestamp;
  };

  type NewWalletEntry = {
    id          : Nat;
    userId      : NewUserId;
    feeType     : FeeType;
    amountCents : USDCents;
    paymentId   : Nat;
    createdAt   : Timestamp;
  };

  // 14 variants — full set needed by types/notifications.mo
  type NewNotificationType = {
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

  type NewNotification = {
    id            : Nat;
    userId        : NewUserId;
    notifType     : NewNotificationType;
    title         : Text;
    message       : Text;
    relatedCaseId : ?Nat;
    relatedUserId : ?NewUserId;
    var isRead    : Bool;
    createdAt     : Timestamp;
  };

  type NewMessage = {
    id             : Nat;
    conversationId : Nat;
    senderId       : NewUserId;
    receiverId     : NewUserId;
    caseId         : ?Nat;
    content        : Text;
    var isRead     : Bool;
    createdAt      : Timestamp;
  };

  type NewConversation = {
    id                     : Nat;
    participantIds         : [NewUserId];
    caseId                 : ?Nat;
    var lastMessageContent : ?Text;
    var lastMessageAt      : ?Timestamp;
    var unreadCount        : Nat;
  };

  type NewCreditTransaction = {
    id        : Nat;
    userId    : NewUserId;
    kind      : CreditTxnKind;
    amount    : Int;
    note      : ?Text;
    createdAt : Timestamp;
  };

  // ── OldActor — exactly matches 20260607_000000_AddUserProfileFields NewActor ──
  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    users              : Map.Map<OldUserId, OldUser>;
    heroStats          : Map.Map<OldUserId, HeroStats>;
    helpSeekerStats    : Map.Map<OldUserId, HelpSeekerStats>;
    proudHearts        : List.List<OldProudHeart>;
    cases              : Map.Map<Nat, OldCase>;
    unlocks            : Map.Map<Text, OldCaseUnlock>;
    proofs             : List.List<OldSupportProof>;
    payments           : List.List<OldPayment>;
    wallets            : List.List<OldWalletEntry>;
    caseState          : CaseState;
    paymentState       : PaymentState;
    stripeConfig       : StripeConfig;
    notifications      : List.List<OldNotification>;
    messages           : List.List<OldMessage>;
    conversations      : List.List<OldConversation>;
    notifState         : NotifState;
    msgState           : MsgState;
    creditTransactions : List.List<OldCreditTransaction>;
    creditState        : CreditState;
  };

  // ── NewActor — exactly matches current main.mo stable fields ─────────────
  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    users              : Map.Map<NewUserId, NewUser>;
    heroStats          : Map.Map<NewUserId, HeroStats>;
    helpSeekerStats    : Map.Map<NewUserId, HelpSeekerStats>;
    proudHearts        : List.List<NewProudHeart>;
    cases              : Map.Map<Nat, NewCase>;
    unlocks            : Map.Map<Text, NewCaseUnlock>;
    proofs             : List.List<NewSupportProof>;
    payments           : List.List<NewPayment>;
    wallets            : List.List<NewWalletEntry>;
    creditTransactions : List.List<NewCreditTransaction>;
    creditState        : CreditState;
    notifications      : List.List<NewNotification>;
    notifState         : NotifState;
    messages           : List.List<NewMessage>;
    conversations      : List.List<NewConversation>;
    msgState           : MsgState;
    nextUserId         : { var id : Nat };
    authGoogleIndex    : Map.Map<Text, NewUserId>;
    authPhoneIndex     : Map.Map<Text, NewUserId>;
    authEmailIndex     : Map.Map<Text, NewUserId>;
    caseState          : CaseState;
    paymentState       : PaymentState;
    stripeConfig       : StripeConfig;
  };

  // ── Helper: convert old 7-variant NotificationType to new 14-variant ──────
  func migrateNotifType(old : OldNotificationType) : NewNotificationType {
    switch (old) {
      case (#CaseApproved)      #CaseApproved;
      case (#CaseRejected)      #CaseRejected;
      case (#VerificationUpdate) #VerificationUpdate;
      case (#ProudHeartReceived) #ProudHeartReceived;
      case (#UnlockPurchased)   #UnlockPurchased;
      case (#SupportSubmitted)  #SupportSubmitted;
      case (#NewMessage)        #NewMessage;
    };
  };

  // ── Helper: convert old Role to new Role ──────────────────────────────────
  func migrateRole(old : OldRole) : NewRole {
    switch (old) {
      case (#Hero)       #Hero;
      case (#HelpSeeker) #HelpSeeker;
      case (#Admin)      #Admin;
    };
  };

  public func migration(old : OldActor) : NewActor {
    // ── Migrate users: Principal ID → Text ID, add auth fields ──────────────
    let newUsers = Map.empty<NewUserId, NewUser>();
    for ((pid, u) in old.users.entries()) {
      let textId = pid.toText();
      newUsers.add(textId, {
        id                    = textId;
        var fullName           = u.fullName;
        var email              = ?(u.email);
        var role               = migrateRole(u.role);
        var country            = u.country;
        var city               = u.city;
        var phoneNumber        = null : ?Text;
        var bio                = u.bio;
        var preferredLanguage  = u.preferredLanguage;
        var timezone           = u.timezone;
        var avatarRef          = u.avatarRef;
        createdAt              = u.createdAt;
        var isActive           = u.isActive;
        var kycStatus          = u.kycStatus;
        var settings           = u.settings;
        var privacySettings    = u.privacySettings;
        var loginDevices       = u.loginDevices;
        var lastLoginAt        = u.lastLoginAt;
        var authMethod         = (#email : AuthMethod);
        var googleId           = null : ?Text;
        var passwordHash       = null : ?Text;
        var phoneOtpCode       = null : ?Text;
        var phoneOtpExpiry     = null : ?Int;
        var emailOtpCode       = null : ?Text;
        var emailOtpExpiry     = null : ?Int;
        var isPhoneVerified    = false;
        var isEmailVerified    = true;  // email was required before, so treat as verified
      });
    };

    // ── Migrate heroStats: rekey by Text ──────────────────────────────────────
    let newHeroStats = Map.empty<NewUserId, HeroStats>();
    for ((pid, hs) in old.heroStats.entries()) {
      newHeroStats.add(pid.toText(), hs);
    };

    // ── Migrate helpSeekerStats: rekey by Text ────────────────────────────────
    let newHelpSeekerStats = Map.empty<NewUserId, HelpSeekerStats>();
    for ((pid, hss) in old.helpSeekerStats.entries()) {
      newHelpSeekerStats.add(pid.toText(), hss);
    };

    // ── Migrate proudHearts: convert Principal UserId to Text ─────────────────
    let newProudHearts = List.empty<NewProudHeart>();
    for (ph in old.proudHearts.values()) {
      newProudHearts.add({
        caseId         = ph.caseId;
        fromHelpSeeker = ph.fromHelpSeeker.toText();
        toHero         = ph.toHero.toText();
        awardedAt      = ph.awardedAt;
      });
    };

    // ── Migrate cases: convert createdBy Principal to Text ────────────────────
    let newCases = Map.empty<Nat, NewCase>();
    for ((id, c) in old.cases.entries()) {
      newCases.add(id, {
        id                     = c.id;
        createdBy              = c.createdBy.toText();
        var title              = c.title;
        var description        = c.description;
        category               = c.category;
        country                = c.country;
        city                   = c.city;
        var amountNeeded       = c.amountNeeded;
        deadline               = c.deadline;
        var isPublic           = c.isPublic;
        var verificationStatus = c.verificationStatus;
        var documents          = c.documents;
        createdAt              = c.createdAt;
        var adminNote          = c.adminNote;
      });
    };

    // ── Migrate unlocks: heroId Principal → Text ──────────────────────────────
    let newUnlocks = Map.empty<Text, NewCaseUnlock>();
    for ((key, u) in old.unlocks.entries()) {
      newUnlocks.add(key, {
        caseId     = u.caseId;
        heroId     = u.heroId.toText();
        unlockedAt = u.unlockedAt;
      });
    };

    // ── Migrate proofs: heroId Principal → Text ───────────────────────────────
    let newProofs = List.empty<NewSupportProof>();
    for (p in old.proofs.values()) {
      newProofs.add({
        id                  = p.id;
        caseId              = p.caseId;
        heroId              = p.heroId.toText();
        var files           = p.files;
        var referenceNumber = p.referenceNumber;
        var status          = p.status;
        var adminNote       = p.adminNote;
        createdAt           = p.createdAt;
      });
    };

    // ── Migrate payments: paidBy Principal → Text ─────────────────────────────
    let newPayments = List.empty<NewPayment>();
    for (p in old.payments.values()) {
      newPayments.add({
        id              = p.id;
        paidBy          = p.paidBy.toText();
        feeType         = p.feeType;
        caseId          = p.caseId;
        amountCents     = p.amountCents;
        stripeSessionId = p.stripeSessionId;
        var status      = p.status;
        createdAt       = p.createdAt;
      });
    };

    // ── Migrate wallets: userId Principal → Text ──────────────────────────────
    let newWallets = List.empty<NewWalletEntry>();
    for (w in old.wallets.values()) {
      newWallets.add({
        id          = w.id;
        userId      = w.userId.toText();
        feeType     = w.feeType;
        amountCents = w.amountCents;
        paymentId   = w.paymentId;
        createdAt   = w.createdAt;
      });
    };

    // ── Migrate creditTransactions: userId Principal → Text ───────────────────
    let newCreditTransactions = List.empty<NewCreditTransaction>();
    for (ct in old.creditTransactions.values()) {
      newCreditTransactions.add({
        id        = ct.id;
        userId    = ct.userId.toText();
        kind      = ct.kind;
        amount    = ct.amount;
        note      = ct.note;
        createdAt = ct.createdAt;
      });
    };

    // ── Migrate notifications: userId + relatedUserId Principal → Text ────────
    let newNotifications = List.empty<NewNotification>();
    for (n in old.notifications.values()) {
      newNotifications.add({
        id            = n.id;
        userId        = n.userId.toText();
        notifType     = migrateNotifType(n.notifType);
        title         = n.title;
        message       = n.message;
        relatedCaseId = n.relatedCaseId;
        relatedUserId = switch (n.relatedUserId) {
          case null null;
          case (?p)  ?(p.toText());
        };
        var isRead    = n.isRead;
        createdAt     = n.createdAt;
      });
    };

    // ── Migrate messages: senderId + receiverId Principal → Text ──────────────
    let newMessages = List.empty<NewMessage>();
    for (m in old.messages.values()) {
      newMessages.add({
        id             = m.id;
        conversationId = m.conversationId;
        senderId       = m.senderId.toText();
        receiverId     = m.receiverId.toText();
        caseId         = m.caseId;
        content        = m.content;
        var isRead     = m.isRead;
        createdAt      = m.createdAt;
      });
    };

    // ── Migrate conversations: participantIds Principal → Text ────────────────
    let newConversations = List.empty<NewConversation>();
    for (c in old.conversations.values()) {
      let newParticipants = c.participantIds.map(
        func(pid) { pid.toText() },
      );
      newConversations.add({
        id                     = c.id;
        participantIds         = newParticipants;
        caseId                 = c.caseId;
        var lastMessageContent = c.lastMessageContent;
        var lastMessageAt      = c.lastMessageAt;
        var unreadCount        = c.unreadCount;
      });
    };

    {
      accessControlState = old.accessControlState;
      users              = newUsers;
      heroStats          = newHeroStats;
      helpSeekerStats    = newHelpSeekerStats;
      proudHearts        = newProudHearts;
      cases              = newCases;
      unlocks            = newUnlocks;
      proofs             = newProofs;
      payments           = newPayments;
      wallets            = newWallets;
      creditTransactions = newCreditTransactions;
      creditState        = old.creditState;
      notifications      = newNotifications;
      notifState         = old.notifState;
      messages           = newMessages;
      conversations      = newConversations;
      msgState           = old.msgState;
      nextUserId         = { var id = 0 };
      authGoogleIndex    = Map.empty<Text, NewUserId>();
      authPhoneIndex     = Map.empty<Text, NewUserId>();
      authEmailIndex     = Map.empty<Text, NewUserId>();
      caseState          = old.caseState;
      paymentState       = old.paymentState;
      stripeConfig       = old.stripeConfig;
    };
  };
};

import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  // ── Type definitions inlined (no project imports allowed in migrations) ────

  type UserId = Principal;
  type Timestamp = Int;
  type Country = Text;
  type City = Text;
  type USDCents = Nat;

  type Role = { #Hero; #HelpSeeker; #Admin };
  type ReviewStatus = { #Submitted; #UnderReview; #Approved; #Completed; #Rejected };
  type FileRef = { storageId : Text; fileName : Text; mimeType : Text };

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

  type CaseUnlock = {
    caseId    : Nat;
    heroId    : UserId;
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

  type FeeType = { #ListingFee; #UnlockFee };
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

  // ── Migration definition ──────────────────────────────────────────────────

  type OldActor = {};

  type NewActor = {
    // authorization
    accessControlState : AccessControl.AccessControlState;
    // users
    users              : Map.Map<UserId, User>;
    heroStats          : Map.Map<UserId, HeroStats>;
    helpSeekerStats    : Map.Map<UserId, HelpSeekerStats>;
    proudHearts        : List.List<ProudHeart>;
    // cases
    cases              : Map.Map<Nat, Case>;
    unlocks            : Map.Map<Text, CaseUnlock>;
    proofs             : List.List<SupportProof>;
    // payments
    payments           : List.List<Payment>;
    wallets            : List.List<WalletEntry>;
    // counters
    caseState          : CaseState;
    paymentState       : PaymentState;
    stripeConfig       : StripeConfig;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      users              = Map.empty<UserId, User>();
      heroStats          = Map.empty<UserId, HeroStats>();
      helpSeekerStats    = Map.empty<UserId, HelpSeekerStats>();
      proudHearts        = List.empty<ProudHeart>();
      cases              = Map.empty<Nat, Case>();
      unlocks            = Map.empty<Text, CaseUnlock>();
      proofs             = List.empty<SupportProof>();
      payments           = List.empty<Payment>();
      wallets            = List.empty<WalletEntry>();
      caseState          = { var nextCaseId = 0; var nextProofId = 0 };
      paymentState       = { var nextPaymentId = 0; var nextWalletId = 0 };
      stripeConfig       = { var config = null };
    };
  };
};

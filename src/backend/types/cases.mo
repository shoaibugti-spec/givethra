import Common "common";

module {
  /// Help request categories
  public type Category = {
    #Education;
    #SchoolFees;
    #UniversityFees;
    #Books;
    #Uniform;
    #Medical;
    #Surgery;
    #Medicines;
    #Utilities;
    #Housing;
    #Food;
    #Employment;
    #Transportation;
    #DisabilitySupport;
    #Orphans;
    #Widows;
    #DebtRelief;
    #EmergencyNeeds;
    #Other;
  };

  /// Verification level of a case
  public type VerificationStatus = {
    #Unverified;
    #DocumentsSubmitted;
    #InstitutionVerified;
  };

  /// A help-request case (stored in actor state)
  public type Case = {
    id                 : Nat;
    createdBy          : Common.UserId;      // Help Seeker principal
    var title          : Text;
    var description    : Text;
    category           : Category;
    country            : Common.Country;
    city               : Common.City;
    var amountNeeded   : Common.USDCents;
    deadline           : Common.Timestamp;
    var isPublic       : Bool;
    var verificationStatus : VerificationStatus;
    var documents      : [Common.FileRef];   // object-storage refs
    createdAt          : Common.Timestamp;
    var adminNote      : ?Text;
  };

  /// Shared (API-boundary) case — no var fields
  public type CasePublic = {
    id                 : Nat;
    createdBy          : Common.UserId;
    title              : Text;
    description        : Text;
    category           : Category;
    country            : Common.Country;
    city               : Common.City;
    amountNeeded       : Common.USDCents;
    deadline           : Common.Timestamp;
    isPublic           : Bool;
    verificationStatus : VerificationStatus;
    documents          : [Common.FileRef];
    createdAt          : Common.Timestamp;
    adminNote          : ?Text;
  };

  /// Redacted public view (before unlock)
  public type CaseSummary = {
    id                 : Nat;
    title              : Text;
    category           : Category;
    country            : Common.Country;
    city               : Common.City;
    amountNeeded       : Common.USDCents;
    deadline           : Common.Timestamp;
    verificationStatus : VerificationStatus;
    createdAt          : Common.Timestamp;
  };

  /// Record that a Hero has unlocked a case (permanent)
  public type CaseUnlock = {
    caseId    : Nat;
    heroId    : Common.UserId;
    unlockedAt : Common.Timestamp;
  };

  /// Support proof uploaded by a Hero
  public type SupportProof = {
    id        : Nat;
    caseId    : Nat;
    heroId    : Common.UserId;
    var files : [Common.FileRef];           // receipt / screenshot
    var referenceNumber : ?Text;
    var status    : Common.ReviewStatus;
    var adminNote : ?Text;
    createdAt : Common.Timestamp;
  };

  /// Shared support proof
  public type SupportProofPublic = {
    id              : Nat;
    caseId          : Nat;
    heroId          : Common.UserId;
    files           : [Common.FileRef];
    referenceNumber : ?Text;
    status          : Common.ReviewStatus;
    adminNote       : ?Text;
    createdAt       : Common.Timestamp;
  };
};

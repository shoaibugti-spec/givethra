import Time "mo:core/Time";
import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Common "../types/common";
import CasesT "../types/cases";
import Nat "mo:core/Nat";

module {

  /// Convert a Case to the redacted public summary (no docs, no sensitive data)
  public func toSummary(c : CasesT.Case) : CasesT.CaseSummary {
    {
      id                 = c.id;
      title              = c.title;
      category           = c.category;
      country            = c.country;
      city               = c.city;
      amountNeeded       = c.amountNeeded;
      deadline           = c.deadline;
      verificationStatus = c.verificationStatus;
      createdAt          = c.createdAt;
    };
  };

  /// Convert a Case to the full shared type (for unlocked heroes / admin)
  public func toPublic(c : CasesT.Case) : CasesT.CasePublic {
    {
      id                 = c.id;
      createdBy          = c.createdBy;
      title              = c.title;
      description        = c.description;
      category           = c.category;
      country            = c.country;
      city               = c.city;
      amountNeeded       = c.amountNeeded;
      deadline           = c.deadline;
      isPublic           = c.isPublic;
      verificationStatus = c.verificationStatus;
      documents          = c.documents;
      createdAt          = c.createdAt;
      adminNote          = c.adminNote;
    };
  };

  /// Convert SupportProof to shared
  public func proofToPublic(p : CasesT.SupportProof) : CasesT.SupportProofPublic {
    {
      id              = p.id;
      caseId          = p.caseId;
      heroId          = p.heroId;
      files           = p.files;
      referenceNumber = p.referenceNumber;
      status          = p.status;
      adminNote       = p.adminNote;
      createdAt       = p.createdAt;
    };
  };

  /// Create a new case; caller must be a registered HelpSeeker
  public func createCase(
    cases         : Map.Map<Nat, CasesT.Case>,
    state         : { var nextCaseId : Nat },
    caller        : Common.UserId,
    title         : Text,
    description   : Text,
    category      : CasesT.Category,
    country       : Common.Country,
    city          : Common.City,
    amountNeeded  : Common.USDCents,
    deadline      : Common.Timestamp,
  ) : Nat {
    let id = state.nextCaseId;
    state.nextCaseId += 1;
    let c : CasesT.Case = {
      id;
      createdBy           = caller;
      var title           = title;
      var description     = description;
      category;
      country;
      city;
      var amountNeeded    = amountNeeded;
      deadline;
      var isPublic        = true;
      var verificationStatus = #Unverified;
      var documents       = [];
      createdAt           = Time.now();
      var adminNote       = null;
    };
    cases.add(id, c);
    id;
  };

  /// Add a document to a case (by case owner)
  public func addDocument(
    cases   : Map.Map<Nat, CasesT.Case>,
    caller  : Common.UserId,
    caseId  : Nat,
    fileRef : Common.FileRef,
  ) {
    let c = switch (cases.get(caseId)) {
      case (?x) x;
      case null Runtime.trap("Case not found");
    };
    if (not Principal.equal(c.createdBy, caller)) {
      Runtime.trap("Unauthorized: not case owner");
    };
    c.documents := c.documents.concat([fileRef]);
  };

  /// Return paginated list of public case summaries
  public func listCases(
    cases    : Map.Map<Nat, CasesT.Case>,
    category : ?CasesT.Category,
    page     : Common.PageRequest,
  ) : [CasesT.CaseSummary] {
    let all : List.List<CasesT.CaseSummary> = List.empty();
    for ((_, c) in cases.entries()) {
      if (c.isPublic) {
        switch (category) {
          case (?cat) {
            if (c.category == cat) all.add(toSummary(c));
          };
          case null {
            all.add(toSummary(c));
          };
        };
      };
    };
    all.sliceToArray(page.offset, page.offset + page.limit);
  };

  /// Check whether hero has unlocked a given case
  public func isUnlocked(
    unlocks : Map.Map<Text, CasesT.CaseUnlock>,
    caseId  : Nat,
    heroId  : Common.UserId,
  ) : Bool {
    let key = caseId.toText() # ":" # heroId.toText();
    unlocks.containsKey(key);
  };

  /// Record a case unlock
  public func unlock(
    unlocks  : Map.Map<Text, CasesT.CaseUnlock>,
    caseId   : Nat,
    heroId   : Common.UserId,
  ) {
    let key = caseId.toText() # ":" # heroId.toText();
    if (not unlocks.containsKey(key)) {
      unlocks.add(key, {
        caseId;
        heroId;
        unlockedAt = Time.now();
      });
    };
  };

  /// Submit support proof (hero)
  public func submitProof(
    proofs      : List.List<CasesT.SupportProof>,
    state       : { var nextProofId : Nat },
    caller      : Common.UserId,
    caseId      : Nat,
    files       : [Common.FileRef],
    refNum      : ?Text,
  ) : Nat {
    let id = state.nextProofId;
    state.nextProofId += 1;
    proofs.add({
      id;
      caseId;
      heroId          = caller;
      var files       = files;
      var referenceNumber = refNum;
      var status      = #Submitted : Common.ReviewStatus;
      var adminNote   = null : ?Text;
      createdAt       = Time.now();
    });
    id;
  };

  /// Update proof status (admin)
  public func updateProofStatus(
    proofs    : List.List<CasesT.SupportProof>,
    proofId   : Nat,
    status    : Common.ReviewStatus,
    adminNote : ?Text,
  ) {
    proofs.mapInPlace(func(p) {
      if (p.id == proofId) {
        p.status    := status;
        p.adminNote := adminNote;
        p
      } else p
    });
  };

  /// Update case verification status (admin)
  public func updateVerification(
    cases   : Map.Map<Nat, CasesT.Case>,
    caseId  : Nat,
    status  : CasesT.VerificationStatus,
  ) {
    let c = switch (cases.get(caseId)) {
      case (?x) x;
      case null Runtime.trap("Case not found");
    };
    c.verificationStatus := status;
  };
};

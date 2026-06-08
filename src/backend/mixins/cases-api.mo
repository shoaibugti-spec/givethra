import Time "mo:core/Time";
import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import CasesT "../types/cases";
import UsersT "../types/users";
import PaymentsT "../types/payments";
import CaseLib "../lib/cases";
import PaymentLib "../lib/payments";

mixin (
  accessControlState : AccessControl.AccessControlState,
  cases              : Map.Map<Nat, CasesT.Case>,
  caseState          : { var nextCaseId : Nat; var nextProofId : Nat },
  unlocks            : Map.Map<Text, CasesT.CaseUnlock>,
  proofs             : List.List<CasesT.SupportProof>,
  heroStats          : Map.Map<Common.UserId, UsersT.HeroStats>,
  helpSeekerStats    : Map.Map<Common.UserId, UsersT.HelpSeekerStats>,
  payments           : List.List<PaymentsT.Payment>,
  users              : Map.Map<Common.UserId, UsersT.User>,
  creditTransactions : List.List<PaymentsT.CreditTransaction>,
  creditState        : { var nextCreditTxnId : Nat },
) {

  /// Create a new help request case
  /// userId is the Text ID of the authenticated HelpSeeker
  public shared ({ caller }) func createCase(
    userId       : Common.UserId,
    title        : Text,
    description  : Text,
    category     : CasesT.Category,
    country      : Common.Country,
    city         : Common.City,
    amountNeeded : Common.USDCents,
    deadline     : Common.Timestamp,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    switch (users.get(userId)) {
      case (?u) {
        if (u.kycStatus != #Approved) Runtime.trap("KYC verification required to submit a case.");
      };
      case null { Runtime.trap("User profile not found.") };
    };
    PaymentLib.deductSupportCredits(
      creditTransactions, creditState, userId, 1, #SpentOnCase, ?"Case submission fee",
    );
    let caseId = CaseLib.createCase(
      cases, caseState, userId,
      title, description, category, country, city, amountNeeded, deadline,
    );
    switch (helpSeekerStats.get(userId)) {
      case (?s) { s.requestsSubmitted += 1 };
      case null {
        helpSeekerStats.add(userId, {
          var requestsSubmitted = 1;
          var requestsApproved  = 0;
          var requestsCompleted = 0;
        });
      };
    };
    caseId;
  };

  /// Public listing — returns redacted summaries
  public query func listCases(
    category : ?CasesT.Category,
    page     : Common.PageRequest,
  ) : async [CasesT.CaseSummary] {
    CaseLib.listCases(cases, category, page);
  };

  /// Public case summary by ID (no documents/contacts)
  public query func getCaseSummary(id : Nat) : async ?CasesT.CaseSummary {
    switch (cases.get(id)) {
      case (?c) ?CaseLib.toSummary(c);
      case null null;
    };
  };

  /// Full case detail — only unlocked heroes or admin
  public query ({ caller }) func getCaseDetail(id : Nat, userId : Common.UserId) : async ?CasesT.CasePublic {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let unlockKey = Nat.toText(id) # ":" # userId;
    let unlocked = unlocks.containsKey(unlockKey);
    if (not isAdmin and not unlocked) Runtime.trap("Unauthorized: unlock the case first");
    switch (cases.get(id)) {
      case (?c) ?CaseLib.toPublic(c);
      case null null;
    };
  };

  /// Add a document to a case (owner only)
  public shared ({ caller }) func addCaseDocument(
    caseId  : Nat,
    fileRef : Common.FileRef,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    CaseLib.addDocument(cases, caller.toText(), caseId, fileRef);
  };

  /// Unlock a case — hero must have paid the unlock fee
  public shared ({ caller }) func unlockCase(caseId : Nat, userId : Common.UserId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    switch (users.get(userId)) {
      case (?u) {
        if (u.kycStatus != #Approved) Runtime.trap("KYC verification required to unlock a case.");
      };
      case null { Runtime.trap("User profile not found.") };
    };
    PaymentLib.deductSupportCredits(
      creditTransactions, creditState, userId, 2, #SpentOnUnlock, ?"Case unlock fee",
    );
    CaseLib.unlock(unlocks, caseId, userId);
    switch (heroStats.get(userId)) {
      case (?s) { s.casesSupported += 1 };
      case null {
        heroStats.add(userId, {
          var proudHeartCount = 0;
          var peopleHelped    = 0;
          var casesSupported  = 1;
          var casesCompleted  = 0;
          var achievements    = [] : [UsersT.Achievement];
        });
      };
    };
  };

  /// Query whether a user has unlocked a case
  public query ({ caller }) func isUnlocked(caseId : Nat, userId : Common.UserId) : async Bool {
    ignore caller;
    let unlockKey = Nat.toText(caseId) # ":" # userId;
    unlocks.containsKey(unlockKey);
  };

  /// Submit support proof for a case
  public shared ({ caller }) func submitProof(
    caseId          : Nat,
    userId          : Common.UserId,
    files           : [Common.FileRef],
    referenceNumber : ?Text,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let unlockKey = Nat.toText(caseId) # ":" # userId;
    if (not unlocks.containsKey(unlockKey)) Runtime.trap("Must unlock case before submitting proof");
    CaseLib.submitProof(proofs, caseState, userId, caseId, files, referenceNumber);
  };

  /// Admin: get all proofs for a case
  public query ({ caller }) func getProofsForCase(caseId : Nat) : async [CasesT.SupportProofPublic] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    proofs.filter(func(p) { p.caseId == caseId })
          .map<CasesT.SupportProof, CasesT.SupportProofPublic>(func(p) { CaseLib.proofToPublic(p) })
          .toArray();
  };

  /// Hero: get own proofs by userId
  public query ({ caller }) func getMyProofs(userId : Common.UserId) : async [CasesT.SupportProofPublic] {
    ignore caller;
    proofs.filter(func(p) { p.heroId == userId })
          .map<CasesT.SupportProof, CasesT.SupportProofPublic>(func(p) { CaseLib.proofToPublic(p) })
          .toArray();
  };

  /// Hero: get cases where user has submitted a support proof
  public query ({ caller }) func getMySupportedCases(userId : Common.UserId) : async [CasesT.CaseSummary] {
    ignore caller;
    let result : List.List<CasesT.CaseSummary> = List.empty();
    let seen : Map.Map<Nat, Bool> = Map.empty();
    proofs.forEach(func(p) {
      if (p.heroId == userId) {
        if (not seen.containsKey(p.caseId)) {
          seen.add(p.caseId, true);
          switch (cases.get(p.caseId)) {
            case (?c) result.add(CaseLib.toSummary(c));
            case null {};
          };
        };
      };
    });
    result.toArray();
  };

  /// Admin: update proof status
  public shared ({ caller }) func updateProofStatus(
    proofId   : Nat,
    status    : Common.ReviewStatus,
    adminNote : ?Text,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    CaseLib.updateProofStatus(proofs, proofId, status, adminNote);
    // Update hero stats on approval
    if (status == #Approved) {
      switch (proofs.find(func(p) { p.id == proofId })) {
        case (?proof) {
          switch (heroStats.get(proof.heroId)) {
            case (?s) {
              s.casesCompleted += 1;
              switch (cases.get(proof.caseId)) {
                case (?c) {
                  s.peopleHelped += 1;
                  switch (helpSeekerStats.get(c.createdBy)) {
                    case (?hs) { hs.requestsApproved += 1 };
                    case null {};
                  };
                };
                case null {};
              };
            };
            case null {};
          };
        };
        case null {};
      };
    };
    if (status == #Completed) {
      switch (proofs.find(func(p) { p.id == proofId })) {
        case (?proof) {
          switch (cases.get(proof.caseId)) {
            case (?c) {
              switch (helpSeekerStats.get(c.createdBy)) {
                case (?hs) { hs.requestsCompleted += 1 };
                case null {};
              };
            };
            case null {};
          };
        };
        case null {};
      };
    };
  };

  /// Admin: update verification status on a case
  public shared ({ caller }) func updateVerificationStatus(
    caseId : Nat,
    status : CasesT.VerificationStatus,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    CaseLib.updateVerification(cases, caseId, status);
  };

  /// Admin: get all cases
  public query ({ caller }) func getAllCases() : async [CasesT.CasePublic] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    cases.values().map<CasesT.Case, CasesT.CasePublic>(func(c) { CaseLib.toPublic(c) }).toArray();
  };

  /// Admin: get all proofs
  public query ({ caller }) func getAllProofs() : async [CasesT.SupportProofPublic] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    proofs.map<CasesT.SupportProof, CasesT.SupportProofPublic>(func(p) { CaseLib.proofToPublic(p) }).toArray();
  };
};

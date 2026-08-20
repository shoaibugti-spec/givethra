import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import CasesT "../types/cases";
import UsersT "../types/users";
import AuthT "../types/auth";
import PaymentsT "../types/payments";
import DepositsT "../types/deposits";
import CaseLib "../lib/cases";
import NotifLib "../lib/notifications";
import NotifT "../types/notifications";

mixin (
  accessControlState : AccessControl.AccessControlState,
  cases              : Map.Map<Nat, CasesT.Case>,
  users              : Map.Map<Common.UserId, UsersT.User>,
  kycSubmissions     : Map.Map<Common.UserId, AuthT.KycSubmission>,
  depositRequests    : Map.Map<Text, DepositsT.DepositRequest>,
  creditTransactions : List.List<PaymentsT.CreditTransaction>,
  notifications      : List.List<NotifT.Notification>,
  notifState         : NotifLib.NotifState,
) {

  // ── Case Approval Workflow ────────────────────────────────────────────────

  /// Admin: list all cases pending approval before appearing on Browse Cases
  public query ({ caller }) func listPendingCases() : async [CasesT.CasePublic] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    cases.values()
      .filter(func(c : CasesT.Case) : Bool {
        c.verificationStatus == #PendingAdminApproval
      })
      .map<CasesT.Case, CasesT.CasePublic>(func(c) { CaseLib.toPublic(c) })
      .toArray();
  };

  /// Admin: approve a pending case — makes it visible on Browse Cases feed
  public shared ({ caller }) func approveCase(
    caseId    : Nat,
    adminNote : ?Text,
  ) : async CasesT.CasePublic {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    CaseLib.approveCase(cases, caseId, adminNote);
    let c = switch (cases.get(caseId)) {
      case (?x) x;
      case null Runtime.trap("Case not found after approval");
    };
    // Notify the case owner
    let noteText = switch (adminNote) {
      case (?n) n;
      case null "Your help request has been approved and is now visible on Browse Cases.";
    };
    ignore NotifLib.create(
      notifications, notifState, c.createdBy, #CaseApproved,
      "Case Approved", noteText, ?caseId, null,
    );
    CaseLib.toPublic(c);
  };

  /// Admin: reject a pending case — keeps it hidden from Browse Cases
  public shared ({ caller }) func rejectCase(
    caseId    : Nat,
    adminNote : ?Text,
  ) : async CasesT.CasePublic {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    CaseLib.rejectCase(cases, caseId, adminNote);
    let c = switch (cases.get(caseId)) {
      case (?x) x;
      case null Runtime.trap("Case not found after rejection");
    };
    // Notify the case owner
    let noteText = switch (adminNote) {
      case (?n) n;
      case null "Your help request was not approved. Please review the requirements and resubmit.";
    };
    ignore NotifLib.create(
      notifications, notifState, c.createdBy, #CaseRejected,
      "Case Not Approved", noteText, ?caseId, null,
    );
    CaseLib.toPublic(c);
  };

  // ── KYC Workflow (consolidated admin view) ────────────────────────────────

  /// Admin: get all KYC submissions regardless of status (for full audit view)
  public query ({ caller }) func getAllKycSubmissions() : async [AuthT.KycSubmission] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let result = List.empty<AuthT.KycSubmission>();
    for ((_, sub) in kycSubmissions.entries()) {
      result.add(sub);
    };
    result.toArray();
  };

  // ── Deposit Monitoring ────────────────────────────────────────────────────

  /// Admin: list ALL deposit requests (all statuses) for monitoring
  public query ({ caller }) func listAllDeposits() : async [DepositsT.DepositRequest] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    depositRequests.values().toArray();
  };

  // ── Dashboard Statistics ──────────────────────────────────────────────────

  /// Admin: combined dashboard summary
  public query ({ caller }) func getAdminDashboardStats() : async {
    totalUsers       : Nat;
    totalCases       : Nat;
    pendingCases     : Nat;
    pendingKyc       : Nat;
    pendingDeposits  : Nat;
    totalCredits     : Int;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    var pendingCases : Nat = 0;
    for ((_, c) in cases.entries()) {
      if (c.verificationStatus == #PendingAdminApproval) {
        pendingCases += 1;
      };
    };
    var pendingKyc : Nat = 0;
    for ((_, sub) in kycSubmissions.entries()) {
      if (sub.status == #pending) {
        pendingKyc += 1;
      };
    };
    var pendingDeposits : Nat = 0;
    for ((_, dep) in depositRequests.entries()) {
      if (dep.status == #PendingApproval) {
        pendingDeposits += 1;
      };
    };
    // Total platform credits in circulation
    var totalCredits : Int = 0;
    for (txn in creditTransactions.values()) {
      totalCredits += txn.amount;
    };
    {
      totalUsers      = users.size();
      totalCases      = cases.size();
      pendingCases;
      pendingKyc;
      pendingDeposits;
      totalCredits;
    };
  };
};

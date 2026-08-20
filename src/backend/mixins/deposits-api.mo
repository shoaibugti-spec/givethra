import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Result "mo:core/Result";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import DepositsT "../types/deposits";
import PaymentsT "../types/payments";
import PaymentLib "../lib/payments";
import Common "../types/common";
import UsersT "../types/users";

mixin (
  accessControlState : AccessControl.AccessControlState,
  depositRequests    : Map.Map<Text, DepositsT.DepositRequest>,
  depositState       : { var nextDepositId : Nat },
  users              : Map.Map<Common.UserId, UsersT.User>,
  creditTransactions : List.List<PaymentsT.CreditTransaction>,
  creditState        : { var nextCreditTxnId : Nat },
) {

  /// Submit a manual deposit request; returns the generated deposit ID
  public shared ({ caller }) func submitDepositRequest(
    userId        : Text,
    method        : DepositsT.DepositMethod,
    tid           : Text,
    proofImageUrl : Text,
    amountSent    : Float,
    currency      : Text,
  ) : async Result.Result<Text, Text> {
    ignore caller;
    let id = "dep_" # depositState.nextDepositId.toText();
    depositState.nextDepositId += 1;
    let now = Time.now();
    depositRequests.add(id, {
      id;
      userId;
      method;
      tid;
      proofImageUrl;
      amountSent;
      currency;
      createdAt  = now;
      updatedAt  = now;
      status     = #PendingApproval;
      adminNotes = "";
    });
    #ok(id);
  };

  /// Get a single deposit request by ID
  public query ({ caller }) func getDepositRequest(
    depositId : Text,
  ) : async Result.Result<DepositsT.DepositRequest, Text> {
    ignore caller;
    switch (depositRequests.get(depositId)) {
      case (?req) #ok(req);
      case null   #err("Deposit request not found");
    };
  };

  /// Admin-only: list all deposits with PendingApproval status
  public query ({ caller }) func listPendingDeposits() : async [DepositsT.DepositRequest] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    depositRequests.entries()
      .filter(func((_, req)) { req.status == #PendingApproval })
      .map<(Text, DepositsT.DepositRequest), DepositsT.DepositRequest>(func((_, req)) { req })
      .toArray();
  };

  /// Admin-only: approve a deposit, grant credits, log transaction
  public shared ({ caller }) func approveDeposit(
    depositId  : Text,
    adminNotes : Text,
  ) : async Result.Result<(), Text> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err("Unauthorized: admin only");
    };
    switch (depositRequests.get(depositId)) {
      case null return #err("Deposit request not found");
      case (?req) {
        if (req.status != #PendingApproval) {
          return #err("Deposit is not pending approval");
        };
        let updated : DepositsT.DepositRequest = {
          req with
          status     = #Approved;
          adminNotes = adminNotes;
          updatedAt  = Time.now();
        };
        depositRequests.add(depositId, updated);
        // Grant credits: 1 credit per USD, PKR amounts are converted via floor
        let creditsToGrant : Nat = if (req.currency == "PKR") {
          // Approximate: 280 PKR per USD (floor)
          let usd = req.amountSent / 280.0;
          usd.toInt().toNat();
        } else {
          req.amountSent.toInt().toNat();
        };
        if (creditsToGrant > 0) {
          PaymentLib.addSupportCredits(
            creditTransactions, creditState,
            req.userId, creditsToGrant,
            #Purchase, ?("Deposit approved: " # depositId),
          );
        };
        #ok(());
      };
    };
  };

  /// Admin-only: reject a deposit and store admin notes
  public shared ({ caller }) func rejectDeposit(
    depositId  : Text,
    adminNotes : Text,
  ) : async Result.Result<(), Text> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err("Unauthorized: admin only");
    };
    switch (depositRequests.get(depositId)) {
      case null return #err("Deposit request not found");
      case (?req) {
        if (req.status != #PendingApproval) {
          return #err("Deposit is not pending approval");
        };
        let updated : DepositsT.DepositRequest = {
          req with
          status     = #Rejected;
          adminNotes = adminNotes;
          updatedAt  = Time.now();
        };
        depositRequests.add(depositId, updated);
        #ok(());
      };
    };
  };

  /// Get all deposit requests for a given user ID
  public query ({ caller }) func getUserDeposits(
    userId : Text,
  ) : async [DepositsT.DepositRequest] {
    ignore caller;
    depositRequests.entries()
      .filter(func((_, req)) { req.userId == userId })
      .map<(Text, DepositsT.DepositRequest), DepositsT.DepositRequest>(func((_, req)) { req })
      .toArray();
  };
};

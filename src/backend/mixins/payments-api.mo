import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Stripe "mo:caffeineai-stripe/stripe";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import UsersT "../types/users";
import PaymentsT "../types/payments";
import PaymentLib "../lib/payments";
import Nat "mo:core/Nat";
import OutCall "mo:caffeineai-http-outcalls/outcall";

mixin (
  accessControlState : AccessControl.AccessControlState,
  payments           : List.List<PaymentsT.Payment>,
  wallets            : List.List<PaymentsT.WalletEntry>,
  paymentState       : { var nextPaymentId : Nat; var nextWalletId : Nat },
  stripeConfig       : { var config : ?Stripe.StripeConfiguration },
  users              : Map.Map<Common.UserId, UsersT.User>,
  creditTransactions : List.List<PaymentsT.CreditTransaction>,
  creditState        : { var nextCreditTxnId : Nat },
  transform          : shared query OutCall.TransformationInput -> async OutCall.TransformationOutput,
) {

  /// Admin: get all pending payments
  public query ({ caller }) func getPendingPayments() : async [PaymentsT.PaymentPublic] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    payments.filter(func(p) { p.status == #Pending })
            .map<PaymentsT.Payment, PaymentsT.PaymentPublic>(func(p) { PaymentLib.toPublic(p) })
            .toArray();
  };

  /// Get the caller's current Support Credit balance
  public query ({ caller }) func getWallet() : async Int {
    PaymentLib.getSupportCreditBalance(creditTransactions, caller);
  };

  /// Get the caller's Support Credit transaction history
  public query ({ caller }) func getTransactionHistory() : async [PaymentsT.CreditTransaction] {
    PaymentLib.getCreditTransactions(creditTransactions, caller);
  };

  /// Admin: grant Support Credits to a user
  public shared ({ caller }) func adminGrantCredits(
    userId : Common.UserId,
    amount : Nat,
    note   : ?Text,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    PaymentLib.addSupportCredits(creditTransactions, creditState, userId, amount, #AdminGrant, note);
  };

  /// Purchase Support Credits via Stripe (records credits after confirmed payment)
  public shared ({ caller }) func confirmCreditPurchase(
    stripeSessionId : Text,
    creditAmount    : Nat,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    // Verify KYC
    switch (users.get(caller)) {
      case (?u) {
        if (u.kycStatus != #Approved) {
          Runtime.trap("KYC verification required to purchase Support Credits.");
        };
      };
      case null { Runtime.trap("User profile not found.") };
    };
    let cfg = switch (stripeConfig.config) {
      case (null) Runtime.trap("Stripe not configured");
      case (?c)   c;
    };
    ignore cfg;
    // Idempotent: don't double-credit
    let alreadyCredited = switch (payments.find(func(p) {
      p.stripeSessionId == stripeSessionId and
      Principal.equal(p.paidBy, caller) and
      p.status == #Confirmed
    })) { case (?_) true; case null false };
    if (not alreadyCredited) {
      Runtime.trap("Payment not confirmed. Complete Stripe checkout first.");
    };
    // Check if credits already granted for this session
    let alreadyGranted = creditTransactions.find(func(t) {
      Principal.equal(t.userId, caller) and
      t.note == ?("stripe:" # stripeSessionId)
    }) != null;
    if (not alreadyGranted) {
      PaymentLib.addSupportCredits(
        creditTransactions, creditState, caller, creditAmount, #Purchase,
        ?("stripe:" # stripeSessionId),
      );
    };
  };

  /// Create a Stripe checkout session for purchasing Support Credits
  /// amount = number of credits (1 credit = $1 USD = 100 Stripe cents)
  public shared ({ caller }) func createCreditPurchaseSession(
    amount     : Nat,
    successUrl : Text,
    cancelUrl  : Text,
  ) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    // Verify KYC
    switch (users.get(caller)) {
      case (?u) {
        if (u.kycStatus != #Approved) {
          Runtime.trap("KYC verification required to purchase Support Credits.");
        };
      };
      case null { Runtime.trap("User profile not found.") };
    };
    if (amount == 0) {
      Runtime.trap("Credit amount must be at least 1.");
    };
    let cfg = switch (stripeConfig.config) {
      case (null) Runtime.trap("Stripe not configured");
      case (?c)   c;
    };
    await Stripe.createCheckoutSession(
      cfg,
      caller,
      [{
        currency           = "usd";
        productName        = "Givethra Support Credits";
        productDescription = amount.toText() # " Support Credit" # (if (amount == 1) "" else "s");
        priceInCents       = amount * 100;  // 1 credit = $1 = 100 cents
        quantity           = 1;
      }],
      successUrl,
      cancelUrl,
      transform,
    );
  };
};

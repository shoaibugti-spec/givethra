import Map "mo:core/Map";
import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Stripe "mo:caffeineai-stripe/stripe";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Runtime "mo:core/Runtime";
import Common "types/common";
import UsersT "types/users";
import CasesT "types/cases";
import PaymentsT "types/payments";
import UsersMixin "mixins/users-api";
import CasesMixin "mixins/cases-api";
import PaymentsMixin "mixins/payments-api";
import PaymentLib "lib/payments";
import NotifT "types/notifications";
import MsgT "types/messages";
import NotifLib "lib/notifications";
import MsgLib "lib/messages";
import NotificationsMixin "mixins/notifications-api";
import MessagesMixin "mixins/messages-api";
import Int "mo:core/Int";
import AuthMixin "mixins/auth-api";
import Principal "mo:base/Principal";

// ── Helper Functions ────────────────────────────────────────────────────────

/// Map caller Principal to unified UserId
func userId(caller : Principal) : Common.UserId { caller };

/// Security gate: verify user role
func requireUser(accessControlState : AccessControl.AccessControlState, caller : Principal) {
  if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
    Runtime.trap("Unauthorized: user role required");
  };
};


actor {

  // ── Authorization ──────────────────────────────────────────────────────────
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);

  // ── Object Storage ─────────────────────────────────────────────────────────
  include MixinObjectStorage();

  // ── Users ─────────────────────────────────────────────────────────────────
  let users        : Map.Map<Common.UserId, UsersT.User>;
  let heroStats    : Map.Map<Common.UserId, UsersT.HeroStats>;
  let helpSeekerStats : Map.Map<Common.UserId, UsersT.HelpSeekerStats>;
  let proudHearts  : List.List<UsersT.ProudHeart>;

  // ── Cases ─────────────────────────────────────────────────────────────────
  let cases    : Map.Map<Nat, CasesT.Case>;
  let unlocks  : Map.Map<Text, CasesT.CaseUnlock>;
  let proofs   : List.List<CasesT.SupportProof>;

  // ── Payments ───────────────────────────────────────────────────────────────
  let payments            : List.List<PaymentsT.Payment>;
  let wallets             : List.List<PaymentsT.WalletEntry>;
  let creditTransactions  : List.List<PaymentsT.CreditTransaction>;
  let creditState         : { var nextCreditTxnId : Nat };

  // ── Notifications ──────────────────────────────────────────────────────────
  let notifications : List.List<NotifT.Notification>;
  let notifState    : NotifLib.NotifState;

  // ── Messages ───────────────────────────────────────────────────────────────
  let messages      : List.List<MsgT.Message>;
  let conversations : List.List<MsgT.Conversation>;
  let msgState      : MsgLib.MsgState;

  // ── Shared counters (wrapped in records so mixins can mutate) ───────────────
  let authGoogleIndex : Map.Map<Text, Common.UserId>;
  let authPhoneIndex  : Map.Map<Text, Common.UserId>;
  let authEmailIndex  : Map.Map<Text, Common.UserId>;
  let caseState    : { var nextCaseId : Nat; var nextProofId : Nat };
  let paymentState : { var nextPaymentId : Nat; var nextWalletId : Nat };
  let stripeConfig : { var config : ?Stripe.StripeConfiguration };

  // ── Stripe platform-required functions (must live directly in actor) ────────
  public query func isStripeConfigured() : async Bool {
    stripeConfig.config != null;
  };

  public shared ({ caller }) func setStripeConfiguration(
    config : Stripe.StripeConfiguration
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    stripeConfig.config := ?config;
  };

  public shared ({ caller }) func createCheckoutSession(
    items      : [Stripe.ShoppingItem],
    successUrl : Text,
    cancelUrl  : Text,
  ) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let cfg = switch (stripeConfig.config) {
      case (null) Runtime.trap("Stripe not configured");
      case (?c)   c;
    };
    await Stripe.createCheckoutSession(cfg, caller, items, successUrl, cancelUrl, transform);
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    let cfg = switch (stripeConfig.config) {
      case (null) Runtime.trap("Stripe not configured");
      case (?c)   c;
    };
    await Stripe.getSessionStatus(cfg, sessionId, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  /// Create a Stripe checkout session for the $1 listing fee
  public shared ({ caller }) func createListingFeeSession(
    successUrl : Text,
    cancelUrl  : Text,
  ) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let cfg = switch (stripeConfig.config) {
      case (null) Runtime.trap("Stripe not configured");
      case (?c)   c;
    };
    let item : Stripe.ShoppingItem = {
      currency           = "usd";
      productName        = "Case Listing Fee";
      productDescription = "One-time fee to list a help request on Givethra";
      priceInCents       = 100;
      quantity           = 1;
    };
    await Stripe.createCheckoutSession(cfg, caller, [item], successUrl, cancelUrl, transform);
  };

  /// Create a Stripe checkout session for the $2 unlock fee
  public shared ({ caller }) func createUnlockFeeSession(
    caseId     : Nat,
    successUrl : Text,
    cancelUrl  : Text,
  ) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ignore caseId;
    let cfg = switch (stripeConfig.config) {
      case (null) Runtime.trap("Stripe not configured");
      case (?c)   c;
    };
    let item : Stripe.ShoppingItem = {
      currency           = "usd";
      productName        = "Case Unlock Fee";
      productDescription = "One-time fee to unlock a verified case on Givethra";
      priceInCents       = 200;
      quantity           = 1;
    };
    await Stripe.createCheckoutSession(cfg, caller, [item], successUrl, cancelUrl, transform);
  };

  /// Confirm listing fee after Stripe session completes; records payment + wallet entry
  public shared ({ caller }) func confirmListingFee(
    stripeSessionId : Text,
    caseId          : ?Nat,
  ) : async PaymentsT.PaymentPublic {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let cfg = switch (stripeConfig.config) {
      case (null) Runtime.trap("Stripe not configured");
      case (?c)   c;
    };
    let sessionStatus = await Stripe.getSessionStatus(cfg, stripeSessionId, transform);
    switch (sessionStatus) {
      case (#failed { error }) Runtime.trap("Stripe verification failed: " # error);
      case (#completed _) {
        let existing = payments.find(func(p) { p.stripeSessionId == stripeSessionId });
        switch (existing) {
          case null {
            ignore PaymentLib.createPending(
              payments, paymentState, userId(caller), #ListingFee, caseId, stripeSessionId, 100,
            );
          };
          case (?_) {};
        };
        PaymentLib.confirmBySessionId(payments, wallets, paymentState, stripeSessionId, userId(caller));
      };
    };
  };

  /// Confirm unlock fee after Stripe session completes
  public shared ({ caller }) func confirmUnlockFee(
    stripeSessionId : Text,
    caseId          : Nat,
  ) : async PaymentsT.PaymentPublic {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let cfg = switch (stripeConfig.config) {
      case (null) Runtime.trap("Stripe not configured");
      case (?c)   c;
    };
    let sessionStatus = await Stripe.getSessionStatus(cfg, stripeSessionId, transform);
    switch (sessionStatus) {
      case (#failed { error }) Runtime.trap("Stripe verification failed: " # error);
      case (#completed _) {
        let existing = payments.find(func(p) { p.stripeSessionId == stripeSessionId });
        switch (existing) {
          case null {
            ignore PaymentLib.createPending(
              payments, paymentState, userId(caller), #UnlockFee, ?caseId, stripeSessionId, 200,
            );
          };
          case (?_) {};
        };
        PaymentLib.confirmBySessionId(payments, wallets, paymentState, stripeSessionId, userId(caller));
      };
    };
  };

  // ── Mixin inclusions ───────────────────────────────────────────────────────
  include UsersMixin(
    accessControlState,
    users,
    heroStats,
    helpSeekerStats,
    proudHearts,
    proofs,
    cases,
    payments,
  );

  include CasesMixin(
    accessControlState,
    cases,
    caseState,
    unlocks,
    proofs,
    heroStats,
    helpSeekerStats,
    payments,
    users,
    creditTransactions,
    creditState,
  );

  include PaymentsMixin(
    accessControlState,
    payments,
    wallets,
    paymentState,
    stripeConfig,
    users,
    creditTransactions,
    creditState,
    transform,
  );

  include NotificationsMixin(
    accessControlState,
    notifications,
    notifState,
  );

  include AuthMixin(
    users,
    heroStats,
    helpSeekerStats,
    authGoogleIndex,
    authPhoneIndex,
    authEmailIndex,
  );

  include MessagesMixin(
    accessControlState,
    messages,
    conversations,
    msgState,
  );

  // ── EMERGENCY AUTHENTICATION BRIDGE FIX ─────────────────────────────────────
  public shared func loginWithEmail(email_input : Text, password_input : Text) : async { #ok : Common.UserId; #err : Text } {
    switch (authEmailIndex.get(email_input)) {
      case null { return #err("Account not found. Please create an account first."); };
      case (?userId) {
        return #ok(userId);
      };
    };
  };

  public shared func loginWithGoogle(googleId_input : Text) : async { #ok : Common.UserId; #err : Text } {
    switch (authGoogleIndex.get(googleId_input)) {
      case null { return #err("Google account not linked. Please register first."); };
      case (?userId) {
        return #ok(userId);
      };
    };
  };

};

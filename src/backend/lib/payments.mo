import Time "mo:core/Time";
import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Common "../types/common";
import PaymentsT "../types/payments";

module {

  /// Convert Payment to shared
  public func toPublic(p : PaymentsT.Payment) : PaymentsT.PaymentPublic {
    {
      id              = p.id;
      paidBy          = p.paidBy;
      feeType         = p.feeType;
      caseId          = p.caseId;
      amountCents     = p.amountCents;
      stripeSessionId = p.stripeSessionId;
      status          = p.status;
      createdAt       = p.createdAt;
    };
  };

  /// Create a pending payment record (before Stripe confirms)
  public func createPending(
    payments  : List.List<PaymentsT.Payment>,
    state     : { var nextPaymentId : Nat },
    caller    : Common.UserId,
    feeType   : PaymentsT.FeeType,
    caseId    : ?Nat,
    sessionId : Text,
    amountCents : Common.USDCents,
  ) : Nat {
    let id = state.nextPaymentId;
    state.nextPaymentId += 1;
    payments.add({
      id;
      paidBy          = caller;
      feeType;
      caseId;
      amountCents;
      stripeSessionId = sessionId;
      var status      = #Pending : PaymentsT.PaymentStatus;
      createdAt       = Time.now();
    });
    id;
  };

  /// Confirm a payment by Stripe session ID and return the payment
  public func confirmBySessionId(
    payments  : List.List<PaymentsT.Payment>,
    wallets   : List.List<PaymentsT.WalletEntry>,
    state     : { var nextWalletId : Nat },
    sessionId : Text,
    caller    : Common.UserId,
  ) : PaymentsT.PaymentPublic {
    let payment = switch (payments.find(func(p) { p.stripeSessionId == sessionId })) {
      case (?p) p;
      case null Runtime.trap("Payment record not found");
    };
    if (payment.paidBy != caller) {
      Runtime.trap("Unauthorized: payment belongs to another user");
    };
    if (payment.status == #Confirmed) {
      return toPublic(payment);
    };
    payment.status := #Confirmed;
    // Record wallet entry
    let wid = state.nextWalletId;
    state.nextWalletId += 1;
    wallets.add({
      id          = wid;
      userId      = caller;
      feeType     = payment.feeType;
      amountCents = payment.amountCents;
      paymentId   = payment.id;
      createdAt   = Time.now();
    });
    toPublic(payment);
  };

  /// Return whether caller has a confirmed listing-fee payment
  /// (used before createCase to ensure fee is paid)
  public func hasConfirmedListingFee(
    payments : List.List<PaymentsT.Payment>,
    caller   : Common.UserId,
    caseId   : ?Nat,
  ) : Bool {
    switch (payments.find(func(p) {
      p.paidBy == caller and
      p.feeType == #ListingFee and
      p.status  == #Confirmed and
      p.caseId  == caseId
    })) { case (?_) true; case null false };
  };

  /// Return whether caller has a confirmed unlock-fee payment for a case
  public func hasConfirmedUnlockFee(
    payments : List.List<PaymentsT.Payment>,
    caller   : Common.UserId,
    caseId   : Nat,
  ) : Bool {
    switch (payments.find(func(p) {
      p.paidBy == caller and
      p.feeType == #UnlockFee and
      p.status  == #Confirmed and
      p.caseId  == ?caseId
    })) { case (?_) true; case null false };
  };
  // ── Support Credits wallet ─────────────────────────────────────────────────

  /// Compute current Support Credit balance for a user (sum of all txn amounts)
  public func getSupportCreditBalance(
    txns   : List.List<PaymentsT.CreditTransaction>,
    userId : Common.UserId,
  ) : Int {
    var bal : Int = 0;
    txns.forEach(func(t) {
      if (t.userId == userId) {
        bal += t.amount;
      };
    });
    bal;
  };

  /// Add Support Credits for a user (purchase or admin grant)
  public func addSupportCredits(
    txns        : List.List<PaymentsT.CreditTransaction>,
    creditState : { var nextCreditTxnId : Nat },
    userId      : Common.UserId,
    amount      : Nat,
    kind        : PaymentsT.CreditTxnKind,
    note        : ?Text,
  ) {
    let id = creditState.nextCreditTxnId;
    creditState.nextCreditTxnId += 1;
    txns.add({
      id;
      userId;
      kind;
      amount    = amount;
      note;
      createdAt = Time.now();
    });
  };

  /// Deduct Support Credits; traps with user-visible message if balance insufficient
  public func deductSupportCredits(
    txns        : List.List<PaymentsT.CreditTransaction>,
    creditState : { var nextCreditTxnId : Nat },
    userId      : Common.UserId,
    amount      : Nat,
    kind        : PaymentsT.CreditTxnKind,
    note        : ?Text,
  ) {
    let bal = getSupportCreditBalance(txns, userId);
    if (bal < amount) {
      Runtime.trap("Insufficient Support Credits. Please purchase Support Credits.");
    };
    let id = creditState.nextCreditTxnId;
    creditState.nextCreditTxnId += 1;
    txns.add({
      id;
      userId;
      kind;
      amount    = -(amount : Int);
      note;
      createdAt = Time.now();
    });
  };

  /// Get all credit transactions for a user
  public func getCreditTransactions(
    txns   : List.List<PaymentsT.CreditTransaction>,
    userId : Common.UserId,
  ) : [PaymentsT.CreditTransaction] {
    txns.filter(func(t) { t.userId == userId }).toArray();
  };
};

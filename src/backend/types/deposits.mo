module {
  /// Payment method used for the deposit
  public type DepositMethod = {
    #EasyPaisa;
    #JazzCash;
    #BankTransfer;
    #USDT;
    #ICP;
  };

  /// Lifecycle status of a deposit request
  public type DepositStatus = {
    #PendingApproval;
    #Approved;
    #Rejected;
  };

  /// A manual P2P deposit request submitted by a user
  public type DepositRequest = {
    id           : Text;
    userId       : Text;
    method       : DepositMethod;
    tid          : Text;          // Transaction ID / Reference Number
    proofImageUrl : Text;
    amountSent   : Float;         // Amount in the selected currency
    currency     : Text;          // "USD" or "PKR"
    createdAt    : Int;
    updatedAt    : Int;
    status       : DepositStatus;
    adminNotes   : Text;
  };
};

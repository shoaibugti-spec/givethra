import Common "common";

module {
  /// All notification event types
  public type NotificationType = {
    #CaseApproved;
    #CaseRejected;
    #CaseCompleted;
    #VerificationUpdate;
    #ProudHeartReceived;
    #UnlockPurchased;
    #SupportSubmitted;
    #NewMessage;
    #CreditsAdded;
    #KycApproved;
    #KycRejected;
    #KycPending;
    #SupportReceived;
    #SystemAnnouncement;
  };

  /// A notification record (stored in actor state)
  public type Notification = {
    id              : Nat;
    userId          : Common.UserId;          // recipient
    notifType       : NotificationType;
    title           : Text;
    message         : Text;
    relatedCaseId   : ?Nat;
    relatedUserId   : ?Common.UserId;
    var isRead      : Bool;
    createdAt       : Common.Timestamp;
  };

  /// Shared (API-boundary) notification — no var fields
  public type NotificationPublic = {
    id              : Nat;
    userId          : Common.UserId;
    notifType       : NotificationType;
    title           : Text;
    message         : Text;
    relatedCaseId   : ?Nat;
    relatedUserId   : ?Common.UserId;
    isRead          : Bool;
    createdAt       : Common.Timestamp;
  };
};

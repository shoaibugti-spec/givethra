import List "mo:core/List";
import Time "mo:core/Time";
import NotifT "../types/notifications";
import Common "../types/common";

module {
  public type NotifState = { var nextNotifId : Nat };

  /// Create a new notification and append it to the list
  public func create(
    notifications : List.List<NotifT.Notification>,
    state         : NotifState,
    userId        : Common.UserId,
    notifType     : NotifT.NotificationType,
    title         : Text,
    message       : Text,
    relatedCaseId : ?Nat,
    relatedUserId : ?Common.UserId,
  ) : NotifT.Notification {
    let notif : NotifT.Notification = {
      id            = state.nextNotifId;
      userId;
      notifType;
      title;
      message;
      relatedCaseId;
      relatedUserId;
      var isRead    = false;
      createdAt     = Time.now();
    };
    state.nextNotifId += 1;
    notifications.add(notif);
    notif;
  };

  /// Convert internal notification to public (shared) form
  public func toPublic(n : NotifT.Notification) : NotifT.NotificationPublic {
    {
      id            = n.id;
      userId        = n.userId;
      notifType     = n.notifType;
      title         = n.title;
      message       = n.message;
      relatedCaseId = n.relatedCaseId;
      relatedUserId = n.relatedUserId;
      isRead        = n.isRead;
      createdAt     = n.createdAt;
    };
  };

  /// Get all notifications for a user, ordered newest first
  public func getForUser(
    notifications : List.List<NotifT.Notification>,
    userId        : Common.UserId,
  ) : [NotifT.NotificationPublic] {
    // collect matching notifications newest-first
    let result = List.empty<NotifT.NotificationPublic>();
    let arr = notifications.toArray();
    var i = arr.size();
    while (i > 0) {
      i -= 1;
      let n = arr[i];
      if (n.userId == userId) {
        result.add(toPublic(n));
      };
    };
    result.toArray();
  };

  /// Mark a single notification as read; returns true if found
  public func markAsRead(
    notifications : List.List<NotifT.Notification>,
    notifId       : Nat,
    userId        : Common.UserId,
  ) : Bool {
    switch (notifications.find(func(n) { n.id == notifId and n.userId == userId })) {
      case null false;
      case (?n) {
        n.isRead := true;
        true;
      };
    };
  };

  /// Remove a notification (owned by userId); returns true if found
  public func dismiss(
    notifications : List.List<NotifT.Notification>,
    notifId       : Nat,
    userId        : Common.UserId,
  ) : Bool {
    let sizeBefore = notifications.size();
    notifications.retain(func(n) { not (n.id == notifId and n.userId == userId) });
    notifications.size() < sizeBefore;
  };

  /// Count unread notifications for a user
  public func countUnread(
    notifications : List.List<NotifT.Notification>,
    userId        : Common.UserId,
  ) : Nat {
    var count = 0;
    for (n in notifications.values()) {
      if (n.userId == userId and not n.isRead) {
        count += 1;
      };
    };
    count;
  };
};

import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import NotifT "../types/notifications";
import NotifLib "../lib/notifications";

mixin (
  accessControlState : AccessControl.AccessControlState,
  notifications      : List.List<NotifT.Notification>,
  notifState         : NotifLib.NotifState,
) {

  /// Get all notifications for the calling user (newest first)
  public query ({ caller }) func getMyNotifications() : async [NotifT.NotificationPublic] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    NotifLib.getForUser(notifications, caller.toText());
  };

  /// Mark a notification as read
  public shared ({ caller }) func markNotificationAsRead(notifId : Nat) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    NotifLib.markAsRead(notifications, notifId, caller.toText());
  };

  /// Dismiss (delete) a notification
  public shared ({ caller }) func dismissNotification(notifId : Nat) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    NotifLib.dismiss(notifications, notifId, caller.toText());
  };

  /// Get unread notification count for the calling user
  public query ({ caller }) func getUnreadNotificationCount() : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    NotifLib.countUnread(notifications, caller.toText());
  };
};

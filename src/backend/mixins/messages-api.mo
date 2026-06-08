import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import MsgT "../types/messages";
import MsgLib "../lib/messages";

mixin (
  accessControlState : AccessControl.AccessControlState,
  messages           : List.List<MsgT.Message>,
  conversations      : List.List<MsgT.Conversation>,
  msgState           : MsgLib.MsgState,
) {

  /// Get all conversations for the calling user (sorted newest first)
  public query ({ caller }) func getMyConversations() : async [MsgT.ConversationPublic] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    MsgLib.getConversationsForUser(conversations, messages, caller);
  };

  /// Get all messages in a conversation (caller must be a participant)
  public shared ({ caller }) func getConversationMessages(conversationId : Nat) : async [MsgT.MessagePublic] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    MsgLib.getMessages(messages, conversationId, caller);
  };

  /// Send a message to another user (optionally tied to a case)
  public shared ({ caller }) func sendMessage(
    receiverId : Common.UserId,
    caseId     : ?Nat,
    content    : Text,
  ) : async MsgT.MessagePublic {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    MsgLib.send(messages, conversations, msgState, caller, receiverId, caseId, content);
  };

  /// Get total unread message count for the calling user
  public query ({ caller }) func getUnreadMessageCount() : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    MsgLib.countUnread(messages, caller);
  };
};

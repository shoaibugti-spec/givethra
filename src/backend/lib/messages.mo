import List "mo:core/List";
import MsgT "../types/messages";
import Common "../types/common";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Time "mo:core/Time";

module {
  public type MsgState = { var nextMessageId : Nat; var nextConversationId : Nat };

  /// Find or create a conversation between two users for an optional case
  public func getOrCreateConversation(
    conversations  : List.List<MsgT.Conversation>,
    state          : MsgState,
    participantA   : Common.UserId,
    participantB   : Common.UserId,
    caseId         : ?Nat,
  ) : MsgT.Conversation {
    // look for an existing conversation between these two participants for the same case
    let existing = conversations.find(func(c) {
      let hasA = c.participantIds.size() == 2 and
        (c.participantIds[0] == participantA or c.participantIds[1] == participantA);
      let hasB = c.participantIds.size() == 2 and
        (c.participantIds[0] == participantB or c.participantIds[1] == participantB);
      let sameCase = c.caseId == caseId;
      hasA and hasB and sameCase;
    });
    switch (existing) {
      case (?conv) conv;
      case null {
        let conv : MsgT.Conversation = {
          id                    = state.nextConversationId;
          participantIds        = [participantA, participantB];
          caseId;
          var lastMessageContent = null;
          var lastMessageAt      = null;
          var unreadCount        = 0;
        };
        state.nextConversationId += 1;
        conversations.add(conv);
        conv;
      };
    };
  };

  /// Send a message within a conversation
  public func send(
    messages       : List.List<MsgT.Message>,
    conversations  : List.List<MsgT.Conversation>,
    state          : MsgState,
    senderId       : Common.UserId,
    receiverId     : Common.UserId,
    caseId         : ?Nat,
    content        : Text,
  ) : MsgT.MessagePublic {
    let conv = getOrCreateConversation(conversations, state, senderId, receiverId, caseId);
    let msg : MsgT.Message = {
      id             = state.nextMessageId;
      conversationId = conv.id;
      senderId;
      receiverId;
      caseId;
      content;
      var isRead     = false;
      createdAt      = Time.now();
    };
    state.nextMessageId += 1;
    messages.add(msg);
    // update conversation metadata
    conv.lastMessageContent := ?content;
    conv.lastMessageAt      := ?msg.createdAt;
    conv.unreadCount        += 1;
    msgToPublic(msg);
  };

  /// Convert internal message to public form
  public func msgToPublic(m : MsgT.Message) : MsgT.MessagePublic {
    {
      id             = m.id;
      conversationId = m.conversationId;
      senderId       = m.senderId;
      receiverId     = m.receiverId;
      caseId         = m.caseId;
      content        = m.content;
      isRead         = m.isRead;
      createdAt      = m.createdAt;
    };
  };

  /// Convert internal conversation to public form (unreadCount relative to viewer)
  public func convToPublic(
    conv     : MsgT.Conversation,
    viewer   : Common.UserId,
    messages : List.List<MsgT.Message>,
  ) : MsgT.ConversationPublic {
    // count unread messages addressed to the viewer in this conversation
    var unread = 0;
    for (m in messages.values()) {
      if (m.conversationId == conv.id and m.receiverId == viewer and not m.isRead) {
        unread += 1;
      };
    };
    {
      id                 = conv.id;
      participantIds     = conv.participantIds;
      caseId             = conv.caseId;
      lastMessageContent = conv.lastMessageContent;
      lastMessageAt      = conv.lastMessageAt;
      unreadCount        = unread;
    };
  };

  /// Get all conversations for a participant, sorted by lastMessageAt desc
  public func getConversationsForUser(
    conversations : List.List<MsgT.Conversation>,
    messages      : List.List<MsgT.Message>,
    userId        : Common.UserId,
  ) : [MsgT.ConversationPublic] {
    let result = List.empty<MsgT.ConversationPublic>();
    for (c in conversations.values()) {
      if (c.participantIds.size() == 2 and
          (c.participantIds[0] == userId or c.participantIds[1] == userId)) {
        result.add(convToPublic(c, userId, messages));
      };
    };
    // sort newest-first by lastMessageAt
    let arr = result.toArray();
    arr.sort<MsgT.ConversationPublic>(func(a, b) {
      let ta = switch (a.lastMessageAt) { case (?t) t; case null 0 };
      let tb = switch (b.lastMessageAt) { case (?t) t; case null 0 };
      Int.compare(tb, ta);
    });
  };

  /// Get all messages in a conversation (caller must be a participant)
  public func getMessages(
    messages       : List.List<MsgT.Message>,
    conversationId : Nat,
    userId         : Common.UserId,
  ) : [MsgT.MessagePublic] {
    let result = List.empty<MsgT.MessagePublic>();
    for (m in messages.values()) {
      if (m.conversationId == conversationId) {
        if (m.receiverId == userId and not m.isRead) {
          m.isRead := true;
        };
        result.add(msgToPublic(m));
      };
    };
    result.toArray();
  };

  /// Count unread messages for a user across all conversations
  public func countUnread(
    messages : List.List<MsgT.Message>,
    userId   : Common.UserId,
  ) : Nat {
    var count = 0;
    for (m in messages.values()) {
      if (m.receiverId == userId and not m.isRead) {
        count += 1;
      };
    };
    count;
  };
};

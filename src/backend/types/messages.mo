import Common "common";

module {
  /// A single chat message between a Hero and a Help Seeker
  public type Message = {
    id             : Nat;
    conversationId : Nat;
    senderId       : Common.UserId;
    receiverId     : Common.UserId;
    caseId         : ?Nat;
    content        : Text;
    var isRead     : Bool;
    createdAt      : Common.Timestamp;
  };

  /// Shared (API-boundary) message — no var fields
  public type MessagePublic = {
    id             : Nat;
    conversationId : Nat;
    senderId       : Common.UserId;
    receiverId     : Common.UserId;
    caseId         : ?Nat;
    content        : Text;
    isRead         : Bool;
    createdAt      : Common.Timestamp;
  };

  /// A conversation between two participants, optionally tied to a case
  public type Conversation = {
    id                  : Nat;
    participantIds      : [Common.UserId];     // always 2 participants
    caseId              : ?Nat;
    var lastMessageContent : ?Text;
    var lastMessageAt   : ?Common.Timestamp;
    var unreadCount     : Nat;                // unread for the viewing user (computed on read)
  };

  /// Shared (API-boundary) conversation — no var fields
  public type ConversationPublic = {
    id                  : Nat;
    participantIds      : [Common.UserId];
    caseId              : ?Nat;
    lastMessageContent  : ?Text;
    lastMessageAt       : ?Common.Timestamp;
    unreadCount         : Nat;
  };
};

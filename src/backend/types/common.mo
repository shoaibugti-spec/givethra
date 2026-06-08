import Time "mo:core/Time";

module {
  /// Platform-wide principal alias
  public type UserId = Principal;

  /// Nanosecond timestamp (Time.now() returns Int)
  public type Timestamp = Int;

  /// ISO-3166 country code or free-text country name
  public type Country = Text;

  /// City name
  public type City = Text;

  /// USD cents (e.g. 100 = $1.00)
  public type USDCents = Nat;

  /// Platform roles
  public type Role = {
    #Hero;
    #HelpSeeker;
    #Admin;
  };

  /// Generic status variants used across domains
  public type ReviewStatus = {
    #Submitted;
    #UnderReview;
    #Approved;
    #Completed;
    #Rejected;
  };

  /// Object-storage file reference (from extension-object-storage)
  public type FileRef = {
    storageId : Text;   // object-storage key / asset id
    fileName  : Text;
    mimeType  : Text;
  };

  /// Pagination cursor
  public type PageRequest = {
    offset : Nat;
    limit  : Nat;
  };
};

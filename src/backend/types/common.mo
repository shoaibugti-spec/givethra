module {
  import Principal "mo:base/Principal";
  public type UserId = Principal; 
  public type Timestamp = Int;
  public type Country = Text;
  public type City = Text;
  public type USDCents = Nat;
  public type Role = { #Hero; #HelpSeeker; #Admin; #SuperAdmin; };
  public type ReviewStatus = { #Submitted; #UnderReview; #Approved; #Completed; #Rejected; };
  public type FileRef = { storageId : Text; fileName : Text; mimeType : Text; };
  public type PageRequest = { offset : Nat; limit : Nat; };
};

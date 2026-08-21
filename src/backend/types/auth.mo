module {
  /// Authentication method variants
  public type AuthMethod = {
    #google;
    #phone;
    #email;
  };

  /// Profile update payload for the new auth system
  public type ProfileUpdate = {
    fullName          : ?Text;
    country           : ?Text;
    city              : ?Text;
    bio               : ?Text;
    preferredLanguage : ?Text;
    timezone          : ?Text;
  };

  /// Result type re-export friendly names
  public type AuthResult<T> = {
    #ok  : T;
    #err : Text;
  };

  /// KYC submission payload — exact schema as specified
  public type KycSubmission = {
    documentType    : { #nationalId; #passport };
    documentFileUrl : Text;    // object-storage reference URL for the document
    liveVideoUrl    : Text;    // object-storage reference URL for the live video recording
    status          : { #pending; #approved; #rejected };
    submittedAt     : Int;     // nanosecond timestamp
    userId          : Text;
  };
};

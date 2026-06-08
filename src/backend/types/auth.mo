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
};

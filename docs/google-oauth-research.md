# Google Identity Services implementation notes

Givethra will use the browser Google Identity Services button to obtain an ID-token credential and will send that credential to the server only over HTTPS. The server must validate the token’s signature using Google’s published keys and validate its audience against the configured Google Web client ID before creating an application session.

The direct ID-token flow does not require storing a Google client secret in this application. The approved email and stable Google subject identifier will become the identity inputs used for the Givethra user record and owner-only role enforcement.

Sources:

- https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
- https://developers.google.com/identity/gsi/web/reference/js-reference
- https://developers.google.com/identity/protocols/oauth2

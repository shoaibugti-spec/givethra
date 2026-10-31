export default {
  async fetch(request, env, ctx) {
    const response = await fetch(request);
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("X-Frame-Options", "SAMEORIGIN");
    newResponse.headers.set("X-Content-Type-Options", "nosniff");
    newResponse.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    newResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    // KYC and Help Me use the device camera and microphone from the same-origin site.
    // Blocking them here makes getUserMedia fail even after the user taps Allow.
    newResponse.headers.set("Permissions-Policy", "geolocation=(), camera=(self), microphone=(self)");
    // CHANGED for Help Me: media-src lets the app play videos from this same domain and preview a
    // fresh recording (blob:); img-src gets blob: for the payment-screenshot preview.
    newResponse.headers.set("Content-Security-Policy", "default-src 'self'; img-src 'self' data: blob: https:; media-src 'self' blob:; script-src 'self' https://accounts.google.com https://translate.google.com; style-src 'self' 'unsafe-inline' https://accounts.google.com; frame-src https://accounts.google.com; connect-src 'self' https://accounts.google.com");
    newResponse.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    newResponse.headers.set("Cross-Origin-Resource-Policy", "same-origin");
    return newResponse;
  }
}

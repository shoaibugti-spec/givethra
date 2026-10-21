export default {
  async fetch(request, env, ctx) {
    const response = await fetch(request);
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("X-Frame-Options", "SAMEORIGIN");
    newResponse.headers.set("X-Content-Type-Options", "nosniff");
    newResponse.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    newResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    // KYC uses the device camera and recorder from the same-origin site.
    // Blocking camera here makes getUserMedia fail even after the user taps
    // Allow in the browser prompt.
    newResponse.headers.set("Permissions-Policy", "geolocation=(), camera=(self), microphone=(self)");
    newResponse.headers.set("Content-Security-Policy", "default-src 'self'; img-src 'self' data: https:; script-src 'self' https://accounts.google.com https://translate.google.com; style-src 'self' 'unsafe-inline' https://accounts.google.com; frame-src https://accounts.google.com; connect-src 'self' https://accounts.google.com");
    newResponse.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    newResponse.headers.set("Cross-Origin-Resource-Policy", "same-origin");
    return newResponse;
  }
}

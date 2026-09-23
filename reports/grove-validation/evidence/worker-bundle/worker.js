// worker.js
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/sponsors/health") {
      return Response.json({ fixture: true, scope: "sponsors", implemented: false }, {
        headers: { "X-Probe-Worker": "sponsors", "Cache-Control": "no-store" }
      });
    }
    const response = await env.ASSETS.fetch(request);
    const result = new Response(response.body, response);
    result.headers.set("X-Probe-Worker", "fallback");
    return result;
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map

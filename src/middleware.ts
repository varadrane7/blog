import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  // Set Link headers on homepage
  if (context.url.pathname === "/" || context.url.pathname === "/index.html") {
    response.headers.set(
      "Link",
      '</.well-known/api-catalog>; rel="api-catalog", </about>; rel="service-doc"'
    );
  }

  return response;
});

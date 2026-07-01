# auth.md - Agent Registration Instructions

This page outlines the registration and authentication process for AI agents interacting with our APIs.

## Authentication Overview

AI agents can programmatically authenticate to access protected endpoints. We support OAuth 2.0 authorization server metadata discovery.

## Metadata Discovery

- **Protected Resource Metadata**: [/.well-known/oauth-protected-resource](file:///.well-known/oauth-protected-resource)
- **OAuth Authorization Server**: [/.well-known/oauth-authorization-server](file:///.well-known/oauth-authorization-server)
- **OIDC Configuration**: [/.well-known/openid-configuration](file:///.well-known/openid-configuration)

## Registration Endpoint

Agents can register at:
- `POST https://blog.varadrane.com/oauth/register`

### Identity Types Supported
- `anonymous`: Register anonymous agents and receive credentials.
- `identity_assertion`: Using assertion types `urn:ietf:params:oauth:token-type:id-jag` or `verified_email`.

### Credentials Issued
- `api_key`: API token passed in the `Authorization` header as `Bearer <token>`.

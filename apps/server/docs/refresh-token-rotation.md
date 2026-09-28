# Refresh token rotation

## Plan and scope

1. Store refresh state per login session, instead of the single legacy
   `session_userprofile.refresh_token` value. Distinguish access and refresh JWTs.
2. Route explicit refresh requests and header/cookie automatic refresh through
   the same verification and rotation code. Revoke the presented sessions on
   server logout.
3. Cover the HTTP contract, token replay, retries, separate devices and actual
   MySQL concurrency, and run these checks in CI.

This change targets `dev` independently of PR #377. It includes the same 401
behavior for invalid/expired refresh credentials without requiring that PR's
commit. The changes overlap in `AuthService.tokenRefresh`; if #377 merges
first, keep the session-aware implementation when resolving that overlap.

The request `{ "token": "..." }`, response `{ "accessToken": "...",
"refreshToken": "..." }`, cookie names and SSO deep links remain compatible.
There is no required app or web release for rotation itself.

## Session and replay behavior

- A successful SSO login creates a random session ID belonging to that user.
  Separate logins, including devices logged in simultaneously, get separate rows.
- JWTs contain `tokenUse`, `sessionId`, `version`, `sid`, `iat` and `exp` and use
  HS256. An access token cannot refresh a session, and a refresh token cannot be
  used as an access token.
- Refresh locks one session row with `SELECT ... FOR UPDATE`, checks its owner,
  expiry and revocation state, and increments its version. Both tokens are
  reissued; refresh expiry slides by `REFRESH_EXPIRES_IN` as before.
- For **60 seconds after rotation**, the current and immediately previous
  generation return the same token pair. Neither request extends the window nor
  issues a further generation. This handles concurrent requests and a lost
  response retried within the window, including requests to different servers.
- Outside that window, a previously issued, still cryptographically valid token
  revokes that login session and returns 401. Earlier generations are rejected
  even during the window. Other login sessions remain valid.
- The retry window deliberately permits reuse of the immediately previous token
  for at most 60 seconds. An attacker replaying within it is indistinguishable
  from a legitimate retry. A delayed retry after the window requires login again;
  the server does not extend the window indefinitely.
- `/session/logout` revokes the sessions identified by signed request tokens and
  clears cookies, even if access has expired. It does not rotate tokens first.
  Existing access tokens remain valid until their short expiry; revocation
  prevents further refresh. The native app currently only deletes local tokens
  on logout, so server revocation on **app logout** needs a separate client change.
- The legacy `refresh_token` column remains for schema compatibility but is no
  longer an authentication credential. New local sessions issued from the
  existing OneApp integration also use the session table. External OneApp JWT
  issuance and revocation remain the external provider's responsibility.
- Malformed/expired/revoked credentials return 401; malformed request bodies
  return 400; database failures stay 500. Public refresh/logout routes never
  trigger an additional automatic refresh in a guard.

## Deployment

1. Apply `20260928000000_add_auth_sessions` before starting the new server, and
   regenerate the Prisma client. The migration only adds a table and relation.
2. `JWT_SECRET` must be configured and both token lifetimes must exceed the
   60-second retry window. Existing example values (1800 and 2592000 seconds)
   meet this requirement. All instances must share the same JWT configuration.
3. Cut traffic over to the new version together. Do not mix old servers that
   accept stateless refresh tokens with servers enforcing rotation.
4. Existing tokens lack a trustworthy purpose and session ID. They are rejected
   rather than silently upgraded: **existing users must log in once again**.
   No signing-key or client API change is required.

Rolling back to the old implementation re-enables stateless token reuse. If a
rollback is necessary, stop mixed-version traffic and rotate the local JWT key
to invalidate tokens issued before rollback; this also requires login again.
Keep the additive table until the rollout is settled.

Expired rows can be removed by normal database maintenance using the expiry
index (`DELETE FROM session_auth_session WHERE expires_at < UTC_TIMESTAMP()`).
Do not delete live rows to bypass replay detection.

## Verification

Use Node 20 and install the existing dependencies. `yarn test:auth` runs the
HTTP/service checks without external services. The repository integration tests
are opt-in and require a disposable local MySQL database ending in `_test`.

For example, after creating a disposable database on port 43307:

```sh
export DATABASE_URL='mysql://root:auth-test-only@127.0.0.1:43307/otl_auth_test'
export SHADOW_DATABASE_URL='mysql://root:auth-test-only@127.0.0.1:43307/otl_auth_shadow'
export AUTH_SESSION_TEST_DATABASE_URL="$DATABASE_URL"
yarn prisma db push --schema libs/prisma-client/src/schema.prisma
yarn test:auth
yarn build:all
yarn lint:check
```

CI provisions MySQL 8.0.36 and runs both suites. The database tests check eight
simultaneous refreshes, fixed-window retries, committed replay revocation,
independent logins, invalid ownership, expiry and a logout/refresh race.
The HTTP tests exercise real JWT signing, guards, DTO validation, cookies and
the application's exception filters, with database access replaced in memory.

# Contact delivery and replaceable assets

Phase 5 prepares delivery to **darshpatel060106@gmail.com** using Resend through
`api/contact.ts`, a server-side Vercel Node function. **Real email delivery is not
enabled or verified.** The Resend credentials, authenticated sender/domain,
deployment origin and durable rate-limit storage still need configuration.
No accounts, domain purchases, DNS changes or real delivery tests were performed.

The letter and live receipt are usable as a draft while delivery is disconnected.
The submit button stays disabled; the real Gmail link remains available. Tests
simulate delivery through browser interception and injected server dependencies;
there is no fake-success switch in the application.

## Server-only configuration

Set these in the appropriate Vercel project's environment settings before a
deliberate preview-host delivery check. `.env.example` contains blank/local
defaults. Never use `VITE_*` for credentials, commit `.env.local`, or paste keys
into chat. The browser receives only availability, validation/status codes and a
confirmed receipt; secrets and recipient routing are read by server code.

| Setting                        | Value/purpose                                                                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `CONTACT_ENABLED`              | Keep `false` while configuring. Set `true` only when the following settings are ready.                                                                                   |
| `RESEND_API_KEY`               | A server-side Resend key authorized to send email.                                                                                                                       |
| `CONTACT_FROM`                 | A bare email address on your verified sending domain, such as `portfolio@your-owned-domain`; no display name. Do not use a visitor's address or your Gmail address here. |
| `CONTACT_TO`                   | `darshpatel060106@gmail.com`. The server controls this recipient; form input cannot change it.                                                                           |
| `CONTACT_ALLOWED_ORIGINS`      | Comma-separated exact trusted HTTPS origins, including scheme and with no paths or trailing slash. Add a specific preview origin when testing; avoid wildcards.          |
| `UPSTASH_REDIS_REST_URL`       | HTTPS REST endpoint for a dedicated Upstash Redis database.                                                                                                              |
| `UPSTASH_REDIS_REST_TOKEN`     | Server-only Redis token authorized for the limiter's `EVAL`, `GET`, `INCR`, `TTL` and `EXPIRE` commands.                                                                 |
| `CONTACT_HASH_SECRET`          | A stable, randomly generated secret of at least 32 characters. Hashes rate-limit identifiers and provider idempotency keys. Keep it out of browser configuration.        |
| `CONTACT_ALLOW_LOCAL_DELIVERY` | Defaults to `false`. Used only by the local dev/preview bridge; production ignores it.                                                                                   |

Verify the sending domain using [Resend's domain setup](https://resend.com/docs/dashboard/domains/introduction).
The configurable sender is formatted as `Darsh Patel Portfolio <CONTACT_FROM>`;
the visitor's validated email becomes `reply_to`. The provider request uses
plain text, so visitor markup is never rendered as email HTML. See the
[Resend send API](https://resend.com/docs/api-reference/emails/send-email).

Upstash is prepared as the durable rate limiter; no database is provisioned yet.
It uses one atomic Lua operation through the
[Redis REST API](https://upstash.com/docs/redis/features/restapi), so concurrent
Vercel invocations share counters. Limits are five valid attempts per IP per
15 minutes, three per email per 15 minutes, and 100 globally per 24-hour window.
Windows start with the first attempt, and failures/retries count as attempts.
IP/email keys are HMAC digests with bounded expiry; Redis stores counters only,
without raw addresses, names, IPs or messages. The application does not log
those values or provider error bodies. Resend necessarily processes the letter;
review its account retention settings before publication.

Production POST requests require an allowlisted Origin, JSON, a valid UUID
submission token, an empty honeypot, valid bounded fields and a trusted client IP.
The adapter trusts `x-vercel-forwarded-for` only inside the Vercel runtime; it
does not accept ordinary client `x-forwarded-for` as an identity. See
[Vercel's request header documentation](https://vercel.com/docs/headers/request-headers).
The API fails closed if configuration, rate storage or trusted IP is missing.
The status GET is advisory configuration availability, not a delivery-health test.

## Verification before enabling public submission

1. Configure the sender/domain, server variables and rate-limit database on the
   intended Vercel preview. Rebuild/redeploy after environment changes. The
   repository's static build and `api/contact.ts` are both required; uploading
   `dist` alone to a static host will not provide email delivery.
2. Check `/api/contact` returns `{"enabled":true}` only after configuration.
   Submit one deliberate, identifiable test letter from the real UI. Confirm
   its arrival in the configured Gmail inbox, readable plain-text content,
   correct authenticated From and working Reply-To to the visitor address.
3. Confirm the receipt stays unconfirmed during sending, then shows the actual
   provider reference and server confirmation time only after acceptance. SENT
   means **accepted for delivery**, not proof of inbox delivery. Bounce/delivery
   tracking and webhook processing are outside this phase.
4. Confirm invalid fields/honeypot/origin are rejected and the rate limiter rejects
   excess attempts with HTTP 429. Simulate a provider failure in an isolated
   test environment: no SENT stamp, draft preserved, retry available. Restore
   provider configuration before publication; avoid intentionally flooding Resend.
5. Test the deployed function's runtime, header behavior and preview routing.
   Automated local checks do not certify Vercel deployment or actual Gmail receipt.

Retries keep the same token for an unchanged letter during the current page
session. The server binds it to the normalized payload using a HMAC and sends a
Resend idempotency key. [Resend retains these keys for 24 hours](https://resend.com/docs/dashboard/emails/idempotency-keys).
Edits or a new letter use a different key. Drafts are held only in React memory;
refreshing/navigating away can discard them, and retries after the provider's
retention window can send another email. There is no cross-session delivery log.

## Local preview

`npm run dev` and `npm run preview` expose the same `/api/contact` path. Both
report unavailable and reject sending by default, even if production credentials
are present. Automated tests never enable real local delivery. A deliberate local
test requires `CONTACT_ALLOW_LOCAL_DELIVERY=true`, `CONTACT_ENABLED=true`, all
server settings and the exact loopback origin in the allowlist; restart the
server after changing them. Return the local opt-in to `false` afterward.

## Portrait and resume

- `public/images/profile.webp` is a neutral **DP / Portrait Pending** placeholder,
  not a generated face. Replace it with the approved portrait using the same
  path; then set `site.portrait.placeholder` to `false` in `src/content/site.ts`
  to update its accessible description. Component code does not change.
  Dimensions are 680 × 850 (4:5); the ProfileCard crops to fit and retains its
  monogram fallback if the request fails. The source SVG and a build-only
  regeneration script live in `scripts/profile-placeholder.svg` and
  `scripts/generate-profile-placeholder.mjs`.
- Add only the reviewed resume at
  `public/resume/Darsh_Patel_Resume.pdf` by default. To keep another approved filename,
  set `VITE_RESUME_PATH` (for example `/resume/Darsh_Patel_Resume_Final.pdf`). No old
  resume or fake PDF is included. The build checks that the configured file exists and starts with a PDF signature;
  hero, footer and command-palette links activate together after a rebuild
  (restart Vite during development). Existence/signature checks do not establish
  that its content is current: the file still needs owner approval. Until then,
  visible pending labels replace download links. No component edits are needed.

Public GitHub, LinkedIn and email links are centralized in `src/content/site.ts`.
Copy Email uses the browser clipboard API, announces success only after the write
succeeds, and leaves a selectable address/mailto link if clipboard access fails.

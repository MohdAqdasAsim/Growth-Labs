# Storage & Security Architecture

This document provides conceptual explanations of the database migration, authentication, security, and cost management systems.

---

## 1. What Changes Are Being Made and Why?

**Migration from In-Memory to Persistent Database:**
- Current system uses Python dictionaries in `memory_store.py` - data lost on restart
- Moving to Neon DB (PostgreSQL) for production reliability and data persistence
- Enables multi-instance deployments, backups, and analytics

**Authentication Overhaul (JWT → Clerk):**
- Replacing custom JWT implementation with Clerk for enterprise-grade auth
- Frontend team already has Clerk configured (code not yet pushed)
- Eliminates token blacklist complexity, adds OAuth providers, improves security

**Adding Repository Pattern:**
- Separating database queries from business logic for cleaner architecture
- Makes testing easier with mock repositories
- Improves code maintainability as database schema evolves

**Caching Layer (Upstash Redis):**
- Reduces database load by caching frequently accessed data (user profiles, subscriptions)
- Serverless Redis with global replication and pay-per-request pricing
- Improves response times for authenticated endpoints

**Rate Limiting & Abuse Prevention:**
- Currently no protection against API abuse or excessive AI calls
- Adding 8-layer defense system to prevent quota exploitation
- Protects profitability by enforcing plan limits

---

## 2. What Packages/Libraries Are Being Added and Why?

**SQLAlchemy 2.0** (ORM + async support):
- Modern Python ORM with async/await support for FastAPI
- Type-safe queries reduce bugs vs raw SQL
- Automatic connection pooling and session management

**Alembic** (database migrations):
- Version control for database schema changes
- Safe rollback mechanism if migrations fail
- Team coordination - everyone applies same schema changes

**Clerk SDK** (authentication):
- Verify JWT tokens issued by Clerk frontend
- Webhook handling for user signup/deletion events
- Session management with auto-refresh tokens

**Upstash Redis SDK** (caching):
- Serverless Redis client with automatic connection pooling
- Global replication for low latency worldwide
- Pay-per-request pricing (no idle costs)

**Celery** (background task queue):
- Offload long-running AI workflows to background workers
- Prevents API timeouts during 6-agent campaign execution
- Redis as message broker

**Sentry** (error monitoring):
- Production error tracking and alerting
- Performance monitoring for slow database queries
- User context attached to errors for debugging

**Prometheus Client** (metrics):
- Track custom metrics (Gemini API calls, campaign completions)
- Integrates with Grafana for dashboards
- Alerts when quotas exceeded or costs spike

**asyncpg** (PostgreSQL driver):
- High-performance async PostgreSQL driver for SQLAlchemy
- Native support for Neon DB connection pooling
- Better performance than psycopg2 for async workloads

---

## 3. What Is Stored in the Database and Why?

**users table** (Clerk integration):
- `clerk_user_id` (primary key from Clerk webhook)
- `email`, `created_at`, `last_login_at`
- Why: Central user record linked to Clerk, supports analytics

**creator_profiles table** (onboarding data):
- Phase 1: `user_name`, `creator_type`, `niche`, `target_audience_niche`
- Phase 2: 11 additional fields (social handles, goals, etc.)
- Why: User answers from onboarding flow, reused in AI prompts

**subscriptions table** (plan management):
- `plan_tier` (free/pro/enterprise), `status` (active/cancelled)
- `billing_cycle`, `stripe_customer_id`, `next_billing_date`
- Why: Enforce quota limits, calculate revenue, handle upgrades/downgrades

**usage_metrics table** (quota tracking):
- `gemini_calls_used`, `gemini_calls_limit` (monthly quota)
- `campaigns_created`, `campaigns_limit`
- `last_reset_at` (monthly reset timestamp)
- Why: Real-time quota enforcement, prevent abuse, cost control

**campaigns table** (campaign state):
- `status` (draft/running/completed), `current_day`, `total_days`
- `onboarding_data_snapshot` (JSONB - frozen at creation)
- `agent_outputs` (JSONB - all 6 agent responses)
- Why: Track campaign progress, support pause/resume, audit AI decisions

**daily_content table** (normalized content):
- Each row = 1 day of content for 1 platform
- `day_number`, `platform`, `post_text`, `hashtags`, `scheduled_time`
- `thumbnail_url` (Appwrite CDN link)
- Why: Efficient queries (fetch Day 5 content), enables analytics, calendar view

**daily_execution table** (execution history):
- `executed_at`, `actual_platform_post_id`, `engagement_metrics`
- Why: Track what was posted when, measure performance, learning loop

**learning_memories table** (strategy optimization):
- Indexed by `goal_type` + `platform` + `niche`
- Stores successful strategies from past campaigns
- Why: Agent 2 uses historical data to improve recommendations

---

## 4. How Does Auth Flow Work Using Clerk + Frontend + Backend?

**User Signup (Frontend → Clerk → Backend):**
1. User signs up via Clerk widget in frontend
2. Clerk creates user account and fires webhook to backend
3. Backend receives `user.created` webhook, creates `users` row with `clerk_user_id`
4. Backend also creates `creator_profiles` (empty) and `subscriptions` (free tier) rows
5. Frontend redirects to onboarding

**Authenticated Requests (Frontend → Backend):**
1. Frontend includes Clerk session token in `Authorization: Bearer <token>` header
2. Backend middleware (`clerk_auth.py`) verifies token using Clerk public keys (JWKS)
3. Middleware extracts `clerk_user_id` from verified token
4. Middleware queries database: `SELECT * FROM users WHERE clerk_user_id = ?`
5. Middleware attaches user object to `request.state.user`
6. Endpoint accesses user via dependency: `current_user: User = Depends(get_current_user)`

**Token Lifecycle:**
- Clerk issues short-lived access tokens (1 hour expiry)
- Frontend auto-refreshes tokens when <5 minutes remain
- Refresh tokens stored in httpOnly cookies (7-day expiry)
- Backend is stateless - no server-side sessions or token storage

**Logout:**
- Frontend calls Clerk's `signOut()` method
- Clerk clears cookies and local storage
- No backend action needed (stateless design)

---

## 5. What Is Upstash Used For and Why?

**1. User Data Caching (80% hit rate target):**
- Cache `creator_profiles`, `subscriptions`, `usage_metrics` for 5 minutes
- Why: These tables queried on every authenticated request via middleware
- Reduces DB load from thousands of queries/hour to hundreds

**2. Rate Limiting (per-endpoint + per-user):**
- Redis counters with TTL: `rate_limit:{user_id}:{endpoint}:{window}`
- Example: `POST /campaigns/execute` limited to 5 requests/hour per user
- Why: Prevents abuse, enforces fair usage across plan tiers

**3. Usage Quota Tracking (real-time):**
- Increment `usage:{user_id}:gemini_calls:{month}` on each AI call
- Check quota before executing agents: `if count >= limit: raise QuotaExceeded`
- Why: Instant quota enforcement without database round-trip

**4. Request Deduplication (idempotency):**
- Store request signature in Redis: `dedup:{user_id}:{campaign_id}:{hash}`
- If key exists with TTL 60s, return cached response (409 Conflict)
- Why: User clicks "Execute Campaign" twice → only 1 AI workflow runs

**5. Gemini Response Caching (cost optimization):**
- Cache Agent 3 forensics results by `{platform}:{competitor_handle}:{date}` for 7 days
- Why: Multiple users analyzing same competitor → reuse data, save $0.0015/call

---

## 6. What API Calls Are Made, How, and Why?

**Gemini API (Google AI - 5-35 calls per campaign):**
- How: Async HTTP POST to `generativelanguage.googleapis.com` with prompt + JSON schema
- Why: Powers all 6 agents (context analysis, strategy, forensics, planning, content, outcome)
- Cost: ~$0.0015 per call (Gemini 1.5 Flash pricing)
- Pattern: Sequential agent execution (each agent's output feeds next agent)

**Pollinations.ai (Image Generation - 1 call per day of content):**
- How: HTTP GET to `gen.pollinations.ai/image/{prompt}?model=flux&width=1280&height=720`
- Why: Generate thumbnails for YouTube/Instagram posts
- Cost: Free (no API key required)
- Pattern: Parallel generation (Celery background tasks for all days at once)

**YouTube Data API (Forensics Agent - 0-5 calls per campaign):**
- How: HTTP GET to `youtube.googleapis.com/v3/videos?id={video_id}&part=snippet,statistics`
- Why: Fetch competitor video titles, views, likes for Agent 3 analysis
- Cost: Free (10,000 quota units/day - 1 video fetch = 1 unit)
- Pattern: Batch requests (up to 5 competitor videos per campaign)

**Twitter API (Forensics Agent - 0-5 calls per campaign):**
- How: HTTP GET to `api.twitter.com/2/tweets?ids={tweet_id}&tweet.fields=public_metrics`
- Why: Fetch competitor tweet engagement metrics for Agent 3
- Cost: $100/month (Basic tier - 10,000 tweets/month)
- Pattern: Single requests (1 per competitor)

**Clerk API (User Management - webhook-driven):**
- How: Backend receives POST webhooks from Clerk when users signup/delete
- Why: Sync user creation/deletion between Clerk and backend database
- Cost: Free (up to 10,000 MAU, then $0.02/user)
- Pattern: Webhook receiver endpoint (`POST /webhooks/clerk`)

**Appwrite API (File Storage - 1 upload per generated image):**
- How: HTTP POST to `appwrite.io/v1/storage/buckets/{bucket}/files` with multipart form
- Why: Store generated thumbnails, get CDN URLs for frontend display
- Cost: Free (2GB storage, 10GB bandwidth/month)
- Pattern: Upload after image generation, return CDN URL to database

---

## 7. What Security Measures Are Implemented and Why?

**1. Clerk Token Verification (authentication layer):**
- Validate JWT signature using Clerk's public JWKS keys
- Check token expiry (`exp` claim) and issuer (`iss` claim)
- Why: Prevents forged tokens, ensures requests are from authenticated users

**2. User Data Isolation (authorization layer):**
- All database queries filtered by `user_id` from authenticated token
- Example: `SELECT * FROM campaigns WHERE user_id = current_user.id`
- Why: User A cannot access User B's campaigns/data

**3. Input Validation (Pydantic models):**
- All API payloads validated against Pydantic schemas before processing
- Example: `creator_type` must be enum value ("YouTuber", "Influencer", "Podcaster")
- Why: Prevents SQL injection, XSS attacks, malformed data

**4. Rate Limiting (abuse prevention):**
- Per-endpoint limits based on plan tier (free: 10 req/min, pro: 50 req/min)
- Sliding window algorithm tracks requests in Redis
- Why: Prevents DDoS, credential stuffing, API scraping

**5. SQL Injection Prevention (parameterized queries):**
- SQLAlchemy ORM uses parameterized queries automatically
- Never construct SQL strings with f-strings or concatenation
- Why: Blocks malicious SQL injection attempts

**6. CORS Configuration (frontend whitelist):**
- Only allow requests from frontend domain (`https://yourdomain.com`)
- Block wildcard origins in production
- Why: Prevents unauthorized websites from calling backend APIs

**7. Error Handling (no sensitive data leakage):**
- Generic error messages to users ("Internal server error")
- Detailed logs sent to Sentry with user context
- Why: Attackers can't extract database schema or API keys from errors

---

## 8. How Do We Prevent API Token Abuse?

**8-Layer Defense System:**

**Layer 1: Hourly Rate Limits (per-endpoint):**
- `POST /campaigns/execute` → 5 requests/hour per user (most expensive endpoint)
- `GET /campaigns` → 100 requests/hour
- Why: Prevents user from spamming AI endpoints repeatedly

**Layer 2: Monthly Quota Enforcement (plan-based):**
- Free: 100 Gemini calls/month (≈5-6 campaigns)
- Pro: 2000 Gemini calls/month (≈100-110 campaigns)
- Why: Hard financial cap on AI costs per user

**Layer 3: Concurrent Request Limits:**
- Max 2 campaign executions running simultaneously per user
- Queue additional requests in Celery with 429 response
- Why: Prevents parallel execution abuse (user spawns 50 campaigns at once)

**Layer 4: Request Deduplication (idempotency keys):**
- Hash request body + timestamp, store in Redis for 60 seconds
- Return 409 Conflict if duplicate detected
- Why: Prevents accidental double-clicks from consuming quota

**Layer 5: Campaign Duration Limits:**
- Max campaign duration: 30 days (prevents 365-day campaigns)
- Max 10 competitors for forensics (each costs 1-2 API calls)
- Why: Caps maximum AI calls per campaign

**Layer 6: Background Job Queues (Celery):**
- Campaign execution runs in background workers, not API process
- Workers respect quota checks before starting agents
- Why: Failed quota checks don't consume API costs

**Layer 7: Cost Alerting (Prometheus + Sentry):**
- Alert when user reaches 80% of monthly quota
- Alert when total daily Gemini costs exceed $50
- Why: Early warning for unusual activity or account sharing

**Layer 8: Manual Review (admin dashboard):**
- Flag accounts with >200% average usage compared to plan tier
- Temporarily suspend accounts with suspicious patterns
- Why: Human oversight for edge cases automation can't catch

---

## 9. How Are Plan Credits Used?

**Quota System (Not Credits):**
- This system uses **monthly quotas** (campaigns created, API calls made), not deductible credits
- Quotas reset on 1st of each month at midnight UTC

**Free Tier (Starter):**
- 3 campaigns/month
- 100 Gemini API calls/month
- Why: Allows testing without payment, typical user creates 2-3 campaigns

**Pro Tier ($29/month):**
- 20 campaigns/month
- 2000 Gemini API calls/month
- Why: Power users creating campaigns weekly, profitable at this price

**Enterprise Tier (Custom Pricing):**
- Unlimited campaigns
- Unlimited Gemini API calls (within reasonable use)
- Why: Large agencies managing 50+ creators

**Usage Tracking:**
- `usage_metrics` table stores `gemini_calls_used` counter
- Incremented after each successful Gemini API call
- Middleware checks: `if user.usage_metrics.gemini_calls_used >= user.subscription.gemini_calls_limit: raise QuotaExceeded()`

**Overages (Future Feature):**
- Currently: Hard stop when quota reached (no additional calls allowed)
- Future: Optional overage pricing ($0.005 per extra Gemini call)

---

## 10. How Are Costs Calculated and Is This Profitable?

**Cost Per Campaign Formula:**
```
Base Calls = 5 (always: Context + Strategy + Planner + Content + Outcome)
Forensics Calls = duration_days (if forensics enabled, 1 call/day)
Competitor Calls = num_competitors × 2 (1 for YouTube API, 1 for Gemini analysis)

Total Gemini Calls = Base Calls + Forensics Calls + Competitor Calls
Cost = Total Gemini Calls × $0.0015
```

**Example Campaign (typical):**
- 7-day campaign, forensics enabled, 3 competitors
- Calls = 5 + 7 + (3 × 2) = 18 Gemini calls
- Cost = 18 × $0.0015 = **$0.027 per campaign**

**Example Campaign (maximum):**
- 30-day campaign, forensics enabled, 10 competitors
- Calls = 5 + 30 + (10 × 2) = 55 Gemini calls
- Cost = 55 × $0.0015 = **$0.0825 per campaign**

**Profitability Analysis (Pro Tier):**
- Revenue: $29/month
- Max usage: 20 campaigns/month at $0.0825 each = $1.65 cost
- Gross profit: $29 - $1.65 = **$27.35/month per pro user**
- Profit margin: 94%

**Other Costs:**
- Neon DB: $25/month (serverless, scales to 0)
- Upstash Redis: ~$5/month (pay-per-request)
- Appwrite: Free tier (2GB storage)
- Clerk: Free tier (<10k MAU)
- YouTube API: Free (10k quota/day)
- Twitter API: $100/month (amortized across all users)
- Pollinations.ai: Free

**Break-Even Analysis:**
- Fixed costs: ~$130/month (DB + Redis + Twitter)
- Need 5 pro subscribers to cover fixed costs
- Every additional pro subscriber = $27 profit

---

## 11. How Do We Re-Use Data to Prevent Unnecessary API Calls?

**Strategy 1: Request Context Middleware (4 queries → 1 query):**
- Problem: Typical endpoint queries user, profile, subscription, usage separately
- Solution: Middleware makes 1 JOIN query, attaches all data to `request.state`
- Savings: 75% reduction in database round-trips

**Strategy 2: Redis Caching (80% hit rate target):**
- Cache user + profile + subscription for 5 minutes after first query
- Cache key: `user_data:{clerk_user_id}`
- Savings: 4 out of 5 requests served from cache (no DB query)

**Strategy 3: Query Result Optimization:**
- Use SQLAlchemy `joinedload()` to fetch relationships in 1 query
- Example: `db.query(User).options(joinedload(User.profile), joinedload(User.subscription))`
- Savings: Prevents N+1 query problem

**Strategy 4: Gemini Response Caching (forensics only):**
- Cache Agent 3 forensics results by `{platform}:{handle}:{date}` for 7 days
- Example: 10 users analyze @MrBeast → 1 API call, 9 cache hits
- Savings: ~$0.0015 per duplicate forensics request avoided

**Strategy 5: Batch Processing (parallel generation):**
- Generate all 7 thumbnail images in parallel (Celery tasks)
- vs sequential: 7 × 3 seconds = 21 seconds vs parallel: ~3 seconds
- Savings: User experience (not cost, Pollinations is free)

**Strategy 6: Lazy Loading (on-demand queries):**
- Don't fetch `daily_content` unless user navigates to calendar view
- Don't fetch `learning_memories` unless Agent 2 runs
- Savings: Avoid unnecessary queries for unused data

---

## 12. How Are Sessions Persisted?

**Frontend Session Management (Clerk handles this):**
- Clerk stores access token in memory (1-hour expiry)
- Refresh token in httpOnly cookie (7-day expiry, auto-rotates)
- Clerk SDK auto-refreshes access token when <5 minutes remain
- User stays logged in for 7 days without re-entering password

**Backend Session Management (stateless):**
- Backend does NOT store sessions (no server-side session store)
- Each request verified independently via Clerk JWT token
- Why: Enables horizontal scaling (no sticky sessions), simpler architecture

**User Data Persistence Between Requests:**
- Middleware fetches user from database on each request
- Caches user data in Redis for 5 minutes to reduce DB load
- Why: Fresh data (subscription changes reflected immediately)

**Long-Running Workflows (Celery tasks):**
- Campaign execution runs in background (5-30 seconds)
- Task ID returned to frontend, frontend polls `GET /campaigns/{id}/status`
- Why: API requests don't timeout during AI processing

**Token Refresh Flow (Clerk auto-handles):**
1. User makes request with access token (45 minutes old, <5 min remaining)
2. Clerk SDK detects approaching expiry
3. Clerk SDK calls Clerk API with refresh token → new access token
4. New access token used for subsequent requests
5. Refresh token rotated (new 7-day expiry)

**Session Termination:**
- User clicks "Logout" → Clerk clears tokens + cookies
- Admin revokes user → Clerk invalidates all tokens immediately
- Token expiry → User redirected to login (Clerk handles this)

---

## 13. What External Dependencies Does This System Have?

**Neon DB (Database - Critical):**
- Serverless PostgreSQL, hosted in AWS regions
- Dependency: All backend operations require database access
- Failure mode: Backend returns 503 Service Unavailable, queue requests in Celery
- Mitigation: Neon has 99.95% SLA, automatic backups, connection pooling

**Clerk (Authentication - Critical):**
- User signup, login, token verification
- Dependency: Cannot authenticate users without Clerk
- Failure mode: Return 503, cached tokens still work (1-hour grace period)
- Mitigation: Clerk has 99.99% SLA, multi-region deployment

**Upstash Redis (Caching - High Priority):**
- User data caching, rate limiting, quota tracking
- Dependency: Performance degrades without cache, rate limits fail open
- Failure mode: Fall back to database queries (slower), disable rate limits temporarily
- Mitigation: Upstash has global replication, automatic failover

**Gemini API (AI - High Priority):**
- All 6 agents depend on Gemini for generation
- Dependency: Cannot execute campaigns without Gemini
- Failure mode: Return 500, queue campaign for retry (Celery), refund quota
- Mitigation: Gemini has 99.9% SLA, implement exponential backoff retries

**Appwrite (File Storage - Medium Priority):**
- Stores generated thumbnail images
- Dependency: Campaigns with images require Appwrite
- Failure mode: Skip image upload, store placeholder URL in database
- Mitigation: Self-hosted Appwrite option, fallback to S3

**Pollinations.ai (Image Generation - Medium Priority):**
- Generates thumbnails for content
- Dependency: Required for YouTube/Instagram campaigns
- Failure mode: Use default placeholder image, log error
- Mitigation: No SLA (free service), consider paid alternative (Midjourney API)

**YouTube Data API (Forensics - Low Priority):**
- Fetch competitor video metrics
- Dependency: Agent 3 forensics for YouTube creators
- Failure mode: Skip forensics, use generic strategy
- Mitigation: Free tier, 10k quota/day (rarely exceeded)

**Twitter API (Forensics - Low Priority):**
- Fetch competitor tweet metrics
- Dependency: Agent 3 forensics for Twitter creators
- Failure mode: Skip forensics, use generic strategy
- Mitigation: $100/month tier, 10k tweets/month

**Celery + Redis (Background Jobs - High Priority):**
- Async campaign execution, image generation
- Dependency: Prevents API timeouts during long workflows
- Failure mode: Synchronous execution (risk timeout), queue for later
- Mitigation: Redis has same uptime as Upstash (shared instance)

**Sentry (Monitoring - Low Priority):**
- Error tracking, performance monitoring
- Dependency: Blind to production errors without Sentry
- Failure mode: Errors not tracked, fix issues reactively
- Mitigation: Fallback to stdout logs, Sentry has 99.9% SLA

**Stripe (Payments - Critical for Revenue):**
- Subscription billing, plan upgrades/downgrades
- Dependency: Cannot charge users without Stripe
- Failure mode: Suspend upgrades, manually process payments
- Mitigation: Stripe has 99.99% SLA, webhook retry logic

---

## Summary

This architecture balances cost efficiency, security, and scalability by:
- Using serverless/pay-per-request services (Neon, Upstash, Clerk)
- Aggressive caching to reduce database load and API costs
- 8-layer abuse prevention to maintain profitability
- Stateless backend for easy horizontal scaling
- Repository pattern for clean separation of concerns
- Comprehensive monitoring to catch issues early

Next steps: Implement SQLAlchemy models, Clerk middleware, and Alembic migrations.

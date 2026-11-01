# Production image for Coolify (Build Pack = Dockerfile).
# Unlike the Railpack builder, a Dockerfile build lets Coolify map the internal
# Postgres hostname into the build step, which `next build` needs (it reads the DB).
FROM node:24-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends libatomic1 curl ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && npm install -g pnpm@10.33.0

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Variables Coolify passes at build time (tick "Available during build" on each).
ARG APP_URL
ARG AUTH_SECRET
ARG DATABASE_URL
ARG SEED_OWNER_EMAIL
ARG SEED_OWNER_NAME
ARG CF_ACCOUNT_ID
ARG R2_ACCESS_KEY_ID
ARG R2_SECRET_ACCESS_KEY
ARG R2_BUCKET_PUBLIC
ARG R2_BUCKET_PRIVATE
ARG NEXT_PUBLIC_MEDIA_URL
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG TURNSTILE_SECRET_KEY
ARG CF_BROWSER_TOKEN
ARG RESEND_API_KEY
ARG EMAIL_FROM
ARG EMAIL_REPLY_TO
ARG RAZORPAY_KEY_ID
ARG RAZORPAY_KEY_SECRET
ARG RAZORPAY_WEBHOOK_SECRET
ARG CRON_SECRET

ENV NEXT_TELEMETRY_DISABLED=1
# migrate -> seed (idempotent) -> next build
RUN pnpm run build

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
EXPOSE 3000

# migrate on start, then serve
CMD ["pnpm", "run", "start"]

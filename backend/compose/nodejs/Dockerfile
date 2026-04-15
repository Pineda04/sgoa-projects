FROM node:25-alpine3.22 AS builder

ARG APP_ENVIRONMENT=production
ARG DATABASE_URL
ENV NODE_ENV=$APP_ENVIRONMENT

WORKDIR /home/app

RUN echo "DATABASE_URL=$DATABASE_URL" > .env

COPY package*.json pnpm*.yaml ./

RUN npm i -g pnpm && pnpm i --frozen-lockfile

COPY . .

RUN pnpm build


# STAGE
FROM node:25-alpine3.22

ARG APP_ENVIRONMENT=production
# ARG DATABASE_URL
ENV NODE_ENV=$APP_ENVIRONMENT
# ENV DATABASE_URL=$DATABASE_URL

WORKDIR /home/app

RUN apk add --no-cache openssl postgresql-client

COPY --from=builder /home/app/package*.json ./
COPY --from=builder /home/app/pnpm-lock.yaml ./
COPY --from=builder /home/app/.env ./
COPY --from=builder /home/app/prisma.config.ts ./
COPY --from=builder /home/app/tsconfig.json ./
COPY --from=builder /home/app/prisma ./prisma
COPY --from=builder /home/app/src ./src
COPY --from=builder /home/app/dist ./dist

RUN npm i -g pnpm && pnpm i --frozen-lockfile --production

RUN pnpm prisma generate

COPY scripts/entrypoint.sh ./
RUN chmod +x entrypoint.sh

USER node

ENTRYPOINT ["./entrypoint.sh"]
CMD ["pnpm", "start:prod"]

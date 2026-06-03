FROM node:22-bookworm-slim AS builder
WORKDIR /app
ARG NEXT_PUBLIC_JUDGE_API_URL=http://patito.localhost/api
ARG NEXT_PUBLIC_JUDGE_WS_URL=ws://patito.localhost/api
ARG NEXT_PUBLIC_VIBE_IDE_CONTEXT_URL=http://patito.localhost/api/vibe/context

ENV NEXT_TELEMETRY_DISABLED=1 \
    VIBE_IDE_BASE_PATH=/ide \
    NEXT_PUBLIC_BASE_PATH=/ide \
    NEXT_PUBLIC_JUDGE_API_URL=${NEXT_PUBLIC_JUDGE_API_URL} \
    NEXT_PUBLIC_JUDGE_WS_URL=${NEXT_PUBLIC_JUDGE_WS_URL} \
    NEXT_PUBLIC_VIBE_IDE_CONTEXT_URL=${NEXT_PUBLIC_VIBE_IDE_CONTEXT_URL}

COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOST=0.0.0.0 \
    VIBE_IDE_BASE_PATH=/ide \
    NEXT_PUBLIC_BASE_PATH=/ide

COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]

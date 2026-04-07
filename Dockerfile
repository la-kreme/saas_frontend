# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Declare VITE_* build arguments so Railway can pass them via --build-arg.
# These must be declared before the RUN build step so they are available
# as environment variables when Vite compiles the bundle.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL
ARG VITE_WIDGET_BASE_URL

# Expose the ARGs as ENV so Vite's import.meta.env picks them up at build time.
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_API_URL=$VITE_API_URL \
    VITE_WIDGET_BASE_URL=$VITE_WIDGET_BASE_URL

# Install dependencies (leverage layer cache when package files are unchanged).
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source and build.
COPY . .
RUN npm run build

# ─── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Install a lightweight static file server.
RUN npm install -g serve@14

# Copy only the compiled output from the builder stage.
COPY --from=builder /app/dist ./dist

EXPOSE 8080

# serve -s: single-page app mode (rewrites all paths to index.html).
# -l 8080: listen on the port Railway expects.
CMD ["serve", "-s", "dist", "-l", "8080"]

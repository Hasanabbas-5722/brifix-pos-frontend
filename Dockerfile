# 1. Use a simple, lightweight Node.js image
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Enable pnpm
RUN corepack enable pnpm

# 4. Copy package.json and lockfile
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# 5. Install dependencies carefully (concurrency 1 saves network and RAM)
RUN pnpm install --frozen-lockfile --network-concurrency 1

# 6. Copy the rest of the application files
COPY . .

# 7. EXTREMELY IMPORTANT FOR 1GB RAM:
#    - Disable telemetry
#    - Restrict Node.js memory to 512MB
#    - Limit Webpack/Turbopack workers so it doesn't spawn child processes that eat RAM
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max_old_space_size=512"
ENV NEXT_WEBPACK_USE_WORKERS=0

# 8. Run the production build
RUN pnpm run build

# 9. Set startup environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 10. Expose the port your app runs on
EXPOSE 3000

# 11. Run the standard Next.js start command
CMD ["pnpm", "start"]

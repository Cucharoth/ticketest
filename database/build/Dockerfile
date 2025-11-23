###################
# DEVELOPMENT (for local builds)
###################
FROM node:22-alpine AS development

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /usr/src/app

# Copy package files
COPY --chown=node:node package*.json ./

# Copy Prisma schema (must be present before running npm ci if postinstall runs prisma generate)
COPY --chown=node:node prisma ./prisma

# Install dependencies including devDependencies
RUN npm ci

# Generate Prisma Client (now that prisma schema exists and node_modules present)
RUN npx prisma generate

# Copy application source (so that postinstall scripts that rely on source are available)
COPY --chown=node:node . .

# Use the node user from the image (instead of the root user)
USER node

###################
# BUILD STAGE
###################
FROM node:22-alpine AS build

WORKDIR /usr/src/app

# Copy package files
COPY --chown=node:node package*.json ./

# Copy node_modules and generated Prisma client from development stage
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
# Copy prisma schema (for runtime or future generation)
COPY --chown=node:node --from=development /usr/src/app/prisma ./prisma

# Copy application source
COPY --chown=node:node . .

# Run prisma generate again to be safe (generates under node_modules/.prisma/client)
RUN npx prisma generate

# Build the application
RUN npm run build

# Set NODE_ENV
ENV NODE_ENV=production

# Remove dev deps if necessary (or run npm ci --only=production)
# If you want to ensure only prod deps remain:
# RUN npm ci --only=production --omit=dev && npm cache clean --force

USER node

###################
# PRODUCTION IMAGE
###################
FROM node:22-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /usr/src/app

# Copy production dependencies and generated prisma client from build stage
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules

# Copy built application
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Copy prisma folder (needed if prisma runtime needs it)
COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma

ENV NODE_ENV=production

USER node

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/main.js"]

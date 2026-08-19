FROM node:24-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .
RUN node scripts/sync-web-vendor.js

# @capacitor/* and typescript are Android-build tooling, never required by server.js.
# They live in "dependencies" (not devDependencies) because the F-Droid reproducible
# build runs `npm ci --omit=dev` and then needs them for `npx cap sync` and for the
# Gradle module path in android/capacitor.settings.gradle -- so they can't simply be
# reclassified. Drop them from the server image instead: it removes ~unused code
# (including node-tar and its advisories) from the deployed artifact and slims the image.
RUN rm -rf node_modules/@capacitor node_modules/typescript

RUN mkdir -p uploads/attachments && chown -R node:node /app
USER node

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/public/stats').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]

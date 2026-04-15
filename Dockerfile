from node:24.13-alpine as builder

arg SERVICE
env SERVICE=${SERVICE}

copy package.json /source/package.json
copy package-lock.json /source/package-lock.json
copy --exclude=**/*.js --exclude=**/*.graphql workspaces /source/workspaces

run cd /source && npm install

copy workspaces /source/workspaces

run cd /source && npm run build --workspace=@pul.se/${SERVICE}

expose 80
cmd cd /source && npm run develop --workspace=@pul.se/${SERVICE}

from node:24.13-alpine

arg SERVICE
env SERVICE=${SERVICE}

copy --from=builder /source/workspaces/@pul.se/${SERVICE}/dist /app

expose 80
cmd cd /app && node index.js

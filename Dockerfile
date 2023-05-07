FROM node:18 as deps
WORKDIR /app/client
COPY package*.json ./
RUN npm install

FROM node:18 as BUILD_IMAGE
WORKDIR /app/client
COPY . .
COPY --from=deps /app/client/node_modules ./node_modules
RUN npm run build
RUN rm -rf node_modules
RUN npm install --omit=dev


FROM node:18 as runner
WORKDIR /app/client
ENV NODE_ENV production
ENV NEXT_PUBLIC_API_URL=http://localhost:3000
ENV SERVER_SIDE_API_URL=http://api:3000


COPY --from=BUILD_IMAGE  /app/client/package.json /app/client/package-lock.json ./
COPY --from=BUILD_IMAGE  /app/client/node_modules ./node_modules
COPY --from=BUILD_IMAGE  /app/client/public ./public
COPY --from=BUILD_IMAGE  /app/client/.next ./.next

EXPOSE 3000

CMD ["npm", "start"]
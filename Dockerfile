FROM node:16-alpine
ENV NODE_ENV production

WORKDIR usr/src/app
COPY server server/
COPY dist dist/

WORKDIR server
RUN npm install

CMD ["node", "./server.mjs"]

ENV PORT=7800
EXPOSE $PORT

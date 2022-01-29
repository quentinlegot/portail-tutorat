FROM node:16-alpine

WORKDIR /portail-tutorat
COPY . .
RUN rm -rf node_modules
RUN npm ci


EXPOSE 8080

CMD ["npm", "run", "start"]
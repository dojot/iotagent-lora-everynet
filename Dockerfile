FROM node:8.14.0-alpine as basis

WORKDIR /opt/iotagent-lora

RUN apk add git python make bash gcc g++ zeromq-dev musl-dev zlib-dev krb5-dev --no-cache
RUN mkdir -p ./src

COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run-script build
RUN chmod +x entrypoint.sh


FROM node:8.14.0-alpine
COPY --from=basis /opt/iotagent-lora /opt/iotagent-lora
WORKDIR /opt/iotagent-lora
EXPOSE 80
ENTRYPOINT ["./entrypoint.sh"]


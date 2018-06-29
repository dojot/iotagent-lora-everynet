FROM node:8
MAINTAINER Giovanni Curiel dos Santos giovannicuriel@gmail.com

WORKDIR /opt

RUN apt-get update --no-install-recommends && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY . /opt/

RUN npm install && npm run build
CMD ["node", "/opt/build/index.js"]

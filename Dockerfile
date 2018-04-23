FROM node:8

WORKDIR /opt

RUN apt-get update --no-install-recommends && apt-get clean && rm -rf /var/lib/apt/lists/*

ADD ./*.json /opt/
ADD . /opt/

RUN npm install && npm run build
CMD ["node", "/opt/build/index.js"]

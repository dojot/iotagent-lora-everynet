iotagent-lora
#############

A basic IoT agent for LoRa networks

The following environment variables should be defined:

- LORA_SERVER: Address where the network server from LoRa network can be
  accessed. This address will be used to send HTTP requests (device creation,
  retrieval and removal) and to open websocket connections. If not defined,
  this will be set to ``localhost:10000``. So remember to set this properly.
- LORA_ACCESS_TOKEN: Access token used to send HTTP requests to the network
  server. If this variable is not set, this IoT agent won't execute. This is
  mandatory and there is no default value.
- RECONN_INTERVAL: Time (in miliseconds) between each reconnection to network
  server in case of failure.

And other environment variables used by iotagent-nodejs:

- DEVM_ADDRESS: Device Manager address. Default value is "device-manager:5000"

- AUTH_ADDRESS: dojot's authentication module address. Default value is
  "auth:5000"

- DATA_BROKER_ADDRESS: dojot's data broker module address. Default value is
  "data-broker:80"

- KAFKA_ADDRESS: Kafka message broker access. Default value is "kafka:9092"


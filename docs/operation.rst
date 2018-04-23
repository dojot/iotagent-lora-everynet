=========
Operation
=========


Configuration
=============

iotagent-lora-everynet configuration is pretty simple. These are the
environment variables used by it (some of them are related to is base-library,
iotagent-nodejs):

- LORA_SERVER: Address where the network server from LoRa network can be
  accessed. This address will be used to send HTTP requests (device creation,
  retrieval and removal) and to open websocket connections. If not defined,
  this will be set to ``localhost:10000``. So remember to set this properly.
- LORA_ACCESS_TOKEN: Access token used to send HTTP requests to the network
  server. If this variable is not set, this IoT agent won't execute. This is
  mandatory and there is no default value.
- RECONN_INTERVAL: Time (in miliseconds) between each reconnection to network
  server in case of failure.
- DEVM_ADDRESS: Device Manager address. Default value is "device-manager:5000"
- AUTH_ADDRESS: dojot's authentication module address. Default value is
  "auth:5000"
- DATA_BROKER_ADDRESS: dojot's data broker module address. Default value is
  "data-broker:80"
- KAFKA_ADDRESS: Kafka message broker access. Default value is "kafka:9092"


Receiving messages from DeviceManager via Kafka
===============================================

Messages containing device operations should be in this format:

.. code-block:: json

    {
      "event": "create",
      "meta": {
        "service": "admin"
      },
      "data": {
        "id": "cafe",
        "attrs" : {

        }
      }
    }

These messages are related to device creation, update, removal and actuation.
For creation and update operations, it contains the device data model
to be added or updated. For removal operation, it will contain only the device
ID being removed. The actuation operation will contain all attributes previously
created with their respective values.

The documentation related to this message can be found in `DeviceManager
Messages`_.


Device configuration for iotagent-mosca
---------------------------------------

The device structure must be compatible with the one defined in `Everynet
documentation`_. The device should have, at least, all the mandatory parameters
set by this model.

In order to create a valid LoRa template via command line, send the following
request to dojot. Note that device substructures were flatten to single
parameters (such as ADR).

.. code-block:: bash

    curl -X POST http://localhost:8000/template -H 'Content-Type:application/json' -H "Authorization: Bearer ${JWT}" -d '
    {
      "label": "EverynetDevice",
      "attrs": [
        {"label": "dev_eui", "type": "static", "value_type": "string", "static_value": "000db5350768354a"},
        {"label": "app_eui", "type": "static", "value_type": "string", "static_value": "00089787ae3829fa"},
        {"label": "app_key", "type": "static", "value_type": "string", "static_value": "0003259897fca98e"},
        {"label": "activation", "type": "static", "value_type": "string", "static_value": "OTAA"},
        {"label": "encryption", "type": "static", "value_type": "string", "static_value": "NS"},
        {"label": "dev_addr", "type": "static", "value_type": "string", "static_value": "098098923"},
        {"label": "nwkskey", "type": "static", "value_type": "string", "static_value": "xyz"},
        {"label": "appskey", "type": "static", "value_type": "string", "static_value": "abc"},
        {"label": "dev_class", "type": "static", "value_type": "string", "static_value": "B"},
        {"label": "adr_datarate", "type": "static", "value_type": "integer", "static_value": "0"},
        {"label": "adr_enabled", "type": "static", "value_type": "boolean", "static_value": "true"},
        {"label": "adr_mode", "type": "static", "value_type": "string", "static_value": "on"},
        {"label": "adr_tx_power", "type": "static", "value_type": "string", "static_value": "100"},
        {"label": "band", "type": "static", "value_type": "string", "static_value": "EU8583"},
        {"label": "block_downlink", "type": "static", "value_type": "boolean", "static_value": "false"},
        {"label": "block_uplink", "type": "static", "value_type": "boolean", "static_value": "false"},
        {"label": "counter_down", "type": "static", "value_type": "integer", "static_value": "100"},
        {"label": "counter_up", "type": "static", "value_type": "integer", "static_value": "250"},
        {"label": "counters_size", "type": "static", "value_type": "integer", "static_value": "4"},
        {"label": "geolocation_lat", "type": "static", "value_type": "integer", "static_value": "27_558"},
        {"label": "geolocation_lng", "type": "static", "value_type": "integer", "static_value": "-40_997"},
        {"label": "geolocation_precision", "type": "static", "value_type": "integer", "static_value": "0_564"},
        {"label": "last_activitiy", "type": "static", "value_type": "integer", "static_value": "1524249893"},
        {"label": "last_join", "type": "static", "value_type": "integer", "static_value": "1524249896"},
        {"label": "rx1_delay", "type": "static", "value_type": "integer", "static_value": "10"},
        {"label": "rx1_status", "type": "static", "value_type": "string", "static_value": "processing"},
        {"label": "rx1_current_delay", "type": "static", "value_type": "integer", "static_value": "10"},
        {"label": "strict_counter", "type": "static", "value_type": "boolean", "static_value": "false"},
        {"label": "rx2_force", "type": "static", "value_type": "boolean", "static_value": "true"},
        {"label": "encrypted_payload", "type": "dynamic", "value_type": "string"}
      ]
    }'

Remember that this is just an example. All attribute values should be changed
to a more properly selected value.


Sending messages to other components via Kafka
===============================================

When iotagent-mosca receives a new message from a particular device, it must
publish the new data to other components. The default subject used to publish
this information is "device-data". Check `data-broker`_ documentation to check
how these subjects are translated into Kafka topics.

The message sent by iotagent-mosca is like this one:

.. code-block:: json

    {
      "metadata": {
        "deviceid": "efac",
        "protocol": "mqtt",
        "payload": "json"
      },
      "attrs": {
      }
    }

As previously stated, the "attrs" attribute is the same as the one from
`DeviceManager Messages`_.

Receiving messages from devices via LoRa
========================================

The messages are sent from network server to iotagent-lora-everynet through
a websocket. Its message format is as follows:

.. code-block:: json

    {
      "params": {
        "payload": "YWEIChAoGB4gKC324gyrMH3354g4jAFCBggBEAIYAw==",
        "port": 2,
        "duplicate": false,
        "radio": {
          "delay": 0.04593086242675781,
          "datarate": 0,
          "modulation": {
            "bandwidth": 125000,
            "type": 0,
            "spreading": 12,
            "coderate": "4/5"
          },
          "hardware": {
            "status": 1,
            "chain": 1,
            "tmst": 84453545,
            "snr": 9.8,
            "rssi": -37.0,
            "channel": 5,
            "gps": {
              "lat": 41.77029037475586,
              "lng": -28.813779830932617,
              "alt": 34.1
            }
          },
          "time": 15174174.5877,
          "freq": 868.1
        },
        "counter_up": 2842,
        "rx_time": 1517415774.518877,
        "encrypted_payload": "c54c3a8488="
      },
      "meta": {
        "network": "xyzs",
        "packet_hash": "71229363s89798ba898q98e0d7416581f532",
        "application": "0000000000010203",
        "device_addr": "123457432",
        "time": 1517414.578324,
        "device": "009798798793292",
        "packet_id": "3b31845cf094379898897989a878de",
        "gateway": "9798892998d8v80001124"
      },
      "type": "uplink"
    }

The payload sent by the device is stored in ``encrypted_payload`` attribute,
which is, as one might think, encrypted.

.. _DeviceManager Concepts: http://dojotdocs.readthedocs.io/projects/DeviceManager/en/latest/concepts.html
.. _DeviceManager Messages: http://dojotdocs.readthedocs.io/projects/DeviceManager/en/latest/kafka-messages.html
.. _dojot documentation: http://dojotdocs.readthedocs.io/en/latest/
.. _JSON patch: http://jsonpatch.com/
.. _JSON pointer: http://jsonpatch.com/#json-pointer
.. _docker-compose: https://github.com/dojot/docker-compose
.. _data-broker: https://github.com/dojot/data-broker
.. _Everynet documentation: https://ns.docs.everynet.io/management/devices.html#/Device/create_device

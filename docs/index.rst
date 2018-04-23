iotagent-lora-everynet
======================

|License badge| |Docker badge| |Travis badge|

IoT agents are responsible for receiving messages from physical devices
(directly or through a gateway) and sending them commands in order to configure
them. This iotagent-lora-everynet, in particular, receives messages via a LoRa
network that are compatible with Everynet network messages.

.. toctree::
   :maxdepth: 2
   :caption: Contents:
   :glob:

   concepts
   operation
   building-documentation


How does it work
================

iotagent-lora-everynet connects to a network server. It then sends HTTP
requests whenever the user creates or removes a device from dojot - its
template should contain all the mandatory parameters for a LoRa device. They
are listed in :doc:`operation` page. It then sends any updates it receives from
the network server to Kafka (which is dojot's core message broker) and then any
component interested in new device data should listen to its topics. Check the
`data-broker`_ documentation for more information about how to subscribe to a
particular topic.


How to build
============

As this is a npm-based project, building it is as simple as

.. code-block:: bash

    npm install
    npm run build


And that's all.

How to run
==========

As simple as:

.. code-block:: bash

    node build/index.js



How do I know if it is working properly?
----------------------------------------

Simply put: you won't. In fact you can implement a simple Kafka publisher to
emulate the behaviour of a device manager instance and a listener to check what
messages it is generating. But it seems easier to get the real components -
they are not that hard to start and to use (given that you use dojot's
`docker-compose`_). Check also `DeviceManager documentation`_ for further
information about how to create a new device.


.. |License badge| image:: https://img.shields.io/badge/license-GPL-blue.svg
   :target: https://opensource.org/licenses/GPL-3.0
.. |Docker badge| image:: https://img.shields.io/docker/pulls/dojot/iotagent-lora-everynet.svg
   :target: https://hub.docker.com/r/dojot/iotagent-lora-everynet/
.. |Travis badge| image:: https://travis-ci.org/dojot/iotagent-lora-everynet.svg?branch=cpqd_master
   :target: https://travis-ci.org/dojot/iotagent-lora-everynet#


.. _docker-compose: https://github.com/dojot/docker-compose
.. _data-broker: https://github.com/dojot/data-broker
.. _iotagent-nodejs: https://github.com/dojot/iotagent-nodejs
.. _DeviceManager documentation: http://dojotdocs.readthedocs.io/projects/DeviceManager/en/latest/

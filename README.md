<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud IoT Core NodeJS end-to-end example

In this example, you'll build a simple but complete IoT system.

The devices in this system publish temperature data on their telemetry feeds,
and a server consumes the telemetry data from a Cloud Pub/Sub topic.

The server then decides whether to turn on or off the individual devices' fans, via a Cloud IoT Core configuration update.

Note that before understand about this sample, you need read:
- [Device Management](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/iot/manager)- Google Cloud IoT Core NodeJS Device Management example
- [End-to-End Example](https://cloud.google.com/iot/docs/samples/end-to-end-sample) - Code example with python
- [My TUT in Vietnamese](http://bloghoangthanh.blogspot.com/2018/02/jwt-voi-node-jsonwebtoken-cua-auth0.html) - Step to Step Understand about Google Cloud IoT Core

## Don't Run - Let's Read

It's not to run but to understand how it works

## Open 2 console window

    Commands:
      node cloudiot_pubsub_example_server.js         Server consumes the telemetry data from a Cloud Pub/Sub topic.
      node cloudiot_pubsub_example_mqtt_device.js    The devices in this system publish temperature data on their telemetry feeds.


## Disclaimer

*This is not an official Google product*.
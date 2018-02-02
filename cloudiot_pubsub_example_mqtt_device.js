const fs = require('fs');
const jwt = require('jsonwebtoken');
const mqtt = require('mqtt');

var sensor = {
    nhietdo: 32
};

var delayMs = 1000;

console.log('Google Cloud IoT Core MQTT example.');
var argv = {
    project_id: 'usertut-165501',
    cloud_region: 'asia-east1',
    registry_id: 'res1',
    device_id: 'node1',
    private_key_file: './rsa_private.pem',
    algorithm: 'RS256',
    num_messages: 2,
    token_exp_mins: 20,
    mqtt_bridge_hostname: 'mqtt.googleapis.com',
    mqtt_bridge_port: 8883,
    message_type: 'events' // state or events
  };
function createJwt (projectId, privateKeyFile, algorithm) {
    const token = {
      'iat': parseInt(Date.now() / 1000),
      'exp': parseInt(Date.now() / 1000) + argv.token_exp_mins * 60,
      'aud': projectId
    };
    const privateKey = fs.readFileSync(privateKeyFile);
    return jwt.sign(token, privateKey, { algorithm: algorithm });
}

function publishAsync () {
    // Publish "payload" to the MQTT topic. qos=1 means at least once delivery.
    // Cloud IoT Core also supports qos=0 for at most once delivery.
    client.publish(mqttTopic, Buffer(JSON.stringify(sensor)), { qos: 1 });
    console.log('--sensor: \r\n',sensor);
    setTimeout(function () {
        publishAsync()
    }, delayMs);
}


function initDevice(cb){
    client.subscribe(`/devices/${argv.device_id}/config`, {qos: 1}, function(err,data){
        if(err){
            console.log('err: ', err);
            //client.end();
            cb(err);
        }
        else{
            cb(null,data);
        }
    })
}
  
// [START iot_mqtt_run]
// The mqttClientId is a unique string that identifies this device. For Google
// Cloud IoT Core, it must be in the format below.
const mqttClientId = `projects/${argv.project_id}/locations/${argv.cloud_region}/registries/${argv.registry_id}/devices/${argv.device_id}`;

const connectionArgs = {
    host: argv.mqtt_bridge_hostname,
    port: argv.mqtt_bridge_port,
    clientId: mqttClientId,
    username: 'unused',
    password: createJwt(argv.project_id, argv.private_key_file, argv.algorithm),
    protocol: 'mqtts',
    keepalive: 15
};

console.log(connectionArgs.clientId);

// Create a client, and connect to the Google MQTT bridge.
const client = mqtt.connect(connectionArgs);

// The MQTT topic that this device will publish data to. The MQTT
// topic name is required to be in the format below. The topic name must end in
// 'state' to publish state and 'events' to publish telemetry. Note that this is
// not the same as the device registry's Cloud Pub/Sub topic.
const mqttTopic = `/devices/${argv.device_id}/${argv.message_type}`;

client.on('connect', () => {
    //console.log('connect', arguments);
    console.log('connect');
    initDevice(function(err,data){
        if(err) console.log(err);
        else{
            console.log('Thong tin dang ky: ', data);
            publishAsync();
        }
    });
});

client.on('close', () => {
    //console.log('close', arguments);
    console.log('close');
});

client.on('error', () => {
    //console.log('error', arguments);
    console.log('error');
});

client.on('packetsend', () => {
    //console.log('packetsend: ', arguments);
    //console.log('packetsend');
});

client.on('message', (_,res)=>{
    //console.log(_);
    const { StringDecoder } = require('string_decoder');
    const decoder = new StringDecoder('utf8');
    // console.log('resBin: ',res);
    // console.log('resText: ',decoder.write(res));
    var thongtin = {};
    try{ thongtin = JSON.parse(decoder.write(res)); }
    catch(_err){;}
    console.log(thongtin);
    if(thongtin['fan_on']){
        sensor.nhietdo--;
    } else{
        sensor.nhietdo++;
    }
})
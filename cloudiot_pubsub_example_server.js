const fs = require('fs');
const google = require('googleapis');

const API_VERSION = 'v1';
const DISCOVERY_API = 'https://cloudiot.googleapis.com/$discovery/rest';

process.env.GCLOUD_PROJECT = 'usertut-165501';
process.env.GOOGLE_CLOUD_PROJECT = 'usertut-165501';
process.env.GOOGLE_APPLICATION_CREDENTIALS = './admin.json';

var serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountJson));
const jwtAccess = new google.auth.JWT();
jwtAccess.fromJSON(serviceAccount);
// Note that if you require additional scopes, they should be specified as a
// string, separated by spaces.
jwtAccess.scopes = 'https://www.googleapis.com/auth/cloud-platform';
// Set the default authentication to the above JWT access.
google.options({ auth: jwtAccess });
//console.log(jwtAccess);

const discoveryUrl = `${DISCOVERY_API}?version=${API_VERSION}`;

google.discoverAPI(discoveryUrl, {}, (err, client) => {
  if (err) {
    console.log('Error during API discovery', err);
    return undefined;
  }
  else{
    // client ready
    const PubSub = require('@google-cloud/pubsub');
    const pubsub = PubSub({
        projectId: 'usertut-165501',
        keyFilename: './admin.json'
    });
    pubsub.getSubscriptions().then(results => {
        const subscriptions = results[0];
    
        console.log('Subscriptions:');
        subscriptions.forEach(subscription => console.log(subscription.name));
    });
    var subscription = pubsub.subscription('sub1');
    var opts = {
        projectId: 'usertut-165501',
        cloudRegion: 'asia-east1',
        registryId: 'res1',
        deviceId: 'node1',
    };
    // Register a listener for `message` events.
    /*subscription.pull({max_requests:10},function(err,data){
        console.log(err);
        console.log(data);
    });*/
    subscription.on('message', function(message) {
        message.ack();
        //message.auto_ack();
        var a = {
            id: message.id,				//ID of the message.
            ackId: message.ackId,		//ID used to acknowledge the message receival
            data: message.data,			//Contents of the message
            attr: message.attributes,	//Attributes of the message
            tim: message.publishTime	//Timestamp when Pub/Sub received the message.
        }
        const { StringDecoder } = require('string_decoder');
        const decoder = new StringDecoder('utf8');
        //console.log(a);
        //console.log(decoder.write(a.data),Date(a.tim)); //asia-east1/res1/dev1-payload-5
        var thongtin = {};
        try{ thongtin = JSON.parse(decoder.write(a.data)); }
        catch(_err){;}
        console.log(thongtin);
        var fan = null;
        if(thongtin.nhietdo<0) fan = false;
        else if(thongtin.nhietdo>10) fan = true;
        if(fan==null) return;
        // _update_device_config
        const request = {
            name: `projects/${opts.projectId}/locations/${opts.cloudRegion}/registries/${opts.registryId}/devices/${opts.deviceId}`,
            resource: {
                versionToUpdate: 0,
                binaryData: Buffer(JSON.stringify({'fan_on': fan})).toString('base64')
            }
        };
        client.projects.locations.registries.devices.modifyCloudToDeviceConfig(request,(err,data)=>{
            if(err){
                console.log(err.message);
            } else{
                console.log('--done modifyCloudToDeviceConfig');
            }
        })
    });
  }
});
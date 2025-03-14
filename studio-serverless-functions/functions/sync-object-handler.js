exports.handler = async function (context, event, callback) {
    console.log('Sync Function triggered with event:', event);

    try {
        // Load Twilio Client
        const client = context.getTwilioClient();

        // Validate required parameters
        const SYNC_SERVICE_SID = context.SYNC_SERVICE_SID;

        if (!SYNC_SERVICE_SID) {
            console.log('Missing required environment variable: SYNC_SERVICE');
            return callback(null, { success: false, error: 'Missing required environment variable: SYNC_SERVICE' });
        }

        const { objectType, objectKey, data, ttl, webhook } = event;
        if (!objectType || !objectKey || !data) {
            console.log('Missing required parameters: serviceSid, objectType, objectKey, or data');
            return callback(null, { success: false, error: 'Missing required parameters: objectType, objectKey, or data' });
        }

        console.log(`Processing Sync ${objectType} operation for key: ${objectKey}`);

        let syncObject;

        if (objectType === 'Map') {
            syncObject = client.sync.services(serviceSid).syncMaps(objectKey).syncMapItems.create({
                key: objectKey,
                data: JSON.parse(data),
                ttl: ttl ? parseInt(ttl, 10) : undefined
            });
        } else if (objectType === 'List') {
            syncObject = client.sync.services(serviceSid).syncLists(objectKey).syncListItems.create({
                data: JSON.parse(data),
                ttl: ttl ? parseInt(ttl, 10) : undefined
            });
        } else if (objectType === 'Document') {
            syncObject = client.sync.services(serviceSid).documents(objectKey).update({
                data: JSON.parse(data),
                ttl: ttl ? parseInt(ttl, 10) : undefined
            });
        } else {
            console.log('Invalid objectType provided:', objectType);
            return callback(null, { success: false, error: 'Invalid objectType. Must be Map, List, or Document' });
        }

        const result = await syncObject;
        console.log('Sync Object operation successful:', result.sid);

        if (webhook) {
            console.log('Triggering webhook:', webhook);
            await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(result) });
        }

        return callback(null, { success: true, data: result });
    } catch (error) {
        console.error('Error processing Sync object:', error);
        return callback(null, { success: false, error: error.message || 'Internal Server Error' });
    }
};
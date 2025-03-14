exports.handler = async function (context, event, callback) {
    console.log('Sync Retrieve Function triggered with event:', event);

    try {
        // Load Twilio Client
        const client = context.getTwilioClient();

        // Validate required parameters
        const SYNC_SERVICE_SID = context.SYNC_SERVICE_SID;

        if (!SYNC_SERVICE_SID) {
            console.log('Missing required environment variable: SYNC_SERVICE');
            return callback(null, { success: false, error: 'Missing required environment variable: SYNC_SERVICE' });
        }
        const { objectType, objectKey } = event;
        if (!serviceSid || !objectType || !objectKey) {
            console.log('Missing required parameters: objectType, or objectKey');
            return callback(null, { success: false, error: 'Missing required parameters: objectType, or objectKey' });
        }

        console.log(`Fetching Sync ${objectType} for key: ${objectKey}`);

        let syncObject;

        if (objectType === 'Map') {
            syncObject = client.sync.services(serviceSid).syncMaps(objectKey).fetch();
        } else if (objectType === 'List') {
            syncObject = client.sync.services(serviceSid).syncLists(objectKey).fetch();
        } else if (objectType === 'Document') {
            syncObject = client.sync.services(serviceSid).documents(objectKey).fetch();
        } else {
            console.log('Invalid objectType provided:', objectType);
            return callback(null, { success: false, error: 'Invalid objectType. Must be Map, List, or Document' });
        }

        const result = await syncObject;
        console.log('Sync Object retrieved successfully:', result.sid);

        return callback(null, { success: true, data: result.data });
    } catch (error) {
        console.error('Error retrieving Sync object:', error);
        return callback(null, { success: false, error: error.message || 'Internal Server Error' });
    }
};

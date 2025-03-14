exports.handler = async function (context, event, callback) {
    console.log('Function triggered with event:', event);
  
    try {
      // Validate input
      const { endpoint, method, headers, body } = event;
      if (!endpoint) {
        console.log('Missing required parameter: endpoint');
        return callback(null, { success: false, error: 'Missing required parameter: endpoint' });
      }
  
      console.log('Preparing request to:', endpoint, 'with method:', method);
      
      // Prepare request options
      const requestOptions = {
        method: method.toUpperCase(),
        headers: headers ? JSON.parse(headers) : {},
      };
      
      if (requestOptions.method !== 'GET' && body) {
        console.log('Including request body:', body);
        requestOptions.body = JSON.stringify(JSON.parse(body));
        requestOptions.headers['Content-Type'] = 'application/json';
      }
  
      // Make the HTTP request
      console.log('Sending request to external API...');
      const response = await fetch(endpoint, requestOptions);
      console.log('Received response with status:', response.status);
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
  
      // Return API response to Studio
      return callback(null, { success: true, data: responseData });
    } catch (error) {
      console.error('Error calling external API:', error);
      return callback(null, { success: false, error: error.message || 'Internal Server Error' });
    }
  };
  
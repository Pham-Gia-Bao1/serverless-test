const AWS = require('aws-sdk');
const eventBridge = new AWS.EventBridge();

module.exports.login = async (event) : Promise<any> => {
  const { username } = JSON.parse(event.body);

  await eventBridge.putEvents({
    Entries: [
      {
        Source: 'authService',
        DetailType: 'userLoggedIn',
        Detail: JSON.stringify({ username }),
        EventBusName: 'default'
      }
    ]
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Login successful' })
  };
};

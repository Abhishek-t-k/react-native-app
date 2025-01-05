const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(); // Initialize the Firebase Admin SDK

// Cloud Function to send push notifications
exports.sendEmergencyNotification = functions.https.onCall(async (data, context) => {
  const { token, senderName } = data;

  // Ensure the data contains both the token and senderName
  if (!token || !senderName) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing token or senderName.');
  }

  const message = {
    notification: {
      title: 'Emergency Request',
      body: `${senderName} has sent you an emergency request.`,
    },
    token,
  };

  try {
    // Send the notification to the recipient device using their token
    await admin.messaging().send(message);
    return { success: true }; // Return a success response
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new functions.https.HttpsError('internal', 'Error sending notification.');
  }
});

/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendNotification = functions.firestore
  .document('requests/{requestId}')
  .onCreate(async (snap) => {
    const requestData = snap.data();
    const { senderId, receiverId } = requestData;

    try {
      // Fetch sender's name
      const senderDoc = await admin.firestore().collection('users').doc(senderId).get();
      const senderName = senderDoc.data()?.name || 'Someone';

      // Fetch receiver's device token
      const receiverDoc = await admin.firestore().collection('users').doc(receiverId).get();
      const deviceToken = receiverDoc.data()?.deviceToken;

      if (!deviceToken) {
        console.log('No device token found for the receiver');
        return;
      }

      // Define the notification payload
      const payload = {
        notification: {
          title: 'Emergency Request',
          body: `${senderName} has sent you an emergency request.`,
        },
      };

      // Send the notification
      await admin.messaging().sendToDevice(deviceToken, payload);
      console.log('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  });

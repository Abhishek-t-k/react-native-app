// functions/firebaseAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./C:\Users\abhis\OneDrive\ドキュメント\myapp-cc332-firebase-adminsdk-88qth-5128643823.json'); // Path to your Firebase Admin service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;  // Export Firebase Admin instance for use in other files

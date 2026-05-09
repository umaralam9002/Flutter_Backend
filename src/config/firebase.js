
const admin = require('firebase-admin');
// const serviceAccount = require('../../firebaseKey.json');
const serviceAccount = require('/etc/secrets/firebaseKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };
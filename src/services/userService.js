const db = require('../config/firebase');

const usersCollection = db.collection('users');

const getUserByEmail = async (email) => {
  const snapshot = await usersCollection.where('email', '==', email).get();

  if (snapshot.empty) return null;

  return {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data(),
  };
};

const createUser = async (userData) => {
  const docRef = await usersCollection.add(userData);

  return {
    id: docRef.id,
    ...userData,
  };
};

module.exports = {
  getUserByEmail,
  createUser,
};
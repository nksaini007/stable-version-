const mongoose = require('mongoose');

async function getFirstUser() {
  await mongoose.connect('mongodb://127.0.0.1:27017/mern_mvc_users');
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({});
  console.log(user ? user.email : 'No users found');
  process.exit();
}

getFirstUser();

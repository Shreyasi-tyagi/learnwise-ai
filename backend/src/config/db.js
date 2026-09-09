const mongoose = require('mongoose');

async function ensureDatabaseConnection() {
  const username = encodeURIComponent(
    process.env.MONGODB_USERNAME
  );

  const password = encodeURIComponent(
    process.env.MONGODB_PASSWORD
  );

  const hosts = [
    'ac-4rs1m3p-shard-00-00.jcshqhl.mongodb.net:27017',
    'ac-4rs1m3p-shard-00-01.jcshqhl.mongodb.net:27017',
    'ac-4rs1m3p-shard-00-02.jcshqhl.mongodb.net:27017',
  ].join(',');

  const uri =
    `mongodb://${username}:${password}@${hosts}/learnwise_ai` +
    `?tls=true&replicaSet=atlas-pjoz2v-shard-0` +
    `&authSource=admin&retryWrites=true&w=majority`;

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error(error.message);
  }
}

module.exports = {
  ensureDatabaseConnection,
};
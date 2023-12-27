const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(
      process.env.DATABASE_URL,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true
      }
    );
    console.log(`Mongo DB host: ${connect.connection.host}`);
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

module.exports = connectDB;
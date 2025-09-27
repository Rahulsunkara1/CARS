import mongoose from "mongoose";

// Connect with retries/backoff so the app doesn't immediately exit if MongoDB
// needs a few seconds to become ready (Docker Compose "depends_on" doesn't
// wait for readiness).
const connectDb = async ({ retries = 8, delay = 3000 } = {}) => {
  const mongoUri = process.env.MONGO_URI || "mongodb://mongo:27017/carDB";

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        // modern mongoose defaults already include these, but being explicit
        // can help when running across different versions.
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(
        `MongoDB connection attempt ${attempt} failed: ${error.message}`
      );

      if (attempt < retries) {
        console.log(`Retrying MongoDB connection in ${delay / 1000}s...`);
        // wait before next attempt
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error("All MongoDB connection attempts failed. Exiting.");
        process.exit(1);
      }
    }
  }
};

export default connectDb;

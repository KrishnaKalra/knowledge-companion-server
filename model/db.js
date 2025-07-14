const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const resourceSchema = new mongoose.Schema({
  "Academic Resources": {
    type: Object,
    required: true,
  },
});

const Resource = mongoose.models.knowledgetree || mongoose.model("knowledgetree", resourceSchema);

module.exports = { connectDB, Resource };

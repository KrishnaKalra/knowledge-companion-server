import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

export const connectDB = async () => {
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

export const Resource = mongoose.models.knowledgetree || mongoose.model("knowledgetree", resourceSchema);

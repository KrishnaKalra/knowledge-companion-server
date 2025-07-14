import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import { textChunkFunction } from "./HelperFunction/textChunk.js";
import pdfParse from "pdf-parse";
import { summariseChunkFunction } from "./HelperFunction/summariseChunk.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import multer from "multer";
import { uploadOnCloudinary } from "./HelperFunction/uploadPDF.js";
import getDataUri from "./HelperFunction/dataURI.js";
import { connectDB, Resource } from "./model/db.js";
import axios from 'axios'
dotenv.config();
connectDB();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const app = express();

// Middleware
app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.static("public"));
app.use(bodyParser.json({ limit: "150mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "150mb",
    extended: true,
    parameterLimit: 50000,
  })
);

// MongoDB connection
const port = 3001;
const db = mongoose.connection;
db.once("open", () => {
  console.log("MongoDB connected");
});

app.listen(port, () => {
  console.log("Listening on port " + port);
});

// Root route
app.get("/", (req, res) => {
  res.send("Under Work");
});

// PDF Summarization Route (still uses file from req.file via multer)
app.post("/summary", async (req, res) => {
  try {
    const { pdfUrl } = req.body;

    if (!pdfUrl) {
      return res.status(400).json({ error: "Missing PDF URL" });
    }

    // Fetch PDF from Cloudinary URL
    const response = await axios.get(pdfUrl, { responseType: "arraybuffer" });
    const pdfBuffer = response.data;

    // Parse PDF
    const result = await pdfParse(pdfBuffer);
    const pdfText = result.text;

    // Assume these functions already exist
    const textChunk = textChunkFunction(pdfText);
    const summarisedText = await summariseChunkFunction(textChunk);

    // Save summary to file
    console.log(summarisedText);
    res.json({ text: summarisedText });

  } catch (err) {
    console.error("Summarization Error:", err.message);
    res.status(500).json({ error: "Failed to summarize PDF from URL" });
  }
});

// Cloudinary Upload Route
app.post("/update", upload.single("file"), async (req, res) => {
  try {
    let { type, rawPath, folderName,fileType } = req.body;

    // Parse path if sent as JSON string
    rawPath = typeof rawPath === "string" ? JSON.parse(rawPath) : rawPath;
    console.log("rawPath:", rawPath);
    console.log("folderName:", folderName);
    console.log("type:", type);

    const data = await Resource.findById(
      new mongoose.Types.ObjectId("687019a393fe0ac6b3a3d2fe")
    );

    let currentObject = data["Academic Resources"];

    // Traverse to the nested object
    for (let i = 1; i < rawPath.length; i++) {
      currentObject = currentObject[rawPath[i]];
    }

    if (type === "file") {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUri = getDataUri(req.file);
      const uploadId = "default_id";
      const result = await uploadOnCloudinary(fileUri, uploadId);

      if (!currentObject.pdf) {
        currentObject.pdf = [];
      }

      currentObject.pdf.push({
        name: req.file.originalname,
        link: result.url,
        fileType:fileType
      });

      // Mark the pdf path as modified
      const modifiedPath = ["Academic Resources", ...rawPath.slice(1), "pdf"].join(".");
      data.markModified(modifiedPath);

    } else if (type === "folder") {
      if (!folderName) {
        return res.status(400).json({ error: "Missing folder name" });
      }

      currentObject[folderName]={pdf:[]}
      // Mark only the newly added folder path as modified
      const modifiedPath = ["Academic Resources", ...rawPath.slice(1), folderName].join(".");
      data.markModified(modifiedPath);
    }

    await data.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/data", async (req, res) => {
  const data = await Resource.findById(
    new mongoose.Types.ObjectId("687019a393fe0ac6b3a3d2fe")
  );
 // console.log(data);
  res.json(data);
});

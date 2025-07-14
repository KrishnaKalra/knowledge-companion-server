const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const pdfParse = require("pdf-parse");
const path = require("path");
const fs = require("fs/promises");
const multer = require("multer");
const axios = require("axios");
const dotenv = require("dotenv");
const { v2: cloudinary } = require("cloudinary");

const { textChunkFunction } = require("./HelperFunction/textChunk");
const { summariseChunkFunction } = require("./HelperFunction/summariseChunk");
const { uploadOnCloudinary } = require("./HelperFunction/uploadPDF");
const getDataUri = require("./HelperFunction/dataURI");
const { connectDB, Resource } = require("./model/db");

dotenv.config();
connectDB();

// Setup Express
const app = express();
const port = 3001;

// Middleware
app.use(cors({
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.static("public"));
app.use(bodyParser.json({ limit: "150mb" }));
app.use(bodyParser.urlencoded({
  limit: "150mb",
  extended: true,
  parameterLimit: 50000,
}));

// Multer setup
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Routes
app.get("/", (req, res) => {
  res.send("Under Work");
});

app.post("/summary", async (req, res) => {
  try {
    const { pdfUrl } = req.body;

    if (!pdfUrl) {
      return res.status(400).json({ error: "Missing PDF URL" });
    }

    const response = await axios.get(pdfUrl, { responseType: "arraybuffer" });
    const pdfBuffer = response.data;

    const result = await pdfParse(pdfBuffer);
    const pdfText = result.text;

    const textChunk = textChunkFunction(pdfText);
    const summarisedText = await summariseChunkFunction(textChunk);

    console.log(summarisedText);
    res.json({ text: summarisedText });
  } catch (err) {
    console.error("Summarization Error:", err.message);
    res.status(500).json({ error: "Failed to summarize PDF from URL" });
  }
});

app.post("/update", upload.single("file"), async (req, res) => {
  try {
    let { type, rawPath, folderName, fileType } = req.body;
    rawPath = typeof rawPath === "string" ? JSON.parse(rawPath) : rawPath;

    const data = await Resource.findById(
      new mongoose.Types.ObjectId("687019a393fe0ac6b3a3d2fe")
    );

    let currentObject = data["Academic Resources"];
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
        link: result.result.secure_url,
        fileType: fileType
      });

      const modifiedPath = ["Academic Resources", ...rawPath.slice(1), "pdf"].join(".");
      data.markModified(modifiedPath);

    } else if (type === "folder") {
      if (!folderName) {
        return res.status(400).json({ error: "Missing folder name" });
      }

      currentObject[folderName] = { pdf: [] };
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
  res.json(data);
});

// MongoDB confirmation and server start
const db = mongoose.connection;
db.once("open", () => {
  console.log("MongoDB connected");
});

app.listen(port, () => {
  console.log("Listening on port " + port);
});

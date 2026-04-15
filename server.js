const express = require("express");
const cors = require("cors");
const multer = require("multer");

const { mergePDF, splitPDF, compressPDF } = require("./pdfController");

const app = express();

app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/api/pdf/merge", upload.array("files"), mergePDF);
app.post("/api/pdf/split", upload.single("file"), splitPDF);
app.post("/api/pdf/compress", upload.single("file"), compressPDF);

app.get("/", (req, res) => {
  res.send("PDF Backend Running ✅");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

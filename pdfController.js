const fs = require("fs-extra");
const { PDFDocument } = require("pdf-lib");
const JSZip = require("jszip");

// MERGE
exports.mergePDF = async (req, res) => {
  try {
    const merged = await PDFDocument.create();

    for (const file of req.files) {
      const bytes = fs.readFileSync(file.path);
      const pdf = await PDFDocument.load(bytes);

      const pages = await merged.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(p => merged.addPage(p));

      fs.unlinkSync(file.path);
    }

    const output = await merged.save();

    res.set("Content-Type", "application/pdf");
    res.send(output);
  } catch (e) {
    res.status(500).send("Merge error");
  }
};

// SPLIT
exports.splitPDF = async (req, res) => {
  try {
    const zip = new JSZip();

    const bytes = fs.readFileSync(req.file.path);
    const pdf = await PDFDocument.load(bytes);

    const total = pdf.getPageCount();

    for (let i = 0; i < total; i++) {
      const newPdf = await PDFDocument.create();
      const [page] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(page);

      const out = await newPdf.save();
      zip.file(`page_${i + 1}.pdf`, out);
    }

    const content = await zip.generateAsync({ type: "nodebuffer" });

    res.set("Content-Type", "application/zip");
    res.send(content);

    fs.unlinkSync(req.file.path);
  } catch {
    res.status(500).send("Split error");
  }
};

// COMPRESS
exports.compressPDF = async (req, res) => {
  try {
    const bytes = fs.readFileSync(req.file.path);

    const pdf = await PDFDocument.load(bytes);

    const compressed = await pdf.save({
      useObjectStreams: true
    });

    res.set("Content-Type", "application/pdf");
    res.send(compressed);

    fs.unlinkSync(req.file.path);
  } catch {
    res.status(500).send("Compress error");
  }
};

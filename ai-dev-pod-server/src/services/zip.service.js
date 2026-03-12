// services/zip.service.js

const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

class ZipService {
  constructor() {
    this.storagePath = path.join(__dirname, "..", "storage");
    this.outputPath = path.join(__dirname, "..", "exports");

    // Ensure exports directory exists
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }
  }

  async zipFolder(folderName) {
    return new Promise((resolve, reject) => {
      try {
        const sourceFolder = path.join(this.storagePath, folderName);

        if (!fs.existsSync(sourceFolder)) {
          return reject(new Error("Source folder does not exist"));
        }

        const zipFilePath = path.join(this.outputPath, `${folderName}.zip`);
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        output.on("close", () => {
          resolve({
            success: true,
            path: zipFilePath,
            size: archive.pointer(),
          });
        });

        archive.on("error", (err) => reject(err));

        archive.pipe(output);
        archive.directory(sourceFolder, false);
        archive.finalize();
      } catch (error) {
        reject(error);
      }
    });
  }

  async zipFiles(fileNames = [], zipName = "bundle") {
    return new Promise((resolve, reject) => {
      try {
        const zipFilePath = path.join(this.outputPath, `${zipName}.zip`);
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        output.on("close", () => {
          resolve({
            success: true,
            path: zipFilePath,
            size: archive.pointer(),
          });
        });

        archive.on("error", (err) => reject(err));

        archive.pipe(output);

        fileNames.forEach((file) => {
          const filePath = path.join(this.storagePath, file);
          if (fs.existsSync(filePath)) {
            archive.file(filePath, { name: file });
          }
        });

        archive.finalize();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new ZipService();
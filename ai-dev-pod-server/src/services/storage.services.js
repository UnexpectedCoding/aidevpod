// services/storage.service.js

const fs = require("fs");
const path = require("path");

class StorageService {
  constructor() {
    this.basePath = path.join(__dirname, "..", "storage");

    // Ensure storage directory exists
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  // Save JSON file
  saveJSON(filename, data) {
    try {
      const filePath = path.join(this.basePath, `${filename}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
      return { success: true, path: filePath };
    } catch (error) {
      console.error("Error saving JSON:", error.message);
      return { success: false, error: error.message };
    }
  }

  // Read JSON file
  readJSON(filename) {
    try {
      const filePath = path.join(this.basePath, `${filename}.json`);

      if (!fs.existsSync(filePath)) {
        throw new Error("File does not exist");
      }

      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading JSON:", error.message);
      throw new Error("Failed to read JSON file");
    }
  }

  // Save raw text file
  saveText(filename, content) {
    try {
      const filePath = path.join(this.basePath, `${filename}.txt`);
      fs.writeFileSync(filePath, content, "utf-8");
      return { success: true, path: filePath };
    } catch (error) {
      console.error("Error saving text:", error.message);
      return { success: false, error: error.message };
    }
  }

  // Read raw text file
  readText(filename) {
    try {
      const filePath = path.join(this.basePath, `${filename}.txt`);

      if (!fs.existsSync(filePath)) {
        throw new Error("File does not exist");
      }

      return fs.readFileSync(filePath, "utf-8");
    } catch (error) {
      console.error("Error reading text:", error.message);
      throw new Error("Failed to read text file");
    }
  }

  // List all stored files
  listFiles() {
    try {
      return fs.readdirSync(this.basePath);
    } catch (error) {
      console.error("Error listing files:", error.message);
      throw new Error("Failed to list files");
    }
  }

  // Delete file (json or txt)
  deleteFile(filename) {
    try {
      const jsonPath = path.join(this.basePath, `${filename}.json`);
      const txtPath = path.join(this.basePath, `${filename}.txt`);

      if (fs.existsSync(jsonPath)) {
        fs.unlinkSync(jsonPath);
        return { success: true, deleted: `${filename}.json` };
      }

      if (fs.existsSync(txtPath)) {
        fs.unlinkSync(txtPath);
        return { success: true, deleted: `${filename}.txt` };
      }

      throw new Error("File not found");
    } catch (error) {
      console.error("Error deleting file:", error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new StorageService();
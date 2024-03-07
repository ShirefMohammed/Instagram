const fsPromises = require("fs").promises;
const path = require("path");
const mime = require('mime-types');
const uploadToFirebase = require("./uploadToFirebase");

const uploadAllImagesToFirebase = async () => {
  try {
    const uploadsDir = path.join(__dirname, "..", "uploads");

    const files = await fsPromises.readdir(uploadsDir);

    for (const filename of files) {
      console.log(filename);

      const filePath = path.join(uploadsDir, filename);

      const file = { filename: filename };

      const buffer = await fsPromises.readFile(filePath);
      file.buffer = buffer;

      const mimetype = mime.lookup(filePath);
      file.mimetype = mimetype;

      await uploadToFirebase(file);
    }

    console.log("All files are uploaded");
  } catch (error) {
    console.error("Error uploading images:", error);
  }
};

module.exports = uploadAllImagesToFirebase;
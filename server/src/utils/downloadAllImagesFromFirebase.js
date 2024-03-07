const admin = require("firebase-admin");
const path = require("path");

// Load Firebase configuration
const firebaseConfig = require("../config/firebaseConfig");

// Load service account key configuration
const firebaseServiceAccountConfig = require("../config/firebaseServiceAccountConfig");

// Initialize Firebase Admin SDK with the configuration and service account credentials
admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccountConfig),
  ...firebaseConfig
});

// Initialize Firebase Storage
const bucket = admin.storage().bucket();

const downloadAllImagesFromFirebase = async () => {
  try {
    // List all files in the Firebase Storage bucket
    const [files] = await bucket.getFiles();

    // Iterate through each file and download images
    await Promise.all(
      files.map(async (file) => {
        // Check if the file is an image (you may need to adjust this condition)
        if (file.name.endsWith(".jpg") || file.name.endsWith(".jpeg") || file.name.endsWith(".png")) {
          const destination = path.join(__dirname, "..", "downloads", file.name);
          await file.download({ destination });
          console.log(`Downloaded ${file.name}`);
        }
      })
    );

    console.log("All images downloaded successfully");
  } catch (error) {
    console.error("Error downloading images:", error);
  }
};

module.exports = downloadAllImagesFromFirebase;
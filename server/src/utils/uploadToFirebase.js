const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytesResumable } = require("firebase/storage");
const firebaseConfig = require("../config/firebaseConfig");

// Initialize a firebase application
initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();

const uploadToFirebase = async (file) => {
  const storageRef = ref(storage, file.filename);

  // Create file metadata including the content type
  const metadata = {
    contentType: file.mimetype,
  };

  // Upload the file in the bucket storage
  await uploadBytesResumable(storageRef, file.buffer, metadata);
}

module.exports = uploadToFirebase;
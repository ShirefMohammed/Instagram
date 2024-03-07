const { initializeApp } = require("firebase/app");
const { getStorage, ref, deleteObject } = require("firebase/storage");
const firebaseConfig = require("../config/firebaseConfig");

// Initialize a firebase application
initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();

// Function to remove an image from Firebase Storage
const removeFromFirebase = async (imageName) => {
  const imageRef = ref(storage, imageName);
  await deleteObject(imageRef);
};

module.exports = removeFromFirebase;

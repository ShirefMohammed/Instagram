const createImagesUrl = (images) => {
  return images.map((image) => {
    return new URL(image, `${process.env.SERVER_URL}/api/uploads/`);
  });
}

module.exports = createImagesUrl;
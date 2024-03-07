const path = require("path");
const fsPromises = require("fs").promises;
const sharp = require("sharp");

const handleImageQuality = async (inputFileName, outputFileName, width, height, quality) => {
  const inputPath = path.join(__dirname, '..', 'uploads', inputFileName);
  const tempPath = path.join(__dirname, '..', 'uploads', `temp-${outputFileName}`);
  const outputPath = path.join(__dirname, '..', 'uploads', outputFileName);

  const format = outputFileName.split('.').pop().toLowerCase();

  await sharp(inputPath)
    .resize(width, height)
    .toFormat(format, { quality: quality })
    .toFile(tempPath);

  await fsPromises.rename(tempPath, outputPath);
}

module.exports = handleImageQuality;
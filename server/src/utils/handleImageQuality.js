const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const handleImageQuality = async (inputFileName, outputFileName, format, width, height, quality) => {
  const inputPath = path.join(__dirname, '..', 'uploads', inputFileName);
  const tempPath = path.join(__dirname, '..', 'uploads', `temp-${outputFileName}`);
  const outputPath = path.join(__dirname, '..', 'uploads', outputFileName);

  format = format ? format : outputFileName.split('.').pop().toLowerCase();

  await sharp(inputPath)
    .resize(width, height)
    .toFormat(format, { quality: quality })
    .toFile(tempPath);

  fs.unlink(inputPath, () => {});
  fs.rename(tempPath, outputPath, () => {});
}

module.exports = handleImageQuality;
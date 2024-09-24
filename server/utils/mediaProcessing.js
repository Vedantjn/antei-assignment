const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;

ffmpeg.setFfmpegPath('/usr/bin/ffmpeg'); 

const processImage = async (filePath) => {
  const processedPath = `${filePath}_processed.jpg`;
  await sharp(filePath)
    .resize(800, 600, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toFile(processedPath);
  return processedPath;
};

const processAudio = async (filePath) => {
  const processedPath = `${filePath}_processed.mp3`;
  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .setStartTime('00:00:00')
      .setDuration('30')
      .output(processedPath)
      .on('end', () => resolve(processedPath))
      .on('error', (err) => reject(err))
      .run();
  });
};

const processVideo = async (filePath) => {
  const processedPath = `${filePath}_processed.mp4`;
  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .setStartTime('00:00:00')
      .setDuration('10')
      .output(processedPath)
      .videoFilters('scale=640:480')
      .on('end', () => resolve(processedPath))
      .on('error', (err) => reject(err))
      .run();
  });
};

module.exports = {
  processImage,
  processAudio,
  processVideo
};
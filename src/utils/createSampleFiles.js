/* global Buffer */
/**
 * This is a utility script to create sample MP3 files for testing.
 * You can run this script using Node.js from the command line.
 *
 * Usage:
 * 1. Make sure you have Node.js installed
 * 2. Run: node src/utils/createSampleFiles.js
 */

const fs = require('fs');
const path = require('path');

// Sample MP3 file data (very small empty MP3 header)
const emptyMp3Data = Buffer.from([
  0xff, 0xfb, 0x30, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00,
]);

// Define the sample file names and destination directory
const sampleFiles = [
  'sample1.mp3',
  'sample2.mp3',
  'sample3.mp3',
  'sample4.mp3',
  'sample5.mp3',
];

const destinationDir = path.join(__dirname, '../../assets/sample-music');

// Create the directory if it doesn't exist
if (!fs.existsSync(destinationDir)) {
  console.log(`Creating directory: ${destinationDir}`);
  fs.mkdirSync(destinationDir, {recursive: true});
}

// Create each sample file
sampleFiles.forEach(filename => {
  const filePath = path.join(destinationDir, filename);

  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`File already exists: ${filePath}`);
    return;
  }

  try {
    fs.writeFileSync(filePath, emptyMp3Data);
    console.log(`Created sample file: ${filePath}`);
  } catch (error) {
    console.error(`Error creating ${filename}:`, error);
  }
});

console.log('Sample file creation complete!');
console.log("These files are minimal and won't actually play audio,");
console.log('but they will prevent crashes when the app tries to load them.');

console.log('\nTo use real audio files, replace these with actual MP3 files.');

/**
 * INSTRUCTIONS FOR WINDOWS USERS:
 *
 * If you're having trouble running this script directly, try these steps:
 *
 * 1. Open Command Prompt or PowerShell
 * 2. Navigate to your project directory
 * 3. Run: node src/utils/createSampleFiles.js
 *
 * Or create the files manually:
 * 1. Create a directory at: assets/sample-music
 * 2. Create empty MP3 files with names: sample1.mp3, sample2.mp3, etc.
 */

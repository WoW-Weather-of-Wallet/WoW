const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, 'assets', 'imgs', 'WOW_logo.png');
const iconPath = path.join(__dirname, 'src', 'assets', 'icon.png');
const adaptivePath = path.join(__dirname, 'src', 'assets', 'adaptive-icon.png');
const splashPath = path.join(__dirname, 'src', 'assets', 'splash.png');

async function build() {
  try {
    // 1. icon.png (Extract wallet area, pad to 1024x1024)
    await sharp(inputPath)
      .extract({ left: 0, top: 0, width: 360, height: 280 })
      .resize({ width: 1024, height: 1024, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(iconPath);

    // 2. adaptive-icon.png (Transparent background safe zone padding)
    await sharp(inputPath)
      .extract({ left: 0, top: 0, width: 360, height: 280 })
      .resize({ width: 675, height: 675, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .extend({
        top: 174, bottom: 175, left: 174, right: 175,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(adaptivePath);

    // 3. splash.png
    // To fix jaggies without causing a "white rectangle" mismatch, 
    // we just cleanly 3x upscale the logo itself to 1080x1080.
    // Expo will center it inside the full screen natively.
    await sharp(inputPath)
      .resize({ width: 1080, height: 1080, kernel: sharp.kernel.lanczos3, fit: 'contain' })
      .toFile(splashPath);

    console.log('✅ Assets successfully built using transparent approach.');
  } catch (error) {
    console.error('Error:', error);
  }
}

build();

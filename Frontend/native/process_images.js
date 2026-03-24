const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, 'assets', 'imgs', 'WOW_logo.png');
const iconPath = path.join(__dirname, 'src', 'assets', 'icon.png');
const adaptivePath = path.join(__dirname, 'src', 'assets', 'adaptive-icon.png');
const splashPath = path.join(__dirname, 'src', 'assets', 'splash.png');

async function build() {
  try {
    // 1. icon.png (Extract wallet, remove text at bottom)
    // Assume text is in the bottom 80 pixels out of 360 height.
    // Crop: width 360, height 280.
    // Scale up to 1024x1024 with perfectly white background fit contain.
    await sharp(inputPath)
      .extract({ left: 0, top: 0, width: 360, height: 280 })
      .resize({ width: 1024, height: 1024, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(iconPath);
      
    console.log('✅ icon.png generated (1024x1024, cropped wallet).');

    // 2. adaptive-icon.png (Foreground only, transparent bg)
    // Inside a 1024x1024 canvas, logo should fit in middle ~675px safe zone
    await sharp(inputPath)
      .extract({ left: 0, top: 0, width: 360, height: 280 })
      .resize({ width: 675, height: 675, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: 174, bottom: 175, left: 174, right: 175,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile(adaptivePath);
      
    console.log('✅ adaptive-icon.png generated (1024x1024, transparent safe zone).');

    // 3. splash.png (To fix aliasing/jaggies)
    // We smooth-upscale the entire 360x360 image (including WOW text) to 720x720 
    // using 'lanczos3' filter, then lay it on a massive 1280x2400 white canvas. 
    // This forces OS to stretch the white padding, not the low-res logo itself.
    const smoothedLogo = await sharp(inputPath)
      .resize({ width: 720, height: 720, kernel: sharp.kernel.lanczos3 })
      .toBuffer();
      
    await sharp({
      create: {
        width: 1280,
        height: 2400,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .composite([{ input: smoothedLogo, gravity: 'center' }])
    .toFile(splashPath);

    console.log('✅ splash.png generated (1280x2400, anti-aliased center logo).');

  } catch(e) {
    console.error('❌ Error processing images:', e);
  }
}

build();

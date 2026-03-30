const sharp = require('sharp');
const path = require('path');

const input = path.join(__dirname, 'assets', 'imgs', 'WOW_logo.png');

async function check() {
  try {
    const meta = await sharp(input).metadata();
    console.log(`METADATA: width=${meta.width}, height=${meta.height}, format=${meta.format}`);
  } catch(e) {
    console.error(e);
  }
}

check();

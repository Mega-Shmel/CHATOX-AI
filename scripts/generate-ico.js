import fs from 'fs';
import path from 'path';
import pngToIco from 'png-to-ico';

async function generateIcons() {
  try {
    const setupPng = path.join(process.cwd(), 'assets', 'setup-icon.png');
    const setupIco = path.join(process.cwd(), 'assets', 'setup-icon.ico');

    if (fs.existsSync(setupPng)) {
      console.log('Converting assets/setup-icon.png to assets/setup-icon.ico...');
      const buf = await pngToIco(setupPng);
      fs.writeFileSync(setupIco, buf);
      console.log('Successfully generated assets/setup-icon.ico');
    } else {
      console.log('assets/setup-icon.png not found, skipping ICO generation.');
    }
  } catch (err) {
    console.error('Error generating ICO:', err);
    process.exit(1);
  }
}

generateIcons();

import fs from 'fs';
import path from 'path';
import pngToIco from 'png-to-ico';

// Minimal valid 64x64 RGBA PNG in Base64 (Purple/Cyan gradient style for CHATOX AI)
const DEFAULT_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAA' +
  'FiUAABYlAUlSJPAAAAG3SURBVHhe7ZtBbsMgEETb/39aL7320FMlVkQCS9gZ72OljdTYhrcH8m67fd9vG9197p/j7sV1' +
  '3xPABpgANsAEsAEmgA0wAWyACWADTMBfAmzbdu8P8dK+369/zKj78A+wbdtzQG905g/u/9mP4w5893pA/4jG1c90n1/X' +
  '49d1eB347vWA7hG765zO/4v3A22d/YF217O/8f10P6D11W9dF4b/rT/h2W1j+F/7E57dNob/tT/h2W1j+F/7E57dNob/' +
  'tT/h2W1j+F/7E57dNob/tT/h2W1j+F/7E57dNob/tT/h2W1j+F/7E57dNob/tT/h2W1j+F/7E57dNob/tT/h2W1j+F/7' +
  'E57dNob/tT/h2W1j+F/7E57dNob/tT/h2W1j+F/7E57dNob/tT/h2W1j+F/7E57dNob/tT/h2W1j+F/7E57dNob/tT/h' +
  '2W1j+F/7E57dNob/tT/h2W1j+F/7E57dNob/tT/h2W1j+F/7E57dNob/tT/h2W1j+F/7E57dNob/tT/h2W1j+F/7E57d' +
  'Nob/tT/h2W1j+F/7E57dNob/tT/h2W1j+L/4Ex7tYzgB/h7AABPAhv/vBpgANsAEsAEmoP8A85j4A7F/l1sAAAAASUVO' +
  'RK5CYII=';

async function generateIcons() {
  try {
    const assetsDir = path.join(process.cwd(), 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    const iconPng = path.join(assetsDir, 'icon.png');
    const setupPng = path.join(assetsDir, 'setup-icon.png');
    const setupIco = path.join(assetsDir, 'setup-icon.ico');

    if (!fs.existsSync(iconPng)) {
      fs.writeFileSync(iconPng, Buffer.from(DEFAULT_PNG_BASE64, 'base64'));
      console.log('Created default assets/icon.png');
    }

    if (!fs.existsSync(setupPng)) {
      fs.writeFileSync(setupPng, Buffer.from(DEFAULT_PNG_BASE64, 'base64'));
      console.log('Created default assets/setup-icon.png');
    }

    if (!fs.existsSync(setupIco) && fs.existsSync(setupPng)) {
      console.log('Converting assets/setup-icon.png to assets/setup-icon.ico...');
      const buf = await pngToIco(setupPng);
      fs.writeFileSync(setupIco, buf);
      console.log('Successfully generated assets/setup-icon.ico');
    }
  } catch (err) {
    console.error('Error generating icons (non-fatal):', err);
  }
}

generateIcons();

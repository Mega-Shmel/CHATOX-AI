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
    const iconIco = path.join(assetsDir, 'icon.ico');
    const setupPng = path.join(assetsDir, 'setup-icon.png');
    const setupIco = path.join(assetsDir, 'setup-icon.ico');

    // 1. Process icon.png -> icon.ico
    if (fs.existsSync(iconPng)) {
      try {
        console.log('Converting assets/icon.png to assets/icon.ico...');
        const buf = await pngToIco(iconPng);
        fs.writeFileSync(iconIco, buf);
        console.log('Successfully generated assets/icon.ico');
      } catch (err) {
        console.warn('Could not convert icon.png to ICO (using fallback if needed):', err.message);
      }
    }

    // 2. Process setup-icon.png -> setup-icon.ico (or fallback to icon.png)
    const sourceSetupPng = fs.existsSync(setupPng) ? setupPng : (fs.existsSync(iconPng) ? iconPng : null);
    if (sourceSetupPng) {
      try {
        console.log(`Converting ${sourceSetupPng} to assets/setup-icon.ico...`);
        const buf = await pngToIco(sourceSetupPng);
        fs.writeFileSync(setupIco, buf);
        console.log('Successfully generated assets/setup-icon.ico');
      } catch (err) {
        console.warn('Could not convert setup-icon.png to ICO:', err.message);
      }
    }
  } catch (err) {
    console.error('Icon generator error (non-fatal):', err);
  }
}

generateIcons();

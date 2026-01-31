import { promises as fs } from 'fs';
import path from 'path';

const VENDOR = path.resolve(process.cwd(), 'public', 'vendor', 'primeuix', 'nora.css');
const PLACEHOLDER_MARKER = 'Placeholder for PrimeUIX Nora theme.';

async function run() {
  try {
    const src = await fs.readFile(VENDOR, 'utf8');
    if (src.includes(PLACEHOLDER_MARKER)) {
      console.error('\n✖ PrimeUIX vendor file is still the placeholder.');
      console.error('  Run: `npm install @primeuix/themes && npm run vendor:primeuix` to populate /public/vendor/primeuix/nora.css\n');
      process.exit(2);
    }

    // sanity size check to catch partial files
    if (Buffer.byteLength(src, 'utf8') < 3_000) {
      console.error('\n✖ PrimeUIX vendor file looks too small (likely incorrect).');
      console.error('  Expected the compiled theme; received a tiny/partial file.');
      console.error('  Run: `npm run vendor:primeuix` or vendor the official CSS into /public/vendor/primeuix/nora.css\n');
      process.exit(3);
    }

    console.log('✓ PrimeUIX vendor file looks good:', VENDOR);
    process.exit(0);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('\n✖ PrimeUIX vendor file missing:', VENDOR);
      console.error('  Run: `npm install @primeuix/themes && npm run vendor:primeuix` to add it to the repo.');
      process.exit(1);
    }
    console.error('✖ Unexpected error while checking vendor file:', err);
    process.exit(99);
  }
}

run();

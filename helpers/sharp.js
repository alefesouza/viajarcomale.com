const sharp = require('sharp');
const { resolve } = require('path');
const { readdir } = require('fs').promises;

async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

;(async () => {
  for await (const f of getFiles('./photos')) {
    sharp(f)
      .rotate()
      .resize(500)
      .jpeg({ mozjpeg: true })
      .toFile(f.replace('/photos/', '/resize/'), (err, info) => { console.log(err) });
  }
})();

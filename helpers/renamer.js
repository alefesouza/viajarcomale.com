const fs = require('fs');

const files = fs.readdirSync('.');

files.forEach(f => {
  if (f.includes('.jpg') || f.includes('.srt') || f.includes('.js') || f === '.DS_Store') {
    return;
  }

  fs.renameSync(f, f + '.mp4');
});

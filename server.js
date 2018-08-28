const port = 9000;
const fs = require('fs');
const sse = require('sse');
const url = require('url');
const http = require('http');
const path = require('path');

let lock = false;
const spawn = require('child_process').spawn,
  build = () => {
    if (!lock) {
      lock = true;
      let builder = spawn('npm', ['run', 'build']);
      builder.stdout.pipe(process.stdout);
      builder.stderr.pipe(process.stderr);
      return builder;
    } else return { on: () => {} };
  };

let server = http
  .createServer(function(req, res) {
    // parse URL
    const parsedUrl = url.parse(req.url);
    // extract URL path
    let pathname = `.${parsedUrl.pathname}`;
    pathname = './prod/' + pathname.substr(2);
    // based on the URL path, extract the file extention. e.g. .js, .doc, ...
    const ext = path.parse(pathname).ext || '.html';
    // maps file extention to MIME typere
    const map = {
      '.ico': 'image/x-icon',
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.json': 'application/json',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.wav': 'audio/wav',
      '.mp3': 'audio/mpeg',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
    };

    fs.exists(pathname, function(exist) {
      if (!exist) {
        // if the file is not found, return 404
        res.statusCode = 404;
        res.end(`File ${pathname} not found!`);
        return;
      }

      // if is a directory search for index file matching the extention
      if (fs.statSync(pathname).isDirectory()) pathname += '/index.html';

      // read file from file system
      fs.readFile(pathname, function(err, data) {
        if (err) {
          res.statusCode = 500;
          res.end(`Error getting the file: ${err}.`);
        } else {
          // if the file is found, set Content-type and send data
          res.setHeader('Content-type', map[ext] || 'text/plain');
          res.end(data);
        }
      });
    });
  })
  .listen(port, '0.0.0.0', () => {
    var ss = new sse(server);
    ss.on('connection', client => {
      fs.watch('prod').on('change', () => {
        client.send('update');
      });
    });
  });

let watcher = require('hound').watch('src');
watcher.on('create', () => build().on('close', () => (lock = false)));
watcher.on('change', () => build().on('close', () => (lock = false)));
watcher.on('delete', () => build().on('close', () => (lock = false)));

build().on('close', () => {
  lock = false;
  console.log(`Server listening on port ${port}`);
});

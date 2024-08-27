const http = require('http'), 
fs = require('fs'), 
url = require('url');
path = require('path');
 

http.createServer((request, response) => {
    let addr = request.url,
    q = new URL(addr, 'http://' + request.headers.host),
    filePath = '';

    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);
        }else {
            console.log('Added to log.');
        }
    });

    if (q.pathname.includes('documentation')) {
        filePath = path.join(__dirname, 'documentation.html');
    } else {
        filePath = path.join(__dirname, 'index.html');
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end('404 Not Found');
            return;
        }
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(data);
        response.end();
    });
    
}).listen(8080);
console.log('Server running at http://localhost:8080/');




// console.log(q.host); // returns localhost:8080
// console.log(q.pathname); // returns './default.html'
// console.log(q.search); // returns '?year=2017&month=february'

// let qdata = q.query; // returns an object: { year: 2017, month: 'february' }
// console.log(qdata.month); // returns 'february'


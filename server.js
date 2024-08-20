const http = require('http'), 
fs = require('fs'), 
url = require('url');
 

http.createServer((reuqest, response) => {
    let addr = request.url,
    q = new URL(addr, 'http://localhost:8080');
    filePath = '';
    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + './documentation.html');
    } else {
        filePath = 'index.html';
    }

    fs.readFile(filePath, (err, data) => {
        if(err) {
            throw err;
        }
    });
    
}).listen(8080);
console.log('My first Node test server is runnin on Port 8080.');




// console.log(q.host); // returns localhost:8080
// console.log(q.pathname); // returns './default.html'
// console.log(q.search); // returns '?year=2017&month=february'

// let qdata = q.query; // returns an object: { year: 2017, month: 'february' }
// console.log(qdata.month); // returns 'february'


var path = require('path');
var express = require('express');
var app = express();
var html = `<h1>Hello roo!</h1><img src=\'/images/kangaroo-crossing.jpg\' />`;
app.use('/', express.static('test'));

app.get('/fragment-iframe', function(req, res) {
    setTimeout(function() {
        res.send(html);
    }, Math.random() * 2);
});

app.get('/page-iframe', function(req, res) {
    setTimeout(function() {
        res.send(`<!DOCTYPE html>
                <html>
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                    <title>Whole page</title>
                </head>
                    <body>
                        ${html}
                    </body>
                </html>`);
    }, Math.random() * 2);
});

app.listen(8080, () => { console.log('Listening on port 8080')});
var path = require('path');
var express = require('express');
var app = express();

if (!process.env.PORT) {
  process.env.PORT = 3500;
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
})
app.use(express.static(path.join(__dirname, '../min')))

app.listen(process.env.PORT)

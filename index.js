var express = require('express');
var path = require('path');
var app = express();
var session = require('express-session');
var helmet = require('helmet');

var server = require('http').createServer(app);  
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(session({secret: 'testingPurposesOnly'}));
app.use(helmet());
app.use(express.static(path.join(__dirname, '/client')));

require('./server/config/mongoose.js');
require('./server/config/routes.js')(app);

var server = app.listen(5000, function(){
  console.log('we\'re listening on port 5000');
});

var io = require('./server/managers/socketManager.js')(server);
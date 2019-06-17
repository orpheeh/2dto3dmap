const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

app.use(function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, GET, OPTIONS, DELETE' );
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Content-Disposition');
    next();
});

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

const route = require('./route');
route(app);

app.listen(PORT);

console.log('2D to 3D Map Serveur port: ' + PORT);

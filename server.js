var path = require('path');
var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080
var fs = require('fs')
var path = require('path')
var bodyParser= require('body-parser')
var webpack = require('webpack')
var assign = require('lodash.assign')
var MongoClient = require('mongodb').MongoClient
var httpProxyMiddleware = require('http-proxy-middleware')


app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());

MongoClient.connect('mongodb://7ruth:Warandpeace9@ds023478.mlab.com:23478/padstats', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(3000, () => {
    console.log('listening on 3000')
  })
  // db.collection('addresses').find().toArray(function(err, results) {
  // console.log(results)
  // // send HTML file populated with quotes here
  // })
})
console.log("hi2")

app.post('/save', (req, res) => {
  db.collection('addresses').save(req.body, (err, result) => {
   if (err) return console.log(err)
   console.log('saved to database')
  //  res.redirect('/')
  })
  console.log(req.body)
  console.log('*SAVE - beep boooop booooooop*')
})

app.get('/retrieve/:version', (req, res) => {
  db.collection('addresses').find({ userID: req.params.version } ).toArray(function(err, results) {
  res.send(results)
  })
})

app.delete('/delete', (req, res)=> {
  console.log(req.body.i)
  console.log("^^^^^")
  db.collection('addresses').remove({_id: ObjectId(req.body.i)})
  console.log('*DELETED - beep boooop booooooop*')
})


// using webpack-dev-server and middleware in development environment
if(process.env.NODE_ENV !== 'production') {
  var webpackDevMiddleware = require('webpack-dev-middleware');
  var webpackHotMiddleware = require('webpack-hot-middleware');
  var webpack = require('webpack');
  var config = require('./webpack.config');
  var compiler = webpack(config);

  app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
  app.use(webpackHotMiddleware(compiler));
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/public/index.html')
  console.log("app.get");
});

app.listen(PORT, function(error) {
  if (error) {
    console.error(error);
  } else {
    console.info("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
  }
});

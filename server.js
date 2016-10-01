var app = express()
ObjectId = require('mongodb').ObjectID;
var db

var createServer = require(https ? 'https' : 'http').createServer
var server

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

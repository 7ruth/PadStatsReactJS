const express = require('express');
const app = express();

app.listen(3001, function() {
  console.log('listening on 3001')
})

app.get('/', (req, res) => {
  console.log(__dirname);
  res.sendFile(__dirname + '/index.html')
})

app.post('/quotes', (req, res) => {
  console.log('Hellooooooooooooooooo!')
})

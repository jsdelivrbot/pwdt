const express = require('express');
const path = require('path');
var pg = require('pg');

// set port
const PORT = process.env.PORT || 5000

var app = express();

app.use(express.static(path.join(__dirname, '/public')))
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index')) //route

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
});


app.listen(PORT, () => console.log(`Listening on ${ PORT }`)) 

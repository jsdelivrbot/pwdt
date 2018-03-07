const express = require('express');
const path = require('path');
var pg = require('pg');

// set port
const PORT = process.env.PORT || 5000

var app = express();

app.use(express.static(path.join(__dirname, '/public')))
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')
app.get('/', function (req, res) {
  console.log("hello what's up")
  res.render('pages/index')
}); //route

app.get('/db', function (request, response) {
  console.log(process.env.DATABASE_URL);
  console.log("hello again");
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  	if (err) {
  		console.log("encountered error");
  	}
    client.query('SELECT * FROM test_table;', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
});


app.listen(PORT, () => console.log(`Listening on ${ PORT }`)) 

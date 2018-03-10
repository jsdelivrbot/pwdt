const express = require('express');
const path = require('path');
const pg = require('pg');
const bodyParser = require('body-parser');
const routes = require('./server/routes/index');

// set port
const PORT = process.env.PORT || 5000
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/todo';

const app = express();

app.use(express.static(path.join(__dirname, '/public')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')
app.get('/', function (req, res) {
  console.log("hello what's up")
  res.render('pages/index')
}); //route

app.use('/', routes);

const client = new pg.Client(connectionString);


// app.get('/db', function (request, response) {
//   console.log(connectionString);
//   console.log("hello again");
//   pg.connect(connectionString, function(err, client, done) {
//   	if (err) {
//   		console.log("encountered error");
//   	}
//     client.query('SELECT * FROM test_table;', function(err, result) {
//       done();
//       if (err)
//        { console.error(err); response.send("Error " + err); }
//       else
//        { response.render('pages/db', {results: result.rows} ); }
//     });
//   });
// });

// function GetDB() {
	
// }


app.listen(PORT, () => console.log(`Listening on ${ PORT }`)) 

module.exports = app;
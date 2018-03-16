const express = require('express');
const router = express.Router();
const pg = require('pg');
const path = require('path');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/proteins';

router.get('/', (req, res, next) => {
  res.sendFile(path.join(
    __dirname, '..', '..', 'views', 'pages', 'index.ejs'));
});

router.get('/api/v1/todos', (req, res, next) => {
  const results = [];
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM pwdt ORDER BY id ASC;');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

//Ids not in database
router.get('/api/v1/except/:swiss_prot_id', (req, res, next) => {
  console.log("we are querying ids not in table here")
  const results = [];
  // Grab data from the URL parameters
  var id = req.params.swiss_prot_id;
  console.log(req.params);
  console.log(id);
  
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM unnest($1::text[]) EXCEPT (SELECT swiss_prot_id AS column FROM pwdt UNION SELECT gene_name FROM pwdt)', [id.split(',')]);
    // Stream results back one row at a time  
    query.on('row', (row) => {
      results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});


//Query id
router.get('/api/v1/query/:id', (req, res, next) => {
  console.log("we are querying here")
  const results = [];
  // Grab data from the URL parameters
  var id = req.params.id;
  console.log(req.params);
  console.log(id);
  
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM pwdt WHERE swiss_prot_id = ANY($1::text[]) OR gene_name = ANY($1::text[])', [id.split(',')]);
    // Stream results back one row at a time  ORDER BY swiss_prot_id ASC
    query.on('row', (row) => {
      results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});


// create todo
router.post('/api/v1/todos', (req, res, next) => {
  const results = [];

  console.log(req.body);

  // Grab data from http request
  // const data = {text: req.body.text, complete: false};
  const data = {swiss_prot_id: req.body.text};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Insert Data
    client.query('INSERT INTO pwdt(swiss_prot_id) values($1)',
    [data.swiss_prot_id]);
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM pwdt ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

router.put('/api/v1/todos/:todo_id', (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters
  const id = req.params.todo_id;
  // Grab data from http request
  const data = {swiss_prot_id: req.body.text};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Update Data
    client.query('UPDATE pwdt SET swiss_prot_id=($1) WHERE id=($2)',
    [swiss_prot_id.text, id]);
    // SQL Query > Select Data
    const query = client.query("SELECT * FROM pwdt ORDER BY id ASC");
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', function() {
      done();
      return res.json(results);
    });
  });
});

router.delete('/api/v1/todos/:todo_id', (req, res, next) => {
  console.log("we are deleting here")
  const results = [];
  // Grab data from the URL parameters
  const id = req.params.todo_id;
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Delete Data
    client.query('DELETE FROM pwdt WHERE id=($1)', [id]);
    // SQL Query > Select Data
    var query = client.query('SELECT * FROM pwdt ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

module.exports = router;
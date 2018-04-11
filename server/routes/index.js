const express = require('express');
const router = express.Router();
const pg = require('pg');
const path = require('path');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/proteins';

router.get('/', (req, res, next) => {
  res.sendFile(path.join(
    __dirname, '..', '..', 'views', 'pages', 'index.ejs'));
});

router.get('/db', (req, res, next) => {
  res.render(path.join(
    __dirname, '..', '..', 'views', 'pages', 'db.ejs'));
});

router.get('/contact', (req, res, next) => {
  res.render(path.join(
    __dirname, '..', '..', 'views', 'pages', 'contactUs.ejs'));
});

router.get('/about', (req, res, next) => {
  res.render(path.join(
    __dirname, '..', '..', 'views', 'pages', 'about.ejs'));
});

router.get('/methodology', (req, res, next) => {
  res.render(path.join(
    __dirname, '..', '..', 'views', 'pages', 'methodology.ejs'));
});

router.get('/abundant', (req, res, next) => {
  res.render(path.join(
    __dirname, '..', '..', 'views', 'pages', 'abundantProteins.ejs'));
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
  console.log("querying ids not in table");
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
    const query = client.query('SELECT * FROM unnest($1::text[]) EXCEPT (SELECT swiss_prot_id AS column FROM pwdt UNION SELECT gene_name_query FROM pwdt)', [id.split(',')]);
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
  console.log("querying ids")
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
    const query = client.query(';with C as (SELECT * FROM unnest($1::text[]) WITH ordinality As f(query, sort_order) JOIN pwdt ON f.query = pwdt.swiss_prot_id OR f.query = pwdt.gene_name_query) SELECT MIN(C.sort_order) AS sort_order, C.swiss_prot_id, C.gene_name, C.entry_name, C.protein_name, C.identified, C.quantified, C.good_linearity, C.broader_linear_range FROM C GROUP BY C.swiss_prot_id, C.gene_name, C.entry_name, C.protein_name, C.identified, C.quantified, C.good_linearity, C.broader_linear_range ORDER BY sort_order', [id.split(',')]);
    // SELECT * FROM unnest('{P00747}'::text[]) WITH ordinality As f(query, sort_order) JOIN pwdt ON f.query = pwdt.swiss_prot_id OR f.query = pwdt.gene_name;
    //;with C as ( SELECT * FROM unnest($1::text[]) WITH ordinality As f(query, sort_order) JOIN pwdt ON f.query = pwdt.swiss_prot_id OR f.query = pwdt.gene_name) SELECT MIN(C.sort_order) AS sort_order, C.swiss_prot_id, C.gene_name, C.entry_name, C.protein_name, C.identified, C.quantified, C.good_linearity, C.broader_linear_range FROM C GROUP BY C.swiss_prot_id, C.gene_name, C.entry_name, C.protein_name, C.identified, C.quantified, C.good_linearity, C.broader_linear_range ORDER BY sort_order;
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
    [data.swiss_prot_id, id]);
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

module.exports = router;
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/proteins';

const client = new pg.Client(connectionString);
client.connect();
const query = client.query(
 // 'CREATE TABLE pwdt(id SERIAL PRIMARY KEY, swiss_prot_id VARCHAR(40), gene_name VARCHAR(40), entry_name VARCHAR(40), protein_name VARCHAR(40), identified VARCHAR(40), quantified VARCHAR(40), good_linearity VARCHAR(40), broader_linear_range VARCHAR(40))');
 "COPY pwdt(swiss_prot_id, gene_name, entry_name, protein_name, identified, quantified, good_linearity, broader_linear_range) FROM 'C:/Users/HuangL3/Documents/decision_tree.csv' DELIMITER ',' CSV HEADER;");
query.on('end', () => { client.end(); });
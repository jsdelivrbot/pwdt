const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/proteins';

const client = new pg.Client(connectionString);
client.connect();
const query = client.query(
  // 'CREATE TABLE pwdt(id SERIAL PRIMARY KEY, protein_name VARCHAR(40) not null, swiss_prot_id VARCHAR(40), gene_name VARCHAR(40), identified VARCHAR(40), quantified VARCHAR(40), good_linearity VARCHAR(40), broad_linear_range VARCHAR(40))');
  'COPY pwdt(protein_name, swiss_prot_id, identified, quantified, good_linerity, broader_linear_range) FROM "C:/Users/HuangL3/Documents/decision_tree.csv" DELIMETER "," CSV HEADER)');
query.on('end', () => { client.end(); });
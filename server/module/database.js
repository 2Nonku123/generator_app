const pg = require("pg");
const { parse } = require("pg-connection-string");

function getPool() {
  let connection_string = process.env.DATABASE_URL || "";

  let config = parse(connection_string);
  if (connection_string.indexOf("localhost") == -1) {
    config.ssl = {
      rejectUnauthorized: false,
    };
  }
  let Pool = pg.Pool;
  let pool = new Pool(config);

  return pool;
}

module.exports = { getPool };
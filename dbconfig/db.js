const { Pool, Client } = require("pg");
const client = new Client({
  user: "masqote",
  host: "127.0.0.1",
  database: "hapi",
  password: "mautauaja",
  port: 5432,
});

client
  .connect()
  .then(() => console.log("connected!!"))
  .catch((err) => console.log("connection error!!", err));

module.exports = client;

const { Pool, Client } = require("pg");
const client = new Client({
  user: "YOUR_USERNAME",
  host: "127.0.0.1",
  database: "YOUR_DATABASE",
  password: "YOUR_PASSWORD",
  port: 5432,
});

client
  .connect()
  .then(() => console.log("connected!!"))
  .catch((err) => console.log("connection error!!", err));

module.exports = client;

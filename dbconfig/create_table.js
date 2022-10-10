const Connection = require("./db");

async function createTable() {
  const query = `CREATE table "products" (	
        "id" BIGSERIAL,
        "name" VARCHAR(150) NOT NULL,
        "sku" VARCHAR(150) NOT NULL,	
        "image" TEXT NOT NULL,
        "price" INT NOT NULL,
        "description" TEXT,
        PRIMARY KEY("id")
    )`;

  try {
    await Connection.query(query);
    console.log("Create Table Successfully!");
  } catch (error) {
    console.log(error);
  }
}

createTable();

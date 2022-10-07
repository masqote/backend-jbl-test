const Connection = require("../dbconfig/db");
const Products = {};

Products.list = async function () {
  const query = {
    text: "SELECT * FROM products ORDER by products.sku ASC",
  };

  try {
    const prodList = await Connection.query(query);

    return prodList.rows;
  } catch (err) {
    console.log(err);
  }
};

Products.add = async function (data) {
  const querySelect = {
    text: `SELECT * FROM products WHERE sku = '${data.sku}'`,
  };

  const query = {
    text: `INSERT INTO products (name, sku, image, price, description)
        VALUES ('${data.name}', '${data.sku}', '${data.image}', '${data.price}', '${data.description}')`,
  };

  try {
    const findBySku = await Connection.query(querySelect);

    if (findBySku.rows.length > 0) {
      return {
        code: 400,
        status: "duplicate",
        message: "Data already exist",
      };
    }

    await Connection.query(query);

    return {
      code: 201,
      status: "success",
      message: "Product add succesfully!",
      data: data,
    };
  } catch (err) {
    console.log(err);
  }
};

Products.edit = async function (id) {
  const query = {
    text: `SELECT * FROM products WHERE id = '${id}'`,
  };

  try {
    const findById = await Connection.query(query);

    return findById.rows;
  } catch (err) {
    console.log(err);
  }
};

Products.update = async function (id, data) {
  const querySku = {
    text: `SELECT name, sku, image, price, description FROM products WHERE sku = '${data.sku}'`,
  };

  let prodSku = await Connection.query(querySku);

  if (prodSku.rows.length > 1) {
    return {
      code: 400,
      status: "duplicate",
      message: "Data already exist",
    };
  }

  const query = {
    text: `UPDATE products
    SET name = '${data.name}',
    image = '${data.image}',
    price = '${data.price}',
    description = '${data.description}'
    WHERE id = '${id}';
    `,
  };

  try {
    await Connection.query(query);

    return {
      code: 200,
      status: "success",
      message: "Product update successfully!",
      data: data,
    };
  } catch (err) {
    console.log(err);
  }
};

Products.delete = async function (id) {
  const query = {
    text: `DELETE FROM products WHERE id = '${id}'`,
  };

  try {
    return await Connection.query(query);
  } catch (err) {
    console.log(err);
  }
};

module.exports = Products;

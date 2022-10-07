"use strict";

const Hapi = require("@hapi/hapi");
const axios = require("axios");
const { parseString } = require("xml2js");
const Product = require("./models/product");
const Responses = require("./response");

const init = async () => {
  const server = Hapi.server({
    port: 1234,
    host: "localhost",
  });

  server.route([
    // 404 ERROR PAGE
    {
      method: "*",
      path: "/{any*}",
      handler: (request, h) => {
        return "404 Error! Page Not Found!";
      },
    },
    // GET PRODUCT LIST
    {
      method: "GET",
      path: "/get-product",
      handler: async (request, h) => {
        const prodList = await Product.list();
        return h.response(Responses.apiResponse(200, "Success!", prodList));
      },
    },
    // ADD PRODUCT
    {
      method: "POST",
      path: "/add-product",
      handler: async (request, h) => {
        let req = request.payload;
        const addProduct = await Product.add(req);

        try {
          if (addProduct.code == 201) {
            return h
              .response(
                Responses.apiResponse(
                  addProduct.code,
                  addProduct.message,
                  addProduct.data
                )
              )
              .code(addProduct.code);
          } else {
            return h
              .response(
                Responses.apiResponse(addProduct.code, addProduct.message)
              )
              .code(addProduct.code);
          }
        } catch (error) {
          return "asd";
        }
      },
    },
    // EDIT PRODUCT
    {
      method: "GET",
      path: "/edit-product/{id}",
      handler: async (request, h) => {
        let id = request.params.id;
        const editProduct = await Product.edit(id);

        if (editProduct.length > 0) {
          return h
            .response(Responses.apiResponse(200, "Success!", editProduct[0]))
            .code(200);
        } else {
          return h
            .response(
              Responses.apiResponse(400, "Product not found!", editProduct)
            )
            .code(400);
        }
      },
    },
    // UPDATE PRODUCT
    {
      method: "POST",
      path: "/update-product/{id}",
      handler: async (request, h) => {
        let id = request.params.id;
        let req = request.payload;
        const editProduct = await Product.update(id, req);

        try {
          return h
            .response(
              Responses.apiResponse(
                editProduct.code,
                editProduct.message,
                editProduct.data
              )
            )
            .code(editProduct.code);
        } catch (error) {}
      },
    },
    // DELETE PRODUCT
    {
      method: "POST",
      path: "/delete-product/{id}",
      handler: async (request, h) => {
        let id = request.params.id;
        const deleteProduct = await Product.delete(id);

        try {
          return h.response(
            Responses.apiResponse(200, "Deleted!", deleteProduct.rows)
          );
        } catch (error) {
          console.log(error);
        }
      },
    },
    // IMPORT PRODUCT
    {
      method: "POST",
      path: "/import-product",
      handler: async (request, h) => {
        try {
          const result = await axios.get(
            "https://api.elevenia.co.id/rest/prodservices/product/listing",
            { headers: { openapikey: "721407f393e84a28593374cc2b347a98" } }
          );

          let products = {};
          let productData = {};
          let countDuplicate = 0;
          let countSuccess = 0;

          parseString(result.data, function (err, results) {
            products = results.Products.product;
          });

          for (let prd of products) {
            productData = {
              name: prd.prdNm[0],
              sku: prd.sellerPrdCd[0],
              image: "https://picsum.photos/250",
              price: parseInt(prd.selPrc[0]),
              description: "",
            };

            const addProduct = await Product.add(productData);

            addProduct.status == "duplicate" ? countDuplicate++ : "";
            addProduct.status == "success" ? countSuccess++ : "";
          }

          let respData = {
            product_duplicate: countDuplicate,
            product_success: countSuccess,
          };

          return h
            .response(
              Responses.apiResponse(
                200,
                "Product has been successfully imported!",
                respData
              )
            )
            .code(200);
        } catch (error) {
          console.log(error);
        }
      },
    },
  ]);

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();

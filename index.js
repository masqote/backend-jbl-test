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
    routes: {
      cors: {
        origin: ["*"],
        headers: ["Accept", "Content-Type"],
        additionalHeaders: ["X-Requested-With"],
      },
    },
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
        let limit = request.query.limit;
        let offset = request.query.offset;
        const prodList = await Product.list(limit, offset);

        const resultProd = {
          count_prod: parseInt(prodList.count_prod[0].count),
          prod_list: prodList.prod_list,
        };

        return h
          .response(Responses.apiResponse(200, "Success!", resultProd))
          .code(200);
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
      method: "PUT",
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
          const pagination = 5;
          let products = {};
          let productData = {};
          let countDuplicate = 0;
          let countSuccess = 0;

          for (let index = 1; index < pagination; index++) {
            const result = await axios.get(
              "https://api.elevenia.co.id/rest/prodservices/product/listing",
              {
                headers: { openapikey: "721407f393e84a28593374cc2b347a98" },
                params: {
                  page: index,
                },
              }
            );

            parseString(result.data, function (err, results) {
              if (results.Products.product.length > 0) {
                products = results.Products.product;
              }
            });

            for (let prd of products) {
              productData = {
                name: prd.prdNm[0],
                sku: prd.sellerPrdCd[0],
                image: `https://source.unsplash.com/random/?${prd.prdNm}`,
                price: parseInt(prd.selPrc[0]),
                description: "",
              };

              const addProduct = await Product.add(productData);

              addProduct.status == "duplicate" ? countDuplicate++ : "";
              addProduct.status == "success" ? countSuccess++ : "";
            }
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

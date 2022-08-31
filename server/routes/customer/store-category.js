const express = require("express");
const router = express.Router();
const Joi = require("joi");

const StoreManager = require("../../manager/store-manager");
const storeManager = StoreManager();

router.get("/top", async function (req, res) {
  storeManager
    .getProductsTop()
    .then((productTypes) => res.json(productTypes))
    .catch((error) => res.json([]));
});

router.get("/category/", async function (req, res) {
  storeManager
    .getProductType()
    .then((productTypes) => res.json(productTypes))
    .catch((error) => res.json([]));
});

router.get("/category/:type_id", async function (req, res) {
  let { orderby, sort, outofstock } = req.query;

  orderby = orderby == null ? "" : orderby;
  sort = sort == null ? "" : sort;
  outofstock = outofstock == null ? "" : outofstock;

  const type_id = req.params.type_id;

  let scheme = Joi.object({
    product_id: Joi.number().min(1).required(),
  });

  let sResult = scheme.validate({ product_id: type_id });

  if (sResult.error !== undefined) {
    res.json([]);
    return;
  }

  storeManager
    .getProducts(
      type_id,
      orderby,
      sort.toLowerCase() == "desc",
      outofstock == "yes"
    )
    .then((productTypes) => res.json(productTypes))
    .catch((error) => res.json([]));
});

router.get("/search/:search_name", async function (req, res) {
  let { orderby, sort, outofstock } = req.query;
  const search = req.params.search_name;

  orderby = orderby == null ? "" : orderby;
  sort = sort == null ? "" : sort;
  outofstock = outofstock == null ? "" : outofstock;

  let scheme = Joi.object({
    search_name: Joi.string().min(3).required(),
  });

  let sResult = scheme.validate({ search_name: search });

  if (sResult.error !== undefined) {
    res.json([]);
    return;
  }

  storeManager
    .getProductsSearch(
      search,
      orderby,
      sort.toLowerCase() == "desc",
      outofstock == "yes"
    )
    .then((productTypes) => res.json(productTypes))
    .catch((error) => res.json([]));
});

router.get("/product/:product_id", async function (req, res) {
  const prod_id = req.params.product_id;

  let scheme = Joi.object({
    product_id: Joi.number().min(1).required(),
  });

  let sResult = scheme.validate({ product_id: prod_id });

  if (sResult.error !== undefined) {
    res.sendStatus(404);
    return;
  }

  storeManager
    .getProduct(prod_id)
    .then((product) => {
      if (product != null) {
        res.json(product);
      } else {
        res.sendStatus(404);
      }
    })
    .catch((error) => res.sendStatus(404));
});

module.exports = router;



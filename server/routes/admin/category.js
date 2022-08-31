const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { checkAdminAuthorizationToken } = require("../../module/authorize");
const ProductAdminManager = require("../../manager-admin/ProductAdminManager");
const productAdminManager = ProductAdminManager();

router.get("/", checkAdminAuthorizationToken, async function (req, res) {
  productAdminManager
    .getProductType()
    .then((productTypes) => res.json(productTypes))
    .catch((error) => res.json([]));
});

router.put("/", checkAdminAuthorizationToken, async function (req, res) {
  let scheme = Joi.object({
    id: Joi.number().integer().required(),
    name: Joi.string().min(1).required(),
  });

  let sResult = scheme.validate(req.body);

  if (sResult.error !== undefined) {
    res.json({
      status: "error",
      message: sResult.error.details[0].message,
    });
    return;
  }
  let iObject = {
    id: req.body.id,
    name: req.body.name,
  };

  productAdminManager
    .updateCategory(iObject)
    .then((updateStatus) =>
      res.json({
        status: updateStatus > 0 ? "success" : "error",
        message:
          updateStatus > 0 ? "Category updated" : "Could not update category",
      })
    )
    .catch((error) =>
      res.json({
        status: "error",
        message: "Could not update category",
      })
    );
});

router.get(
  "/product/:type_id",
  checkAdminAuthorizationToken,
  async function (req, res) {
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

    productAdminManager
      .getProducts(
        type_id,
        orderby,
        sort.toLowerCase() == "desc",
        outofstock == "yes"
      )
      .then((productTypes) => res.json(productTypes))
      .catch((error) => res.json([]));
  }
);

module.exports = router;
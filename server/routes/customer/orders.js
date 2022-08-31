const express = require("express");
const router = express.Router();
const Joi = require("joi");
const StoreManager = require("../../manager/store-manager");
const storeManager = StoreManager();

const { checkAuthorizationToken } = require("../../module/authorize");

router.get("/", checkAuthorizationToken, async function (req, res) {
  storeManager
    .getOrders(req.user.user_id, false)
    .then((orderInfo) => res.json(orderInfo))
    .catch((error) => res.json([]));
});

router.get("/:order_id", checkAuthorizationToken, async function (req, res) {
  const { order_id } = req.params;

  let scheme = Joi.object({
    order_id: Joi.number().min(1).required(),
  });

  let sResult = scheme.validate(req.params);

  if (sResult.error !== undefined) {
    res.json({
      status: "error",
      message: sResult.error.details[0].message,
    });

    return;
  }
  storeManager
    .getOrder(order_id, req.user.user_id)
    .then((orderInfo) =>
      res.json({ status: "success", message: "", order: orderInfo })
    )
    .catch((error) =>
      res.json({ status: "error", message: "Order could not be found" })
    );
});

router.get(
  "/:order_id/items",
  checkAuthorizationToken,
  async function (req, res) {
    const { order_id } = req.params;

    let scheme = Joi.object({
      order_id: Joi.number().min(1).required(),
    });

    let sResult = scheme.validate(req.params);

    if (sResult.error !== undefined) {
      res.json({
        status: "error",
        message: sResult.error.details[0].message,
      });

      return;
    }
    storeManager
      .getOrder(order_id, req.user.user_id)
      .then((cart_info) => {
        if (cart_info != null) {
          return cart_info;
        }
        return Promise.reject();
      })
      .then(
        (order_info) =>
          (cartItems = storeManager.getOrderProducts(order_info.id))
      )
      .then((orderInfo) => res.json(orderInfo))
      .catch((error) => res.json([]));
  }
);

module.exports = router;
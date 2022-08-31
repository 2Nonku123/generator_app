const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { checkAdminAuthorizationToken } = require("../../module/authorize");
const OrderAdminManager = require("../../manager-admin/OrderAdminManager");
const orderAdminManager = OrderAdminManager();

router.get("/", checkAdminAuthorizationToken, async function (req, res) {
  orderAdminManager
    .getOrders()
    .then((orderInfo) => res.json(orderInfo))
    .catch((error) => res.json([]));
});

router.get(
  "/search/id/:search_id",
  checkAdminAuthorizationToken,
  async function (req, res) {
    const search =
      req.params.search_id == null ? 0 : req.params.search_id.trim();
    let scheme = Joi.object({
      search_id: Joi.number().integer().min(1).required(),
    });

    let sResult = scheme.validate({ search_id: search });

    if (sResult.error !== undefined) {
      res.json([]);
      return;
    }
    orderAdminManager
      .getOrdersByID(search)
      .then((orderInfo) => res.json(orderInfo))
      .catch((error) => res.json([]));
  }
);

router.get(
  "/search/name/:search_text",
  checkAdminAuthorizationToken,
  async function (req, res) {
    const search =
      req.params.search_text == null ? "" : req.params.search_text.trim();
    let scheme = Joi.object({
      search_text: Joi.string().min(3).required(),
    });

    let sResult = scheme.validate({ search_text: search });

    if (sResult.error !== undefined) {
      res.json([]);
      return;
    }
    orderAdminManager
      .getOrdersByName(search)
      .then((orderInfo) => res.json(orderInfo))
      .catch((error) => res.json([]));
  }
);

router.get(
  "/:order_id",
  checkAdminAuthorizationToken,
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
    orderAdminManager
      .getOrder(order_id)
      .then((orderInfo) =>
        res.json({ status: "success", message: "", order: orderInfo })
      )
      .catch((error) =>
        res.json({ status: "error", message: "Order could not be found" })
      );
  }
);

router.get(
  "/:order_id/items",
  checkAdminAuthorizationToken,
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
    orderAdminManager
      .getOrder(order_id)
      .then((order_info) => {
        if (order_info != null) {
          return order_info;
        }

        return Promise.reject();
      })
      .then((order_info) =>
        orderAdminManager.getOrderProducts(order_info.order_id)
      )
      .then((orderInfo) => res.json(orderInfo))
      .catch((error) => {
        res.json([]);
      });
  }
);

router.put(
  "/:order_id/status",
  checkAdminAuthorizationToken,
  async function (req, res) {
    const { order_id } = req.params;
    const { status_id } = req.body;
    let response;

    let scheme = Joi.object({
      order_id: Joi.number().min(1).required(),
      status_id: Joi.number().min(4).max(7).required(),
    });

    let sResult = scheme.validate({
      order_id: req.params.order_id,
      status_id: req.body.status_id,
    });

    if (sResult.error !== undefined) {
      res.json({
        status: "error",
        message: sResult.error.details[0].message,
      });

      return;
    }

    orderAdminManager
      .getOrder(order_id)
      .then((order_info) => {
        if (order_info != null) {
          if (order_info.order_status_id == 2) {
            if (status_id != 6 && status_id != 7) {
              return Promise.reject({
                status: "error",
                message: "You can only set an order as, cancelled or collected",
              });
            }
          } else if (order_info.order_status_id == 3) {
            if ((status_id != 4) & (status_id != 5) && status_id != 7) {
              return Promise.reject({
                status: "error",
                message:
                  "You can only set an order as, cancelled, delivered or on route",
              });
            }
          } else if (order_info.order_status_id == 4) {
            if (status_id != 5 && status_id != 7) {
              return Promise.reject({
                status: "error",
                message:
                  "You can only set an order as, cancelled or delivered ",
              });
            }
          } /*else {
              return Promise.reject({
                status: "error",
                message: "Invalid order status not allowed",
              });
            }*/

          return orderAdminManager.updateOrderStatus(status_id, order_id);
        }

        return Promise.reject();
      })
      .then((status_result) => {
        // if order is cancelled than we reverse the stock

        response = {
          status: status_result > 0 ? "success" : "error",
          message: status_result
            ? "Order status updated"
            : "Could not update order status",
        };
        if (status_id == 7) {
          return orderAdminManager.updateProductQauntityReverse(order_id);
        }
        return 0;
      })
      .then((result) => res.json(response))
      .catch((error) => {
        error.status != null && error.message != null
          ? res.json(error)
          : res.json({
              status: "error",
              message: "Could not set order status",
            });
      });
  }
);

module.exports = router;
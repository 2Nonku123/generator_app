const express = require("express");
const router = express.Router();
const Joi = require("joi");
const StoreManager = require("../../manager/store-manager");
const storeManager = StoreManager();
const { checkAuthorizationToken } = require("../../module/authorize");

router.get("/", checkAuthorizationToken, async function (req, res) {
  storeManager
    .getOrderCart(req.user.user_id)
    .then((cart_info) => {
      if (cart_info != null) {
        return cart_info;
      }
      return Promise.reject();
    })
    .then(
      (cart_info) =>
        (cartItems = storeManager.getOrderProductsCart(cart_info.id))
    )
    .then((cart_out) => res.json(cart_out))
    .catch((error) => res.json([]));
});

router.post("/", checkAuthorizationToken, async function (req, res) {
  const { product_id, quantity } = req.body;

  let scheme = Joi.object({
    product_id: Joi.number().min(1).required(),
    quantity: Joi.number().min(1).required(),
  });

  let sResult = scheme.validate(req.body);

  if (sResult.error !== undefined) {
    res.json({
      status: "error",
      message: sResult.error.details[0].message,
    });

    return;
  }

  let cartInfo = await storeManager.getOrderCart(req.user.user_id);

  // if cart does not exist
  if (cartInfo == null) {
    // if we can create a new cart
    if ((await storeManager.addOrder(req.user.user_id)) > 0) {
      cartInfo = await storeManager.getOrderCart(req.user.user_id);
    }
  }

  if (cartInfo == null) {
    res.json({
      status: "error",
      message: "Could not add item to cart",
    });

    return;
  }

  const product = await storeManager.getProduct(product_id);

  if (product == null) {
    res.json({
      status: "error",
      message: "Could not find product",
    });

    return;
  } else if (product.quantity <= 0 || product.quantity < quantity) {
    res.send({
      status: "error",
      message:
        product.quantity <= 0
          ? "Product is out of stock"
          : `Your selected quantity is too high, only ${product.quantity} item(s) are in stock`,
    });
    return;
  }

  const order_product = await storeManager.getOrderProduct(
    cartInfo.id,
    product.id
  );

  let result = 0;
  if (order_product == null) {
    result = await storeManager.addOrderProduct(
      cartInfo.id,
      product.id,
      product.product_type_id > 1 && product.product_type_id < 5,
      product.price,
      quantity
    );
  } else {
    result = await storeManager.updateOrderProduct(
      order_product.id,
      product.price,
      quantity
    );
  }

  res.send({
    status: result > 0 ? "success" : "error",
    message:
      result > 0
        ? order_product == null
          ? "Item Added to cart"
          : "Cart item updated"
        : "Could not add item to cart",
  });
});

router.put("/", checkAuthorizationToken, async function (req, res) {
  const { product_id, quantity } = req.body;

  let scheme = Joi.object({
    product_id: Joi.number().min(1).required(),
    quantity: Joi.number().min(1).required(),
  });

  let sResult = scheme.validate(req.body);

  if (sResult.error !== undefined) {
    res.json({
      status: "error",
      message: sResult.error.details[0].message,
    });

    return;
  }

  let cartInfo = await storeManager.getOrderCart(req.user.user_id);

  if (cartInfo == null) {
    res.json({
      status: "error",
      message: "Could not update cart item",
    });

    return;
  }

  const product = await storeManager.getProduct(product_id);

  if (product == null) {
    res.json({
      status: "error",
      message: "Could not find product",
    });

    return;
  } else if (product.quantity <= 0 || product.quantity < quantity) {
    res.send({
      status: "error",
      message:
        product.quantity <= 0
          ? "Product is out of stock"
          : `Your selected quantity is too high, only ${product.quantity} item(s) are in stock`,
    });
    return;
  }

  const order_product = await storeManager.getOrderProduct(
    cartInfo.id,
    product.id
  );

  let result = 0;
  if (order_product != null) {
    result = await storeManager.updateOrderProduct(
      order_product.id,
      product.price,
      quantity
    );
  }

  res.send({
    status: result > 0 ? "success" : "error",
    message: result > 0 ? "Cart item updated" : "Could not update cart item",
  });
});

router.delete("/", checkAuthorizationToken, async function (req, res) {
  let cartInfo = await storeManager.getOrderCart(req.user.user_id);

  if (cartInfo == null) {
    res.json({
      status: "error",
      message: "Could not find cart items",
    });
    return;
  }

  const result = await storeManager.clearCart(cartInfo.id);

  res.send({
    status: result > 0 ? "success" : "error",
    message: result > 0 ? "Cart Cleared" : "Cart is empty",
  });
});

router.delete(
  "/:product_id",
  checkAuthorizationToken,
  async function (req, res) {
    const { product_id } = req.params;

    let scheme = Joi.object({
      product_id: Joi.number().min(1).required(),
    });

    let sResult = scheme.validate(req.params);

    if (sResult.error !== undefined) {
      res.status(400).send(sResult.error.details[0].message);
      return;
    }

    let cartInfo = await storeManager.getOrderCart(req.user.user_id);

    if (cartInfo == null) {
      res.sendStatus(400);
      return;
    }

    const result = await storeManager.removeOrderProduct(
      cartInfo.id,
      product_id
    );

    res.send({
      status: result > 0 ? "success" : "error",
      message: result > 0 ? "Item removed from cart" : "Item not found in cart",
    });
  }
);

router.post(
  "/complete/card",
  checkAuthorizationToken,
  async function (req, res) {
    const {
      is_delivery,
      delivery_address,
      card_number,
      card_month,
      card_year,
      card_cvc,
    } = req.body;

    let scheme = Joi.object({
      card_number: Joi.string()
        .pattern(/^[0-9]+$/)
        .min(16)
        .max(16)
        .required()
        .messages({
          "string.pattern.base": `Card Number must be must be 16 digital values`,
        }),
      card_month: Joi.number().min(1).max(12).required(),
      card_year: Joi.number().min(20).max(99).required(),
      card_cvc: Joi.string()
        .pattern(/^[0-9]+$/)
        .min(3)
        .max(3)
        .messages({ "string.pattern.base": `CVC must be 3 digital values` })
        .required(),
      is_delivery: Joi.number().min(0).max(1).required(),
      delivery_address: Joi.string().empty().min(0).max(250).optional(),
    });

    let sResult = scheme.validate(req.body);
    if (sResult.error !== undefined) {
      res.json({
        status: "error",
        message: sResult.error.details[0].message,
      });
      return;
    } else if (is_delivery == 1 && delivery_address.length < 30) {
      res.json({
        status: "error",
        message: "Invalid delivery address",
      });
      return;
    }

    let cartInfo = await storeManager.getOrderCart(req.user.user_id);
    if (cartInfo == null) {
      res.json({
        status: "error",
        message: "Cart does not have any items",
      });
      return;
    }

    // Check if cart has any items inside
    let cartTotal = await storeManager.getOrderTotals(cartInfo.id);
    if (cartTotal.total_quantity == 0 || cartTotal.total_price == 0) {
      res.json({
        status: "error",
        message: "Cart does not have any items",
      });
      return;
    }

    // check Cart quantity is enough with stock
    const invalidQuantity = await storeManager.checkOrderQuantity(cartInfo.id);
    if (invalidQuantity.invalid_products > 0) {
      res.json({
        status: "error",
        message:
          "There are some items in your cart that may be out of stock or are less",
      });
      return;
    }

    // try to add cart payment
    const paymentSuccess = await storeManager.addOrderPayment(
      cartTotal.total_price,
      "CREDIT CARD",
      `Card Number: ${card_number}, Card Date: ${card_month}/${card_year}, Card CVC: ${card_cvc}`,
      cartInfo.id
    );

    if (paymentSuccess == 0) {
      res.json({
        status: "error",
        message: "Could not add cart payment",
      });
      return;
    }

    // update product quantity in the product table
    const updateProducts = await storeManager.updateProductQauntity(
      cartInfo.id
    );
    if (updateProducts == 0) {
      storeManager.clearPayments(cartInfo.id).then().catch();

      res.json({
        status: "error",
        message: "Could not complete cart order, status 102",
      });
      return;
    }

    // complete order
    const result = await storeManager.updateOrder(
      cartTotal.total_price,
      cartTotal.total_quantity,
      is_delivery == 1,
      delivery_address,
      is_delivery == 1 ? 3 : 2,
      cartInfo.id
    );

    if (result > 0) {
      res.json({ status: "success", message: "Cart completed" });
    } else {
      // reverse cart payment and product quantity update
      storeManager.clearPayments(cartInfo.id).then().catch();
      storeManager.updateProductQauntityReverse(cartInfo.id).then().catch();

      res.json({
        status: "error",
        message: "Could not complete cart order, status 302",
      });
    }
  }
);

module.exports = router;
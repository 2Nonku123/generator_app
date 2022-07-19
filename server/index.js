const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const pg = require("pg");
const axios = require("axios");
const Hashids = require("hashids");
const Joi = require("joi");

const CustomerManager = require("./manager/customer-manager");
const StoreManager = require("./manager/store-manager");
const Pool = pg.Pool;
require("dotenv").config();

/// Secret Constants
const jwt_key = process.env.ACCESS_TOKEN_SECRET || "";
const connection_string = process.env.DATABASE_URL || "";

// app use code
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

////////////////////////////

// Database config
const { parse } = require("pg-connection-string");

const config = parse(connection_string);

/*config.ssl = {
  rejectUnauthorized: false,
};*/
const pool = new Pool(config);
//////////////////////////////

const customerManager = CustomerManager(pool);
const storeManager = StoreManager(pool);
const PORT = process.env.PORT || 4017;

// hash all ids so that they are predictable by the user
function hashID(value, saltKey) {
  let hashids = new Hashids(saltKey);
  value.forEach((element) => {
    element.id = hashids.encode(element.id)[0];
  });
}

// login routes

app.post("/api/login", async function (req, res) {
  const { user_name, password } = req.body;

  let scheme = Joi.object({
    user_name: Joi.string().alphanum().min(5).max(25).required(),
    password: Joi.string().min(5).max(15).required(),
  });

  let sResult = scheme.validate(req.body);

  if (sResult.error !== undefined) {
    res.json({
      status: "error",
      message: sResult.error.details[0].message,
      token: "",
    });

    return;
  }

  customerManager
    .getUserByUserName(user_name)
    .then((user_account) => {
      if (bcrypt.compareSync(password, user_account.password)) {
        const user = {
          user_id: user_account.id,
          first_name: user_account.first_name,
          lastname: user_account.lastname,
          user_type: user_account.user_type_id == 1 ? "customer" : "admin",
        };
        const accessKey = jwt.sign(user, jwt_key, {
          expiresIn: "5h",
        });

        res.json({
          status: "success",
          message: "Login was successful",
          token: accessKey,
        });
      } else {
        res.json({
          status: "error",
          message: "User could not be found, wrong user name or password",
          token: "",
        });
      }
    })
    .catch((error) => {
      res.json({
        status: "error",
        message: "User could not be found, wrong user name or password",
        token: "",
      });
    });
});

app.post("/api/signup", async function (req, res) {
  const {
    user_name,
    password,
    first_name,
    lastname,
    contact_number,
    email_address,
  } = req.body;

  let scheme = Joi.object({
    user_name: Joi.string().alphanum().min(5).max(25).required(),
    password: Joi.string().min(5).max(15).required(),
    first_name: Joi.string().min(2).max(50).required(),
    lastname: Joi.string().min(2).max(50).required(),
    contact_number: Joi.string().min(10).max(13).empty("").optional(),
    email_address: Joi.string().email().min(10).max(128).empty("").optional(),
  });

  let sResult = scheme.validate(req.body);

  if (sResult.error !== undefined) {
    res.status(400).send(sResult.error.details[0].message);
    return;
  }

  let user_account = await customerManager.getUserByUserName(user_name);

  if (user_account != null && user_account.id != null) {
    res.json({
      status: "error",
      message: "Account aleady exists",
    });
    return;
  }

  const encrypted_password = bcrypt.hashSync(password, 10);
  const result = await customerManager.registerUser(
    first_name,
    lastname,
    encrypted_password,
    user_name,
    email_address,
    contact_number,
    1
  );

  if (result > 0) {
    user_account = await customerManager.getUserByUserName(user_name);
    const user = {
      user_id: user_account.id,
      first_name: first_name,
      lastname: lastname,
      user_type: user_account.user_type_id == 1 ? "customer" : "admin",
    };
    const accessKey = jwt.sign(user, jwt_key, {
      expiresIn: "5h",
    });
    res.json({
      status: "success",
      message: "Signup success",
      token: accessKey,
    });
  } else {
    res.json({
      status: "error",
      message: "Could not sign up user",
    });
  }
});

//////////////////

// Access store routes

app.get("/store/top", async function (req, res) {
  storeManager
    .getProductsTop()
    .then((productTypes) => res.json(productTypes))
    .catch((error) => res.json([]));
});

app.get("/store/category/", async function (req, res) {
  storeManager
    .getProductType()
    .then((productTypes) => res.json(productTypes))
    .catch((error) => res.json([]));
});

app.get("/store/category/:type_id", async function (req, res) {
  const { orderby, sort, outofstock } = req.query;
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

app.get("/store/product/search/:search_name", async function (req, res) {
  const { orderby, sort, outofstock } = req.query;
  const search = req.params.search_name;

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

app.get("/store/product/:product_id", async function (req, res) {
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

//////////////////////////////////

// cart routes

app.get("/cart/", checkAuthorizationToken, async function (req, res) {
  storeManager
    .getOrderCart(req.user.user_id)
    .then((cart_info) => {
      if (cart_info != null) {
        return cart_info;
      }
      return Promise.reject();
    })
    .then(
      (cart_info) => (cartItems = storeManager.getOrderProducts(cart_info.id))
    )
    .then((cart_out) => res.json(cart_out))
    .catch((error) => res.json([]));
});

app.post("/cart/", checkAuthorizationToken, async function (req, res) {
  const { product_id, quantity } = req.body;

  let scheme = Joi.object({
    product_id: Joi.number().min(1).required(),
    quantity: Joi.number().min(1).required(),
  });

  let sResult = scheme.validate(req.body);

  if (sResult.error !== undefined) {
    res.status(400).send(sResult.error.details[0].message);
    return;
  }

  let cartInfo = await storeManager.getOrderCart(req.user.user_id);
  if (cartInfo == null) {
    if ((await storeManager.addOrder(req.user.user_id)) > 0) {
      cartInfo = await storeManager.getOrderCart(req.user.user_id);
    }
  }

  if (cartInfo == null) {
    res.sendStatus(400);
    return;
  }

  const product = await storeManager.getProduct(product_id);

  if (product == null) {
    res.sendStatus(404);
    return;
  } else if (product.quantity <= 0 || product.quantity < quantity) {
    res.send({
      status: 0,
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
    status: result > 0 ? 1 : 0,
    message:
      result > 0
        ? order_product == null
          ? "Item Added to cart"
          : "Cart item updated"
        : "Could not add item to cart",
  });
});

app.delete("/cart/", checkAuthorizationToken, async function (req, res) {
  let cartInfo = await storeManager.getOrderCart(req.user.user_id);

  if (cartInfo == null) {
    res.sendStatus(400);
    return;
  }

  const result = await storeManager.clearCart(cartInfo.id);

  res.send({
    status: result > 0 ? "success" : "error",
    message: result > 0 ? "Cart Cleared" : "Cart is empty",
  });
});

app.delete(
  "/cart/:product_id",
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

app.post("/cart/complete/", async function (req, res) {
  const { method, payment_details } = req.body;

  let scheme = Joi.object({
    method: Joi.string().min(2).required(),
    payment_details: Joi.string().min(1).required(),
  });

  let sResult = scheme.validate(req.body);

  if (sResult.error !== undefined) {
    res.status(400).send(sResult.error.details[0].message);
    return;
  }

  let cartInfo = await storeManager.getOrderCart(req.user.user_id);
  if (cartInfo == null) {
    res.sendStatus(400);
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
    status: result > 0 ? 1 : 0,
    message:
      result > 0
        ? order_product == null
          ? "Item Added to cart"
          : "Cart item updated"
        : "Could not add item to cart",
  });
});

//////////////////////////

function checkAuthorizationToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ");

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token[0], jwt_key, (err, user) => {
    if (!err) {
      req.user = user;
      next();
    } else {
      res.sendStatus(403);
    }
  });
}

app.listen(PORT, function () {
  console.log(`App started on port ${PORT}`);
});

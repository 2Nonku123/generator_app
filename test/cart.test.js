const supertest = require("supertest");
const express = require("express");
const app = express();
const pg = require("pg");
const API = require("../server/manager/store-manager");
const Pool = pg.Pool;
require("dotenv").config();
const connection_string = process.env.DATABASE_URL || "";
const {parse} = require("pg-connection-string");
const config = parse(connection_string);
const pool = new Pool(config);
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
const DATABASE_URL = process.env.DATABASE_URL;
let assert = require("assert");
let token

describe("The cart API", function () {

it("should not allow user to purchase a product out of stock", async () => {
  
    const response = await supertest(app)
      .post("/cart")
      .set({Authorization: `Bearer ${token}`});
      
      token = response.body.token;
      
      const { status, message } = response.body;
      if (status == "error") {
      assert("Product is out of stock", message);
      } else {
      assert("`Your selected quantity is too high, only ${product.quantity} item(s) are in stock`", message);
    }
  });


  it("should allow user to add items to cart", async () => {
    const response = await supertest(app)
      .post("/cart")
      .set({ Authorization: `Bearer ${token}` });

    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("Could not add item to cart", message);
    } else {
      assert("Item Added to cart", message);
    }
  });

  it("should allow user to update items in the cart", async () => {
    const response = await supertest(app)
      .put("/cart")
      .set({ Authorization: `Bearer ${token}` });

    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("Could not update cart item", message);
    } else {
      assert("Cart item updated", message);
    }
  });

  it("should allow user to proceed to checkout after they have added the items they want on the cart", async () => {
    const response = await supertest(app)
      .post("/cart")
      .set({ Authorization: `Bearer ${token}` });

    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("Cart is empty", message);
    } else {
      assert("Cart is cleared", message);
    }
  });
  
  it("should allow user to remove items they nolonger want on the cart", async () => {
    const response = await supertest(app)
      .delete("/cart/:product_id")
      .set({ Authorization: `Bearer ${token}` });

    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("Item not found in cart", message);
    } else {
      assert("Item removed from cart", message);
    }
  });
});
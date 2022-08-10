const supertest = require("supertest"); 
const express = require("express");
const app = express();
const pg = require("pg");
const API =require("../server/manager/customer-manager");
const Pool = pg.Pool;
require("dotenv").config();
const connection_string = process.env.DATABASE_URL || "";
const {parse} = require("pg-connection-string");
const config = parse (connection_string);
const pool = new Pool(config);
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const DATABASE_URL = process.env.DATABASE_URL;
let assert = require("assert");
let token

describe("The orders API", function () {

it("should allow admin to access orders made by customers", async () => {
    const response = await supertest(app)
      .get("/admin/order/:order_id")
      .set({ Authorization: `Bearer ${token}` });

    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("Order could not be found", message);
    } else {
      assert("Cart item updated", message);
    }
  });
//new
  it("should allow admin to update the status of orders made by customers", async () => {
    const response = await supertest(app)
      .put("/admin/order/:order_id/status")
      .set({ Authorization: `Bearer ${token}` });

    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("You can only set an order as, cancelled or delivered", message);
    } else {
      assert("Order status updated", message);
    }
  });

  //should allow customers to get access to their orders
});
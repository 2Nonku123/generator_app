const supertest = require("supertest");
const express = require("express");
const app = express();
const pg = require("pg");
const API = require("../server/manager/store-manager");
const Pool = pg.Pool;
require("dotenv").config();
const connection_string = process.env.DATABASE_URL || "";
const { parse } = require("pg-connection-string");

const config = parse(connection_string);
const pool = new Pool(config);

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const DATABASE_URL = process.env.DATABASE_URL;

let assert = require("assert");
let token


describe("The Payment API", function () {

  it("should allow user to pay", async () => {
    const response = await supertest(app)
    .post("/cart/complete/card")
    .set({ Authorization: `Bearer ${token}`});
    token = response.body.token;
    const { status, message}= response.body;
    if (status == "error") {
      assert("Could not add cart payment", message);
    } else {
      assert("Cart completed")
    }
    
  });
  it("should not allow user to pay if there is insufficient stock of items on cart", async () => {
    const response = await supertest(app)
    .post("/cart/complete/card")
    .set({ Authorization: `Bearer ${token}`});
    token = response.body.token;
    const { status, message}= response.body;
    if (status == "error") {
      assert("Could not complete cart order, status 302", message);
    } else {
      assert("Cart completed")
    }
    
  });


});
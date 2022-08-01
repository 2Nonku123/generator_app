const supertest = require("supertest");
const express = require("express");
const app = express();
const pg = require("pg");

const API = require("../server/manager/customer-manager");
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
describe("The User profile API", function () {

it("should be able to update the users personal information", async () => {
    const response = await supertest(app).put("/profile/personal").send({
      
      first_name: "Mark",
      lastname: "Evans",
      
    });
    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("Could not update personal information", message);
    } else {
      assert("Personal information updated", message);
    }
  });

  it("should be able to update the users contact information", async () => {
    const response = await supertest(app).put("/profile/contact").send({
      
      contact_number: "0986653563",
      email_address: "Evans@gmail.com",
      
    });
    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("Could not update contact information", message);
    } else {
      assert("Contact information updated", message);
    }
  });
  it("should be able to update the users password", async () => {
    const response = await supertest(app).put("/profile/password").send({
      
      password: "jacob765",
      confirm_password: "jacob765",
      
    });
    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("Both passwords must match", message);
    } else {
      assert("password updated", message);
    }
  });

  it("should be able to add users address", async () => {
    const response = await supertest(app).post("/profile/address").send({
     
      housenumber: "766",
      street: "south st",
      province: "gauteng",
      postal_code: "1400"
        
      
    });
    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("Could not add address", message);
    } else {
      assert("address added", message);
    }
  });

  it("should be able to update users new address", async () => {
    const response = await supertest(app).put("/profile/address").send({
      
      address_id: "87",
    housenumber: "766",
    street: "south st",
    province: "gauteng",
    postal_code: "1400"
      
    });
    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("Could not update address", message);
    } else {
      assert("Address updated", message);
    }
  });

  it("should be able to remove users address", async () => {
    const response = await supertest(app).put("/profile/address").send({
      
      address_id:"87"
      
    });
    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("Could not find address", message);
    } else {
      assert("Address removed", message);
    }
  });
})
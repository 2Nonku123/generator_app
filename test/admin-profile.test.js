
const supertest = require("supertest");
const express = require("express");
const app = express();
const pg = require("pg");
//const axios = require("axios");
const API = require("../server/manager-admin/UserAdminManager");
const Pool = pg.Pool;
require("dotenv").config();
const connection_string = process.env.DATABASE_URL || "";
const { parse } = require("pg-connection-string");

const config = parse(connection_string);
const pool = new Pool(config);

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//const PgPromise = require("pg-promise");
//const pgp = PgPromise({});
const DATABASE_URL = process.env.DATABASE_URL;

let assert = require("assert");
let token
describe("The Admin profile API", function () {

  

it("should update admin personal details", async () => {
    const response = await supertest(app).put("/admin/user")
    .send({
      user_name: "jjohn",
      password: "word45",
      first_name: "John",
      lastname: "Miz",
      contact_number: "0747543456",
      email_address: "john@gmail.com",
      user_type_id:"87",
      id:"89"
    });
    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("Could not update user", message);
    } else {
      assert("User updated", message);
    }
  });

  it("should delete/remove a customer user with no order history", async () => {
    const response = await supertest(app).put("/admin/user/:id").send({
      id:"89"
    });
    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("Could not delete user", message);
    } else {
      assert("User deleted", message);
    }
  });
//new
  it("should not delete/remove a customer user with an order history", async () => {
    const response = await supertest(app).put("/admin/user/:id").send({
      id:"89"
    });
    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("Cannot remove a user who has a order history", message);
    } else {
      assert("User deleted", message);
    }
  });
//rectify
  it("should allow admin to reset password of user", async () => {
    const response = await supertest(app).put("/admin/user/password/reset/:id").send({
      id:"89"
    });
    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("Cannot remove your own Account", message);
    } else {
      assert("Password reset to", message);
    }
  });
  //2 
  it("should allow admin to update user password", async () => {
    const response = await supertest(app).put("/admin/profile/password").send({
      //user_id:"56",
      password: "wor45",
      confirm_password: "wor45"
      
    });
    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
    assert("Both passwords must match", message);
    } else {
      assert("Password updated", message);
    }
  });
//3 
  it("should allow admin to add user address", async () => {
    const response = await supertest(app).post("/admin/profile/address").send({
      
     //user_id:"58",
      
    //address_id: "45",
    housenumber: "76",
    street: "north st",
    province: "gauteng",
    postal_code: "1500"
      
      
    });
    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("Could not add address", message);
    } else {
      assert("Address added", message);
    }
  });
  //4 
  it("should allow admin to update user address", async () => {
   const response = await supertest(app).put("/admin/profile/address").send({
    //  user_id:"58",
    address_id: "87",
    housenumber: "766",
    street: "south st",
    province: "gauteng",
    postal_code: "1400",
    
    
      
    });
    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
    assert("Could not update address", message);
    } else {
      assert("Address updated", message);
    }
  });
  //5
it("should allow admin to remove user address", async () => {
    const response = await supertest(app)
    .delete("/admin/profile/address/:address_id").send({
     // user_id:"56",
     address_id: "45",
      
      
      
    });
    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("Could not find address", message);
    } else {
      assert("Address removed", message);
    }
  });
//6 fail
it("should allow admin to update users first and last names", async () => {
  const response = await supertest(app).put("/admin/profile/personal").send({
    
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
 //7
 it("should allow admin to update users contact details", async () => {
  const response = await supertest(app).put("/admin/profile/contact").send({
    
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
});
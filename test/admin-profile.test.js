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

  it("should delete/remove admin user", async () => {
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

  it("should reset password of admin user", async () => {
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
  //it("should update admin password", async () => {
    //const response = await supertest(app).put("admin/user/:user_id/password").send({
      //user_id:"56",
      //password: "wor45",
      //confirm_password: "wor45"
      
      
      
    //});
    //token = response.body.token;
    //const { status, message } = response.body;
   // if (status == "error") {
    //("Both passwords must match", message);
    //} else {
     // assert("Password updated", message);
    //}
  //});

  //it("should add admin address", async () => {
    //const response = await supertest(app).post("admin/user/:user_id/address").send({
      
     //user_id:"58",
      
    //address_id: "45",
   // housenumber: "76",
    //street: "north st",
    //province: "gauteng",
    //postal_code: "1500"
      
      
    //});
    //token = response.body.token;
    //const { status, message } = response.body;
    //if (status == "error") {
    //  assert("Could not add address", message);
    //} else {
    //  assert("Address added", message);
    //}
  //});
  //it("should update admin address", async () => {
   // const response = await supertest(app).put("admin/user/:user_id/address").send({
    //  user_id:"58",
    //  address_id: "87",
    //housenumber: "766",
    //street: "south st",
    //province: "gauteng",
    //postal_code: "1400",
    
    
      
    //});
    //token = response.body.token;
    //const { status, message } = response.body;
   // if (status == "error") {
   // assert("Could not update address", message);
   // } else {
    //  assert("Address updated", message);
   // }
  //});
//it("should remove admin address", async () => {
    //const response = await supertest(app).delete("admin/user/:user_id/address/:address_id").send({
     // user_id:"56",
     // address_id: "45",
      
      
      
   // });
    //token = response.body.token;
    //const { status, message } = response.body;
    //if (status == "error") {
     // assert("Could not find address", message);
    //} else {
     // assert("Address removed", message);
   // }
  //});
});
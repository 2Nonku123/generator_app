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
      assert("User updated", message);
    } else {
      assert("Could not update user", message);
    }
  });

  it("should delete/remove admin user", async () => {
    const response = await supertest(app).put("/admin/user/:id").send({
      id:"89"
    });
    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("User deleted", message);
    } else {
      assert("Could not delete user", message);
    }
  });

  //it("should update admin password", async () => {
    //const response = await supertest(app).put("admin/user/:user_id/password").send({
     // user_id:"56",
     // password: "wor45",
      //confirm_password: "wor45"
      
      
    //});
    //token = response.body.token;
    //const { status, message } = response.body;
    //if (status == "error") {
     // assert("Could not update password", message);
    //} else {
     // assert("Password updated", message);
    //}
  //});
  //it("should update admin address", async () => {
   // const response = await supertest(app).put("admin/user/:user_id/address").send({
    
   // housenumber: "766",
    //street: "south st",
   // province: "gauteng",
   // postal_code: "1400",
   // user_id:"56", 
    //address_id: "87"
      
   // });
    //token = response.body.token;
    //const { status, message } = response.body;
    //if (status == "error") {
      //assert("Address updated", message);
   // } else {
     // assert("Could not update address", message);
   // }
  //});
  //it("should remove admin address", async () => {
    //const response = await supertest(app).delete("admin/user/:user_id/address/:address_id").send({
     // user_id:"56",
     // address_id: "45",
      
      
      
   // });
    //token = response.body.token;
    //const { status, message } = response.body;
   // if (status == "error") {
    //  assert("Address removed", message);
    //} else {
     // assert("Could not find address", message);
    //}
  //});
});
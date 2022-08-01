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
let token
let assert = require("assert");
describe("The Admin registration API", function () {

it("should register a new admin", async () => {
    const response = await supertest(app).post("/admin/user").send({
      user_name: "jjohn",
      password: "word45",
      first_name: "John",
      lastname: "Miz",
      contact_number: "0747543456",
      email_address: "john@gmail.com",
      user_type_id:"87"
    });
    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("User added", message);
    } else {
      assert("Could not add user", message);
    }
  });

  
  //it("should add admin address", async () => {
    //const response = await supertest(app).post("admin/user/:user_id/address").send({
      
      //user_id:"56",
      
    //address_id: "45",
   // housenumber: "76",
    //street: "north st",
    //province: "gauteng",
    //postal_code: "1500"
      
      
    //});
    //token = response.body.token;
    //const { status, message } = response.body;
    //if (status == "error") {
      //assert("Address added", message);
    //} else {
      //assert("Could not add address", message);
    //}
  //});
  
});

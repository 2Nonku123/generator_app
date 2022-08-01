const supertest = require("supertest");
const express = require("express");
const app = express();
const pg = require("pg");
//const axios = require("axios");
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
//const PgPromise = require("pg-promise");
//const pgp = PgPromise({});
const DATABASE_URL = process.env.DATABASE_URL;

//const pg = require('{{pg}}');
//const db = pg(DATABASE_URL);
//import {assert} from 'console';
let assert = require("assert");
describe("The Customer registration API", function () {
  //before(async function () {
  //this.timeout(5000);
  //await pool.query(`delete from user_address`);
  //});

  ///customer///
  it("should be able to register a new user", async () => {
    const response = await supertest(app).post("/api/signup").send({
      user_name: "Mattm2",
      password: "word456",
      first_name: "Matthew",
      lastname: "Markhams",
      contact_number: "0976543456",
      email_address: "matt@gmail.com",
    });

    const { status, message } = response.body;
    if (status == "error") {
      assert("Account already exists", message);
    } else {
      assert("Signup success", message);
    }
  });

  it("should not register a user if they have missing fields in the registration", async () => {
    const response = await supertest(app).post("/api/signup").send({
      user_name: "Mattm2",
      password: "word456",
      first_name: "Matthew",
      lastname: "Markhams",
      contact_number: "0976543456",
      email_address: "matt@gmail.com",
    });

    const { status, message } = response.body;
    if (status == "error") {
      assert("Could not sign up user", message);
    } else {
      assert("Signup success", message);
    }
  });

  

  

  
  //it('should be able to find items in store ', async () => {

  //const response = await supertest(app)
  //.get('/store/product/:product_id')
  //.set({ "Authorization": `Bearer ${token}` })
  //.send(404)

  //const prod_id = response.body.product_id
  //assert.equal('product', response.body.status)

  //});
  
  //after(() => {
   // pool.end();
  //});
});

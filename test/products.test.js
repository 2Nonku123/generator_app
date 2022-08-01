const supertest = require("supertest");
const express = require("express");
const app = express();
const pg = require("pg");
const API = require("../server/manager/store-manager");
const Pool = pg.Pool;
require("dotenv").config();
const connection_string = process.env.DATABASE_URL || "";
const {parse} =  require("pg-connection-string");
const config = parse(connection_string);
const pool = new Pool(config);
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
const DATABASE_URL = process.env.DATABASE_URL;
let assert = require("assert");
let token


describe("The products API", function () {
  it ("should be able to find products in the store", async () => {
    const response = await supertest(app)
    .get("/store/product/:product_id");
    const product_id = response.body;
    assert.equal('success', response.body.status);
  })
 // it ("should not allow user to purchase items not on the cart", async () => {
    //const response = await supertest(app)
    //.get("cart")
    //.set({ Authorization: `Bearer ${token}`});
    //token = response.body.token;
    //const { status, message}= response.body;
   // if (status == "error") {
     // assert("Could not find product", message);
   // } else {
     // assert("Cart item updated")
    //}
    //const {message} = response.body;
   // assert.equal('success', message);
   
//})

  it ("should be able to not allow user to purchase excessive products ", async () => {
    const response = await supertest(app)
    .post("cart")
    //const response = await supertest(app)
      //.post("/cart")
      .set({Authorization: `Bearer ${token}`});
      
      token = response.body.token;
      
      const { status, message } = response.body;
      if (status == "error") {
      assert("<= 0", message);
      } else {
      assert(`Your selected quantity is too high, only ${product.quantity} item(s) are in stock`, message);
    }
  });
    //const product_id = response.body;
    //assert.equal(40, product_id.length);
  //})
 
  it ("should be able to search for items in store by name", async () =>{
    const search_name = "dal";
    const response = await supertest(app).get(`/store/search/${search_name}`);
    const search = respnse.body;
    assert.equal(3, search.length);
  })
});
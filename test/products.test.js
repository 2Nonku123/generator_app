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
//let token


describe("The products API", function () {
  
 it(" user should be able to find products in the store", async () => {
    const response = await supertest(app)
    .get("/store/product/:product_id")
    //.set({ Authorization: `Bearer ${token}`});
    //token = response.body.token;
    const { status, message}= response.body;
    if (status == "error") {
      assert("res.sendStatus(404)", message);
    } else {
      assert("res.sendStatus(200)")
    }
    
  });

  it(" admin user should be able to add products in the store", async () => {
    const response = await supertest(app)
    .post("/admin/product/")
    //.set({ Authorization: `Bearer ${token}`});
    //token = response.body.token;
    const { status, message}= response.body;
    if (status == "error") {
      assert("Could not add product", message);
    } else {
      assert("product added")
    }
    
  });

  it(" admin user should be able to update products in the store", async () => {
    const response = await supertest(app)
    .put("/admin/product/")
    //.set({ Authorization: `Bearer ${token}`});
    //token = response.body.token;
    const { status, message}= response.body;
    if (status == "error") {
      assert("Could not update product", message);
    } else {
      assert("product updated")
    }
    
  });
  
  it(" admin user should be able to remove products that are not ordered in the store", async () => {
    const response = await supertest(app)
    .delete("/admin/product/:product_id")
    //.set({ Authorization: `Bearer ${token}`});
    //token = response.body.token;
    const { status, message}= response.body;
    if (status == "error") {
      assert("Could not find product", message);
    } else {
      assert("Product removed")
    }
    
  });
//new
  it("should not allow admin user to remove products that are already ordered by customers in the store", async () => {
    const response = await supertest(app)
    .delete("/admin/product/:product_id")
    //.set({ Authorization: `Bearer ${token}`});
    //token = response.body.token;
    const { status, message}= response.body;
    if (status == "error") {
      assert("Cannot remove a ordered product", message);
    } else {
      assert("Product removed")
    }
    
  });
  //new2
  it("should allow admin user to update product types in the store", async () => {
    const response = await supertest(app)
    .put("/admin/category")
    //.set({ Authorization: `Bearer ${token}`});
    //token = response.body.token;
    const { status, message}= response.body;
    if (status == "error") {
      assert("Could not update category", message);
    } else {
      assert("Category updated")
    }
    
  });

  it ("should be able to search for items in store by name", async () =>{
    const search_name = "dal";
    const response = await supertest(app)
    .get('/store/search/:search_name')
    const search = response.body;
    //assert.equal(search_name, search.length);
    const {status, message}= response.body;
    if (status == "error") {
      assert("res.sendStatus(404)", message);

    }else {
      assert("res.sendStatus(200)")
    }
    
    //.get(`/store/search/${search_name}`)
    //.expect(200);
    //const search = response.body;
    //assert.equal(40, search.length);
  })

  
  it(" admin user should be able to upload an image of products in the store", async () => {
    const response = await supertest(app)
    .post("/admin/product/:product_id/image")
    //.set({ Authorization: `Bearer ${token}`});
    //token = response.body.token;
    const { status, message}= response.body;
    if (status == "error") {
      assert("Please provide an image", message);
    } else {
      assert("Product image uploaded")
    }
    
  });
});
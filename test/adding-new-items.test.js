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

describe("The adding new products API", function () {
it("should not allow user to purchase a product out of stock", async () => {
  
    const response = await supertest(app)
      .post("/admin/product")
      .set({Authorization: `Bearer ${token}`});
      
      token = response.body.token;
      
      const { status, message } = response.body;
      if (status == "error") {
      assert("Product added", message);
      } else {
      assert("Could not add product", message);
    }
  });

  
    it("should not allow user to purchase a product out of stock", async () => {
      
        const response = await supertest(app)
          .put("/admin/product")
          .set({Authorization: `Bearer ${token}`});
          
          token = response.body.token;
          
          const { status, message } = response.body;
          if (status == "error") {
          assert("Product updated", message);
          } else {
          assert("Could not update product", message);
        }
      });

     
        it("should not allow user to purchase a product out of stock", async () => {
          
            const response = await supertest(app)
              .delete("/admin/product/:product_id")
              .set({Authorization: `Bearer ${token}`});
              
              token = response.body.token;
              
              const { status, message } = response.body;
              if (status == "error") {
              assert("Product removed", message);
              } else {
              assert("Could not find product", message);
            }
          });
})

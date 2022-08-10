
const supertest = require("supertest"); 
const express = require("express");
const app = express();
const pg = require("pg");
const API =require("../server/manager/customer-manager");
const Pool = pg.Pool;
require("dotenv").config();
const connection_string = process.env.DATABASE_URL || "";
const {parse} = require("pg-connection-string");
const config = parse (connection_string);
const pool = new Pool(config);
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const DATABASE_URL = process.env.DATABASE_URL;
let assert = require("assert");

describe("The Customer login API", function () {

    it("should allow registered user to be able to log in", async () => {
        const response = await supertest(app).post("/api/login").send({
          user_name: "Mattm2",
          password: "word456",
        });
        token = response.body.token;
        const { status, message } = response.body;
        if (status == "error") {
          assert("User could not be found, wrong user name or password", message);
        } else {
          assert("Login was successful", message);
        }
    
        
      });

      //it("should not log in when username and password do not match", async () => {
       // const response = await supertest(app).post("/api/login").send({
         // user_name: "Mattm2",
         // password: "pass123",
        //});
        //token = response.body.token;
        //const { status, message } = response.body;
        //if (status == "error") {
          //assert("User could not be found, wrong user name or password", message);
        //} else {
         // assert("Login was successful", message);
        //}
      //});
    

    
});




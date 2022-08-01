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
let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJmaXJzdF9uYW1lIjoiZHVkdSIsImxhc3RuYW1lIjoibWJhdGhhIiwidXNlcl90eXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE2NTkyNzY0NTR9.Pv6yBXsiO0dDVCvFLhP6KOkiyhKCMsVr_EKM0Zz3U1k"

describe("The order API", function () {
it ("should allow orders to be displayed", async () => {
    const response = await supertest(app)
    .get("order/:order_id/items")
    .set({ Authorization: `Bearer ${token}`});
    token = response.body.token;
    const {message} = response.body;
    assert.equal('success', message);
   
})


});


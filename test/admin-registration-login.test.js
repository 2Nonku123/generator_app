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
describe("The Admin registration API", function () {

it("should register a new admin", async () => {
    const response = await supertest(app).post("/admin/user").send({
      user_name: "max",
      password: "word45",
      first_name: "Maxwell",
      lastname: "Steyn",
      contact_number: "0766543456",
      email_address: "max@gmail.com",
    });

    const { status, message } = response.body;
    if (status == "error") {
      assert("User added", message);
    } else {
      assert("Could not add user", message);
    }
  });
});

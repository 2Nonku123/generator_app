const express = require("express");
const app = express();
const cors = require("cors");

require("dotenv").config();
const { json } = require("express");

// app use code
app.use(
  cors({
    origin: "*",
  })
);

//////////////////////////////

const PORT = process.env.PORT || 4017;

////////////////////
// Express Config

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

////////////////////////////
// Customer routes
app.use("/cart/", require("./routes/customer/cart"));
app.use("/api/", require("./routes/customer/login"));
app.use("/order/", require("./routes/customer/orders"));
app.use("/profile/", require("./routes/customer/profile"));
app.use("/store/", require("./routes/customer/store-category"));

////////////////////////////
// Admin routes
app.use("/admin/category/", require("./routes/admin/category"));
app.use("/admin/user/", require("./routes/admin/users"));
app.use("/admin/product/", require("./routes/admin/products"));
app.use("/admin/order/", require("./routes/admin/order-route"));
app.use("/admin/report/", require("./routes/admin/reports"));
app.use("/admin/", require("./routes/admin/main-route"));

app.listen(PORT, function () {
  console.log(`App started on port ${PORT}`);
});
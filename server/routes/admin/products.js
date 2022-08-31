const express = require("express");
const router = express.Router();
const Joi = require("joi");
const ProductAdminManager = require("../../manager-admin/ProductAdminManager");
const productAdminManager = ProductAdminManager();
const { checkAdminAuthorizationToken } = require("../../module/authorize");

const fs = require("fs");
function removeFile(file_path) {
  try {
    fs.unlinkSync(file_path);
    //file removed
  } catch (err) {
    //console.error(err);
  }
}

// https://appdividend.com/2022/03/03/node-express-image-upload-and-resize/
function imageUpload(res, req, next) {}

/// Image upload requires
const Resize = require("../../helper/Resize");
const multer = require("multer");
const path = require("path");

/////////////////////////////////////////
// https://appdividend.com/2022/03/03/node-express-image-upload-and-resize/
const upload = multer({
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
});

///// admin products
router.get(
  "/search/:search_name",
  checkAdminAuthorizationToken,
  async function (req, res) {
    let { orderby, sort, outofstock } = req.query;
    const search = req.params.search_name;

    orderby = orderby == null ? "" : orderby;
    sort = sort == null ? "" : sort;
    outofstock = outofstock == null ? "" : outofstock;

    let scheme = Joi.object({
      search_name: Joi.string().min(3).required(),
    });

    let sResult = scheme.validate({ search_name: search });

    if (sResult.error !== undefined) {
      res.json([]);
      return;
    }

    productAdminManager
      .getProductsSearch(
        search,
        orderby,
        sort.toLowerCase() == "desc",
        outofstock == "yes"
      )
      .then((productTypes) => res.json(productTypes))
      .catch((error) => res.json([]));
  }
);

router.get(
  "/:product_id",
  checkAdminAuthorizationToken,
  async function (req, res) {
    const prod_id = req.params.product_id;

    let scheme = Joi.object({
      product_id: Joi.number().min(1).required(),
    });

    let sResult = scheme.validate({ product_id: prod_id });

    if (sResult.error !== undefined) {
      res.sendStatus(404);
      return;
    }

    productAdminManager
      .getProduct(prod_id)
      .then((product) => {
        if (product != null) {
          res.json(product);
        } else {
          res.sendStatus(404);
        }
      })
      .catch((error) => res.sendStatus(404));
  }
);

router.post("/", checkAdminAuthorizationToken, async function (req, res) {
  let scheme = Joi.object({
    id: Joi.number().min(0).required(),
    product_name: Joi.string().min(1).required(),
    description: Joi.string().min(1).empty().optional(),
    price: Joi.number().min(0).required(),
    quantity: Joi.number().min(0).integer().required(),
    available: Joi.bool().required(),
    is_rentalble: Joi.bool().required(),
    rental_duration: Joi.number().integer().required(),
    rental_duration_type: Joi.number().integer().min(0).max(5).required(),
    product_type_id: Joi.number().integer().min(1).max(4).required(),
    product_image: Joi.string().empty().min(0).optional(),
    product_type: Joi.string().empty().min(0).optional(),
  });

  let sResult = scheme.validate(req.body);

  if (sResult.error !== undefined) {
    res.json({
      status: "error",
      message: sResult.error.details[0].message,
    });
    return;
  }
  let iObject = {
    product_name: req.body.product_name,
    description: req.body.description,
    price: req.body.price,
    quantity: req.body.quantity,
    available: req.body.available,
    is_rentalble: req.body.is_rentalble,
    rental_duration: req.body.rental_duration,
    rental_duration_type: req.body.rental_duration_type,
    product_type_id: req.body.product_type_id,
  };

  productAdminManager
    .addProduct(iObject)
    .then((updateStatus) =>
      res.json({
        status: updateStatus > 0 ? "success" : "error",
        message: updateStatus > 0 ? "Product added" : "Could not add product",
      })
    )
    .catch((error) =>
      res.json({
        status: "error",
        message: "Could not add product",
      })
    );
});

router.put("/", checkAdminAuthorizationToken, async function (req, res) {
  let scheme = Joi.object({
    id: Joi.number().min(0).required(),
    product_name: Joi.string().min(1).required(),
    description: Joi.string().min(1).empty().optional(),
    price: Joi.number().min(0).required(),
    quantity: Joi.number().min(0).integer().required(),
    available: Joi.bool().required(),
    is_rentalble: Joi.bool().required(),
    rental_duration: Joi.number().integer().required(),
    rental_duration_type: Joi.number().integer().min(0).max(5).required(),
    product_type_id: Joi.number().integer().min(1).max(4).required(),
    product_image: Joi.string().empty().min(0).optional(),
    product_type: Joi.string().empty().min(0).optional(),
  });

  let sResult = scheme.validate(req.body);

  if (sResult.error !== undefined) {
    res.json({
      status: "error",
      message: sResult.error.details[0].message,
    });
    return;
  }
  let iObject = {
    product_name: req.body.product_name,
    description: req.body.description,
    price: req.body.price,
    quantity: req.body.quantity,
    available: req.body.available,
    is_rentalble: req.body.is_rentalble,
    rental_duration: req.body.rental_duration,
    rental_duration_type: req.body.rental_duration_type,
    product_type_id: req.body.product_type_id,
    id: req.body.id,
  };

  productAdminManager
    .updateProduct(iObject)
    .then((updateStatus) =>
      res.json({
        status: updateStatus > 0 ? "success" : "error",
        message:
          updateStatus > 0 ? "Product updated" : "Could not update product",
      })
    )
    .catch((error) =>
      res.json({
        status: "error",
        message: "Could not update product",
      })
    );
});

router.delete(
  "/:product_id",
  checkAdminAuthorizationToken,
  async function (req, res) {
    const { product_id } = req.params;

    let scheme = Joi.object({
      product_id: Joi.number().required(),
    });

    let sResult = scheme.validate(req.params);

    if (sResult.error !== undefined) {
      res.json({
        status: "error",
        message: sResult.error.details[0].message,
      });

      return;
    }

    const productHasOrder = await productAdminManager.productOrdered(
      product_id
    );

    if (productHasOrder != null && productHasOrder.count > 0) {
      res.json({
        status: "error",
        message: "Cannot remove a ordered product",
      });

      return;
    }

    productAdminManager
      .removeProduct(product_id)
      .then((updateStatus) =>
        res.json({
          status: updateStatus > 0 ? "success" : "error",
          message:
            updateStatus > 0 ? "Product removed" : "Could not find product",
        })
      )
      .catch((error) =>
        res.json({
          status: "error",
          message: "Could not find product",
        })
      );
  }
);

/////////////////////////////////////////////////////////
// Image upload , reference: https://appdividend.com/2022/03/03/node-express-image-upload-and-resize/

router.post(
  "/admin/category/:category_id/image",
  [checkAdminAuthorizationToken, upload.single("image")],
  async function (req, res) {
    const { category_id } = req.params;

    let scheme = Joi.object({
      category_id: Joi.number().required(),
    });

    let sResult = scheme.validate(req.params);

    if (sResult.error !== undefined) {
      res.json({
        status: "error",
        message: sResult.error.details[0].message,
      });

      return;
    }

    const imagePath = path.join(__dirname, "/public/images");
    const oldPath = path.join(__dirname, "/public/");
    const fileUpload = new Resize(imagePath);
    if (!req.file) {
      res.json({ status: "error", message: "Please provide an image" });
      return;
    }
    const filename = await fileUpload.save(req.file.buffer);
    let oldFile = "";
    productAdminManager
      .getCategory(category_id)
      .then((result) => {
        if (result == null) {
          return Promise.reject();
        }
        oldFile = result.image;
        return result;
      })
      .then((result) =>
        productAdminManager.updateCategoryImage(
          category_id,
          `images/${filename}`
        )
      )
      .then((result) => {
        if (result > 0) {
          if (oldFile.trim() != "") {
            removeFile(oldPath + `/${oldFile}`);
          }
          res.json({ status: "success", message: "Category image uploaded" });
        } else {
          removeFile(imagePath + `/${filename}`);
          res.json({
            status: "error",
            message: "Could not upload category image",
          });
        }
      })
      .catch((error) => {
        removeFile(imagePath + `/${filename}`);
        res.json({
          status: "error",
          message: "Could not upload category image",
        });
      });
  }
);

router.post(
  "/:product_id/image",
  [checkAdminAuthorizationToken, upload.single("image")],
  async function (req, res) {
    //await console.log("post");

    const { product_id } = req.params;

    let scheme = Joi.object({
      product_id: Joi.number().required(),
    });

    let sResult = scheme.validate(req.params);

    if (sResult.error !== undefined) {
      res.json({
        status: "error",
        message: sResult.error.details[0].message,
      });

      return;
    }

    const imagePath = path.join(__dirname, "../..public/images");
    const oldPath = path.join(__dirname, "/public/");
    const fileUpload = new Resize(imagePath);
    if (!req.file) {
      res.json({ status: "error", message: "Please provide an image" });
      return;
    }
    const filename = await fileUpload.save(req.file.buffer);
    let oldFile = "";
    productAdminManager
      .getProduct(product_id)
      .then((result) => {
        if (result == null) {
          return Promise.reject();
        }
        oldFile = result.product_image;
        return result;
      })
      .then((result) =>
        productAdminManager.updateProductImage(product_id, `images/${filename}`)
      )
      .then((result) => {
        if (result > 0) {
          if (oldFile.trim() != "") {
            removeFile(oldPath + `/${oldFile}`);
          }
          res.json({ status: "success", message: "Product image uploaded" });
        } else {
          removeFile(imagePath + `/${filename}`);
          res.json({
            status: "error",
            message: "Could not upload product image",
          });
        }
      })
      .catch((error) => {
        removeFile(imagePath + `/${filename}`);
        res.json({
          status: "error",
          message: "Could not upload product image",
        });
      });
  }
);

module.exports = router;
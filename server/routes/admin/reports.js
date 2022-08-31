const express = require("express");
const router = express.Router();
const Joi = require("joi");
const ReportManager = require("../../manager-admin/reportManager");
const reportManager = ReportManager();
const { checkAdminAuthorizationToken } = require("../../module/authorize");

////////////////////////////////////////////////////////
/// report routes

router.get(
  "/sales/category",
  //checkAdminAuthorizationToken,
  async function (req, res) {
    const { type, to, from, limit } = req.query;

    let scheme = Joi.object({
      product_type_id: Joi.number().integer().min(1).empty().optional(),
      from: Joi.date().empty().optional(),
      to: Joi.date().empty().optional(),
      limit: Joi.number().integer().min(0).empty().optional(),
    });

    let sResult = scheme.validate(req.params);

    if (sResult.error !== undefined) {
      res.json({
        status: "error",
        message: sResult.error.details[0].message,
      });

      return;
    }

    reportManager
      .getSales(
        type == null || type == "" ? 0 : type,
        from,
        to,
        limit == null || limit == "" ? 0 : limit
      )
      .then((orderInfo) => res.json(orderInfo))
      .catch((error) => {
        console.log(error);
        res.json([]);
      });
  }
);

router.get(
  "/sales/status",
  //checkAdminAuthorizationToken,
  async function (req, res) {
    const { status, to, from, limit } = req.query;

    let scheme = Joi.object({
      status: Joi.number().integer().min(1).empty().optional(),
      from: Joi.date().empty().optional(),
      to: Joi.date().empty().optional(),
      limit: Joi.number().integer().min(0).empty().optional(),
    });

    let sResult = scheme.validate(req.params);

    if (sResult.error !== undefined) {
      res.json({
        status: "error",
        message: sResult.error.details[0].message,
      });

      return;
    }

    reportManager
      .getSalesStatus(
        status == null || status == "" ? 0 : status,
        from,
        to,
        limit == null || limit == "" ? 0 : limit
      )
      .then((orderInfo) => res.json(orderInfo))
      .catch((error) => {
        console.log(error);
        res.json([]);
      });
  }
);

module.exports = router;
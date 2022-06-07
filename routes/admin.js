const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");

router.get("/admin/staff", adminController.getIndex);

router.post("/admin/staff", adminController.postIndex);

router.post("/admin/deleteWorkTime", adminController.postDeleteWorkTime);

router.post("/admin/isConfirm", adminController.postIsConfirm);

module.exports = router;

const express = require("express");
const router = express.Router();

const { db } = require("../config/firebase");
const { register, login } = require("../controllers/authController");

router.get("/test", (req, res) => {
  res.json({
    message: "Auth route working ",
  });
});

// for firebase testing is working or not 

router.get("/firebase-test", async (req, res) => {
  try {
    const docRef = db.collection("test").doc("check");
    
    await docRef.set({
      message: "Firebase working 🚀",
      time: new Date(),
    });

    const doc = await docRef.get();

    res.json({
      success: true,
      data: doc.data(),
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// auth routes
router.post("/register", register);
router.post("/login", login);

module.exports = router;
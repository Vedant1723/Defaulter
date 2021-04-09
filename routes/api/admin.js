const Admin = require("../../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
require("dotenv").config();
const sgMail = require("@sendgrid/mail");
const Otp = require("../../models/Otp");
const Teacher = require("../../models/Teacher");
sgMail.setApiKey(
  "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"
);

//@GET Route
//@DESC Get All Admins
router.get("/", async (req, res) => {
  try {
    const admin = await Admin.find();
    if (admin.length == 0) {
      return res.status(400).json({ msg: "No Admins Found!" });
    }
  } catch (error) {
    console.log(error.message);
  }
});

//@POST Route
//@DESC Signup Admin
router.post("/signup", async (req, res) => {
  const { name, email, password, institute } = req.body;
  var adminFields = {};
  try {
    if (name) adminFields.name = name;
    if (email) adminFields.email = email;
    if (password) adminFields.password = password;
    if (institute) adminFields.institute = institute;
    var admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ msg: "Admin Already Exists!" });
    }
    admin = new Admin(adminFields);
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);
    await admin.save();
    const payload = {
      admin: {
        id: admin.id,
      },
    };
    jwt.sign(
      payload,
      process.env.jwtSecret,
      { expiresIn: 360000000 },
      (err, token) => {
        if (err) throw err;
        res.json({
          msg: "Admin Created Successfully",
          admin: admin,
          token: token,
        });
      }
    );
  } catch (error) {
    console.log(error.message);
  }
});

//@POST Route
//@DESC Admin Login
router.post("/sendOTP", async (req, res) => {
  const { email } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ msg: "Admin Doesnt Exists!" });
    }
    var digits = "0123456789";
    var OTP = "";
    for (var i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    let otp = new Otp({
      userID: admin.id,
      otp: OTP,
    });
    otp.save((err) => {
      if (err) {
        return res.status(500).json({ msg: err.message });
      }
      const msg = {
        to: admin.email + "",
        from: "sachin1081999@gmail.com",
        subject: "Verification Mail",
        text: "and easy to do anywhere, even with Node.js",
        html:
          "<strong>Your OTP is " +
          OTP +
          " and it is valid for 15 mins from now!</strong>",
      };
      sgMail
        .send(msg)
        .then(() => {
          console.log("Email sent", msg);
          res.json({ msg: "Email SENT" });
        })
        .catch((error) => {
          console.error(error);
        });
    });
  } catch (error) {
    console.log(error.message);
  }
});

//@POST Route
//@DESC OTP Confirmation
router.post("/confirmOTP", async (req, res) => {
  const { otp } = req.body;
  try {
    var verifyOtp = await Otp.findOne({ otp: otp });
    if (!verifyOtp) {
      return res.json({ msg: "Please Resend the OTP" });
    }
    if (verifyOtp.isUsed) {
      return res.json({ msg: "This OTP is Already Used. Resend it Again" });
    }
    if (verifyOtp.otp == otp) {
      verifyOtp = await Otp.findOneAndUpdate(
        { _id: verifyOtp.id },
        { $set: { isUsed: true } },
        { new: true }
      );
      const admin = await Admin.findOne({ _id: verifyOtp.userID });
      const payload = {
        admin: {
          id: admin.id,
        },
      };
      jwt.sign(
        payload,
        process.env.jwtSecret,
        { expiresIn: 360000000 },
        (err, token) => {
          if (err) throw err;
          res.json({
            msg: "Admin Verified in Successfully",
            admin: admin,
            token: token,
          });
        }
      );
    }
  } catch (error) {
    console.log(error.message);
  }
});

// //@DELETE Route
// //@DESC Delete Teacher by ID
// router.delete("/delete/:id", async, (req, res) => {
//     try {
//         const teacher=await Teacher.findOneAndRemove({_id:req.params.id});
//     } catch (error) {

//     }
// });
module.exports = router;

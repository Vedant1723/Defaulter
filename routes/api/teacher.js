const Teacher = require("../../models/Teacher");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
require("dotenv").config();
const sgMail = require("@sendgrid/mail");
const Otp = require("../../models/Otp");
const teacherAuth = require("../../middleware/teacherAuth");
const Defaulter = require("../../models/Defaulter");
const Student = require("../../models/Student");
const multer = require("multer");
const path = require("path");
const looksSame = require("looks-same");
const fs = require("fs");
const PNG = require("pngjs").PNG;
const pixelMatch = require("pixelmatch");
const adminAuth = require("../../middleware/adminAuth");
const Admin = require("../../models/Admin");
// var sampleImage = require("../../uploads/1617944906134_Photo_.jpg");
sgMail.setApiKey(
  "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"
);

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}_Photo_${path.extname(file.originalname)}`);
  },
});
// const upload = multer();

const upload = multer({
  storage: storage,
  // limits: { fieldSize: 25 * 1024 * 1024,fileSize },
});

//@GET Route
//@DESC Get Current Teacher Route
router.get("/me", teacherAuth, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.teacher.id);
    if (!teacher) {
      return res.json({ msg: "No Teacher Found!" });
    }
    res.json(teacher);
  } catch (error) {
    console.log(error.message);
  }
});

//@PUT Route
//@DESC Update Teacher Details
router.post(
  "/update",
  [upload.single("file"), teacherAuth],
  async (req, res) => {
    const { name, email } = req.body;
    var userFields = {};
    try {
      console.log(req.file);

      if (name) userFields.name = name;
      if (email) userFields.email = email;
      if (req.file) {
        userFields.photo = `${req.protocol}://${req.headers.host}/uploads/${req.file.filename}`;
      }
      var user = await Teacher.findById(req.teacher.id);
      if (!user) {
        return res.json({ msg: "No Teacher Found!" });
      }
      user = await Teacher.findOneAndUpdate(
        { _id: req.teacher.id },
        { $set: userFields },
        { new: true }
      );
      res.json({ msg: "User Updatedd", user: user });
    } catch (error) {
      console.log(error.message);
    }
  }
);

//@GET Route
//@DEC Get All Teachers
router.get("/", async (req, res) => {
  try {
    const teacher = await Teacher.find();
    if (teacher.length == 0) {
      return res.status(400).json({ msg: "No Teacher is found!!" });
    }
    res.json(teacher);
  } catch (error) {
    console.log(error.message);
  }
});

//@POST Route
//@DESC Login Teacher
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.json({ msg: "Teacher Doesnt Exists" });
    }
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.json({ msg: "Invalid Credentials!" });
    }
    const payload = {
      teacher: {
        id: teacher.id,
      },
    };
    jwt.sign(
      payload,
      process.env.jwtSecret,
      { expiresIn: 500 },
      (err, token) => {
        if (err) throw err;
        res.json({
          msg: "Teacher Logged in Successfully",
          teacher: teacher,
          token: token,
        });
      }
    );
  } catch (error) {
    console.log(error.message);
  }
});

//@TEST Route
//@DESC TO Compare the Images
router.post("/test", upload.single("file"), async (req, res) => {
  console.log(req.file);
  try {
    looksSame(
      "https://i.ibb.co/dJT43Mc/user.png",
      req.file.path,
      (error, { equal }) => {
        if (error) {
          return res.json({ error });
        }
        if (equal) {
          return res.json({ msg: "Images Are Equal" });
        }
      }
    );
  } catch (error) {}
});

//@POST Route
//@DESC Singup Teacher
router.post("/signup", adminAuth, async (req, res) => {
  const { name, email, password, department } = req.body;
  var teacherFields = {};
  try {
    var admin = await Admin.findById(req.admin.id);
    teacherFields.institute = admin.institute;
    if (name) teacherFields.name = name;
    if (email) teacherFields.email = email;
    if (password) teacherFields.password = password;
    if (department) teacherFields.department = department;
    var teacher = await Teacher.findOne({ email });
    if (teacher) {
      return res.status(400).json({ msg: "Teacher Already Exists" });
    }
    teacher = new Teacher(teacherFields);
    console.log(req.body);
    const salt = await bcrypt.genSalt(10);
    teacher.password = await bcrypt.hash(password, salt);
    await teacher.save();
    const payload = {
      teacher: {
        id: teacher.id,
      },
    };
    jwt.sign(
      payload,
      process.env.jwtSecret,
      { expiresIn: 500 },
      (err, token) => {
        if (err) throw err;
        res.json({
          msg: "Teacher Created Successfully",
          teacher: teacher,
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
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(400).json({ msg: "Teacher Dosent Exists!" });
    }
    var digits = "0123456789";
    var OTP = "";
    for (var i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    let otp = new Otp({
      userID: teacher.id,
      otp: OTP,
    });
    otp.save((err) => {
      if (err) {
        return res.status(500).json({ msg: err.message });
      }
      const msg = {
        to: teacher.email + "",
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
          res.json({ msg: "Email Sent" });
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
      return res.jason({ msg: "This OTP is Already Used. Resend it Again" });
    }
    if (verifyOtp.otp == otp) {
      verfyOtp = await Otp.findOneAndUpdate(
        { _id: verifyOtp.id },
        { $set: { isUsed: true } },
        { new: true }
      );
      const teacher = await Teacher.findOne({ _id: verifyOtp.userID });
      const payload = {
        teacher: {
          id: teacher.id,
        },
      };
      jwt.sign(
        payload,
        process.env.jwtSecret,
        { expiresIn: 36000000000000 },
        (err, token) => {
          if (err) throw err;
          res.json({
            msg: "Admin Verified in Successfully",
            teacher: teacher,
            token: token,
          });
        }
      );
    }
  } catch (error) {
    console.log(error.message);
  }
});

//@GET Route
//@DESC Get All the Defaulters of the Current Department
router.get("/getDefaulter", teacherAuth, async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ _id: req.teacher.id });
    const defaulters = await Defaulter.find({ department: teacher.department });
    if (defaulters.length == 0) {
      return res.json({ msg: "No Defaulters Present!" });
    }
    res.json(defaulters);
  } catch (error) {
    console.log(error.message);
  }
});

//@POST Route
//@DESC Add A Defaulter to the List
router.post("/createDefaulter/:rollNo", teacherAuth, async (req, res) => {
  const { reason } = req.body;
  var defaulterFields = {};
  try {
    if (reason) defaulterFields.reason = reason;
    var student = await Student.findOne({ rollNo: req.params.rollNo });
    if (!student) {
      return res.json({ msg: "Please Enter a Valid Roll Number" });
    }
    defaulterFields.student = student;
    defaulterFields.rollNo = student.rollNo;
    var teacher = await Teacher.findOne({ _id: req.teacher.id });
    defaulterFields.user = teacher;
    defaulterFields.department = teacher.department;
    var defaulter = await Defaulter.find({ rollNo: student.rollNo });
    if (defaulter.length >= 3) {
      defaulter = new Defaulter(defaulterFields);
      await defaulter.save();
      const msg = {
        to: student.parentsDetails.email + "",
        from: "sachin1081999@gmail.com",
        subject: "Defaulter Caught",
        text: "and easy to do anywhere, even with Node.js",
        html:
          "<strong>Your Ward is Being Marked as a Defaulter of the Week for  " +
          reason +
          " and you are requested to make a police complain against your ward!!</strong>",
      };
      sgMail
        .send(msg)
        .then(() => {
          console.log("Email sent", msg);
        })
        .catch((error) => {
          console.error(error);
        });

      //@TODO Send Mail to the student's Parents
    }
    defaulter = new Defaulter(defaulterFields);
    await defaulter.save();

    res.json({ msg: "Defaulter Added", defaulter: defaulter });
  } catch (error) {
    console.log(error.message);
  }
});

//@PUT Route
//@DESC Update a Defaulter

//@Delete Route
//@DESC Delete A Defaulter

//@TODO Add a Delete Route

module.exports = router;

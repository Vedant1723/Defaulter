const Student = require("../../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
require("dotenv").config();
const sgMail = require("@sendgrid/mail");
const Teacher = require("../../models/Teacher");
const Otp = require("../../models/Otp");
const teacherAuth = require("../../middleware/teacherAuth");
const Defaulter = require("../../models/Defaulter");
sgMail.setApiKey(
  "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"
);

//@GET Router
//@DEC Get All Students
router.get("/", teacherAuth, async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ _id: req.teacher.id });

    const student = await Student.find({ department: teacher.department });
    if (student.length == 0) {
      return res.status(400).json({ msg: "no Student is found!!" });
    }
    res.json(student);
  } catch (error) {
    console.log(error.message);
  }
});

//@POST Route
//@DESC Create Student
router.post("/create", async (req, res) => {
  console.log(req.body);
  const {
    name,
    email,
    rollNo,
    department,
    parentsDetails,
    institute,
  } = req.body;
  var studentFileds = {};
  try {
    if (name) studentFileds.name = name;
    if (email) studentFileds.email = email;
    if (rollNo) studentFileds.rollNo = rollNo;
    if (department) studentFileds.department = department;
    if (institute) studentFileds.institute = institute;
    if (parentsDetails) studentFileds.parentsDetails = parentsDetails;
    var student = await Student.findOne({ email });
    if (student) {
      return res.status(400).json({ msg: "Student Already Exists" });
    }
    student = new Student(studentFileds);
    await student.save();
    res.json({ msg: "Student Creted", student: student });
  } catch (error) {
    console.log("Error", error.message);
  }
});

//@GET Route
//@DESC Get DEfaulty Details
router.get("/getDefaulty/:id", async (req, res) => {
  try {
    var details = await Defaulter.find();
    if (details.length == 0) {
      return res.json({ msg: "No Details Found!" });
    }
    var newDetails = details.filter(
      (detail) => detail.student._id == req.params.id
    );
    if (newDetails.length == 0) {
      return res.json({ msg: "No Details Found!" });
    }
    res.json(newDetails);
  } catch (error) {
    console.log(error.message);
  }
});

//@GET Route
//@DESC Get Student By ID
router.get("/details/:  SstudentID", async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentID);
    if (!student) {
      return res.json({ msg: "No Student Found!" });
    }
    res.json(student);
  } catch (error) {
    console.log(error.message);
  }
});

module.exports = router;

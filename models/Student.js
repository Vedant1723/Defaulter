const mongoose = require("mongoose");

const StudentSchema = mongoose.Schema({
  name: {
    type: String,
    required: "Student Name is Required!",
  },
  email: {
    type: String,
    required: "Student Email is Required!",
  },
  studentPhoto: {
    type: String,
    default: "https://i.ibb.co/dJT43Mc/user.png",
  },
  institute: {
    type: String,
  },
  rollNo: {
    type: Number,
    required: "Student Roll Number is Required!",
  },
  department: {
    type: String,
    required: "Student Department is Required!",
  },
  parentsDetails: {
    name: {
      type: String,
      required: "Parents Name is Required!",
    },
    email: {
      type: String,
      required: "Parents Email is Required!",
    },
    phoneNumber: {
      type: Number,
      required: "Parents Phone Number is Required!",
    },
  },
});

module.exports = Student = mongoose.model("Student", StudentSchema);

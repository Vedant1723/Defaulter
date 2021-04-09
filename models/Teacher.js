const mongoose = require("mongoose");

const TeacherSchema = mongoose.Schema({
  name: {
    type: String,
    required: "Teacher Nmae is Required!",
  },
  password: {
    type: String,
    required: "Teacher Password is Required!",
  },
  photo: {
    type: String,
    default: "https://i.ibb.co/dJT43Mc/user.png",
  },
  email: {
    type: String,
    required: "Teacher Email is Required!",
  },
  institute: {
    type: String,
  },
  department: {
    type: String,
    required: "Teacher Department is Required!",
  },
});

module.exports = Teacher = mongoose.model("Teacher", TeacherSchema);

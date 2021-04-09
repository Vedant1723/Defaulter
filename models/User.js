const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: "User Name is Required!",
  },
  email: {
    type: String,
    required: "User Email is Required!",
  },
  password: {
    type: String,
    required: "User Password is Required!",
  },
  department: {
    type: String,
    required: "User Departmet is Required!",
  },
});

module.exports = User = mongoose.model("User", UserSchema);

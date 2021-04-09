const mongoose = require("mongoose");

const AdminSchema = mongoose.Schema({
  name: {
    type: String,
    required: "Admin Name is Required!",
  },
  password: {
    type: String,
    required: "Admin Password is Required!",
  },
  email: {
    type: String,
    required: "Admin Email is Required!",
  },
  institute: {
    type: String,
    required: "Admin Institude Name is Required!",
  },
});

module.exports = Admin = mongoose.model("Admin", AdminSchema);

const mongoose = require("mongoose");

const DefaulterSchema = new mongoose.Schema({
  student: {
    type: Object,
  },
  rollNo: {
    type: Number,
  },
  reason: {
    type: String,
  },
  department: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: Object,
  },
});

module.exports = Defaulter = mongoose.model("Defaulter", DefaulterSchema);

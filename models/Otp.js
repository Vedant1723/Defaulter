const mongoose = require("mongoose");
const OtpSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Admin",
  },
  otp: {
    type: String,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  expireAt: {
    type: Date,
    default: Date.now,
    expires: 10,
  },
});

module.exports = Otp = mongoose.model("otp", OtpSchema);

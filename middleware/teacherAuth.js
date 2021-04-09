const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const token = req.header("token");
  if (!token) {
    return res.status(401).json({ msg: "No Token, Authorizated Denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.jwtSecret);
    req.teacher = decoded.teacher;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token is not Valid" });
  }
};

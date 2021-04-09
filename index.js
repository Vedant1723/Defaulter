const connectDB = require("./config/db");
const express = require("express");
const path = require("path");
const app = require("express")();

app.use(require("cors")());

connectDB();

app.use(require("express").json({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

const PORT = process.env.PORT || 5000;

//@Routes Initialization
app.use("/api/admin", require("./routes/api/admin"));
app.use("/api/student", require("./routes/api/student"));
app.use("/api/teacher", require("./routes/api/teacher"));

app.listen(PORT, () => {
  console.log("Server Connected on PORT : ", PORT);
});

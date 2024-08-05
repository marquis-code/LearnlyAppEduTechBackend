require("express-async-errors");
require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

const cookieParser = require("cookie-parser");
const port = process.env.PORT || 3000;
const connectDB = require("./config/db.config");

connectDB();

// middleware
const corsOptions = {
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(helmet());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.disable('x-powered-by');

const authRouter = require("./routes/auth.routes");
const productRoutes = require('./routes/product.routes');

// map URL starts:
app.use("/api/auth", authRouter);
app.use('/api/product', productRoutes);

app.use(function(err, req, res, next) {
  res.status(500).json({ error: err.message })
});


app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});


module.exports = app;

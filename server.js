require("express-async-errors");
require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const helment = require("helmet");
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
app.use(helment());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.disable('x-powered-by');

const authRouter = require("./routes/auth.routes");
const manuscriptRoutes = require('./routes/manuscript.routes');
const journalRoutes = require('./routes/journal.routes');
const proceedingsRoutes = require('./routes/proceedings.routes');
const conferenceSubmissionRoutes = require('./routes/conference.routes');
const authorRoutes = require('./routes/author.routes');

// map URL starts:
app.use("/api/auth", authRouter);
app.use("/api/manuscript", manuscriptRoutes);
app.use("/api/journal", journalRoutes);
app.use('/api/proceedings', proceedingsRoutes);
app.use('/api/conference', conferenceSubmissionRoutes);
app.use('/api/author', authorRoutes);

app.use(function(err, req, res, next) {
  res.status(500).json({ error: err.message })
});


app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});


module.exports = app;

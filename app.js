const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const multer = require("multer");
const PORT = 3000;

const homeRoutes = require("./routes/home");
const musterRoutes = require("./routes/muster");
const otherInfoRoutes = require("./routes/other-info");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const errorController = require("./controllers/error");

const mongoose = require("mongoose");
const Staff = require("./models/staff");

const MONGODB_URI =
  "mongodb+srv://duypnafx13348:poeietiiup1@employeemanager.uhkve.mongodb.net/EmployeeManager?retryWrites=true&w=majority";
const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const csrfProtection = csrf({});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().slice(0, 13) + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
// app.use(multer({ storage: fileStorage }).single("image"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);

app.use((req, res, next) => {
  if (!req.session.staff) {
    res.locals.position = false;
    return next();
  }
  Staff.findById(req.session.staff._id)
    .then((staff) => {
      req.staff = staff;
      if (staff.position === "admin") {
        res.locals.position = "admin";
        return next();
      }
      res.locals.position = "staff";
      next();
    })
    .catch((err) => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(homeRoutes);
app.use(musterRoutes);
app.use(otherInfoRoutes);
app.use(adminRoutes);
app.use(authRoutes);
app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    Staff.findOne()
      .then((staff) => {
        if (!staff) {
          const staff = new Staff({
            username: "admin",
            password: "123456",
            name: "anh duy",
            doB: new Date(1999, 01, 01),
            salaryScale: 1.5,
            startDate: new Date(2021, 10, 25),
            department: "IT",
            annualLeave: 12,
            position: "admin",
            image: "http://localhost:3000/",
            workStatus: null,
            isConfirm: null,
            workTimes: [],
            totalTimesWork: null,
            leaveInfoList: [],
            bodyTemperature: [],
            vaccineInfo: [],
            infectCovidInfo: [],
          });
          return staff.save();
        }
      })
      .then((a) => {
        app.listen(process.env.PORT || 8080, "0.0.0.0", () => {
          console.log("Connect with mongoBD");
        });
      });
  })
  .catch((err) => console.log(err));

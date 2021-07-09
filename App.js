const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
var CronJobManager = require("cron-job-manager");
manager = new CronJobManager();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 8,
    files: 3,
  },
});
app.use(express.json());
// app.use(upload.any());

const authorizeRequest = require("./Authorise");
const {
  Token,
  Messages,
  Chain,
  Credentials,
  EmailGroup,
  User,
} = require("./models");
const domail = require("./mailer");
mongoose.connect(
  "mongodb+srv://admin-naman:" +
    process.env.CLUSTER_PASSWORD +
    "@cluster0.3djy5.mongodb.net/FliperDB?retryWrites=true&w=majority",
  { useNewUrlParser: true },
  () => {
    console.log("Database connected.");
  }
);
const logic = (req, res) => {
  // console.log("Called");
  // console.log(req.files);
  
 
  return res.status(200).json("Success:Upload Success");
};
app.use(
  cors({
    origin: process.env.SITE_URL,
    optionsSuccessStatus: 200,
  })
);
app.post(
  "/uploadfiles",

  upload.array("files"),
  logic,
  (error, req, res, next) => {
    return res.status(400).json({ error: error.message });
  }
);
app.post("/createcron", authorizeRequest, async function (req, res) {
  try {
    const frequency = req.body.frequency;
    const id = req.body.id;
    const status = req.body.status;
    await manager.add(
      id,
      frequency,
      () => {
        domail(id);
      },
      { start: status,
    
      }
    );
    console.log(manager);
    return res.status(200).json("Success:Job Created");
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
});
app.post("/updatecron", authorizeRequest, async function (req, res) {
  try {
    const frequency = req.body.frequency;
    const id = req.body.id;
    const status = req.body.status;
    if (!manager.exists(id)) {
      await manager.add(
        id,
        frequency,
        () => {
          domail(id);
        },
        { start: status,
      
        }
      );
      console.log(manager);
      return res.status(200).json("Success:Job Created");
    } else {
      await manager.update(id, frequency);
      if (status) {
        manager.start(id);
      } else {
        manager.stop(id);
      }
      return res.status(200).json("Success:Job Updated");
    }
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
});
app.delete("/deletecron/:id", authorizeRequest, async function (req, res) {
  try {
    const files = req.body.files;

    files.forEach((file) => {
      fs.unlinkSync(`${process.env.PWD}/${file.path}`);
    });
    const id = req.params.id;
    manager.deleteJob(id);

    return res.status(200).json("Success:Job Deleted");
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
});
app.post(
  "/chain/updatestatus/:id",
  authorizeRequest,
  async function (req, res) {
    try {
      const id = req.params.id;
      const status = req.body.status;
      console.log(status);
      if (status) {
        manager.start(id);
      } else {
        manager.stop(id);
      }
      await Chain.findOneAndUpdate({ _id: id }, { status: status });
      return res.status(200).json("Success:Status Updated");
    } catch (err) {
      return res.status(400).json({ err: err.message });
    }
  }
);

app.listen(process.env.PORT || 4000, function (req, res) {
  console.log("Running");
});

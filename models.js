const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  attachments: {
    type: Array,
  },
});

const emailGroupSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  groupName: {
    type: String,
    required: true,
  },
  to: {
    type: [{ type: String }],
    required: true,
  },
  cc: {
    type: [{ type: String }],
  },
  bcc: {
    type: [{ type: String }],
  },
});

const credentialsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  access_token: {
    type: String,
    required: true,
  },
  refresh_token: {
    type: String,
    required: true,
  },
  expiry_time: {
    type: Number,
    required: true,
  },
  creation_time: {
    type: String,
    required: true,
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
const chainSchema = new mongoose.Schema({
  chainname: { type: String, required: true },
  emailgroupid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Email Group",
    required: true,
  },
  messageid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Messages",
    required: true,
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  frequency: { type: Object, required: true },
  status: { type: Boolean },
  subject: { type: String, required: true },
});
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  googleId: String,
  email: String,
  firstName: String,
  lastName: String,
  mailCredentialsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Credentials",
  },
  verified: Boolean,
});
const tokenSchema = new mongoose.Schema({
  userid: { type: mongoose.ObjectId, unique: true, index: true },
  token: String,
});
const mailhistorySchema = new mongoose.Schema({
  userid: { type: mongoose.ObjectId, required: true },
  status: { type: Boolean },
  mimeobject: { type: Object },
  info: { type: String },
  creation_time: { type: Date },
});

module.exports.Chain = new mongoose.model("Chains", chainSchema);

module.exports.Credentials = new mongoose.model(
  "Credentials",
  credentialsSchema
);
module.exports.EmailGroup = new mongoose.model("Email Group", emailGroupSchema);
module.exports.Messages = new mongoose.model("Messages", messageSchema);
module.exports.Token = new mongoose.model("Token", tokenSchema);
module.exports.User = new mongoose.model("User", userSchema);
module.exports.MailHistory = new mongoose.model(
  "Mail History",
  mailhistorySchema
);

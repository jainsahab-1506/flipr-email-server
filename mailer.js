const { User, Chain, Credentials, MailHistory } = require("./models");
const mimemessage = require("mimemessage");

const fs = require("fs");
const qs = require("qs");
const mime = require("mime-types");
const axios = require("axios");
const domail = async (id) => {
  try {
    //main Logic

    const chainId = id;
    //finding chaindata
    const chaindata = await Chain.findOne({ _id: chainId })
      .populate("messageid")
      .populate("emailgroupid");

    //findinguserdata
    const user = await User.findOne({ _id: chaindata.userid }).populate(
      "mailCredentialsId"
    );

    const attachments = chaindata.messageid.attachments;
    var emailgroupto = "";
    chaindata.emailgroupid.to.forEach((email) => {
      emailgroupto = emailgroupto + email + ",";
    });
    emailgroupto = emailgroupto.slice(0, -1);

    //Converting CC and BCC Array into singleString
    var emailgroupcc = "";
    var emailgroupbcc = "";
    chaindata.emailgroupid.cc.forEach((email) => {
      emailgroupcc = emailgroupcc + email + ",";
    });
    emailgroupcc = emailgroupcc.slice(0, -1);

    chaindata.emailgroupid.bcc.forEach((email) => {
      emailgroupbcc = emailgroupbcc + email + ",";
    });
    emailgroupbcc = emailgroupbcc.slice(0, -1);
    //mime Type Object
    var mailContent = mimemessage.factory({
      contentType: "multipart/mixed",
      body: [],
    });

    //addingHeaders
    mailContent.header("From", user.mailCredentialsId.email);
    mailContent.header("To", emailgroupto);
    mailContent.header("CC", emailgroupcc);
    mailContent.header("BCC", emailgroupbcc);
    mailContent.header("Subject", chaindata.subject);
    //textEntity

    var plainEntity = mimemessage.factory({
      body: chaindata.messageid.text,
    });
    var oauthtoken = user.mailCredentialsId.access_token;

    mailContent.body.push(plainEntity);
    // console.log(process.env.PWD);
    attachments.forEach((file) => {
      var data = fs.readFileSync(`${process.env.PWD}/${file.path}`);

      var attachmentEntity = mimemessage.factory({
        contentType: file.mimetype,
        contentTransferEncoding: "base64",
        body: data.toString("base64").replace(/([^\0]{76})/g, "$1\n"),
      });
      attachmentEntity.header(
        "Content-Disposition",
        `attachment;filename="${file.originalname}"`
      );
      mailContent.body.push(attachmentEntity);
    });
    const curtime = Math.round(new Date() / 1000);
    if (curtime <= user.mailCredentialsId.expiry_time) {
      try {
        var resp = await axios({
          method: "POST",
          url: "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",

          data: {
            raw: Buffer.from(mailContent.toString()).toString("base64"),
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + oauthtoken,
          },
        });
        const newmail = new MailHistory({
          userid: user._id,
          status: true,
          mimeobject: mailContent,
          info: "Successfull",
          creation_time: new Date(),
        });

        console.log(newmail);
        await newmail.save();
      } catch (err) {
        manager.stop(id);
        const newmail = new MailHistory({
          userid: user._id,
          status: false,
          mimeobject: mailContent,
          info: err.message,
          creation_time: new Date(),
        });
        await newmail.save();
        await Chain.findOneAndUpdate({ _id: id }, { status: false });
        console.log(err.message);
      }
    } else {
      const curtime = Math.round(new Date() / 1000);
      try {
        var resp = await axios({
          method: "POST",
          url: "https://oauth2.googleapis.com/token",
          data: qs.stringify({
            grant_type: "refresh_token",
            client_secret: process.env.CLIENT_SECRET,
            client_id: process.env.CLIENT_ID,
            refresh_token: user.mailCredentialsId.refresh_token,
          }),
          headers: {
            "content-type": "application/x-www-form-urlencoded;charset=utf-8",
          },
        });
        if (resp.data.error) {
          manager.stop(id);
          const newmail = new MailHistory({
            userid: user._id,
            status: false,
            mimeobject: mailContent,
            info: err.message,
            creation_time: new Date(),
          });
          await newmail.save();
          await Chain.findOneAndUpdate({ _id: id }, { status: false });
        }

        await Credentials.findOneAndUpdate(
          { _id: user.mailCredentialsId._id },
          {
            access_token: resp.data.access_token,
            expiry_time: resp.data.expires_in + curtime,
          }
        );
        oauthtoken = resp.data.access_token;
        try {
          var resp = await axios({
            method: "POST",
            url: "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",

            data: {
              raw: Buffer.from(mailContent.toString()).toString("base64"),
            },
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + oauthtoken,
            },
          });
          const newmail = new MailHistory({
            userid: user._id,
            status: true,
            mimeobject: mailContent,
            info: "Successfull",
            creation_time: new Date(),
          });
          console.log(resp);
          console.log(newmail);

          await newmail.save();
          console.log("Done");
        } catch (err) {
          manager.stop(id);
          const newmail = new MailHistory({
            userid: user._id,
            status: false,
            mimeobject: mailContent,
            info: err.message,
            creation_time: new Date(),
          });
          await newmail.save();
          await Chain.findOneAndUpdate({ _id: id }, { status: false });
          console.log(err);
        }
      } catch (err) {
        manager.stop(id);
           const chainId = id;
    //finding chaindata
    const chaindata = await Chain.findOne({ _id: chainId })
      .populate("messageid")
      .populate("emailgroupid");
         const user = await User.findOne({ _id: chaindata.userid }).populate(
      "mailCredentialsId"
    );
        const newmail = new MailHistory({
          userid: user._id,
          status: false,
          mimeobject: mailContent,
          info: err.message,
          creation_time: new Date(),
        });
        await newmail.save();
        await Chain.findOneAndUpdate({ _id: id }, { status: false });
        console.log(err);
      }
    }
  } catch (err) {
    manager.stop(id);
       const chainId = id;
    //finding chaindata
    const chaindata = await Chain.findOne({ _id: chainId })
      .populate("messageid")
      .populate("emailgroupid");
     const user = await User.findOne({ _id: chaindata.userid }).populate(
      "mailCredentialsId"
    );
    const newmail = new MailHistory({
      userid: user._id,
      status: false,
      mimeobject: mailContent,
      info: err.message,
      creation_time: new Date(),
    });
    await newmail.save();
    await Chain.findOneAndUpdate({ _id: id }, { status: false });
    console.log(err.message);
  }
};
module.exports = domail;

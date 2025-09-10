require("dotenv").config();
const nodemailer = require("nodemailer");
 const transporter = nodemailer.createTransport({
    service : "gmail",
    auth : {
        user : process.env.MY_EMAIL,
        pass : process.env.EMAIL_PASS,
    },
 });
 const sendEmail = async(to, subject, html) =>{
    await transporter.sendMail({
        from : process.env.MY_EMAIL,
        to,
        subject,
        html,
    });
 };

 module.exports = sendEmail;
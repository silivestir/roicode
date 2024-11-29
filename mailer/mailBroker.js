const nodemailer = require("nodemailer");
const crypto = require("crypto"); // To generate OTP

const Mailer = async (recipient,subject,html)=>{
    try{
        const  transporter= await nodemailer.createTransport({
            service:"gmail",
            // Using Gmail for this example, but it depends on your email provider
            auth: {
                user:process.env.EMAIL_USER, // The email address you want to send from
                pass: process.env.EMAIL_PASS  // The email account password (app-specific password if 2FA is enabled)
            }
        })
        const mailOptions ={
            from: '"ROITECH EDUCATION SOLUTION"<process.env.EMAIL_USER>', // Displayed name is your brand name
            to:recipient,
            subject: subject,
            html: html
        };
        //send email
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error){
        console.error('Error sending email:',error);
    }
}

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
};
const otp = generateOTP(); // Generate OTP

// Define the email content using your custom HTML
var html = `
<!DOCTYPE HTML>
<html>
<head>
<style>
body {
    background-image:url("../img/roitech.jpg");
}
</style>
</head>
<body>
<div>
<h1>you are  receiving  this  email because  your email was  used  during  signiup (account  creation) at roitecheducation
for your security do not  share  this  informations  to any person .</h1>
<p>Your OTP for verifying your email is: <strong>${otp}</strong></p>
<p>best regards,</p>
<p>roitecheducation team.</p>
</div>
</body>
</html>`;


module.exports = {Mailer,html,otp}
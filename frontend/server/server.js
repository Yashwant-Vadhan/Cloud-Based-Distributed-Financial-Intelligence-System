const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rithikagv2006@gmail.com',
    pass: 'ccnziecerraxhyoe' // Ensure this is your 16-char App Password
  }
});

// This will tell you IMMEDIATELY if the connection works
transporter.verify((error, success) => {
  if (error) {
    console.log("Connection failed! Error:", error.message);
  } else {
    console.log("Success! Your server can now send emails.");
  }
});

app.post('/send-otp', (req, res) => {
  const { email, otp } = req.body;

  const mailOptions = {
    from: 'rithikagv2006@gmail.com',
    to: email,
    subject: 'Verification Code',
    text: `Your OTP is: ${otp}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("!!! EMAIL ERROR DETAILS !!!:", error); // Check your terminal for this!
      return res.status(500).json({ message: "Failed to send email", error: error.message });
    }
    console.log("Email sent successfully!");
    res.status(200).json({ message: "Email sent!" });
  });
});

app.listen(5000, () => console.log('Server running on port 5000'));
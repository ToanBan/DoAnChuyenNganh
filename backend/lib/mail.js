const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service:"gmail", 
    auth:{
        user:'letoanban.word@gmail.com', 
        pass:'lxdxzyrfjwaxjogm'
    }
})

async function sendMail(to, subject, text){
    const mailOptions = {
        from:'letoanban.word@gmail.com', 
        to, 
        subject, 
        text
    }
    return transporter.sendMail(mailOptions);
}

module.exports = sendMail;
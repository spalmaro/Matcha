const nodemailer = require('nodemailer');
const env = require('../config/environment');

module.exports = {
	sendMail: function (email, activation_uuid, callback) {
		let html =
		`<div style="display:block;margin:0;font-family:'sans-serif'; color:#6e7b8a;text-align:center">
            <a href="https://localhost:4200/"><img style="width:300px; height:auto; text-align: center;" src="/assets/images/logo.png"></a>
        <div style="background:#fff;margin:0 auto;max-width:550px">
            <p style="font-size:1.25rem;font-weight:200;line-height:1.5rem">Click on the link below to reset your password. The link will expire in 24 hours.</p>
            <p><a style="background:#EEAD27;padding:10px 20px 10px 30px;margin-bottom:20px;color:#fff;font-size:.85rem;text-decoration:none;display:inline-block;text-align:center;border-radius:5px" href="http://localhost:4200/changepassword/${activation_uuid}">Reset Password</a><br><br>Best regards, <br>The Matcha Team</p>
        </div></div>`

		let transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: env.MAIL,
				pass: env.MAIL_PWD
			}
		})
		const mailOptions = {
			from: 'Matcha <do-not-reply@matcha.com>',
			to: email,
			subject: 'Reset your password',
			html: html
		}

		transporter.sendMail(mailOptions, (err, info) => {
			if (err) {
				callback(false);
			} else {
				console.log('E-mail sent')
				callback(true);
			}
		})
	}
}
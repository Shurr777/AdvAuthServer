const nodemailer = require("nodemailer");

class MailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        })
    }

    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to: to,
            subject: "Account Activation Mail" + process.env.API_URL,
            text: '',
            html:
                `
            <div class="container">
            <h1>To activate follow the link</h1>
            <a href="${link}">${link}</a>
            </div>
            `
        }, (error, info) => {
            if (error) {
                return console.log(error);
            }
        })
    }

}

module.exports = new MailService();
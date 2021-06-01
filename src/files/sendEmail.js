
import sgMail from '@sendgrid/mail'
import { emailAttachment } from '../lib/fs-tools.js'

const sendEmail = async emailAddress => {
    /* const attachment = emailAttachment() */

    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
        to: emailAddress, // Change to your recipient
        from: process.env.SENDER_EMAIL, // Change to your verified sender
        subject: 'Sending with SendGrid is Fun',
        text: 'Hello, this is your first email using Node.js',
        /* attachments: [
            {
                content: attachment,
                filename: "attachment.pdf",
                type: "application/pdf",
                disposition: "attachment"
            }
        ], */
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    }
    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        })

}

export default sendEmail
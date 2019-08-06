const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'k.jey.88@gmail.com',
        subject: 'Welcome to Task App',
        text: `Welcome to the app, ${name}. Let me know how you get along with app`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'k.jey.88@gmail.com',
        subject: 'Sorry to see you go!',
        text: `Dear ${name}, We are sad you are going. Please tell us what we can improve`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}
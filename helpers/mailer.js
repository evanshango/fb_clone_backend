const nodemailer = require('nodemailer')
const {google} = require('googleapis')

const {OAuth2} = google.auth
const oauthLink = 'https://developers.google.com/oauthplayground'

const {OAUTH_EMAIL_ACCOUNT, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, MAILING_REFRESH_TOKEN} = process.env

const auth = new OAuth2(OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, MAILING_REFRESH_TOKEN, oauthLink)

const buildTransport = async (subject, email, html) => {
    auth.setCredentials({refresh_token: MAILING_REFRESH_TOKEN})
    const accessToken = await auth.getAccessToken()
    const smtp = await nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2', user: OAUTH_EMAIL_ACCOUNT, clientId: OAUTH_CLIENT_ID, clientSecret: OAUTH_CLIENT_SECRET,
            refreshToken: MAILING_REFRESH_TOKEN, accessToken
        },
        secureConnection: false,
        tls: {ciphers: 'SSLv3'}
    })
    const mailOptions = {from: OAUTH_EMAIL_ACCOUNT, to: email, subject, html}

    return {smtp, mailOptions}
}

exports.sendVerificationEmail = async (email, name, url) => {
    const html = `<div style="max-width:700px;margin-bottom:1rem;display:flex;align-items:center;gap:10px;font-family:Roboto,serif;font-weight:600;color:#3b5998"><img src="https://res.cloudinary.com/digua6dil/image/upload/v1650212654/fb_zobb3e.png" alt="Fb" width="30px"><span>Action required: Activate your Facebook-Clone Account</span></div><div style="padding:1rem 0;border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;color:#141823;font-size:17px;font-family:Roboto,serif"><span>Hello ${name}</span><div style="padding:20px 0"><span style="padding:1.5rem 0">You recently created an account on Facebook-Clone. To complete your registration, please verify your account</span></div><a href=${url} style="width:200px;padding:10px 15px;background:#4c649b;color:#fff;text-decoration:none;border-radius:2px;font-weight:600">Confirm your Account</a><br><div style="padding-top:20px"><span style="margin:1.5rem 0;color:#898f9c">Facebook-Clone allows you to stay in touch with all your friends. Once registered, you can share photos, organize events and much more</span></div></div>`
    const subject = 'Facebook-Clone Email Verification'
    const {smtp, mailOptions} = await buildTransport(subject, email, html)
    await smtp.sendMail(mailOptions, (err, res) => {
        if (err) return err
        return res
    })
}

exports.sendResetCode = async (email, name, code) => {
    const html = `<div style="max-width:700px;margin-bottom:1rem;display:flex;align-items:center;gap:10px;font-family:Roboto,serif;font-weight:600;color:#3b5998"><img src="https://res.cloudinary.com/digua6dil/image/upload/v1650212654/fb_zobb3e.png" alt="Fb" width="30px"><span>Action required: Reset your Facebook-Clone Password</span></div><div style="padding:1rem 0;border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;color:#141823;font-size:17px;font-family:Roboto,serif"><span>Hello ${name}</span><div style="padding:20px 0"><span style="padding:1.5rem 0">You recently requested for a password reset for your Facebook-Clone account. To complete the process, please use this code.</span></div><p style="width:100px;padding:10px 15px;text-align: center;background:#4c649b;color:#fff;text-decoration:none;border-radius:3px;font-weight:600">${code}</p><br><div style="padding-top:20px"><span style="margin:1.5rem 0;color:#898f9c">Facebook-Clone allows you to stay in touch with all your friends. Once registered, you can share photos, organize events and much more</span></div></div>`
    const subject = 'Reset Facebook-Clone Password'

    const {smtp, mailOptions} = await buildTransport(subject, email, html)

    await smtp.sendMail(mailOptions, (err, res) => {
        if (err) return err
        return res
    })
}

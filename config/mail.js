module.exports = {
    host: process.env.MAIL_HOST, // hostname
    port: process.env.MAIL_PORT, // port for secure SMTP
    secure: (process.env.MAIL_ENCRYPTION == 'ssl'?true:false), // use SSL
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
    from_address: process.env.MAIL_FROM_ADDRESS,
    from_name: process.env.MAIL_FROM_NAME,
};
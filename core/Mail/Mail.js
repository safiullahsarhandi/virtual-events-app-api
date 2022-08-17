

const mailConfig = require('../../config/mail');
const nodemailer = require('nodemailer');
module.exports =  class Mail {
    transporter = null;
    config = {};
    constructor(){
        try{
            console.log(mailConfig);
            this.transporter = nodemailer.createTransport(mailConfig)
            this.config.from = `${mailConfig.from_name} <${mailConfig.from_address}>`;
            console.log(this.config);
        }catch(error){
            console.log('mail configuration invalid',error);
            throw new Error(error.toString());
        }
        // this.transporter = app;
    }
    
    to(to = null){
        if(to instanceof Array && to.length > 0){
            let mails = to.join(',');
            this.config.to = mails;
        }else{
            this.config.to = to;
        }

        return this;
    }

    from(from,name = null){
        if(name)
        this.config.from = `${name} <${from}>`;
        else
            this.config.from = `${from}`;            
        
        return this;
    }

    replyTo(to,name = null){
        if(name)
        this.config.replyTo = `${name} <${to}>`;
        else
            this.config.replyTo = `${to}`;   
        return this;         
    }

    inReplyTo(to,name = null){
        if(name)
        this.config.inReplyTo = `${name} <${to}>`;
        else
            this.config.inReplyTo = `${to}`;   
            
        return this;
    }


    cc(cc = null){
        if(to instanceof Array && cc.length > 0){
            let mails = cc.join(',');
            this.config.cc = mails;
        }else{
            this.config.cc = cc;
        }

        return this;
    }
    
    bcc(bcc = null){
        if(bcc instanceof Array && bcc.length > 0){
            let mails = bcc.join(',');
            this.config.bcc = mails;
        }else{
            this.config.bcc = bcc;
        }

        return this;
    }


    subject(subject = null){
        this.config.subject = subject;

        return this;
        
    }

    message(message = null,type = 'html'){
        this.config[type] = message;

        return this;
    }


    send(callback = null){
        try {
            this.transporter.sendMail(this.config);
        } catch (error) {
            console.log(error);
            throw new Error(error.toString());
            
        }

        return this;

    }
    
}
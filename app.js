const nodemailer = require('nodemailer');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

let to;
let subject;
let body;
let path;



//The disk storage engine gives you full control on storing files to disk.                                     
let Storage = multer.diskStorage({
    //destination is used to determine within which folder the uploaded files should be stored.                                           
    destination:function(req,file,callback){                          
        callback(null, './images');
    },
    //filename is used to determine what the file should be named inside the folder.
    filename:function(req,file,callback){
        callback(null,file.fieldname+'_'+Date.now()+"_"+file.originalname);
    }
});

let upload = multer({
    storage:Storage
}).single('image'); 


app.get('/', (req, res) => {
    res.sendFile('/index.html');
})

app.post('/sendemail', (req, res) => {
    //execute the middleware to upload the image
    upload(req,res,function(err){
        if (err){
            console.log(err);
            return res.send('Something went wrong');
        }else{
            to = req.body.to;
            subject = req.body.subject;
            body = req.body.body;
            path = req.file.path;

            console.log(to);
            console.log(subject);
            console.log(body);
            console.log(path);

            let transporter = nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:'glenkshaji@gmail.com',
                    pass:'Glen$$$123$$$'
                }
            });

            let mailOptions = {
                from:'glenkshaji@gmail.com',
                to:to,
                subject:subject,
                text:body,
                attachments:[
                    {
                        path:path
                    }
                ]
            }

            transporter.sendMail(mailOptions, function(err,info){
                if(err){
                    console.log(err);
                }else{
                    console.log('Email sent'+info.response);
                    //Delete the file in images
                    fs.unlink(path,function(err){
                        if (err){
                            return res.end(err);
                        }else{
                            console.log('Deleted.');
                            return res.redirect('/result.html');
                        }
                    });
                }
            });
        }
    });
});

const PORT = 3000 || process.env.PORT;

app.listen(PORT, () => {
    console.log('Server started on port 3000....');
});

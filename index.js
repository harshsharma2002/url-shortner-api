const express = require('express');
require('dotenv').config();
const {connectToDb,genId,clear,checkInDb,redrct} = require('./database/data')

port = process.env.port || 8001;

const app = express();

app.use(express.json());

connectToDb((err) => {
    if(!err){
        app.listen(port,()=>{
            console.log('Connected to database and server started at port:',port);
        })
    }
    else{
        console.error(err);
    }
});

app.post('/generate',async (req,res)=>{
    try{
        const flag = await checkInDb(req.body.url);
        if(flag===2){
            const data = await genId(req);
            res.send(data);
        }
        else if(flag===1)
            res.send("Url already exists");
        else
            res.send("Url exceed click Limit");
    }
    catch(err){
        throw err;
    }
});

app.post('/clear',async(req,res)=>{
    try{
        const data = await clear(req,res);
        res.send(data);
    }
    catch(err){
        throw err;
    }
});

app.get('/*',async(req,res)=>{
    const link = await redrct(req);
    res.redirect('https://'+link.OriginalUrl);
});



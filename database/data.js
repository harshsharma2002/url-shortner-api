const { MongoClient } = require('mongodb');
const short = require('shortid');
const uri = process.env.uri;
const dbName = process.env.dbName;

let db=null;
module.exports = {
    connectToDb: (cb) =>{
        MongoClient.connect(uri)
        .then(client =>{
            db = client.db(dbName);
            cb();
        })
        .catch(err => cb(err));
    },
    genId:(req) =>{
        const obj = {
            shortId: short.generate(),
            OriginalUrl: req.body.url,
            clicks: 0
        }
        return db.collection('shorten').insertOne(obj)
        .then( ack => ack)
        .catch( err => err);
    },
    checkInDb: async(link)=>{
        const data = await db.collection('shorten').findOne({ OriginalUrl : link });
        console.log(data);
        if(data===null) 
            return 2;
        if(data.clicks >= 4){
            await db.collection('shorten').deleteOne(data);
            return 0;
        }
        if(data!==null){
            await db.collection('shorten').updateOne({ OriginalUrl: data.OriginalUrl},{ $inc:{ clicks: 1 }})
            return 1;
        }
    },
    redrct: (req)=>{
        const short= req.params[0];
        return db.collection('shorten').findOne({shortId:short}).then( ack => ack ).catch(err => err);
    },
    clear: () =>{
        return db.collection('shorten').deleteMany({});
    }
}
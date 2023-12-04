const express = require("express");
const cors = require('cors');
require('dotenv').config();
const jwt = require("jsonwebtoken");


const verifyJWT =(req,res,next)=>{
  const authorization =req.headers.authorization;
  if(!authorization){
    return res.status(401).send({error: true,message:'unauthorized access'});
  }

  const token =authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded)=>{
    if(err){
      return res.status(401).send({error:true,message:'Unauthorized access'});
    }
    req.decoded=decoded;
    next();
  });


};

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port =process.env.PORT || 5000;
//middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sn1j5xu.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  try {
    const works = client.db('volunteerDB').collection('works');
    const users = client.db('volunteerDB').collection('users');
    const events = client.db('volunteerDB').collection('events');
    const joinedEvents = client.db('volunteerDB').collection('joinedEvents');

    //jwt
    app.post('/jwt',async(req,res)=>{
      const user= req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN,{expiresIn:'1h'});
      res.send({token});
    });

    const verifyAdmin =async(req,res,next)=>{
      const email =req.decoded.email;
      const query ={email:email};
      const user = await users.findOne(query);
      if(user?.role !== 'admin'){
        return res.status(403).send({error:true, message:'Forbidden message'});
      }
      next();

    };

    app.get('/users/admin/:email',verifyJWT, async(req,res)=>{
      const email =req.params.email;

      if(req.decoded.email !== email){
        res.send({admin:false});
      }

      const query ={email:email}
      const user =await users.findOne(query);
      const result ={admin: user?.role ==='admin'};
      res.send(result);
    });
    app.get('/joinedevents/:email',verifyJWT, async(req,res)=>{
      const email =req.params.email;
      const query ={email:email}
      const result =await joinedEvents.findOne(query);
      res.send(result);
    });
   
    
    
    

    app.get('/joinedevents',async(req,res)=>{
      const result = await joinedEvents.find().toArray();
      res.send(result);
    });

    app.post('/joinedevents',async(req,res)=>{
      const joinedEvent =req.body;
      const {eventId, email,} =joinedEvent;
      const isAlreadyJoined =await joinedEvents.findOne({eventId,email});
      if(!isAlreadyJoined){

       const result= await joinedEvents.insertOne(joinedEvent);
        res.send({result,success:true});
      }else{
        res.json({success:false,error:'User Already joined'})
      }
      
    });

    app.get('/works',async(req,res)=>{
      const result = await works.find().toArray();
      res.send(result);
    });
    app.get('/users',verifyJWT,verifyAdmin,async(req,res)=>{
      const result = await users.find().toArray();
      res.send(result);
    });

    app.post('/users',async(req,res)=>{
      const user =req.body;
      const query ={email: user.email};
      const existingUser =await users.findOne(query);
      if(existingUser){
        return res.send({message:'user already exists'});
      }

      const result=await users.insertOne(user);
      res.send(result);
    });

    app.delete('/users/:id',async(req,res)=>{
      const id =req.params.id;
      const query={_id: new ObjectId(id)}
      const result =await users.deleteOne(query);
      res.send(result);
    });

    app.get('/events',async(req,res)=>{
      const result =await events.find().toArray();
      res.send(result);
    });

    app.post('/events',async(req,res)=>{
      const event =req.body;
      const result =await events.insertOne(event);
      res.send(result);
    });
   

    app.delete('/events/:id',async(req,res)=>{
    const id= req.params.id;
    const query={_id: new ObjectId(id)};
    const result = await events.deleteOne(query);
    res.send(result);
    });

    

   
  } finally {
    
  }
}
run().catch(console.dir);
app.get('/',async(req,res)=>{
    res.send('Volunteer is running');
});
app.listen(port,()=>console.log(`Volunteer running on ${port}`));
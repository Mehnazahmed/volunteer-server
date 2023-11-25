const express = require("express");
const cors = require('cors');
require('dotenv').config();
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
    
    

    app.get('/works',async(req,res)=>{
      const result = await works.find().toArray();
      res.send(result);
    });
    app.get('/users',async(req,res)=>{
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
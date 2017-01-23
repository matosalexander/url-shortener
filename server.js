var express=require('express');
var path=require('path');
var mongodb = require('mongodb');
var config=require('./config');
var shortid = require('shortid');
var validUrl = require('valid-url');

var app=express();

//Get home page
var indexFile=path.join(__dirname, 'index.html');
app.get('/',function(req,res){
   res.sendFile(indexFile); 
});

//Get Mongo connection to local database
var mLab='mongodb://'+ config.db.host + '/' + config.db.name;
var mongoClient=mongodb.MongoClient;


//Get route for the creation of new links
app.get('/new/:url(*)',function(req,res){
   mongoClient.connect(mLab,function(err,db){
       if(err)return console.error(err);
       console.log("Connected to server");
       
       var collection=db.collection('links');
       var param=req.params.url;
       
       var local = req.get('host') + "/";
       var insertLink=function(db,callback){
          //Verify if the new url is not in the database
          collection.findOne({"url":param},{short:1,_id:0},function(err,doc){
             if(err)return console.error(err);
             if(doc !=null){
                res.json({original_url: param, short_url: local + doc.short});
             }else{
                //verify if url is valid
                if(validUrl.isUri(param)){
                   var code=shortid.generate();
                   var obj={url:param, short:code}
                   collection.insert([obj]);
                   res.json({ original_url: param, short_url: local + code })
                }else{
                   res.json({ error: "Wrong url format" });
                }
             }
         });
      };
      
      insertLink(db,function(){
          db.close(); 
      });
   }); 
});

//Get route for find the short link and if exist redirect it
app.get('/:code',function(req, res) {
   mongoClient.connect(mLab,function(err,db){
      if(err)return console.error(err);
      console.log("Connected to server");
      
      var collection=db.collection('links');
      var param=req.params.code;
      
      var find=function(db,callback){
         collection.findOne({"short":param},{url:1,_id:0},function(err,doc){
            if(err)return console.error(err);
            if(doc !==null){
               res.redirect(doc.url);
            }else{
               res.json({error:"No shortlink found"});
            }
         });
      };
      
      find(db,function(){
         db.close();
      });
      
      
   }); 
});


//App listening
var port=process.env.PORT || 8080;
app.listen(port,function(){
   console.log("App linstening on port " + port); 
});
var express=require('express');
var path=require('path');

var app=express();
var indexFile=path.join(__dirname, 'index.html');

//Get home page
app.get('/',function(req,res){
   res.sendFile(indexFile); 
});


//App listening
var port=process.env.PORT || 8080;
app.listen(port,function(){
   console.log("App linstening on port " + port); 
});
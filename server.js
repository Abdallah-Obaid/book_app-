'use strict'
require('dotenv').config

const express=require('express');

const app = express();
const superagent =require("superagent");
const PORT =process.env.PORT || 3000;
const bodyparser=require('body-parser') //**to make the radio accepted as a key in the returned json file**
// SPecify a directory for static resources:
app.use(express.static('./public'));

// **to make the radio accepted as a key in the returned json file** 
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
// to make req.body work in the app.post:
// app.use(express.json());
// app.use(express.urlencoded({extended:true}));
// to make the abilty of use the ejs
app.set('view engine','ejs');
app.get('/',(req,res)=>{
    res.send(`البورط شغال مية مية ${PORT}`) ;
});
app.get('/hello',(req,res)=>{
    // res.send(`البورط شغال مية مية ${PORT}`) ;
    res.render('pages/index');
});

app.get('/searches/new',(req,res)=>{
    res.render('pages/searches/new') 
});

app.post('/searches',(req,res)=>{
    var searchByValue = req.body["S"];
    var searchMethod = req.body.radio;
    console.log( req.body["S"])
    superagent.get(`https://www.googleapis.com/books/v1/volumes?q=${searchMethod}:${searchByValue}`)
    .then(data =>{
        var maparray=data.body.items.map((ele)=>{
            let ispn = ele.volumeInfo.industryIdentifiers
            if(! ispn){
                ispn = "No ISPN"
            }else{
                ispn = ele.volumeInfo.industryIdentifiers[0].identifier
            }

            let img = ele.volumeInfo.imageLinks
            if(! img){
                img =  "https://c0.wallpaperflare.com/preview/174/294/350/book-embossing-leather-book-cover.jpg"
            }else{
                img =ele.volumeInfo.imageLinks.thumbnail
            }
        return new Book(ele,ispn,img)
        });
        // res.json(data.body.items)
        res.render('pages/searches/show',{'maparray':maparray})
    }).catch(err =>{
        res.render("pages/error",{"err" : err} )
    })
    //res.render('pages/searches/new') 
});

app.listen(PORT,()=>{
    console.log(`Za port iz working ${PORT}`);
});
app.get('*',(req,res)=>{
    res.send('لم تزبط معنا');
});

function Book(data,ispnPar,img){
this.img = img ,
this.title = data.volumeInfo.title || "No Title",
this.authors = data.volumeInfo.authors || ["No Authors"],
this.description = data.volumeInfo.description || "No Description",
this.ispn = ispnPar,
this.categories = data.volumeInfo.categories || ["No Categories"]
}

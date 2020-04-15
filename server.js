'use strict'
require('dotenv').config();
const fs = require('fs')
const express=require('express');
const app = express();
const superagent =require("superagent");
const pg = require('pg');
const PORT =process.env.PORT || 3000;
const bodyparser=require('body-parser') //**to make the radio accepted as a key in the returned json file**
const client = new pg.Client(process.env.DATABASE_URL);
const methodoverride = require('method-override');
//using things
// SPecify a directory for static resources:
app.use(express.static('./public'));
// **to make the radio accepted as a key in the returned json file** 
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(methodoverride("method"));
app.set('view engine','ejs');
//routers
app.get('/',(req,res)=>{
    client.query("SELECT * FROM my_books;")
    .then(data =>{
        res.render('pages/index',{bookdata:data.rows});
        
    }).catch(err=>{
        res.render("pages/error",{"err" : err})
    })
    // res.send(`البورط شغال مية مية ${PORT}`) ;
});
app.get('/hello',(req,res)=>{
    // res.send(`البورط شغال مية مية ${PORT}`) ;
    res.render('pages/index');
});

app.get('/searches/new',(req,res)=>{
    res.render('pages/searches/new') 
});

app.get('/books/:id',(req,res)=>{
    client.query(("SELECT * FROM my_books WHERE id=$1;")
    ,[req.params.id])
    .then(data =>{
        res.render("pages/books/detail",{detaildata:data.rows[0]})
        
    }).catch(err=>{
        res.render("pages/error",{"err" : err})
    })
});

app.post('/searches',(req,res)=>{
    var searchByValue = req.body["S"];
    var searchMethod = req.body.radio;

    superagent.get(`https://www.googleapis.com/books/v1/volumes?q=${searchMethod}:${searchByValue}`)
    .then(data =>{
            let maparray=data.body.items.map((ele)=>{
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
client.connect()
.then(()=>{
app.listen(PORT, () => console.log(`Za port iz working ${PORT}`));})


app.get('*',(req,res)=>{
    res.send('لم تزبط معنا');
});

app.post("/books",(req,res) =>{
     var detaildata = req.body;
     var safeValue = [ detaildata.img, detaildata.title,detaildata.authors,detaildata.description, detaildata.ispn,detaildata.categories]
     var sql = "INSERT INTO my_books (img,title,authors,description,ispn,categories) VALUES ($1,$2,$3,$4,$5,$6);"
     client.query(sql,safeValue,
     (error, result) => {
        res.render("pages/books/detail",{detaildata:detaildata})
     })
})

app.delete("/delete/:id",(req,res) =>{
    var safeValue = [req.params.id]
    var sql = "DELETE FROM my_books WHERE id = $1;"
    client.query(sql,safeValue,
    (error, result) => {
       res.redirect("/")
    })
})

app.put("/update/:id",(req,res) =>{
    var detaildata = req.body;
    console.log(detaildata)
    var safeValue = [ detaildata.img, detaildata.title,detaildata.authors,detaildata.description, detaildata.ispn,detaildata.categories,req.params.id]
    var sql = "UPDATE my_books SET img = $1 ,title = $2 ,authors = $3,description = $4 ,ispn = $5 ,categories = $6 WHERE id = $7"
    client.query(sql,safeValue)
    .then(()=>{
        res.redirect(`/books/${req.params.id}`)
    }).catch((err)=>{
        res.render("pages/error",{"err" : err} )
    })
})
// fs.readFile('./package.json', 'utf8', (err, jsonString) => {
//     if (err) {
//         console.log("File read failed:", err)
//         return
//     }
//     var queryArray = [ jsonString.img, jsonString.title,jsonString.authors,jsonString.description, jsonString.ispn,jsonString.categories]
//     var sql = "INSERT INTO my_books (img,title,authors,description,ispn,categories) VALUES ($1,$2,$3,$4,$5,$6);"
//     console.log(queryArray);
//     client.query(sql,queryArray,
//     (error, result) => {
//         console.log("every thing is ok")
//     })
//     console.log('File data:', jsonString) 
// })

//functions
function Book(data,ispnPar,img){
    this.img = img ,
    this.title = data.volumeInfo.title || "No Title",
    this.authors = data.volumeInfo.authors || ["No Authors"],
    this.description = data.volumeInfo.description || "No Description",
    this.ispn = ispnPar,
    this.categories = data.volumeInfo.categories || ["No Categories"]
}
    
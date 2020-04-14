DROP TABLE IF EXISTS my_books  ;

create table my_books (
id serial primary key,
img VARCHAR(255),
title VARCHAR(255),
authors  VARCHAR(255), 
description text,
ispn VARCHAR(255),
categories  VARCHAR(255)
);


INSERT INTO my_books (img,title,authors,description,ispn,categories) VALUES ('sadsad','amman','asdsad','asdasd','plaplapla','asdffa');
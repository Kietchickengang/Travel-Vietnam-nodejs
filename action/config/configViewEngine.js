const path = require('path');
const express = require('express');

const configViewEngine = (app)=>{

    app.use(express.static(path.join(__dirname, '../public')));

    app.set('views', path.join(__dirname, '../server'));

    app.set('view engine', 'ejs');
}

module.exports = configViewEngine;
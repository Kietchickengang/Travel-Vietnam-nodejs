const express = require('express');

const {loadHomePage, getData, addNewDestination, deleteDestination, getUpdateDestinationPage, editDestination, getHotDestinationPage, goToBlogPage} = require('../controller/homeController');

const route = express.Router();

route.get('/', loadHomePage);

route.get('/api/des', getData);

route.post('/api/new-dest', addNewDestination);

route.delete('/api/des/del/:id', deleteDestination);

route.get('/api/des/update/page/:id', getUpdateDestinationPage);

route.put('/api/des/update/:id', editDestination);

route.get('/api/des/hot', getHotDestinationPage);

route.get('/api/blog', goToBlogPage);

module.exports = route;
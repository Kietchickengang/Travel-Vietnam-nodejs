const connectDB = require('../database/connectDB');
const chalk = require('chalk');
const {get} = require('../routes/web');

const errorMsg = (err) => {
    console.log(chalk.rgb(123, 104, 238)(err));
}

function getRandomRating(){
    const min = 4.5, max = 5.0;
    return parseFloat((Math.random() * (max - min) + min).toFixed(1))
}

const loadHomePage = (req, res) => {
    res.render('index.ejs');
}

const formatTime = (timeElement) => {
    return timeElement.toString().padStart(2,'0');
}

const getTime = () => {
    const now = new Date();
    const time = {
        dayInWeek: now.getDay() + 1,
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds()
    }

    const dayOfWeek = (time.dayInWeek === 1)? 'CN':`T${time.dayInWeek}`;
    return `${dayOfWeek} ${formatTime(time.day)}-${formatTime(time.month)}-${formatTime(time.year)} | ${formatTime(time.hour)}:${formatTime(time.minute)}:${formatTime(time.second)}`; 
}


const errorServerMsg = (res, err) => {
    console.error(chalk.red.bgBlack(err));
    if(!res.headersSent) res.status(500).json({
        error: 'Server error'
    });
}

const mappingData = (object) => {
    const ret = object.map(row => ({
            id: row.id.toString(),
            name: row.name,
            location: row.location,
            shortDescription: row.shortDescription,
            fullDescription: row.fullDescription ?? row.shortDescription,
            imageUrl: row.imageUrl,
            rating: row.rating,
            gallery: row.gallery? row.gallery.split(',').map(x => x.trim()) : [],
            features: row.features? row.features.split(',').map(x => x.trim()) : [],
            reviews: []
        }));
    
    return ret;
}

const getData = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT* 
            FROM DULIEU 
            ORDER BY ID ASC
        `);

        const mappedData = mappingData(result.recordset);
        res.json(mappedData);

    } catch (err) {
        errorServerMsg(res,err);
    }
};

const isValidUrl = (url) => {
    try {
        const u = new URL(url);
        return ['http:', 'https:'].includes(u.protocol);
    } 
    catch(err){
        errorMsg(err);
        return false;
    }
};

const addNewDestination = async (req, res) => {
    const {name, location, shortDescription, imageUrl, features} = req.body;

    const formatName = name.trim().toLowerCase();
    const formatLocation = location.trim().toLowerCase();
    const formatShortDescription = shortDescription.trim().toLowerCase();

    if (!formatName.length || !formatLocation.length || !formatShortDescription.length) {
        return res.status(400).json({ msg: 'Missing required field' });
    }

    try{
        const pool = await connectDB();
        
        // check duplicate
        const check = await pool.request().input('name', formatName)
                                          .input('location', formatLocation)
                                          .query(`SELECT 1
                                                  FROM DULIEU
                                                  WHERE LOWER(name) = @name AND LOWER(location) = @location
                                               `)
        if(check.recordset.length !== 0){
            return res.status(409).json({msg: 'Destination already exists'});
        }

        // check valid url
        if(!isValidUrl(imageUrl)){
            return res.status(400).json({msg: 'Invalid URL'});
        }

        // add new destination
        await pool.request().input('name', name)
                            .input('location', location)
                            .input('shortDescription', shortDescription)
                            .input('imageUrl', imageUrl)
                            .input('rating', getRandomRating())
                            .input('features', features)
                            .query(`INSERT INTO DULIEU(name, location, shortDescription, fullDescription, imageUrl, gallery, rating, features, reviews)
                                    VALUES
                                    (@name, @location, @shortDescription, null, @imageUrl, null, @rating, @features, null)
                                 `)
        return res.status(201).json({
               msg: `Create successfully`,
               time: getTime()
            }); 
    }
    catch(err){
        errorServerMsg(res,err);
    }
}

// Thuc hien thao tac Delete card
const deleteDestination = async (req,res) => {
    const {id} = req.params;
    try{
        const pool  = await connectDB();

        await pool.request()
                  .input('id', parseInt(id))
                  .query(`DELETE FROM DULIEU WHERE id = @id`);
        
        console.log(chalk.yellow.bgBlack.bold(`ID ${id} deleted [${getTime()}]`));

        return res.status(200).json({
            msg: `Delete successfully`,
            time: getTime()
        })
    }
    catch(err){
        errorServerMsg(res,err);
    }
}

// Thuc hien thao tac mo 1 form de Update card
const getUpdateDestinationPage = async (req,res) => {
    const {id} = req.params;
    try{
        const pool = await connectDB();
        const cardInfo = await pool.request()
                                   .input("id", parseInt(id))
                                   .query(`SELECT* FROM DULIEU WHERE id = @id`)
        const {recordset} = cardInfo;
        const editData = (recordset && recordset.length)? recordset[0]:[];

        res.render('updateCard.ejs', {editCard:editData}); // Note: Khi dung ben file ejs nho them JSON.stringify else --> [Object object]
    }
    catch(err){
        errorServerMsg(res,err);
    }
}

// Thuc hien thao tac Edit card
const editDestination = async (req,res) => {
    /* Note: Trong the input, field name --> xac dinh req.body --> khong khai bao => undefined*/
    const {id, destination, location, description, link, features} = req.body;
    if (!id) {
        return res.status(400).json({ msg: 'Error: invalid id' });
    }

    /* Kiem tra input Url co hop le hay khong --> Khong hop le thi hien Error, link Url khong bi edit */
    if (link && !isValidUrl(link)) {
        return res.status(400).json({
            msg: 'Invalid image URL. Try again!'
        });
    }

    try{
        const pool = await connectDB();
        await pool.request().input("id", id)
                            .input("name", destination)
                            .input("location", location)
                            .input("shortDescription", description)
                            .input("imageUrl", link)
                            .input("features", features)
                            .query(`UPDATE DULIEU 
                                    SET name = @name, location = @location, shortDescription = @shortDescription,
                                        imageUrl = @imageUrl, features = @features
                                    WHERE id = @id
                                 `)
        
        console.log(chalk.rgb(123, 104, 238).bgBlack.bold(`ID ${id} edited [${getTime()}]`)); /* Note: chalk.inverse de swap mau background va foreground*/
        
        return res.status(200).json({
            msg: `Update successfully`,
            time: getTime()
        })
    }
    catch(err){
        errorServerMsg(res,err);
    }
}

const getHotDestinationPage = async (req,res) => {
    try{
        const pool = await connectDB();
        const cardInfo = await pool.request()
                                   .query(`SELECT TOP 10* 
                                           FROM DULIEU 
                                           ORDER BY rating DESC`)
        const {recordset} = cardInfo;
        const HotData = (recordset && recordset.length)? recordset:[];
   
        res.render('hotCard.ejs', {hotDestinations:HotData});
    }
    catch(err){
        errorServerMsg(res,err);
    }
}

const goToBlogPage = async (req,res) => {
    try{
        await res.redirect('https://www.asiakingtravel.com/blog/vietnam');
    }
    catch(err){
        errorMsg(err);
        errorServerMsg(res,err);
    }
}

module.exports = {loadHomePage, getData, addNewDestination, deleteDestination, getUpdateDestinationPage, editDestination, getHotDestinationPage, goToBlogPage};
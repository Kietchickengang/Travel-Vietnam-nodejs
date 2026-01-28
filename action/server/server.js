const express = require('express');
const app = express();
const chalk = require('chalk');

app.use(express.json());
app.use(express.urlencoded({extended:true}))

require('dotenv').config();

const PORT = process.env.PORT;
const host = process.env.HOST_NAME;

const configViewEngine = require('../config/configViewEngine');
configViewEngine(app);

const webRoute = require('../routes/web');
app.use(webRoute);


app.listen(PORT, () => {
    console.log(chalk.greenBright.bgBlack.bold(`Server is running in port ${PORT}`));
})



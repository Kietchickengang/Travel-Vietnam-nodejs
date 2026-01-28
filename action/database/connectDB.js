const sql =  require('mssql/msnodesqlv8');
const databaseConfig = require('../config/configDatabase');
const chalk = require('chalk');

let pool;

const connection = async () => {
    try{
        console.log(chalk.cyanBright.bgBlack.bold('Connect successfully'));

        if(!pool){
            pool = await sql.connect(databaseConfig);
    
        }
        return pool;
        
    }
    catch (err){
        console.log(chalk.red.bgBlack("Can not connect database", err));
        throw err;
    }
}

module.exports = connection;
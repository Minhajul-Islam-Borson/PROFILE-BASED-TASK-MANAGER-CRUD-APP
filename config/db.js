require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "task_manager"
});

db.connect((err)=>{
    if(err){
        console.log("Database Connection error : ", err);
        return;
    }
    console.log("Database is connected...");
});
module.exports = db;
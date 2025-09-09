const db = require("../config/db");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
exports.createUser = (req, res)=>{
    const { username, email, password, role } = req.body;
    if(!username || !email || !password || !role){
        return res.status(400).json({message : "All fields are required.."});
    }
    db.query("SELECT * FROM users WHERE email = ?", [email], async(error, results)=>{
        if(error){
            return res.status(500).json(error);
        }
        if(results.length){
            return res.status(400).json({message: "Email already exists in database.."});
        }
        const userId = uuidv4();
        const hashedPassword = md5(password);
        const sql = "INSERT INTO users(id, username, email, password, role) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [userId, username, email, hashedPassword, role], (error, result) => {
            if(error) return res.status(500).json(error);
            res.status(201).json({message: "User Created Successfully..", userId});
        });
    });
};

exports.login = (req, res) => {
    const {email, password} = req.body;
    if(!email || !password) return res.status(400).json({message: "Email and Password must needed.."});
    db.query("SELECT * FROM users WHERE email = ?", [email], async(error, results) => {
        if(error) return res.status(500).json(err);
        const user = results[0];
        if(user.password !== md5(password)) return res.status(400).json({message : "Password is not correct.."});
        const payload = {
            id : user.id,
            role : user.role,
            name : user.username
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn : "2d"});
        res.json({token});
    });
}
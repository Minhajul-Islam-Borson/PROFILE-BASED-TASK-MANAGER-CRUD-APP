const db = require("../config/db");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const sendEmail = require("../config/sendEmail");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
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
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const sql = "INSERT INTO users(id, username, email, password, role, isVerified, verificationToken) VALUES (?, ?, ?, ?, ?, ?, ?)";
        await db.promise().query(sql, [userId, username, email, hashedPassword, role, false, verificationToken]);
        const verifyUrl = `http://localhost:3000/api/auth/verify/${verificationToken}`;
        await sendEmail(
            email,
            "Verify Your Email..",
            `<p>Hello ${username},</p>
            <p>Please verify your email by clicking below:</p>
            <a href="${verifyUrl}">Verify Email</a>`
        );
        res.status(201).json({ message: "User Created Successfully. Now verify your mail.", userId });
    });
};

exports.login = (req, res) => {
    const {email, password} = req.body;
    if(!email || !password) return res.status(400).json({message: "Email and Password must needed.."});
    
    db.query("SELECT * FROM users WHERE email = ?", [email], async(error, results) => {
        if(error) return res.status(500).json(err);
        if(results.length == 0){
            return res.status(400).json({message: "Invalid email.."});
        }
        const user = results[0];
        if(!user.isVerified){
            return res.status(403).json({message: "Please verify your email before login"});
        }
        if(user.password !== md5(password)) return res.status(400).json({message : "Password is not correct.."});
        const payload = {
            id : user.id,
            role : user.role,
            name : user.username
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn : "2d"});
        res.json({token});
    });
};

exports.varifyEmail = (req, res)=>{
    const { token } = req.params;
    if(!token) return res.status(400).json({message: "Token missing"});

    db.query("SELECT * FROM users WHERE verificationToken = ?", [token], (err, results)=>{
        if(err) return res.status(500).json({message: "Database error"});
        if(results.length === 0) return res.status(400).json({message: "Invalid or expired token"});

        const user = results[0];
        db.query("UPDATE users SET isVerified = true, verificationToken = NULL WHERE id = ?", [user.id], (err)=>{
            if(err) return res.status(500).json({message: "Database error"});
            res.send("<h1>Email verified successfully! You can now login.</h1>");
        });
    });
};
const { resource } = require("../app");
const db = require("../config/db");
const { v4 : uuidv4 } = require("uuid");


exports.createTask = (req, res) => {
    const {title, description} = req.body;
    const userId = req.user.id;
    if(!title) return res.status(400).json({message : "Title is required.."});
    const taskId = uuidv4();
    const sql = "INSERT INTO tasks(id, user_id, title, description) VALUES (?, ?, ?, ?)";
    db.query(sql, [taskId, userId, title, description], (error, result) =>{
        if(error) return res.status(500).json(error);
        res.status(201).json({message : "Task created..", taskId});
    });
};

exports.getTask = (req, res) => {
    const userId = req.user.id;
    db.query("SELECT * FROM tasks WHERE user_id = ?", [userId], (err, result)=>{
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.updateTask = (req, res)=>{
    const {id} = req.params;
    const {title, description, status} = req.body;
    const userId = req.user.id;
    const sql = "UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?";
    db.query(sql, [title, description, status, id, userId], (error, result) => {
        if (err) return res.status(500).json(err);
        if (!result.affectedRows) return res.status(404).json({ message: 'Task not found or unauthorized' });
        res.json({ message: 'Task updated' });
    });
};

exports.deleteTask = (req, res) => {
    const {id} = req.params;
    const userId = req.user.id;
    const sql = "DELTE FROM tasks WHERE id = ?, user_id = ?";
    db.query(sql, [id, userId], (err, result) => {
        if (err) return res.status(500).json(err);
        if (!result.affectedRows) return res.status(404).json({ message: 'Task not found or unauthorized' });
        res.json({ message: 'Task deleted' });
    });
};
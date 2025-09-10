const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

exports.createTask = (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.id;
  if (!title) return res.status(400).json({ message: "Title is required.." });
  const taskId = uuidv4();
  const sql =
    "INSERT INTO tasks(id, user_id, title, description) VALUES (?, ?, ?, ?)";
  db.query(sql, [taskId, userId, title, description], (error, result) => {
    if (error) return res.status(500).json(error);
    res.status(201).json({ message: "Task created..", taskId });
  });
};

exports.getTask = (req, res) => {
  if (req.user.role === "admin") {
    db.query("SELECT * FROM tasks", (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    });
  } else {
    const userId = req.user.id;
    db.query(
      "SELECT * FROM tasks WHERE user_id = ?",
      [userId],
      (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
      }
    );
  }
};

exports.updateTask = (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  db.query("SELECT * FROM tasks WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0)
      return res.status(404).json({ message: "Task not found" });

    const task = result[0];
    if (req.user.role !== "admin" && task.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this task" });
    }
    const sql =
      "UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?";
    db.query(sql, [title, description, status, id], (err, updateResult) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Task updated successfully" });
    });
  });
};

exports.deleteTask = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM tasks where id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0)
      return res.status(404).json({ message: "Task not found.." });
    const task = result[0];
    if (req.user.role !== "admin" && task.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this.." });
    }
    db.query("DELETE FROM tasks WHERE id = ?", [id], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Task deleted.." });
    });
  });
};

exports.getOneTask = (req, res) => {
  const { taskId } = req.params;
  if (req.user.role === "admin") {
    const sql = "SELECT * FROM tasks WHERE id = ?";
    db.query(sql, [taskId], (error, result) => {
      if (error) return res.status(500).json(error);
      if (result.length === 0)
        return res.status(404).json({ message: "Task not found" });
      res.json(result[0]);
    });
  } else {
    const sql = "SELECT * FROM tasks WHERE id = ? AND user_id = ?";
    db.query(sql, [taskId, req.user.id], (error, result) => {
      if (error) return res.status(500).json(error);
      if (result.length === 0)
        return res.status(404).json({ message: "Task not found" });
      res.json(result[0]);
    });
  }
};

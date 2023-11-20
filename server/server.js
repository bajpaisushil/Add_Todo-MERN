const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DB_URL;

app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log("Database not connected", err);
  });

const todoSchema = new mongoose.Schema({
  title: String,
  link: String,
  position: Number,
  completed: Boolean,
});

const Todo = mongoose.model("Todo", todoSchema);

// API to add a new todo
app.post("/api/addTodo", async (req, res) => {
  const { title, link } = req.body;

  try {
    const todo = new Todo({
      title,
      link,
      position: (await Todo.find()).length,
      completed: false,
    });

    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API to get all todos
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await Todo.find().sort({ position: 1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API to update the order of todos
app.post("/api/updateOrder", async (req, res) => {
  const { todos: updatedTodos } = req.body;

  try {
    await Promise.all(
      updatedTodos.map(async (todo, index) => {
        await Todo.findByIdAndUpdate(todo._id, { position: index });
      })
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API to delete a todo
app.delete("/api/deleteTodo/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Todo.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API to update a todo's completion status
app.post("/api/updateTodo/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    await Todo.findByIdAndUpdate(id, { completed });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

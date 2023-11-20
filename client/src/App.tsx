import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import "./App.css";
import dragIcon from './assets/dragicon.png';

interface Todo {
  _id: string;
  title: string;
  link: string;
  position: number;
  completed: boolean;
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState<string>("");
  const [link, setLink] = useState<string>("");

  useEffect(() => {
    // Fetch todos from the backend
    axios.get<Todo[]>("http://localhost:5000/api/todos").then((response) => {
      setTodos(response.data);
    });
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const updatedTodos = [...todos];
    const [reorderedItem] = updatedTodos.splice(result.source.index, 1);
    updatedTodos.splice(result.destination.index, 0, reorderedItem);

    setTodos(updatedTodos);

    // Update backend with the new order
    axios.post("http://localhost:5000/api/updateOrder", {
      todos: updatedTodos,
    });
  };

  const addTodo = async () => {
    try {
      const response = await axios.post<Todo>(
        "http://localhost:5000/api/addTodo",
        { title, link }
      );
      setTodos([...todos, response.data]);
      setTitle("");
      setLink("");
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/deleteTodo/${id}`);
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const updateTodo = async (id: string, completed: boolean) => {
    try {
      await axios.post(`http://localhost:5000/api/updateTodo/${id}`, {
        completed,
      });
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo._id === id ? { ...todo, completed } : todo
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">
      <h1 className="title">MERN Todo Dashboard</h1>
      <div>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input_title"
        />
        <input
          type="text"
          placeholder="Link"
          value={link}
          className="input_link"
          onChange={(e) => setLink(e.target.value)}
        />
        <button onClick={addTodo} className="addbutton">
          Add Todo
        </button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`todos-${todos.length}`} type="todo">
          {(provided) => (
            <ul
              className="notes_container"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {todos.map((todo, index) => (
                <Draggable key={todo._id} draggableId={todo._id} index={index}>
                  {(provided, snapshot) => (
                    <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`note_list ${
                      snapshot.isDragging ? "dragging" : ""
                    } ${todo.completed ? "completed" : ""}`}
                  >
                    <div
                      className="drag-handle"
                      {...provided.dragHandleProps}
                    >
                      <img src={dragIcon} alt="dragIcon" width={20} />
                    </div>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      className="list_input"
                      onChange={() => updateTodo(todo._id, !todo.completed)}
                    />
                    <div className="list_title">{todo.title}</div>
                    <a href={todo.link} className="list_title">Sample Wireframe</a>
                    <button
                      className="list_delete"
                      onClick={() => deleteTodo(todo._id)}
                    >
                      Delete
                    </button>
                  </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default App;

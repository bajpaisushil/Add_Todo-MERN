import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
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
    <div className="flex flex-col justify-center items-center p-8">
      <h1 className="text-3xl font-bold mb-4">MERN Todo Dashboard</h1>
      <div className="flex flex-col items-center">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 m-2 border-2 border-gray-300 rounded-md"
        />
        <input
          type="text"
          placeholder="Link"
          value={link}
          className="p-2 m-2 border-2 border-gray-300 rounded-md"
          onChange={(e) => setLink(e.target.value)}
        />
        <button
          onClick={addTodo}
          className="bg-violet-500 text-white font-bold rounded-md p-2"
        >
          Add Todo
        </button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`todos-${todos.length}`} type="todo">
          {(provided) => (
            <ul
              className="flex flex-col items-center justify-center list-none text-2xl min-h-[75vh] p-8 w-screen"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {todos.map((todo, index) => (
                <Draggable key={todo._id} draggableId={todo._id} index={index}>
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex flex-col bg-purple-200 ${
                        snapshot.isDragging ? "dragging" : ""
                      } ${todo.completed ? "completed" : ""} p-4 m-4 min-w-[20rem] h-auto bg-antiquewhite border-2 border-palevioletred rounded-lg`}
                    >
                      <div
                        className="drag-handle cursor-grab user-select-none"
                        {...provided.dragHandleProps}
                      >
                        <img src={dragIcon} alt="dragIcon" width={20} />
                      </div>
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        className="h-[1rem]"
                        onChange={() => updateTodo(todo._id, !todo.completed)}
                      />
                      <div
                      className={`text-xl m-4 font-bold ${
                        todo.completed ? "line-through text-red-500" : ""
                      }`}
                    >
                      {todo.title}
                    </div>
                      <a
                        href={todo.link}
                        className="block text-blue-800 font-bold text-xl m-4"
                      >
                        Link: {todo.link}
                      </a>
                      <button
                        className="bg-red-500 text-[1rem] min-w-[8rem] m-auto text-white font-bold rounded-md px-2 p-1"
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

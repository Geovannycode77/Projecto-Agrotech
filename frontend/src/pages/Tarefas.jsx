import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Tarefas() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [newTask, setNewTask] = useState("");

  // Adicionar nova tarefa
  const addTask = () => {
    if (newTask.trim() === "") return;
    setTasks([
      ...tasks,
      { id: Date.now(), text: newTask.trim(), completed: false },
    ]);
    setNewTask("");
  };

  // Alternar status (concluir/desfazer)
  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Excluir tarefa
  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // Filtragem
  const filteredTasks =
    filter === "all"
      ? tasks
      : filter === "completed"
      ? tasks.filter((t) => t.completed)
      : tasks.filter((t) => !t.completed);

  return (
    <div className="max-w-5xl mx-auto bg-slate-900/80 border border-green-500/30 dark:bg-gray-800 p-6 rounded-2xl shadow-md text-white">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold  dark:text-gray-100">
          Gestão de Tarefas
        </h2>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            Todas
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
          >
            Pendentes
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
          >
            Concluídas
          </Button>
        </div>
      </div>

      {/* Campo para nova tarefa */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Adicione uma nova tarefa..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
        />
        <Button onClick={addTask}>Adicionar</Button>
      </div>

      {/* Lista de tarefas */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <p className="text-gray-500 text-center">
            Nenhuma tarefa encontrada.
          </p>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex justify-between items-center p-3 rounded-lg border transition ${
                task.completed
                  ? "bg-primary/10 dark:bg-primary/80 border-primary/20"
                  : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              }`}
            >
              <span
                className={`text-sm flex-1 ${
                  task.completed
                    ? "line-through text-gray-400"
                    : "text-gray-800 dark:text-gray-100"
                }`}
              >
                {task.text}
              </span>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={task.completed ? "outline" : "default"}
                  onClick={() => toggleTask(task.id)}
                >
                  {task.completed ? "Desfazer" : "Concluir"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteTask(task.id)}
                >
                  Excluir
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

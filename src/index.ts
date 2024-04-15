import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Server, StableBTreeMap, ic } from 'azle';

class ToDoList {
   id: string;
   description: string;
   task: string;
   priority: number;
   labels: string[];
   createdAt: Date;
   updatedAt: Date | null;
}

const listStorage = StableBTreeMap<string, ToDoList>(0);

export default Server(() => {
   const app = express();
   app.use(express.json());

   // Create To do list
   app.post("/tasks", (req: Request, res: Response) => {
      const { description, task, priority, labels }: ToDoList = req.body;
      
      // Check for bad data types and empty strings
      if (!description || !task || !priority || typeof description !== 'string' || typeof task !== 'string' || typeof priority !== 'number') {
         return res.status(400).send("Bad request: Check data types and required fields!");
      }
      
      // Ensure labels is an array of strings
      if (!Array.isArray(labels) || labels.some(label => typeof label !== 'string')) {
         return res.status(400).send("Bad request: Labels must be an array of strings!");
      }

      const list: ToDoList = { id: uuidv4(), createdAt: getCurrentDate(), ...req.body };
      listStorage.insert(list.id, list);
      res.json(list);
   });

   // Get all tasks
   app.get("/tasks", (_: Request, res: Response) => {
      res.json(listStorage.values());
   });

   // Get all tasks sorted by priority
   app.get("/tasks/sorted", (_: Request, res: Response) => {
      const sortedValues = listStorage.values().sort((a, b) => a.priority - b.priority);
      res.json(sortedValues);
   });

   // Get tasks by labels (sorted)
   app.get("/tasks/labels/:labels", (req: Request, res: Response) => {
      const taskLabels = req.params.labels.split(',');
      const filteredTasks = listStorage.values().filter(task => task.labels.some(label => taskLabels.includes(label)));
      const sortedValues = filteredTasks.sort((a, b) => a.priority - b.priority);
      res.json(sortedValues);
   });

   // Get specific task
   app.get("/tasks/id/:id", (req: Request, res: Response) => {
      const taskId = req.params.id;
      const task = listStorage.get(taskId);
      if (!task) {
         return res.status(404).send(`Task with id ${taskId} not found!`);
      }
      res.json(task);
   });

   // Update task
   app.put("/tasks/id/:id", (req: Request, res: Response) => {
      const taskId = req.params.id;
      const task = listStorage.get(taskId);
      if (!task) {
         return res.status(404).send(`Task with id ${taskId} not found!`);
      }
      const updatedTask = { ...task, ...req.body, updatedAt: getCurrentDate() };
      listStorage.insert(taskId, updatedTask);
      res.json(updatedTask);
   });

   // Delete task
   app.delete("/tasks/id/:id", (req: Request, res: Response) => {
      const taskId = req.params.id;
      const deletedTask = listStorage.remove(taskId);
      if (!deletedTask) {
         return res.status(404).send(`Task with id ${taskId} not found!`);
      }
      res.json(deletedTask);
   });

   // Delete tasks by label
   app.delete("/tasks/labels/:label", (req: Request, res: Response) => {
      const labelToRemove = req.params.label;
      const updatedTasks = listStorage.values().filter(task => !task.labels.includes(labelToRemove));
      if (updatedTasks.length === listStorage.size()) {
         return res.status(404).send(`No tasks with label ${labelToRemove} found!`);
      }
      listStorage.clear();
      updatedTasks.forEach(task => listStorage.insert(task.id, task));
      res.json(listStorage.values());
   });

   // Delete all tasks
   app.delete("/tasks", (_: Request, res: Response) => {
      listStorage.clear();
      res.send("All tasks deleted!");
   });

   return app.listen();
});

function getCurrentDate(): Date {
   const timestamp = new Number(ic.time());
   return new Date(timestamp.valueOf() / 1000_000);
}

import { v4 as uuidv4 } from 'uuid';
import { Server, StableBTreeMap, ic } from 'azle';
import express from 'express';



class ToDoList {
   id: string;
   description: string;
   task: string;
   priority: number;
   labels: [];
   createdAt: Date;
   updatedAt: Date | null
}


const listStorage = StableBTreeMap<string, ToDoList>(0);


export default Server(() => {

   const app = express();
   app.use(express.json());

   // Create To do list
   app.post("/tasks", (req, res) => {

      const list: ToDoList =  {id: uuidv4(), createdAt: getCurrentDate(), ...req.body};
      
      // Check for bad data types
      if((typeof list.description !== 'string' || list.description.trim() === '') || (typeof list.task !== 'string' || list.task.trim() === '') || (typeof list.priority !== 'number' || list.priority < 0)){
         res.send("Bad request, check data types!")
      }
      else if(list.labels.some(item => typeof item !== 'string')){
         res.send("Bad request, check labels types!")
      }
      else{
         listStorage.insert(list.id, list);
         res.json(list);
      }
   });

   // Get all tasks
  app.get("/tasks", (req, res) => {
      res.json(listStorage.values());
  });
  
  // Get all tasks sorted by priority
  app.get("/tasks/sorted", (req, res) => {
      const sortedValues = listStorage.values().sort((a, b) => {
         return a.priority - b.priority;
      });
      res.json(sortedValues)
   });

  // Get tasks by labels (sorted)
  app.get("/tasks/labels/:labels", (req, res) => {
      const taskLabels = req.params.labels.split(',');

      const filteredTasks = listStorage.values().filter((task) => {
         return task.labels.some(label => taskLabels.includes(label));
     });
      const sortedValues = filteredTasks.sort((a, b) => {
         return a.priority - b.priority;
      });
     res.json(sortedValues)
   });

  // Get specific task
  app.get("/tasks/id/:id", (req, res) => {

      const taskId = req.params.id;
      const taskOpt = listStorage.get(taskId);

      if ("None" in taskOpt) {
         res.status(404).send(`the message with id=${taskId} not found`);
      } else {
         res.json(taskOpt.Some);
      }
   });

   // Update task
   app.put("/tasks/id/:id", (req, res) => {

      const taskId = req.params.id;
      const taskOpt = listStorage.get(taskId);
   
      if ("None" in taskOpt) {
         res.status(400).send(`couldn't update a message with id=${taskId}. message not found`);
      } else {
   
         const task = taskOpt.Some;
         const updatedMessage = { ...task, ...req.body, updatedAt: getCurrentDate()};

         listStorage.insert(task.id, updatedMessage);
   
         res.json(updatedMessage);
      }
   });

   // Delete task
   app.delete("/tasks/id/:id", (req, res) => {

      const taskId = req.params.id;
      const deletedTask = listStorage.remove(taskId);
   
      if ("None" in deletedTask) {
         res.status(400).send(`couldn't delete a message with id=${taskId}. message not found`);
      } else {
         res.json(deletedTask.Some);
      }
   });

   // Delete tasks by label
   app.delete("/tasks/labels/:label", (req, res) => {
      const labelToRemove = req.params.label;
  
      const updatedTasks = listStorage.values().filter(task => !task.labels.some(label => label === labelToRemove))
      const isLabelUsed = updatedTasks.length !== listStorage.values().length;

      if(isLabelUsed){
         const keys = listStorage.keys();
         keys.forEach((key) => {
            listStorage.remove(key);
         });
     
         // Insert updated tasks into the list
         updatedTasks.forEach(task => listStorage.insert(task.id, task));
     
         res.json(listStorage.values());
      }
      else{
         res.send(`No tasks with ${labelToRemove} label!`);
      }
  });

   // Delete all tasks
   app.delete("/tasks", (req, res) => {

    const keys = listStorage.keys();

    keys.forEach((key) => {
        listStorage.remove(key);
    });

    res.send("All tasks deleted!");
   });

   return app.listen();

});


function getCurrentDate() {

   const timestamp = new Number(ic.time());

   return new Date(timestamp.valueOf() / 1000_000);

}

# To do list 
Simple to do list application created with Typescript (Azle) in ICP canister where you can create, manage and delete tasks by labels or with sorting.
To use perform CRUD operations with browser extension for example. Remember to make post method aka create task at the beginning (look at endpoints section)

## Installation

```bash
git clone https://github.com/Michal-Pilarski/ICP-ToDoList.git
dfx start --host 127.0.0.1:8000 
```
## In separate terminal run:

```bash
dfx deploy
```

### Endpoints
change bkyz2-fmaaa-aaaaa-qaaaq-cai with your canister id

|HTTP Method|URL|Description|
|---|---|---|
|`POST`| http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/tasks | Create task |
|`GET`| http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/tasks | Get all tasks |
|`GET`| http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/tasks/id/:/id | Get task by id |
|`GET`| http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/tasks/labels/:labels | Get tasks by labels |
|`PUT`| http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/tasks | Update task |
|`DELETE`| http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/tasks | Delete all tasks |
|`DELETE`| http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/tasks/id/:/id | Delete task by id |
|`DELETE`| http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/tasks/labels/:labels | Delete tasks by label |


## Contribution
Pull requests are welcome




const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const selectedUser = users.find(user => user.username == username)
  if(!selectedUser){
    return response.status(400).send({'Error': "User not Found!"})
  }

  request.user = selectedUser
  return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body
  const user = {id: uuidv4(), name, username,todos:[]}
  if(users.find(item=> item.username == username)){
    return response.status(400).send({error:"Username already exists!"})
  }
  users.push(user)
  return response.status(201).send(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  return response.status(201).send(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const {user} = request
  const todo = {id: uuidv4(), title, done: false, deadline: new Date(deadline), created_at: new Date()}
  
  user.todos.push(todo)

  return response.status(201).send(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title, deadline} = request.body
  const {id} = request.params
  const todo = user.todos.find(item => item.id == id)
  if(!todo){
    return response.status(404).send({error: 'Todo not Exists!'})
  }
  todo.title = title
  todo.deadline = new Date(deadline)
  return response.status(201).send(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params
  const todo = user.todos.find(item => item.id == id)
  if(!todo){
    return response.status(404).send({error: 'Todo not Exists!'})
  }
  if(!todo.done){
    todo.done = true
  }
  return response.status(201).send(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params
  const todo = user.todos.find(item => item.id == id)
  if(!todo){
    return response.status(404).send({error: 'Todo not Exists!'})
  }
  user.todos.splice(todo, 1)

  return response.status(204).send(user.todos)
});

module.exports = app;

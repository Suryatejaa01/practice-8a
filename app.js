const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoapplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await database.all(getTodosQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoById = `
    SELECT * 
    FROM
     todo
        WHERE
    id = ${todoId}
    ;`;
  const dataResponse = await database.get(getTodoById);
  response.send(dataResponse);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const todoPost = `
    INSERT INTO 
    todo (id,todo,priority,status)
    VALUES(

     ${id},
    '${todo}',
    '${priority}',
    '${status}'

     ) ;`;
  const postResponse = await database.run(todoPost);
  response.send("Todo Successfully Added");
});

const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasTodo = (requestQuery) => {
  return requestQuery.todo !== undefined;
};

app.put("/todos/:todoId/", async (request, response) => {
  let data = null;
  let getTodoQuery = "";
  let msgResponse = "";
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  switch (true) {
    case hasPriority(request.body):
      getTodoQuery = `
            UPDATE
              todo
            SET
              priority = '${priority}'
            WHERE
              id = ${todoId};`;
      msgResponse = "Priority Updated";
      break;
    case hasStatus(request.body):
      getTodoQuery = `
           UPDATE
              todo
            SET
              status = '${status}'
            WHERE
              id = ${todoId};`;
      msgResponse = "Status Updated";
      break;
    case hasTodo(request.body):
      getTodoQuery = `
           UPDATE
              todo
            SET
              todo = '${todo}'
            WHERE
              id = ${todoId};`;
      msgResponse = "Todo Updated";
      break;
  }
  data = await database.run(getTodoQuery);
  response.send(msgResponse);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `
    DELETE
     FROM
     todo
     WHERE 
     todo = ${todoId}`;
  await database.run(deleteTodo);
  response.send("Todo Deleted");
});
module.exports = app;

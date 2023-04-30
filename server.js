const inquirer = require('inquirer');
const express = require('express');
const mysql = require("mysql2");

const table = require("console.table");
require("console.table");
const db = require(".");

const PORT = process.env.PORT || 3306;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const connection = mysql.createConnection(
    {
    host: '127.0.0.1',
 
    user: 'root',

    password: '',

    database: 'employees_db'
  },
  console.log(`Connected to the employee database.`)
);

connection.connect(function (err) {
    if (err) throw err;
    console.log(`
    ╔═══╗     ╔╗               ╔═╗╔═╗
    ║╔══╝     ║║               ║║╚╝║║
    ║╚══╦╗╔╦══╣║╔══╦╗─╔╦══╦══╗ ║╔╗╔╗╠══╦═╗╔══╦══╦══╦═╗
    ║╔══╣╚╝║╔╗║║║╔╗║║─║║║═╣║═╣ ║║║║║║╔╗║╔╗╣╔╗║╔╗║║═╣╔╝
    ║╚══╣║║║╚╝║╚╣╚╝║╚═╝║║═╣║═╣ ║║║║║║╔╗║║║║╔╗║╚╝║║═╣║
    ╚═══╩╩╩╣╔═╩═╩══╩═╗╔╩══╩══╝ ╚╝╚╝╚╩╝╚╩╝╚╩╝╚╩═╗╠══╩╝
           ║║      ╔═╝║                      ╔═╝║
           ╚╝      ╚══╝                      ╚══╝`)

    menuQuestions();
})

// works
function menuQuestions() {
    inquirer.prompt({
        type:"list",
        name:"menu",
        message:"What Would You Like To Do?",
        choices:[
            "View All Employees",
            "Add Employee",
            "Update Employee Role",
            "View All Roles",
            "Add Role",
            "View All Departments",
            "Add Department",
            "Quit"
        ]
    })
    .then(function ({menu}) {
        switch (menu) {
            case "View All Employees":
                ViewAllEmployees();
                break;

            case "Add Employee":
                AddEmployee();
                break;

            case "Update Employee Role":
                UpdateEmployeeRole();
                break;
            
            case "View All Roles":
                ViewAllRoles();
                break;

            case "Add Role":
                AddRole();
                break;

            case "View All Departments":
                ViewAllDepartments();
                break;
            
            case "Add Department":
                AddDepartment();
                break;

            case "Quit":
                console.log("Thank you for using employee tracker")

                connection.end();
                process.exit();
        }
    })
}

// works
function ViewAllEmployees() {
    console.log("Viewing all employees: \n")

    let query = `
    SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN role r
	    ON e.role_id = r.id
    LEFT JOIN department d
        ON d.id = r.department_id
    LEFT JOIN employee m
	    ON m.id = e.manager_id
    `;

    connection.query(query, function(err,res) {
    if (err) throw err;

    console.table(res);
    console.log("Employees Viewed")
    
    menuQuestions();
    })
}

// works
function AddEmployee() {
    let userInput1;
    const query = `SELECT id, title FROM role WHERE title NOT LIKE '%Manager%';`;
      
    Promise.resolve()
        .then(() => {
            return new Promise((resolve, reject) => {
                connection.query(query, (err, data) => {
                if (err) reject(err);
                else resolve(data);
                });
            });
        })
        .then((rolesData) => {
            const roles = rolesData.map(
              (item) => `Role title: ${item.title}, Role ID: ${item.id}`
            );
      
            return inquirer.prompt([
              {
                name: "first_name",
                type: "input",
                message: "What is the employee's first name?",
              },
              {
                name: "last_name",
                type: "input",
                message: "What is the employee's last name?",
              },
              {
                name: "role",
                type: "list",
                message: "What is the employee's role id?",
                choices: roles,
              },
            ]);
        })
        .then((answer) => {
            userInput1 = answer;
            
            const query2 = `
            SELECT manager.id as manager_id,
            CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name
            FROM employee
            LEFT JOIN role 
                ON employee.role_id = role.id
            LEFT JOIN employee AS manager 
                ON manager.id = employee.manager_id 
            WHERE manager.id IS NOT NULL
            GROUP BY manager_id;
            `;

            return new Promise((resolve, reject) => {
              connection.query(query2, (err, data) => {
                if (err) reject(err);
                else resolve(data);
              });
            });
        })
        .then((managersData) => {
            const managers = managersData.map(
              (item) => `${item.manager_name} ID:${item.manager_id}`
            );
      
            return inquirer.prompt([
                {
                    name: "manager",
                    type: "list",
                    message: "Which manager is the employee under?",
                    choices: [...managers, "None"],
                },
            ]);
        })
        .then((answer) => {
            const query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
            connection.query( query,
                [
                    userInput1.first_name,
                    userInput1.last_name,
                    userInput1.role.split("ID: ")[1],
                    answer.manager.split("ID:")[1],
                ],
              (err, data) => {
                    if (err) throw err;
                    console.log(
                        `Added ${userInput1.first_name} ${userInput1.last_name} to the database`
                    );

                    ViewAllEmployees();
                }
            );
        });
}

// works
function UpdateEmployeeRole() {
    console.log("Updating an employee");

    var query =
    `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    JOIN role r
      ON e.role_id = r.id
    JOIN department d
        ON d.id = r.department_id
    JOIN employee m
      ON m.id = e.manager_id`
  
    connection.query(query, function (err, res) {
      if (err) throw err;
  
      const employeeChoices = res.map(({ id, first_name, last_name }) => ({
        value: id, name: `${first_name} ${last_name}`      
      }));
  
      console.table(res);

      console.log("Employees To Update:\n")
  
      roleArray(employeeChoices);
    })
}

// works -> part of update role
function roleArray(employeeChoices) {
    console.log("Updating an role");
  
    var query =
    `
    SELECT r.id, r.title, r.salary 
    FROM role r
    `
    let roleChoices;
  
    connection.query(query, function (err, res) {
      if (err) throw err;
  
      roleChoices = res.map(({ id, title, salary }) => ({
        value: id, title: `${title}`, salary: `${salary}`      
      }));
  
      console.table(res);

      promptEmployeeRole(employeeChoices, roleChoices);
    });
}

// works -> part of update role
function promptEmployeeRole(employeeChoices, roleChoices) {

    inquirer
      .prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Which employee do you want to set with the role?",
          choices: employeeChoices
        },
        {
          type: "list",
          name: "roleId",
          message: "Which role do you want to update?",
          choices: roleChoices
        },
      ])
      .then(function (answer) {
  
        var query = `UPDATE employee SET role_id = ? WHERE id = ?`
        // when finished prompting, insert a new item into the db with that info
        connection.query(query,
          [ answer.roleId,  
            answer.employeeId
          ],
          function (err, res) {
            if (err) throw err;
  
            console.table(res);
            console.log(res.affectedRows + "Updated successfully!");
  
            menuQuestions();
          });
      });
}

// works
function ViewAllRoles() {
    console.log("Viewing all roles: \n")

    let query = `
    SELECT role.id, role.title, role.salary, department.name AS department 
    FROM role 
    LEFT JOIN department 
    ON role.department_id = department.id;`;
    
    connection.query(query, function(err, res) {
        if (err) throw err;
        
        console.table(res);

        menuQuestions()
    })
}

// works
function AddRole() {
  const query = `SELECT department.name FROM department`;
  
  connection.query(query, (err, data) => {
    if (err) throw err;
    const departments = data.map((item) => `${item.name}`);
    
    inquirer.prompt([
        {
          type: "input",
          name: "title",
          message: "What is the title of the role?",
        },
        {
          type: "input",
          name: "salary",
          message: "What is the salary of the role?",
        },
        {
          type: "list",
          name: "department_name",
          message: "What is the department of the role?",
          choices: [...departments],
        },
      ])
        .then((data) => {
            const { title, salary, department_name } = data;
        
            connection.query(
                `
                INSERT INTO role (title, salary, department_id)
                SELECT ?, ?, department.id
                FROM department
                WHERE department.name = ?
                `,
                [title, salary, department_name],
                
                (err, res) => {
                    if (err) throw err;
                
                    console.log(`Role ${title} has been added!`);

                    ViewAllRoles();
                }
            );
        });
    });
}

// works
function ViewAllDepartments() {
    let query = "SELECT * FROM department";
    
    connection.query(query, function(err, res) {
        if (err) throw err;
    
        console.table(res);

        menuQuestions()
    })
}

// works
function AddDepartment() {
    inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "What is the name of the department?",
      },
    ])
    .then((data) => {
      const { name } = data
      
      connection.query(
        `INSERT INTO department (name) VALUES (?)`,
        [name],
        (err, res) => {
          if (err) throw err
          console.log(
            `Department ${name} has been added!`
          )

          ViewAllDepartments();
        }
      )
    })
}

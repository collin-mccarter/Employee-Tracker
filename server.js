// Import inquirer, express, and mysql2
const inquirer = require('inquirer');
const express = require('express');
const mysql = require("mysql2");

// Setting up console.table
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

// setting up main menu and connection
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

// Setting up main menu options and functionality
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
                // exits the application
                console.log("Thank you for using employee tracker")

                connection.end();
                process.exit();
        }
    })
}

// Function for viewing all employees in database
function ViewAllEmployees() {
    console.log("Viewing all employees: \n")

    // getting data to be displayed for employees list
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
    
    // creating loop back to main menu
    menuQuestions();
    })
}

// Function for adding a employee to the database
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
            // setting up where you can pick employee role from list
            const roles = rolesData.map(
              (item) => `Role title: ${item.title}, Role ID: ${item.id}`
            );
      
            return inquirer.prompt([
              {
                type: "input",
                name: "first_name",
                message: "What is the employee's first name?",
              },
              {
                type: "input",
                name: "last_name",
                message: "What is the employee's last name?",
              },
              {
                type: "list",
                name: "role",
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
            
            // allows user to pick which manager employee works under
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
            // adds responses into employee database
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
                    
                    // loop back to main menu
                    ViewAllEmployees();
                }
            );
        });
}

// Function for updating an employees role
function UpdateEmployeeRole() {
    console.log("Updating an employee");

    var query = `
    SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    JOIN role r
      ON e.role_id = r.id
    JOIN department d
        ON d.id = r.department_id
    JOIN employee m
      ON m.id = e.manager_id
    `
  
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

// Part of update role -> passes in choices for options
function roleArray(employeeChoices) {
    console.log("Updating an role");
    
    var query = `
    SELECT r.id, r.title, r.salary 
    FROM role r
    `

    let roleChoices;
    
    // creating options for roles to be picked and passed through
    connection.query(query, function (err, res) {
      if (err) throw err;
  
      roleChoices = res.map(({ id, title, salary }) => ({
        value: id, title: `${title}`, salary: `${salary}`      
      }));
  
      console.table(res);
      
      promptEmployeeRole(employeeChoices, roleChoices);
    });
}

// Part of update role -> employee and roles passed in
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
        // updating the employee role that was picked
        var query = `
        UPDATE employee SET role_id = ? WHERE id = ?
        `

        // when answers are recieved, insert new information into employee_db
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

// Function for viewing all roles
function ViewAllRoles() {
    console.log("Viewing all roles: \n")

    // setting up a query
    let query = `
    SELECT role.id, role.title, role.salary, department.name AS department 
    FROM role 
    LEFT JOIN department 
    ON role.department_id = department.id;`;
    
    // logs the response and loops back to menu
    connection.query(query, function(err, res) {
        if (err) throw err;
        
        console.table(res);

        menuQuestions()
    })
}

// Function for adding a role
function AddRole() {
    // setting up a query
    const query = `SELECT department.name FROM department`;
  
    connection.query(query, (err, data) => {
        if (err) throw err;
        
        // getting department list
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
            
            // adds role and information into departments and loops back to menu
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

// Function for viewing departments
function ViewAllDepartments() {
    let query = "SELECT * FROM department";
    
    connection.query(query, function(err, res) {
        if (err) throw err;
    
        console.table(res);

        menuQuestions()
    })
}

// Function for adding a department
function AddDepartment() {
    // prompts questions
    inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "What is the name of the department?",
      },
    ])
    .then((data) => {
      const { name } = data
      
      // passes department into database -> loops back to main meu
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

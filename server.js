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
                viewAllEmployees();
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
                AddRole;
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

function viewAllEmployees() {
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

function AddEmployee() {
    console.log("Please enter employee information: \n")

    inquirer.prompt([
        {
            type: "input",
            message: "What is the employees first name?",
            name: "first_name"
        },
        {
            type: "input",
            message: "What is the employees last name?",
            name: "last_name"
        },
        {
            type: "list",
            message: "What is the employees role ID number??",
            name: "roleId"
        },
        {
            type: "input",
            message: "What is the manager ID number?",
            name: "managerId"
        }
    ])
    .then(function(answer) {
      connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", [answer.first_name, answer.last_name, answer.roleId, answer.managerId], function(err, res) {
        if (err) throw err;

        console.table(res);

        menuQuestions();
      });
    });
}

function UpdateEmployeeRole() {
    const employeeChoices = res.map(({ id, first_name, last_name }) => ({
        value: id, name: `${first_name} ${last_name}`
    }));
    
    let roleChoices

    roleChoices = res.map(({ id, title, salary }) => ({
        value: id, title: `${title}`, salary: `${salary}`      
    }));
    
    inquirer.prompt([
        {
            type: "list",
            message: "Which employee would you like to update?",
            name: "employeeId",
            choices: employeeChoices
        },
        {
            type: "list",
            message: "Which role do you want to update?",
            name: "roleId",
            choices: roleChoices
        }
    ])
    .then (function(answer) {
        let query = `UPDATE employee SET role_id = ? WHERE id = ?`
        
        connection.query(query, [answer.roleId, answer.employeeId],function(err, res) {
            if (err) throw err;
            console.table(res);

            console.log(res.affectedRows + "Updated successfully!");

            menuQuestions();
        })
    })
}

function ViewAllRoles() {
    let query = "SELECT * FROM role";
    
    connection.query(query, function(err, res) {
    if (err) throw err;
    console.table(res);
    })

    menuQuestions()
}

function AddRole() {
    let query = `SELECT d.id, d.name, r.salary AS budget FROM employee e JOIN role r ON e.role_id = r.id JOIN department d ON d.id = r.department_id GROUP BY d.id, d.name`

    connection.query(query, function (err, res) {
        if (err) throw err;
    })

    const departmentChoices = res.map(({ id, name }) => ({
        value: id, name: `${id} ${name}`
    }));

    console.table(res)
    console.log("Departments:")

    inquirer.prompt ([
        {
            type: "input",
            message: "What is the role title?",
            name: "roleTitle"
        },
        {
            type: "input",
            message: "What is the role salary?",
            name: "roleSalary"
        },
        {
            type: "list",
            message: "What department is the role in?",
            name: "departmentId",
            choices: departmentChoices
        }
    ])
    .then(function(answer) {
        connection.query(`INSERT INTO role SET ?`, [answer.title, answer.salary, answer.departmentId], 
        function(err, res) {
            if (err) throw err;
            
            console.table(res);
            console.log("Role Added")

            menuQuestions()
        })
    })
}

function ViewAllDepartments() {
    let query = "SELECT * FROM department";
    
    connection.query(query, function(err, res) {
        if (err) throw err;
    
        console.table(res);

        menuQuestions()
    })
}

function AddDepartment() {
    inquirer.prompt([
        {
            type: "input",
            name: "departmentId",
            message: "What is the name of the new department?"
        }
    ])
    .then(function(answer){
        connection.query("INSERT INTO department_id (name) VALUES (?)", [answer.departmentId] , function(err, res) {
            if (err) throw err;
            
            console.table(res)
           
            menuQuestions()
        })
    })
}

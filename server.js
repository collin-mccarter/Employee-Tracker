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

// 'pipe' broken?
function AddEmployee() {
    console.log("Please enter employee information: \n")

    let query = `SELECT r.id, r.title, r.salary FROM role r`;

    connection.query(query, function (err, res) {
        if(err) throw err

        const roleChoices = res.map(({ id, title, salary }) => ({
            value: id, title: `${title}`, salary: `${salary}`
        }))

        console.table(res);

        promptInsert(roleChoices);
    })
}

// part of add employee
function promptInsert(roleChoices) {
    inquirer.prompt()[
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
            message: "What is the employees role ID number?",
            name: "roleId",
            choices: roleChoices
        },
        {
            type: "input",
            message: "What is the manager ID number?",
            name: "managerId"
        }
    ]
    .then(function (answer) {
        console.log(answer)

        var query = `INSERT INTO employee SET ?`
        
        connection.query(query,
        {
          first_name: answer.first_name,
          last_name: answer.last_name,
          role_id: answer.roleId,
          manager_id: answer.managerId,
        },
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log(res.insertedRows + "Inserted successfully!\n");

          menuQuestions();
        })
    })
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

// works part of update role
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

// works part of update role
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

// broken
function AddRole() {
    let query =`
    SELECT d.id, d.name, r.salary AS budget
    FROM employee e
    JOIN role r
    ON e.role_id = r.id
    JOIN department d
    ON d.id = r.department_id
    GROUP BY d.id, d.name`
      
    connection.query(query, function (err, res) {
        if (err) throw err;
      
        const departmentChoices = res.map(({ id, name }) => ({
        value: id, name: `${id} ${name}`
        }));
      
        console.table(res);
        console.log("Department array!");
      
        promptAddRole(departmentChoices);
    });
}

// broken -> add role
function promptAddRole(departmentChoices) {
    inquirer.prompt([
        {
          type: "input",
          name: "roleTitle",
          message: "What is the role title?"
        },
        {
          type: "input",
          name: "roleSalary",
          message: "What is the role salary?"
        },
        {
          type: "list",
          name: "departmentId",
          message: "What department is it in?",
          choices: departmentChoices
        },
      ])
      .then(function (answer) {
        var query = `INSERT INTO role SET ?`
  
        connection.query(query, {
          title: answer.title,
          salary: answer.salary,
          department_id: answer.departmentId
        },
          function (err, res) {
            if (err) throw err;
  
            console.table(res);
            console.log("Role Inserted!");
  
            menuQuestions();
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

const inquirer = require('inquirer');
const mysql = require('mysql');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
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
    ╔═══╗     ╔╗              ╔═╗╔═╗
    ║╔══╝     ║║              ║║╚╝║║
    ║╚══╦╗╔╦══╣║╔══╦╗─╔╦══╦══╗║╔╗╔╗╠══╦═╗╔══╦══╦══╦═╗
    ║╔══╣╚╝║╔╗║║║╔╗║║─║║║═╣║═╣║║║║║║╔╗║╔╗╣╔╗║╔╗║║═╣╔╝
    ║╚══╣║║║╚╝║╚╣╚╝║╚═╝║║═╣║═╣║║║║║║╔╗║║║║╔╗║╚╝║║═╣║
    ╚═══╩╩╩╣╔═╩═╩══╩═╗╔╩══╩══╝╚╝╚╝╚╩╝╚╩╝╚╩╝╚╩═╗╠══╩╝
           ║║      ╔═╝║                     ╔═╝║
           ╚╝      ╚══╝                     ╚══╝`)

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
        if (answer.choices === "View All Employees") {
            ViewAllEmployees();
        }
        else if (answer.choices === "Add Employee") {
            AddEmployee();
        } 
        else if (answer.choices === "Update Employee Role") {
            UpdateEmployeeRole();
        }
        else if (answer.choices === "View All Roles") {
            ViewAllRoles();
        }
        else if (answer.choices === "Add Role") {
            AddRole();
        }
        else if (answer.choices === "View All Departments") {
            ViewAllDepartments();
        }
        else if (answer.choices === "Add Department") {
            AddDepartment();
        }
        else if (answer.choices === "Quit") {
            console.log("Thank you for using employee tracker!");
            connection.end();
        }
    })
}

function ViewAllEmployees() {
    console.log("Viewing all employees: \n")

    let query = "SELECT * FROM employee";

    connection.query(query, function(err,res) {
    if (err) throw err;

    console.table(res);
    
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
    inquirer.prompt([
        {
            type: "input",
            message: "Which employee would you like to update?",
            name: ""
        }
    ])
}
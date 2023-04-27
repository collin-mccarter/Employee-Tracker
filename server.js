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

    init();
})

function init() {
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
}


const mysql = require('mysql');
const inquirer = require('inquirer');
const dotenv = require('dotenv');
const cTable = require('console.table');
dotenv.config();

const connection = mysql.createConnection({
    host: 'localhost',

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: 'root',

    // Be sure to update with your own MySQL password!
    password: process.env.PASSWORD,
    database: 'employee_db',
});

addDepartment = () => {
    inquirer.prompt([
        {
            name: "department_name",
            message: "What is the department's name?",
            type: "input"
        }
    ]).then(answers => {
        const { department_name } = answers;
        connection.query("INSERT INTO department (department_name) VALUES (?)", [department_name], (err) => {
            if (err) throw err;
            console.log('Department added successfully');
            init();
        })
    })
}

addRole = () => {
    connection.query("SELECT * FROM department", (err, res) => {
        const choices = res.map(result => result.department_name);
        inquirer.prompt([
            {
                name: "title",
                message: "What is the title of the role?",
                type: "input"
            },
            {
                name: "salary",
                message: "What is the salary of the role?",
                type: "number"
            },
            {
                name: "department_name",
                message: "What department does this role fall into?",
                type: "list",
                choices
            }
        ]).then(answers => {
            const { title, salary, department_name } = answers;
            connection.query("SELECT id FROM department WHERE department_name = ?", [department_name], (err, res) => {
                const department_id = res[0].id;
                connection.query("INSERT INTO employee_role SET ?", [{
                    title,
                    salary,
                    department_id
                }], err => {
                    if (err) throw err;
                    console.log("Role added successfully!");
                    init();
                })
            })
        })
    })
}

addEmployee = () => {
    connection.query("SELECT * FROM employee", (err, res) => {
        const manChoices = res.map(result => result.first_name + " " + result.last_name);
        manChoices.push("None")
        connection.query("SELECT * FROM employee_role", (err, res) => {
            const roleChoices = res.map(result => result.title);
            inquirer.prompt([
                {
                    name: "first_name",
                    message: "What is their first name?",
                    type: "input"
                },
                {
                    name: "last_name",
                    message: "What is their last name?",
                    type: "input"
                },
                {
                    name: "title",
                    message: "What is the title of the role?",
                    type: "list",
                    choices: roleChoices
                },
                {
                    name: "manager_name",
                    message: "Who is their manager?",
                    type: "list",
                    choices: manChoices
                }
            ]).then(answers => {
                const {first_name, last_name, title, manager_name} = answers;
                connection.query("SELECT id FROM role WHERE SELECT id FROM employee WHERE first_name + last_name = ?", [manager_name], (err, res) => {
                    let manager_id
                    if (manager_name === "None") {
                        manager_id = null;
                    } else {
                        manager_id = res[0].id;
                    }
                    connection.query("SELECT id FROM employee_role WHERE title = ?", [title], (err, res) => {
                        const role_id = res[0].id;
                        connection.query("INSERT INTO employee SET ?", [{
                            first_name,
                            last_name,
                            role_id,
                            manager_id
                        }], (err) => {
                            if (err) throw err;
                            console.log("Employee added successfully!");
                            init();
                        })
                    })
                })
            })
        })
    })
}

init = () => {
    inquirer.prompt([
        {
            name: "intention",
            message: "What would you like to do?",
            type: "list",
            choices: [
                "Add department",
                "Add role",
                "Add employee",
                "View all departments",
                "View all roles",
                "View all employees",
                "Exit"
            ]
        }
    ]).then(answers => {
        const { intention } = answers;
        switch (intention) {
            case 'Add department':
                return addDepartment();
            case 'Add role':
                return addRole();
            case "Add employee":
                return addEmployee();
            case "View all departments":
                return viewDepartments();
            case "View all roles":
                return viewRoles();
            case "View all employees":
                return viewEmployees();
            case "Exit":
            default:
                connection.end();
        }
    })
}

connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    init();
});
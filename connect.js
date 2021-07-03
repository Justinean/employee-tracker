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
    user: process.env.USER,

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
        if (choices.length > 0) {
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
        } else {
            console.log("-----------------------------------");
            console.log("| No departments in the database! |");
            console.log("-----------------------------------");
            init();
        }
    })
}

addEmployee = () => {
    connection.query("SELECT * FROM employee", (err, res) => {
        const manChoices = res.map(result => result.first_name + " " + result.last_name);
        manChoices.push("None")
        connection.query("SELECT * FROM employee_role", (err, res) => {
            const roleChoices = res.map(result => result.title);
            if (roleChoices.length > 0) {
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
                    let managerName = manager_name.split(" ");
                    connection.query("SELECT id FROM employee WHERE first_name = ? AND last_name = ?", [managerName[0], managerName[1]], (err, res) => {
                        let manager_id;
                        console.log(res)
                        if (res.length <= 0) {
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
            } else {
                console.log("---------------------------------");
                console.log("|   No roles in the database!   |");
                console.log("---------------------------------");
                init();
            }
        })
    })
}

viewDepartments = () => {
    connection.query("SELECT * FROM department", (err, res) => {
        let display = [];
        if (res <= 0) {
            console.log("-----------------------------------");
            console.log("| No departments in the database! |");
            console.log("-----------------------------------");
            init();
        }
        for (let i in res) {
            let object = {
                Id: res[i].id,
                Name: res[i].department_name
            }
            display.push(object);
            if (Number(i) >= res.length - 1) {
                console.table(display);
                init();
            }
        }
    })
}

viewRoles = () => {
    connection.query("SELECT * FROM employee_role", (err, resp) => {
        let display = [];
        if (resp.length <= 0) {
            console.log("---------------------------------");
            console.log("|   No roles in the database!   |");
            console.log("---------------------------------");
            init();
        }
        for (let i in resp) {
            let object = {
                Id: resp[i].id,
                Title: resp[i].title,
                Salary: resp[i].salary
            }
            connection.query("SELECT * FROM department WHERE id = ?", [resp[i].department_id], (err, res) => {
                if (res.length > 0) {
                    object["Department Name"] = res[0].department_name
                } else {
                    object["Department Name"] = "None"
                }
                display.push(object);
                if (Number(i) >= resp.length - 1) {
                    console.table(display);
                    init();
                }
                
            })
        }
    })
}

viewEmployees = () => {
    connection.query("SELECT * FROM employee", (err, resp) => {
        let display = [];
        if (resp.length <= 0) {
            console.log("---------------------------------");
            console.log("| No employees in the database! |");
            console.log("---------------------------------");
            init();
        }
        for (let i in resp) {
            let id = resp[i].id;
            let first_name = resp[i].first_name;
            let last_name = resp[i].last_name;
            let title;
            let department;
            let salary;
            let manager_name;
            let hasManager = resp[i].manager_id;
            connection.query("SELECT * FROM employee_role WHERE id = ?", [resp[i].role_id], (err, res) => {
                if (err) throw err;
                if (res.length > 0){
                    title = res[0].title;
                    salary = res[0].salary;
                } else {
                    title = "None";
                    salary = "None";
                    res[0] = {};
                    res[0].department_id = null;
                }
                connection.query("SELECT * FROM department WHERE id = ?", [res[0].department_id], (err, res) => {
                    if (err) throw err;
                    if (res.length > 0){
                        department = res[0].department_name;
                    } else {
                        department = "None";
                    }
                    connection.query("SELECT * FROM employee WHERE id = ?", [hasManager], (err, res) => {
                        if (err) throw err;
                        if (hasManager !== null) {
                            manager_name = res[0].first_name + " " + res[0].last_name;
                        } else {
                            manager_name = "None";
                        }
                        let object = {
                            Id: id,
                            "First Name": first_name,
                            "Last Name": last_name,
                            Title: title,
                            Department: department,
                            Salary: salary,
                            Manager: manager_name
                        }
                        display.push(object);
                        if (Number(i) >= resp.length - 1) {
                            console.table(display);
                            init();
                        }
                    })
                })
            })
        }
    })
}

viewByManager = () => {
    connection.query("SELECT first_name, last_name FROM employee", (err, res) => {
        const choices = res.map(result => result.first_name + " " + result.last_name);
        inquirer.prompt([
            {
                name: "manager",
                message: "Which manager do you want to see the employees of?",
                type: "list",
                choices
            }
        ]).then(answer => {
                let firstLast = answer.manager.split(" ")
                connection.query("SELECT id FROM employee WHERE ? AND ?", [{first_name: firstLast[0]}, {last_name: firstLast[1]}], (err, res) => {
                    connection.query("SELECT * FROM employee WHERE ?", {manager_id: res[0].id}, (err, resp) => {
                        if (resp.length <= 0) {
                            console.log("-----------------------------------");
                            console.log("| No employees with this manager! |");
                            console.log("-----------------------------------");
                            return init();
                        }
                        let display = [];
                        for (let i in resp) {
                            let id = resp[i].id;
                            let first_name = resp[i].first_name;
                            let last_name = resp[i].last_name;
                            let title;
                            let department;
                            let salary;
                            let manager_name;
                            let hasManager = resp[i].manager_id;
                            connection.query("SELECT * FROM employee_role WHERE id = ?", [resp[i].role_id], (err, res) => {
                                if (err) throw err;
                                if (res.length > 0){
                                    title = res[0].title;
                                    salary = res[0].salary;
                                } else {
                                    title = "None";
                                    salary = "None";
                                    res[0] = {};
                                    res[0].department_id = null;
                                }
                                connection.query("SELECT * FROM department WHERE id = ?", [res[0].department_id], (err, res) => {
                                    if (err) throw err;
                                    if (res.length > 0){
                                        department = res[0].department_name;
                                    } else {
                                        department = "None";
                                    }
                                    connection.query("SELECT * FROM employee WHERE id = ?", [hasManager], (err, res) => {
                                        if (err) throw err;
                                        if (hasManager !== null) {
                                            manager_name = res[0].first_name + " " + res[0].last_name;
                                        } else {
                                            manager_name = "None";
                                        }
                                        let object = {
                                            Id: id,
                                            "First Name": first_name,
                                            "Last Name": last_name,
                                            Title: title,
                                            Department: department,
                                            Salary: salary,
                                            Manager: manager_name
                                        }
                                        display.push(object);
                                        if (Number(i) >= resp.length - 1) {
                                            console.table(display);
                                            init();
                                        }
                                    })
                                })
                            })
                        }
                    })
                })
            }
        )
    })
}

updateEmployeeRole = () => {
    connection.query("SELECT first_name, last_name FROM employee", (err, res) => {
        const choices = res.map(result => result.first_name + " " + result.last_name);
        inquirer.prompt([
            {
                name: "person",
                message: "Who's role do you want to change?",
                type: "list",
                choices
            }
        ]).then(answer => {
            connection.query("SELECT title FROM employee_role", (err, res) => {
                const choices = res.map(result => result.title);
                inquirer.prompt([
                    {
                        name: "role",
                        message: `What role do you want ${answer.person} to have?`,
                        type: "list",
                        choices
                    }
                ]).then(answers => {
                    connection.query("SELECT id, title FROM employee_role WHERE ?", {title: answers.role}, (err, response) => {
                        let firstSecond = answer.person.split(" ");
                        connection.query("UPDATE employee SET ? WHERE ? AND ?", [{role_id: response[0].id}, {first_name: firstSecond[0]}, {last_name: firstSecond[1]}], (err, res) => {
                            console.log(`${answer.person}'s role has been updated to ${response[0].title}!`);
                            init();
                        })
                    })
                    
                })
            })
        })
    })
}

updateEmployeeManager = () => {
    connection.query("SELECT first_name, last_name FROM employee", (err, res) => {
        const choices = res.map(result => result.first_name + " " + result.last_name);
        inquirer.prompt([
            {
                name: "person",
                message: "Who's manager do you want to change?",
                type: "list",
                choices
            }
        ]).then(answer => {
            let firstLast = answer.person.split(" ")
            connection.query("SELECT first_name, last_name FROM employee WHERE NOT ? AND NOT ?", [{first_name: firstLast[0]}, {last_name: firstLast[1]}], (err, res) => {
                const choices = res.map(result => result.first_name + " " + result.last_name);
                inquirer.prompt([
                    {
                        name: "manager",
                        message: `Who do you want to manage ${answer.person}?`,
                        type: "list",
                        choices
                    }
                ]).then(answers => {
                    let firstLastMan = answers.manager.split(" ")
                    connection.query("SELECT id FROM employee WHERE ? AND ?", [{first_name: firstLastMan[0]}, {last_name: firstLastMan[1]}], (err, res) => {
                        connection.query("UPDATE employee SET ? WHERE ? AND ?", [{manager_id: res[0].id}, {first_name: firstLast[0]}, {last_name: firstLast[1]}], (err) => {
                            console.log(`${answer.person}'s manager updated to ${answers.manager}`);
                            init();
                        })
                    })
                })
            })
        })
    })
}

deleteEmployee = () => {
    connection.query("SELECT first_name, last_name FROM employee", (err, res) => {
        const choices = res.map(result => result.first_name + " " + result.last_name);
        inquirer.prompt([
            {
                name: "person",
                message: "Who do you want to delete?",
                type: "list",
                choices
            }
        ]).then(answer => {
            let firstLast = answer.person.split(" ");
            connection.query("DELETE FROM employee WHERE ? AND ?", [{first_name: firstLast[0]}, {last_name: firstLast[1]}], (err, res) => {
                console.log("Employee deleted!");
                init();
            })
        })
    })
}

deleteRole = () => {
    connection.query("SELECT title FROM employee_role", (err, res) => {
        const choices = res.map(result => result.title);
        inquirer.prompt([
            {
                name: "role",
                message: "What role do you want to delete?",
                type: "list",
                choices
            }
        ]).then(answer => {
            connection.query("SELECT id FROM employee_role WHERE ?", {title: answer.role}, (err, response) => {
                connection.query("DELETE FROM employee_role WHERE ?", [{title: answer.role}], (err) => {
                    connection.query("UPDATE employee SET ? WHERE ?", [{role_id: null}, {role_id: response[0].id}], (err, res) => {
                        console.log("Role deleted!");
                        init();
                    })
                })
            })
        })
    })
}

deleteDepartment = () => {
    connection.query("SELECT department_name FROM department", (err, res) => {
        const choices = res.map(result => result.department_name)
        inquirer.prompt([
            {
                name: "name",
                message: "Which department do you want to delete?",
                type: "list",
                choices
            }
        ]).then(answer => {
            connection.query("SELECT id FROM department WHERE ?", {department_name: answer.name}, (err, response) => {
                connection.query("DELETE FROM department WHERE ?", [{department_name: answer.name}], (err) => {
                    connection.query("DELETE FROM employee_role WHERE ?", [{department_id: response[0].id}], (err, res) => {
                        console.log(res)
                        console.log("Department deleted!");
                        init();
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
                "View all employees of a certain manager",
                "Update employee role",
                "Update employee manager",
                "Delete employee",
                "Delete role",
                "Delete department",
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
            case "View all employees of a certain manager":
                return viewByManager();
            case "Update employee role":
                return updateEmployeeRole();
            case "Update employee manager":
                return updateEmployeeManager();
            case "Delete employee":
                return deleteEmployee();
            case "Delete role":
                return deleteRole();
            case "Delete department":
                return deleteDepartment();
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
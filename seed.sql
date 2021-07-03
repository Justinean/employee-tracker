DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE employee (
	id INTEGER AUTO_INCREMENT NOT NULL,
	first_name VARCHAR(30),
    last_name VARCHAR(30),
	role_id INTEGER,
	manager_id INTEGER,
    PRIMARY KEY(id)
);

CREATE TABLE employee_role (
	id INTEGER AUTO_INCREMENT NOT NULL,
	title VARCHAR(30),
    salary DECIMAL,
	department_id INTEGER,
    PRIMARY KEY(id)
);

CREATE TABLE department (
	id INTEGER AUTO_INCREMENT NOT NULL,
	department_name VARCHAR(30),
    PRIMARY KEY(id)
);



INSERT INTO department (department_name)
	VALUES ("Hardware"),
    ("Grocery");
    
INSERT INTO employee_role (title, salary, department_id)
	VALUES ("Pickup", 15000, 2),
    ("Cashier", 10000, 2),
    ("Stocking", 15000, 1);
    
INSERT INTO employee (first_name, last_name, role_id, manager_id)
	VALUES ("Justin", "Hoch", 1, null),
    ("Jon", "Hoc", 2, 1),
    ("Josh", "Hallow", 3, null);
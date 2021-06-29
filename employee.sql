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


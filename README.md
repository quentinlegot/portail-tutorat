# Portail Tutorat

## Requirement 

- Node.js 16.x.y or equivalent and npm 8.x.y
- MariaDB 10.x

You can check version of your softwares (if already installed) by using these commands: `npm -v`, `node -v` and `mysql --version`

## Install project 

1. First you need to export database content to MySQL or MariaDB, execute command `mysql -u <username> -p < export.sql` inside project directory, it'll demand your password and then it'll create all content needed (and some examples to show you all possibility of our project). If you're on Windows, we recommend you a desktop software like HeidiSQL to import database data.

2. Execute command `npm install` inside project directory to install all dependencies (you need an internet connection).

3. Change content of `.env` file to help the software to connect to your database.

## Launching server

Execute command `npm start` inside project directory.

## Configure project

Server is listening on port 8080, but you can change it by editing `PORT` in `.env` file, you need to be a priviliged user(root) to use port below 1024.


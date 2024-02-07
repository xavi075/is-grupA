# Sensor Center: control and automate crop irrigation

## General description
Over the past few months, Ferran, Arnau, and I have been collaborating on a project to control and automate crop irrigation. The device is autonomous and includes a battery that is recharged with solar energy. 

The project involves designing and 3D printing the encapsulation, developing the device firmware, creating software for a master device that connects the sensors to a cloud database through an API, and designing an intuitive graphical interface that is easy to use and fully portable for any electronic device. This allows the user to control their irrigation system from anywhere. 

The firmware was developed using C++, while the master software and database API were implemented in Python. MySQL was used as the database management system. The web application was developed with React and Typescript and its service was launched into production using Docker on a server.

> [!IMPORTANT]
> Some parts of the firmware are adapted to our hardware needings.

## Web Board
Web-board directory includes the application web project. It is responsive and has been designed based on the requirements of our university project.

> [!WARNING]
> All the packages that must be installed are registered in the package log and must be installed using `npm install` command

In order to run the web app locally, just use `npm start`. Also, currently the requests are pointing to the database. In case of running the database locally, it is strictly necessary to change the Endpoint in the `api.ts` file.

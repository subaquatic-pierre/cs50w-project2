# CS50W Project 2 - Chat I/O

- AWS Hosted Project: [3.133.164.139](http://3.133.164.139)
- Served with NGINX and Gunicorn

## Overview

This application is a simple web chat application that allows real time web chat. The application uses the Socket IO library to allow for realtime
interaction with the server, via AJAX requests. When first visiting the site users are requested to enter a login name, the page then updates with
the full web chat application. The user is automatically logged into the main chat group which is 'Scuba'. Once the user is logged in they have access
to user controls which inlcude creating a room, leaving a room and login out.

If the user has been to the site before and has not logged out or left a room they will have their details stored within local storage. The login form
will not be represented to them, they will automatically be logged into the room they were in with the username they had.

## Personal touches

- Login Form does not display if the user has local storage data
- User can leave a room which remove room data from local storage
- User can completely log out which rooms all local storage data
- User controls only show on log in

## Technology

### Languages

- Python
Server side language
- Javascript
Client side script used for error handling and AJAX requests
- HTML5 and CSS3
Used for page layout and styling

### Frameworks

#### Flask

Light weight framework used to server requests

#### Socket IO

Client side javascript library used to allow for realtime interaction with the server

#### Handlebars

A tempplating library used to render javascript templates into HTML

#### Bootstrap

This is used for simple layout design and buttons

#### NGINX

Server proxy for static files

#### Gunicorn

Server for python scripts


## Created by

Pierre du Toit 




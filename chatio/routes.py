from time import localtime, strftime
import string
from chatio import app, login_manager, db, socketio, all_rooms, active_users
from flask import render_template, url_for, redirect, flash
from flask_login import UserMixin, login_user, logout_user, current_user
from flask_socketio import send, emit, join_room, leave_room
from chatio.models import *
from chatio.forms import LoginForm, ChatForm

##### ROUTES #####

@app.route('/', methods=['GET', 'POST'])
def index():
    form = LoginForm()

    if form.validate_on_submit():
        user = User()
        user.id = form.username.data
        # Check if username is teken
        if user.id in active_users:
            flash(f'Sorry that username is alreaedy taken', 'info')
            return redirect(url_for('index'))
        active_users.append(user.id)
        login_user(user)
        return redirect(url_for('mainchat'))

    return render_template('index.html', title='Home', form=form)

    
@app.route('/chat', methods=['GET', 'POST'])
def mainchat():
    form = ChatForm()
    return render_template('chat.html', title='Chat', form=form, rooms=all_rooms)

    
@app.route('/logout', methods=['GET', 'POST'])
def logout():
    # User logged in and is in room, clicks log out button, or logout route
    if current_user.id and current_user.id in active_users:
        active_users.remove(current_user.id)
        flash(f'Thank you for joining us!', 'info')
    # User logged in but may not be in a room
    logout_user()    
    return redirect(url_for('index'))


##### SOCKET IO HANDELERS #####

# Message sent to server
@socketio.on('message')
def message(data):
    room = find_room(data['room'].lower())
    send({
        'msg': data['msg'], 
        'username': data['username'], 
        'time_stamp': strftime('%b-%d %I:%M%p', localtime())        
        }, room=room.name)


# User joins room
@socketio.on('join')
def join(data):
    room = find_room(data['room'].lower())
    # add username to room
    room.add_user(data['username'])    
    join_room(room.name)
    emit('join',
        {'msg': data['username'] + ' has joined ' + data['room'], 
        'username': data['username'], 
        'join_room': True,
        'room': room.name,
        'users': room.users
        }, room=room.name)


# Leave a room
@socketio.on('leave')
def leave(data):
    try:
        room = find_room(data['room'].lower())
        print(data)
        # Remove username from room
        room.del_user(data['username'])
        emit('leave',
        {'msg': data['username'] + ' has left ' + data['room'], 
        'room': room.name, 
        'username': data['username'], 
        'leave_room': True,
        'users': room.users
        }, room=room.name)    
        leave_room(room.name)
    except:
        return None

# Create room
@socketio.on('create')
def create(data):
    roomname = f"{data['room']}_r"
    roomname = Room(data['room'])
    admin = data['username']
    emit('created', {'room':roomname.name, 'users':admin})
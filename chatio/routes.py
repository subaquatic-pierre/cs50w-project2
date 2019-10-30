from time import localtime, strftime
import time
import string
from chatio import app, socketio, all_rooms, active_users
from flask import render_template, jsonify
from flask_socketio import send, emit, join_room, leave_room
from chatio.models import *


##### ROUTES #####

@app.route('/', methods=['GET'])
def mainchat():
    return render_template('chat.html', title='Chat')

    
##### SOCKET IO HANDELERS #####

@socketio.on('login')
def login(data):
    
    room = find_room(data['room'].lower())
    user = User()
    user.id = data['username']
    active_users.add(user.id)
    join_room(room.name)

    # add username to room if not already in room
    if user.id not in room.users:
        room.add_user(user.id)
    
    emit('login',
        {'msg': data['username'] + ' has joined room - ' + data['room'].capitalize(), 
        'username': data['username'], 
        'join_room': True,
        'room': room.name,
        'users': room.users,
        'rooms': [room.name for room in all_rooms],
        'users': list(active_users),
        'all_msgs': room.all_msgs
        }, room=room.name)
    print('\n\nLogin Event:')
    print('From Client:', data, '\nRoom details:')
    print(room)
    print('\n\nACTIVE USERS: ', active_users)


# Message sent to server
@socketio.on('message')
def message(data):
    room = find_room(data['room'].lower())
    room.add_msg(data['msg'], data['username'], strftime('%b-%d %I:%M%p', localtime()))
    send({
        'msg': data['msg'], 
        'room': room.name,
        'username': data['username'], 
        'time_stamp': strftime('%b-%d %I:%M%p', localtime())        
        }, room=room.name)
    print('\n\nOn Message Event:')
    print(room)


# User joins room
@socketio.on('join')
def join(data):
    
    room = find_room(data['room'].lower())
    if data['username'] not in room.users:
        room.add_user(data['username'])    
        join_room(room.name)    
    emit('join',
        {'msg': data['username'] + ' has joined room - ' + data['room'].capitalize(), 
        'username': data['username'], 
        'join_room': True,
        'room': room.name,
        'users': room.users,
        'rooms': [room.name for room in all_rooms],
        'all_msgs': room.all_msgs
        }, room=room.name)
    print('\n\nOn Join Event:')
    print('From Client:', data, '\nRoom details:')
    room_log()
    print('\n\nACTIVE USERS: ', active_users)



# Leave a room receive from client
@socketio.on('leave')
def leave(data):
    room = find_room(data['room'].lower())
    # Remove username from room
    room.del_user(data['username'])         
    emit('leave',
    {'msg': data['username'] + ' has left room - ' + data['room'].capitalize(),
    'room': room.name, 
    'username': data['username'], 
    'leave_room': True,
    'users': room.users,
    'rooms': [room.name for room in all_rooms],
    }, room=room.name)       
    leave_room(room.name)     
    print('\n\nOn Leave Event:')
    print('From Client:', data, '\nRoom details:')
    room_log()
    print('\n\nACTIVE USERS: ', active_users)


# Leave a room receive from client
@socketio.on('logout')
def leave(data):    
    # If try not work user is not in room
    try:
        if data['room']:
            room = find_room(data['room'].lower())
            leave_room(room.name) 
            # Remove username from room
            room.del_user(data['username'])
    except:
        print('User not in any room');

    active_users.remove(data['username'])    
    emit('logout',
    {'msg': data['username'] + ' has logged out! ',
    'users': list(active_users),
    'username': data['username'],
    })       
    print('\n\nOn LOGOUT Event:')
    print('From Client:', data, '\nRoom details:')
    room_log()
    print('\n\nACTIVE USERS: ', active_users)


# Create room on receive create room event from client
@socketio.on('create')
def create(data):
    roomname = (f"{data['room']}_r").lower()
    roomname = Room((data['room']).lower())
    emit('create', 
        {'msg': data['username'] + ' has created room - ' + data['room'].capitalize(), 
        'username': data['username'],
        'join_room': True,
        'room':roomname.name, 
        'users':roomname.users,
        'rooms': [room.name for room in all_rooms],
        }, broadcast=True)
    print('\n\nOn Create Event:')
    print('From Client:', data, '\nRoom details:')
    room_log()



def room_log():
    for room in all_rooms:
        print(room)
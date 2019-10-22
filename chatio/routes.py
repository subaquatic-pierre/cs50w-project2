from time import localtime, strftime
import string
from chatio import app, login_manager, db, socketio
from flask import render_template, url_for, redirect, flash
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import InputRequired
from flask_login import UserMixin, login_user, logout_user, current_user
from flask_socketio import send, emit, join_room, leave_room


##### SOCKET IO HANDELERS #####

# All chat rooms
ROOMS = ['scuba', 'fishes', 'sharks', 'dolphins']
active_users = []

# Message sent to server
@socketio.on('message')
def message(data):
    room = data['room']
    send({
        'msg': data['msg'], 
        'username': data['username'], 
        'time_stamp': strftime('%b-%d %I:%M%p', localtime())        
        }, room=room)


# User joins room
@socketio.on('join')
def join(data):
    room = data['room'].lower()
    join_room(room)
    emit('room',
        {'msg': data['username'] + ' has joined ' + data['room'], 
        'username': data['username'], 
        'join_room': True,
        'room': room,
        'user_current_room': room
        }, room=room)


# Leave a room
@socketio.on('leave')
def leave(data):
    room = data['room'].lower()
    emit('room',
        {'msg': data['username'] + ' has left ' + data['room'], 
        'room': room, 
        'username': data['username'], 
        'leave_room': True
        }, room=room)    
    leave_room(room)    






##### FORMS #####

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[InputRequired()])
    submit = SubmitField('Login')


class ChatForm(FlaskForm):
    message = StringField('Message')
    submit = SubmitField('Send')


##### MODELS #####

class User(UserMixin):
    pass


@login_manager.user_loader
def user_loader(username):
    user = User()
    user.id = username
    return user


@login_manager.request_loader
def request_loader(request):
    user = User()
    user.id = request.form.get('username')
    return user


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
    return render_template('chat.html', title='Chat', form=form, rooms=ROOMS, users=active_users)

    
@app.route('/logout', methods=['GET', 'POST'])
def logout():
    logout_user()
    flash(f'Thank you for joining us!', 'info')
    return redirect(url_for('index'))


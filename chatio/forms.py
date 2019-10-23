from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import InputRequired


class LoginForm(FlaskForm):
    username = StringField('Username', validators=[InputRequired()])
    submit = SubmitField('Login', id='login-btn')


class ChatForm(FlaskForm):
    message = StringField('Message')
    submit = SubmitField('Send')
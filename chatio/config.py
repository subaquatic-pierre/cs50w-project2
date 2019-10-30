import os, json


with open('/home/pierre/Courses/cs50w/projects/project2/config.json') as config_file:
    config = json.load(config_file)

class Config():
    SECRET_KEY = config.get("SECRET_KEY")
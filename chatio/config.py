import os, json


with open('/home/pierre/etc/cs50w/project2/config.json') as config_file:
    config = json.load(config_file)

class Config():
    SECRET_KEY = config.get("SECRET_KEY")








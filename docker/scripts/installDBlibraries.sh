#!/bin/bash
apt-get update
apt-get -y install python3
apt-get -y install python3-pip
apt-get -y install git

export PATH="$PATH:/usr/local/bin"

pip3 install Flask 
pip3 install pytz 
pip3 install Flask-CORS 
pip3 install mysql-connector-python
#!/bin/bash
apt-get -y install curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
source ~/.bashrc
nvm install 14.10.0
nvm use 14.10.0
nvm alias default v14.10.0
nvm use default
npm install -g npm@7.24.2
node -v
npm -v

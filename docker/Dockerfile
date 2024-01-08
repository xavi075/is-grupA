FROM ubuntu:20.04

USER root
# COPY --chmod=777 /.ssh/* /home/.ssh

COPY --chmod=777 ./scripts/* /usr/local/bin/
# instal·lar llibreries necessaries per executar la api de la base de dades
RUN installDBlibraries.sh

EXPOSE 5000 3000

WORKDIR /home

RUN mkdir -p /home/basedades

WORKDIR /home/basedades

RUN git clone https://github.com/xavi075/is-grupA.git -b apiDB

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server && \
    service mysql start && \
    mysql -u root -e "CREATE USER 'arnau'@'localhost' IDENTIFIED BY 'isgrupA';" && \
    mysql -u root -e "GRANT ALL PRIVILEGES ON *.* TO 'arnau'@'localhost';" && \
    mysql -u root -e "FLUSH PRIVILEGES;" 

RUN mkdir -p /home/database

COPY --chmod=777 ./database/* /home/database

WORKDIR /home/database

ENV MYSQL_ARNAU_PASSWORD=isgrupA

RUN service mysql start && \
    mysql -u arnau -p${MYSQL_ARNAU_PASSWORD} -e "CREATE DATABASE integracioSistemes;" && \
    mysql -u arnau -p${MYSQL_ARNAU_PASSWORD} -e "USE integracioSistemes;" && \
    mysql -u arnau -p${MYSQL_ARNAU_PASSWORD} -e "SET autocommit = 0;" && \
    mysql -u arnau -p${MYSQL_ARNAU_PASSWORD} --database=integracioSistemes < integracioSistemes.sql

RUN mkdir -p /home/web

WORKDIR /home/web

RUN git clone https://github.com/xavi075/is-grupA.git -b apiWEB

WORKDIR /home/web/is-grupA/web-board

RUN installWEBlibraries.sh

ENV NODE_PATH /root/.nvm/versions/node/v14.10.0/lib/node_modules
ENV PATH /root/.nvm/versions/node/v14.10.0/bin:$PATH 


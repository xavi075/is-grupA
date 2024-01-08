FROM ubuntu:20.04

USER root

RUN apt install openssh-server -y

RUN sed -E -i 's|^#?(PasswordAuthentication)\s.*|\1 no|' /etc/ssh/sshd_config && \
    if ! grep '^PasswordAuthentication\s' /etc/ssh/sshd_config; then echo 'PasswordAuthentication no' >> 
/etc/ssh/sshd_config; fi

RUN mkdir /root/.ssh
RUN touch /root/.ssh/authorized_keys

RUN echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCs/O1UVJNgQAeHfx8tTeKGX/fJoxeQJZi4T6gt+7SHaNQ0/F3yXMl+QUE9pzlLSWJrsV0h+TH8tTFdPV7W6s55jfCFuY/JQgNeO6BqByrwL6L2u33ih59zkti5zFexYtkxGgoNyuk2sRMdLpEqK6OkV591fxRcQIsiwHaIOmfmpACRj9mpHONnN1zklK+kY0PfuZvVogrYctHHlXNW9wL+LghBUxhzPFSQQKTIc3wbcoPGT3cJkuxKmiL5CZbSWsEwqjQ0QSyhb6RrSMDj6QEPRctnuoWPwcgj8dWhAuGl/2RI88z17ixGUUr13dYqOVy1wxaNgEk0bu2qEn9m5Y6QBZxkGAMKYWSawQwTkweoYXtjd10B6qocDVlnR7WzMHl0hfzraoVs5RDh5X0R71tdgV559xO0uZEpgDbNQ/J/zeRrGAFFz/aWJkWi8YjJGOr2M8+eohmDyAWAi/P13tsfyEUOpMgNALAndBTEbliA7NjsgZK5pIiCqDUeedkZNEs= arnau@arnau-HP-Pavilion-x360-Convertible-14-dh1xxx" >> /root/.ssh/authorized_keys

RUN chmod 700 /root/.ssh
RUN chmod 600 /root/.ssh/authorized_keys

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


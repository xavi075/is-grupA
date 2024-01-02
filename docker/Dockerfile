FROM ubuntu:20.04

USER root
# COPY --chmod=777 /.ssh/* /home/.ssh

COPY --chmod=777 ./scripts/* /usr/local/bin/
# instal·lar llibreries necessaries per executar la api de la base de dades
RUN installDBlibraries.sh

EXPOSE 5000

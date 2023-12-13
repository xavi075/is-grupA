FROM ubuntu:20.04

COPY --chmod=777 ./.ssh/* /home/.ssh

COPY --chmod=777 ./scripts/* /usr/local/bin/
RUN installDBlibraries.sh
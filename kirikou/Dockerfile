FROM ubuntu:latest

RUN apt-get update
RUN apt-get install -y vim git tmux nano

COPY watcher/watcher /watcher
COPY setup-user.sh /setup-user.sh

COPY install.sh install.sh
RUN chmod +x install.sh
RUN ./install.sh
RUN rm install.sh


CMD ["bash"]
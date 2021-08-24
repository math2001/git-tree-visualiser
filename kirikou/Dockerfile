FROM ubuntu:latest

RUN apt-get update
RUN apt-get install -y vim git tmux nano

COPY install.sh install.sh
RUN chmod +x install.sh
RUN ./install.sh
RUN rm install.sh

COPY watcher/watcher /watcher

CMD ["bash"]
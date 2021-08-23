FROM ubuntu:latest

RUN apt-get update
RUN apt-get install -y vim git tmux

COPY install.sh install.sh
RUN chmod +x install.sh
RUN ./install.sh
RUN rm install.sh

CMD ["bash"]
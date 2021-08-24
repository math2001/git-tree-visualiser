#!/bin/bash

user=$1

find /home/$1/ -delete
ps -ef | grep "^$1" | awk '{print $2}' | xargs kill -9
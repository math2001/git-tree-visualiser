#!/bin/bash

if test "$(hostname)" = "inspirux"
then
        echo "running on host machine"
        exit
fi

NUMBER_USER=100

addgroup runners

for ((i=0; i<$NUMBER_USER;i++))
do
        useradd --create-home --no-user-group --system "runner-$i"
done
#!/bin/bash

if test "$(hostname)" = "inspirux"
then
        echo "running on host machine, this should run on the kirikou instance containers"
        exit
fi

NUMBER_USER=100

addgroup runners

for ((i=0; i<$NUMBER_USER;i++))
do
        useradd --create-home --groups=runners --no-user-group --system "runner-$i"
done

echo "umask u=rw,g=,o=" >> /etc/profile.d/02-set-umask.sh
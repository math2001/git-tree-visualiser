#!/bin/bash

if test "$(hostname)" = "inspirux"; then
    echo "running on host machine, this should run on the kirikou instance containers"
    exit
fi

useradd --create-home --system runner

chmod -R +x /samples/

su -c 'bash /setup-user.sh' runner
rm /setup-user.sh

#!/bin/bash
# deploy to Digital Ocean

# upload the backend binary
# download latest image of kirikou

SSH_ADDR="root@137.184.41.190"

username=math2001
token=$(echo 'https://index.docker.io/v1/' | sudo docker-credential-secretservice get | jq -r .Secret)

trap 'exit 1;' EXIT INT

ssh "$SSH_ADDR" <<ENDSSH
echo "$token" | docker login --username "$username" --password-stdin
docker pull math2001/kirikou
rm ~/.dockder/config.json
pkill backend
mv backend{,.old}
ENDSSH

cd backend
make build
rsync -v --progress ./backend "$SSH_ADDR:~/backend"
cd ..

ssh "$SSH_ADDR" <<'ENDSSH'
nohup ./backend &
disown
ENDSSH
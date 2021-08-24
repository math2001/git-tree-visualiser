#/bin/bash

user=$(whoami)
git config --global user.name "$user"
git config --global user.email "$user@gitgraph.viz"

cd ~
mkdir repo
cd repo
git init -q

echo "Make some commits!" >> README.md
echo >> README.md
echo "You can read the tutorial if you're unsure what to try." >> README.md

git add README.md 
git commit -q -m "initial commit"


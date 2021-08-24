git config --global user.name runner
git config --global user.email "runner@gitgraph.viz"

cd /home/runner
mkdir repo
cd repo
git init -q

echo "Make some commits!" >> README.md
echo >> README.md
echo "You can read the tutorial if you're unsure what to try." >> README.md

git add README.md 
git commit -q -m A

cat >> ~/.bashrc <<'EOF'
PS1='\$ '

commit() {
    touch $1
    git add $1
    git commit -m $1
}
EOF
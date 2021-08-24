#!/bin/bash

commit() {
    touch $1
    git add $1
    git commit -qm $1
}

find . -delete -not -path .

git init -q
commit A
commit B

git checkout -qb second
commit C2
commit D2

git checkout -q master
commit C1
commit D1
commit E1

git merge second -qm "M"
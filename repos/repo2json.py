import json
import subprocess
from collections import deque

# sparse: don't remove duplicate branches
lines = (
    subprocess.check_output(["git", "rev-list", "--all", "--children", "--sparse"])
    .decode("utf-8")
    .splitlines()
)


commits = {}

all_hashes = set()
all_children = set()  # all the hashes that are a child of another commit

for line in lines:
    (hash, *children) = line.split(" ")
    commits[hash] = {
        "message": subprocess.check_output(["git", "show", hash, "-s", "--format=%B"])
        .decode("utf-8")
        .splitlines()[0]
        .strip(),
        "children": list(
            sorted(children)
        ),  # sort (remember, these are commit hash) to get consistent graphs
        "parents": [],
    }
    all_hashes.add(hash)
    for child in children:
        all_children.add(child)

branches = {}
for line in subprocess.check_output(["git", "show-ref"]).decode("utf-8").splitlines():
    hash, ref = line.split(" ", 2)
    if ref.startswith("refs/heads/"):
        branches[ref.replace("refs/heads/", "")] = hash

roots = list(all_hashes - all_children)
q = deque(roots)
while q:
    hash = q.popleft()
    for child_hash in commits[hash]["children"]:
        commits[child_hash]["parents"].append(hash)
        q.append(child_hash)


print(
    json.dumps(
        {
            "commits": commits,
            "roots": roots,
            "branches": branches,
            "HEAD": subprocess.check_output(["git", "symbolic-ref", "HEAD"])
            .decode("utf-8")
            .replace("refs/heads/", "")
            .strip(),
        },
    )
)

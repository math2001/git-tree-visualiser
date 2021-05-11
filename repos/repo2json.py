import json
import subprocess

# sparse: don't remove duplicate branches
lines = (
    subprocess.check_output(["git", "rev-list", "--all", "--children", "--sparse"])
    .decode("utf-8")
    .splitlines()
)


commits = {}
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
    }

print(json.dumps(commits))

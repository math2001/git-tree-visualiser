import flask
import os
import repo2json

app = flask.Flask(__name__)
os.chdir("live")


@app.route("/api/get-repo-details")
def index():
    return repo2json.get_repo_details()


app.run(port=8080)

# Endpoints

## `GET /attach` (websocket)

1. Finds a container with at least one free user, if none, spawn a container. 
2. start a bash shell
3. git init and spawn a watcher (notifies changes in .git directory)

On this websocket (/attach), the first message sent is the user-id, and then the
rest is terminal data (keystrokes, stdout and stderr) flowing from the container
to the front end.

## `POST /resize`

Resizes the terminal, so that it matches with the dimension on the front end.

```json
{
    "user-id": "<user id provided by /attach>",
    "width": 80,
    "height": 24
}
```

## `GET /commit-graph?user-id=<user-id>` (websocket)

Websocket connection with the server sending repository details to render the
graph. Server just sends JSON-encoded details as soon as the `.git` repository
changes (throttled).

    TODO: if needed, the server expects an `{"type": "ok"}` response after each
    update, so that the front end doesn't get overloaded.

WebSocket connection is denied if there is another open websocket open on that
endpoint, for that user id.

The WebSocket is closed as soon as the `/attach` WebSocket closes.

# Internals

The backend maps a user-id (the only things the front end sees) to a (container
id, username) pair.

Containers don't have access to the network.

Containers' root file system is read only.

## Watching the .git folder

In every container, there is a script called `watch-git` which, given a username
watches the `.git` folder at the root of the user's home directory. As a soon as
file changes in there, the details needed by the front-end are computed,
serialized into JSON and then printed to stdout.

It's the host that attaches (reads stdout) to that process when `watch-git` is
started, and it always sends the last JSON object on a per-user-id channel, which
is consumed by `/commit-graph`.

There can only be one `/commit-graph` web socket open per `/attach` web socket
(they form a pair).
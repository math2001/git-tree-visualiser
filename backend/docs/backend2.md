# Backend

There are two web sockets: /attach and /repo-details

/attach gives the userID, and then it's just the terminal's data being sent back
and forth
/repo-details can be establised once you have the user ID.

When /repo-details drops, the watcher is killed, and that's it (reconnect to it,
and another watcher will be started)
When /attach drops, the entire container is killed.
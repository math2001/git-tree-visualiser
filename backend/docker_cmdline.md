# Build the image

    kirkou # docker image build --rm -t kirikou .

# Start the container

    # # -it allocates a pseudo terminal, and keep stdin open
    # # this is important, because otherwise the container exits straight away
    # # (CMD is bash, so I guess if there is no tty, then it just exits straight
    # # away, and doesn't keep the container running)
    #
    # docker container create -it kirkou
    # docker container start <container id>
    # docker container attach <container id>

# Start an exec

    # docker container create -it kirikou
    # docker container start <container id>
    # docker container exec -it <container id> bash
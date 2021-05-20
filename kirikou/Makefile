.PHONY: image

image: Dockerfile resize.go
	go build -o manager resize.go
	sudo docker build -t kirikou .

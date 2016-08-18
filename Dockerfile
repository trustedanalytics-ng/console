FROM tapimages.us.enableiot.com:8080/tap-base-node:latest
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy prepared app package
COPY docker-package /usr/src/app

EXPOSE 8080
CMD [ "npm", "start" ]

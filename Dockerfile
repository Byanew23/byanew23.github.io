# Use an official Nginx image
FROM nginx:alpine

# Copy the content of the local src directory to the working directory
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

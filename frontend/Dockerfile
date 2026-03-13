
# Builds the lit web application using a base image node:20-alpine
# acting as a workstage to help compile the code. We save the bundled
# binaries and assets in the container's /app/dist/ folder
FROM node:20-alpine AS build
WORKDIR /app

#https://docs.railway.com/builds/dockerfiles#using-variables-at-build-time
ARG VITE_API_URL
ARG VITE_WSS_URL

RUN echo $VITE_API_URL
RUN echo $VITE_WSS_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# As the last and final stage, Nginx takes the compiled files 
# from the /app/dist folder and serves them as static html/css/javascript. 
# At this point, Node.js is no longer required here since we have 
# plain JS that we can send to the client's browser. Moreover we expose the 
# container's internal port 80 which is later mapped to 8080 on the host machine
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
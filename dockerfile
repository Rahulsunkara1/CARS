FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5001
ENV PORT=5001
ENV MONGO_URI=mongodb://mongo:27017/carDB
CMD ["node", "server.js"]

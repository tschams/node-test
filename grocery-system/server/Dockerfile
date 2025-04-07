FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=5000
ENV MONGODB_URI=mongodb://mongo:27017/grocery-store
ENV JWT_SECRET=grocery_store_secret_key_change_in_production

EXPOSE 5000

CMD ["npm", "start"] 
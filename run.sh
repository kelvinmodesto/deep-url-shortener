## ---- MONGODB
#docker pull mongo
#docker pull postgres
#docker pull mysql


docker run  --name mongodb -p 27017:27017  -e MONGO_INITDB_ROOT_USERNAME="admin"  -e MONGO_INITDB_ROOT_PASSWORD="admin" -d mongo

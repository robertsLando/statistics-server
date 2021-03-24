# Metrics stack

Full stack that provides all the tools to store and visualize custom metrics using docker

- mongodb 
- node-red: http://localhost:1880
- Backend (for apis): http://localhost:5000
- Mongodb charts: http://localhost:8080

## Install

```bash
git clone https://github.com/robertsLando/metrics-stack.git
cd metrics-stack
docker-compose up
```

## Update

```bash
git pull
docker-compose down && docker-compose up --build
```

`docker-compose up --build` is needed to force re-build of backend apis container

## Credentials

- MongoDB Charts: admin@example.com mongodb

## Backend

Uses an Express server to provide apis to store metrics to MongoDB. The only thing that needs to be configured are the database name and the collections with their unique fields. Unique fields are necessary to identify a document uniquely in the DB. This can be done [here](backend/db/index.js)

### APIs

#### POST `/metrics`

Used to add a metrics to the db. The metrix are added using `upsert`, it means that if the document exists in the db it will be updated, otherwise a new doc will be added. The expected payload is:

```js
{
    "collection": "collectionName",
    "data": [{...}, {...}, ...] // array of documents to add to the collection
}
```

#### POST `/update-db`

Used in this specific case to update some db collections. No payload is needed

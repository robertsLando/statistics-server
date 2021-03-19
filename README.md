# cubejs-docker

Cubejs docker test

- pgadmin: http://localhost:5050
- node-red: http://localhost:1880
- cube-playground: http://localhost:4000
- cube server (for apis): http://localhost:3000

First time you run this using `docker compose up` you will need to create the `cubejs` database. Go to http://localhost:5050, add a server, name `local` host `postgres` credentials `admin` and `cubejs`. Now right click on `Databases` and create a database named `cubejs`. Restart docker compose and enjoy.

Schemas:

```js
Network {
homeId: string,
active: boolean,
totalDevices: number,
zjsVersion: string,
lastUpdate: Date/Time
}

Device {
nodeId: number,
network: string,
manufacturer: string,
prodType: string,
prodId: string
}
```
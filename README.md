## Installation

1. Copy .env.sample to .env, .env.development
2. Make dev
3. run .sql script in mssql

```bash
$ yarn install
```

Create or Alter

1. run command `make dev`
2. docker exec -it {container id api} sh
3. add or edit migrate.prisma file
4. yarn prisma:migrate
5. enter a name for the new migrations

Run Migrate (run .sql file in folder migrations)

1. docker exec -it {container id api} sh
2. yarn prisma:migration

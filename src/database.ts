import { knex as setupKnex, Knex } from 'knex'
import { env } from './env'

const dbConnection =
    env.DATABASE_CLIENT === 'sqlite' ? { filename: env.DATABASE_URL } : env.DATABASE_URL

export const config: Knex.Config = {
    client: env.DATABASE_CLIENT,
    connection: dbConnection,
    useNullAsDefault: true,
    migrations: {
        extension: 'ts',
        directory: './db/migrations'
    }
}

export const knex = setupKnex(config)

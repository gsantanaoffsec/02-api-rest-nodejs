import { knex as setupKnex, Knex } from 'knex'
import { env } from './env'

// configuração do banco de dados
export const config: Knex.Config = {
  // as configurações do banco de dados, devem seguir o padrão de Knex.Config
  client: 'sqlite',
  connection: {
    filename: env.DATABASE_URL,
  },
  // todos os campos do banco, por padrão, terão os valores nulos
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const knex = setupKnex(config)

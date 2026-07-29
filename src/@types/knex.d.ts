// .d.ts - definição de tipos, este arquivo terá apenas código TypeScript

// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
    // estamos dizendo aqui quais tabelas existem no nosso banco de dados 
  export interface Tables {
    transactions: {
      id: string
      title: string
      amount: number
      created_at: string
      session_id?: string // leva ? pois é opcional
    }
  }
}

// .d.ts - definição de tipos, este arquivo terá apenas código TypeScript

// eslint-disable-next-line
import { Knex } from 'knex'  // existe apenas para o TypeScript reconhecer os tipos do Knex, não importa nenhum código que será executado

// interface - é um 'contrato' que define o formato de um objeto sem implementar nada

// adição de informações ao módulo 'knex/types/tables'
// Module Augmentation (extensão de um módulo existente)
declare module 'knex/types/tables' {
  // estamos dizendo aqui quais tabelas e tipos existem no nosso banco de dados
  // estendendo a interface existente no Knex, chamada 'Tables'
  export interface Tables {
    // nome da tabela: transactions
    transactions: {
      id: string
      title: string
      amount: number
      created_at: string
      session_id?: string // leva ? pois é opcional
    }
  }
}

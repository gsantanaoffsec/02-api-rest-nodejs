import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

// ! esse código é um plugin que foi construído para o Fastify

// todo plugin do Fastify precisa ser obrigatoriamente uma função assíncrona (async)
export async function transactionsRoutes(app: FastifyInstance) {
  // precisamos dizer para o TypeScript qual é o formato do app (app: FastifyInstance)
  // todas as rotas vão ter 'transactions' no nome/path - ex: app.post('/transactions')
  app.post('/', async (request, reply) => {
    // { title, amount, type: credit/debit }

    const createTransactionBodySchema = z.object({
      // z.object({}) - request body sempre é um objeto
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    // validação dos dados da requisição (request.body) pra ver se eles batem com o schema definido
    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    // o Knex não consegue identificar quais campos e tabelas existem no nosso banco de dados
    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type == 'credit' ? amount : amount * -1, // quando uma transação do tipo débito for cadastrada o amount já vai ser cadastrado com valor negativo
    })

    // envia o código HTTP 201
    return reply.status(201).send()
  })
}

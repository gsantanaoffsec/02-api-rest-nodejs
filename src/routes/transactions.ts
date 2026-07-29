import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

// ! esse código é um plugin que foi construído para o Fastify

// todo plugin do Fastify precisa ser obrigatoriamente uma função assíncrona (async)
export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    // handler: função que lida com o funcionamento dessa rota
    async (request) => {
      const { sessionId } = request.cookies

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select('*')

      // retorna um objeto em vez de um array para permitir adicionar mais informações sem alterar a estrutura da resposta
      // um objeto permite adicionar mais informações à resposta sem quebrar quem consome a API
      return {
        transactions,
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      // criação de um schema (modelo)
      // validar os parâmetros da URL
      const getTransactionParamsSchema = z.object({
        // o parâmetro id deve existir, ser uma string e estar no formato UUID
        id: z.string().uuid(),
      })

      const { id } = getTransactionParamsSchema.parse(request.params) // parse: faz a validação

      const { sessionId } = request.cookies

      // const resultado = getTransactionParamsSchema.parse(request.params)
      // const id = resultado.id

      const transaction = await knex('transactions')
        .where({
          session_id: sessionId,
          id,
        })
        .first() // busca o primeiro e único resultado de id

      return {
        transaction,
      }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      // buscar as transações onde o session_id tenha o mesmo sessionId dos cookies e somar todos os valores de 'amount'
      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' }) // criação da coluna 'amount'
        .first()

      return {
        summary,
      }
    },
  )

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

    // procurando dentro dos cookies da requisição se já existe uma 'sessionId'
    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      })
    }

    // o Knex não consegue identificar quais campos e tabelas existem no nosso banco de dados
    await knex('transactions').insert({
      id: randomUUID(),
      title,
      // quando uma transação do tipo débito for cadastrada o amount já vai ser cadastrado com valor negativo
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    // envia o código HTTP 201
    return reply.status(201).send()
  })
}

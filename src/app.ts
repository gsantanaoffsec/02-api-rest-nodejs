import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { transactionsRoutes } from './routes/transactions'

export const app = fastify()

// a ordem que definimos o plugin é a ordem que o Fastify vai executar

// todas as rotas que começarem com '/transactions' vão cair no plugin que foi criado
app.register(cookie)

// app.addHook('preHandler', async (request, reply) => {
//   console.log(`[${request.method}} ${request.url}`)
// })

app.register(transactionsRoutes, {
  prefix: 'transactions',
})

import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Transactions routes', () => {
  // dentro dessa função, eu posso executar algum código antes que todos os testes executem
  // será executada apenas uma vez
  beforeAll(async () => {
    await app.ready() // aguardar que o app esteja pronto
  })

  afterAll(async () => {
    await app.close() // depois que todos os testes terminarem, a aplicação é fechada
  })

  beforeEach(() => {
    // possibilita executar comandos no terminal por dentro da aplicação node
    // a cada teste eu apago o banco e crio de novo
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest ')
  })

  // Testes Automatizados - possuem 3 'variáveis' importantes

  // enunciado — descreve o comportamento esperado
  // execução — roda a função ou ação que está sendo testada
  // validação — verifica se o resultado foi o esperado

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)
  })

  // todo teste, deve obrigatoriamente, se excluir de qualquer contexto
  // ou seja, jamais um teste pode depender do outro, se isso acontecer, eles deveriam ser o mesmo
  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('set-cookie')

    if (!cookies) {
      throw new Error('Cookie not found!')
    }

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000,
      }),
    ])
  })

  // --- here ---

  it('should be able to get a specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('set-cookie')

    if (!cookies) {
      throw new Error('Cookie not found!')
    }

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTransactionResponse.body.transaction).toEqual(
      // o return de transaction' já é um objeto, logo [] não são necessárias
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000,
      }),
    )
  })

  it('should be able to get the summary', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('set-cookie')

    if (!cookies) {
      throw new Error('Cookie not found!')
    }

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Debit transaction',
        amount: 2000,
        type: 'debit',
      })

    if (!cookies) {
      throw new Error('Cookie not found!')
    }

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({
      amount: 3000,
    })
  })
})

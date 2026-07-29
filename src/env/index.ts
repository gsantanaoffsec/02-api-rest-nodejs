import 'dotenv/config' // lê o arquivo .env e expõe todos os valores dentro de uma variável global - process.env
import { z } from 'zod'

// schema - nada mais é do que um formato de dado

// envSchema - diz exatamente como as variáveis devem ser
const envSchema = z.object({
  // diz em qual ambiente a aplicação está rodando
  // developmente, test, production
  // quando a aplicação estiver executando sem informar a NODE_ENV, utiliza-se 'production' por padrão
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  // apenas string é aceito
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
})

// safeParse() - compara process.env com envSchema
// verifica dentro de process.env, procurando se existe uma 'DATABASE_URL' pra verificar se é uma string e se não está vazia ou com valor incorreto
const _env = envSchema.safeParse(process.env) // process.env - objeto que contém todas as variáveis de ambiente da aplicação

if (_env.success == false) {
  console.error('Invalid enviroment variables!', _env.error.format())

  throw new Error('Invalid enviroment variables.')
}

// exportação dos dados válidos apenas
export const env = _env.data

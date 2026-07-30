"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    await knex.schema.createTable('transactions', (table) => {
        table.uuid('id').primary();
        table.text('title').notNullable();
        table.decimal('amount', 10, 2).notNullable();
        // Crie uma coluna created_at do tipo data/hora.
        // Se ninguém informar um valor, coloque automaticamente a data e hora atuais. 
        // E nunca permita que essa coluna fique vazia.
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    });
}
exports.up = up;
async function down(knex) {
    await knex.schema.dropTable('transactions');
}
exports.down = down;

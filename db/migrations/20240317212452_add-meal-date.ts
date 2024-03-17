import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('meals', table => {
        table.datetime('meal_date').notNullable().after('is_on_diet')
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('meals', table => {
        table.dropColumn('meal_date')
    })
}

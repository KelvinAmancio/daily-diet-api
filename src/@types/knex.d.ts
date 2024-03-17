import 'knex'

declare module 'knex/types/tables' {
    export interface Tables {
        meals: {
            id: string
            session_id: string
            name: string
            description: string
            is_on_diet: boolean
            meal_date: string
            created_at: string
        }
    }
}

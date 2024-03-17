import 'knex'

declare module 'knex/types/tables' {
    export interface Tables {
        meals: {
            id: string
            session_id?: string
            name: string
            description: string
            is_on_diet: boolean
            created_at: string
        }
    }
}

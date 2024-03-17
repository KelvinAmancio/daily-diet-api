import { FastifyInstance } from 'fastify'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export async function mealsRoutes(app: FastifyInstance) {
    /** @todo list all user meals */
    app.get('/', { preHandler: [checkSessionIdExists] }, async request => {
        const { sessionId } = request.cookies
        const meals = await knex('meals').where('session_id', sessionId).select()
        return { meals }
    })

    /** @todo show specific user meal */
    app.get('/:id', { preHandler: [checkSessionIdExists] }, async request => {
        const { sessionId } = request.cookies

        const getMealParamsSchema = z.object({ id: z.string().uuid() })
        const { id } = getMealParamsSchema.parse(request.params)

        const meal = await knex('meals').where({ id, session_id: sessionId }).first()
        return { meal }
    })

    /** @todo show user meals metrics */
    app.get('/metrics', { preHandler: [checkSessionIdExists] }, async request => {
        const { sessionId } = request.cookies

        const meals = await knex('meals')
            .where('session_id', sessionId)
            .orderBy('meal_date', 'asc')
            .select()

        const totalMeals = meals.length
        const mealsOnDiet = meals.filter(filter => filter.is_on_diet).length
        const mealsOffDiet = totalMeals - mealsOnDiet

        // let mealsOnDietSequence = []
        const bestMealsOnDietSequence = 0
        // for (const [index, meal] of meals.entries()) {
        //     if (meal.is_on_diet) {
        //         bestMealsOnDietSequence++
        //     }

        //     if (!meal.is_on_diet && index < totalMeals - 1) {
        //         bestMealsOnDietSequence = 0
        //     }
        // }

        const metrics = {
            total: totalMeals,
            meals_on_diet: mealsOnDiet,
            meals_off_diet: mealsOffDiet,
            best_meals_on_diet_sequence: bestMealsOnDietSequence
        }

        return { metrics }
    })

    /** @todo create new meal */
    app.post('/', async (request, reply) => {
        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            is_on_diet: z.boolean(),
            meal_date: z.string()
        })

        const {
            name,
            description,
            is_on_diet: isOnDiet,
            meal_date: mealDate
        } = createMealBodySchema.parse(request.body)

        let sessionId = request.cookies.sessionId

        if (!sessionId) {
            sessionId = randomUUID()

            reply.setCookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            })
        }

        await knex('transactions').insert({
            id: randomUUID(),
            name,
            description,
            is_on_diet: isOnDiet,
            meal_date: mealDate,
            session_id: sessionId
        })

        return reply.status(201).send()
    })

    /** @todo edit meal */
    app.patch('/:id', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const { sessionId } = request.cookies

        const editMealParamsSchema = z.object({ id: z.string().uuid() })
        const { id } = editMealParamsSchema.parse(request.params)

        const editMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            is_on_diet: z.boolean(),
            meal_date: z.string()
        })

        const {
            name,
            description,
            is_on_diet: isOnDiet,
            meal_date: mealDate
        } = editMealBodySchema.parse(request.body)

        await knex('meals')
            .update({
                name,
                description,
                is_on_diet: isOnDiet,
                meal_date: mealDate
            })
            .where({ id, session_id: sessionId })

        return reply.status(204).send()
    })

    /** @todo delete meal */
    app.delete('/:id', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const { sessionId } = request.cookies

        const deleteMealParamsSchema = z.object({ id: z.string().uuid() })
        const { id } = deleteMealParamsSchema.parse(request.params)

        await knex('meals').delete().where({ id, session_id: sessionId })

        return reply.status(204).send()
    })
}

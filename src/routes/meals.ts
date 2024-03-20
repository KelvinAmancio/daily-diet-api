import { FastifyInstance } from 'fastify'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export async function mealsRoutes(app: FastifyInstance) {
    app.get('/', { preHandler: [checkSessionIdExists] }, async request => {
        const meals = await knex('meals').where('user_id', request.user?.id).select()
        return { meals }
    })

    app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const getMealParamsSchema = z.object({ id: z.string().uuid() })
        const { id } = getMealParamsSchema.parse(request.params)

        const meal = await knex('meals').where({ id }).first()

        if (!meal || meal.user_id !== request.user?.id) {
            return reply.status(400).send({ error: 'Meal not found' })
        }

        return { meal }
    })

    app.get('/metrics', { preHandler: [checkSessionIdExists] }, async request => {
        const meals = await knex('meals')
            .where('user_id', request.user?.id)
            .orderBy('meal_date', 'asc')
            .select()

        const totalMeals = meals.length
        const mealsOnDiet = meals.filter(meal => meal.is_on_diet).length
        const mealsOffDiet = totalMeals - mealsOnDiet

        let bestMealsOnDietSequence = 0
        let mealsOnDietSequence = []
        for (const meal of meals) {
            if (meal.is_on_diet) {
                mealsOnDietSequence.push(meal.id)
                continue
            }

            if (bestMealsOnDietSequence < mealsOnDietSequence.length) {
                bestMealsOnDietSequence = mealsOnDietSequence.length
            }

            mealsOnDietSequence = []
        }

        const metrics = {
            total: totalMeals,
            meals_on_diet: mealsOnDiet,
            meals_off_diet: mealsOffDiet,
            best_meals_on_diet_sequence: bestMealsOnDietSequence
        }

        return { metrics }
    })

    app.post('/', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            is_on_diet: z.number().int().min(0).max(1),
            meal_date: z.coerce.date()
        })

        const {
            name,
            description,
            is_on_diet: isOnDiet,
            meal_date: mealDate
        } = createMealBodySchema.parse(request.body)

        await knex('meals').insert({
            id: randomUUID(),
            name,
            description,
            is_on_diet: Boolean(isOnDiet),
            meal_date: mealDate.toISOString(),
            user_id: request.user?.id
        })

        return reply.status(201).send()
    })

    app.patch('/:id', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const editMealParamsSchema = z.object({ id: z.string().uuid() })
        const { id } = editMealParamsSchema.parse(request.params)

        const editMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            is_on_diet: z.number().int().min(0).max(1),
            meal_date: z.string()
        })

        const {
            name,
            description,
            is_on_diet: isOnDiet,
            meal_date: mealDate
        } = editMealBodySchema.parse(request.body)

        const meal = await knex('meals').where({ id }).first()

        if (!meal || meal.user_id !== request.user?.id) {
            return reply.status(400).send({ error: 'Meal not found' })
        }

        await knex('meals')
            .update({
                name,
                description,
                is_on_diet: Boolean(isOnDiet),
                meal_date: mealDate
            })
            .where({ id })

        return reply.status(204).send()
    })

    app.delete('/:id', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const deleteMealParamsSchema = z.object({ id: z.string().uuid() })
        const { id } = deleteMealParamsSchema.parse(request.params)

        const meal = await knex('meals').where({ id }).first()

        if (!meal || meal.user_id !== request.user?.id) {
            return reply.status(400).send({ error: 'Meal not found' })
        }

        await knex('meals').delete().where({ id })

        return reply.status(204).send()
    })
}

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'child_process'

describe('Meals routes', () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    beforeEach(async () => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })

    it('should be able to create a new meal', async () => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
            .expect(201)

        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie'))
            .send({
                name: 'New Meal',
                description: 'New meal description',
                is_on_diet: Math.round(Math.random()),
                meal_date: new Date().toISOString()
            })
            .expect(201)
    })

    it('should be able to list all meals', async () => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
            .expect(201)

        const mealData = {
            name: 'New Meal',
            description: 'New meal description',
            is_on_diet: Math.round(Math.random()),
            meal_date: new Date().toISOString()
        }

        const cookies = userResponse.get('set-cookie')

        await request(app.server).post('/meals').set('Cookie', cookies).send(mealData).expect(201)

        const listMealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .expect(200)

        expect(listMealsResponse.body).toEqual({
            meals: [expect.objectContaining(mealData)]
        })
    })

    it('should be able to get a specific meal', async () => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
            .expect(201)

        const mealData = {
            name: 'New Meal',
            description: 'New meal description',
            is_on_diet: Math.round(Math.random()),
            meal_date: new Date().toISOString()
        }

        const cookies = userResponse.get('set-cookie')

        await request(app.server).post('/meals').set('Cookie', cookies).send(mealData).expect(201)

        const listMealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .expect(200)

        const savedMeal = listMealsResponse.body.meals[0]

        const getMealResponse = await request(app.server)
            .get(`/meals/${savedMeal.id}`)
            .set('Cookie', cookies)
            .expect(200)

        expect(getMealResponse.body).toEqual({
            meal: expect.objectContaining(mealData)
        })
    })

    it('should be able to get the user meals metrics', async () => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
            .expect(201)

        const cookies = userResponse.get('set-cookie')

        const isOnDietArray = [0, 1, 1, 0, 0, 1, 1, 1, 0, 1]

        for await (const [index, isOnDiet] of isOnDietArray.entries()) {
            const mealData = {
                name: `New Meal ${index}`,
                description: `New meal ${index} description`,
                is_on_diet: isOnDiet,
                meal_date: new Date().toISOString()
            }

            await request(app.server)
                .post('/meals')
                .set('Cookie', cookies)
                .send(mealData)
                .expect(201)
        }

        const getMealsMetricsResponse = await request(app.server)
            .get('/meals/metrics')
            .set('Cookie', cookies)
            .expect(200)

        expect(getMealsMetricsResponse.body.metrics).toEqual({
            total: isOnDietArray.length,
            meals_on_diet: isOnDietArray.filter(isOnDiet => isOnDiet).length,
            meals_off_diet: isOnDietArray.filter(isOnDiet => !isOnDiet).length,
            best_meals_on_diet_sequence: 3
        })
    })

    it('should be able to edit a meal', async () => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
            .expect(201)

        const cookies = userResponse.get('set-cookie')

        const mealData = {
            name: 'New Meal',
            description: 'New meal description',
            is_on_diet: Math.round(Math.random()),
            meal_date: new Date().toISOString()
        }

        await request(app.server).post('/meals').set('Cookie', cookies).send(mealData).expect(201)

        const listMealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .expect(200)

        const savedMeal = listMealsResponse.body.meals[0]

        const updatedMealData = {
            name: 'Updated Meal',
            description: 'Updated meal description',
            is_on_diet: mealData.is_on_diet ? 0 : 1,
            meal_date: new Date().toISOString()
        }

        await request(app.server)
            .patch(`/meals/${savedMeal.id}`)
            .set('Cookie', cookies)
            .send(updatedMealData)
            .expect(204)

        const getMealResponse = await request(app.server)
            .get(`/meals/${savedMeal.id}`)
            .set('Cookie', cookies)
            .expect(200)

        expect(getMealResponse.body).toEqual({
            meal: expect.objectContaining(updatedMealData)
        })
    })

    it('should be able to delete a meal', async () => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
            .expect(201)

        const cookies = userResponse.get('set-cookie')

        const mealData = {
            name: 'New Meal',
            description: 'New meal description',
            is_on_diet: Math.round(Math.random()),
            meal_date: new Date().toISOString()
        }

        await request(app.server).post('/meals').set('Cookie', cookies).send(mealData).expect(201)

        const listMealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .expect(200)

        const savedMeal = listMealsResponse.body.meals[0]

        await request(app.server)
            .delete(`/meals/${savedMeal.id}`)
            .set('Cookie', cookies)
            .expect(204)

        const listMealsAfterDeleteResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .expect(200)

        expect(listMealsAfterDeleteResponse.body).toEqual({
            meals: []
        })
    })
})

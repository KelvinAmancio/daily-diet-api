import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
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

    it('should be able to create a new meal', async () => {})

    it('should be able to list all meals', async () => {})

    it('should be able to get a specific meal', async () => {})

    it('should be able to get the user meals metrics', async () => {})
})

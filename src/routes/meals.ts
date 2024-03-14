import { FastifyInstance } from 'fastify'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
    /** @todo list all user meals */
    app.get('/', { preHandler: [checkSessionIdExists] }, async request => {
        const { sessionId } = request.cookies
        console.log(sessionId)
        return { meals: [] }
    })

    /** @todo show specific user meal */
    app.get('/:id', { preHandler: [checkSessionIdExists] }, async request => {
        const { sessionId } = request.cookies
        console.log(sessionId)
        return { meal: {} }
    })

    /** @todo show user meals metrics */
    app.get('/metrics', { preHandler: [checkSessionIdExists] }, async request => {
        const { sessionId } = request.cookies
        console.log(sessionId)
        return { metrics: {} }
    })

    /** @todo create new meal */
    app.post('/', async (request, reply) => {
        console.log(request)
        return reply.status(201).send()
    })

    /** @todo edit meal */
    app.patch('/', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const { sessionId } = request.cookies
        console.log(sessionId)
        return reply.status(204).send()
    })

    /** @todo delete meal */
    app.delete('/', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const { sessionId } = request.cookies
        console.log(sessionId)
        return reply.status(204).send()
    })
}

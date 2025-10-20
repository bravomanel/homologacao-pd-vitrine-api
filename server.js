import express from 'express'
import fetch from 'node-fetch'
import 'dotenv/config'

const app = express()
const PORT = 3000
const url = 'https://git.pdcase.com/api/v4'

app.use(express.static('.'))

app.get('/api/users', async (req, res) => {
    const { username } = req.query

    try {
        const response = await fetch(`${url}/users?username=${username}`, {
            headers: { 'PRIVATE-TOKEN': process.env.GITLAB_TOKEN }
        })
        const data = await response.json()
        res.json(data)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Erro ao buscar usuário.' })
    }
})

app.get('/api/users/:id', async (req, res) => {
    try {
        const response = await fetch(`${url}/users/${req.params.id}`, {
            headers: { 'PRIVATE-TOKEN': process.env.GITLAB_TOKEN }
        })
        const data = await response.json()
        res.json(data)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Erro ao buscar bio.' })
    }
})

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
})

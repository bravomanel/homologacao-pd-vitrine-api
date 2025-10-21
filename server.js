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

app.get('/api/users/:id/projects', async (req, res) => {
    const { id } = req.params;

    try {
        const response = await fetch(`${url}/users/${id}/projects`, {
            headers: { 'PRIVATE-TOKEN': process.env.GITLAB_TOKEN }
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar projetos: ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar projetos do usuário.' });
    }
});

app.get('/api/projects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await fetch(`${url}/projects/${id}`, {
            headers: { 'PRIVATE-TOKEN': process.env.GITLAB_TOKEN }
        });
        if (!response.ok) throw new Error(`Erro ao buscar projeto: ${response.statusText}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar detalhes do projeto.' });
    }
});

app.get('/api/projects/:id/repository/tree', async (req, res) => {
    const { id } = req.params;
    // padrão estabelecido é que as imagens estarão em uma pasta 'screenshots' na raiz do repositório
    const path = 'screenshots'; 

    try {
        const response = await fetch(`${url}/projects/${id}/repository/tree?path=${path}`, {
            headers: { 'PRIVATE-TOKEN': process.env.GITLAB_TOKEN }
        });
        if (!response.ok) throw new Error(`Erro ao buscar arquivos: ${response.statusText}`);
        const files = await response.json();
        
        const imageUrls = files.map(file => `${url.replace('/api/v4', '')}/${file.path}`);
        res.json(imageUrls);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar arquivos do repositório.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
})


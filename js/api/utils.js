// js/utils.js

const GITLAB_TOKEN = window.env.GITLAB_TOKEN;
const gitlabApiUrl = 'https://git.pdcase.com/api/v4';

// Headers de autenticação
const authHeaders = {
    "PRIVATE-TOKEN": GITLAB_TOKEN
};

// busca os dados básicos de um usuário pelo username.
async function pegaUsuarioPeloUsername(username) {
    try {
        const response = await fetch(`${gitlabApiUrl}/users?username=${username}`, { headers: authHeaders });
        if (!response.ok) throw new Error(`Usuário ${username} não encontrado ou erro ${response.status}`);
        const data = await response.json();
        return data[0]; // Retorna o primeiro usuário encontrado
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        return null;
    }
}

// busca os detalhes completos do usuário (incluindo bio) pelo ID.
async function pegaDetalhesDoUsuario(id) {
    try {
        const response = await fetch(`${gitlabApiUrl}/users/${id}`, { headers: authHeaders });
        if (!response.ok) throw new Error(`Detalhes do usuário ${id} não encontrados ou erro ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar detalhes do usuário:", error);
        return null;
    }
}

// pega todos os projetos (próprios e compartilhados) de um usuário pelo ID.
async function pegaProjetosDoUsuario(userId) {
    try {
        const response = await fetch(`${gitlabApiUrl}/users/${userId}/projects`, { headers: authHeaders });
        if (!response.ok) throw new Error(`Projetos do usuário ${userId} não encontrados ou erro ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar projetos:", error);
        return []; // Retorna um array vazio em caso de erro
    }
}

// pega detalhes de um projeto específico pelo ID.
async function pegaDetalhesDoProjeto(id) {
    try {
        const response = await fetch(`${gitlabApiUrl}/projects/${id}`, { headers: authHeaders });
        if (!response.ok) throw new Error(`Projeto ${id} não encontrado ou erro ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar detalhes do projeto:", error);
        return null;
    }
}

// lista os arquivos da pasta 'screenshots' de um projeto.
async function listaImagensDoRepositorio(id) {
    const path = 'screenshots'; // Pasta padrão das imagens
    try {
        const response = await fetch(`${gitlabApiUrl}/projects/${id}/repository/tree?path=${path}`, { headers: authHeaders });
        if (!response.ok) {
            if (response.status === 404) return []; // Pasta não existe ou vazia
            throw new Error(`Erro ${response.status} ao listar arquivos do projeto ${id}`);
        }
        const files = await response.json();
        return files.filter(file => file.type === 'blob'); // Retorna apenas arquivos
    } catch (error) {
        console.error("Erro ao listar imagens do repositório:", error);
        return [];
    }
}

// busca os membros (colaboradores) de um projeto.
async function pegaColaboradoresDoProjeto(id) {
    try {
        const response = await fetch(`${gitlabApiUrl}/projects/${id}/users`, { headers: authHeaders });
        if (!response.ok) throw new Error(`Erro ${response.status} ao buscar colaboradores do projeto ${id}`);
        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar colaboradores:", error);
        return [];
    }
}
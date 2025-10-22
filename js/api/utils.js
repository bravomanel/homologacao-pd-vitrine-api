const GITLAB_TOKEN = window.env.GITLAB_TOKEN;
const gitlabApiUrl = 'https://git.pdcase.com/api/v4';
const gitlabBaseUrl = 'https://git.pdcase.com';

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

// função auxiliar para carregar avatares e imagens privadas como Blob URLs.

async function carregarImagemPrivada(url) {

    // Retorna um placeholder se a URL for nula ou vazia

    if (!url) {

        // Decide qual placeholder usar baseado no contexto (melhoria futura)

        return '/imagens/icones/user.svg'; // Ou um placeholder genérico de imagem

    }



    try {

        const response = await fetch(url, { headers: authHeaders });

        if (!response.ok) throw new Error(`Falha ao carregar imagem: ${response.status}`);



        const blob = await response.blob();

        return URL.createObjectURL(blob);

    } catch (error) {

        console.error(`Erro ao carregar imagem privada (${url}): `, error);

        return '/imagens/icones/user.svg'; // Ou um placeholder genérico de imagem

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
        // Garante que só retorna arquivos, não subpastas
        return files.filter(file => file.type === 'blob');
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

// encontra a URL da imagem 'card' (com qualquer extensão comum) na pasta /screenshots de um projeto
async function encontraUrlImagemCardProjeto(projetoId, projetoPathComNamespace) {
    // Usa a função existente para listar arquivos na pasta screenshots
    const imageFiles = await listaImagensDoRepositorio(projetoId);

    if (!imageFiles || imageFiles.length === 0) {
        return null; // Nenhuma imagem encontrada na pasta
    }

    // Procura por um arquivo chamado 'card' com extensões comuns
    const cardImageFile = imageFiles.find(file =>
        file.name.match(/^card\.(png|jpg|jpeg|gif|svg|webp)$/i) // Regex para 'card.' + extensão
    );

    if (cardImageFile) {
        const filePathEncoded = cardImageFile.path.split('/').map(encodeURIComponent).join('/');
        return `${gitlabBaseUrl}/${projetoPathComNamespace}/-/raw/main/${filePathEncoded}`;
    }

    return null; // Imagem 'card.*' não encontrada
}


// busca o texto RAW do README.md de um projeto.
async function pegaConteudoRawReadme(projeto) {
    if (!projeto.readme_url) {
        console.warn(`Projeto ${projeto.name} não possui readme_url.`);
        return null;
    }
    
    // constroi a URL RAW a partir da URL normal do README
    // Ex: https://.../blob/main/README.md -> https://.../raw/main/README.md
    const rawReadmeUrl = projeto.readme_url.replace('/-/blob/', '/-/raw/');

    try {
        const response = await fetch(rawReadmeUrl, { headers: authHeaders });
        if (!response.ok) {
            // README pode não existir ou ser privado, mesmo que a URL exista
            if (response.status === 404) return null; 
            throw new Error(`Erro ${response.status} ao buscar README raw`);
        }
        // Retorna o conteúdo como texto
        return await response.text(); 
    } catch (error) {
        console.error(`Erro ao buscar conteúdo do README (${rawReadmeUrl}):`, error);
        return null; // Retorna null em caso de erro de fetch ou outro problema
    }
}
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
    if (!url) {
        return '/imagens/icones/user.svg'; // imagem genérica
    }

    try {
        const response = await fetch(url, { headers: authHeaders });
        if (!response.ok) throw new Error(`Falha ao carregar imagem: ${response.status}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error(`Erro ao carregar imagem privada (${url}): `, error);
        return '/imagens/icones/user.svg'; // imagem genérica
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
    //Usa a função existente para listar arquivos na pasta screenshots
    const imageFiles = await listaImagensDoRepositorio(projetoId);

    if (!imageFiles || imageFiles.length === 0) {
        return null; //nenhuma imagem encontrada na pasta
    }

    //Procura por um arquivo chamado 'card' com extensões comuns
    const cardImageFile = imageFiles.find(file =>
        file.name.match(/^card\.(png|jpg|jpeg|gif|svg|webp)$/i) //Regex para 'card.' + extensão
    );

    if (cardImageFile) {
        const projetoDetalhes = await pegaDetalhesDoProjeto(projetoId);
        const branch = (projetoDetalhes && projetoDetalhes.default_branch) ? projetoDetalhes.default_branch : 'main';

        const filePathEncoded = cardImageFile.path.split('/').map(encodeURIComponent).join('/');
        return `${gitlabBaseUrl}/${projetoPathComNamespace}/-/raw/${encodeURIComponent(branch)}/${filePathEncoded}`;
    }

    return '/imagens/logo/projeto-sem-foto.png';
}

async function pegaLinguagens(idProjeto) {
    const response = await fetch(`${gitlabApiUrl}/projects/${idProjeto}/languages`, { headers: authHeaders });
    return await response.json()
}

async function criarVetorBadges(idProjeto) {
    const response = await pegaLinguagens(idProjeto);
    const nomesLinguagens = Object.keys(response);
    const imgsBadges = [];
    nomesLinguagens.map((linguagem) => {
        imgsBadges.push(`imagens/badges/${linguagem}.svg`)
    })
    return imgsBadges;
}

async function pegaImagensProjeto(idProjeto) {
    const path = 'screenshots';
    const files = await listaImagensDoRepositorio(idProjeto);

    const imagens = (files || []).filter(arquivo =>
        arquivo.type === "blob" &&
        /\.(png|jpg|jpeg|svg|gif|webp)$/i.test(arquivo.name)
    );

    if (imagens.length === 0) {
        return ['/imagens/logo/projeto-sem-foto.png']
    }

    //obtém branch padrão do projeto
    const projetoDetalhes = await pegaDetalhesDoProjeto(idProjeto);
    const branch = (projetoDetalhes && projetoDetalhes.default_branch) ? projetoDetalhes.default_branch : 'main';

    //gwra links diretos para cada imagem usando API de files/raw com ref correto
    const linkImg = imagens.map(img =>
        `${gitlabApiUrl}/projects/${idProjeto}/repository/files/${encodeURIComponent(img.path)}/raw?ref=${encodeURIComponent(branch)}`
    );

    return linkImg;
}

async function pegaConteudoRawReadme(projeto) {
    if (!projeto.id) {
        console.warn("Projeto não encontrado");
        return null;
    }
    const path = encodeURIComponent('READ.md');
    const urlReadMe = `${gitlabApiUrl}/projects/${projeto.id}/repository/files/README.md/raw?ref=main`;

    try {
        const response = await fetch(urlReadMe, { headers: authHeaders })
        if (!response.ok) {
            console.warn(`README.md não encontrado no projeto ${projeto.name}`);
            return null;
        }
        return response.text()
    }
    catch {
        console.error("Outro erro ao buscar README");
        return null;
    }
}
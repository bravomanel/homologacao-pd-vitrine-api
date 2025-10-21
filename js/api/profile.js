// renderiza o card HTML de um projeto.
async function renderizarCardProjeto(projeto) {
    // 1. Encontra a URL da imagem 'card.*' usando a nova função de utils.js
    const cardImageUrlRaw = await encontraUrlImagemCardProjeto(projeto.id, projeto.path_with_namespace);

    // 2. Carrega a imagem 'card.*' (ou um placeholder) como blob URL
    let imagemCardUrl;
    if (cardImageUrlRaw) {
        imagemCardUrl = await carregarImagemPrivada(cardImageUrlRaw); 
    } else {
        // Se 'card.*' não for encontrada, usa o avatar do projeto ou um default
        console.warn(`Imagem 'card.*' não encontrada no projeto ${projeto.name}. Usando avatar ou default.`);
        imagemCardUrl = await carregarImagemPrivada(projeto.avatar_url || '/imagens/projetos/default-logo.png'); 
    }

    // Mapeia os "topics" (tags) do projeto para os ícones de badges
    const badgesHtml = (projeto.topics || []).map(topic => 
        // Capitaliza nome do tópico para nome do arquivo
        `<img src="/imagens/badges/${topic.charAt(0).toUpperCase() + topic.slice(1)}.svg" alt="${topic}" title="${topic}">`
    ).join('');

    return `
        <div class="card-tela-perfil">
            <figure class="figure-card-tela-perfil">
                <img src="${imagemCardUrl}" alt="Imagem do projeto ${projeto.name}" class="img-card-tela-perfil"> 
                <figcaption>Imagem do projeto ${projeto.name}</figcaption> 
            </figure>
            <div class="conteudo-card-tela-perfil">
                <div class="titulo-descricao-tela-perfil">
                    <h2 class="title-card-tela-perfil">${projeto.name}</h2>
                    <p class="descricao-card-tela-perfil">${projeto.description || 'Sem descrição.'}</p>
                </div>
                <div class="badges-card-projeto">
                    ${badgesHtml || 'Sem badges'}
                </div>
                <button class="btn-ver-mais" data-project-id="${projeto.id}">Ver Mais</button>
            </div>
        </div>
    `;
}

// Preenche o card principal do perfil
async function preencherCardPerfil(usuario) {
    if (!usuario) return;

    // Usa a função de utils.js para carregar o avatar principal
    const avatarUrl = await carregarImagemPrivada(usuario.avatar_url); 

    const nomeEl = document.querySelector('.nome');
    const fotoEl = document.querySelector('.foto-usuario');
    const descricaoEl = document.querySelector('.descricao'); // Bio curta
    const bioCompletaEl = document.querySelector('.caixa-quem-sou-eu'); // "Quem sou eu"
    const linkGitlabEl = document.querySelector('.icons-sociais a[href*="gitlab"]'); 
    const linkLinkedinEl = document.querySelector('.icons-sociais a[href*="linkedin"]'); 

    if (nomeEl) nomeEl.textContent = usuario.name || 'Nome não informado';
    if (fotoEl) fotoEl.src = avatarUrl; // Já é uma blob URL
    if (descricaoEl) descricaoEl.textContent = usuario.bio || 'Sem descrição.'; 
    if (bioCompletaEl) bioCompletaEl.textContent = usuario.bio || 'Nenhuma informação adicional fornecida.';

    // Atualiza links sociais
    if (linkGitlabEl) {
        linkGitlabEl.href = usuario.web_url || '#';
        linkGitlabEl.target = '_blank';
    }
    if (linkLinkedinEl) {
        linkLinkedinEl.href = usuario.linkedin ? `https://www.linkedin.com/in/${usuario.linkedin}` : '#'; 
        linkLinkedinEl.target = '_blank'; 
    }
}

// função principal que executa quando a página de perfil carrega
document.addEventListener('DOMContentLoaded', async () => {
    const username = localStorage.getItem('perfilUsername');
    if (!username) {
        document.body.innerHTML = '<h1>Usuário não especificado.</h1>';
        return;
    }

    // Usa a função de utils.js
    const usuarioBasico = await pegaUsuarioPeloUsername(username); 
    if (!usuarioBasico) {
        document.body.innerHTML = '<h1>Usuário não encontrado.</h1>';
        return;
    }

    const userId = usuarioBasico.id;

    // Busca detalhes e projetos em paralelo, usando utils.js
    const [usuarioDetalhado, todosOsProjetos] = await Promise.all([
        pegaDetalhesDoUsuario(userId), 
        pegaProjetosDoUsuario(userId) 
    ]);

    // Preenche o card de perfil (agora é async por causa do avatar)
    await preencherCardPerfil(usuarioDetalhado); 

    // Renderiza os projetos
    const containerMeusProjetos = document.querySelector('.container-meus-projetos .container-card-tela-perfil');
    const containerProjetosCompartilhados = document.querySelector('.container-projetos-compartilhados .container-card-tela-perfil');

    containerMeusProjetos.innerHTML = '';
    containerProjetosCompartilhados.innerHTML = '';

    let meusProjetosCount = 0;
    let projetosCompartilhadosCount = 0;

    // Usamos Promise.all para renderizar cards em paralelo (mais rápido)
    const cardsPromises = todosOsProjetos.map(async (projeto) => {
        const cardHtml = await renderizarCardProjeto(projeto); // renderizar agora é async
        return { html: cardHtml, isOwner: (usuarioDetalhado && projeto.namespace.kind === 'user' && projeto.namespace.name === usuarioDetalhado.name) };
    });

    const renderedCards = await Promise.all(cardsPromises);

    renderedCards.forEach(cardData => {
        if (cardData.isOwner) {
            containerMeusProjetos.innerHTML += cardData.html;
            meusProjetosCount++;
        } else {
            containerProjetosCompartilhados.innerHTML += cardData.html;
            projetosCompartilhadosCount++;
        }
    });

    // Adiciona mensagens caso não existam projetos
    if (meusProjetosCount === 0) {
        containerMeusProjetos.innerHTML = '<p class="text-center p-3">Nenhum projeto próprio encontrado.</p>';
    }
    if (projetosCompartilhadosCount === 0) {
        containerProjetosCompartilhados.innerHTML = '<p class="text-center p-3">Nenhum projeto compartilhado encontrado.</p>';
    }

    // listener para salvar o ID do projeto e navegar
    const containersProjetos = document.querySelectorAll('.container-card-tela-perfil');
    containersProjetos.forEach(container => {
        container.addEventListener('click', (event) => {
            const targetButton = event.target.closest('.btn-ver-mais'); // Procura pelo botão
            if (targetButton && targetButton.dataset.projectId) {
                const projectId = targetButton.dataset.projectId;
                localStorage.setItem('projetoId', projectId); // Salva o ID do projeto clicado
                window.location.href = 'projeto.html'; // Navega para a página do projeto
            }
        });
    });
});
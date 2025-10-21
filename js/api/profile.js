// profile.js (Refatorado para Frontend-Only com <img src>)

// renderiza o card HTML de um projeto.
function renderizarCardProjeto(projeto) {
    const avatarProjetoUrl = projeto.avatar_url; // URL direta

    const badgesHtml = (projeto.topics || []).map(topic => 
        `<img src="/imagens/badges/${topic.charAt(0).toUpperCase() + topic.slice(1)}.svg" alt="${topic}" title="${topic}">`
    ).join('');

    return `
        <div class="card-tela-perfil">
            <figure class="figure-card-tela-perfil">
                <img src="${avatarProjetoUrl || '/imagens/projetos/default-logo.png'}" 
                     alt="Logo do projeto" 
                     onerror="this.onerror=null; this.src='/imagens/projetos/default-logo.png';" 
                     class="img-card-tela-perfil">
                <figcaption>Logo do projeto ${projeto.name}</figcaption>
            </figure>
            <div class="conteudo-card-tela-perfil">
                <div class="titulo-descricao-tela-perfil">
                    <h2 class="title-card-tela-perfil">${projeto.name}</h2>
                    <p class="descricao-card-tela-perfil">${projeto.description || 'Sem descrição.'}</p>
                </div>
                <div class="badges-card-projeto">
                    ${badgesHtml || 'Sem badges'}
                </div>
                <a href="projeto.html?id=${projeto.id}" class="link-ver-mais">
                    <button class="btn-ver-mais">Ver Mais</button>
                </a>
            </div>
        </div>
    `;
}

// Preenche o card principal do perfil
function preencherCardPerfil(usuario) {
    if (!usuario) return;

    const avatarUrl = usuario.avatar_url; // URL direta

    const nomeEl = document.querySelector('.nome');
    const fotoEl = document.querySelector('.foto-usuario');
    const descricaoEl = document.querySelector('.descricao'); // A bio curta
    const bioCompletaEl = document.querySelector('.caixa-quem-sou-eu'); // O "Quem sou eu"
    const linkGitlabEl = document.querySelector('.icons-sociais a[href*="gitlab"]'); // Seletor mais específico
    const linkLinkedinEl = document.querySelector('.icons-sociais a[href*="linkedin"]'); // Seletor mais específico

    if (nomeEl) nomeEl.textContent = usuario.name || 'Nome não informado';
    if (fotoEl) {
        fotoEl.src = avatarUrl || '/imagens/icones/user.svg';
        fotoEl.onerror = () => { fotoEl.src = '/imagens/icones/user.svg'; }; // Fallback
    }
    if (descricaoEl) descricaoEl.textContent = usuario.bio || 'Sem descrição.'; 
    if (bioCompletaEl) bioCompletaEl.textContent = usuario.bio || 'Nenhuma informação adicional fornecida.';

    // Atualiza links sociais
    if (linkGitlabEl) linkGitlabEl.href = usuario.web_url || '#';
    if (linkLinkedinEl) {
        // Assume que 'linkedin' no perfil GitLab é o username/id do perfil
        linkLinkedinEl.href = usuario.linkedin ? `https://www.linkedin.com/in/${usuario.linkedin}` : '#'; 
        // Adiciona target="_blank" se não tiver
        linkLinkedinEl.target = '_blank'; 
    }
    
    // Adiciona target blank para o gitlab também
    if (linkGitlabEl) linkGitlabEl.target = '_blank';
}

/**
 * Função principal que executa quando a página de perfil carrega
 */
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

    // Preenche o card de perfil
    preencherCardPerfil(usuarioDetalhado);

    // Renderiza os projetos
    const containerMeusProjetos = document.querySelector('.container-meus-projetos .container-card-tela-perfil');
    const containerProjetosCompartilhados = document.querySelector('.container-projetos-compartilhados .container-card-tela-perfil');

    containerMeusProjetos.innerHTML = '';
    containerProjetosCompartilhados.innerHTML = '';

    let meusProjetosCount = 0;
    let projetosCompartilhadosCount = 0;

    for (const projeto of todosOsProjetos) {
        // renderizarCardProjeto não é mais async
        const cardHtml = renderizarCardProjeto(projeto); 
        
        // separa projetos onde usuário é dono vs. projetos de grupo
        // Verifica se usuarioDetalhado existe antes de acessar .name
        if (usuarioDetalhado && projeto.namespace.kind === 'user' && projeto.namespace.name === usuarioDetalhado.name) {
            containerMeusProjetos.innerHTML += cardHtml;
            meusProjetosCount++;
        } else {
            containerProjetosCompartilhados.innerHTML += cardHtml;
            projetosCompartilhadosCount++;
        }
    }

    // Adiciona mensagens caso não existam projetos em alguma seção
    if (meusProjetosCount === 0) {
        containerMeusProjetos.innerHTML = '<p class="text-center p-3">Nenhum projeto próprio encontrado.</p>';
    }
    if (projetosCompartilhadosCount === 0) {
        containerProjetosCompartilhados.innerHTML = '<p class="text-center p-3">Nenhum projeto compartilhado encontrado.</p>';
    }
});
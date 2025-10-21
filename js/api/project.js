// project.js (Refatorado para Frontend-Only com <img src>)

// preenche as informações principais do projeto na página
function preencherInfosDoProjeto(projeto) {
    document.title = projeto.name || 'Projeto'; // Título da página

    // Ajusta seletores para serem mais robustos (se possível, adicione IDs/classes específicas no HTML)
    const titleElement = document.querySelector('.project-info-sidebar section:nth-of-type(1) h3'); // Título na primeira section
    const descriptionElement = document.querySelector('.project-info-sidebar section:nth-of-type(1) p'); // Descrição na primeira section
    
    if (titleElement) titleElement.textContent = projeto.name || 'Nome do Projeto';
    if (descriptionElement) descriptionElement.textContent = projeto.description || 'Sem descrição.';

    // Badges (usa os topics/tags do projeto)
    const badgesContainer = document.querySelector('.badges-container');
    if (badgesContainer) {
        const badgesHtml = (projeto.topics || []).map(topic => 
            `<img src="/imagens/badges/${topic.charAt(0).toUpperCase() + topic.slice(1)}.svg" alt="${topic}" title="${topic}" class="badge-item">`
        ).join('');
        badgesContainer.innerHTML = badgesHtml || '<p>Sem badges definidos.</p>';
    }

    // Links (Repositório e Aplicação - se houver external_url ou homepage)
    // GitLab pode usar 'homepage' também
    const externalLink = projeto.external_url || projeto.homepage; 
    const linksContainer = document.querySelector('.projects-links-container');
    if (linksContainer) {
        linksContainer.innerHTML = `
            <a href="${projeto.web_url}" target="_blank" class="btn btn-project">Repositório</a>
            ${externalLink ? `<a href="${externalLink}" target="_blank" class="btn btn-project">Aplicação</a>` : ''}
        `;
    }
}

// preenche a lista de colaboradores.
function preencherColaboradores(colaboradores) {
    const collaboratorsList = document.querySelector('.collaborators-list');
    if (!collaboratorsList) return;

    collaboratorsList.innerHTML = '';

    if (!colaboradores || colaboradores.length === 0) {
        collaboratorsList.innerHTML = '<li class="collaborator-item">Nenhum colaborador encontrado.</li>';
        return;
    }

    const listItemsHtml = colaboradores.map(colab => {
        const avatarUrl = colab.avatar_url; // URL direta
        return `
            <li class="collaborator-item">
                <img src="${avatarUrl || '/imagens/icones/user.svg'}" 
                     alt="Avatar de ${colab.name}" 
                     onerror="this.onerror=null; this.src='/imagens/icones/user.svg';" 
                     class="profile-pic">
                <span class="collaborator-name">${colab.name}</span>
            </li>
        `;
    }).join('');

    collaboratorsList.innerHTML = listItemsHtml;
}


// --- Execução Principal ---
document.addEventListener('DOMContentLoaded', async () => {
    // Pega o ID do projeto da URL
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');

    if (!projectId) {
        document.body.innerHTML = '<h1>ID do projeto não fornecido na URL.</h1>';
        return;
    }

    // Busca detalhes do projeto e colaboradores em paralelo usando utils.js
    const [projeto, colaboradores] = await Promise.all([
        pegaDetalhesDoProjeto(projectId),
        pegaColaboradoresDoProjeto(projectId) 
    ]);

    if (!projeto) {
        document.body.innerHTML = '<h1>Projeto não encontrado ou falha ao carregar.</h1>';
        return;
    }
    
    // Preenche as informações de texto
    preencherInfosDoProjeto(projeto);

    // Preenche a lista de colaboradores
    preencherColaboradores(colaboradores);

    // Busca a lista de arquivos de imagem na pasta 'screenshots' usando utils.js
    const imageFiles = await listaImagensDoRepositorio(projectId);

    // Constrói as URLs diretas para os arquivos RAW
    const projectImageUrls = imageFiles.map(file => {
        // A URL RAW geralmente é: base_url/namespace/projeto/-/raw/branch/caminho_arquivo
        // A API de 'tree' não dá a URL RAW direta, então construímos:
        const filePathEncoded = file.path.split('/').map(encodeURIComponent).join('/');
        // Assume branch 'main', ajuste se necessário
        return `${gitlabBaseUrl}/${projeto.path_with_namespace}/-/raw/main/${filePathEncoded}`; 
    });

    // Disponibiliza as URLs para o script /js/projeto.js
    window.projectImages = projectImageUrls; 

    // Inicializa a galeria/carrossel (funções em /js/projeto.js)
    if (typeof renderCarousel === 'function') {
        renderCarousel(); // Seu script vai usar window.projectImages
    } else {
        console.warn("Função renderCarousel não encontrada.");
    }
    if (typeof renderDesktopGallery === 'function') {
        renderDesktopGallery(); // Seu script vai usar window.projectImages
    } else {
        console.warn("Função renderDesktopGallery não encontrada.");
    }

    // Configura os eventos do Modal (Mantido do seu código original)
    const galleryModal = document.getElementById('gallery-modal');
    if (galleryModal && typeof updateModalImage === 'function') { 
        galleryModal.addEventListener('show.bs.modal', (event) => {
            const triggerElement = event.relatedTarget;
            if (triggerElement && triggerElement.hasAttribute('data-index')) {
                 const imageIndex = parseInt(triggerElement.getAttribute('data-index'));
                 updateModalImage(imageIndex); // Chama a função do /js/projeto.js
            }
        });

        // Os botões next/prev devem ser configurados pelo seu /js/projeto.js
        // Se eles não funcionarem, pode ser necessário verificar a ordem de execução
        // ou garantir que as funções e variáveis (currentIndex) estejam acessíveis globalmente.

    } else {
        console.warn("Modal da galeria ou função updateModalImage não encontrada.");
    }
});

// busca o conteúdo RAW de um arquivo (imagem) do repositório como Blob URL.
async function carregarImagemDoRepositorio(projeto, filePath) {
    try {
        // Constrói a URL RAW da imagem no repositório
        const filePathEncoded = filePath.split('/').map(encodeURIComponent).join('/');
        // Assume branch 'main', ajuste se necessário (pegar do projeto.default_branch?)
        const rawImageUrl = `${gitlabBaseUrl}/${projeto.path_with_namespace}/-/raw/main/${filePathEncoded}`; 
        
        // Usa a função de utils.js para buscar como blob
        return await carregarImagemPrivada(rawImageUrl); 
    } catch (error) {
        console.error(`Erro ao carregar imagem do repo ${filePath}:`, error);
        return '/imagens/placeholder-image.png'; // Placeholder
    }
}

// preenche as informações principais do projeto na página
function preencherInfosDoProjeto(projeto, readmeContent) { 
    document.title = projeto.name || 'Projeto'; 

    const titleElement = document.querySelector('.project-info-sidebar section:nth-of-type(1) h3'); 
    const descriptionElement = document.querySelector('.project-info-sidebar section:nth-of-type(1) p'); 
    
    if (titleElement) titleElement.textContent = projeto.name || 'Nome do Projeto';
    
    if (descriptionElement) {
        if (readmeContent) {
            descriptionElement.textContent = readmeContent; 
        } else {
            // Fallback
            descriptionElement.textContent = projeto.description || 'Sem descrição ou README disponível.';
        }
    }

    // Badges 
    const badgesContainer = document.querySelector('.badges-container');
    if (badgesContainer) {
        const badgesHtml = (projeto.topics || []).map(topic => 
            `<img src="/imagens/badges/${topic.charAt(0).toUpperCase() + topic.slice(1)}.svg" alt="${topic}" title="${topic}" class="badge-item">`
        ).join('');
        badgesContainer.innerHTML = badgesHtml || '<p>Sem badges definidos.</p>';
    }

    // Links 
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
async function preencherColaboradores(colaboradores) {
    const collaboratorsList = document.querySelector('.collaborators-list');
    if (!collaboratorsList) return;

    collaboratorsList.innerHTML = '';

    if (!colaboradores || colaboradores.length === 0) {
        collaboratorsList.innerHTML = '<li class="collaborator-item">Nenhum colaborador encontrado.</li>';
        return;
    }

    // Carrega avatares em paralelo usando utils.js
    const listItemsPromises = colaboradores.map(async (colab) => {
        const avatarUrl = await carregarImagemPrivada(colab.avatar_url); 
        return `
            <li class="collaborator-item">
                <img src="${avatarUrl}" alt="Avatar de ${colab.name}" class="profile-pic">
                <span class="collaborator-name">${colab.name}</span>
            </li>
        `;
    });

    const listItemsHtml = await Promise.all(listItemsPromises);
    collaboratorsList.innerHTML = listItemsHtml.join('');
}

document.addEventListener('DOMContentLoaded', async () => {
    const projectId = localStorage.getItem('projetoId'); 

    if (!projectId) {
        document.body.innerHTML = '<h1>ID do projeto não encontrado no armazenamento local.</h1>';
        return;
    }

    // Busca detalhes do projeto
    const projeto = await pegaDetalhesDoProjeto(projectId);

    if (!projeto) {
        document.body.innerHTML = '<h1>Projeto não encontrado ou falha ao carregar.</h1>';
        return;
    }

    // busca o README e os colaboradores
    const [colaboradores, readmeContent] = await Promise.all([
        pegaColaboradoresDoProjeto(projectId),
        pegaConteudoRawReadme(projeto)
    ]);
    
    // Preenche as informações de texto, passando o conteúdo do README
    preencherInfosDoProjeto(projeto, readmeContent); 

    // Preenche a lista de colaboradores
    preencherColaboradores(colaboradores);

    // Busca a lista de arquivos de imagem na pasta 'screenshots' usando utils.js
    const imageFiles = await listaImagensDoRepositorio(projectId);

    // Carrega as imagens como Blobs
    const blobUrlsPromises = imageFiles.map(file => carregarImagemDoRepositorio(projeto, file.path)); // Passa o objeto 'projeto'
    const projectImageUrls = await Promise.all(blobUrlsPromises); 

    // Disponibiliza as URLs para o script /js/projeto.js
    window.projectImages = projectImageUrls; 

    // Inicializa a galeria/carrossel (funções em /js/projeto.js)
    if (typeof renderCarousel === 'function') {
        renderCarousel(); 
    } else {
        console.warn("Função renderCarousel não encontrada.");
    }
    if (typeof renderDesktopGallery === 'function') {
        renderDesktopGallery(); 
    } else {
        console.warn("Função renderDesktopGallery não encontrada.");
    }

    // Configura os eventos do Modal
    const galleryModal = document.getElementById('gallery-modal');
    if (galleryModal && typeof updateModalImage === 'function') { 
        galleryModal.addEventListener('show.bs.modal', (event) => {
            const triggerElement = event.relatedTarget;
            if (triggerElement && triggerElement.hasAttribute('data-index')) {
                 const imageIndex = parseInt(triggerElement.getAttribute('data-index'));
                 updateModalImage(imageIndex); // Chama a função do /js/projeto.js
            }
        });
        // A configuração dos botões next/prev já deve estar no /js/projeto.js
    } else {
        console.warn("Modal da galeria ou função updateModalImage não encontrada.");
    }
});
let projectImages = [];

document.addEventListener('DOMContentLoaded', async function () {

    const projetoId = localStorage.getItem('projetoId');
    const mainContainer = document.querySelector('.main-projeto');
    const infoContainer = document.querySelector('.project-info-sidebar');

    if (!projetoId) {
        mainContainer.innerHTML = '<h1 class="text-center p-5">ID do projeto não encontrado.</h1>';
        return;
    }

    try {
        // pega dados do projeto da API
        const projeto = await pegaDetalhesDoProjeto(projetoId);
        if (!projeto) {
            throw new Error(`Projeto com ID ${projetoId} não encontrado.`);
        }

        // define o título da página
        document.title = projeto.name || 'Projeto';

        // busca o restante das informações em paralelo
        const [readmeContent, imagensUrls, badgesSrcs, colaboradores] = await Promise.all([
            pegaConteudoRawReadme(projeto),
            pegaImagensProjeto(projetoId),
            criarVetorBadges(projetoId),
            pegaColaboradoresDoProjeto(projetoId)
        ]);

        console.log(colaboradores)
        projectImages = await Promise.all(imagensUrls.map(url => carregarImagemPrivada(url)));

        // preenche Título e Descrição (do Readme)
        const titleEl = infoContainer.querySelector('.project-card:nth-of-type(1) h3');
        const descEl = infoContainer.querySelector('.project-card:nth-of-type(1) p');
        if (titleEl) titleEl.textContent = projeto.name;
        // Usa o README como descrição, se existir; senão, usa a descrição do projeto
        const html = marked.parse(readmeContent); //para formatar readme
        if (descEl) descEl.innerHTML = html || projeto.description || 'Sem descrição.';
        //console.log("Marked está definido?", typeof marked);


        // Preenche Badges
        const badgeContainer = infoContainer.querySelector('.badges-container');
        if (badgeContainer) {
            badgeContainer.innerHTML = '';
            if (badgesSrcs.length > 0) {
                badgesSrcs.forEach(src => {
                    const img = document.createElement('img');
                    img.src = src;
                    const alt = src.split('/').pop().split('.')[0]; // Ex: "Javascript"
                    img.alt = `Badge ${alt}`;
                    img.title = alt;
                    img.classList.add('badge-item');
                    badgeContainer.appendChild(img);
                });
            } else {
                badgeContainer.innerHTML = '<p>Nenhuma tecnologia informada.</p>';
            }
        }

        // Preenche Links
        const linksContainer = infoContainer.querySelector('.projects-links-container');
        if (linksContainer) {
            linksContainer.innerHTML = '';
            let hasLink = false;
            // Link da "Aplicação" (homepage)
            if (projeto.homepage) {
                linksContainer.innerHTML += `<a href="${projeto.homepage}" class="btn btn-project" target="_blank" rel="noopener noreferrer">Aplicação</a>`;
                hasLink = true;
            }
            // Link do "Repositório"
            if (projeto.web_url) {
                linksContainer.innerHTML += `<a href="${projeto.web_url}" class="btn btn-project" target="_blank" rel="noopener noreferrer">Repositório</a>`;
                hasLink = true;
            }
            if (!hasLink) {
                linksContainer.innerHTML = '<p>Nenhum link disponível.</p>';
            }
        }

        // Preenche Colaboradores
        const collabList = infoContainer.querySelector('.collaborators-list');
        if (collabList) {
            if (colaboradores.length > 0) {
                // Carrega es privados em paralelo
                const collabHtmlPromises = colaboradores.map(async (user) => {
                    return `<li class="collaborator-item">
                                <img src="${user.avatar_url}" alt="Foto de ${user.name}" class="profile-pic">
                                <span class="collaborator-name">${user.name}</span>
                            </li>`;
                });
                const collabHtmls = await Promise.all(collabHtmlPromises);
                collabList.innerHTML = collabHtmls.join('');
            } else {
                collabList.innerHTML = '<li>Nenhum colaborador encontrado.</li>';
            }
        }

    } catch (error) {
        console.error("Erro ao carregar dados do projeto:", error);
        mainContainer.innerHTML = `<h1 class="text-center p-5 text-danger">Erro ao carregar o projeto.</h1><p class="text-center">${error.message}</p>`;
        return; // Para a execução se houver erro
    }

    // --- 2. Lógica de Renderização do Carrossel/Galeria (usando projectImages) ---

    const carouselContainer = document.getElementById('project-carousel-mobile');
    const galleryContainer = document.getElementById('project-gallery-desktop');
    const galleryModal = document.getElementById('gallery-modal');
    const modalImage = document.getElementById('modal-image');

    let currentIndex = 0;

    function updateModalImage(index) {
        if (index < 0 || index >= projectImages.length) return; // Não faz nada se o índice for inválido

        currentIndex = index;
        modalImage.src = projectImages[currentIndex];

        // Controla a visibilidade dos botões de navegação do modal
        const prevBtn = document.getElementById('modal-prev-btn');
        const nextBtn = document.getElementById('modal-next-btn');

        if (prevBtn) prevBtn.style.display = (index === 0) ? 'none' : 'block';
        if (nextBtn) nextBtn.style.display = (index === projectImages.length - 1) ? 'none' : 'block';
    }

    // carrosel mobile
    function renderCarousel() {
        if (!carouselContainer) return;

        if (projectImages.length === 0) {
            carouselContainer.innerHTML = '<p class="text-center p-3">Nenhuma imagem encontrada.</p>';
            return;
        }

        const items = projectImages.map((src, index) =>
            `<div class="carousel-item ${index === 0 ? 'active' : ''}">
                <img src="${src}" class="d-block w-100 main-project-image" alt="Imagem ${index + 1}"
                     data-bs-toggle="modal" data-bs-target="#gallery-modal" data-index="${index}">
            </div>`
        ).join('');

        const indicators = projectImages.map((_, index) => `<button type="button" data-bs-target="#projectCarousel" data-bs-slide-to="${index}" class="${index === 0 ? 'active' : ''}" aria-current="${index === 0 ? 'true' : 'false'}" aria-label="Slide ${index + 1}"></button>`).join('');
        const carouselHTML = `<div id="projectCarousel" class="carousel slide" data-bs-ride="carousel"><div class="carousel-indicators">${indicators}</div><div class="carousel-inner">${items}</div><button class="carousel-control-prev" type="button" data-bs-target="#projectCarousel" data-bs-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span></button><button class="carousel-control-next" type="button" data-bs-target="#projectCarousel" data-bs-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span></button></div>`;
        carouselContainer.innerHTML = carouselHTML;
    }

    // galeria desktop, dinamica para a quantidade de imagens
    function renderDesktopGallery() {
        if (!galleryContainer) return;

        if (projectImages.length === 0) {
            galleryContainer.innerHTML = '<p class="text-center p-3">Nenhuma imagem encontrada.</p>';
            return;
        }

        let galleryHTML = '';
        const totalImages = projectImages.length;

        // imagem principal
        galleryHTML += `<div class="gallery-item gallery-item-main" data-bs-toggle="modal" data-bs-target="#gallery-modal" data-index="0"><img src="${projectImages[0]}" alt="Imagem 1"></div>`;

        // imagem média da esquerda (se houver 2 ou mais imagens)
        if (totalImages >= 2) {
            galleryHTML += `<div class="gallery-item gallery-item-bottom-left" data-bs-toggle="modal" data-bs-target="#gallery-modal" data-index="1"><img src="${projectImages[1]}" alt="Imagem 2"></div>`;
        }

        // lógica para o slot da direita
        if (totalImages === 3) {
            // 3 imagens, mostra a terceira imagem média.
            galleryHTML += `<div class="gallery-item gallery-item-bottom-right" data-bs-toggle="modal" data-bs-target="#gallery-modal" data-index="2"><img src="${projectImages[2]}" alt="Imagem 3"></div>`;

        } else if (totalImages >= 4) {
            // caso 4 ou mais imagens, cria o sub-grid 2x2.
            let subGridHTML = '<div class="gallery-sub-grid">';
            const maxInSubGrid = 4;
            // Pega 4 imagens (índices 2, 3, 4, 5)
            const subGridImages = projectImages.slice(2, 2 + maxInSubGrid);
            // Calcula quantas imagens ficaram de fora (Total - 6 imagens visíveis)
            const hiddenCount = totalImages - (1 + 1 + maxInSubGrid);

            subGridImages.forEach((src, i) => {
                const imageIndex = 2 + i; // índice real da imagem no array principal

                // o último slot do sub-grid (índice 3) E houver mais imagens escondidas
                if (i === maxInSubGrid - 1 && hiddenCount > 0) {
                    subGridHTML += `
                        <div class="gallery-item more-images-overlay" data-bs-toggle="modal" data-bs-target="#gallery-modal" data-index="${imageIndex}">
                            <img src="${src}" alt="Mais imagens">
                            <div class="image-count">+${hiddenCount}</div>
                        </div>`;
                } else {
                    subGridHTML += `
                        <div class="gallery-item" data-bs-toggle="modal" data-bs-target="#gallery-modal" data-index="${imageIndex}">
                            <img src="${src}" alt="Imagem ${imageIndex + 1}">
                        </div>`;
                }
            });

            subGridHTML += '</div>';
            galleryHTML += `<div class="gallery-item-bottom-right">${subGridHTML}</div>`;
        }

        galleryContainer.innerHTML = `<div class="desktop-gallery-grid">${galleryHTML}</div>`;
    }


    // modal para mostrar as imagens em tamanho maior
    if (galleryModal) {
        galleryModal.addEventListener('show.bs.modal', (event) => {
            const triggerElement = event.relatedTarget;
            const imageIndex = parseInt(triggerElement.getAttribute('data-index'));
            updateModalImage(imageIndex);
        });

        document.getElementById('modal-next-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que o clique feche o modal
            updateModalImage(currentIndex + 1);
        });

        document.getElementById('modal-prev-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            updateModalImage(currentIndex - 1);
        });
    }

    // --- 3. Chama as Funções de Renderização ---
    // (Somente agora que 'projectImages' está preenchido)
    renderCarousel();
    renderDesktopGallery();
});
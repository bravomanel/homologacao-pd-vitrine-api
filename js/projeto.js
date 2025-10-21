async function pegaDetalhesDoProjeto(id) {
    try {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) throw new Error('Projeto não encontrado');
        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar detalhes do projeto:", error);
        return null;
    }
}

async function pegaImagensDoProjeto(id) {
    // padrão estabelecido é que as imagens estarão em uma pasta 'screenshots' na raiz do repositório
    try {
        const response = await fetch(`/api/projects/${id}/repository/tree`);
        if (!response.ok) return []; // Se não encontrar, retorna array vazio
        const files = await response.json();
        
        // a API retorna caminhos relativos das imagens, para construir a URL completa
        return files.map(file => {
             const rawUrl = file.web_url.replace('/blob/', '/raw/');
             return rawUrl;
        });

    } catch (error) {
        console.error("Erro ao buscar imagens do projeto:", error);
        return [];
    }
}


function preencherInfosDoProjeto(projeto) {
    document.title = projeto.name;

    const titleElement = document.querySelector('.project-info-sidebar h3');
    const descriptionElement = document.querySelector('.project-info-sidebar p');
    if (titleElement) titleElement.textContent = projeto.name;
    if (descriptionElement) descriptionElement.textContent = projeto.description || 'Sem descrição.';

    // Badges
    const badgesContainer = document.querySelector('.badges-container');
    if (badgesContainer) {
        const badgesHtml = projeto.topics.map(topic => 
            `<img src="/imagens/badges/${topic}.svg" alt="${topic}" title="${topic}" class="badge-item">`
        ).join('');
        badgesContainer.innerHTML = badgesHtml;
    }

    // Links
    const linksContainer = document.querySelector('.projects-links-container');
    if (linksContainer) {
        linksContainer.innerHTML = `
            <a href="${projeto.http_url_to_repo}" target="_blank" class="btn btn-project">Repositório</a>
            `;
    }
    
    // Colaboradores, para fazer ainda
    // (precisa de uma chamada à API de membros)
}


let currentIndex = 0;
let projectImages = [];

function updateModalImage(index) {
    if (index < 0 || index >= projectImages.length) return;
    currentIndex = index;
    const modalImage = document.getElementById('modal-image');
    if(modalImage) modalImage.src = projectImages[currentIndex];
}

function renderCarousel() { // precisa adaptar para receber as imagens
    if (!carouselContainer || projectImages.length === 0) return;
    
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
function renderDesktopGallery() { // precisa adaptar para receber as imagens
    if (!galleryContainer || projectImages.length === 0) return;

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
        const subGridImages = projectImages.slice(2, 2 + maxInSubGrid);
        const hiddenCount = totalImages - 6; 

        subGridImages.forEach((src, i) => {
            const imageIndex = 2 + i; // índice real da imagem no array principal

            // o último slot do sub-grid (índice 3) E houver mais imagens escondidas
            if (i === maxInSubGrid - 1 && hiddenCount > 0) {
                subGridHTML += `
                    <div class="gallery-item more-images-overlay" data-bs-toggle="modal" data-bs-target="#gallery-modal" data-index="${imageIndex}">
                        <img src="${src}" alt="Mais imagens">
                        <div class="image-count">+${hiddenCount + 1}</div>
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



document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');

    if (!projectId) {
        document.body.innerHTML = '<h1>ID do projeto não fornecido.</h1>';
        return;
    }

    const projeto = await pegaDetalhesDoProjeto(projectId);

    if (!projeto) {
        document.body.innerHTML = '<h1>Projeto não encontrado.</h1>';
        return;
    }
    
    // Preenche as informações de texto (título, descrição, etc.)
    preencherInfosDoProjeto(projeto);

    // Busca e renderiza as imagens
    projectImages = await pegaImagensDoProjeto(projectId);
    
    renderCarousel(projectImages); // precisa adaptar para receber as imagens
    renderDesktopGallery(projectImages); // precisa adaptar para receber as imagens
    
    // Configura os eventos do Modal
    const galleryModal = document.getElementById('gallery-modal');
    if (galleryModal) {
      galleryModal.addEventListener('show.bs.modal', (event) => {
            const triggerElement = event.relatedTarget;
            const imageIndex = parseInt(triggerElement.getAttribute('data-index'));
            updateModalImage(imageIndex);
        });

        document.getElementById('modal-next-btn').addEventListener('click', () => {
            const nextIndex = (currentIndex + 1) % projectImages.length;
            updateModalImage(nextIndex);
        });

        document.getElementById('modal-prev-btn').addEventListener('click', () => {
            const prevIndex = (currentIndex - 1 + projectImages.length) % projectImages.length;
            updateModalImage(prevIndex);
        });
    }
});

// document.addEventListener('DOMContentLoaded', function () {
//     const carouselContainer = document.getElementById('project-carousel-mobile');
//     const galleryContainer = document.getElementById('project-gallery-desktop');
//     const galleryModal = document.getElementById('gallery-modal');
//     const modalImage = document.getElementById('modal-image');
    
//     let currentIndex = 0;

//     function updateModalImage(index) {
//         if (index < 0 || index >= projectImages.length) return;
//         currentIndex = index;
//         modalImage.src = projectImages[currentIndex];
//     }

//     // carrosel mobile
//     function renderCarousel() {
//         if (!carouselContainer || projectImages.length === 0) return;
        
//         const items = projectImages.map((src, index) =>
//             `<div class="carousel-item ${index === 0 ? 'active' : ''}">
//                 <img src="${src}" class="d-block w-100 main-project-image" alt="Imagem ${index + 1}"
//                      data-bs-toggle="modal" data-bs-target="#gallery-modal" data-index="${index}">
//             </div>`
//         ).join('');
        
//         const indicators = projectImages.map((_, index) => `<button type="button" data-bs-target="#projectCarousel" data-bs-slide-to="${index}" class="${index === 0 ? 'active' : ''}" aria-current="${index === 0 ? 'true' : 'false'}" aria-label="Slide ${index + 1}"></button>`).join('');
//         const carouselHTML = `<div id="projectCarousel" class="carousel slide" data-bs-ride="carousel"><div class="carousel-indicators">${indicators}</div><div class="carousel-inner">${items}</div><button class="carousel-control-prev" type="button" data-bs-target="#projectCarousel" data-bs-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span></button><button class="carousel-control-next" type="button" data-bs-target="#projectCarousel" data-bs-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span></button></div>`;
//         carouselContainer.innerHTML = carouselHTML;
//     }

//     // galeria desktop, dinamica para a quantidade de imagens
//     function renderDesktopGallery() {
//         if (!galleryContainer || projectImages.length === 0) return;

//         let galleryHTML = '';
//         const totalImages = projectImages.length;

//         // imagem principal
//         galleryHTML += `<div class="gallery-item gallery-item-main" data-bs-toggle="modal" data-bs-target="#gallery-modal" data-index="0"><img src="${projectImages[0]}" alt="Imagem 1"></div>`;

//         // imagem média da esquerda (se houver 2 ou mais imagens)
//         if (totalImages >= 2) {
//             galleryHTML += `<div class="gallery-item gallery-item-bottom-left" data-bs-toggle="modal" data-bs-target="#gallery-modal" data-index="1"><img src="${projectImages[1]}" alt="Imagem 2"></div>`;
//         }

//         // lógica para o slot da direita
//         if (totalImages === 3) {
//             // 3 imagens, mostra a terceira imagem média.
//             galleryHTML += `<div class="gallery-item gallery-item-bottom-right" data-bs-toggle="modal" data-bs-target="#gallery-modal" data-index="2"><img src="${projectImages[2]}" alt="Imagem 3"></div>`;
//         } else if (totalImages >= 4) {
//             // caso 4 ou mais imagens, cria o sub-grid 2x2.
//             let subGridHTML = '<div class="gallery-sub-grid">';
//             const maxInSubGrid = 4;
//             const subGridImages = projectImages.slice(2, 2 + maxInSubGrid);
//             const hiddenCount = totalImages - 6; 

//             subGridImages.forEach((src, i) => {
//                 const imageIndex = 2 + i; // índice real da imagem no array principal

//                 // o último slot do sub-grid (índice 3) E houver mais imagens escondidas
//                 if (i === maxInSubGrid - 1 && hiddenCount > 0) {
//                     subGridHTML += `
//                         <div class="gallery-item more-images-overlay" data-bs-toggle="modal" data-bs-target="#gallery-modal" data-index="${imageIndex}">
//                             <img src="${src}" alt="Mais imagens">
//                             <div class="image-count">+${hiddenCount + 1}</div>
//                         </div>`;
//                 } else {
//                     subGridHTML += `
//                         <div class="gallery-item" data-bs-toggle="modal" data-bs-target="#gallery-modal" data-index="${imageIndex}">
//                             <img src="${src}" alt="Imagem ${imageIndex + 1}">
//                         </div>`;
//                 }
//             });

//             subGridHTML += '</div>';
//             galleryHTML += `<div class="gallery-item-bottom-right">${subGridHTML}</div>`;
//         }

//         galleryContainer.innerHTML = `<div class="desktop-gallery-grid">${galleryHTML}</div>`;
//     }


//     // modal para mostrar as imagens em tamanho maior
//     if (galleryModal) {
//         galleryModal.addEventListener('show.bs.modal', (event) => {
//             const triggerElement = event.relatedTarget;
//             const imageIndex = parseInt(triggerElement.getAttribute('data-index'));
//             updateModalImage(imageIndex);
//         });

//         document.getElementById('modal-next-btn').addEventListener('click', () => {
//             const nextIndex = (currentIndex + 1) % projectImages.length;
//             updateModalImage(nextIndex);
//         });

//         document.getElementById('modal-prev-btn').addEventListener('click', () => {
//             const prevIndex = (currentIndex - 1 + projectImages.length) % projectImages.length;
//             updateModalImage(prevIndex);
//         });
//     }

//     renderCarousel();
//     renderDesktopGallery();
// });
document.addEventListener('DOMContentLoaded', function () {
    const projectImages = [
        'imagens/projetos/foto-projeto.png',
        'imagens/projetos/vitrine (1).png',
        'imagens/projetos/vitrine (2).png',
        'imagens/projetos/vitrine (3).png',
        'imagens/projetos/vitrine (4).png',
        'imagens/projetos/vitrine (5).png'
    ];

    const carouselContainer = document.getElementById('project-carousel-mobile');
    const galleryContainer = document.getElementById('project-gallery-desktop');
    const galleryModal = document.getElementById('gallery-modal');
    const modalImage = document.getElementById('modal-image');
    
    let currentIndex = 0;

    function updateModalImage(index) {
        if (index < 0 || index >= projectImages.length) return;
        currentIndex = index;
        modalImage.src = projectImages[currentIndex];
    }

    // carrosel mobile
    function renderCarousel() {
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
    function renderDesktopGallery() {
        if (!galleryContainer || projectImages.length === 0) return;
        
        let galleryHTML = '';
        const totalImages = projectImages.length;
        
        galleryHTML += `<div class="gallery-item gallery-item-main" data-bs-toggle="modal" data-bs-target="#gallery-modal" data-index="0"><img src="${projectImages[0]}" alt="Imagem 1"></div>`;

        if (totalImages === 2) {
            galleryHTML += `<div class="gallery-item gallery-item-bottom-left" data-bs-toggle="modal" data-bs-target="#gallery-modal" data-index="1"><img src="${projectImages[1]}" alt="Imagem 2"></div>`;
        } else if (totalImages === 3) {
            galleryHTML += `<div class="gallery-item gallery-item-bottom-left" data-bs-toggle="modal" data-bs-target="#gallery-modal" data-index="1"><img src="${projectImages[1]}" alt="Imagem 2"></div>`;
            galleryHTML += `<div class="gallery-item gallery-item-bottom-right" data-bs-toggle="modal" data-bs-target="#gallery-modal" data-index="2"><img src="${projectImages[2]}" alt="Imagem 3"></div>`;
        } else if (totalImages > 3) {
            const hiddenCount = totalImages - 3;
            galleryHTML += `<div class="gallery-item gallery-item-bottom-right more-images-overlay" data-bs-toggle="modal" data-bs-target="#gallery-modal" data-index="2"><img src="${projectImages[2]}" alt="Mais imagens"><div class="image-count">+${hiddenCount}</div></div>`;
            galleryHTML += `<div class="gallery-item gallery-item-bottom-left" data-bs-toggle="modal" data-bs-target="#gallery-modal" data-index="1"><img src="${projectImages[1]}" alt="Imagem 2"></div>`;
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

        document.getElementById('modal-next-btn').addEventListener('click', () => {
            const nextIndex = (currentIndex + 1) % projectImages.length;
            updateModalImage(nextIndex);
        });

        document.getElementById('modal-prev-btn').addEventListener('click', () => {
            const prevIndex = (currentIndex - 1 + projectImages.length) % projectImages.length;
            updateModalImage(prevIndex);
        });
    }

    renderCarousel();
    renderDesktopGallery();
});
document.addEventListener('DOMContentLoaded', () => {
    const filterModalEl = document.getElementById('filterModal');
    const clearBtn = document.getElementById('clear-btn');
    const searchBtn = document.getElementById('search-btn');
    const addFilterBtn = document.getElementById('add-filter-btn');
    const addedFiltersContainer = document.getElementById('added-filters-container');
    const nameInput = document.getElementById('filter-name');

    const selectionRow = document.getElementById('selection-row');
    const badgeSelect = selectionRow.querySelector('.badge-select');
    const levelSelect = selectionRow.querySelector('.level-select');
    const badgeDropdownMenu = selectionRow.querySelector('.badge-dropdown-menu');
    const levelDropdownMenu = selectionRow.querySelector('.level-dropdown-menu');

    // ícones SVG para uso
    const addIconSVG = '<img src="/imagens/icones/adicionar-icone.svg" alt="Adicionar filtro" class="icon">';
    const removeIconSVG = '<img src="/imagens/icones/remover-icone.svg" alt="Remover filtro" class="icon">';
    const arrowIconSVG = `<img src="/imagens/icones/down.svg" class="dropdown-arrow icon"  alt="seta para abrir">`;
    const starFilledSVG = '<img src="/imagens/icones/estrela-preenchida.svg" class="star" alt="">';
    const starEmptySVG = '<img src="/imagens/icones/estrela-vazia.svg" class="star" alt="">';

    // Dicionario com opções de badges e níveis
    const badgeOptions = [{ name: 'Angular', imgSrc: '/imagens/badges/Angular.svg' }, { name: 'Bootstrap', imgSrc: '/imagens/badges/Bootstrap.svg' }, { name: 'C++', imgSrc: '/imagens/badges/C++.svg' }, { name: 'CSS', imgSrc: '/imagens/badges/CSS.svg' }, { name: 'Docker', imgSrc: '/imagens/badges/Docker.svg' }, { name: 'Figma', imgSrc: '/imagens/badges/Figma.svg' }, { name: 'Git', imgSrc: '/imagens/badges/Git.svg' }, { name: 'GitHub', imgSrc: '/imagens/badges/Github.svg' }, { name: 'GitLab', imgSrc: '/imagens/badges/Gitlab.svg' }, { name: 'Go', imgSrc: '/imagens/badges/Go.svg' }, { name: 'HTML', imgSrc: '/imagens/badges/HTML.svg' }, { name: 'Java', imgSrc: '/imagens/badges/JAVA.svg' }, { name: 'JavaScript', imgSrc: '/imagens/badges/javascript.svg' }, { name: 'Lua', imgSrc: '/imagens/badges/LUA.svg' }, { name: 'MySQL', imgSrc: '/imagens/badges/MySQL.svg' }, { name: 'PHP', imgSrc: '/imagens/badges/PHP.svg' }, { name: 'PostgreSQL', imgSrc: '/imagens/badges/PostgreSQL.svg' }, { name: 'Python', imgSrc: '/imagens/badges/Python.svg' }, { name: 'React', imgSrc: '/imagens/badges/React.svg' }, { name: 'Rust', imgSrc: '/imagens/badges/Rust.svg' }, { name: 'Scrum', imgSrc: '/imagens/badges/Scrum.svg' }, { name: 'Spring Boot', imgSrc: '/imagens/badges/SpringBoot.svg' }, { name: 'Swagger', imgSrc: '/imagens/badges/Swagger.svg' }, { name: 'TypeScript', imgSrc: '/imagens/badges/Typescript.svg' }, { name: 'Vue.js', imgSrc: '/imagens/badges/Vuejs.svg' }, { name: 'SQLAlchemy', imgSrc: '/imagens/badges/SQLalchemy.svg' }, { name: 'SQLite', imgSrc: '/imagens/badges/SQLite.svg' }];
    const levelOptions = [{ name: 'Iniciante', stars: 1 }, { name: 'Básico', stars: 2 }, { name: 'Intermediário', stars: 3 }, { name: 'Avançado', stars: 4 }, { name: 'Especialista', stars: 5 }];

    let currentSelectedBadge = null;
    let currentSelectedLevel = null;

    // html para exibir o nível selecionado com estrelas
    const createLevelDisplayHTML = (level) => {
        const starsHTML = `${starFilledSVG.repeat(level.stars)}${starEmptySVG.repeat(5 - level.stars)}`;
        return `
            <div>${starsHTML}</div>
            <span>${level.name}</span>
        `;
    };

    // html para exibir o select de nível vazio - não selecionado
    const createLevelSelectHTML = () => {
        return `
            <div class="custom-dropdown">
                <div class="dropdown-select level-select disabled">
                    <span>Nenhum nível selecionado</span>
                </div>
            </div>
        `;
    };

    // html para cada filtro adicionado
    const createAddedFilterHTML = (badge, level) => {
        const rowId = `added-filter-${Date.now()}`;
        const levelDisplayHTML = level ? createLevelDisplayHTML(level) : createLevelSelectHTML();

        return `
        <div class="filter-row-layout added-filter-row" id="${rowId}" data-badge="${badge.name}" data-level="${level ? level.name : ''}">
            <div class="badge-column">
                <img src="${badge.imgSrc}" alt="${badge.name}" class="badge-display">
            </div>
            <div class="level-column">
                <div class="level-display">
                    ${levelDisplayHTML}
                </div>
            </div>
            <div class="action-column">
                <button class="btn-remove-filter" data-remove-id="${rowId}">${removeIconSVG}</button>
            </div>
        </div>
    `;
    };

    // limpa seleção atual para valores padrão
    const resetSelection = () => {
        currentSelectedBadge = null;
        currentSelectedLevel = null;
        badgeSelect.innerHTML = `<span>Badges</span>${arrowIconSVG}`;
        levelSelect.innerHTML = `<span>Níveis de experiência</span>${arrowIconSVG}`;
    };

    // atualiza opções de badges disponíveis no dropdown, removendo as já adicionadas
    function updateBadgeOptions() {
        const addedBadges = new Set(
            [...addedFiltersContainer.querySelectorAll('.added-filter-row')].map(row => row.dataset.badge)
        );
        const availableBadges = badgeOptions.filter(b => !addedBadges.has(b.name));
        renderBadgeDropdown(availableBadges);
    }

    // renderiza as opções de badges no dropdown
    function renderBadgeDropdown(badges) {
        badgeDropdownMenu.innerHTML = badges.map(b =>
            `<div class="badge-item" data-badge="${b.name}">
                <img src="${b.imgSrc}" class="badge-item-img" alt="Badge ${b.name}">
            </div>`
        ).join('');
    }

    // popula os dropdowns inicialmente
    const populateDropdowns = () => {
        addFilterBtn.innerHTML = addIconSVG;
        updateBadgeOptions();
        levelDropdownMenu.innerHTML = levelOptions.map(l => `<div class="level-item" data-level="${l.name}"><div>${starFilledSVG.repeat(l.stars)}${starEmptySVG.repeat(5 - l.stars)}</div><span>${l.name}</span></div>`).join('');
    };

    // fecha todos os dropdowns, exceto o passado como argumento
    const closeAllDropdowns = (except) => {
        document.querySelectorAll('.dropdown-select.open').forEach(select => {
            if (select !== except) {
                select.classList.remove('open');
                select.nextElementSibling.classList.remove('show');
            }
        });
    };

    // adiciona filtro selecionado
    addFilterBtn.addEventListener('click', () => {
        if (!currentSelectedBadge) {
            alert('Por favor, selecione uma badge para adicionar.');
            return;
        }

        const levelToAdd = currentSelectedLevel;
        const newFilterHTML = createAddedFilterHTML(currentSelectedBadge, levelToAdd);
        addedFiltersContainer.insertAdjacentHTML('beforeend', newFilterHTML);
        resetSelection();
        updateBadgeOptions();
    });

    // Listener para cliques na página
    document.addEventListener('click', (e) => {
        // abrir/fechar dropdowns
        const dropdownSelect = e.target.closest('.dropdown-select:not(.disabled)');
        if (dropdownSelect) {
            const dropdownMenu = dropdownSelect.nextElementSibling;
            const isOpen = dropdownSelect.classList.contains('open');
            closeAllDropdowns(isOpen ? null : dropdownSelect);
            dropdownSelect.classList.toggle('open');
            if (dropdownMenu) {
                dropdownMenu.classList.toggle('show');
            }
            return;
        }

        // selecionar badge
        const badgeItem = e.target.closest('#selection-row .badge-item');
        if (badgeItem) {
            const badgeName = badgeItem.dataset.badge;
            currentSelectedBadge = badgeOptions.find(b => b.name === badgeName);
            badgeSelect.innerHTML = `<div>${badgeItem.innerHTML}</div>` + arrowIconSVG;
            closeAllDropdowns();
            return;
        }

        // selecionar nível
        const levelItem = e.target.closest('#selection-row .level-item');
        if (levelItem) {
            const levelName = levelItem.dataset.level;
            currentSelectedLevel = levelOptions.find(l => l.name === levelName);
            levelSelect.innerHTML = `<div class="level-item">${levelItem.innerHTML}</div>` + arrowIconSVG;
            closeAllDropdowns();
            return;
        }

        // remover filtro adicionado
        const removeBtn = e.target.closest('.btn-remove-filter');
        if (removeBtn) {
            document.getElementById(removeBtn.dataset.removeId).remove();
            updateBadgeOptions();
            return;
        }

        // fechar dropdowns se clicar fora
        if (!e.target.closest('.custom-dropdown')) {
            closeAllDropdowns();
        }
    });

    // limpar todos os filtros
    const clearFilters = () => {
        nameInput.value = '';
        addedFiltersContainer.innerHTML = '';
        resetSelection();
        updateBadgeOptions();
    };

    clearBtn.addEventListener('click', clearFilters);

    // ação do botão pesquisar - falta adicionar a lógica de pesquisa real
    searchBtn.addEventListener('click', () => {
        const filters = {
            name: nameInput.value.trim(),
            skills: []
        };
        document.querySelectorAll('.added-filter-row').forEach(row => {
            if (row.dataset.badge && row.dataset.level) {
                filters.skills.push({
                    badge: row.dataset.badge,
                    level: row.dataset.level
                });
            }
        });
        console.log('Filtros para pesquisar:', filters);
    });

    populateDropdowns();
});
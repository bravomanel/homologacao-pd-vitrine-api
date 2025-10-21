const botao = document.querySelector('.baixar-curriculo');
const img = botao.querySelector('img')
const texto = botao.querySelector('p')

const originalSrc = "/imagens/icones/download.svg"
const hoverSrc = "/imagens/icones/downloadhover.svg"
const originalBg = "#F4BC1D"
const hoverBg = "#000000"



// função para pegar dados de um único usuário pelo username
async function pegaUsuarioPeloUsername(username) {
    try {
        const response = await fetch(`/api/users?username=${username}`);
        if (!response.ok) throw new Error('Usuário não encontrado');
        const data = await response.json();
        return data[0]; // a API retorna um array, pegamos o primeiro resultado
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        return null;
    }
}

// pega os projetos de um usuário pelo ID
async function pegaProjetosDoUsuario(userId) {
    try {
        const response = await fetch(`/api/users/${userId}/projects`);
        if (!response.ok) throw new Error('Projetos não encontrados');
        const projects = await response.json();
        return projects;
    } catch (error) {
        console.error("Erro ao buscar projetos:", error);
        return []; // retorna um array vazio em caso de erro
    }
}


// comportamento mobile (click)
botao.addEventListener('click', () => {
    if (window.matchMedia("(max-width: 719px)").matches) {
        img.src = hoverSrc;
        botao.style.backgroundColor = hoverBg

        setTimeout(() => {
            img.src = originalSrc
            botao.style.backgroundColor = originalBg
        }, 500);
    }
});

//comportamento desktop (hover)
botao.addEventListener('mouseenter', () => {
    if (window.matchMedia("(min-width: 720px)").matches) {
        img.src = hoverSrc
        botao.style.backgroundColor = hoverBg
        texto.style.color = originalBg
    }
});

//pós hover
botao.addEventListener('mouseleave', () => {
    if (window.matchMedia("(min-width: 720px)").matches) {
        img.src = originalSrc
        botao.style.backgroundColor = originalBg
        texto.style.color = hoverBg
    }
});

function ajustarResponsavel() {
    const responsavel = document.querySelector('#resp-tec-texto');
    if (!responsavel) return;
    if (window.matchMedia('(min-width: 720px) and (max-width: 1000px)').matches) {
        responsavel.textContent = "Responsável:";
    }
    else {
        responsavel.textContent = "Responsável Técnico:";
    }
};
ajustarResponsavel();
window.addEventListener('resize', ajustarResponsavel);

function ajustarExp() {
    const expTexto = document.querySelectorAll('.exp-texto');
    if (window.matchMedia('(min-width: 720px) and (max-width: 1000px)').matches) {
        expTexto.forEach(texto => {
            texto.style.display = "none";
        });
    }
    else {
        expTexto.forEach(texto => {
            texto.style.display = "block";
        });
    }
}

ajustarExp();
window.addEventListener('resize', ajustarExp);




function renderizarCardProjeto(projeto) {
    const badgesHtml = projeto.topics.map(topic => 
        `<img src="/imagens/badges/${topic}.svg" alt="${topic}" title="${topic}">`
    ).join('');

    return `
        <div class="card-tela-perfil">
            <figure class="figure-card-tela-perfil">
                <img src="${projeto.avatar_url || '/imagens/projetos/default-logo.png'}" alt="Logo do projeto" class="img-card-tela-perfil">
                <figcaption>Logo do projeto ${projeto.name}</figcaption>
            </figure>
            <div class="conteudo-card-tela-perfil">
                <div class="titulo-descricao-tela-perfil">
                    <h2 class="title-card-tela-perfil">${projeto.name}</h2>
                    <p class="descricao-card-tela-perfil">${projeto.description || 'Sem descrição.'}</p>
                </div>
                <div class="badges-card-projeto">
                    ${badgesHtml}
                </div>
                <a href="projeto.html?id=${projeto.id}" class="link-ver-mais">
                    <button class="btn-ver-mais">Ver Mais</button>
                </a>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', async () => {
    const username = localStorage.getItem('perfilUsername');

    if (!username) {
        document.body.innerHTML = '<h1>Usuário não especificado.</h1>';
        return;
    }

    const usuario = await pegaUsuarioPeloUsername(username);
    if (!usuario) {
        document.body.innerHTML = '<h1>Usuário não encontrado.</h1>';
        return;
    }

    const projetos = await pegaProjetosDoUsuario(usuario.id);

    const containerProjetos = document.querySelector('.container-card-tela-perfil');
    if (containerProjetos && projetos.length > 0) {
        containerProjetos.innerHTML = '';
        projetos.forEach(projeto => {
            containerProjetos.innerHTML += renderizarCardProjeto(projeto);
        });
    } else if (containerProjetos) {
        containerProjetos.innerHTML = '<p>Nenhum projeto encontrado para este usuário.</p>';
    }
});
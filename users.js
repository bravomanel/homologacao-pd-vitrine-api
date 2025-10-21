const url = '/api' // agora chamamos o server
const colaboradores = ['emanuel.bravo', 'leonardo.maciel', 'joao.tavares', 'caio.caldeira', 'geovanna.alves', 'matheus.lopes', 'kaue.santos', 'felipe.deoliveira', 'daniel.berberrt', 'lucas.alves', 'leandro.ribeiro', 'matheus.casagrande', 'paulo.martins', 'bruno.luz', 'arthur.othero', 'thalisson.santos', 'marcos.alexandria', 'joao.seixas'];

console.log(window.env.GITLAB_TOKEN);

async function pegaUser(pessoa) {
    try {
        const response = await fetch(`${url}/users?username=${pessoa}`);
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Problema: ", error);
        return null;
    }
}

async function pegaBio(pessoa) {
    const dados = await pegaUser(pessoa);
    const id = dados[0].id;
    const response = await fetch(`${url}/users/${id}`);
    if (!response.ok) throw new Error(`Erro ${response.status}`);
    const data = await response.json();
    return data.bio;
}

async function adicionarCard(pessoa) {
    const bio = await pegaBio(pessoa);
    const dados = await pegaUser(pessoa);
    const divMae = document.querySelector('.div-cards-index');
    divMae.innerHTML += `
        <article
            class="col card-index d-flex flex-column justify-content-center align-items-center m-0 p-0 position-relative">
            <!-- retangulo amarelo e img perfil -->
            <div class="card-index__retangulo-amarelo position-absolute top-0 start-0 position-relative">
                <!-- foto perfil -->
                <figure class="m-0">
                    <img src="${dados[0].avatar_url}" alt="foto padrão"
                        class="card-index__foto rounded-circle position-absolute top-100 start-50 translate-middle">
                    <figcaption>Foto padrão</figcaption>
                </figure>
            </div>
            <!-- seção conteudo -->
            <div class="card-index__conteudo d-flex flex-column justify-content-evenly align-items-center ">
                <!-- identificação -->
                <div class=" d-flex flex-column justify-content-evenly align-items-center">
                    <h2 class="card-index__nome text-capitalize m-0 p-0">${dados[0].name}</h2>
                    <p class="card-index__descricao text-center lh-sm m-0 p-0">${bio}</p>
                </div>
                <!-- badges -->
                <div class="w-100 d-flex justify-content-center align-items-center flex-wrap gap-1 gap-md-2">
                    <img src="./../imagens/badges/HTML.svg" alt="HTML" class="card-index__badges">
                    <img src="./../imagens/badges/CSS.svg" alt="CSS" class="card-index__badges">
                    <img src="./../imagens/badges/Javascript.svg" alt="Javascript" class="card-index__badges">
                    <img src="./../imagens/badges/PostgreSQL.svg" alt="PostgreSQL" class="card-index__badges">
                    <img src="./../imagens/badges/Python.svg" alt="python" class="card-index__badges">
                    <img src="./../imagens/badges/C++.svg" alt="C++" class="card-index__badges">
                    <img src="./../imagens/badges/Bootstrap.svg" alt="Bootstrap" class="card-index__badges">
                    <img src="./../imagens/badges/Figma.svg" alt="Figma" class="card-index__badges">
                    <img src="./../imagens/badges/Github.svg" alt="Github" class="card-index__badges">
                    <img src="./../imagens/badges/Gitlab.svg" alt="Gitlab" class="card-index__badges">
                    
                </div>
                <!-- seção responsaveis tec. e supervisor -->
                <div class="w-100 d-flex justify-content-evenly align-items-center m-0 p-0">
                    <!-- responsavel -->
                    <div class="card-index__coordenadores d-flex justify-content-center align-items-center gap-1">
                        <img src="./../imagens/icones/Responsável Tecnico.svg" alt="responsável técnico"
                            class="card-index__icones">
                        <div>
                            <h2 class="fw-bold">Responsável técnico:</h2>
                            <p>Matheus Lopes</p>
                        </div>
                    </div>
                    <!-- supervisor -->
                    <div class="card-index__coordenadores d-flex justify-content-center align-items-center gap-1">
                        <img src="/../imagens/icones/Supervisor.svg" alt="icone supervisor" class="card-index__icones">
                        <div>
                            <h2 class="fw-bold">Supervisor:</h2>
                            <p>Tiago Martins</p>
                        </div>
                    </div>
                </div>
                <!-- botão ver mais -->
                <button
                    data-username="${dados[0].username}"
                    data-id="${dados[0].id}"
                    class="card-index__btn-ver-mais d-flex justify-content-center align-items-center border border-0 text-decoration-none " data-username="${dados[0].username}">
                    Ver Perfil
                </button>
            </div>
        </article>
    `;
}

colaboradores.forEach(colaborador => adicionarCard(colaborador));

const botoes = document.querySelectorAll('.card-index__btn-ver-mais');
document.querySelector('.div-cards-index').addEventListener('click', async (event) => {
    if (event.target.classList.contains('card-index__btn-ver-mais')) {
        const username = event.target.dataset.username;
        const id = event.target.dataset.id;

        localStorage.setItem('perfilUsername', username);
        localStorage.setItem('perfilId', id);

        window.location.href = 'perfil.html';
        await iniciarPerfil();
    }
});


async function iniciarPerfil() {
    const username = localStorage.getItem('perfilUsername');
    if (!username) return;

    const bio = await pegaBio(username);
    const caixaTexto = document.querySelector('.caixa-quem-sou-eu');
    caixaTexto.innerText = bio;
}

window.addEventListener('DOMContentLoaded', iniciarPerfil);
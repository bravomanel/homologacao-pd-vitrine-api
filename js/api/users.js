const colaboradores = ['emanuel.bravo', 'leonardo.maciel', 'joao.tavares', 'caio.caldeira', 'geovanna.alves', 'matheus.lopes', 'kaue.santos', 'felipe.deoliveira', 'daniel.berbert', 'lucas.alves', 'leandro.ribeiro', 'matheus.casagrande', 'paulo.martins', 'bruno.luz', 'arthur.othero', 'thalisson.santos', 'marcos.alexandria', 'joao.seixas'];
//const colaboradores = ['emanuel.bravo', 'leonardo.maciel', 'geovanna.alves', 'matheus.lopes'];

// monta e adiciona o card de um colaborador na página.
async function adicionarCard(pessoa) {
    // Usa a função de utils.js
    const usuarioBasico = await pegaUsuarioPeloUsername(pessoa);
    if (!usuarioBasico) {
        console.warn(`Usuário ${pessoa} não encontrado ou API falhou.`);
        return;
    }

    // Usa a função de utils.js para pegar detalhes (incluindo bio)
    const usuarioDetalhado = await pegaDetalhesDoUsuario(usuarioBasico.id);
    const bio = usuarioDetalhado ? usuarioDetalhado.bio : '';
    const avatarUrl = usuarioBasico.avatar_url;
    //console.log(avatarUrl)
    const divMae = document.querySelector('.div-cards-index');
    divMae.innerHTML += `
        <article
            class="col card-index d-flex flex-column justify-content-center align-items-center m-0 p-0 position-relative">
            <div class="card-index__retangulo-amarelo position-absolute top-0 start-0 position-relative">
                <figure class="m-0">
                <img
                    src="${avatarUrl || '/imagens/icones/user.svg'}"
                    alt="foto padrão"
                    class="card-index__foto rounded-circle position-absolute top-100 start-50 translate-middle"
                />
                    <figcaption>Foto padrão</figcaption>
                </figure>
            </div>
            <div class="card-index__conteudo d-flex flex-column justify-content-evenly align-items-center ">
                <div class=" d-flex flex-column justify-content-evenly align-items-center">
                    <h2 class="card-index__nome text-capitalize m-0 p-0">${usuarioBasico.name}</h2>
                    <p class="card-index__descricao text-center lh-sm m-0 p-0">${bio || ''}</p>
                </div>
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
                <div class="w-100 d-flex justify-content-evenly align-items-center m-0 p-0">
                    <div class="card-index__coordenadores d-flex justify-content-center align-items-center gap-1">
                        <img src="./../imagens/icones/Responsável Tecnico.svg" alt="responsável técnico"
                            class="card-index__icones">
                        <div>
                            <h2 class="fw-bold">Responsável técnico:</h2>
                            <p>Matheus Lopes</p>
                        </div>
                    </div>
                    <div class="card-index__coordenadores d-flex justify-content-center align-items-center gap-1">
                        <img src="/../imagens/icones/Supervisor.svg" alt="icone supervisor" class="card-index__icones">
                        <div>
                            <h2 class="fw-bold">Supervisor:</h2>
                            <p>Tiago Martins</p>
                        </div>
                    </div>
                </div>
                <button
                    data-username="${usuarioBasico.username}"
                    data-id="${usuarioBasico.id}"
                    class="card-index__btn-ver-mais d-flex justify-content-center align-items-center border border-0 text-decoration-none ">
                    Ver Perfil
                </button>
            </div>
        </article>
    `;
}

// Inicia a criação dos cards
colaboradores.forEach(colaborador => adicionarCard(colaborador));

// Adiciona o listener para os botões "Ver Perfil"
document.querySelector('.div-cards-index').addEventListener('click', (event) => {
    const targetButton = event.target.closest('.card-index__btn-ver-mais');

    if (targetButton) {
        const username = targetButton.dataset.username;

        localStorage.setItem('perfilUsername', username);

        window.location.href = 'perfil.html';
    }
});
async function iniciarPerfil() {
    const username = localStorage.getItem('perfilUsername');
    if (!username) return;
 
    const bio = await pegaBio(username);
    const caixaTexto = document.querySelector('.caixa-quem-sou-eu');
    caixaTexto.innerText = bio;
}
 
if (window.location.pathname.includes('perfil.html')) {
    window.addEventListener('DOMContentLoaded', iniciarPerfil);
}
 
async function pegaUser(username) {
    try {
        const response = await fetch(`${url}/users?username=${username}`, {
            headers: { 'PRIVATE-TOKEN': token }
        });
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Problema: ", error);
        return null;
    }
}
 
async function pegaBio(username) {
    const dados = await pegaUser(username);
    if (!dados) return '';
    const id = dados[0].id;
    const response = await fetch(`${url}/users/${id}`, {
        headers: { 'PRIVATE-TOKEN': token }
    });
    if (!response.ok) throw new Error(`Erro ${response.status}`);
    const data = await response.json();
    return data.bio;
}
 
async function carregarPerfil() {
    const username = localStorage.getItem('perfilUsername');
    if (!username) return;
 
    try {
        const dados = await pegaUser(username);
        const bio = await pegaBio(username);
 
        if (!dados || !dados[0]) return;
 
        const nome = document.querySelector('.nome');
        const foto = document.querySelector('.foto-usuario');
        const caixa = document.querySelector('.descricao');
 
        if (nome) nome.textContent = dados[0].name || '';
        if (caixa) caixa.textContent = bio || '';
        if (foto) foto.src = dados[0].avatar_url || foto.src;
    } catch (err) {
        console.error('Erro ao carregar perfil:', err);
    }
}
 
window.addEventListener('DOMContentLoaded', carregarPerfil);
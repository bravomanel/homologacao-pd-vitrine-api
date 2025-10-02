function ajustarExp() {
    const expTexto = document.querySelectorAll('.exp-texto');
    if (window.matchMedia('(min-width: 720px) and (max-width: 1100px)').matches) {
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

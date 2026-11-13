/**
 * SISTEMA MAGIA - MOTOR DE ARRASTO GLOBAL (Reutilizável)
 * Centraliza a lógica de movimentação de modais assíncronos e fixos.
 */
window.ativarArrastoGlobal = function(configuracoes = []) {
    // 🥷 Vigia o surgimento dos elementos na tela (suporta fetches assíncronos)
    const rastreador = new MutationObserver(() => {
        configuracoes.forEach(config => {
            // Busca o elemento principal pelo ID ou Classe (ex: '#modalImpostos')
            const elementoPrincipal = document.querySelector(config.seletorPrincipal);
            
            if (elementoPrincipal && !elementoPrincipal.dataset.arrastavelAtivo) {
                // Se não definir um puxador/gatilho, o modal inteiro vira o puxador
                const elementoGatilho = elementoPrincipal.querySelector(config.seletorGatilho) || elementoPrincipal;
                
                if (elementoGatilho) {
                    elementoPrincipal.dataset.arrastavelAtivo = "true";
                    console.log(`[Sistema Magia - Drag] Ativado em: ${config.seletorPrincipal}`);
                    vincularLogicaMovimento(elementoPrincipal, elementoGatilho);
                }
            }
        });
    });

    // Inicia o monitoramento no body
    rastreador.observe(document.body, { childList: true, subtree: true });
};

function vincularLogicaMovimento(elementoPrincipal, elementoGatilho) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    // Estiliza o puxador com a mãozinha de movimento
    elementoGatilho.style.cursor = "move";
    elementoGatilho.style.setProperty("user-select", "none", "important");
    elementoGatilho.onmousedown = iniciarArrasto;

    function iniciarArrasto(e) {
        // Ignora o movimento se o clique for em botões, campos ou caixas de seleção
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('textarea')) {
            return; 
        }
        e.preventDefault();
        
        // Guarda a posição inicial do ponteiro do mouse
        pos3 = e.clientX;
        pos4 = e.clientY;

        // Captura a posição geométrica exata do componente na tela
        const retangulo = elementoPrincipal.getBoundingClientRect();
        
        // Destrava as amarras do Bootstrap (margins automáticas e transformações)
        elementoPrincipal.style.setProperty("position", "absolute", "important");
        elementoPrincipal.style.setProperty("margin", "0", "important");
        elementoPrincipal.style.setProperty("transform", "none", "important");
        
        // Trava ele na coordenada milimétrica em que ele abriu
        elementoPrincipal.style.top = `${window.scrollY + retangulo.top}px`;
        elementoPrincipal.style.left = `${window.scrollX + retangulo.left}px`;

        document.onmouseup = pararArrasto;
        document.onmousemove = arrastarPainel;
    }

    function arrastarPainel(e) {
        e.preventDefault();
        // Calcula o deslocamento do mouse
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        // Modifica a posição em tempo real nas propriedades top/left
        elementoPrincipal.style.top = `${elementoPrincipal.offsetTop - pos2}px`;
        elementoPrincipal.style.left = `${elementoPrincipal.offsetLeft - pos1}px`;
        elementoPrincipal.style.right = "auto";
    }

    function pararArrasto() {
        // Limpa os listeners ao soltar o mouse
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
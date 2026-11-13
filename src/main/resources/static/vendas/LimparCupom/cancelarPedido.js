function limparTelaCupom() {

    if (!window.itensCupomMemoria || window.itensCupomMemoria.length === 0) {
        alert("O cupom já está vazio.");
        return;
    }

    if (!confirm("Deseja limpar os itens do cupom atual?")) {
        return;
    }

    // SOMENTE MEMÓRIA DA TELA
    window.itensCupomMemoria = [];

    // Redesenha o cupom vazio
    if (typeof renderizarCupomDaMemoria === "function") {
        renderizarCupomDaMemoria();
    }

    // Volta quantidade para 1
    const quantidade = document.getElementById("inputQuantidade");
    if (quantidade) {
        quantidade.value = "1";
    }

    console.log("🧹 Cupom limpo somente na tela. Banco não foi alterado.");
}

window.limparTelaCupom = limparTelaCupom;



async function carregarClientesPDV() {
    try {
        const response = await fetch(`${API_URL}/api/clientes`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error("Erro ao carregar clientes. Status:", response.status);
            return;
        }

        const clientes = await response.json();

        // 1. Monta a string com as opções (Escola COBOL de processamento de texto)
        let htmlOpcoes = '<option value="">Selecione o Cliente...</option>';
        clientes.forEach(cliente => {
            htmlOpcoes += `<option value="${cliente.id}">${cliente.nome}</option>`;
        });

        // 2. ⚡ A TRAVA DE SEGURANÇA SANEADA:
        // Busca qual elemento visual vai receber essa lista na tela atual
        const containerLista = document.getElementById("selectClienteModal") || document.getElementById("selectClienteModalImpostos");

        if (containerLista) {
            // 🌟 Só injeta os dados se o elemento realmente existir no HTML!
            containerLista.innerHTML = htmlOpcoes;
            containerLista.value = ""; // Reseta o ponteiro de seleção com segurança
            console.log("👥 Lista de clientes injetada no componente visual com sucesso.");
        } else {
            // Se não existir na tela, avisa no console de forma discreta e NÃO aborta o fluxo
            console.log("ℹ️ [Aviso] Elemento receptor de clientes não encontrado na árvore do HTML. Pulando renderização visual.");
        }

    } catch (erro) {
        // 🌟 TRATAMENTO DE ERROS SEM LOCK: Registra a falha de rede sem travar o faturamento
        console.error("❌ Erro interno ao processar a carga de clientes do PDV:", erro);
    }
}






































































































































































































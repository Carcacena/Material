async function devolucaoCarrinho() {
    // --- 🚨 TRAVA DE SEGURANÇA BLINDADA PARA O PIÁ ---
    // Em vez de varrer a página inteira, olhamos apenas o texto de dentro do corpo da tabela!
    const tabelaModal = document.getElementById("corpoTabelaPesquisaAvancada");
    const textoTabela = tabelaModal ? tabelaModal.innerHTML : "";
    
    // Verifica também se o texto selecionado no dropdown traz a palavra Devolução
    const select = document.getElementById("dropdownPedidosLocalizados");
    const textoCombo = select && select.options[select.selectedIndex] ? select.options[select.selectedIndex].text : "";

    // Checa se o status real 3 ou as etiquetas de devolução estão no lote consultado
    const possuiDevolucao = textoTabela.includes("3 - Devolvido") || 
                            textoTabela.includes("Devolucao") || 
                            textoCombo.includes("Devolução") ||
                            textoCombo.includes("Status 3");

    if (possuiDevolucao) {
        alert("🚨 Alerta: Este pedido já foi emitido devolução! Operação cancelada.");
        return; // Aborta na hora sem queimar o estoque no MySQL!
    }
    // -------------------------------------------------

    // --- SEU FLUXO ORIGINAL DE IDs SEGURO ABAIXO ---
    // Como tiramos os checkboxes da tela e colocamos o botão de lote, o seu script antigo
    // precisa ler os elementos invisíveis (hidden) que injetamos na tabela para coletar os IDs
    const checkboxesMarcados = document.querySelectorAll(".check-produto-devolucao"); 
    
    if (checkboxesMarcados.length === 0) {
        alert("Atenção piá! Não encontramos produtos válidos para processar o lote de devolução.");
        return;
    }

    // Coleta todos os IDs do lote de uma vez só automaticamente
    const itemIds = Array.from(checkboxesMarcados).map(chk => Number(chk.value));

    const confirmar = confirm(
        `Confirma a DEVOLUÇÃO TOTAL deste lote com ${itemIds.length} produto(s)?\n` +
        `O estoque será estornado automaticamente no MySQL.`
    );
    if (!confirmar) return;

    const urlServidorAtual = window.urlServidor || "http://localhost:8080";
    const token = obterTokenSeguro();

    try {
        const resposta = await fetch(`${urlServidorAtual}/carrinho/devolver/lote`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(itemIds)
        });

        if (!resposta.ok) {
            const mensagemErro = await resposta.text();
            throw new Error(mensagemErro || "Erro ao devolver os itens.");
        }

        alert("Devolução realizada com sucesso! Estoque atualizado.");

        if (typeof carregarDetalhesDoPedidoSelecionado === "function") {
            await carregarDetalhesDoPedidoSelecionado();
        }
    } catch (erro) {
        console.error("Erro na devolução:", erro);
        alert("Falha ao devolver: " + erro.message);
    }
}

window.devolucaoCarrinho = devolucaoCarrinho;
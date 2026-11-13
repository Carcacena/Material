async function devolucaoCarrinho() {

    // -------------------------------------------------
    // TRAVA: NÃO PERMITIR DEVOLVER O MESMO LOTE 2 VEZES
    // -------------------------------------------------

    const tabelaModal =
        document.getElementById("corpoTabelaPesquisaAvancada");

    const textoTabela =
        tabelaModal ? tabelaModal.innerHTML : "";

    const select =
        document.getElementById("dropdownPedidosLocalizados");

    if (!select || !select.value) {
        alert("Selecione um pedido antes de realizar a devolução.");
        return;
    }

    const textoCombo =
        select.options[select.selectedIndex]
            ? select.options[select.selectedIndex].text
            : "";

    const possuiDevolucao =
        textoTabela.includes("Devolvido") ||
        textoTabela.includes("Devolucao") ||
        textoTabela.includes("Devolução") ||
        textoCombo.includes("Devolvido") ||
        textoCombo.includes("Devolucao") ||
        textoCombo.includes("Devolução");

    if (possuiDevolucao) {

        alert(
            "🚨 Este pedido já possui devolução. " +
            "Operação cancelada."
        );

        return;
    }

    // -------------------------------------------------
    // COLETA OS ITENS DO LOTE
    // -------------------------------------------------

    const checkboxesMarcados =
        document.querySelectorAll(
            ".check-produto-devolucao"
        );

    if (checkboxesMarcados.length === 0) {

        alert(
            "Não foram encontrados produtos válidos " +
            "para processar a devolução."
        );

        return;
    }

    const itemIds =
        Array.from(checkboxesMarcados)
            .map(chk => Number(chk.value))
            .filter(id => Number.isFinite(id) && id > 0);

    if (itemIds.length === 0) {
        alert("Nenhum ID válido foi encontrado para devolução.");
        return;
    }

    const numeroPedido = select.value;

    const confirmar = confirm(
        `Confirma a DEVOLUÇÃO TOTAL deste lote com ${itemIds.length} produto(s)?\n` +
        `Pedido: ${numeroPedido}\n` +
        `O estoque será estornado e o financeiro será marcado como devolvido.`
    );

    if (!confirmar) {
        return;
    }

    const urlServidorAtual =
        window.urlServidor || "http://localhost:8080";

    const token =
        obterTokenSeguro();

    if (!token) {
        alert("Sessão inválida. Faça login novamente.");
        return;
    }

    try {

        // -------------------------------------------------
        // 1. DEVOLVE O LOTE / ESTOQUE
        // -------------------------------------------------

        const resposta = await fetch(
            `${urlServidorAtual}/carrinho/devolver/lote`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify(itemIds)
            }
        );

        if (!resposta.ok) {

            const mensagemErro =
                await resposta.text();

            throw new Error(
                mensagemErro ||
                "Erro ao devolver os itens."
            );
        }

        // -------------------------------------------------
        // 2. MARCA O CONTAS A RECEBER COMO DEVOLVIDO
        // -------------------------------------------------

        const respostaFinanceiro = await fetch(
            `${urlServidorAtual}/contas-receber/pedido/${encodeURIComponent(numeroPedido)}/devolver`,
            {
                method: "PUT",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!respostaFinanceiro.ok) {

            const erroFinanceiro =
                await respostaFinanceiro.text();

            throw new Error(
                "Estoque devolvido, mas houve falha no " +
                "Contas a Receber. " +
                erroFinanceiro
            );
        }

        alert(
            "✅ Devolução realizada com sucesso!\n" +
            "Estoque e Contas a Receber atualizados."
        );

        if (
            typeof carregarDetalhesDoPedidoSelecionado ===
            "function"
        ) {
            await carregarDetalhesDoPedidoSelecionado();
        }

    } catch (erro) {

        console.error(
            "Erro na devolução:",
            erro
        );

        alert(
            "Falha ao devolver: " +
            erro.message
        );
    }
}

window.devolucaoCarrinho = devolucaoCarrinho;
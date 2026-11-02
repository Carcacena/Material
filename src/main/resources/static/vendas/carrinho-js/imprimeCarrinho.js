

// carrinho-js/imprimeCarrinho.js
// 🖨️ Impressão da DANFE de saída do pedido selecionado

function imprimirPedidoPdfAtual() {

    const numPedido =
        document.getElementById("dropdownPedidosLocalizados").value;

    if (!numPedido) {
        alert("Por favor, selecione um pedido antes de imprimir!");
        return;
    }

    console.log(
        `🖨️ Gerando DANFE de saída do pedido: ${numPedido}`
    );

    baixarPdf(
        `/api/relatorios/danfe-saida/${encodeURIComponent(numPedido)}`,
        `DANFE_Saida_${numPedido}`
    );
}

window.imprimirPedidoPdfAtual =
    imprimirPedidoPdfAtual;
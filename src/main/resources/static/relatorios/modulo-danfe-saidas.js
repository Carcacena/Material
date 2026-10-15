
// 🔍 FUNÇÃO: Filtra os cupons gerados batendo no nosso RelatorioController unificado
async function filtrarVendasPorPeriodo() {
    const dataInicio = document.getElementById('vendaDataInicio').value;
    const dataFim = document.getElementById('vendaDataFim').value;
    const select = document.getElementById('selectVendaDinamica');

    if (!dataInicio || !dataFim) {
        alert("⚠️ Por favor, informe o período de datas completo!");
        return;
    }

    select.innerHTML = '<option value="">Buscando pedidos no MySQL...</option>';

    try {
        // Busca o token de segurança usando a função global do seu utils.js
        const token = window.obterTokenSeguro();

        const response = await fetch(`/api/relatorios/vendas/periodo?inicio=${dataInicio}&fim=${dataFim}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Erro na comunicação com o servidor.");
        const vendas = await response.json();

        if (vendas.length === 0) {
            select.innerHTML = '<option value="">-- NENHUM PEDIDO ENCONTRADO NO PERÍODO --</option>';
            return;
        }

        select.innerHTML = '<option value="">-- SELECIONE UM PEDIDO DE VENDA --</option>';

        // Alimenta o dropdown com o número real do pedido, nome do cliente e valor total
        vendas.forEach(v => {
            const opt = document.createElement('option');
            const numPedido = v.numeroNota || 'S/P';
            opt.value = numPedido;

            const cliente = v.fornecedorNome || 'Consumidor Final';
            const total = v.valorTotalNota ? parseFloat(v.valorTotalNota).toFixed(2) : '0.00';

            opt.textContent = `🛒 Pedido Nº: ${numPedido} | Cliente: ${cliente} | Total: R$ ${total}`;
            select.appendChild(opt);
        });

    } catch (erro) {
        console.error("Erro ao filtrar vendas no faturamento:", erro);
        select.innerHTML = '<option value="">Erro ao carregar pedidos do banco</option>';
    }
}

// 🖨️ FUNÇÃO: Dispara o download da DANFE azul corporativa pelo passaporte universal
function imprimirDanfeSaida() {

    const idVenda = document.getElementById('selectVendaDinamica').value;

    if (!idVenda) {
        alert("⚠️ Por favor, selecione um Pedido de Venda na lista antes de imprimir!");
        return;
    }

    // Consome o endpoint centralizado do RelatorioController e a função baixarPdf do utils.js
    const endpoint = `/api/relatorios/danfe-saida/${idVenda}`;
    window.baixarPdf(endpoint, `DANFE_Saida_Pedido_${idVenda}`);
}







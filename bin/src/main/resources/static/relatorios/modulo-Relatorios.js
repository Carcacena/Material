async function filtrarEntradasPorPeriodo() {
    const dataInicio = document.getElementById('entradaDataInicio').value;
    const dataFim = document.getElementById('entradaDataFim').value;
    const select = document.getElementById('selectEntradaDinamica');

    if (!dataInicio || !dataFim) {
        alert("⚠️ Por favor, informe o período de datas completo!");
        return;
    }

    select.innerHTML = '<option value="">Buscando notas no MySQL...</option>';

    try {
        const token = window.obterTokenSeguro();

        const response = await fetch(`/api/relatorios/entradas/periodo?inicio=${dataInicio}&fim=${dataFim}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error("Erro na comunicação com o servidor.");
        }

        const entradas = await response.json();

        if (entradas.length === 0) {
            select.innerHTML = '<option value="">-- NENHUMA NOTA ENCONTRADA NO PERÍODO --</option>';
            return;
        }

        select.innerHTML = '<option value="">-- SELECIONE UMA NOTA FISCAL --</option>';

        entradas.forEach(e => {
            const opt = document.createElement('option');
            opt.value = e.id;

            const numNota = e.numeroNota || 'S/N';
            const fornecedor = e.fornecedorNome || 'Não Informado';
            const valorTotal = e.valorTotalNota ? parseFloat(e.valorTotalNota).toFixed(2) : '0.00';

            opt.textContent = `🏭 Forn: ${fornecedor} | NF: ${numNota} | Total: R$ ${valorTotal}`;
            select.appendChild(opt);
        });

    } catch (erro) {
        console.error("Erro ao carregar notas do período:", erro);
        select.innerHTML = '<option value="">Erro ao carregar notas do banco</option>';
        alert("❌ Erro ao buscar notas: Verifique se o servidor Spring Boot está ativo.");
    }
}

// 🖨️ FUNÇÃO: Pega a nota selecionada e manda para o endpoint da DANFE Consolidada
function imprimirDanfePeloPainel() {
    const idNota = document.getElementById('selectEntradaDinamica').value;

    if (!idNota) {
        alert("⚠️ Por favor, selecione uma Nota Fiscal na lista antes de imprimir!");
        return;
    }

    const endpoint = `/api/relatorios/danfe/${idNota}`;
    window.baixarPdf(endpoint, `DANFE_Consolidada_Nota_${idNota}`);
}
function imprimirDanfeSaida() {
    const idNota = document.getElementById('selectEntradaDinamica').value;

    if (!idNota) {
        alert("⚠️ Por favor, selecione um registro na lista antes de imprimir!");
        return;
    }

    // 🎯 AJUSTADO: Aponta diretamente para a rota unificada do RelatorioController!
    const endpoint = `/api/relatorios/danfe-saida/${idNota}`;
    window.baixarPdf(endpoint, `DANFE_Saida_Pedido_${idNota}`);

    // 🔍 FUNÇÃO DE SAÍDA: Filtra os Pedidos de Saída (Vendas) batendo no seu Backend Java
    async function filtrarVendasPorPeriodo() {
        // 🎯 CORREÇÃO DOS IDS: Captura os campos azuis que estão no HTML!
        const dataInicio = document.getElementById('vendaDataInicio').value;
        const dataFim = document.getElementById('vendaDataFim').value;
        const select = document.getElementById('selectVendaDinamica');

        if (!dataInicio || !dataFim) {
            alert("⚠️ Por favor, informe o período de datas completo!");
            return;
        }

        select.innerHTML = '<option value="">Buscando pedidos de venda no MySQL...</option>';

        try {
            const token = window.obterTokenSeguro();

            // Bate no endpoint de período de vendas que configuramos no Java
            const response = await fetch(`/api/relatorios/vendas/periodo?inicio=${dataInicio}&fim=${dataFim}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Erro na comunicação com o servidor.");

            const vendas = await response.json();

            if (vendas.length === 0) {
                select.innerHTML = '<option value="">-- NENHUM PEDIDO DE VENDA ENCONTRADO NO PERÍODO --</option>';
                return;
            }

            select.innerHTML = '<option value="">-- SELECIONE UM PEDIDO DE VENDA --</option>';

            // Popula o dropdown AZUL com as vendas encontradas no banco
            vendas.forEach(v => {
                const opt = document.createElement('option');
                opt.value = v.id;

                const numPedido = v.id;
                const cliente = v.fornecedorNome || 'Consumidor Final'; // Reaproveitando o campo de texto do DTO
                const total = v.valorTotalNota ? parseFloat(v.valorTotalNota).toFixed(2) : '0.00'; // Reaproveitando o double do DTO

                opt.textContent = `🛒 Pedido Nº: ${numPedido} | Cliente: ${cliente} | Total: R$ ${total}`;
                select.appendChild(opt);
            });

        } catch (erro) {
            console.error("Erro ao filtrar vendas:", erro);
            select.innerHTML = '<option value="">Erro ao carregar pedidos do banco</option>';
        }
    }

    function imprimirDanfeSaida() {
        // 🎯 CORREÇÃO: Lê o valor do select azul!
        const idVenda = document.getElementById('selectVendaDinamica').value;

        if (!idVenda) {
            alert("⚠️ Por favor, selecione um Pedido de Venda na lista antes de imprimir!");
            return;
        }

        // Endpoint relacional que criamos no RelatorioController
        const endpoint = `/api/relatorios/danfe-saida/${idVenda}`;
        window.baixarPdf(endpoint, `DANFE_Saida_Pedido_${idVenda}`);
    }

    // 🌐 Garante a exposição global das funções para o HTML (Sem chaves sobrando abaixo!)
    window.filtrarVendasPorPeriodo = filtrarVendasPorPeriodo;
    window.imprimirDanfeSaida = imprimirDanfeSaida;
}

// ==========================================================
// 📥 FUNÇÕES DO PAINEL VERDE (ENTRADAS / COMPRAS)
// ==========================================================
async function filtrarEntradasPorPeriodo() {
    const dataInicio = document.getElementById('entradaDataInicio').value;
    const dataFim = document.getElementById('entradaDataFim').value;
    const select = document.getElementById('selectEntradaDinamica');

    if (!dataInicio || !dataFim) {
        alert("⚠️ Por favor, informe o período de datas completo!");
        return;
    }

    select.innerHTML = '<option value="">Buscando notas no MySQL...</option>';

    try {
        const token = window.obterTokenSeguro();
        const response = await fetch(`/api/relatorios/entradas/periodo?inicio=${dataInicio}&fim=${dataFim}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Erro na comunicação com o servidor.");
        const entradas = await response.json();

        if (entradas.length === 0) {
            select.innerHTML = '<option value="">-- NENHUMA NOTA ENCONTRADA NO PERÍODO --</option>';
            return;
        }

        select.innerHTML = '<option value="">-- SELECIONE UMA NOTA FISCAL --</option>';
        entradas.forEach(e => {
            const opt = document.createElement('option');
            opt.value = e.id;
            const numNota = e.numeroNota || 'S/N';
            const fornecedor = e.fornecedorNome || 'Não Informado';
            const valorTotal = e.valorTotalNota ? parseFloat(e.valorTotalNota).toFixed(2) : '0.00';

            opt.textContent = `🏭 Forn: ${fornecedor} | NF: ${numNota} | Total: R$ ${valorTotal}`;
            select.appendChild(opt);
        });
    } catch (erro) {
        console.error("Erro ao carregar notas:", erro);
        select.innerHTML = '<option value="">Erro ao carregar notas do banco</option>';
    }
}

function imprimirDanfePeloPainel() {
    const idNota = document.getElementById('selectEntradaDinamica').value;
    if (!idNota) {
        alert("⚠️ Por favor, selecione uma Nota Fiscal na lista antes de imprimir!");
        return;
    }
    window.baixarPdf(`/api/relatorios/danfe/${idNota}`, `DANFE_Consolidada_Nota_${idNota}`);
}

// ==========================================================
// 🛒 FUNÇÕES DO PAINEL AZUL (VENDAS / SAÍDAS)
// ==========================================================
async function filtrarVendasPorPeriodo() {
    const dataInicio = document.getElementById('vendaDataInicio').value;
    const dataFim = document.getElementById('vendaDataFim').value;
    const select = document.getElementById('selectVendaDinamica');

    if (!dataInicio || !dataFim) {
        alert("⚠️ Por favor, informe o período de datas completo!");
        return;
    }

    select.innerHTML = '<option value="">Buscando pedidos de venda no MySQL...</option>';

    try {
        const token = window.obterTokenSeguro();
        const response = await fetch(`/api/relatorios/vendas/periodo?inicio=${dataInicio}&fim=${dataFim}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Erro na comunicação com o servidor.");
        const vendas = await response.json();

        if (vendas.length === 0) {
            select.innerHTML = '<option value="">-- NENHUM PEDIDO DE VENDA ENCONTRADO NO PERÍODO --</option>';
            return;
        }

        select.innerHTML = '<option value="">-- SELECIONE UM PEDIDO DE VENDA --</option>';
        vendas.forEach(v => {
            const opt = document.createElement('option');

            // 🎯 MODIFICADO: Guarda o número real do pedido (ex: PED-17889...) para o Java conseguir buscar
            const numPedido = v.numeroNota || 'S/P';
            opt.value = numPedido;

            const cliente = v.fornecedorNome || 'Consumidor Final';
            const total = v.valorTotalNota ? parseFloat(v.valorTotalNota).toFixed(2) : '0.00';

            // 🎯 MODIFICADO: Exibe o número real do pedido no texto para o usuário
            opt.textContent = `🛒 Pedido Nº: ${numPedido} | Cliente: ${cliente} | Total: R$ ${total}`;
            select.appendChild(opt);
        });
    } catch (erro) {
        console.error("Erro ao filtrar vendas:", erro);
        select.innerHTML = '<option value="">Erro ao carregar pedidos do banco</option>';
    }
}

function imprimirDanfeSaida() {
    const idVenda = document.getElementById('selectVendaDinamica').value;
    if (!idVenda) {
        alert("⚠️ Por favor, selecione um Pedido de Venda na lista antes de imprimir!");
        return;
    }
    window.baixarPdf(`/api/relatorios/danfe-saida/${idVenda}`, `DANFE_Saida_Pedido_${idVenda}`);
}












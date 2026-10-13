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
            const valorTotal = e.valorTotalNota ?
                parseFloat(e.valorTotalNota).toFixed(2) : '0.00';

            opt.textContent = `🏭 Forn: ${fornecedor} | NF: ${numNota} | Total: R$ ${valorTotal}`;
            select.appendChild(opt);
        });
    } catch (erro) {
        console.error("Erro ao carregar notas:", erro);
        select.innerHTML = '<option value="">Erro ao carregar notas do banco</option>';
    }
}

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
					headers: {"Authorization": `Bearer ${token}`}
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


function imprimirDanfeSaida() {
        const idNota = document.getElementById('selectEntradaDinamica').value;
        if (!idNota) {
            alert("⚠️ Por favor, selecione um registro na lista antes de imprimir!");
            return;
        }
        // 🎯 AJUSTADO: Aponta diretamente para a rota unificada do RelatorioController!
        const endpoint = `/api/relatorios/danfe-saida/${idNota}`;
        window.baixarPdf(endpoint, `DANFE_Saida_Pedido_${idNota}`);
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







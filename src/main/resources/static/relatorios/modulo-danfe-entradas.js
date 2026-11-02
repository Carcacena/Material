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

function imprimirDanfePeloPainel() {

    const idNota = document.getElementById('selectEntradaDinamica').value;
    if (!idNota) {
        alert("⚠️ Por favor, selecione uma Nota Fiscal na lista antes de imprimir!");
        return;
    }
    const endpoint = `/api/relatorios/danfe/${idNota}`;
    window.baixarPdf(endpoint, `DANFE_Consolidada_Nota_${idNota}`);
}




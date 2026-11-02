// =========================================================================
// 🚀 FUNÇÃO DE ESTORNO DISPARADA PELO BOTÃO ROXO DO PAINEL GERENCIAL

// =========================================================================
// 🔗 PONTE ENTRE O BOTÃO DO MODAL E O ESTORNO TOTAL DA NOTA
// =========================================================================

async function processarLoteSelecionado() {

    const selectNota =
        document.getElementById("selectNotasAtivas");

    if (!selectNota) {

        alert("Erro: seletor de Nota Fiscal não localizado.");
        return;

    }

    const entradaId = selectNota.value;

    if (!entradaId) {

        alert("Selecione uma Nota Fiscal para devolução.");
        return;

    }

    await estornarNotaViaPainel(entradaId);

}


// Garante acesso pelo onclick do HTML
window.processarLoteSelecionado =
    processarLoteSelecionado;










// =========================================================================
async function estornarNotaViaPainel(entradaId) {
    if (!entradaId) {
        alert("Erro: ID da entrada não localizado.");
        return;
    }

    const confirmar = confirm(
        `🚨 ATENÇÃO PIÃO!\n` +
        `Confirma o ESTORNO TOTAL da Nota Fiscal ID: ${entradaId}?\n` +
        `O estoque dos produtos desta entrada será subtraído automaticamente no MySQL.`
    );
    if (!confirmar) return;

    const token = typeof obterTokenSeguro === "function" ? obterTokenSeguro() : "";
    const headers = typeof montarHeaders === "function" ? montarHeaders() : { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
        const resposta = await fetch(`/api/entradas/estornar/${entradaId}`, {
            method: "POST",
            headers: headers
        });

        if (!resposta.ok) {
            const mensagemErro = await resposta.text();
            throw new Error(mensagemErro || "Erro ao processar estorno no servidor.");
        }

        alert("🚀 Sucesso! Entrada devolvida e estoque estornado com sucesso no MySQL.");

        const select = document.getElementById('selectNotaGerencial');
        if (select) {
            select.dispatchEvent(new Event('change'));
        }

    } catch (erro) {
        console.error("Erro no estorno:", erro);
        alert("Falha ao estornar: " + erro.message);
    }
}

// 🔄 Abre a janela de seleção ao clicar no botão roxo do menu
function abrirPainelGerencial() {
    const modal = document.getElementById("modalSelecaoNotaDevolucao");
    if (modal) {
        modal.style.display = "block";
        console.log("Painel Seletivo de Notas aberto com sucesso!");
        if (typeof devolucaoEntrada === "function") {
            devolucaoEntrada();
        }
    } else {
        alert("Erro técnico: Não encontramos a div 'modalSelecaoNotaDevolucao' no HTML.");
    }
}

// ❌ Fecha a janela quando o usuário clica no botão "X"
function fecharModalDevolucao() {
    const modal = document.getElementById("modalSelecaoNotaDevolucao");
    if (modal) {
        modal.style.display = "none";
    }
}

// 🔍 BUSCA NO BANCO AS NOTAS ATIVAS (STATUS 1) E INJETA NO DROPDOWN
async function devolucaoEntrada() {
    const urlServidorAtual = window.urlServidor || "http://localhost:8080";
    const token = typeof obterTokenSeguro === "function" ? obterTokenSeguro() : "";

    const selectNota = document.getElementById("selectNotasAtivas");
    if (!selectNota) return;

    selectNota.innerHTML = '<option value="">-- Escolha uma Nota Fiscal --</option>';

    const areaItens = document.getElementById("areaItensNota");
    if (areaItens) areaItens.style.display = "none";

    try {
        const resposta = await fetch(`${urlServidorAtual}/api/entradas/ativas-resumo`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!resposta.ok) throw new Error("Erro ao carregar notas do servidor.");
        const notas = await resposta.json();

        console.log("=== DADOS DO BANCO RECEBIDOS ===", notas);

        if (notas.length === 0) {
            console.log("Nenhuma nota ativa (Status 1) encontrada no banco de dados.");
            return;
        }

        notas.forEach(nota => {
            const option = document.createElement("option");
            option.value = nota.id;

            const numNota = nota.numeroNota || nota.id || "S/N";

            let fornecedor = "Não informado";
            if (nota.nomeFornecedor) fornecedor = nota.nomeFornecedor;
            else if (nota.fornecedorNome) fornecedor = nota.fornecedorNome;
            else if (nota.fornecedor && nota.fornecedor.nome) fornecedor = nota.fornecedor.nome;
            else if (nota.fornecedor && nota.fornecedor.razaoSocial) fornecedor = nota.fornecedor.razaoSocial;

            option.text = `Nota ID: ${nota.id} (NF: ${numNota}) - Fornecedor: ${fornecedor}`;
            selectNota.appendChild(option);
        });

    } catch (erro) {
        console.error("Erro ao listar notas para o painel:", erro);
    }
}

async function buscarItensDaNotaSelecionada(idNota) {
    if (!idNota) {
        document.getElementById("areaItensNota").style.display = "none";
        return;
    }

    const token = typeof obterTokenSeguro === "function" ? obterTokenSeguro() : "";
    const tabelaItens = document.getElementById("corpoTabelaItensDevolucao");
    tabelaItens.innerHTML = "";

    try {
        // 1. Busca paralela dos itens e impostos no Spring Boot (Chama as duas APIs)
        const [respostaItens, respostaImpostos] = await Promise.all([
            fetch(`/api/entradas/${idNota}/itens`, { headers: { "Authorization": `Bearer ${token}` } }),
            fetch(`/api/entradas/${idNota}/impostos`, { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        if (!respostaItens.ok) throw new Error("Erro ao carregar itens da nota.");
        
        const data = await respostaItens.json();
        const listaDeItens = Array.isArray(data) ? data : (data.itens || []);
        const dadosImpostos = respostaImpostos.status === 200 ? await respostaImpostos.json() : {};

        if (listaDeItens.length === 0) {
            tabelaItens.innerHTML = `<tr><td colspan="2" style="text-align:center; padding:10px; color:#666;">Nenhum produto nesta nota.</td></tr>`;
            return;
        }

        // 2. 🌲 SUB-RAIZ: Laço contínuo dos produtos (Produto 1, Produto 2... listados em sequência)
        listaDeItens.forEach((item) => {
            let nomeProd = item.produtoDescricao || item.nomeProduto || item.produtoNome || "Produto sem nome";
            const quantidade = item.quantidade || item.qtd || 0;
			const precoCusto =
			    Number(item.precoCusto || 0);
            // Corta textos excessivamente longos para manter a linha limpa
            if (nomeProd.length > 80) {
                nomeProd = nomeProd.substring(0, 77) + "...";
            }

			const linhaProduto = `
			    <tr style="
			        border-bottom: 1px solid #dddddd;
			        background: #ffffff !important;
			    ">

			        <td colspan="2"
			            style="
			                padding: 8px 15px;
			                color: #333333 !important;
			                font-weight: 500;
			                text-align: left;
			                font-size: 13px;
			                background: #ffffff !important;
			            ">
			            📦 ${nomeProd}
			        </td>

			        <td style="
			            padding: 8px 15px;
			            color: #333333 !important;
			            text-align: center !important;
			            font-weight: bold;
			            background: #ffffff !important;
			        ">
			            ${quantidade}
			        </td>

			        <td style="
			            padding: 8px 10px;
			            color: #333333 !important;
			            text-align: right !important;
			            font-weight: bold;
			            background: #ffffff !important;
			        ">
			            R$ ${precoCusto.toLocaleString(
			                'pt-BR',
			                {
			                    minimumFractionDigits: 2,
			                    maximumFractionDigits: 2
			                }
			            )}
			        </td>

			    </tr>
			`;
            tabelaItens.insertAdjacentHTML('beforeend', linhaProduto);
        });

        // 3. Extração dos impostos reais da NF 1956 vindos da tabela entrada_impostos
        const icms = dadosImpostos.baseCalculoIcms || 0;
        const vIcms = dadosImpostos.valorIcms || 0;
        const frete = dadosImpostos.valorFrete || 0;
        const totalNota = dadosImpostos.valorTotalNota || 0;

        // 4. 🧮 FECHAMENTO DO LOTE: Adiciona a tarja fiscal uma única vez no final da tabela (CORRIGIDO PARA FUNDO BRANCO)
        const linhaFechamentoImpostos = `
            <tr style="background: #ffffff; border-top: 2px solid #e67e22;">
                <td colspan="4" style="padding: 12px 15px; border-left: 4px solid #e67e22; text-align: left;">
                    <div style="font-size: 12px; color: #333333; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-family: Arial, sans-serif;">
                        <div><span style="color: #e67e22;">📊</span> <b>Base ICMS:</b> R$ ${icms.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                        <div><span style="color: #e67e22;">🧾</span> <b>Valor ICMS:</b> R$ ${vIcms.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                        <div><span style="color: #e67e22;">🚚</span> <b>Valor Frete:</b> R$ ${frete.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                        <div><span style="color: #e67e22;">💰</span> <b>TOTAL DO LOTE (NF):</b> R$ ${totalNota.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                    </div>
                </td>
            </tr>
        `;
        tabelaItens.insertAdjacentHTML('beforeend', linhaFechamentoImpostos);

        document.getElementById("areaItensNota").style.display = "block";

    } catch (erro) {
        alert("Erro ao montar lote: " + erro.message);
    }
}


// ==========================================================
// 🔎 FILTRA NOTAS DE ENTRADA POR PERÍODO
// Painel de Devolução / Estorno
// ==========================================================

async function filtrarNotasDevolucao() {

    const dataInicio =
        document.getElementById("dataInicioDevolucao").value;

    const dataFim =
        document.getElementById("dataFimDevolucao").value;

    const selectNota =
        document.getElementById("selectNotasAtivas");


    if (!dataInicio || !dataFim) {

        alert(
            "Informe a Data Inicial e a Data Final."
        );

        return;
    }


    if (dataInicio > dataFim) {

        alert(
            "A Data Inicial não pode ser maior que a Data Final."
        );

        return;
    }


    const token =
        typeof obterTokenSeguro === "function"
            ? obterTokenSeguro()
            : "";


    selectNota.innerHTML =
        '<option value="">Buscando notas...</option>';


    // Esconde o lote antigo durante uma nova pesquisa
    const areaItens =
        document.getElementById("areaItensNota");

    if (areaItens) {

        areaItens.style.display = "none";

    }


    try {

        const resposta = await fetch(

            `/api/entradas/filtrar?inicio=${dataInicio}&fim=${dataFim}`,

            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }

        );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao pesquisar Notas Fiscais."
            );

        }


        const notas =
            await resposta.json();


        selectNota.innerHTML =
            '<option value="">-- Escolha uma Nota Fiscal --</option>';


        // Neste painel interessam somente notas ATIVAS
        const notasAtivas =
            notas.filter(nota =>
                nota.status == null ||
                Number(nota.status) === 1
            );


        if (notasAtivas.length === 0) {

            selectNota.innerHTML =
                '<option value="">Nenhuma nota ativa encontrada no período</option>';

            return;
        }


        notasAtivas.forEach(nota => {

            const option =
                document.createElement("option");

            option.value =
                nota.id;


            // Se o endpoint já devolver "label",
            // aproveitamos o que o Java montou.
            if (nota.label) {

                option.textContent =
                    nota.label;

            } else {

                const numeroNota =
                    nota.numeroNota ||
                    nota.id ||
                    "S/N";

                let fornecedor =
                    "Não informado";


                if (nota.nomeFornecedor) {

                    fornecedor =
                        nota.nomeFornecedor;

                } else if (nota.fornecedorNome) {

                    fornecedor =
                        nota.fornecedorNome;

                } else if (
                    nota.fornecedor &&
                    nota.fornecedor.nome
                ) {

                    fornecedor =
                        nota.fornecedor.nome;

                }


                option.textContent =
                    `Nota ID: ${nota.id} ` +
                    `(NF: ${numeroNota}) - ` +
                    `Fornecedor: ${fornecedor}`;
            }


            selectNota.appendChild(
                option
            );

        });


        console.log(
            "Notas ativas encontradas no período:",
            notasAtivas.length
        );


    } catch (erro) {

        console.error(
            "Erro ao filtrar notas para devolução:",
            erro
        );

        selectNota.innerHTML =
            '<option value="">Erro ao pesquisar notas</option>';

        alert(
            "Falha na pesquisa: " +
            erro.message
        );

    }

}




































































































































































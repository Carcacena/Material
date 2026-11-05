async function processarLoteSelecionado() {
    const selectNota = document.getElementById("selectNotasAtivas");
    if (!selectNota) {
        alert("Erro: seletor de Nota Fiscal não localizado.");
        return;
    }

    const entradaId = selectNota.value;
    if (!entradaId) {
        alert("Selecione uma Nota Fiscal para devolução.");
        return;
    }

    // 🔒 TRAVA DE SEGURANÇA: Bloqueia re-estorno de notas que já exibem o texto de devolvida
    const optionSelecionada = selectNota.options[selectNota.selectedIndex];
    if (optionSelecionada && optionSelecionada.textContent.includes("[DEVOLVIDA]")) {
        alert("🚨 Operação Recusada!\nEsta Nota Fiscal já consta como DEVOLVIDA no sistema.");
        return;
    }

    await estornarNotaViaPainel(entradaId);
}

// Garante acesso pelo onclick do HTML
window.processarLoteSelecionado = processarLoteSelecionado;

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

    const urlServidorAtual = window.urlServidor || window.location.origin;
    const headersAutenticados = typeof montarHeaders === "function" 
        ? montarHeaders() 
        : { "Content-Type": "application/json" };

    try {
        const urlEstorno = `${urlServidorAtual}/api/entradas/estornar/${entradaId}`;

        const resposta = await fetch(urlEstorno, {
            method: "POST",
            headers: headersAutenticados
        });

        if (!resposta.ok) {
            const mensagemErro = await resposta.text();
            throw new Error(mensagemErro || "Erro ao processar estorno no servidor.");
        }

        alert("🚀 Sucesso! Entrada devolvida e estoque estornado com sucesso no MySQL.");

        // Atualiza a listagem automaticamente após estornar
        if (document.getElementById("dataInicioDevolucao").value) {
            filtrarNotasDevolucao();
        } else {
            devolucaoEntrada();
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
	
		if (typeof filtrarNotasDevolucao === "function") {
		    filtrarNotasDevolucao();
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

// 🔍 Carrega o resumo inicial de notas do banco de dados
async function devolucaoEntrada() {
    const urlServidorAtual = window.urlServidor || window.location.origin;
    
    const selectNota = document.getElementById("selectNotasAtivas");
    if (!selectNota) return;
    selectNota.innerHTML = '<option value="">-- Escolha uma Nota Fiscal --</option>';

    const areaItens = document.getElementById("areaItensNota");
    if (areaItens) areaItens.style.display = "none";

    try {
        const headersAutenticados = typeof montarHeaders === "function" 
            ? montarHeaders() 
            : { "Content-Type": "application/json" };

        const resposta = await fetch(`${urlServidorAtual}/api/entradas/ativas-resumo`, {
            method: "GET",
            headers: headersAutenticados
        });

        if (!resposta.ok) throw new Error(`Erro ao carregar notas do servidor. Status: ${resposta.status}`);
        const notas = await resposta.json();

        console.log("=== DADOS DO BANCO RECEBIDOS ===", notas);

        if (notas.length === 0) {
            console.log("Nenhuma nota cadastrada encontrada no banco de dados.");
            return;
        }

		notas.forEach(nota => {

		    const option = document.createElement("option");

		    option.value = nota.id;

		    const status = Number(nota.status);

		    const textoLabel =
		        nota.label ||
		        `Nota ID: ${nota.id}`;

		    if (status === 2) {

		        option.textContent = `🔴 ${textoLabel}`;
		        option.style.color = "#e74c3c";

		    } else {

		        option.textContent = `🟢 ${textoLabel}`;
		        option.style.color = "#27ae60";
		    }

		    selectNota.appendChild(option);
		});
    } catch (erro) {
        console.error("Erro ao listar notas para o painel:", erro);
    }
}

// 🗓️ Filtra as notas por período no painel
async function filtrarNotasDevolucao() {
    const dataInicio = document.getElementById("dataInicioDevolucao").value;
    const dataFim = document.getElementById("dataFimDevolucao").value;
    const selectNota = document.getElementById("selectNotasAtivas");

    if (!dataInicio || !dataFim) {
        alert("Informe a Data Inicial e a Data Final.");
        return;
    }

    if (dataInicio > dataFim) {
        alert("A Data Inicial não pode ser maior que a Data Final.");
        return;
    }

    const urlServidorAtual = window.urlServidor || window.location.origin;
    selectNota.innerHTML = '<option value="">Buscando notas...</option>';

    const areaItens = document.getElementById("areaItensNota");
    if (areaItens) areaItens.style.display = "none";

    try {
        const headersAutenticados = typeof montarHeaders === "function" 
            ? montarHeaders() 
            : { "Content-Type": "application/json" };

        const urlCompleta = `${urlServidorAtual}/api/entradas/filtrar?inicio=${dataInicio}&fim=${dataFim}`;
        
        const resposta = await fetch(urlCompleta, {
            method: "GET",
            headers: headersAutenticados
        });

        if (!resposta.ok) {
            throw new Error(`Erro ao pesquisar Notas Fiscais. Status do servidor: ${resposta.status}`);
        }

        const notas = await resposta.json();
        selectNota.innerHTML = '<option value="">-- Escolha uma Nota Fiscal --</option>';

        if (notas.length === 0) {
            selectNota.innerHTML = '<option value="">Nenhuma nota encontrada no período</option>';
            return;
        }

		notas.forEach(nota => {
		          const option = document.createElement("option");
		          option.value = nota.id;

		          // Pega o label completo montado pelo Java ou cria o padrão do sistema
		          const textoLabel = nota.label || "";
		          const numNota = nota.numeroNota || nota.id || "S/N";
		          const fornecedor = nota.fornecedorNome || "Não informado";

		          // 🔍 ENGENHARIA REVERSA IGUAL AO BALCÃO:
		          // Se o Java mandar a propriedade status=2 OU se o texto do label contiver "Devolv"
		          const ehDevolvida = (nota.status && Number(nota.status) === 2) || 
		                              textoLabel.includes("Devolvido") || 
		                              textoLabel.includes("Devolucao") || 
		                              textoLabel.includes("Devolução");

		          if (ehDevolvida) {
		              // Se o Java já mandou o label pronto, usamos ele, senão montamos com o ícone vermelho
		              option.textContent = nota.label ? `🔴 ${nota.label}` : `🔴 [DEVOLVIDA] ID: ${nota.id} (NF: ${numNota}) - Fornecedor: ${fornecedor}`;
		              option.style.color = "#e74c3c"; // Vermelho igual ao Balcão de Vendas
		          } else {
		              option.textContent = nota.label ? `🟢 ${nota.label}` : `🟢 [FATURADO] ID: ${nota.id} (NF: ${numNota}) - Fornecedor: ${fornecedor}`;
		              option.style.color = "#27ae60"; // Verde igual ao Balcão de Vendas
		          }

		          selectNota.appendChild(option);
		      });
        console.log("Notas processadas no período filtrado:", notas.length);

    } catch (erro) {
        console.error("Erro ao filtrar notas para devolução:", erro);
        selectNota.innerHTML = '<option value="">Erro ao pesquisar notas</option>';
        alert("Falha na pesquisa: " + erro.message);
    }
}

// 📦 Traz os produtos e a tarja de impostos ao selecionar uma nota na lista
async function buscarItensDaNotaSelecionada(idNota) {
    if (!idNota) {
        document.getElementById("areaItensNota").style.display = "none";
        return;
    }

    const urlServidorAtual = window.urlServidor || window.location.origin;
    const headersAutenticados = typeof montarHeaders === "function" 
        ? montarHeaders() 
        : { "Content-Type": "application/json" };

    const tabelaItens = document.getElementById("corpoTabelaItensDevolucao");
    tabelaItens.innerHTML = "";

    try {
        const urlItens = `${urlServidorAtual}/api/entradas/${idNota}/itens`;
        const urlImpostos = `${urlServidorAtual}/api/entradas/${idNota}/impostos`;

        const [respostaItens, respostaImpostos] = await Promise.all([
            fetch(urlItens, { method: "GET", headers: headersAutenticados }),
            fetch(urlImpostos, { method: "GET", headers: headersAutenticados })
        ]);

        if (!respostaItens.ok) {
            throw new Error(`Erro ao carregar itens da nota. Status: ${respostaItens.status}`);
        }
        
        const data = await respostaItens.json();
        const listaDeItens = Array.isArray(data) ? data : (data.itens || []);
        const dadosImpostos = respostaImpostos.status === 200 ? await respostaImpostos.json() : {};

        if (listaDeItens.length === 0) {
            tabelaItens.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:10px; color:#666;">Nenhum produto nesta nota.</td></tr>`;
            return;
        }

        listaDeItens.forEach((item) => {
            let nomeProd = item.produtoDescricao || item.nomeProduto || item.produtoNome || "Produto sem nome";
            const quantidade = item.quantidade || item.qtd || 0;
            const precoCusto = Number(item.precoCusto || 0);
            
            if (nomeProd.length > 80) {
                nomeProd = nomeProd.substring(0, 77) + "...";
            }

            const linhaProduto = `
                <tr style="border-bottom: 1px solid #dddddd; background: #ffffff !important;">
                    <td colspan="2" style="padding: 8px 15px; color: #333333 !important; font-weight: 500; text-align: left; font-size: 13px; background: #ffffff !important;">
                        📦 ${nomeProd}
                    </td>
                    <td style="padding: 8px 15px; color: #333333 !important; text-align: center !important; font-weight: bold; background: #ffffff !important;">
                        ${quantidade}
                    </td>
                    <td style="padding: 8px 10px; color: #333333 !important; text-align: right !important; font-weight: bold; background: #ffffff !important;">
                        R$ ${precoCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                </tr>
            `;
            tabelaItens.insertAdjacentHTML('beforeend', linhaProduto);
        });

        const icms = dadosImpostos.baseCalculoIcms || 0;
        const vIcms = dadosImpostos.valorIcms || 0;
        const frete = dadosImpostos.valorFrete || 0;
        const totalNota = dadosImpostos.valorTotalNota || 0;

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
        console.error("Erro completo ao buscar itens/impostos:", erro);
        alert("Erro ao montar lote: " + erro.message);
    }
}


function configurarPainelDevolucaoArrastavel() {

    const painel = document.getElementById("painelDevolucao");
    const header = document.getElementById("painelDevolucaoHeader");

    if (!painel || !header) {
        return;
    }

    let posicaoXAnterior = 0;
    let posicaoYAnterior = 0;

    header.onmousedown = iniciarArrasto;

    function iniciarArrasto(evento) {

        evento.preventDefault();

        posicaoXAnterior = evento.clientX;
        posicaoYAnterior = evento.clientY;

        document.onmouseup = pararArrasto;
        document.onmousemove = arrastarPainel;
    }

    function arrastarPainel(evento) {

        evento.preventDefault();

        const deslocamentoX =
            posicaoXAnterior - evento.clientX;

        const deslocamentoY =
            posicaoYAnterior - evento.clientY;

        posicaoXAnterior = evento.clientX;
        posicaoYAnterior = evento.clientY;

        painel.style.top =
            `${painel.offsetTop - deslocamentoY}px`;

        painel.style.left =
            `${painel.offsetLeft - deslocamentoX}px`;

        painel.style.margin = "0";
        painel.style.right = "auto";
    }

    function pararArrasto() {

        document.onmouseup = null;
        document.onmousemove = null;
    }
}








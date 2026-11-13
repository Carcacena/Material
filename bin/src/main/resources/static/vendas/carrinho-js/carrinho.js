// --- 1. TOPO DO ARQUIVO: DECLARAÇÃO DA URL GLOBAL INTELIGENTE --- 
// Se o sistema estiver rodando no seu navegador local, usa localhost. 
// Se estiver rodando no Railway, ele pega a URL da nuvem automaticamente! 
if (typeof window.urlServidor === 'undefined') {
    window.urlServidor = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080"
        : window.location.origin;
}

// Vincula a função de confirmação ao escopo global de forma segura 
window.confirmarExclusao = function(numeroPedido) {
    const mensagem = `Atenção, piá!\n\nConfirma a exclusão COMPLETA do lote ${numeroPedido}?\nESTA OPÇÃO É IRREVERSÍVEL.`;
    if (confirm(mensagem)) {
        // Dispara a sua função existente passando o número do lote 
        excluirPedidoPendente(numeroPedido);
    }
};

async function pesquisaCarrinho() {
    console.log("🔍 [Filtro Avançado] Abrindo painel de tráfego por período...");
    let painelConsulta = document.getElementById("painelConsultaCarrinho");

    if (!painelConsulta) {
        painelConsulta = document.createElement("div");
        painelConsulta.id = "painelConsultaCarrinho";
        painelConsulta.style = "position: fixed; top: 12%; left: 20%; width: 60%; background: white; border: 2px solid #2c3e50; border-radius: 8px; box-shadow: 0px 4px 15px rgba(0,0,0,0.3); z-index: 9999; padding: 15px; font-family: sans-serif;";
        document.body.appendChild(painelConsulta);
    }

    painelConsulta.innerHTML = ` 
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2c3e50; padding-bottom: 8px; margin-bottom: 15px;"> 
            <h3 style="margin: 0; color: #2c3e50; display: flex; align-items: center; gap: 8px;"> <span>🛒</span> Painel Gerencial de Pedidos </h3> 
            <button onclick="document.getElementById('painelConsultaCarrinho').style.display='none'" style="background: #c0392b; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">X</button> 
        </div> 
        <!-- 🔥 ESTRUTURA BLINDADA COM ALINHAMENTO LADO A LADO --> 
        <div style="display: flex; gap: 10px; align-items: flex-end; background: #f8f9fa; padding: 12px; border-radius: 4px; margin-bottom: 15px; border: 1px solid #ddd; flex-wrap: nowrap;"> 
            <div style="width: 28%;"> 
                <label style="display: block; font-size: 11px; font-weight: bold; color: #555; margin-bottom: 4px;">Data Início:</label> 
                <input type="date" id="filtroDataInicio" style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; height: 32px; box-sizing: border-box;"> 
            </div> 
            <div style="width: 28%;"> 
                <label style="display: block; font-size: 11px; font-weight: bold; color: #555; margin-bottom: 4px;">Data Fim:</label> 
                <input type="date" id="filtroDataFim" style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; height: 32px; box-sizing: border-box;"> 
            </div> 
            <!-- BOTÃO FILTRAR --> 
            <button onclick="buscarPedidosPorPeriodo()" style="width: 22%; background: #2980b9; color: white; border: none; padding: 0 10px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px; height: 32px; box-sizing: border-box;"> 🔍 Filtrar </button> 
            <!-- BOTÃO IMPRIMIR PDF --> 
            <button id="btnImprimirRelatorioPdf" onclick="imprimirPedidoPdfAtual()" disabled style="width: 22%; background: #27ae60; color: white; border: none; padding: 0 10px; border-radius: 4px; font-weight: bold; cursor: not-allowed; opacity: 0.5; font-size: 11px; height: 32px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 3px;"> <span>🖨️</span> Imprimir PDF </button> 
        </div> 
        <!-- SEÇÃO DROPDOWN SELECTIVE --> 
        <div id="secaoDropdownPedidos" style="display: none; background: #eef2f5; padding: 12px; border-radius: 4px; margin-bottom: 15px; border-left: 4px solid #2980b9;"> 
            <label style="display: block; font-size: 12px; font-weight: bold; color: #2c3e50; margin-bottom: 6px;">Selecione o Pedido Cadastrado no Período:</label> 
            <select id="dropdownPedidosLocalizados" onchange="carregarDetalhesDoPedidoSelecionado()" style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; background: white; font-weight: bold; color: #2c3e50;"> 
                <option value="">Aguardando selection...</option> 
            </select> 
        </div> 
        <!-- TABELA DE EXIBIÇÃO DOS PRODUTOS --> 
        <div id="areaGridProdutosPesquisa" style="display: none;"> 
            <div style="margin-bottom: 10px; font-size: 12px; color: #333;" id="infoClientePedidoSelecionado"></div> 
            <div style="max-height: 180px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px;"> 
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;"> 
                    <thead> 
                        <tr style="background: #2c3e50; color: white; position: sticky; top: 0;"> 
                            <th style="padding: 6px; text-align: left;">Produto</th> 
                            <th style="padding: 6px; text-align: center;">Qtd</th> 
                            <th style="padding: 6px; text-align: right;">Preço</th> 
                            <th style="padding: 6px; text-align: right;">Subtotal</th> 
                            <th style="padding: 6px; text-align: center;">Situação (C/C)</th> 
                            <th style="padding: 6px; text-align: center;">Ação</th> 
                        </tr> 
                    </thead> 
                    <tbody id="corpoTabelaPesquisaAvancada"></tbody> 
                </table> 
            </div> 
			<div style="margin-top: 10px; text-align: right; font-size: 14px; font-weight: bold; color: #27ae60;" id="totalizadorPesquisaAvancada"></div> 
			           <div style="margin-top: 10px; text-align: right;">
			               <button id="btnConfirmarDevolucao" onclick="devolucaoCarrinho()" style="display: none; background: #8e44ad; color: white; border: none; padding: 8px 14px; border-radius: 4px; font-weight: bold; cursor: pointer;">
			                   🔄 Confirmar Devolução dos Itens Marcados
			               </button>
			           </div>
			       </div> 
			
        </div> 
    `;
    painelConsulta.style.display = "block";

    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById("filtroDataInicio").value = hoje;
    document.getElementById("filtroDataFim").value = hoje;
}

// Vinculação de escopo segura
window.pesquisaCarrinho = pesquisaCarrinho;

// ============================================================================ 
// 4. FUNÇÃO AUXILIAR: ACIONADA AO CLICAR NO BOTÃO DE IMPRESSÃO (PDF) 
// ============================================================================ 

// parte -1 
async function buscarPedidosPorPeriodo() {
    const dtInicio = document.getElementById("filtroDataInicio").value;
    const dtFim = document.getElementById("filtroDataFim").value;

    console.log(`🔍 [Quebra de Nível + Data] Agrupando pedidos entre ${dtInicio} e ${dtFim}`);

    // 🔥 CORREÇÃO: Usando a URL global inteligente definida na Parte 1
    const urlServidorAtual = window.urlServidor || "http://localhost:8080";
    let tokenSeguro = window.token || "";

    if (!tokenSeguro) {
        const tokenBruto = localStorage.getItem("token");
        if (tokenBruto) {
            try {
                const dadosToken = JSON.parse(tokenBruto);
                tokenSeguro = dadosToken.token || "";
            } catch (erro) {
                tokenSeguro = tokenBruto;
            }
        }
    }

    try {
        const selectPedidos = document.getElementById("dropdownPedidosLocalizados");
        selectPedidos.innerHTML = '<option value="">-- Selecione o Pedido Abaixo --</option>';

        const response = await fetch(
            `${urlServidorAtual}/carrinho/pesquisa/periodo?dataInicio=${dtInicio}&dataFim=${dtFim}`,
            {
                method: "GET",
                headers: { "Authorization": `Bearer ${tokenSeguro}` }
            }
        );

        if (!response.ok) {
            const mensagem = await response.text();
            console.error("Erro ao pesquisar período:", response.status, mensagem);
            alert("Não foi possível pesquisar os pedidos.");
            return;
        }

        const linesCarrinho = await response.json();
        if (!linesCarrinho || linesCarrinho.length === 0) {
            selectPedidos.innerHTML = '<option value="">Nenhum pedido no período</option>';
            document.getElementById("secaoDropdownPedidos").style.display = "block";
            document.getElementById("areaGridProdutosPesquisa").style.display = "none";
            return;
        }

        // ==================================================================== 
        // AGRUPAMENTO EM ÁRVORE COM ACUMULADOR (PADRÃO QUEBRA DE NÍVEL COBOL) 
        // ==================================================================== 
        const arvoreClientes = {};

        linesCarrinho.forEach(item => {
            const clienteNome = item.cliente?.nome || item.nomeCliente || item.nome_cliente || `Cliente Código ${item.clienteId || 1}`;
            const numPedido = item.numeroPedido || item.numero_pedido || (item.pedido && item.pedido.numero);
            if (!numPedido) return;

            // Inicializa o Cliente (Raiz) 
            if (!arvoreClientes[clienteNome]) {
                arvoreClientes[clienteNome] = [];
            }

            // Calcula o valor da linha atual (Qtd * Preço) 
            const preco = Number(item.precoPraticado || item.preco_praticado || item.preco || 0);
            const qtd = Number(item.quantidade || 0);
            const subtotalLinha = qtd * preco;

            // Tratamento e Formatação da Data vinda do MySQL (data_criacao) 
            const dataBruta = item.dataCriacao || item.data_criacao || "";
            let dataFormatada = "";
            if (dataBruta) {
                const d = new Date(dataBruta);
                if (!isNaN(d.getTime())) {
                    dataFormatada = d.toLocaleDateString('pt-BR') + " " + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                }
            }

            // Verifica se o pedido já foi adicionado para este cliente 
            const pedidoExistente = arvoreClientes[clienteNome].find(p => p.numero === numPedido);
            if (!pedidoExistente) {
                arvoreClientes[clienteNome].push({
                    numero: numPedido,
                    status: Number(item.status),
                    totalPedido: subtotalLinha,
                    data: dataFormatada || "Sem Data"
                });
            } else {
                pedidoExistente.totalPedido += subtotalLinha;
            }
        });

        // ==================================================================== 
        // INJEÇÃO HIERÁRQUICA COM DESTAQUE DE VALORES, DATAS E STATUS 
        // ==================================================================== 
        selectPedidos.innerHTML = '<option value="">-- SELECIONE UM PEDIDO --</option>';

        Object.keys(arvoreClientes).forEach(nomeCliente => {
            // 👤 Linha de Cabeçalho do Cliente (Desativada para não ser clicada) 
            const optCliente = document.createElement("option");
            optCliente.disabled = true;
            optCliente.style = "background: #2c3e50; color: white; font-weight: bold; padding: 4px;";
            optCliente.textContent = `👤 CLIENTE: ${nomeCliente.toUpperCase()}`;
            selectPedidos.appendChild(optCliente);

            // 📦 Linhas dos Pedidos Recuadas com Valores, Datas e Status Acumulados 
            arvoreClientes[nomeCliente].forEach(p => {
                const optPedido = document.createElement("option");
                optPedido.value = p.numero;

                // 🔥 PERFUMARIA BLINDADA: Filtra para não injetar HTML puro dentro da tag <option>
                let statusTxt = p.status === 1 ? "🟢 Faturado" : "🟡 Pendente";
                if (p.status === 2) statusTxt = "🔴 Devolução";

                // Formata o valor acumulado em Real (R$) sem perigo de dar undefined 
                const valorFormatado = Number(p.totalPedido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

                optPedido.textContent = ` ┗━━ Pedido: ${p.numero} | Dt: ${p.data} | ${valorFormatado} | [${statusTxt}]`;
                optPedido.style = "padding-left: 15px; font-weight: normal; color: #333;";
                selectPedidos.appendChild(optPedido);
            });
        });

        document.getElementById("secaoDropdownPedidos").style.display = "block";
        document.getElementById("areaGridProdutosPesquisa").style.display = "none";

    } catch (e) {
        console.error("Erro ao carregar período:", e);
    }
}

// 🔥 VINCULAÇÃO GLOBAL PARA FAZER O FILTRO DA PARTE 1 FUNCIONAR DE PRIMEIRA
window.buscarPedidosPorPeriodo = buscarPedidosPorPeriodo;

// parte 2


function obterTokenSeguro() {
    if (window.token) {
        return window.token;
    }
    const fontes = [
        localStorage.getItem("token"),
        localStorage.getItem("usuario")
    ];
    for (const valor of fontes) {
        if (!valor) {
            continue;
        }
        try {
            const objeto = JSON.parse(valor);
            if (objeto.token) {
                return objeto.token;
            }
        } catch (erro) {
            // Se não for JSON, pode ser o JWT puro 
            if (valor.startsWith("eyJ")) {
                return valor;
            }
        }
    }
    return "";
}

async function carregarDetalhesDoPedidoSelecionado() {
    const select = document.getElementById("dropdownPedidosLocalizados");
    const numPedido = select.value;
    const btnPrint = document.getElementById("btnImprimirRelatorioPdf");

    const resetarInterface = () => {
        document.getElementById("areaGridProdutosPesquisa").style.display = "none";
        if (btnPrint) {
            btnPrint.disabled = true;
            btnPrint.style.cursor = "not-allowed";
            btnPrint.style.opacity = "0.5";
        }
        const btnDevolucao = document.getElementById("btnConfirmarDevolucao");
        if (btnDevolucao) btnDevolucao.style.display = "none";
    };


    // PARTE 1: VALIDAÇÃO DE SEGURANÇA 
    if (!numPedido) {
        resetarInterface();
        return;
    }

    // 🔥 CORREÇÃO: Usando a URL global inteligente unificada com o Railway
    const urlServidorAtual = window.urlServidor || "http://localhost:8080";
    let tokenSeguro = obterTokenSeguro(); // Reutiliza a sua função perfeita acima

    try {
        console.log(`📦 [Dropdown Selective] Buscando dados do lote: ${numPedido}`);
        const response = await fetch(
            `${urlServidorAtual}/carrinho/pedido/${encodeURIComponent(numPedido)}`,
            {
                method: "GET",
                headers: { "Authorization": `Bearer ${tokenSeguro}` }
            }
        );

        // PARTE 2: MAPEAMENTO DO PRODUTO E INJEÇÃO NO GRID VISUAL 
        if (response.ok) {
            const itens = await response.json();
            const tbody = document.getElementById("corpoTabelaPesquisaAvancada");
            tbody.innerHTML = "";
            let totalAcumuladoLote = 0;
            let nomeCliente = "Consumidor Geral";

            if (itens && itens.length > 0) {
                const primeiro = itens[0];
                if (primeiro.cliente && primeiro.cliente.nome) {
                    nomeCliente = primeiro.cliente.nome;
                }
            }

            // Varre o lote de registros e desenha as linhas na tabela 
            // Varre o lote de registros e desenha as linhas na tabela
            const loteJaFoiDevolvido = itens.some(
                item => Number(item.status) === 2
            );

            itens.forEach((item, index) => {
                // 1. Cálculos de valores (Devem ficar obrigatoriamente dentro do loop)
                const preco = Number(item.precoPraticado || 0);
                const qtd = Number(item.quantidade || 0);
                const sub = qtd * preco;
                totalAcumuladoLote += sub;

                let acao = "";
                let ehLinhaFilhaPendente = false;
                let ehLinhaFilhaDevolucao = false;

                // --- TRATAMENTO STATUS 1: EXCLUSÃO DE LOTE PENDENTE --- 
                // --- STATUS 0: ORÇAMENTO ---
                if (Number(item.status) === 0) {

                    if (index === 0) {

                        acao = `<td rowspan="${itens.length}" style="padding: 6px; text-align: center; vertical-align: middle;">
				                    <button onclick="window.confirmarExclusao('${item.numeroPedido}')"
				                        style="background-color: #dc3545; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">
				                        Excluir Lote
				                    </button>
				                </td>`;

                    } else {

                        ehLinhaFilhaPendente = true;
                    }


                    // --- STATUS 1: FATURADO ---
                } else if (Number(item.status) === 1) {

                    if (index === 0) {

                        if (loteJaFoiDevolvido) {

                            acao = `<td rowspan="${itens.length}" style="padding: 6px; text-align: center; vertical-align: middle;">
				                        <span style="display: inline-block;
				                                     background-color: #f3e5f5;
				                                     color: #8e44ad;
				                                     border: 1px solid #9b59b6;
				                                     padding: 8px 12px;
				                                     border-radius: 4px;
				                                     font-weight: bold;">
				                            LOTE / NOTA DEVOLVIDO
				                        </span>
				                    </td>`;

                        } else {

                            acao = `<td rowspan="${itens.length}" style="padding: 6px; text-align: center; vertical-align: middle;">
				                        <button onclick="window.devolucaoCarrinhoLoteCompleto()"
				                            style="background-color: #9b59b6; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">
				                            Devolver Lote
				                        </button>
				                    </td>`;
                        }

                    } else {

                        ehLinhaFilhaDevolucao = true;
                    }

                    // --- TRATAMENTO STATUS 2: DEVOLUÇÃO DO LOTE FATURADO ---
                } else if (Number(item.status) === 1) {

                    if (index === 0) {

                        acao = `<td rowspan="${itens.length}" style="padding: 6px; text-align: center; vertical-align: middle;">
				                    <button onclick="window.devolucaoCarrinhoLoteCompleto()" style="background-color: #9b59b6; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">
				                        Devolver Lote
				                    </button>
				                </td>`;

                    } else {

                        ehLinhaFilhaDevolucao = true;
                    }
                }
                // --- TRADUÇÃO DO STATUS (Dentro do loop, usando 'item.status') --- 
                let bStatus = "";
                if (typeof traduzirStatusCarrinho === "function") {
                    bStatus = traduzirStatusCarrinho(item.status);
                }
                if (!bStatus || bStatus.includes("não identificada")) {
                    if (item.status === 1) bStatus = "🟡 Pendente";
                    else if (item.status === 2) bStatus = "🟢 Faturado";
                    else if (item.status === 3) bStatus = "🔴 Devolucao";
                    else bStatus = `Status ${item.status}`;
                }

                // 2. Criação dos elementos visuais da linha
                const nomeProd = item.produto && item.produto.nome ? item.produto.nome : "Produto sem Nome";
                const tr = document.createElement("tr");
                tr.style.borderBottom = "1px solid #eee";

                // Adiciona uma caixinha oculta (hidden) para a sua função 'devolucaoCarrinho()' ler os IDs se necessário
                const checkboxInvisivel = `<input type="checkbox" class="check-produto-devolucao" value="${item.id}" checked style="display:none;">`;

                // Monta o esqueleto da linha respeitando o design original 
                let htmlColunas = ` 
			                   <td style="padding: 6px; text-align: left; color: #333;"> 
			                       <strong>${index + 1}</strong> - ${nomeProd} ${checkboxInvisivel}
			                   </td> 
			                   <td style="padding: 6px; text-align: center; color: #333;"> ${Number(qtd).toFixed(3)} </td> 
			                   <td style="padding: 6px; text-align: right; color: #333;"> R$ ${Number(preco).toFixed(2)} </td> 
			                   <td style="padding: 6px; text-align: right; font-weight: bold; color: #27ae60;"> R$ ${sub.toFixed(2)} </td> 
			                   <td style="padding: 6px; text-align: center; color: #333;"> ${bStatus} </td> 
			               `;

                // Injeta o botão mestre correspondente e ignora as linhas filhas do rowspan
                if (!ehLinhaFilhaPendente && !ehLinhaFilhaDevolucao) {
                    htmlColunas += acao;
                }

                tr.innerHTML = htmlColunas;
                tbody.appendChild(tr);
            }); // <--- CHAVE DE FECHAMENTO DO FOREACH POSICIONADA NO LOCAL EXATO!



            document.getElementById("infoClientePedidoSelecionado").innerHTML = ` 
                <strong>Cliente do Lote:</strong> <span style="text-transform: uppercase; color: #2980b9; font-weight: bold;">${nomeCliente}</span> 
            `;



            document.getElementById("totalizadorPesquisaAvancada").textContent = `VALOR DO LOTE NO BANCO: R$ ${totalAcumuladoLote.toFixed(2)}`;

            // Faz o bloco do grid aparecer na interface 
            document.getElementById("areaGridProdutosPesquisa").style.display = "block";

            // SEÇÃO: Destrava o botão verde de Impressão 
            if (btnPrint) {
                btnPrint.disabled = false;
                btnPrint.removeAttribute("disabled");
                btnPrint.style.cursor = "pointer";
                btnPrint.style.opacity = "1";
                console.log("🟢 [Botão PDF] Botão de impressão liberado com sucesso para o operador!");
            }
        } else {
            // 🔥 CORREÇÃO: Removido termo fantasma do corretor automático
            console.error("Servidor respondeu com erro ao buscar os itens do pedido:", response.status);
            document.getElementById("areaGridProdutosPesquisa").style.display = "none";
        }
    } catch (err) {
        console.error("Erro crítico ao renderizar o select do dropdown:", err);
    }
}

// ============================================================================ 
// 5. FUNÇÃO ASSÍNCRONA DE EXCLUSÃO DO LOTE NO BANCO (MATEIRO DO BRUTO)
// ============================================================================ 
async function excluirPedidoPendente(numeroPedido) {
    try {
        const token = obterTokenSeguro();
        const urlServidorAtual = window.urlServidor || "http://localhost:8080";

        const resposta = await fetch(`${urlServidorAtual}/carrinho/pedido/${encodeURIComponent(numeroPedido)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!resposta.ok) {
            throw new Error("O servidor backend recusou a exclusão do lote.");
        }

        alert("Lote pendente removido com sucesso do MySQL!");

        // Perfumaria: Limpa o grid visual na hora
        document.getElementById("corpoTabelaPesquisaAvancada").innerHTML = "";
        document.getElementById("totalizadorPesquisaAvancada").textContent = "VALOR DO LOTE NO BANCO: R$ 0,00";

        // Recarrega o dropdown para sumir com o pedido deletado
        if (typeof buscarPedidosPorPeriodo === "function") {
            await buscarPedidosPorPeriodo();
        }

    } catch (erro) {
        console.error("Erro ao processar delete:", erro);
        alert("Falha ao excluir o pedido completo: " + erro.message);
    }
}

// 🔥 SECO GERAL: Vinculações de escopo definitivas para as telas
window.obterTokenSeguro = obterTokenSeguro;
window.carregarDetalhesDoPedidoSelecionado = carregarDetalhesDoPedidoSelecionado;
window.excluirPedidoPendente = excluirPedidoPendente;

// parte 3		

function traduzirStatusCarrinho(status) {
    switch (Number(status)) {
        case 0: return "0 - Orçamento";
        case 1: return "1 - Faturado";
        case 2: return "2 - Devolução";
        default: return "Situação não identificada";
    }
}

// --- 2. CONFIGURAÇÃO DA URL GLOBAL INTELIGENTE --- 
// Detecta automaticamente se está no Fedora (localhost) ou na nuvem (Railway)
if (typeof window.urlServidor === 'undefined') {
    window.urlServidor = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080"
        : window.location.origin;
}

// --- 3. VINCULAÇÃO GLOBAL DO BOTÃO DO GRID VISUAL ---
window.confirmarExclusao = function(numeroPedido) {
    // Envia o comando direto para a função assíncrona que apaga o lote completo
    excluirPedidoPendenteCompleto(numeroPedido);
};

// --- 4. FUNÇÃO ASSÍNCRONA DE EXCLUSÃO COMPLETA DO LOTE NO BANCO ---
async function excluirPedidoPendenteCompleto(numeroPedido) {
    // Alerta irreversível com a confirmação Sim/Não (confirm) padrão do caixa
    const mensagem = `Atenção, piá!\n\nConfirma a exclusão COMPLETA do lote ${numeroPedido}?\nESTA OPÇÃO É IRREVERSÍVEL E VAI REMOVER OS PRODUTOS DA LISTA.`;
    const confirmar = confirm(mensagem);

    if (!confirmar) {
        console.log("Exclusão do lote cancelada pelo operador.");
        return;
    }

    try {
        const token = obterTokenSeguro();
        const urlServidorAtual = window.urlServidor;

        console.log(`🔥 [Delete Massa] Executando deleção no MySQL para o lote: ${numeroPedido}`);

        // Envia o Número do Pedido para o Spring Boot limpar todas as linhas de uma vez no MySQL 
        const resposta = await fetch(`${urlServidorAtual}/carrinho/pedido/${encodeURIComponent(numeroPedido)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!resposta.ok) {
            throw new Error("Erro ao remover o lote do banco de dados.");
        }

        alert("Lote pendente removido com sucesso!");

        // 4. PERFUMARIA: Limpa a tela inteira em nanossegundos para o piá ver o resultado 
        // Limpa as linhas dos produtos no grid correto que montamos na Parte 3
        const tbodyPesquisa = document.getElementById("corpoTabelaPesquisaAvancada");
        if (tbodyPesquisa) tbodyPesquisa.innerHTML = "";

        // Zera o totalizador verde do modal
        const totalizador = document.getElementById("totalizadorPesquisaAvancada");
        if (totalizador) totalizador.textContent = "VALOR DO LOTE NO BANCO: R$ 0,00";

        // Oculta o grid de produtos já que o lote deixou de existir
        const areaGrid = document.getElementById("areaGridProdutosPesquisa");
        if (areaGrid) areaGrid.style.display = "none";

        // Atualiza a lista suspensa (dropdown) para sumir com o pedido excluído de lá 
        if (typeof buscarPedidosPorPeriodo === "function") {
            await buscarPedidosPorPeriodo();
        }

    } catch (erro) {
        console.error("Erro crítico na deleção:", erro);
        alert("Falha ao excluir o lote: " + erro.message);
    }
}



// Registro final das funções no escopo global para o navegador não dar 'undefined'
window.traduzirStatusCarrinho = traduzirStatusCarrinho;
window.excluirPedidoPendenteCompleto = excluirPedidoPendenteCompleto;

// Função ponte que o botão unificado 'Devolver Lote' vai chamar na tela
window.devolucaoCarrinhoLoteCompleto = function() {
    // Como injetamos todos os checkboxes marcados e invisíveis na tabela,
    // a sua função original vai ler todos de uma vez e processar o lote fechado!
    if (typeof devolucaoCarrinho === "function") {
        devolucaoCarrinho();
    } else {
        alert("Erro: O arquivo devolucao.js não foi carregado na página vendas.html");
    }
};
// Corrigido o nome para manter consistência com as chamadas nativas do seu menu
function fecharModalImpostos() {
    const modal = document.getElementById("modalImpostos");
    if (modal) modal.style.display = "none";
}


function salvarImpostos() {
    calcularTotalNota();

    const total = document.getElementById("valorTotalNota").value;

    alert("✅ Valores aplicados na tela temporariamente! Total da Nota: R$ " + total);

    fecharModalImpostos();

    if (typeof window.abrirFormaPagamento === "function") {
        window.abrirFormaPagamento();
    }
}




function atualizarTotalProdutosDoModal() {
    let somaTotalProdutos = 0;
    itensNota.forEach(item => {
        somaTotalProdutos += (item.quantidade * item.precoCusto);
    });

    const campoProdutos = document.getElementById("valorTotalProdutos");
    if (campoProdutos) {
        campoProdutos.value = somaTotalProdutos.toFixed(2);
    }

    const txtTotalGeral = document.getElementById("txtTotalNotaGeral");
    if (txtTotalGeral) {
        txtTotalGeral.innerText = somaTotalProdutos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    calcularTotalNota();
}

function calcularTotalNota() {
    const pegarFloat = (id) => {
        const el = document.getElementById(id);
        return el ? (parseFloat(el.value) || 0) : 0;
    };

    const produtos = pegarFloat("valorTotalProdutos");
    const frete = pegarFloat("valorFrete");
    const seguro = pegarFloat("valorSeguro");
    const ipi = pegarFloat("valorIpi");
    const outrasDespesas = pegarFloat("outrasDespesasAcessorias");
    const desconto = pegarFloat("valorDesconto");

    const valorCalculado = (produtos + frete + seguro + ipi + outrasDespesas) - desconto;

    const campoTotalNota = document.getElementById("valorTotalNota");
    if (campoTotalNota) {
        campoTotalNota.value = valorCalculado.toFixed(2);
    }
}

// Lógica nativa para tornar elementos arrastáveis
function dragElement(elmnt) {
    if (!elmnt) return;
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = document.getElementById(elmnt.id + "Header");
    if (header) {
        header.onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// ----------------------------------------------------
// ⚙️ CONTROLE DO MENU FLUTUANTE DE AÇÕES
// ----------------------------------------------------
function toggleMenuNota() {
    const menu = document.getElementById("menuFlutuanteNota");
    if (!menu) return;

    if (menu.style.display === "block") {
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }
}

// Fecha o menu flutuante caso o usuário clique fora dele
window.addEventListener("click", function(event) {
    const menu = document.getElementById("menuFlutuanteNota");
    const botao = document.getElementById("botaoMenuNota");
    if (menu && botao && menu.style.display === "block") {
        if (!menu.contains(event.target) && !botao.contains(event.target)) {
            menu.style.display = "none";
        }
    }
});

// ----------------------------------------------------
// 🔎 CONTROLE DO PAINEL GERENCIAL (ABRIR / FECHAR)
// ----------------------------------------------------
function togglePainelGerencial() {
    const painel = document.getElementById("modalPainelGerencial");
    if (!painel) return;

    painel.style.display = "block";
    fecharMenuNotaSeAberto();
}

function fecharPainelGerencialFlutuante() {
    const painel = document.getElementById("modalPainelGerencial");
    if (painel) painel.style.display = "none";
}

function fecharMenuNotaSeAberto() {
    const menu = document.getElementById("menuFlutuanteNota");
    if (menu) menu.style.display = "none";
}

// ----------------------------------------------------
// 💾 INTEGRAÇÕES DO BACKEND / OPERAÇÕES DA TELA
// ----------------------------------------------------
function filtrarNotas(event) {
    if (event) event.preventDefault();
    const dataInicio = document.getElementById("filtroDataInicio").value;
    const dataFim = document.getElementById("filtroDataFim").value;

    console.log(`Filtrando notas no período de ${dataInicio} até ${dataFim}`);
    const detalhes = document.getElementById("detalhesNotaGerencial");
    if (detalhes) detalhes.style.display = "block";
}

function salvarEntrada() {
    if (itensNota.length === 0) {
        alert("❌ Erro: Não é possível salvar uma nota sem nenhum produto inserido!");
        return;
    }

    const dadosNota = {
        numero: document.getElementById("numeroNota").value,
        serie: document.getElementById("serie").value,
        chave: document.getElementById("chaveAcesso").value,
        fornecedorId: document.getElementById("fornecedorId").value,
        dataRecebimento: document.getElementById("dataRecebimento").value,
        itens: itensNota
    };

    console.log("Enviando dados da nota ao servidor...", dadosNota);
}

// 🔥 PROTEÇÃO CONTRA ELEMENTOS NULOS (Adicionado para corrigir o erro)
// Executa a ativação do arrastar apenas depois que a tela HTM foi totalmente carregada
document.addEventListener("DOMContentLoaded", function() {
    const modalImpostos = document.getElementById("modalImpostos");
    const modalGerencial = document.getElementById("modalPainelGerencial");

    if (modalImpostos) dragElement(modalImpostos);
    if (modalGerencial) dragElement(modalGerencial);
});



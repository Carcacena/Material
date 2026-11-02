
// =========================================================================
// ⚡ CONEXÃO DO MOTOR DO BALCÃO: INTERCEPTORES E GRAVAÇÃO DE FLUXO RÁPIDO
// =========================================================================

// --- 1. TOPO DO ARQUIVO: DECLARAÇÃO DO BUFFER LOCAL E VARIÁVEIS GLOBAIS ---
if (typeof window.API_URL === 'undefined') {
    window.API_URL = "http://localhost:8080";
}

// Inicia o cupom na memória
window.itensCupomMemoria = [];

// Gera o número do primeiro pedido ao abrir a Mesa
window.numeroPedidoAtual = `PED-${Date.now()}`;

// --- 2. O RECEPTOR DO BOTÃO MOVER (ÁRVORE CENTRAL) ---
// Modificado para NÃO fazer fetch. Ele apenas joga o item no array local e desenha na tela.
async function adicionarProdutoAoCupom(
    id,
    nome,
    quantidade,
    precoVenda,
    precoCusto
) {

    console.log(
        `➡ Adicionando ao cupom local | Produto ID: ${id} | Qtd: ${quantidade}`
    );

    const idLimpo = Number(id);
    const qtdeLimpa = Number(quantidade);
    const precoLimpo = Number(precoVenda);

    if (!Number.isFinite(idLimpo) || idLimpo <= 0) {
        alert("Produto inválido.");
        return;
    }

    if (!Number.isFinite(qtdeLimpa) || qtdeLimpa <= 0) {
        alert("Quantidade inválida.");
        return;
    }

    /*
     * Número provisório apenas na memória.
     * NÃO existe nada no MySQL neste momento.
     */
    if (!window.numeroPedidoAtual) {
        window.numeroPedidoAtual = `PED-${Date.now()}`;
    }

    const itemExistente =
        window.itensCupomMemoria.find(
            item => Number(item.produtoId) === idLimpo
        );

    if (itemExistente) {

        itemExistente.quantidade += qtdeLimpa;

        itemExistente.subtotal =
            itemExistente.quantidade *
            itemExistente.precoPraticado;

    } else {

        window.itensCupomMemoria.push({
            produtoId: idLimpo,
            nome: nome || "Produto",
            quantidade: qtdeLimpa,
            precoPraticado: precoLimpo,
            precoCusto: Number(precoCusto || 0),
            subtotal: qtdeLimpa * precoLimpo
        });
    }

	produtoSelecionadoId = null;

	console.log(
	    "🧠 CUPOM SOMENTE NA MEMÓRIA:",
	    window.itensCupomMemoria
	);

	renderizarCupomDaMemoria();

   
}


// 🔍 CARREGA O CARRINHO PENDENTE DO MYSQL VIA REPOSITÓRIO/SERVICE
async function carregarCarrinhoDoBanco(numeroPedido) {
    // 1. Pega a URL de contingência do navegador
    const urlServidor = window.API_URL || (typeof API_URL !== 'undefined' ? API_URL : "http://localhost:8080");
    const tokenSeguro = window.token || (typeof token !== 'undefined' ? token : "");

    // 2. Garante o número estável da memória do payload enviado
    const pedidoAtivo = numeroPedido || window.numeroPedidoAtual;

    if (!pedidoAtivo) {
        console.warn("Nenhum número de pedido ativo para listar.");
        return;
    }

    console.log("🔍 BUSCANDO ITENS DO PEDIDO NO MYSQL:", pedidoAtivo);

    try {
        // 3. ROTA CORRETA: Bate no endpoint novo do Spring Boot por número do pedido
        const response = await fetch(`${urlServidor}/pedido/${pedidoAtivo}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${tokenSeguro}`
            }
        });

        if (response.ok) {
            const itensSalvos = await response.json();
            console.log("📦 ITENS RETORNADOS DO BANCO:", itensSalvos);

            // Ajustado para bater exatamente com os IDs da sua tabela da direita no HTML
            const tbody = document.getElementById("corpoTabelaItens") || document.getElementById("corpoTabelaCupom");
            const divVazia = document.querySelector(".Mesa-vazia-aguardando-itens") || document.getElementById("tabelaItensVazia");
            const labelStatus = document.getElementById("labelStatusCarrinho");

            if (!tbody) return;
            tbody.innerHTML = "";
            let totalAcumuladoCupom = 0;

            if (!itensSalvos || itensSalvos.length === 0) {
                if (divVazia) divVazia.style.display = "block";
                if (labelStatus) {
                    labelStatus.textContent = "SEM PEDIDO";
                    labelStatus.className = "status-badge bg-secondary text-white";
                }
            } else {
                if (divVazia) divVazia.style.display = "none";
                if (labelStatus) {
                    labelStatus.textContent = "1 - EM ANDAMENTO";
                    labelStatus.className = "status-badge status-andamento";
                }

                // Varre a lista do MySQL e desenha na tela instantaneamente
                itensSalvos.forEach((item, index) => {
                    const preco = item.precoPraticado || item.preco_praticado || 0;
                    const subtotal = item.quantidade * preco;
                    totalAcumuladoCupom += subtotal;

                    // Mapeamento seguro das chaves relacionais da Entity do Java
                    const nomeProduto = item.produto && item.produto.nome ? item.produto.nome : (item.nome || 'Produto');
                    const nomeCliente = item.produto && item.produto.Cliente && item.produto.Cliente.nome ? item.produto.Cliente.nome : 'S/M';

                    const tr = document.createElement("tr");
                    tr.className = "item-linha";
                    tr.innerHTML = `
                        <td><strong>${index + 1}</strong> - ${nomeProduto} (${nomeCliente})</td>
                        <td class="text-center">${item.quantidade}</td>
                        <td class="text-end text-success fw-bold">R$ ${subtotal.toFixed(2)}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            // Alimenta a memória global do F10 e sincroniza os dois visores da interface
            window.totalAcumuladoCupom = totalAcumuladoCupom;

            const lblTotalVenda = document.getElementById("labelTotalVenda");
            if (lblTotalVenda) lblTotalVenda.textContent = `R$ ${totalAcumuladoCupom.toFixed(2).replace('.', ',')}`;

            const totalGeralCupom = document.getElementById("totalGeralCupom");
            if (totalGeralCupom) totalGeralCupom.textContent = totalAcumuladoCupom.toFixed(2);
        }
    } catch (e) {
        console.error("Erro ao carregar carrinho do banco:", e);
    }
}

async function carregarCarrinhoDoBanco() {
    renderizarCupomDaMemoria();
}


// 🛒 CONVERSA COM O SPRING BOOT: Salva o item da mesa direto na tabela do banco
async function adicionarItemNaLista() {
    const clienteId = 1;
    const quantidade = parseFloat(document.getElementById("inputQuantidade").value) || 0;

    if (!produtoSelecionadoId) {
        alert("Clique em uma variação de produto na árvore central primeiro!");
        return;
    }
    if (quantidade <= 0) {
        alert("Digite uma quantidade válida!");
        return;
    }
    if (!window.numeroPedidoAtual) {
        window.numeroPedidoAtual = `PED-${Date.now()}`;
    }

    const itemPayload = {
        cliente: { id: 1 },
        produto: { id: produtoSelecionadoId },
        quantidade: quantidade,
        precoPraticado: precoPraticadoVenda,

        status: 1,

        numeroPedido: window.numeroPedidoAtual,
        numero_pedido: window.numeroPedidoAtual
    };

    console.log("PAYLOAD ENVIADO AO CARRINHO:", itemPayload);

    try {

        console.log("PAYLOAD CARRINHO:", itemPayload);

        const response = await fetch(`${API_URL}/carrinho`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(itemPayload)
        });

        if (response.ok) {
            // Limpa as seleções temporárias para deixar o caixa pronto para o próximo item
            produtoSelecionadoId = null;
            document.getElementById("inputQuantidade").value = "1";
            document.querySelectorAll(".produto-item").forEach(item => item.classList.remove("selecionado"));

            // 🔥 AQUI ESTÁ A CORREÇÃO: Passa o mesmo número que foi salvo no MySQL para a listagem puxar na hora!
            carregarCarrinhoDoBanco(window.numeroPedidoAtual);

        } else {


            const respostaErro = await response.text();
            console.error("STATUS HTTP:", response.status);
            console.error("RESPOSTA DO BACKEND:", respostaErro);
            alert(
                `Erro ao salvar item no carrinho.\n\n` +
                `Status: ${response.status}\n` +
                `Resposta: ${respostaErro || "Sem detalhes do backend."}`
            );
        }
    } catch (erro) {
        console.error("Erro de comunicação com o servidor:", erro);
        alert("Não foi possível comunicar com o servidor.");
    }
}

// LÓGICA COMPLEMENTAR PARA ATUALIZAÇÃO EM LOTE NA MEMÓRIA LOCAL
function adicionarProdutoAoCupomReal(id, nome, preco, quantidade) {
    if (typeof carrinho === 'undefined') {
        window.carrinho = [];
    }
    const itemExistente = carrinho.find(item => item.produtoId === id);
    if (itemExistente) {
        itemExistente.quantidade += quantidade;
        itemExistente.subtotal = itemExistente.quantidade * preco;
    } else {
        carrinho.push({
            produtoId: id,
            nome: nome,
            precoUnitario: preco,
            quantidade: quantity = quantidade,
            subtotal: preco * quantidade
        });
    }
    if (typeof atualizarInterfaceCupom === "function") {
        atualizarInterfaceCupom();
    }
    atualisBadgeContadorCaixa();
}

function renderizarCupomDaMemoria() {
    const tbody = document.getElementById("corpoTabelaItens") || document.getElementById("corpoTabelaCupom");
    const divVazia = document.querySelector(".Mesa-vazia-aguardando-itens") || document.getElementById("tabelaItensVazia");
    const labelStatus = document.getElementById("labelStatusCarrinho");

    if (!tbody) return;
    tbody.innerHTML = "";
    let totalAcumuladoCupom = 0;

    if (window.itensCupomMemoria.length === 0) {
        if (divVazia) divVazia.style.display = "block";
        if (labelStatus) {
            labelStatus.textContent = "SEM PEDIDO";
            labelStatus.className = "status-badge bg-secondary text-white";
        }
    } else {
        if (divVazia) divVazia.style.display = "none";
        if (labelStatus) {
            labelStatus.textContent = "1 - EM ANDAMENTO";
            labelStatus.className = "status-badge status-andamento";
        }

        // Varre o array da memória e desenha as linhas no HTML na hora
        window.itensCupomMemoria.forEach((item, index) => {
            totalAcumuladoCupom += item.subtotal;

            const tr = document.createElement("tr");
            tr.className = "item-linha";
            tr.innerHTML = `
                <td><strong>${index + 1}</strong> - ${item.nome}</td>
                <td class="text-center">${item.quantidade}</td>
                <td class="text-end text-success fw-bold">R$ ${item.subtotal.toFixed(2)}</td>
                <td class="text-center">
                    <button onclick="removerItemDoCupomLocal(${index})" class="btn" style="background: #c0392b; color: white; font-size: 10px; padding: 2px 6px; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">X</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Sincroniza os totais e visores da tela
    window.totalAcumuladoCupom = totalAcumuladoCupom;
    const lblTotalVenda = document.getElementById("labelTotalVenda");
    if (lblTotalVenda) lblTotalVenda.textContent = `R$ ${totalAcumuladoCupom.toFixed(2).replace('.', ',')}`;
    const totalGeralCupom = document.getElementById("totalGeralCupom");
    if (totalGeralCupom) totalGeralCupom.textContent = totalAcumuladoCupom.toFixed(2);
}

function removerItemDoCupomLocal(index) {
    window.itensCupomMemoria.splice(index, 1);
    renderizarCupomDaMemoria();
}

function atualisBadgeContadorCaixa() {
    if (typeof carrinho !== 'undefined') {
        const totalPecas = carrinho.reduce((acumulador, item) => acumulador + item.quantidade, 0);
        const badge = document.querySelector('.contador-catalogo span') || document.getElementById('contador-itens');
        if (badge) {
            badge.textContent = totalPecas;
        }
    }
}
async function deixarPedidoPendente() {
    if (
        !window.itensCupomMemoria ||
        window.itensCupomMemoria.length === 0
    ) {
        alert("Não existe pedido em andamento.");
        return;
    }

    const numeroPedido = window.numeroPedidoAtual;

    if (!numeroPedido) {
        alert("Número do pedido não foi gerado.");
        return;
    }

    if (!confirm(
        `Deseja deixar o pedido ${numeroPedido} pendente?`
    )) {
        return;
    }

    // O pedido já está gravado no MySQL com status 1.
    // Não baixa estoque e não grava novamente.

    window.itensCupomMemoria = [];

    if (typeof renderizarCupomDaMemoria === "function") {
        renderizarCupomDaMemoria();
    }

    const inputQuantidade =
        document.getElementById("inputQuantidade");

    if (inputQuantidade) {
        inputQuantidade.value = "1";
    }

    const labelStatus =
        document.getElementById("labelStatusCarrinho");

    if (labelStatus) {
        labelStatus.textContent = "1 - Pendente";
        labelStatus.className =
            "status-badge bg-warning text-dark";
    }

    alert(`Pedido ${numeroPedido} mantido pendente no MySQL.`);

    window.numeroPedidoAtual = `PED-${Date.now()}`;
}


window.abrirModalImpostos = function() {
    console.log("👉 [modulo-fechamento.js] Capturando valores da emissão da nota...");
    let modal = document.getElementById("modalImpostos");

    // Lógica interna para injetar a inteligência fiscal baseada na Origem Ativa
    const preencherDadosFiscaisConstrucao = () => {
        let valorProdutosAtual = 0;

        // Calcula o valor total direto da memória ativa do carrinho
        if (window.itensCupomMemoria && window.itensCupomMemoria.length > 0) {
            valorProdutosAtual = window.itensCupomMemoria.reduce((soma, item) => {
                const quantidade = Number(item.quantidade || 0);
                const preco = Number(item.precoPraticado || 0);
                return soma + (quantidade * preco);
            }, 0);
            console.log("💰 Valor calculado direto da memória do carrinho: R$ " + valorProdutosAtual);
        } else {
            const displayGeralVerde = document.querySelector("[style*='color: rgb(0, 255, 0)'], [style*='color: #00ff00'], .total-geral")
                || document.getElementById("totalGeralPedidoDisplay");

            if (displayGeralVerde) {
                const textoLimpo = displayGeralVerde.textContent.replace("R$", "").replace(/\s/g, "").replace(".", "").replace(",", ".");
                valorProdutosAtual = parseFloat(textoLimpo) || 0;
            }
        }

        const inputProdutos = document.getElementById("valorTotalProdutos");
        const inputBaseIcms = document.getElementById("baseCalculoIcms");
        const inputAliquotaIcms = document.getElementById("aliquotaIcms");

        if (inputProdutos) inputProdutos.value = valorProdutosAtual.toFixed(2);
        if (inputBaseIcms) inputBaseIcms.value = valorProdutosAtual.toFixed(2);

        // 📌 REGRA DA MATRIZ DINÂMICA: Sincronizada com o fluxo de atendimento de balcão
        if (inputAliquotaIcms) {
            // Busca a UF da matriz salva no banco de dados (Ex: SP ou RS)
            const ufMatriz = window.ufOrigemSistemaInstalado || "PR";

            // 🌟 EXTENSÃO DE BALCÃO: Tenta ler qual estado o operador escolheu entregar na janelinha.
            // Se o campo ainda não existir na tela, ele usa o seu fluxo de segurança original.
            const selectUfSimulacao = document.getElementById("ufDestinoSimulacao");
            const selectClienteModal = document.getElementById("selectClienteModal");
            let ufCliente = "PR"; // Padrão inicial

            if (selectUfSimulacao) {
                ufCliente = selectUfSimulacao.value; // Pega o estado que o vendedor marcou para entrega na mesa
            } else if (window.clienteAtualPedido && window.clienteAtualPedido.uf) {
                ufCliente = window.clienteAtualPedido.uf;
                []
            } else if (selectClienteModal) {
                const opcaoSelecionada = selectClienteModal.options[selectClienteModal.selectedIndex];
                if (opcaoSelecionada && opcaoSelecionada.getAttribute("data-uf")) {
                    ufCliente = opcaoSelecionada.getAttribute("data-uf");
                }
            }

            console.log(`🔍 [Auditoria Fiscal] UF Origem (Banco): ${ufMatriz} | UF Destino (Balcão): ${ufCliente}`);

            // Executa a validação cruzada interestadual
            if (ufMatriz === ufCliente) {
                console.log(`🎯 Venda Interna (${ufMatriz} -> ${ufCliente}). Aplicando alíquota estadual de 19%`);
                inputAliquotaIcms.value = "19.0";
            } else {
                console.log(`✈️ Venda Interestadual (${ufMatriz} -> ${ufCliente}). Aplicando partilha interestadual de 12%`);
                inputAliquotaIcms.value = "12.0"; // 🎯 Garante os 12% se os estados divergirem!
            }
        }

        // Executa os cálculos matemáticos automáticos na abertura
        if (typeof window.calcularImpostoPorAliquota === "function") window.calcularImpostoPorAliquota();
        if (typeof window.calcularTotalNota === "function") window.calcularTotalNota();
    }; // Fechamento limpo do preencherDadosFiscaisConstrucao

    // Ciclo de carregamento dinâmico assíncrono do componente
    if (!modal) {
        console.log("📦 Primeira abertura. Injetando impostos.html na Mesa de Negociação...");
        carregarComponente("container-impostos", "/vendas/impostos.html")
            .then(() => {
                modal = document.getElementById("modalImpostos");
                if (modal) {
                    modal.style.display = "block";
                    preencherDadosFiscaisConstrucao();

                    // 🌟 GATILHO CORRETO: Só carrega os clientes do banco após o HTML existir na árvore do DOM
                    if (typeof window.carregarClientesNoModalImpostos === "function") {
                        window.carregarClientesNoModalImpostos();
                        window.carregarTransportadorasPDV();
                    }


                    if (typeof window.configurarImpostosArrastavel === "function") window.configurarImpostosArrastavel();

                }
            })
            .catch(erro => console.error("❌ Erro ao renderizar modal de encargos:", erro));
    } else {
        modal.style.display = "block";
        preencherDadosFiscaisConstrucao();

        // 🌟 ATUALIZAÇÃO AUTOMÁTICA: Recarrega a lista para capturar novos clientes salvos em localhost
        if (typeof window.carregarClientesNoModalImpostos === "function") {
            window.carregarClientesNoModalImpostos();
        }
        if (typeof window.carregarTransportadorasPDV === "function") {
            window.carregarTransportadorasPDV();
        }


        if (typeof window.configurarImpostosArrastavel === "function") window.configurarImpostosArrastavel();
    }
}; // 🌟 Fechamen

// =========================================================================
// 🔄 FUNÇÃO: Sincroniza Cliente e Calcula Alíquota Dinâmica (12% / 19%)
// =========================================================================
window.vincularClienteEDefinirAliquota = function() {
    console.log("👉 [modulo-fechamento.js] Executando auditoria de alíquota...");

    const selectCliente = document.getElementById("selectClienteModalImpostos");
    const inputAliquota = document.getElementById("aliquotaIcms");

    if (!selectCliente || !inputAliquota) return;

    const opcaoSelecionada = selectCliente.options[selectCliente.selectedIndex];
    if (!opcaoSelecionada || selectCliente.value === "") return;

    // Recupera a UF de Origem identificada pelo banco (Ex: SP ou PR)
    const ufMatriz = window.ufOrigemSistemaInstalado || "PR";

    // Extrai a UF do Cliente do atributo ou do texto entre parênteses
    let ufCliente = opcaoSelecionada.getAttribute("data-uf") || "PR";
    if (!opcaoSelecionada.getAttribute("data-uf")) {
        const match = opcaoSelecionada.text.match(/\(([^)]+)\)/);
        if (match) ufCliente = match[1].toUpperCase();
    }

    // 🌟 REGRA DINÂMICA CRUCIAL: Se Origem for PR e Cliente for SP -> Crava 12.0%
    if (ufMatriz === ufCliente) {
        console.log(`🎯 Venda Interna (${ufMatriz} -> ${ufCliente}). Alíquota: 19%`);
        inputAliquota.value = "19.0";
    } else {
        console.log(`✈️ Venda Interestadual (${ufMatriz} -> ${ufCliente}). Alíquota: 12%`);
        inputAliquota.value = "12.0";
    }

    if (typeof window.calcularImpostoPorAliquota === "function") {
        window.calcularImpostoPorAliquota();
    }
};

// =========================================================================
// 🧮 FUNÇÃO: Abertura Visual Segura do Painel de Fechamento (F10)
// =========================================================================
async function abrirPainelFechamento() {
    console.log("👉 [modulo-fechamento.js] Abrindo painel de faturamento...");

    if (!window.itensCupomMemoria || window.itensCupomMemoria.length === 0) {
        alert("O carrinho está vazio!");
        return;
    }
	console.log("🔥 TESTE NOVO F10 - LINHA ALTERADA");

	if (typeof window.abrirModalImpostos === "function") {
	    window.abrirModalImpostos();
	    return;
}
    // Ignora erros de elemento não encontrado no script de terceiros
    if (typeof carregarClientesPDV === "function") {
        try { await carregarClientesPDV(); } catch (e) {}
    }

    window.vincularClienteEDefinirAliquota();

    const totalCupom = window.itensCupomMemoria.reduce((soma, item) => {
        return soma + (Number(item.quantidade || 0) * Number(item.precoPraticado || 0));
    }, 0);

    const totalModal = document.getElementById("totalModalDisplay");
    if (totalModal) totalModal.textContent = `R$ ${totalCupom.toFixed(2).replace(".", ",")}`;

    // 🌟 ENGENHARIA VISUAL FALLBACK: Abre o modal sem estourar o erro de "bootstrap is not defined"
    const modalElemento = document.getElementById("modalFecharPedido");
    if (modalElemento) {
        modalElemento.classList.add("show");
        modalElemento.style.setProperty("display", "block", "important");
        modalElemento.style.background = "rgba(0,0,0,0.6)";

        const botoesFechar = modalElemento.querySelectorAll("[data-bs-dismiss='modal'], .btn-secondary, .btn-close");
        botoesFechar.forEach(btn => {
            btn.onclick = () => {
                modalElemento.style.setProperty("display", "none", "important");
                modalElemento.classList.remove("show");
            };
        });
    }
}
window.abrirPainelFechamento = abrirPainelFechamento;


async function confirmarFaturamentoDefinitivo() {

    console.log("🚀 Iniciando processo de faturamento definitivo...");

    if (!window.itensCupomMemoria || window.itensCupomMemoria.length === 0) {
        alert("O carrinho está vazio.");
        return;
    }

    const selectCliente =
        document.getElementById("selectClienteModalImpostos")
        || document.getElementById("selectClienteModal");

    const selectPagamento =
        document.getElementById("selectPagamentoModal");

    const clienteId =
        Number(selectCliente?.value || 0);

    const idFinalCliente =
        clienteId || (window.clienteAtualPedido?.id) || 1;

    const formaPagamento =
        selectPagamento?.value || "DINHEIRO";

    const numeroPedido =
        window.numeroPedidoAtual;

    if (!numeroPedido) {
        alert("❌ Erro Crítico: Número do pedido não foi gerado pelo sistema.");
        return;
    }

    const numeroNotaFiscal =
        Number(window.proximaNotaFiscalPrevista);

    const serie =
        window.serieFiscalAtual;

    try {

        const urlBase =
            typeof API_URL !== "undefined"
                ? API_URL
                : "";

        const tokenSeguro =
            typeof token !== "undefined"
                ? token
                : (
                    typeof window.obterTokenSeguro === "function"
                        ? window.obterTokenSeguro()
                        : ""
                  );

        console.log("💾 Gravando itens do cupom no MySQL...");

        const carrinhosGravados = [];

        for (const item of window.itensCupomMemoria) {

            const payloadCarrinho = {

                numeroPedido: numeroPedido,

                cliente: {
                    id: Number(idFinalCliente)
                },

                produto: {
                    id: Number(item.produtoId)
                },

                quantidade: Number(item.quantidade),

                precoPraticado: Number(item.precoPraticado),

                status: 0
            };

            console.log(
                "📤 Gravando item do carrinho:",
                payloadCarrinho
            );

            const respostaCarrinho =
                await fetch(`${urlBase}/carrinho`, {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenSeguro}`
                    },

                    body: JSON.stringify(payloadCarrinho)
                });

            if (!respostaCarrinho.ok) {

                const erroCarrinho =
                    await respostaCarrinho.text();

                throw new Error(
                    `Falha ao gravar item do carrinho. ` +
                    `Status: ${respostaCarrinho.status} - ${erroCarrinho}`
                );
            }

            const itemSalvo =
                await respostaCarrinho.json();

            console.log(
                "✅ Item criado no MySQL:",
                itemSalvo
            );

            carrinhosGravados.push(itemSalvo);
        }

        if (carrinhosGravados.length === 0) {
            throw new Error(
                "Nenhum item do carrinho foi criado no MySQL."
            );
        }

        const idDoCarrinhoNoMysql =
            Number(carrinhosGravados[0].id);

        if (
            !Number.isFinite(idDoCarrinhoNoMysql) ||
            idDoCarrinhoNoMysql <= 0
        ) {
            throw new Error(
                "ID do carrinho retornado pelo MySQL é inválido."
            );
        }

        window.carrinhoIdAtivo =
            idDoCarrinhoNoMysql;

        console.log(
            "🔑 ID REAL DO CARRINHO:",
            idDoCarrinhoNoMysql
        );
			
        const inputBaseIcms = document.getElementById("baseCalculoIcms");
        if (inputBaseIcms) {
            console.log(`📝 Montando payload fiscal para o ID Real do Carrinho no MySQL: ${idDoCarrinhoNoMysql}`);

            const selectTransp = document.getElementById("selectTransportadoraModalImpostos");
            const idTransportadoraSelecionada = selectTransp && selectTransp.value ? Number(selectTransp.value) : null;

            const payloadImpostosDTO = {
                carrinhoId: Number(idDoCarrinhoNoMysql),
                numeroPedido: numeroPedido,
                clienteId: Number(idFinalCliente),
                formaPagamento: formaPagamento,
                transportadoraId: idTransportadoraSelecionada,

                baseCalculoIcms: parseFloat(document.getElementById("baseCalculoIcms")?.value) || 0.00,
                valorIcms: parseFloat(document.getElementById("valorIcms")?.value) || 0.00,
                baseCalculoIcmsSt: parseFloat(document.getElementById("baseCalculoIcmsSt")?.value) || 0.00,
                valorIcmsSt: parseFloat(document.getElementById("valorIcmsSt")?.value) || 0.00,
                valorTotalProdutos: parseFloat(document.getElementById("valorTotalProdutos")?.value) || 0.00,
                valorFrete: parseFloat(document.getElementById("valorFrete")?.value) || 0.00,
                valorSeguro: parseFloat(document.getElementById("valorSeguro")?.value) || 0.00,
                valorDesconto: parseFloat(document.getElementById("valorDesconto")?.value) || 0.00,
                outrasDespesasAcessorias: parseFloat(document.getElementById("outrasDespesasAcessorias")?.value) || 0.00,
                valorIpi: parseFloat(document.getElementById("valorIpi")?.value) || 0.00,
                valorTotalPedido: parseFloat(document.getElementById("valorTotalNota")?.value) || 0.00,
                valorTotalNota: parseFloat(document.getElementById("valorTotalNota")?.value) || 0.00
            };

            console.log(`📤 Enviando DTO completo para a URL RESTful: ${urlBase}/api/carrinhos/${idDoCarrinhoNoMysql}/impostos`, payloadImpostosDTO);

            const respostaImpostos = await fetch(`${urlBase}/api/carrinhos/${idDoCarrinhoNoMysql}/impostos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenSeguro}`
                },
                body: JSON.stringify(payloadImpostosDTO)
            });

            if (!respostaImpostos.ok) {
                throw new Error(`Falha ao salvar impostos. Status: ${respostaImpostos.status}`);
            }
            console.log("✅ Dados salvos com sucesso na tabela carrinho_impostos!");
        }

        // Faturamento definitivo do lote no Spring Boot
        console.log("📨 Disparando faturamento da venda para o Spring Boot...");
        const response = await fetch(`${urlBase}/carrinho/faturar/pedido/${encodeURIComponent(numeroPedido)}/cliente/${idFinalCliente}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${tokenSeguro}` }
        });

        // ⚡ TRATAMENTO ATÔMICO: Lê como TEXTO PURO para aceitar a string "Venda faturada..." do Java
       
			
			if (response.ok) {

			    const mensagemSucesso = await response.text();

			    console.log(
			        "🎯 [Faturamento] Resposta do Servidor: "
			        + mensagemSucesso
			    );


			    // ============================================================
			    // 💰 GERAÇÃO AUTOMÁTICA DO CONTAS A RECEBER
			    // ============================================================

			    console.log("💰 Gerando títulos do Contas a Receber...");

			    const negociacao =
			        window.dadosNegociacaoAtual || {};

			    let valorFinanceiro =
			        Number(negociacao.valorFinalCorrigido || 0);

			    if (valorFinanceiro <= 0) {

			        valorFinanceiro =
			            window.itensCupomMemoria.reduce(
			                (total, item) =>
			                    total +
			                    (
			                        Number(item.quantidade || 0) *
			                        Number(item.precoPraticado || 0)
			                    ),
			                0
			            );
			    }

			    let parcelasFinanceiras =
			        Array.isArray(negociacao.parcelas)
			            ? negociacao.parcelas
			            : [];

			    if (parcelasFinanceiras.length === 0) {

			        const hoje = new Date();

			        const ano = hoje.getFullYear();

			        const mes =
			            String(
			                hoje.getMonth() + 1
			            ).padStart(2, "0");

			        const dia =
			            String(
			                hoje.getDate()
			            ).padStart(2, "0");

			        const dataHoje =
			            `${ano}-${mes}-${dia}`;

			        parcelasFinanceiras = [
			            {
			                numeroParcela: 1,
			                dataVencimento: dataHoje
			            }
			        ];
			    }

			    const payloadContasReceber = {

			        numeroPedido: numeroPedido,

			        clienteId:
			            Number(idFinalCliente),

			        numeroNotaFiscal:
			            Number(numeroNotaFiscal),

			        serie:
			            serie,

			        valorFinalCorrigido:
			            Number(valorFinanceiro.toFixed(2)),

			        formaPagamento:
			            formaPagamento,

			        inpcAnualAplicado:
			            Number(
			                negociacao.inpcAnualAplicado || 0
			            ),

			        totalParcelas:
			            parcelasFinanceiras.length,

			        cartaoBandeira:
			            negociacao.cartaoBandeira || null,

			        cartaoFinal:
			            negociacao.cartaoFinal || null,

			        cartaoAutorizacao:
			            negociacao.cartaoAutorizacao || null,

			        cartaoNsu:
			            negociacao.cartaoNsu || null,

			        chavePix:
			            negociacao.chavePix || null,

			        parcelas:
			            parcelasFinanceiras.map(
			                parcela => ({
			                    numeroParcela:
			                        Number(parcela.numeroParcela),

			                    dataVencimento:
			                        parcela.dataVencimento
			                })
			            )
			    };

			    console.log(
			        "📤 Contas a Receber:",
			        payloadContasReceber
			    );

			    const respostaContasReceber =
			        await fetch(
			            `${urlBase}/contas-receber/gerar`,
			            {
			                method: "POST",

			                headers: {
			                    "Content-Type":
			                        "application/json",

			                    "Authorization":
			                        `Bearer ${tokenSeguro}`
			                },

			                body:
			                    JSON.stringify(
			                        payloadContasReceber
			                    )
			            }
			        );

			    if (!respostaContasReceber.ok) {

			        const erroFinanceiro =
			            await respostaContasReceber.text();

			        throw new Error(
			            "Venda faturada, mas houve falha " +
			            "ao gerar Contas a Receber. " +
			            `Status: ${respostaContasReceber.status} - ` +
			            erroFinanceiro
			        );
			    }

			    const titulosGerados =
			        await respostaContasReceber.json();

			    console.log(
			        "✅ Contas a Receber gerado:",
			        titulosGerados
			    );

	         // 1. Alerta real de sucesso para o operador de caixa (Exibe a mensagem do Java)
            alert(`✅ Faturamento Concluído com Sucesso!\n📄 Próxima Nota Fiscal Sincronizada.`);

            // 2. 🔥 LIMPEZA AUTOMÁTICA DA MESA: Limpa os itens da tela sem pedir confirmação secundária
            window.itensCupomMemoria = [];
			window.numeroPedidoAtual = `PED-${Date.now()}`;
            if (typeof renderizarCupomDaMemoria === "function") {
	            renderizarCupomDaMemoria();
            } else if (typeof atualizarRendersVisuaisCupom === "function") {
                atualizarRendersVisuaisCupom();
            }

            // 3. Reseta a quantidade padrão para 1
            const quantidade = document.getElementById("inputQuantidade");
            if (quantidade) {
                quantidade.value = "1";
            }

            // 4. Fecha o modal de faturamento/impostos da tela
            let modal = document.getElementById("modalImpostos");
            if (modal) modal.style.display = "none";

            // 5. Atualiza a nossa caixa verde do painel para exibir a nova nota (ex: 1974)
            if (typeof carregarUfOrigemDoSistemaAtiva === "function") {
                carregarUfOrigemDoSistemaAtiva();
            }

        } else {
            // Se o status HTTP do servidor for de erro de fato (ex: 400 ou 500)
            const textoErro = await response.text();
            alert("❌ Erro real na requisição: " + textoErro);
        }

    } catch (erro) {
        console.error("❌ Falha de comunicação ao faturar:", erro);
        alert("Falha ao faturar: erro na sincronização de chaves com o banco. Verifique os logs.");
    }
}
window.confirmarFaturamentoDefinitivo = confirmarFaturamentoDefinitivo;

async function carregarUfOrigemDoSistemaAtiva() {
    try {
        // Captura o token de segurança padrão do seu sistema de security
        const tokenSeguro = typeof token !== "undefined" ? token : (typeof window.obterTokenSeguro === "function" ? window.obterTokenSeguro() : "");

        console.log("🔍 Buscando a UF de Origem do Sistema configurada no Back-end...");

        // Bate na rota "/ativa" que saneamos na Parte 1 do seu OrigemSistemaController.java
        const resposta = await fetch("/api/origemsistema/ativa", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${tokenSeguro}`,
                "Content-Type": "application/json"
            }
        });

		if (resposta.ok) {

		    const origem = await resposta.json();

		    // Joga a UF da OrigemSistema ativa na memória
		    window.ufOrigemSistemaInstalado = origem.uf || "PR";

		    console.log(
		        "🏢 Sucesso! UF de Origem identificada localmente: "
		        + window.ufOrigemSistemaInstalado
		    );

		    // ⚡ Exibe a Série Fiscal da OrigemSistema ativa
		    const painelSerie = document.getElementById("displaySerie");

		    if (painelSerie) {
		        painelSerie.textContent = origem.serie || " ";
		    }

		    // Mantém a série disponível para os demais módulos
		    window.serieFiscalAtual = origem.serie || "UN";

		    console.log("📑 Série Fiscal ativa: " + window.serieFiscalAtual);

		    // ⚡ MÁGICA VISUAL: Captura o sequencial do banco,
		    // soma +1 e projeta na caixa "PRÓX NF"
            // ⚡ MÁGICA VISUAL: Captura o sequencial do banco, soma +1 e projeta na caixa "PRÓX NF"
            const campoNota = origem.notafiscal || origem.nota_fiscal || "";
            if (campoNota) {
                // Lê o '1956' do MySQL, limpa qualquer caractere estranho e computa o incremento (+1)
                const ultimaNotaGravada = parseInt(campoNota.toString().replace(/\D/g, "")) || 0;
                const proximaNotaFiscal = ultimaNotaGravada + 1;

                console.log(`📄 [Layout Sincronizado] Última Nota: ${ultimaNotaGravada} | Próxima NF-e: ${proximaNotaFiscal}`);

                // Injeta com precisão o número 1957 no elemento HTML correspondente
                const painelDisplay = document.getElementById("displayProximaNotaFiscal");
                if (painelDisplay) {
                    painelDisplay.textContent = proximaNotaFiscal;
                }

                // Preserva o valor calculado na memória viva da janela do navegador
                window.proximaNotaFiscalPrevista = proximaNotaFiscal;
            } else {
                console.warn("⚠️ A matriz ativa respondeu, mas o campo 'notafiscal' veio sem valor no JSON.");
            }

        } else {
            console.warn("⚠️ Endpoint /ativa retornou status " + resposta.status + ". Assumindo padrão PR.");
            window.ufOrigemSistemaInstalado = "PR";
        }
    } catch (erro) {
        console.error("❌ Erro ao conectar com o endpoint de origem ativa:", erro);
        window.ufOrigemSistemaInstalado = "PR"; // Backup de segurança caso o banco esteja offline
    }
}

// Inicializa a varredura automática assim que a folha de lógicas do fechamento é carregada
carregarUfOrigemDoSistemaAtiva();

window.fecharModalImpostos = function() {
    const modal = document.getElementById("modalImpostos");
    if (modal) modal.style.display = "none";
};;


window.calcularImpostoPorAliquota = function() {
    const baseCalculo = parseFloat(document.getElementById("baseCalculoIcms")?.value) || 0;
    const aliquota = parseFloat(document.getElementById("aliquotaIcms")?.value) || 0;
    const valorIcmsResult = (baseCalculo * aliquota) / 100;

    const campoValorIcms = document.getElementById("valorIcms");
    if (campoValorIcms) campoValorIcms.value = valorIcmsResult.toFixed(2);
};


window.calcularTotalNota = function() {
    const produtos = parseFloat(document.getElementById("valorTotalProdutos")?.value) || 0;
    const frete = parseFloat(document.getElementById("valorFrete")?.value) || 0;
    const seguro = parseFloat(document.getElementById("valorSeguro")?.value) || 0;
    const desconto = parseFloat(document.getElementById("valorDesconto")?.value) || 0;
    const acessorias = parseFloat(document.getElementById("outrasDespesasAcessorias")?.value) || 0;
    const ipi = parseFloat(document.getElementById("valorIpi")?.value) || 0;

    const totalNota = (produtos + frete + seguro + acessorias + ipi) - desconto;

    const campoTotal = document.getElementById("valorTotalNota");
    if (campoTotal) campoTotal.value = totalNota.toFixed(2);
};

window.impostoFrete = window.abrirModalImpostos;


window.carregarClientesNoModalImpostos = async function() {
    const select = document.getElementById("selectClienteModalImpostos");
    const selectTransportadora = document.getElementById("selectTransportadoraModalImpostos");
    if (!select) return;

    try {
        // Alinhamento de segurança com as variáveis do seu modulo-fechamento.js original
        const tokenSeguro = typeof token !== "undefined" ? token : (typeof window.obterTokenSeguro === "function" ? window.obterTokenSeguro() : "");
        const urlBase = typeof API_URL !== "undefined" ? API_URL : "";

        console.log("🔍 Buscando lista de clientes locais no Spring Boot...");

        // 🌟 DICA DE OURO: Se a sua rota no Java for /api/clientes, mude abaixo para `${urlBase}/api/clientes`
        const resposta = await fetch(`${urlBase}/api/clientes`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${tokenSeguro}`,
                "Content-Type": "application/json"
            }
        });

        if (resposta.ok) {
            const clientes = await resposta.json();
            console.log(`👥 ${clientes.length} clientes encontrados no banco local.`);

            // Mantém a opção padrão limpa
            select.innerHTML = '<option value="">-- Escolha um Cliente --</option>';

            clientes.forEach(cli => {
                const option = document.createElement("option");
                option.value = cli.id;

                // Exibe o Nome e a UF no select para guiar o piá do balcão (Ex: "João Silva (SP)")
                const ufLimpa = cli.uf || "PR";
                option.textContent = `${cli.nome} (${ufLimpa})`;

                // Guarda a UF guardada escondida no atributo 'data-uf' para o motor fiscal ler no ato do clique
                option.setAttribute("data-uf", ufLimpa);
                select.appendChild(option);
            });
        } else {
            console.warn(`⚠️ Erro ao listar clientes. Status HTTP: ${resposta.status}`);
        }
    } catch (erro) {
        console.error("❌ Falha de comunicação ao carregar clientes do MySQL:", erro);
    }
};


window.calcularImpostoPorAliquota = function() {
    const baseCalculo = parseFloat(document.getElementById("baseCalculoIcms")?.value) || 0;
    const aliquota = parseFloat(document.getElementById("aliquotaIcms")?.value) || 0;
    const valorIcmsResult = (baseCalculo * aliquota) / 100;

    const campoValorIcms = document.getElementById("valorIcms");
    if (campoValorIcms) campoValorIcms.value = valorIcmsResult.toFixed(2);
};


window.calcularTotalNota = function() {
    const produtos = parseFloat(document.getElementById("valorTotalProdutos")?.value) || 0;
    const frete = parseFloat(document.getElementById("valorFrete")?.value) || 0;
    const seguro = parseFloat(document.getElementById("valorSeguro")?.value) || 0;
    const desconto = parseFloat(document.getElementById("valorDesconto")?.value) || 0;
    const acessorias = parseFloat(document.getElementById("outrasDespesasAcessorias")?.value) || 0;
    const ipi = parseFloat(document.getElementById("valorIpi")?.value) || 0;

    const totalNota = (produtos + frete + seguro + acessorias + ipi) - desconto;

    const campoTotal = document.getElementById("valorTotalNota");
    if (campoTotal) campoTotal.value = totalNota.toFixed(2);
};
window.impostoFrete = window.abrirModalImpostos;

window.sincronizarClienteComFaturamento = function() {
    console.log("👉 [Função Nova] Sincronizando cliente selecionado...");

    const selectClienteModal = document.getElementById("selectClienteModal");
    const selectUfSimulacao = document.getElementById("ufDestinoSimulacao");

    if (!selectClienteModal) {
        console.warn("Elemento #selectClienteModal não encontrado na tela.");
        return;
    }

    const opcaoSelecionada = selectClienteModal.options[selectClienteModal.selectedIndex];
    if (!opcaoSelecionada || selectClienteModal.value === "") {
        return; // Caso não tenha nenhum cliente selecionado ainda
    }

    // 1. Captura os dados essenciais do Cliente selecionado
    const clienteId = selectClienteModal.value;
    const nomeClienteCompleto = opcaoSelecionada.text; // Ex: "jose gouvea paula (BA)"

    // 2. Executa a sua lógica de leitura de UFs para a engrenagem fiscal continuar perfeita
    let ufCliente = "PR";
    if (selectUfSimulacao) {
        ufCliente = selectUfSimulacao.value;
    } else if (window.clienteAtualPedido && window.clienteAtualPedido.uf) {
        ufCliente = window.clienteAtualPedido.uf;
    } else if (opcaoSelecionada && opcaoSelecionada.getAttribute("data-uf")) {
        ufCliente = opcaoSelecionada.getAttribute("data-uf");
    }

    // 3. Salva na memória global para o Spring Boot usar na hora de salvar
    window.clienteAtualPedido = {
        id: Number(clienteId),
        uf: ufCliente,
        nome: nomeClienteCompleto
    };

    // 4. 🎯 O SEGREDO DO PRINT 2: Substitui o texto "Identificar Cliente (Ih)" na tela
    // Varre todas as tags span e divs da tela atrás da frase laranja antiga para trocá-la dinamicamente
    const todosElementos = document.querySelectorAll("span, div, h3, p");
    let alterouNaTela = false;

    todosElementos.forEach(el => {
        if (el.textContent.includes("Identificar Cliente")) {
            el.textContent = nomeClienteCompleto; // Injeta "jose gouvea paula (BA)"
            el.style.color = "#00ff00"; // Transforma de laranja para VERDE (Identificado!)
            el.style.fontWeight = "bold";
            alterouNaTela = true;
        }
    });

    if (alterouNaTela) {
        console.log("✅ Sucesso! Texto laranja substituído pelo nome do cliente.");
    }

    // 5. Força o modal de impostos a recalcular a alíquota para os 12,0% ou 19,0% certos
    if (typeof window.abrilModalImpostos === "function") {
        window.abrirModalImpostos();
    }
};


async function carregarTransportadorasPDV() {
    console.log("🔍 [modulo-fechamento.js] Buscando lista de transportadoras locais...");

    const selectTransp = document.getElementById("selectTransportadoraModalImpostos");
    if (!selectTransp) {
        console.warn("Aviso: Elemento #selectTransportadoraModalImpostos não localizado na árvore DOM.");
        return;
    }

    try {
        const urlBase = typeof API_URL !== "undefined" ? API_URL : "";
        const tokenSeguro = typeof token !== "undefined" ? token : (typeof window.obterTokenSeguro === "function" ? window.obterTokenSeguro() : "");

        // Ajuste a URL abaixo para casar exatamente com o endpoint do seu Controller Java (ex: /transportadoras ou /api/transportadoras)
        const resposta = await fetch(`${urlBase}/api/clientes`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${tokenSeguro}`,
                "Content-Type": "application/json"
            }
        });

        if (!resposta.ok) {
            throw new Error(`Erro HTTP ao ler transportadoras. Status: ${resposta.status}`);
        }

        const transportadoras = await resposta.json();
        console.log(`👥 ${transportadoras.length} transportadoras localizadas no banco de dados.`);

        // Limpa as opções antigas mantendo apenas o padrão de retirada no balcão
        selectTransp.innerHTML = '<option value="">-- Sem Frete / Retirada no Balcão --</option>';

        // Percorre a lista vinda do MySQL e monta as tags <option>
        transportadoras.forEach(transp => {
            const opcao = document.createElement("option");
            opcao.value = transp.id; // ID bigint da tabela
            opcao.text = `${transp.nome || transp.razaoSocial} (${transp.uf || 'BR'})`; // Nome amigável na tela

            // Se possuir CNPJ ou dados adicionais, pode embutir como atributo customizado
            opcao.setAttribute("data-uf-transp", transp.uf || "");

            selectTransp.appendChild(opcao);
        });

    } catch (erro) {
        console.error("❌ Falha crítica ao alimentar o select de transportadoras:", erro);
    }
}

// Vincula ao escopo global da janela do navegador
window.carregarTransportadorasPDV = carregarTransportadorasPDV;



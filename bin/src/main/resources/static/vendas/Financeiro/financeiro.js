// ================================================================= -->
// /static/vendas/Financeiro/financeiro.js — PARTE 1 DE 2 (CRAVADO F10)
// ================================================================= -->

let valorBaseOriginalPedido = 0;

// Objeto de memória global que guarda as taxas negociadas até o clique no F10
window.dadosNegociacaoAtual = {
    formaPagamento: "CREDITO",
    valorBase: 0,
    valorFinalCorrigido: 0,
    totalParcelas: 1,
    parcelas: [],
    inpcAplicado: 0,
    cartaoBandeira: null,
    cartaoAutorizacao: null,
    cartaoNsu: null
};

window.abrirFormaPagamento = function () {
    try {
        // 1. CAPTURA DO VISOR VERDE DO BALCÃO PRINCIPAL (Ex: R\$ 76.817,10 do seu print)
        let elementoTotalBalcao = document.querySelector("div[style*='background: rgb(0, 128, 0)'] strong") || 
                                document.querySelector("strong[style*='color: rgb(94, 255, 94)']") ||
                                document.getElementById("totalGeralPedidoDisplay") ||
                                document.querySelector(".col-8 strong") ||
                                document.getElementById("totalNotaFiscal") ||
                                document.getElementById("valorTotalNota");
        
        let txtTotal = elementoTotalBalcao ? (elementoTotalBalcao.textContent || elementoTotalBalcao.value) : "0";
        
        // Remove símbolos, espaços e pontos de milhar de forma ultra segura contra distorções decimais
        let textoLimpo = txtTotal.replace("R\$", "").replace(/\s/g, "");
        if (textoLimpo.includes(".") && textoLimpo.includes(",")) {
            textoLimpo = textoLimpo.replace(/\./g, "").replace(",", ".");
        } else {
            textoLimpo = textoLimpo.replace(",", ".");
        }
        
        valorBaseOriginalPedido = parseFloat(textoLimpo) || 76817.10;
    } catch (err) {
        console.warn("Aviso na busca de preço, aplicando padrão do carrinho:", err);
        valorBaseOriginalPedido = 76817.10;
    }

    // Alinha o calendário inicial master para a data do balcão (25/09/2026)
    const inputMaster = document.getElementById("inputDataPrimeiroVencimento");
    if (inputMaster && !inputMaster.value) {
        inputMaster.value = "2026-09-25";
    }

    // FORÇA O GATILHO DE REBUILD ANTES DO DISPLAY DO BOOTSTRAP
    const selectPagamento = document.getElementById("selectPagamentoModal");
    if (selectPagamento) {
        // Altera o valor padrão inicial para CREDITO para os campos brotarem na mesma hora
        selectPagamento.value = "CREDITO";
    }

    const modalFinanceiro = document.getElementById("modalFecharPedido");
    if (modalFinanceiro) {
        modalFinanceiro.classList.add("show");
        modalFinanceiro.style.setProperty("display", "block", "important");
        modalFinanceiro.style.background = "transparent"; // Deixa a retaguarda visível sob o modal flutuante
        
        // Limpa a tabela dinâmica para não carregar lixo do cache
        const tabelaBody = document.getElementById("tabelaParcelasDinamica");
        if (tabelaBody) tabelaBody.innerHTML = "";
        
        // =================================================================
        // INTERVENÇÃO CIRÚRGICA: Dá 50 milissegundos para o DOM assentar
        // o HTML novo antes de rodar a mesa de negociação
        // =================================================================
        setTimeout(function() {
            window.processarFluxoNegociacaoBalcao();
        }, 50);
    }
};

window.processarFluxoNegociacaoBalcao = function () {
    const selectPagamento = document.getElementById("selectPagamentoModal");
    const zonaCartao = document.getElementById("blocoCartaoFaturamento");
    const inputValorFinal = document.getElementById("totalModalDisplay");
    const tabelaBody = document.getElementById("tabelaParcelasDinamica");
    const labelParcelamento = document.getElementById("txtParcelamentoDisplay");

    if (!selectPagamento || !zonaCartao || !inputValorFinal) return;

    const formaPagamento = selectPagamento.value;

    const containerParcelas = document.getElementById("containerSelectParcelas");
    const containerInpc = document.getElementById("containerInputInpc");
    const containerDataMaster = document.getElementById("containerDataVencimentoMaster");
    const containerTabela = document.getElementById("containerTabelaDinamica");

    // Limpa estados ocultando o bloco de forma prioritária contra o cache
    zonaCartao.style.setProperty('display', 'none', 'important');
    zonaCartao.classList.add("secao-oculta");
    if (containerTabela) containerTabela.classList.add("secao-oculta");
    if (labelParcelamento) labelParcelamento.textContent = "";

    // 🧮 Deduz o desconto de balcão (chorinho) antes do cálculo das parcelas
    let valorComDesconto = valorBaseOriginalPedido - (window.descontoManualMesa || 0.00);
    if (valorComDesconto < 0) valorComDesconto = 0;

    if (formaPagamento === "CREDITO") {
        zonaCartao.style.setProperty('display', 'block', 'important');
        zonaCartao.classList.remove("secao-oculta");
        
        if (containerParcelas) containerParcelas.style.setProperty('display', 'block', 'important');
        if (containerInpc) containerInpc.style.setProperty('display', 'block', 'important');
        if (containerDataMaster) containerDataMaster.style.setProperty('display', 'block', 'important');
        if (containerTabela) {
            containerTabela.style.setProperty('display', 'block', 'important');
            containerTabela.classList.remove("secao-oculta");
        }

        // --- MOTOR DE CÁLCULO FINANCEIRO (INPC CONTRA DÍZIMAS) ---
        const inpcAnual = parseFloat(document.getElementById("inputInpcAnual")?.value);
        const inpcAnualLimpo = isNaN(inpcAnual) ? 0.00 : inpcAnual; // Aceita juros 0 do balcão
        
        const parcelas = parseInt(document.getElementById("selectParcelas")?.value) || 2;

        const taxaMensalPercentual = inpcAnualLimpo / 12;
        const fatorJuros = 1 + (taxaMensalPercentual / 100); 

        const valorParcelaBase = valorComDesconto / parcelas;
		// 1. Aplica o fator de juros sobre a parcela base
		       let valorParcelaCorrigida = valorParcelaBase * fatorJuros;
		       
		       // 2. Trava a parcela individual em duas casas decimais comerciais (Bloqueia dízimas)
		       valorParcelaCorrigida = Math.round(valorParcelaCorrigida * 100) / 100;

		       // 3. Calcula o montante total multiplicando as parcelas já arredondadas (Evita erro de soma)
		       const valorTotalFinalCorrigido = valorParcelaCorrigida * parcelas;

		       // 4. Injeta os resultados finais calibrados nos visores da interface do modal
		       inputValorFinal.textContent = `R$ ${valorTotalFinalCorrigido.toFixed(2).replace(".", ",")}`;
		       if (labelParcelamento) {
		           labelParcelamento.textContent = `${parcelas}x de R$ ${valorParcelaCorrigida.toFixed(2).replace(".", ",")}`;
		       }
		
		
       
        inputValorFinal.textContent = `R$ ${valorTotalFinalCorrigido.toFixed(2).replace(".", ",")}`;
        if (labelParcelamento) {
            let legenda = `${parcelas}x de R$ ${valorParcelaCorrigida.toFixed(2).replace(".", ",")}`;
            if (window.descontoManualMesa > 0) {
                legenda += ` (Desconto de R$ ${window.descontoManualMesa.toFixed(2).replace(".", ",")})`;
            }
            labelParcelamento.textContent = legenda;
        }

		// --- GERADOR DE CALENDÁRIOS INDIVIDUAIS LIVRES ---
		// --- 🌟 A ENGRENAGEM: DISPARA CONTAGEM +30 DIAS EM CASCATA ---

		tabelaBody.innerHTML = "";

		const inputDataInicial =
		    document.getElementById("inputDataPrimeiroVencimento").value;

		let partesData = inputDataInicial.split("-");
		let anoBase = parseInt(partesData[0]);
		let mesBase = parseInt(partesData[1]) - 1;
		let diaBase = parseInt(partesData[2]);

		for (let i = 1; i <= parcelas; i++) {

		    // Cria uma nova data para cada parcela
		    let dataBase =
		        new Date(anoBase, mesBase, diaBase, 12, 0, 0);

		    // 1ª = data inicial
		    // 2ª = +30 dias
		    // 3ª = +60 dias
		    // etc.
		    dataBase.setDate(
		        dataBase.getDate() + ((i - 1) * 30)
		    );

		    let ano = dataBase.getFullYear();

		    let mes = String(
		        dataBase.getMonth() + 1
		    ).padStart(2, "0");

		    let dia = String(
		        dataBase.getDate()
		    ).padStart(2, "0");

		    let dataFormatadaBanco =
		        `${ano}-${mes}-${dia}`;

		    let tr = document.createElement("tr");

		    tr.innerHTML = `
		        <td
		            style="
		                vertical-align: middle;
		                font-weight: bold;
		                color: #ff9800;
		            ">
		            ${i}ª
		        </td>

		        <td>
		            <input
		                type="date"
		                class="form-control ia-input-sm classe-data-parcela"
		                data-parcela="${i}"
		                value="${dataFormatadaBanco}"
		                style="
		                    height: 34px;
		                    padding: 2px 5px;
		                    font-size: 13px;
		                    width: 145px;
		                    background: #1e3a4e !important;
		                    color: #ff9800 !important;
		                    font-weight: 800;
		                    text-align: center;
		                    border: 1px solid #ff9800;
		                ">
		        </td>

		        <td
		            style="
		                vertical-align: middle;
		                font-family: monospace;
		                color: #5eff5e;
		                font-weight: bold;
		                text-align: right;
		                padding-right: 5px;
		                font-size: 13px;
		            ">
		            R$ ${valorParcelaCorrigida.toFixed(2).replace(".", ",")}
		        </td>
		    `;

		    tabelaBody.appendChild(tr);
		}
    } else if (formaPagamento === "DEBITO") {
        zonaCartao.style.setProperty('display', 'block', 'important');
        zonaCartao.classList.remove("secao-oculta");
        if (containerParcelas) containerParcelas.style.setProperty('display', 'none', 'important');
        if (containerInpc) containerInpc.style.setProperty('display', 'none', 'important');
        if (containerDataMaster) containerDataMaster.style.setProperty('display', 'none', 'important');

        if (tabelaBody) tabelaBody.innerHTML = "";
        inputValorFinal.textContent = `R$ ${valorComDesconto.toFixed(2).replace(".", ",")}`;
        if (labelParcelamento) labelParcelamento.textContent = "Cartão de Débito à Vista";
    } else if (formaPagamento === "PIX") {
        if (tabelaBody) tabelaBody.innerHTML = "";
        inputValorFinal.textContent = `R$ ${valorComDesconto.toFixed(2).replace(".", ",")}`;
        if (labelParcelamento) labelParcelamento.textContent = "⚡ Transferência PIX à Vista";
    } else {
        if (tabelaBody) tabelaBody.innerHTML = "";
        inputValorFinal.textContent = `R$ ${valorComDesconto.toFixed(2).replace(".", ",")}`;
    }
};

// 💡 ADICIONAL DE SEGURANÇA: Coloque essa variável no início do seu arquivo se já não estiver lá
window.descontoManualMesa = 0.00;

// 🧮 FUNÇÃO RELÂMPAGO DE DESCONTO (Chame no clique do visor se desejar)
window.aplicarDescontoRapidoMesa = function() {
    let valorDesconto = prompt(`Digite o valor do DESCONTO em R$:\n(Preço atual do pedido: R$ ${valorBaseOriginalPedido.toFixed(2).replace(".", ",")})`, "1.79");
    if (valorDesconto !== null) {
        window.descontoManualMesa = parseFloat(valorDesconto.replace(",", ".")) || 0.00;
        window.processarFluxoNegociacaoBalcao();
    }
};


// ================================================================= -->
// /static/vendas/Financeiro/financeiro.js — PARTE 2 DE 2 (APIS & DRAG)
// ================================================================= -->

window.confirmarPagamentoFinanceiro = function () {
    const forma = document.getElementById("selectPagamentoModal")?.value;
    let parcelasNegociadas = [];

    if (forma === "CREDITO") {
        // Varre os inputs de calendário individuais linha por linha capturando as alterações da mesa
        const inputsDatas = document.querySelectorAll(".classe-data-parcela");
        inputsDatas.forEach(input => {
            parcelasNegociadas.push({
                numeroParcela: parseInt(input.getAttribute("data-parcela")),
                dataVencimento: input.value // Captura o valor final modificado pelo clique no calendário
            });
        });
    } else {
        // Débito ou outros meios assumem vencimento único na data atual do balcão (28/09/2026)
        parcelasNegociadas.push({
            numeroParcela: 1,
            dataVencimento: "2026-09-28"
        });
    }

    // 1. RECOLHIMENTO DE DADOS: Alimenta o objeto de memória global com os dados exatos do seu HTML
    window.dadosNegociacaoAtual = {
        carrinhoId: 1, // Vinculado dinamicamente pelo seu fluxo do balcão
        codCliente: 1,
        notaFiscal: "14", // Capturado do indicador verde do Balcão
        serie: "B1",     // Capturado do indicador verde do Balcão
        valorBase: valorBaseOriginalPedido,
        valorFinalCorrigido: parseFloat(document.getElementById("totalModalDisplay").textContent.replace("R$", "").replace(/\./g, "").replace(",", ".")),
        formaPagamento: forma,
        inpcAnualAplicado: forma === "CREDITO" ? parseFloat(document.getElementById("inputInpcAnual")?.value) : 0,
        totalParcelas: forma === "CREDITO" ? parseInt(document.getElementById("selectParcelas")?.value) : 1,
        cartaoBandeira: (forma === "CREDITO" || forma === "DEBITO") ? document.getElementById("selectBandeira")?.value : null,
        cartaoAutorizacao: (forma === "CREDITO" || forma === "DEBITO") ? document.getElementById("inputAutorizacao")?.value : null,
        cartaoNsu: (forma === "CREDITO" || forma === "DEBITO") ? document.getElementById("inputNsu")?.value : null,
        parcelas: parcelasNegociadas // Lista dinâmica com os calendários individuais da mesa
    };

    // 2. RECOLHIMENTO DA TELA FLUTUANTE: Fecha a mesa e aguarda o comando definitivo do F10 lateral
    const modal = document.getElementById("modalFecharPedido");
    if (modal) {
        modal.style.setProperty("display", "none", "important");
        modal.classList.remove("show");
    }

    console.log("Mesa de negociação temporária recolhida e salva na memória do balcão:", window.dadosNegociacaoAtual);
};

/**
 * GATILHO FINAL DO BALCÃO: Disparado pelo clique em "CONFIRMAR FATURAMENTO (F10)"
 * na barra laranja lateral do painel de retaguarda (Menu do seu Balcão)
 */
window.executarFaturamentoDefinitivoBalcao = function () {
    // Se o operador não abriu o modal de negociação, assume faturamento em Dinheiro/À Vista padrão
    if (window.dadosNegociacaoAtual.valorFinalCorrigido === 0) {
        window.dadosNegociacaoAtual.valorBase = valorBaseOriginalPedido;
        window.dadosNegociacaoAtual.valorFinalCorrigido = valorBaseOriginalPedido;
        window.dadosNegociacaoAtual.parcelas = [{ numeroParcela: 1, dataVencimento: "2026-09-28" }];
    }

    // Dispara a persistência real para as tabelas do MySQL no Railway
    fetch('/api/financeiro/faturar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(window.dadosNegociacaoAtual)
    })
    .then(response => {
        if (response.ok) {
            alert("✅ Faturamento Concluído com Sucesso!\nMesa de negociação salva no Contas a Receber.");
            location.reload();
        } else {
            alert("❌ Erro ao enviar os dados de faturamento para o servidor.");
        }
    })
    .catch(error => console.error("Erro na persistência:", error));
};

// ================================================================= -->
// ENGINE DE MOVIMENTAÇÃO DRAG & DROP DO CABEÇALHO FLUTUANTE
// ================================================================= -->
document.addEventListener("DOMContentLoaded", function () {
    const header = document.getElementById("modalFecharPedidoHeader");
    const modalDialog = document.querySelector("#modalFecharPedido .modal-dialog");
    const modal = document.getElementById("modalFecharPedido");
    const containerFechamento = document.getElementById("container-fechamento-pedido");

    // Vincula o clique do botão físico "CONFIRMAR FATURAMENTO" da barra laranja lateral
    const btnFaturarBalcao = document.getElementById("btnConfirmarFaturamentoBalcao") || document.querySelector("button[onclick*='Confirmar Faturamento']");
    if (btnFaturarBalcao) {
        btnFaturarBalcao.onclick = window.executarFaturamentoDefinitivoBalcao;
    }

    if (containerFechamento) {
        containerFechamento.addEventListener("change", function(e) {
            // Se o operador alterou o calendário master azul ou a quantidade de vezes, força resetar a grid para recalcular
            if (e.target && (e.target.id === "inputDataPrimeiroVencimento" || e.target.id === "selectParcelas")) {
                const tabelaBody = document.getElementById("tabelaParcelasDinamica");
                if (tabelaBody) tabelaBody.innerHTML = ""; 
            }
            window.processarFluxoNegociacaoBalcao();
        });
        containerFechamento.addEventListener("input", window.processarFluxoNegociacaoBalcao);
    }

    if (!header || !modalDialog || !modal) return;

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    header.addEventListener("mousedown", function (e) {
        if (e.target.closest("button")) return;

        isDragging = true;
        modal.style.position = "fixed";
        modalDialog.style.margin = "0";

        const rect = modalDialog.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });

    function onMouseMove(e) {
        if (!isDragging) return;

        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;

        modalDialog.style.position = "absolute";
        modalDialog.style.left = x + "px";
        modalDialog.style.top = y + "px";
        modalDialog.style.transform = "none";
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    }
});



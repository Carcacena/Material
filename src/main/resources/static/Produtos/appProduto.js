// 🌍 O sistema detecta sozinho onde está rodando e define a API correta (Local vs Railway)
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:8080" : window.location.origin;

// 🔑 Captura o token tratando variações de aspas e formatos do console F12
const dadosLoginString = localStorage.getItem("token");
let token = null;
if (dadosLoginString) {
    // Remove aspas sobressalentes que o navegador coloca em strings puras
    const limpo = dadosLoginString.trim().replace(/^"+|"+$/g, '');
    if (limpo.startsWith("{")) {
        try {
            // Se for um objeto JSON (Ex: {"token":"ey..."}), extrai a chave
            const objetoLogin = JSON.parse(limpo);
            token = objetoLogin.token || objetoLogin;
        } catch (e) {
            token = limpo;
        }
    } else {
        token = limpo;
    }
}

// 🛒 Montagem padronizada do cabeçalho de comunicação
const cabecalhoRequisicao = {
    'Content-Type': 'application/json',
    'Authorization': token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : ''
};

let produtoSelecionadoId = null;
let listaProdutosGeral = []; // Cache local para busca instantânea do leitor USB

if (!token) {
    window.location.href = "/Login/login.html";
}

// 🌐 DISPARA O CARREGAMENTO QUANDO A TELA ABRE
// 🌐 DISPARA O CARREGAMENTO QUANDO A TELA ABRE
document.addEventListener("DOMContentLoaded", () => {
    carregarFornecedores();
	
    carregarCategoriasNoSelect(); // 📂 INJETADO: Popula a lista de setores ao abrir
    carregarProdutos();
    document.getElementById("formProduto").addEventListener("submit", cadastrarProduto);

    // 🧮 Regra COBOL de consistência: Se for inclusão, o estoque acompanha a entrada inicial
    document.getElementById("qteEntrada").addEventListener("input", () => {
        if (!produtoSelecionadoId) {
            document.getElementById("estoqueAtual").value = document.getElementById("qteEntrada").value;
        }
		
		// Substitua pelo nome exato da sua função que bloqueia/preenche os zeros
		   if (typeof atualizarCamposOrigem === "function") {
		       atualizarCamposOrigem();
		   }	
		
    });


	// 🔌 Captura o Enter automático do leitor de código de barras no input dedicado
	   const campoBarras = document.getElementById("codigoBarras");
	   if (campoBarras) {
	       campoBarras.addEventListener("keydown", (e) => {
	           if (e.key === "Enter") {
	               e.preventDefault(); // Evita submeter o formulário antes da hora
	               buscarPorCodigoBarras(e.target.value);
	           }
	       });
	   }

    bloquearFormulario(true);
});

// ======================================================
// 🛸 MÓDULO EMBUTIDO: GERENCIADOR EXPRESSO DE CATEGORIAS
// ======================================================
async function carregarCategoriasNoSelect(categoriaIdSelecionada = null) {
    try {
        const resposta = await fetch(`${API_URL}/api/categorias`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (resposta.ok) {
            const categorias = await resposta.json();
            const select = document.getElementById("selectCategoria");
            if (!select) return;
            
            select.innerHTML = '<option value="">Selecione...</option>';
            categorias.forEach(cat => {
                const opcao = document.createElement("option");
                opcao.value = cat.id;
                opcao.textContent = cat.nome.toUpperCase();
                if (categoriaIdSelecionada && Number(cat.id) === Number(categoriaIdSelecionada)) {
                    opcao.selected = true;
                }
                select.appendChild(opcao);
            });
        }
    } catch (erro) {
        console.error("Erro ao popular select de categorias:", erro);
    }
}

window.abrirModalRapidoCategoria = function () {
    const modal = document.getElementById("modalRapidoCategoria");
    const select = document.getElementById("selectCategoria");
    const inputNome = document.getElementById("inputNovaCategoriaNome");
    const inputId = document.getElementById("categoriaEdicaoId");
    const btnExcluir = document.getElementById("btnExcluirCategoria");
    const titulo = document.getElementById("tituloModalCategoria");

    if (!modal || !inputNome) return;

    inputNome.disabled = false;

    if (select && select.value) {
        if (inputId) inputId.value = select.value;
        inputNome.value = select.options[select.selectedIndex].text;
        if (titulo) titulo.textContent = "::: EDITAR CATEGORIA :::";
        if (btnExcluir) btnExcluir.style.display = "block";
    } else {
        if (inputId) inputId.value = "";
        inputNome.value = "";
        if (titulo) titulo.textContent = "::: NOVA CATEGORIA :::";
        if (btnExcluir) btnExcluir.style.display = "none";
    }

    modal.style.display = "flex";
    inputNome.focus();
};

window.fecharModalRapidoCategoria = function() {
    document.getElementById("modalRapidoCategoria").style.display = "none";
    document.getElementById("inputNovaCategoriaNome").value = "";
    document.getElementById("categoriaEdicaoId").value = "";
};
window.salvarCategoriaInstantanea = function () {
    const inputNome = document.getElementById("inputNovaCategoriaNome");
    const inputId = document.getElementById("categoriaEdicaoId");
    const nomeTexto = inputNome.value.trim().toUpperCase();
    const idEdicao = inputId && inputId.value ? Number(inputId.value) : null;

    if (!nomeTexto) {
        alert("Informe o nome da categoria, chefe!");
        inputNome.focus();
        return;
    }

    if (!Array.isArray(window.categoriasMemoria)) {
        window.categoriasMemoria = (typeof categoriasMemoria !== "undefined") ? categoriasMemoria : [];
    }
    if (typeof contadorIdTemp === "undefined") {
        window.contadorIdTemp = -1;
    }

    // Procura se já existe na memória (seja ORIGINAL do banco ou NOVA criada agora)
    const existente = window.categoriasMemoria.find(c => 
        c.status !== "EXCLUIDA" && 
        c.nome.trim().toUpperCase() === nomeTexto && 
        Number(c.id) !== idEdicao
    );

    if (existente) {
        // Em vez de duplicar, apenas seleciona a que já está na memória e fecha
        renderizarSelectCategorias(existente.id);
        fecharModalRapidoCategoria();
        return;
    }

    let idSelecionarDepois = idEdicao;

    if (idEdicao) {
        const item = window.categoriasMemoria.find(c => Number(c.id) === idEdicao);
        if (item) {
            item.nome = nomeTexto;
            if (item.status === "ORIGINAL") item.status = "ALTERADA";
        }
    } else {
        const novoIdTemp = contadorIdTemp--;
        window.categoriasMemoria.push({
            id: novoIdTemp,
            nome: nomeTexto,
            status: "NOVA"
        });
        idSelecionarDepois = novoIdTemp;
    }

    renderizarSelectCategorias(idSelecionarDepois);
    fecharModalRapidoCategoria();
};
window.excluirCategoriaSelecionada = async function() {
    const idEdicao = document.getElementById("categoriaEdicaoId").value;
    if (!idEdicao) return;

    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    try {
        const resposta = await fetch(`${API_URL}/api/categorias/${idEdicao}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (resposta.ok) {
            fecharModalRapidoCategoria();
            await carregarCategoriasNoSelect();
        } else {
            alert("Não foi possível excluir. Verifique se existem produtos vinculados a esta categoria.");
        }
    } catch (erro) {
        console.error("Erro ao excluir categoria:", erro);
    }
};

// ======================================================
// 🎨 RENDERIZADOR DO SELECT DE CATEGORIAS (MEMÓRIA -> TELA)
// ======================================================
window.renderizarSelectCategorias = function (idParaSelecionar = null) {
    const select = document.getElementById("selectCategoria");
    if (!select) return;

    const listaMem = Array.isArray(window.categoriasMemoria) ? window.categoriasMemoria : [];
    const valorAtual = idParaSelecionar !== null ? idParaSelecionar : select.value;

    select.innerHTML = '<option value="">Selecione...</option>';

    listaMem
        .filter(cat => cat.status !== "EXCLUIDA")
        .forEach(cat => {
            const opcao = document.createElement("option");
            opcao.value = cat.id;
            opcao.textContent = cat.nome;
            if (valorAtual !== "" && Number(cat.id) === Number(valorAtual)) {
                opcao.selected = true;
            }
            select.appendChild(opcao);
        });
};

// Atualiza a função inicial para abastecer sempre window.categoriasMemoria
window.carregarCategoriasNoSelect = async function (categoriaIdSelecionada = null) {
    try {
        const resposta = await fetch(`${API_URL}/api/categorias`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (resposta.ok) {
            const listaBanco = await resposta.json();
            window.categoriasMemoria = listaBanco.map(cat => ({
                id: cat.id,
                nome: cat.nome.toUpperCase(),
                status: "ORIGINAL"
            }));
            renderizarSelectCategorias(categoriaIdSelecionada);
        }
    } catch (erro) {
        console.error("Erro ao popular select de categorias:", erro);
    }
};
















// 🛡️ MOTOR DE INTELIGÊNCIA: Controla a Interação Humana bloqueando ou liberando os campos financeiros
// 🛡️ MOTOR DE INTELIGÊNCIA: Mostra a caixa horizontal apenas no modo Artesanal
function alternarBloqueioCampos() {
    const origem = document.getElementById("origemCadastro").value;
    const blocoValores = document.getElementById("blocoValoresArtesanal");

    const camposFinanceiros = [
        "precoCusto",
        "precoVenda",
        "qteEntrada",
        "estoqueAtual"
    ];

    if (origem === "COM_NF") {
        // Esconde a caixa lateral horizontal e zera os valores nos bastidores
        if (blocoValores) blocoValores.style.display = "none";

        camposFinanceiros.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                campo.disabled = true;
                campo.required = false;
                campo.value = "0";
            }
        });
    } else {
        // Exibe a caixa lateral horizontal ao lado da caixa escura principal
        if (blocoValores) blocoValores.style.display = "block";

        camposFinanceiros.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                campo.disabled = false;
                campo.required = (id !== "estoqueAtual"); // Estoque atual acompanha qteEntrada
                if (campo.value === "0.00" || campo.value === "0") campo.value = "";
            }
        });
    }
}

// 🎯 TRAVA DE SEGURANÇA ADICIONAL NO SUBMIT DO FORMULÁRIO
document.getElementById("formProduto")?.addEventListener("submit", function(e) {
    const origem = document.getElementById("origemCadastro").value;
    
    if (origem === "SEM_NF") {
        const custo = parseFloat(document.getElementById("precoCusto")?.value) || 0;
        const venda = parseFloat(document.getElementById("precoVenda")?.value) || 0;

        // Validação final de consistência de dados antes de disparar o POST/PUT para o Java
        if (custo <= 0 || venda <= 0) {
            e.preventDefault(); // Interrompe o envio para o banco MySQL
            alert("❌ Erro de Validação:\nPara produtos artesanais/sem NF, é obrigatório informar Preço de Custo e Preço de Venda maiores que zero!");
            document.getElementById("precoCusto").focus();
        }
    }
});


// 📦 BUSCAR PRODUTOS E MONTAR OS BLOCOS COLAPSÁVEIS COM SUB-RAIZ DE DADOS DO LOTE
async function carregarProdutos() {
    try {
        const response = await fetch(`${API_URL}/produtos`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) return;
        const produtos = await response.json();
        listaProdutosGeral = produtos; // Cache local para buscas do leitor USB

        const container = document.getElementById("containerFornecedoresProdutos");
        if (!container) return;
        container.innerHTML = "";

        const agrupadoPorFornecedor = {};
        produtos.forEach(prod => {
            const fornecedorNome = prod.fornecedor ? prod.fornecedor.nome : "Sem Fornecedor";
            if (!agrupadoPorFornecedor[fornecedorNome]) agrupadoPorFornecedor[fornecedorNome] = [];
            agrupadoPorFornecedor[fornecedorNome].push(prod);
        });

        const fornecedoresOrdenados = Object.keys(agrupadoPorFornecedor).sort((a, b) => a.localeCompare(b, "pt-BR"));

        fornecedoresOrdenados.forEach(fornecedorNome => {
            const produtosFornecedor = agrupadoPorFornecedor[fornecedorNome];
            const divGrupo = document.createElement("div");
            divGrupo.style.marginBottom = "10px";

            const btnHeader = document.createElement("button");
            btnHeader.type = "button";
            btnHeader.className = "fornecedor-header";
            btnHeader.innerHTML = `📁 <strong>${fornecedorNome}</strong> (${produtosFornecedor.length})`;

            const divProdutosList = document.createElement("div");
            divProdutosList.className = "produtos-lista";
            divProdutosList.style.display = "none";

            btnHeader.addEventListener("click", () => {
                const estaFechado = divProdutosList.style.display === "none";
                divProdutosList.style.display = estaFechado ? "block" : "none";
            });
            produtosFornecedor.forEach(p => {
                const divProdutoContainer = document.createElement("div");
                divProdutoContainer.style.borderBottom = "1px solid #1b2834";

                const item = document.createElement("div");
                item.className = "produto-item";
                item.id = `prod-item-${p.id}`;
                item.style.display = "flex";
                item.style.width = "100%";
                item.style.alignItems = "center";
                item.style.padding = "10px 5px";

                const barrasText = p.codigoBarras ? ` [${p.codigoBarras}]` : ' [Sem Código]';
                const vencimentoAlert = p.proximoVencimento ? `<span style="background:#c0392b; color:white; font-size:9px; padding:1px 3px; border-radius:3px; margin-left:4px; font-weight:bold;">⚠️</span>` : '';

                const custoFormated = p.precoCusto ? `R$ ${p.precoCusto.toFixed(2)}` : 'R$ 0.00';
                const vendaFormated = p.precoVenda ? `R$ ${p.precoVenda.toFixed(2)}` : 'R$ 0.00';
                const margemFormated = p.margemLucro ? `${p.margemLucro.toFixed(1)}%` : '0.0%';

                item.innerHTML = `
			                    <div style="flex: 2.5; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
			                        <span>📦 <strong>${p.nome}</strong></span><span style="color:rgba(255,255,255,0.5); font-size:11px;">${barrasText}</span>${vencimentoAlert}
			                    </div>
			                    <div style="flex: 1; text-align: center; color: #ffaa66; font-size: 13px;">${custoFormated}</div>
			                    <div style="flex: 1; text-align: center; color: #5eff5e; font-size: 13px; font-weight: bold;">${vendaFormated}</div>
			                    <div style="flex: 1; text-align: center; color: #00ffff; font-size: 13px;">${margemFormated}</div>
			                    <div style="flex: 1; text-align: right; padding-right: 15px; font-weight: bold;">${p.estoqueAtual} Un.</div>
			                `;

                const divSubRaizDetalhes = document.createElement("div");
                divSubRaizDetalhes.id = `prod-detalhe-${p.id}`;
                divSubRaizDetalhes.style.display = "none";
                divSubRaizDetalhes.style.background = "rgba(0, 0, 0, 0.4)";
                divSubRaizDetalhes.style.padding = "10px 15px";
                divSubRaizDetalhes.style.marginLeft = "15px";
                divSubRaizDetalhes.style.marginBottom = "5px";
                divSubRaizDetalhes.style.borderRadius = "4px";
                divSubRaizDetalhes.style.borderLeft = "2px dashed #00bc8c";
                divSubRaizDetalhes.style.fontSize = "12px";

                divSubRaizDetalhes.innerHTML = `
							                   <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; color: #ffffff !important;">
							                       <!-- Linha 1: Logística e Identificação -->
							                       <div style="display: flex; flex-direction: row; gap: 20px; white-space: nowrap; align-items: center;">
							                           <div>📌 <strong>ID Lote:</strong> ${p.id}</div>
							                           <div>📥 <strong>Última Entrada:</strong> ${p.qteEntrada} Un.</div>
							                           <div>📅 <strong>Validade:</strong> ${p.dataValidade || 'Não Informada'}</div>
							                       </div>
							                       <!-- Linha 2: Financeiro Aninhado (O Perfume para não estourar o vídeo) -->
							                       <div style="display: flex; flex-direction: row; gap: 20px; white-space: nowrap; align-items: center; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px;">
							                           <div style="color: #ffaa66 !important;">💰 <strong>Custo Lote:</strong> ${custoFormated}</div>
							                           <div style="color: #5eff5e !important;">🏷️ <strong>Preço Venda:</strong> ${vendaFormated}</div>
							                           <div style="color: #00ffff !important;">📈 <strong>Margem Real:</strong> ${margemFormated}</div>
							                       </div>
							                   </div>
							               `;

                item.addEventListener("click", (e) => {
                    e.stopPropagation();
                    document.querySelectorAll("[id^='prod-detalhe-']").forEach(d => {
                        if (d.id !== `prod-detalhe-${p.id}`) d.style.display = "none";
                    });
                    const estaOculta = divSubRaizDetalhes.style.display === "none";
                    divSubRaizDetalhes.style.display = estaOculta ? "block" : "none";
                    carregarProdutoNoFormulario(p);
                });

                divProdutoContainer.appendChild(item);
                divProdutoContainer.appendChild(divSubRaizDetalhes);
                divProdutosList.appendChild(divProdutoContainer);
            });

            divGrupo.appendChild(btnHeader);
            divGrupo.appendChild(divProdutosList);
            container.appendChild(divGrupo);
        });
    } catch (e) {
        console.error("Falha ao processar a grade comparativa:", e);
    }
}




















// 🛠️ AUXILIAR DE CONTROLE DOS CAMPOS (Afinado com o Código de Barras e novos estoques)
function bloquearFormulario(status) {
    if (document.getElementById("codigoBarras")) document.getElementById("codigoBarras").disabled = status;
    if (document.getElementById("nomeProduto")) document.getElementById("nomeProduto").disabled = status;
    if (document.getElementById("selecionaFornecedor")) document.getElementById("selecionaFornecedor").disabled = status;
    if (document.getElementById("tipoProduto")) document.getElementById("tipoProduto").disabled = status;
    if (document.getElementById("dataValidade")) document.getElementById("dataValidade").disabled = status;
    if (document.getElementById("precoCusto")) document.getElementById("precoCusto").disabled = status;
    if (document.getElementById("precoVenda")) document.getElementById("precoVenda").disabled = status;
    if (document.getElementById("qteEntrada")) document.getElementById("qteEntrada").disabled = status;
    if (document.getElementById("estoqueAtual")) document.getElementById("estoqueAtual").disabled = status;

    const btnSalvar = document.getElementById("btnSalvar");
    if (btnSalvar) {
        btnSalvar.disabled = status;
    }
    document.getElementById("formProduto").style.opacity = status ? "0.9" : "1";
    //document.getElementById("formProduto").style.opacity = status ? "0.85" : "1";
    //document.getElementById("formProduto").style.opacity = status ? "0.5" : "1";
}

// 🧮 CÁLCULO DINÂMICO DE MARGEM
function calcularMargem() {
    const custo = parseFloat(document.getElementById("precoCusto").value) || 0;
    const venda = parseFloat(document.getElementById("precoVenda").value) || 0;
    let margem = 0;
    if (custo > 0) {
        margem = ((venda - custo) / custo) * 100;
    }
    document.getElementById("valorMargem").textContent = margem.toFixed(2);
}

// 🟢 BOTÃO INCLUIR DO MENU (Afinado para limpar o formulário completo)
function acionarIncluir() {

    produtoSelecionadoId = null;

    document.getElementById("formProduto").reset();

    document.getElementById("tituloFormulario").innerText = "Cadastrar Produto";

    document.getElementById("valorMargem").textContent = "0.00";

    document.querySelectorAll(".produto-item")
        .forEach(r => r.classList.remove("selecionado"));

    bloquearFormulario(false);

    // Reaplica a regra COM_NF / SEM_NF
    alternarBloqueioCampos();

    document.getElementById("codigoBarras").focus();
}

// 🟡 BOTÃO ALTERAR DO MENU FLUTUANTE
function acionarAlterar() {
    if (!produtoSelecionadoId) {
        alert("Selecione um produto na lista antes de alterar!");
        return;
    }
    bloquearFormulario(false);
    document.getElementById("nomeProduto").focus();
}

// 🔴 BOTÃO EXCLUIR DO MENU FLUTUANTE
async function acionarExcluir() {
    if (!produtoSelecionadoId) {
        alert("Selecione um produto na lista antes de excluir!");
        return;
    }
    if (confirm("Confirma a exclusão definitiva deste produto?")) {
        try {
            const response = await fetch(`${API_URL}/produtos/${produtoSelecionadoId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                alert("Produto excluído com sucesso!");
                acionarIncluir();
                bloquearFormulario(true);
                carregarProdutos();
            } else {
                alert("Erro ao excluir o produto.");
            }
        } catch (e) {
            console.error("Erro na exclusão:", e);
            alert("Falha de comunicação ao excluir produto.");
        }
    }
}

// 💾 SALVAR / ALTERAR PRODUTO (Com Sincronização de Categorias em Memória)
async function cadastrarProduto(event) {
    event.preventDefault();

    const idFornecedor = document.getElementById("selecionaFornecedor").value;
    const idCategoriaSelecionada = document.getElementById("selectCategoria").value;

    // 🛡️ Travas de segurança: impede o envio se faltar a amarra de um dos dois lados
    if (!idFornecedor) {
        alert("❌ Atenção! Selecione um fornecedor obrigatório.");
        return;
    }
    if (!idCategoriaSelecionada) {
        alert("❌ Atenção! Selecione uma categoria/setor obrigatório.");
        return;
    }

    try {
        // 🧠 PASSO 1: Efetiva no MySQL tudo o que foi feito no mini-CRUD de Categorias em memória
        // Se a categoria selecionada era NOVA (ID negativo), devolve o ID oficial gerado pelo MySQL
        const idCategoriaReal = await sincronizarCategoriasComBanco();

        if (!idCategoriaReal) {
            alert("❌ Erro ao sincronizar a categoria selecionada com o servidor.");
            return;
        }

        // 📦 PASSO 2: Monta o objeto do Produto usando o idCategoriaReal
        const produtoDados = {
            nome: document.getElementById("nomeProduto").value,
            codigoBarras: document.getElementById("codigoBarras").value.trim() || null,
            aGranel: document.getElementById("tipoProduto").value === "true",
            precoCusto: parseFloat(document.getElementById("precoCusto").value) || 0,
            precoVenda: parseFloat(document.getElementById("precoVenda").value) || 0,
            qteEntrada: parseInt(document.getElementById("qteEntrada").value) || 0,
            estoqueAtual: parseInt(document.getElementById("estoqueAtual").value) || 0,
            
            // 🔗 Vínculos estruturados exigidos pelo Hibernate no Spring Boot
            fornecedor: { id: parseInt(idFornecedor, 10) },
            categoria: { id: parseInt(idCategoriaReal, 10) }
        };

        const url = produtoSelecionadoId ? `${API_URL}/produtos/${produtoSelecionadoId}` : `${API_URL}/produtos`;
        const metodo = produtoSelecionadoId ? "PUT" : "POST";

        const response = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(produtoDados)
        });

        if (response.ok) {
            alert(produtoSelecionadoId ? "Produto alterado!" : "Produto cadastrado!");
            document.getElementById("formProduto").reset();
            document.getElementById("valorMargem").textContent = "0.00";
            
            // 🔄 Recarrega a memória de categorias limpa direto do banco e reseta a seleção
            await carregarCategoriasNoSelect("");
            
            produtoSelecionadoId = null;
            bloquearFormulario(true);
            carregarProdutos();
        } else {
            const erro = await response.text();
            console.error("Erro ao salvar produto:", response.status, erro);
            alert("Erro ao salvar produto: " + erro);
        }
    } catch (e) {
        console.error("Falha ao salvar produto:", e);
        alert("Falha de comunicação ao salvar produto.");
    }
}
async function carregarFornecedores() {
    try {
        // 🚀 Ajustado de /fornecedores para /api/fornecedores para alinhar com o Spring Boot
        const response = await fetch(`${API_URL}/api/fornecedores`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
            const fornecedores = await response.json();
            console.log("Fornecedores carregados para o select:", fornecedores);

            const select = document.getElementById("selecionaFornecedor");
            if (select) {
                select.innerHTML = '<option value="">Selecione...</option>';
                fornecedores.forEach(f => {
                    const idFornecedor = f.id || f.fornecedorId;
                    const nomeFornecedor = f.nome || f.razaoSocial;

                    if (idFornecedor && nomeFornecedor) {
                        select.innerHTML += `<option value="${idFornecedor}">${nomeFornecedor}</option>`;
                    }
                });
            }
        } else {
            console.error("Erro na API de fornecedores:", response.status);
        }
    } catch (e) {
        console.error("Erro ao carregar fornecedores no select:", e);
    }
}


function carregarProdutoNoFormulario(p) {
    document.querySelectorAll(".produto-item").forEach(r => r.classList.remove("selecionado"));
    const elemento = document.getElementById(`prod-item-${p.id}`);
    if (elemento) elemento.classList.add("selecionado");

    // Abre o container do fornecedor caso esteja fechado para destacar visualmente
    if (elemento && elemento.parentElement) {
        elemento.parentElement.style.display = "block";
    }

    produtoSelecionadoId = p.id;
    document.getElementById("produtoId").value = p.id;
    document.getElementById("codigoBarras").value = p.codigoBarras || "";
    document.getElementById("nomeProduto").value = p.nome;
    document.getElementById("selecionaFornecedor").value = p.fornecedor ? p.fornecedor.id : "";
    document.getElementById("tipoProduto").value = String(p.aGranel);
    document.getElementById("dataValidade").value = p.dataValidade || "";
    document.getElementById("precoCusto").value = p.precoCusto;
    document.getElementById("precoVenda").value = p.precoVenda;
    document.getElementById("qteEntrada").value = p.qteEntrada;
    document.getElementById("estoqueAtual").value = p.estoqueAtual;

    document.getElementById("tituloFormulario").innerText = "Visualizando Produto";
    calcularMargem();
    bloquearFormulario(true);
}

// 🔍 LOCALIZA O PRODUTO VIA CÓDIGO DE BARRAS DO LEITOR USB (MAGIA DO HARDWARE)
function buscarPorCodigoBarras(codigo) {
    if (!codigo) return;
    const codigoLimpo = codigo.trim();

    // Busca dentro do cache local atualizado
    const produtoEncontrado = listaProdutosGeral.find(p => p.codigoBarras === codigoLimpo);

    if (produtoEncontrado) {
        carregarProdutoNoFormulario(produtoEncontrado);
    } else {
        // Se o código não existir, oferece atalho rápido para inclusão
        if (confirm("Código de barras [" + codigoLimpo + "] não cadastrado. Deseja iniciar a inclusão deste produto?")) {
            acionarIncluir();
            document.getElementById("codigoBarras").value = codigoLimpo;
            document.getElementById("nomeProduto").focus();
        } else {
            document.getElementById("codigoBarras").value = "";
            document.getElementById("codigoBarras").focus();
        }
    }
}


// ======================================================
// ⚙️ CONTROLADOR DO NOVO MENU FLUTUANTE CRUD PRODUTO
// ======================================================

// 1. Abrir e fechar o painel pelo botão ⚙️ AÇÕES ou pelo X
window.togglePainelProdutoDirect = function () {
    const painel = document.getElementById("painelProduto");
    if (!painel) return;

    if (painel.style.display === "none" || painel.style.display === "") {
        painel.style.setProperty("display", "block", "important");
    } else {
        painel.style.setProperty("display", "none", "important");
    }
};

// 2. Função Cancelar (Limpa o formulário e trava os campos novamente)
window.acionarCancelar = function () {
    const form = document.getElementById("formProduto");
    if (form) form.reset();

    if (typeof produtoSelecionadoId !== "undefined") {
        produtoSelecionadoId = null;
    }

    const inputId = document.getElementById("produtoId");
    if (inputId) inputId.value = "";

    const titulo = document.getElementById("tituloFormulario");
    if (titulo) titulo.textContent = "Cadastrar Produto";

    const margem = document.getElementById("valorMargem");
    if (margem) margem.textContent = "0.00";

    if (typeof bloquearFormulario === "function") {
        bloquearFormulario(true);
    }
};

// 3. Tornar o painel arrastável pela barra laranja
(function iniciarArrastePainelProduto() {
    const painel = document.getElementById("painelProduto");
    const cabecalho = document.getElementById("painelProdutoHeader");
    if (!painel || !cabecalho) return;

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    cabecalho.onmousedown = function (e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;

        document.onmouseup = function () {
            document.onmouseup = null;
            document.onmousemove = null;
        };

        document.onmousemove = function (e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            painel.style.top = (painel.offsetTop - pos2) + "px";
            painel.style.left = (painel.offsetLeft - pos1) + "px";
            painel.style.right = "auto";
        };
    };
})();

// 4. Atalhos de Teclado do CRUD (F2, F3, F10, Esc, Delete)
document.addEventListener("keydown", function (e) {
    // F2 -> Incluir
    if (e.key === "F2") {
        e.preventDefault();
        if (typeof acionarIncluir === "function") acionarIncluir();
    }
    // F3 -> Alterar
    else if (e.key === "F3") {
        e.preventDefault();
        if (typeof acionarAlterar === "function") acionarAlterar();
    }
    // F10 -> Gravar Produto
    else if (e.key === "F10") {
        e.preventDefault();
        document.getElementById("btnSalvar")?.click();
    }
    // Escape -> Cancelar operação
    else if (e.key === "Escape") {
        e.preventDefault();
        acionarCancelar();
    }
    // Delete -> Excluir (só dispara se o cursor não estiver digitando dentro de um campo)
    else if (e.key === "Delete" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "SELECT") {
        e.preventDefault();
        if (typeof acionarExcluir === "function") acionarExcluir();
    }
});

// ======================================================
// 🔄 SINCRONIZAÇÃO FINAL DAS CATEGORIAS EM MEMÓRIA COM O BANCO
// ======================================================
async function sincronizarCategoriasComBanco() {
    const select = document.getElementById("selectCategoria");
    let idCategoriaEscolhida = select ? Number(select.value) : null;

    // Pega a lista em memória (seja via variável local ou window)
    const listaMem = (typeof categoriasMemoria !== "undefined" && categoriasMemoria.length > 0) 
        ? categoriasMemoria 
        : (window.categoriasMemoria || []);

    // A) Processa as EXCLUIDAS
    for (const cat of listaMem.filter(c => c.status === "EXCLUIDA")) {
        await fetch(`${API_URL}/api/categorias/${cat.id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
    }

    // B) Processa as ALTERADAS
    for (const cat of listaMem.filter(c => c.status === "ALTERADA")) {
        await fetch(`${API_URL}/api/categorias/${cat.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ nome: cat.nome })
        });
    }

    // C) Processa as NOVAS e troca o ID temporário negativo pelo ID real gerado no MySQL
    for (const cat of listaMem.filter(c => c.status === "NOVA")) {
        const resp = await fetch(`${API_URL}/api/categorias`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ nome: cat.nome })
        });

        if (resp.ok) {
            const criadaNoBanco = await resp.json();
            if (idCategoriaEscolhida === cat.id) {
                idCategoriaEscolhida = criadaNoBanco.id;
            }
        } else {
            const erroCat = await resp.text();
            console.error("Erro ao gravar nova categoria:", resp.status, erroCat);
            throw new Error("Falha ao criar categoria: " + erroCat);
        }
    }

    // Se por algum motivo ainda sobrou um ID negativo, barra antes de mandar pro Java
    if (idCategoriaEscolhida < 0) {
        throw new Error("A categoria nova não recebeu um ID válido do servidor.");
    }

    return idCategoriaEscolhida;
}





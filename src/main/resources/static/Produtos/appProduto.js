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
    window.location.href = "login.html";
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

window.abrirModalRapidoCategoria = function() {
    document.getElementById("modalRapidoCategoria").style.display = "flex";
    document.getElementById("inputNovaCategoriaNome").focus();
};

window.fecharModalRapidoCategoria = function() {
    document.getElementById("modalRapidoCategoria").style.display = "none";
    document.getElementById("inputNovaCategoriaNome").value = "";
};

window.salvarCategoriaInstantanea = async function() {
    const nomeInput = document.getElementById("inputNovaCategoriaNome").value.trim();
    if (!nomeInput) {
        alert("Informe o nome da categoria, chefe!");
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/api/categorias`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ nome: nomeInput })
        });

        if (resposta.ok) {
            const categoriaCriada = await resposta.json();
            fecharModalRapidoCategoria();
            await carregarCategoriasNoSelect(categoriaCriada.id); // Recarrega e deixa selecionada!
        } else {
            alert("Erro ao salvar categoria no servidor.");
        }
    } catch (erro) {
        console.error("Falha na requisição da categoria:", erro);
    }
};




// 🛡️ MOTOR DE INTELIGÊNCIA: Controla a Interação Humana bloqueando ou liberando os campos financeiros
function alternarBloqueioCampos() {
    const origem = document.getElementById("origemCadastro").value;
    
    // Lista de campos que sofrem a ação da regra de negócio
    const camposFinanceiros = [
        "precoCusto",
        "precoVenda",
        "qteEntrada",
        "estoqueAtual"
    ];

    if (origem === "COM_NF") {
        // Cenário Oficial: Desabilita e limpa os campos para a Entrada.html assumir o controle
        camposFinanceiros.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                campo.disabled = true;
                campo.required = false;
                campo.value = "0.00"; // Reseta por segurança
            }
        });
        console.log("🔒 Modo Oficial ATIVO: Preços bloqueados no Cadastro. Deixe a Entrada.html ditar os valores.");
    } else {
        // Cenário Artesanal Livre: Libera os campos e força a obrigatoriedade
        camposFinanceiros.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                campo.disabled = false;
                campo.required = true; // Exige o preenchimento nativo
                if(campo.value === "0.00" || campo.value === "0") campo.value = ""; // Limpa para digitação
            }
        });
        console.log("🔓 Modo Artesanal ATIVO: Campos liberados e exigidos no preenchimento.");
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

// 💾 SALVAR / ALTERAR PRODUTO (Payload enviado ao Java totalmente atualizado com Código de Barras)
async function cadastrarProduto(event) {
    event.preventDefault();

    const idFornecedor = document.getElementById("selecionaFornecedor").value;
    const idCategoria = document.getElementById("selectCategoria").value;

    // 🛡️ Travas de segurança: impede o envio se faltar a amarra de um dos dois lados
    if (!idFornecedor) {
        alert("❌ Atenção! Selecione um fornecedor obrigatório.");
        return;
    }
    if (!idCategoria) {
        alert("❌ Atenção! Selecione uma categoria/setor obrigatório.");
        return;
    }

    const produtoDados = {
        nome: document.getElementById("nomeProduto").value,
        codigoBarras: document.getElementById("codigoBarras").value.trim() || null,
        aGranel: document.getElementById("tipoProduto").value === "true",
		precoCusto: parseFloat(document.getElementById("precoCusto").value) || 0,
		precoVenda: parseFloat(document.getElementById("precoVenda").value) || 0,
		
		// precoCusto: parseFloat(document.getElementById("precoCusto").value),
        //precoVenda: parseFloat(document.getElementById("precoVenda").value),
  //      dataValidade: document.getElementById("dataValidade").value || null,
        qteEntrada: parseInt(document.getElementById("qteEntrada").value) || 0,
        estoqueAtual: parseInt(document.getElementById("estoqueAtual").value) || 0,
        
        // 🔗 Vinculos estruturados exigidos pelo Hibernate no Spring Boot
        fornecedor: { id: parseInt(idFornecedor, 10) },
        categoria: { id: parseInt(idCategoria, 10) }
    };

    const url = produtoSelecionadoId ? `${API_URL}/produtos/${produtoSelecionadoId}` : `${API_URL}/produtos`;
    const metodo = produtoSelecionadoId ? "PUT" : "POST";

    try {
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
            
            // 🔄 Garante que após o reset, o select de categorias volte para o estado inicial correto
            document.getElementById("selectCategoria").value = "";
            
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
// 📦 CARREGAR LISTA DE FORNECEDORES NO DROP-DOWN (Corrigido para bater com a API)

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



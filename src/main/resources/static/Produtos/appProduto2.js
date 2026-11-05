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
document.addEventListener("DOMContentLoaded", () => {
    carregarFornecedores();
    carregarProdutos();
    document.getElementById("formProduto").addEventListener("submit", cadastrarProduto);
    
    // 🧮 Regra COBOL de consistência: Se for inclusão, o estoque acompanha a entrada inicial
    document.getElementById("qteEntrada").addEventListener("input", () => {
        if (!produtoSelecionadoId) {
            document.getElementById("estoqueAtual").value = document.getElementById("qteEntrada").value;
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
    document.querySelectorAll(".produto-item").forEach(r => r.classList.remove("selecionado"));
    bloquearFormulario(false);
    document.getElementById("codigoBarras").focus(); // Foco inicial direto no código de barras
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
    
    const produtoDados = {
        nome: document.getElementById("nomeProduto").value,
        codigoBarras: document.getElementById("codigoBarras").value.trim() || null,
        fornecedorId: parseInt(document.getElementById("selecionaFornecedor").value),
        aGranel: document.getElementById("tipoProduto").value === "true",
        precoCusto: parseFloat(document.getElementById("precoCusto").value),
        precoVenda: parseFloat(document.getElementById("precoVenda").value),
        dataValidade: document.getElementById("dataValidade").value || null,
        qteEntrada: parseInt(document.getElementById("qteEntrada").value) || 0,
        estoqueAtual: parseInt(document.getElementById("estoqueAtual").value) || 0
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
            alert(produtoSelecionadoId ? "Produto alteredo!" : "Produto cadastrado!");
            document.getElementById("formProduto").reset();
            document.getElementById("valorMargem").textContent = "0.00";
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

// 📦 BUSCAR PRODUTOS E MONTAR OS BLOCOS COLAPSÁVEIS (ÁRVORE)
async function carregarProdutos() {
    try {
        const response = await fetch(`${API_URL}/produtos`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        console.log("GET /produtos status:", response.status);
        if (!response.ok) {
            const erro = await response.text();
            console.error("Erro ao carregar produtos:", response.status, erro);
            return;
        }
        
        const produtos = await response.json();
        listaProdutosGeral = produtos; // Atualiza o cache local para buscas do leitor USB
        console.log("Produtos carregados:", produtos);
        
        const container = document.getElementById("containerFornecedoresProdutos");
        if (!container) {
            console.error("Container containerFornecedoresProdutos não encontrado.");
            return;
        }
        container.innerHTML = "";
        
        // 🌳 FORNECEDOR = PAI / PRODUTOS = FILHOS
        const agrupadoPorFornecedor = {};
        produtos.forEach(prod => {
            const fornecedorNome = prod.fornecedor ? prod.fornecedor.nome : "Sem Fornecedor";
            if (!agrupadoPorFornecedor[fornecedorNome]) {
                agrupadoPorFornecedor[fornecedorNome] = [];
            }
            agrupadoPorFornecedor[fornecedorNome].push(prod);
        });
        
        // Ordena os fornecedores alfabeticamente
        const fornecedoresOrdenados = Object.keys(agrupadoPorFornecedor).sort((a, b) => a.localeCompare(b, "pt-BR"));
        
        fornecedoresOrdenados.forEach(fornecedorNome => {
            const produtosFornecedor = agrupadoPorFornecedor[fornecedorNome];
            const divGrupo = document.createElement("div");
            divGrupo.style.marginBottom = "10px";
            
            // 📁 Cabeçalho do fornecedor
            const btnHeader = document.createElement("button");
            btnHeader.type = "button";
            btnHeader.className = "fornecedor-header";
            btnHeader.innerHTML = `📁 <strong>${fornecedorNome}</strong> (${produtosFornecedor.length})`;
            
            // Área dos produtos começa fechada
            const divProdutosList = document.createElement("div");
            divProdutosList.className = "produtos-lista";
            divProdutosList.style.display = "none";
            
            btnHeader.addEventListener("click", () => {
                const estaFechado = divProdutosList.style.display === "none";
                divProdutosList.style.display = estaFechado ? "block" : "none";
            });
            
            // Alimenta os filhos (Produtos)
            produtosFornecedor.forEach(p => {
                const item = document.createElement("div");
                item.className = "produto-item";
                item.id = `prod-item-${p.id}`;
                item.innerHTML = `<span>📦 ${p.nome} ${p.codigoBarras ? `[${p.codigoBarras}]` : ''}</span> <span>Estoque: ${p.estoqueAtual}</span>`;
                
                item.addEventListener("click", () => {
                    carregarProdutoNoFormulario(p);
                });
                
                divProdutosList.appendChild(item);
            });
            
            divGrupo.appendChild(btnHeader);
            divGrupo.appendChild(divProdutosList);
            container.appendChild(divGrupo);
        });
    } catch (e) {
        console.error("Falha ao processar a árvore de produtos:", e);
    }
}

// 📝 CARREGA OS DADOS SELECIONADOS DIRETAMENTE NO FORMULÁRIO
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








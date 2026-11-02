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
    
    bloquearFormulario(true);
});

// 🛠️ AUXILIAR DE CONTROLE DOS CAMPOS (Afinado com os novos campos)
function bloquearFormulario(status) {
	   document.getElementById("nomeProduto").disabled = status;
	   document.getElementById("selecionaFornecedor").disabled = status;
	   document.getElementById("tipoProduto").disabled = status;
	   document.getElementById("dataValidade").disabled = status;
	   document.getElementById("precoCusto").disabled = status;
	   document.getElementById("precoVenda").disabled = status;
	   document.getElementById("qteEntrada").disabled = status;
    
    // 🆕 Novos campos integrados no bloqueio de tela
    document.getElementById("qteEntrada").disabled = status;
    document.getElementById("estoqueAtual").disabled = status;
    
    document.getElementById("btnSalvar").disabled = status;
    document.getElementById("formProduto").style.opacity = status ? "0.5" : "1";
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
    document.getElementById("nomeProduto").focus();
}

// 💾 SALVAR / ALTERAR PRODUTO (Payload enviado ao Java totalmente atualizado)
async function cadastrarProduto(event) {
    event.preventDefault();
    
    const produtoDados = {
        nome: document.getElementById("nomeProduto").value,
        fornecedorId: parseInt(document.getElementById("selecionaFornecedor").value),
        aGranel: document.getElementById("tipoProduto").value === "true",
        precoCusto: parseFloat(document.getElementById("precoCusto").value),
        precoVenda: parseFloat(document.getElementById("precoVenda").value),
        dataValidade: document.getElementById("dataValidade").value || null,
        
        // 🆕 Enviando as novas variáveis estruturadas para a API do Spring
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
            alert(produtoSelecionadoId ? "Produto alterado!" : "Produto cadastrado!");
            document.getElementById("formProduto").reset();
            document.getElementById("valorMargem").textContent = "0.00";
            produtoSelecionadoId = null;
            bloquearFormulario(true);
            carregarProdutos();
        } else {
            const erro = await response.text();
            console.error("Erro ao salvar produto:", response.status, erro);
            alert("Erro ao salvar produto.");
        }
    } catch (e) {
        console.error("Falha ao salvar produto:", e);
        alert("Falha de comunicação ao salvar produto.");
    }
}
// 💾 SALVAR / ALTERAR PRODUTO

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
            
            // Ordena os produtos do fornecedor
            produtosFornecedor
                .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
                .forEach(prod => {
                    const item = document.createElement("div");
                    item.className = "produto-item";
                    
                    // Alerta de validade nos próximos 30 dias
                    if (prod.dataValidade) {
                        const hoje = new Date();
                        hoje.setHours(0, 0, 0, 0);
                        const validade = new Date(`${prod.dataValidade}T00:00:00`);
                        const diferencaDias = (validade - hoje) / (1000 * 60 * 60 * 24);
                        if (diferencaDias >= 0 && diferencaDias <= 30) {
                            item.style.cssText = "background-color: rgba(255,0,0,0.15);" + "border-left: 4px solid #ff4d4d;" + "color: #ff9999;";
                        }
                    }
                    
                    const custo = Number(prod.precoCusto) || 0;
                    const venda = Number(prod.precoVenda) || 0;
                    const margem = custo > 0 ? (((venda - custo) / custo) * 100).toFixed(0) : "0";
                    const tipoLabel = prod.aGranel ? "[Granel]" : "[Unid]";
                    const validadeLabel = prod.dataValidade ? ` | Val: ${new Date(`${prod.dataValidade}T00:00:00`).toLocaleDateString("pt-BR")}` : "";
                    
                    // 🆕 Captura segura dos novos campos numéricos vindos do Java
                    const qteEntradaShow = prod.qteEntrada || 0;
                    const estoqueAtualShow = prod.estoqueAtual || 0;
                    
                    // 🆕 Exibe o estoque atual com destaque verde na árvore de visualização
                    item.innerHTML = `
                        <span>
                            📦 <strong>${prod.id}</strong> - ${prod.nome} 
                            <small style="color:#ff9800;"> ${tipoLabel} </small>
                            <small style="color:#4caf50; font-weight:bold; margin-left:10px;">Estoque: ${estoqueAtualShow}</small>
                        </span>
                        <span>
                            Cust: R$ ${custo.toFixed(2)} | Vend: R$ ${venda.toFixed(2)} | <strong>Lucro: ${margem}%</strong> ${validadeLabel}
                        </span>
                    `;
                    
                    // Dados usados pelos botões Alterar e Excluir
                    item.dataset.id = prod.id;
                    item.dataset.nome = prod.nome;
                    item.dataset.fornecedorid = prod.fornecedor ? prod.fornecedor.id : "";
                    item.dataset.agranel = prod.aGranel;
                    item.dataset.precocusto = custo;
                    item.dataset.precovenda = venda;
                    item.dataset.datavalidade = prod.dataValidade || "";
                    
                    // 🆕 Alimenta a árvore DOM com os dados de controle de estoque
                    item.dataset.qteentrada = qteEntradaShow;
                    item.dataset.estoqueatual = estoqueAtualShow;
                    
                    item.addEventListener("click", e => {
                        e.stopPropagation();
                        document.querySelectorAll(".produto-item").forEach(elemento => elemento.classList.remove("selecionado"));
                        item.classList.add("selecionado");
                        produtoSelecionadoId = Number(prod.id);
                    });
                    
                    divProdutosList.appendChild(item);
                });
                
            divGrupo.appendChild(btnHeader);
            divGrupo.appendChild(divProdutosList);
            container.appendChild(divGrupo);
        });
    } catch (e) {
        console.error("Erro ao carregar árvore de produtos:", e);
    }
}

async function carregarFornecedores() {
    try {
        const response = await fetch(`${API_URL}/api/fornecedores`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        console.log("GET /fornecedores status:", response.status);
        if (response.ok) {
            const fornecedores = await response.json();
            console.log("Fornecedores carregados:", fornecedores);
            const select = document.getElementById("selecionaFornecedor");
            if (select) {
                select.innerHTML = '<option value="">Selecione...</option>';
                fornecedores.forEach(f => {
                    const opt = document.createElement("option");
                    opt.value = f.id;
                    opt.textContent = f.nome;
                    select.appendChild(opt);
                });
            }
        } else {
            console.error("Erro na resposta de fornecedores:", response.status);
        }
    } catch (e) {
        console.error("Falha ao carregar fornecedores:", e);
    }
}

// 🔵 BOTÃO ALTERAR (PUXA OS DADOS DA ÁRVORE PARA OS INPUTS)
function acionarAlterar() {
    if (!produtoSelecionadoId) {
        alert("Clique em um produto dentro de um fornecedor para selecioná-lo!");
        return;
    }
    const item = document.querySelector(".produto-item.selecionado");
    if (item) {
        bloquearFormulario(false);
        document.getElementById("nomeProduto").value = item.dataset.nome;
        document.getElementById("selecionaFornecedor").value = item.dataset.fornecedorid;
        document.getElementById("tipoProduto").value = item.dataset.agranel;
        document.getElementById("precoCusto").value = item.dataset.precocusto;
        document.getElementById("precoVenda").value = item.dataset.precovenda;
        document.getElementById("dataValidade").value = item.dataset.datavalidade;
        
        // 🆕 Joga os valores de estoque do item selecionado para as caixas do formulário
        document.getElementById("qteEntrada").value = item.dataset.qteentrada;
        document.getElementById("estoqueAtual").value = item.dataset.estoqueatual;
        
        // 🔒 Regra de integridade: em alterações, o estoque atual fica travado para não ser burlado manualmente.
        document.getElementById("estoqueAtual").disabled = true;
        
        calcularMargem();
        document.getElementById("nomeProduto").focus();
    }
}

// 🔴 BOTÃO EXCLUIR (Corrigido para a rota certa)
async function acionarExcluir() {
    if (!produtoSelecionadoId) {
        alert("Selecione um produto primeiro!");
        return;
    }
    if (confirm("Deseja excluir o produto selecionado?")) {
        try {
            const response = await fetch(`${API_URL}/produtos/${produtoSelecionadoId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                alert("Produto excluído com sucesso!");
                document.getElementById("formProduto").reset();
                document.getElementById("valorMargem").textContent = "0.00";
                bloquearFormulario(true);
                carregarProdutos();
            } else {
                alert("Erro ao excluir produto.");
            }
        } catch (e) {
            console.error(e);
        }
    }
}






















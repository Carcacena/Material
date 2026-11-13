// =========================================================================
// 🚀 SISTEMA MAGIA - BALCÃO DE VENDAS INTELIGENTE
// Módulo Mestre: venda.js (Parte 1 - Inicialização, Login e Modais)
// =========================================================================

// Configuração inteligente da URL base do servidor
const API_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080"
        : window.location.origin;

// Variables Globais de Balcão (Memória Estilo COBOL)
window.ufOrigemSistemaInstalado = "PR"; // Sincroniza a UF padrão para o cálculo do ICMS interestadual
window.proximaNotaFiscalPrevista = null;

// =========================================================================
// CONTROLE DE AUTENTICAÇÃO JWT
// =========================================================================
const dadosLoginString = localStorage.getItem("token");
let token = null;

if (dadosLoginString) {
    try {
        const dadosLogin = JSON.parse(dadosLoginString);
        token = dadosLogin.token;
    } catch (e) {
        token = dadosLoginString;
    }
}

if (!token) {
    window.location.href = "login.html";
}

// =========================================================================
// MEMÓRIA COMPARTILHADA DO SISTEMA
// =========================================================================
let listaProdutosGlobal = [];
let produtoSelecionadoId = null;
let precoPraticadoVenda = 0;
let totalAcumuladoCupom = 0;

// Array para acumular os materiais na lateral esquerda da árvore flutuante
let loteTemporarioProdutos = [];

// =========================================================================
// MÓDULO DO MODAL FLUTUANTE DA ÁRVORE (Gatilhos de Janela)
// =========================================================================
function abrirModalProdutos() {
    const modalOverlay = document.getElementById('modal-arvore-produtos');
    if (modalOverlay) {
        modalOverlay.style.display = 'flex'; // Exibe a cortina e centraliza a árvore
        
        // Foca automaticamente no campo de busca interno se houver
        const buscaModal = document.getElementById('busca-interna-modal');
        if (buscaModal) buscaModal.focus();
    }
}

function fecharModalArvoreProdutos() {
    const modalOverlay = document.getElementById('modal-arvore-produtos');
    if (modalOverlay) {
        modalOverlay.style.display = 'none'; // Esconde a árvore e volta pro balcão
    }
}

// =========================================================================
// GESTÃO DO LOTE TEMPORÁRIO INTERNO DO MODAL
// =========================================================================

// 1. Adiciona o produto na conferência lateral da árvore
function adicionarAoLoteTemporario(id, nome, preco) {
    const itemExistente = loteTemporarioProdutos.find(item => item.id === id);

    if (itemExistente) {
        itemExistente.qtd += 1;
    } else {
        loteTemporarioProdutos.push({ id: id, nome: nome, preco: preco, qtd: 1 });
    }

    renderizarLoteTemporarioInterface();
}

// 2. Atualiza a mini listagem direita de conferência do modal
function renderizarLoteTemporarioInterface() {
    const container = document.getElementById('lista-lote-temporario');
    if (!container) return;

    if (loteTemporarioProdutos.length === 0) {
        container.innerHTML = `<div class="mensagem-vazia" style="padding: 20px 0; font-size: 13px;">Nenhum item selecionado.</div>`;
        return;
    }

    let html = `<ul style="list-style: none; padding: 0; margin: 0; color: white; font-size: 13px;">`;
    loteTemporarioProdutos.forEach(item => {
        html += `
            <li class="d-flex justify-content-between align-items-center mb-2" style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px;">
                <span>📦 <strong>${item.qtd}x</strong> ${item.nome}</span>
                <span style="color: #5eff5e; font-weight: bold;">R$ ${(item.preco * item.qtd).toFixed(2)}</span>
            </li>
        `;
    });
    html += `</ul>`;
    container.innerHTML = html;
}

// 3. O Botão CONFIRMA descarrega o lote no cupom definitivo lá atrás
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'btn-confirma-lote-modal') {
        if (loteTemporarioProdutos.length === 0) {
            alert("Escolha ao menos um produto antes de confirmar!");
            return;
        }

        // Envia os itens selecionados em lote para o seu 'modulo-cupom.js'
        loteTemporarioProdutos.forEach(item => {
            if (typeof adicionarProdutoAoCupomReal === "function") {
                adicionarProdutoAoCupomReal(item.id, item.nome, item.preco, item.qtd);
            }
        });

        // Reseta o lote para a próxima abertura
        loteTemporarioProdutos = [];
        renderizarLoteTemporarioInterface();

        // Recolhe o modal
        fecharModalArvoreProdutos();
    }
});

// =========================================================================
// CONFIGURAÇÃO DOS ATALHOS DE TECLADO
// =========================================================================
function configurarAtalhosTeclado() {
    document.removeEventListener("keydown", lidarComAtalhos);
    document.addEventListener("keydown", lidarComAtalhos);
}

function lidarComAtalhos(e) {
    if (e.key === "F2") {
        e.preventDefault();
        abrirModalProdutos(); // Abre a árvore por atalho físico do teclado
    }
    if (e.key === "F10") {
        e.preventDefault();
        if (typeof abrirPainelFechamento === "function") abrirPainelFechamento();
    }
}

// =========================================================================
// 🔄 FUNÇÃO FISCAL: Busca a Origem no Banco e projeta a Próxima NF-e no Painel
// =========================================================================
async function carregarProximaNotaNoPainel() {
    if (!token) return;

    try {
        console.log("🔍 [venda.js] Consultando sequência na Origem do Sistema...");
        
        const response = await fetch(`${API_URL}/api/origemsistema`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const listaOrigens = await response.json();
            console.log("📊 [Auditoria] O Java devolveu estas Origens:", listaOrigens);
            
            // ⚡ XEQUE-MATE NA PIRRAÇA: Aceita qualquer variação que o Java ou o MySQL mandarem (true, "S", 1 ou "1")
            const matrizAtiva = listaOrigens.find(o => 
                o.origemSistema === true || 
                o.origem_sistema === true || 
                o.origemSistema === 1 || 
                o.origem_sistema === 1 ||
                o.origemSistema === "1" || 
                o.origem_sistema === "1" ||
                o.origemSistemaTela === "S"
            );
            
            if (matrizAtiva) {
                // Trata as variações do nome do campo notafiscal (Java CamelCase vs MySQL snake_case)
                const valorNotaFiscal = matrizAtiva.notafiscal || matrizAtiva.nota_fiscal || "";
                const valorUf = matrizAtiva.uf || "PR";

                if (valorNotaFiscal) {
                    // Sincroniza a UF global para a auditoria de alíquota interestadual
                    window.ufOrigemSistemaInstalado = valorUf;

                    // Pega a String '1956' do MySQL, limpa letras e calcula o próximo (+1)
                    const ultimaNotaGravada = parseInt(valorNotaFiscal.toString().replace(/\D/g, "")) || 0;
                    const proximaNotaFiscal = ultimaNotaGravada + 1;
                    
                    console.log(`📄 [Sucesso] Última Nota: ${ultimaNotaGravada} | Próxima NF-e: ${proximaNotaFiscal}`);
                    
                    // Injeta com estilo o número na sua nova caixa 'PRÓX NF'
                    const painelDisplay = document.getElementById("displayProximaNotaFiscal");
                    if (painelDisplay) {
                        painelDisplay.textContent = proximaNotaFiscal;
                    }
                    
                    // Guarda em memória para uso compartilhado das outras janelas
                    window.proximaNotaFiscalPrevista = proximaNotaFiscal;
                } else {
                    console.warn("⚠️ Matriz ativa localizada, mas o campo 'notafiscal' veio vazio.");
                }
            } else {
                console.warn("❌ Nenhuma matriz operacional ativa foi identificada no filtro do JavaScript.");
            }
        }
    } catch (error) {
        console.error("⚠️ Falha ao projetar numeração fiscal no cabeçalho:", error);
    }
}

// =========================================================================
// ORQUESTRADOR DE INICIALIZAÇÃO DA MESA DE NEGOCIAÇÃO
// =========================================================================
function inicializarLogicaVenda() {
    configurarAtalhosTeclado();

    if (typeof carregarProdutosPDV === "function") {
        carregarProdutosPDV();
    }
}

// ⚡ DISPARADOR AUTOMÁTICO DO SCRIPT: Executa ao carregar o DOM da página
document.addEventListener("DOMContentLoaded", () => {
    inicializarLogicaVenda();
    
    // Alimenta a caixa verde 'PRÓX NF' em tempo de execução
    carregarProximaNotaNoPainel();
});

// Resguarda compatibilidade caso alguma rotina antiga chame a função esvaziada
function adicionarItemNaLista() {
    console.log("Faturamento direto desativado. Utilizando fluxo em árvore.");
}








// /Entradas/funcoesAuxiliares.js

// Estado global compartilhado
//let itensNota = [];
// Estado global compartilhado com trava de segurança anti-duplicação
if (typeof window.itensNota === 'undefined') {
    window.itensNota = [];
}

function montarHeaders() {
    const meusHeaders = { 'Content-Type': 'application/json' };
    const tokenArmazenado = localStorage.getItem('token');
    if (tokenArmazenado) {
        try {
            const objetoToken = JSON.parse(tokenArmazenado);
            const jwtPuro = objetoToken.token;
            if (jwtPuro) meusHeaders['Authorization'] = `Bearer ${jwtPuro}`;
        } catch (e) {
            const jwtLimpo = tokenArmazenado.replace(/^Bearer\s+/i, '');
            meusHeaders['Authorization'] = `Bearer ${jwtLimpo}`;
        }
    }
    return meusHeaders;
}

function adicionarItem() {
    const prodSelect = document.getElementById('selectProduto');
    if (!prodSelect) return;
    const produtoId = prodSelect.value;
    const produtoTexto = prodSelect.options[prodSelect.selectedIndex].text;
    const qtd = parseFloat(document.getElementById('qtdEntrada').value);
    const custo = parseFloat(document.getElementById('precoCusto').value);

    if (!produtoId || isNaN(qtd) || isNaN(custo) || qtd <= 0 || custo <= 0) {
        alert("⚠️ Atenção: Preencha todos os campos do produto com valores válidos antes de adicionar!");
        return;
    }

    itensNota.push({
        produtoId: parseInt(produtoId),
        quantidade: parseInt(qtd),
        precoCusto: custo
    });

    const tabela = document.getElementById('tabelaItens').getElementsByTagName('tbody')[0];
    const novaLinha = tabela.insertRow();
    novaLinha.innerHTML = `
        <td>
            ${produtoTexto}
            <label style="margin-left: 15px; color: #ff4a4a; font-size: 12px; cursor:pointer;">
                <input type="checkbox" class="check-excluir-item"> Excluir
            </label>
        </td>
        <td>${qtd}</td>
        <td>R$ ${custo.toFixed(2)}</td>
        <td>R$ ${(qtd * custo).toFixed(2)}</td>
    `;

    prodSelect.value = '';
    document.getElementById('qtdEntrada').value = '1';
    document.getElementById('precoCusto').value = '';

    atualizarTotalProdutosDoModal();
}

// ----------------------------------------------------
// 🎛️ CONTROLE DOS IMPOSTOS E TELA FLUTUANTE
// ----------------------------------------------------
function abrirModalImpostos() {

    const modal = document.getElementById("modalImpostos");

    if (modal) modal.style.display = "block";

    atualizarTotalProdutosDoModal();

}






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
















































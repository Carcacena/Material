// =========================================================================
// 💊 MÓDULO REGULATÓRIO FARMACÊUTICO (ANVISA / SNGPC) - appFarmacia.js
// =========================================================================

// 🎨 ASSINATURA VISUAL DAS CATEGORIAS FIXAS DO SISTEMA (PROTEGIDAS CONTRA EDIÇÃO/EXCLUSÃO)
const MAPA_CATEGORIAS_FIXAS = {
    "AGRICULTURA FAMILIAR": "#4af37a", // Verde Campo
    "CERÂMICA":             "#ff9800", // Laranja Terracota
    "FARMÁCIA":             "#ff4d4d", // Vermelho Cruz / Saúde
    "JURÍDICO":             "#facc15", // Dourado Justiça
    "ODONTOLOGIA":          "#38bdf8", // Azul Clínico
    "PERFUME":              "#e879f9", // Magenta / Lilás Fragrância
    "ELETRICOS": 			"#E1BEE7", // Lilás Suave (Lavanda)
    "VETERINÁRIOS":         "#2dd4bf",  // Verde-Água Pet / Agro
	"FERRAMENTAS":          "#facc15", // Dourado Justiça
	"RESTAURAANTE":         "#4A148C", // Roxo Profundo
	"LIMPEZA":              "#FF9800", // Laranja Vibrante
	"PISOS E AZULEJOS":     "#BA68C8 "  , // lilás médio
	
	
	
	
  
	
	
	
	
};

function obterCorCategoriaFixa(nomeCategoria) {
    if (!nomeCategoria) return null;
    return MAPA_CATEGORIAS_FIXAS[nomeCategoria.trim().toUpperCase()] || null;
}



window.ehCategoriaFarmacia = function () {
    const select = document.getElementById("selectCategoria");
    if (!select || select.selectedIndex < 0) return false;

    const texto = select.options[select.selectedIndex].text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();

    return texto.includes("REMEDIO") || texto.includes("MEDICAMENTO") || texto.includes("FARMACIA");
};

window.verificarPainelFarmacia = function () {
    const painel = document.getElementById("blocoDadosFarmacia");
    const campoValidade = document.getElementById("validade");
    const select = document.getElementById("selectCategoria");
    if (!painel) return;

    const ativar = ehCategoriaFarmacia();
    painel.style.display = ativar ? "block" : "none";

    const todosCamposFarmacia = ["registroMs", "principioAtivo", "tipoTarja", "lote", "pmc"];
    const obrigatorios = ["registroMs", "principioAtivo", "tipoTarja", "lote"];

    todosCamposFarmacia.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = !ativar;
            el.readOnly = false;
            el.required = ativar && obrigatorios.includes(id);
            el.style.opacity = ativar ? "1" : "0.6";
            el.style.pointerEvents = ativar ? "auto" : "none";
        }
    });

    if (campoValidade) {
        campoValidade.required = ativar;
        if (ativar) campoValidade.disabled = false;
    }

    // 🎨 Pinta o texto do select fechado com a cor da categoria fixa escolhida
    if (select && select.selectedIndex >= 0 && typeof obterCorCategoriaFixa === "function") {
        const textoSelecionado = select.options[select.selectedIndex].text;
        select.style.color = obterCorCategoriaFixa(textoSelecionado) || "#ffffff";
        select.style.fontWeight = obterCorCategoriaFixa(textoSelecionado) ? "bold" : "normal";
    }
};


window.obterPayloadFarmacia = function () {
    if (!ehCategoriaFarmacia()) {
        return {
            registroMs: null,
            principioAtivo: null,
            tipoTarja: null,
            lote: null,
            pmc: null
        };
    }

    const pmcValor = document.getElementById("pmc")?.value;

    return {
        registroMs: document.getElementById("registroMs")?.value.trim() || null,
        principioAtivo: document.getElementById("principioAtivo")?.value.trim() || null,
        tipoTarja: document.getElementById("tipoTarja")?.value || "MIP",
        lote: document.getElementById("lote")?.value.trim() || null,
        pmc: pmcValor ? parseFloat(pmcValor) : null
    };
};

window.preencherDadosFarmacia = function (dadosFarmacia) {
    const campos = ["registroMs", "principioAtivo", "tipoTarja", "lote", "pmc"];
    if (!dadosFarmacia) {
        campos.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = (id === "tipoTarja") ? "MIP" : "";
        });
    } else {
        if (document.getElementById("registroMs")) document.getElementById("registroMs").value = dadosFarmacia.registroMs || "";
        if (document.getElementById("principioAtivo")) document.getElementById("principioAtivo").value = dadosFarmacia.principioAtivo || "";
        if (document.getElementById("tipoTarja")) document.getElementById("tipoTarja").value = dadosFarmacia.tipoTarja || "MIP";
        if (document.getElementById("lote")) document.getElementById("lote").value = dadosFarmacia.lote || "";
        if (document.getElementById("pmc")) document.getElementById("pmc").value = dadosFarmacia.pmc || "";
    }
    verificarPainelFarmacia();
};

document.addEventListener("DOMContentLoaded", () => {
    const selectCat = document.getElementById("selectCategoria");
    if (selectCat) {
        selectCat.addEventListener("change", verificarPainelFarmacia);
    }
});

// =========================================================================
// 🛡️ PROTEÇÃO CONTRA CAMPOS OCULTOS COM 'REQUIRED' AO SALVAR (F10 / SUBMIT)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formProduto");
    if (form) {
        // Intercepta qualquer tentativa de validação antes do navegador reclamar
        form.addEventListener("invalid", (e) => {
            const campo = e.target;
            // Se o campo ou o bloco pai dele estiver oculto (offsetParent === null)
            if (campo.offsetParent === null) {
                campo.required = false;
                campo.disabled = true;
            }
        }, true); // 'true' captura o evento antes do erro aparecer no console
    }
});
// =========================================================================
// 🔴 DESTAQUE EM VERMELHO E REGRAS PARA CATEGORIAS FIXAS DO SISTEMA
// =========================================================================
window.ehCategoriaFixa = function (nome) {
    if (!nome) return false;
    const limpo = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    return limpo.includes("FARMACIA") || limpo.includes("AGRICULTURA FAMILIAR");
};

window.estilizarCategoriasFixas = function () {
    const select = document.getElementById("selectCategoria");
    if (!select) return;

    // 1. Pinta de vermelho as opções fixas dentro da lista suspensa
    Array.from(select.options).forEach(opt => {
        if (ehCategoriaFixa(opt.text)) {
            opt.style.color = "#ff5252";
            opt.style.fontWeight = "bold";
            opt.style.backgroundColor = "#1e272e";
        }
    });

    // 2. Pinta de vermelho o próprio campo <select> se a opção atual for fixa
    const textoAtual = select.options[select.selectedIndex]?.text || "";
    if (ehCategoriaFixa(textoAtual)) {
        select.style.color = "#ff5252";
        select.style.fontWeight = "bold";
    } else {
        select.style.color = "";
        select.style.fontWeight = "";
    }

    // 3. Se for AGRICULTURA FAMILIAR, muda automaticamente para "Sem Nota Fiscal"
    const limpoAtual = textoAtual.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    if (limpoAtual.includes("AGRICULTURA FAMILIAR")) {
        const origem = document.getElementById("origemCadastro");
        if (origem && origem.value !== "SEM_NF") {
            origem.value = "SEM_NF";
            if (typeof alternarBloqueioCampos === "function") {
                alternarBloqueioCampos();
            }
        }
    }
};
// =========================================================================
// 🚀 INICIALIZAÇÃO UNIFICADA DOS EVENTOS DO MÓDULO
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    const selectCat = document.getElementById("selectCategoria");
    if (selectCat) {
        selectCat.addEventListener("change", () => {
            verificarPainelFarmacia();
            estilizarCategoriasFixas();
        });

        const observer = new MutationObserver(() => {
            estilizarCategoriasFixas();
        });
        observer.observe(selectCat, { childList: true });
    }

    const form = document.getElementById("formProduto");
    if (form) {
        form.addEventListener("invalid", (e) => {
            const campo = e.target;
            if (campo.offsetParent === null) {
                campo.required = false;
                campo.disabled = true;
            }
        }, true);
    }
});







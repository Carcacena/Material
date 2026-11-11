// 🖼️ MÓDULO DE UPLOAD DE IMAGENS - SISTEMA MAGIA
// Caminho: /MaterialConstrucao/src/main/resources/static/menu/appUploadImagens.js

const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "/login.html";
}

const API_URL = window.location.origin;
let arquivoSelecionado = null;

// 🚀 INICIALIZAÇÃO AO CARREGAR A TELA
document.addEventListener("DOMContentLoaded", () => {
    carregarProdutosParaSelect();
    configurarEventosUpload();
});

// 1. Carrega os produtos cadastrados no <select> para vincular a imagem
async function carregarProdutosParaSelect() {
    const selectProduto = document.getElementById("selectProdutoImagem");
    if (!selectProduto) return;

    try {
        const resposta = await fetch(`${API_URL}/produtos`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (resposta.ok) {
            const produtos = await resposta.json();
            selectProduto.innerHTML = '<option value="">-- Selecione o Produto para Vincular a Foto --</option>';
            
            produtos
                .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
                .forEach(prod => {
                    const option = document.createElement("option");
                    option.value = prod.id;
                    option.textContent = `${prod.nome.toUpperCase()} (ID: ${prod.id})`;
                    selectProduto.appendChild(option);
                });
        }
    } catch (erro) {
        console.error("Erro ao carregar lista de produtos:", erro);
    }
}

// 2. Configura a pré-visualização instantânea e travas de tamanho/tipo
function configurarEventosUpload() {
    const inputArquivo = document.getElementById("inputArquivoImagem");
    const imgPreview = document.getElementById("imgPreview");
    const textoStatus = document.getElementById("statusArquivo");

    if (!inputArquivo) return;

    inputArquivo.addEventListener("change", (evento) => {
        const file = evento.target.files[0];
        if (!file) {
            limparSelecao();
            return;
        }

        // 🛡️ Trava 1: Valida se é realmente imagem (JPG, PNG, WEBP)
        const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
        if (!tiposPermitidos.includes(file.type)) {
            alert("⚠️ Formato inválido! Escolha apenas imagens JPG, PNG ou WEBP.");
            limparSelecao();
            return;
        }

        // 🛡️ Trava 2: Limite de 5MB para não pesar o servidor/banco
        const tamanhoMaximoMB = 5 * 1024 * 1024;
        if (file.size > tamanhoMaximoMB) {
            alert("⚠️ A imagem ultrapassa o limite máximo de 5MB. Escolha uma foto mais leve.");
            limparSelecao();
            return;
        }

        arquivoSelecionado = file;

        // Exibe a miniatura na hora na tela antes mesmo de enviar
        if (imgPreview) {
            const leitor = new FileReader();
            leitor.onload = (e) => {
                imgPreview.src = e.target.result;
                imgPreview.style.display = "block";
            };
            leitor.readAsDataURL(file);
        }

        if (textoStatus) {
            const tamanhoKB = (file.size / 1024).toFixed(1);
            textoStatus.textContent = `✅ Arquivo pronto: ${file.name} (${tamanhoKB} KB)`;
            textoStatus.style.color = "#4af37a";
        }
    });
}

// 3. Envia a imagem via MultipartFormData para o Spring Boot
async function enviarImagemProduto() {
    const selectProduto = document.getElementById("selectProdutoImagem");
    const produtoId = selectProduto ? selectProduto.value : "";
    const btnEnviar = document.getElementById("btnEnviarImagem");

    if (!produtoId) {
        alert("⚠️ Por favor, selecione qual produto vai receber esta imagem!");
        if (selectProduto) selectProduto.focus();
        return;
    }

    if (!arquivoSelecionado) {
        alert("⚠️ Selecione uma imagem no computador antes de enviar!");
        return;
    }

    // ⚠️ Não definir 'Content-Type' manual no headers quando usar FormData (o navegador define o boundary sozinho)
    const formData = new FormData();
    formData.append("arquivo", arquivoSelecionado);
    formData.append("produtoId", produtoId);

    try {
        if (btnEnviar) {
            btnEnviar.disabled = true;
            btnEnviar.textContent = "⏳ Enviando imagem...";
        }

        // Endpoint padrão sugerido para o Controller Java (@PostMapping("/produtos/{id}/imagem"))
        const resposta = await fetch(`${API_URL}/produtos/${produtoId}/imagem`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (resposta.ok) {
            alert("✅ Imagem enviada e vinculada ao produto com sucesso!");
            limparSelecao();
            if (selectProduto) selectProduto.value = "";
        } else {
            const erroTexto = await resposta.text();
            alert(`❌ Falha ao salvar imagem no servidor:\n${erroTexto || "Status " + resposta.status}`);
        }
    } catch (erro) {
        console.error("Erro na requisição de upload:", erro);
        alert("❌ Erro de conexão com o servidor ao enviar a imagem.");
    } finally {
        if (btnEnviar) {
            btnEnviar.disabled = false;
            btnEnviar.textContent = "📤 Salvar Imagem do Produto";
        }
    }
}

// 4. Limpa o preview e reseta o input file
function limparSelecao() {
    arquivoSelecionado = null;
    const inputArquivo = document.getElementById("inputArquivoImagem");
    const imgPreview = document.getElementById("imgPreview");
    const textoStatus = document.getElementById("statusArquivo");

    if (inputArquivo) inputArquivo.value = "";
    if (imgPreview) {
        imgPreview.src = "";
        imgPreview.style.display = "none";
    }
    if (textoStatus) {
        textoStatus.textContent = "Nenhuma imagem selecionada.";
        textoStatus.style.color = "#cbd5e1";
    }
}

// 5. Navegação de retorno ao menu central
function voltarMenu() {
    window.location.href = "/menu/menu.html";
}
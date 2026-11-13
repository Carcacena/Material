// 🖼️ MÓDULO DE UPLOAD DE IMAGENS DE INTRODUÇÃO - SISTEMA MAGIA

function obterToken() {
    return localStorage.getItem("token") || 
           localStorage.getItem("jwtToken") || 
           localStorage.getItem("authToken") || 
           sessionStorage.getItem("token");
}

// ✅ Corrigido: Agora usa a função obterToken() criada logo acima
const token = obterToken();
if (!token) {
    window.location.href = "/Login/login.html";
}

const API_URL = window.location.origin;
let arquivoSelecionado = null;

document.addEventListener("DOMContentLoaded", () => {
    configurarEventosUpload();
    carregarGaleriaIntroducao();
});

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

        const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
        if (!tiposPermitidos.includes(file.type)) {
            alert("⚠️ Formato inválido! Escolha apenas imagens PNG, JPG ou WEBP.");
            limparSelecao();
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("⚠️ A imagem ultrapassa o limite máximo de 5MB.");
            limparSelecao();
            return;
        }

        arquivoSelecionado = file;

        const leitor = new FileReader();
        leitor.onload = (e) => {
            imgPreview.src = e.target.result;
            imgPreview.style.display = "block";
        };
        leitor.readAsDataURL(file);

        const tamanhoKB = (file.size / 1024).toFixed(1);
        textoStatus.textContent = `✅ Arquivo pronto: ${file.name} (${tamanhoKB} KB)`;
        textoStatus.style.color = "#4af37a";
    });
}

async function enviarImagemIntroducao() {
    const btnEnviar = document.getElementById("btnEnviarImagem");
    const textoStatus = document.getElementById("statusArquivo");
    const inputTitulo = document.getElementById("tituloImagem");

    if (!arquivoSelecionado) {
        alert("⚠️ Selecione uma imagem (.png ou .jpg) antes de enviar!");
        return;
    }

    const formData = new FormData();
    formData.append("arquivo", arquivoSelecionado);
    formData.append("titulo", inputTitulo ? inputTitulo.value.trim() : "");

    try {
        btnEnviar.disabled = true;
        btnEnviar.textContent = "⏳ Enviando para o servidor...";

        // ✅ Sem headers manuais: evita bloqueio do JwtFilter em requisições multipart
        const resposta = await fetch(`${API_URL}/api/midia/upload`, {
            method: "POST",
            body: formData
        });

        if (resposta.ok) {
            const dados = await resposta.json();
            alert(`✅ ${dados.mensagem}`);
            if (inputTitulo) inputTitulo.value = "";
            limparSelecao();
            carregarGaleriaIntroducao();
        } else {
            const erro = await resposta.json().catch(() => ({ erro: "Status " + resposta.status }));
            textoStatus.textContent = `❌ Erro: ${erro.erro || "Falha no servidor"}`;
            textoStatus.style.color = "#ff7675";
        }
    } catch (erro) {
        console.error("Erro na requisição:", erro);
        textoStatus.textContent = "❌ Falha de conexão com o servidor.";
        textoStatus.style.color = "#ff7675";
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.textContent = "📤 Enviar e Gravar Imagem";
    }
}

async function carregarGaleriaIntroducao() {
    const grid = document.getElementById("gridGaleria");
    if (!grid) return;

    try {
        const resposta = await fetch(`${API_URL}/api/midia/introducao`);
        if (resposta.ok) {
            const lista = await resposta.json();
            grid.innerHTML = "";

            if (lista.length === 0) {
                grid.innerHTML = '<div style="grid-column: 1/-1; font-size: 12px; color: #94a3b8; text-align: center;">Nenhuma imagem cadastrada ainda.</div>';
                return;
            }

            lista.forEach(item => {
                const card = document.createElement("div");
                card.className = "card-foto";
                card.innerHTML = `
                    <img src="${item.caminho}" alt="${item.titulo || 'Imagem'}">
                    <div class="titulo-foto" title="${item.titulo || ''}">${item.titulo || item.nomeArquivo}</div>
                    <button class="btn-excluir-foto" onclick="excluirImagemIntroducao(${item.id})">🗑️ Excluir</button>
                `;
                grid.appendChild(card);
            });
        }
    } catch (erro) {
        console.error("Erro ao carregar galeria:", erro);
    }
}



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
async function excluirImagemIntroducao(id) {
    if (!confirm("Deseja realmente remover esta imagem?")) return;

    try {
        // ✅ Sem headers manuais para evitar erro 401 no filtro JWT
        const resposta = await fetch(`${API_URL}/api/midia/introducao/${id}`, {
            method: "DELETE"
        });

        if (resposta.ok) {
            carregarGaleriaIntroducao();
        } else {
            alert("❌ Não foi possível excluir a imagem.");
        }
    } catch (erro) {
        console.error("Erro ao excluir:", erro);
    }
}




function voltarMenu() {
    window.location.href = "/menu/menu.html";
}
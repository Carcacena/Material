// componentes-js/utils.js
// 🔗 Módulo compartilhado: token e geração de PDF, reaproveitado por qualquer tela

if (typeof window.urlServidor === 'undefined') {
    window.urlServidor = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080"
        : window.location.origin;
}

function obterTokenSeguro() {
    if (window.token) return window.token;
    const fontes = [localStorage.getItem("token"), localStorage.getItem("usuario")];
    for (const valor of fontes) {
        if (!valor) continue;
        try {
            const objeto = JSON.parse(valor);
            if (objeto.token) return objeto.token;
        } catch (erro) {
            if (valor.startsWith("eyJ")) return valor;
        }
    }
    return "";
}

// 📄 Função genérica: baixa qualquer PDF do backend, seja de carrinho, cliente, etc.
async function baixarPdf(endpoint, nomeArquivoErro) {
    const urlServidorAtual = window.urlServidor || "http://localhost:8080";
    const token = obterTokenSeguro();

    try {
        const response = await fetch(`${urlServidorAtual}${endpoint}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Erro ao gerar o PDF no servidor.");

        const blob = await response.blob();
        const urlPdf = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlPdf;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (erro) {
        console.error(`Erro crítico ao gerar PDF (${nomeArquivoErro}):`, erro);
        alert("Falha ao abrir PDF. Verifique se o navegador está bloqueando abas automáticas.");
    }
}

window.obterTokenSeguro = obterTokenSeguro;
window.baixarPdf = baixarPdf;
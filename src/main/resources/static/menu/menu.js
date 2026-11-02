// 🔑 1. PROTEÇÃO DE ACESSO (Roda imediatamente antes de carregar a tela)
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "/login.html"; 
}

// ⏳ 2. CARREGAMENTO DO MENU NA TELA
document.addEventListener("DOMContentLoaded", () => {
    let header = document.getElementById("menu-container");
    
    if (!header) {
        header = document.createElement("div");
        header.id = "menu-container";
        document.body.insertBefore(header, document.body.firstChild);
    }
	
    fetch('/menu/menu.html')
        .then(response => { 
            if (!response.ok) throw new Error("Não foi possível carregar o menu."); 
            return response.text(); 
        }) 
        .then(html => { 
            header.innerHTML = html; 
            console.log("🎶 Menu e navegação afinados com sucesso!"); 
        })
        .catch(erro => console.error("Erro na sinfonia do menu:", erro));
}); // 👈 🚀 O SEGREDO ESTAVA AQUI! Fechamos o DOMContentLoaded corretamente.

// 🚀 3. FUNÇÕES DE NAVEGAÇÃO DO SISTEMA (Agora soltas e visíveis para o HTML)
function irVendas() {
    window.location.href = "/vendas/vendas.html"; 
}

function irUsuario() {
    window.location.href = "/crudUsuario.html";
}

function irExpandida() {
    window.location.href = "/Fornecedores/crudFornecedor.html"; 
}

function irProdutos() {
    window.location.href = "/Produtos/crudProduto.html";
}

function irClientes() {
    window.location.href = "/Clientes/crudCliente.html";
}

// 🚪 4. LOGOUT
function sair() {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
}
async function logar(event) {
  // 🌟 Evita que a página recarregue ao submeter o formulário
  if (event) event.preventDefault();

  const login = document.getElementById("login").value;
  const senha = document.getElementById("senha").value;

  // 🌐 CONFIGURAÇÃO AUTOMÁTICA DA URL (Local ou Railway)
  let API_URL = window.location.origin;
  if (API_URL.includes("localhost:") && !API_URL.includes(":8080")) {
    API_URL = "http://localhost:8080";
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ login: login, senha: senha })
    });

    if (!response.ok) {
      throw new Error("Login ou senha inválidos.");
    }

    // 🔑 Lê o token como TEXTO PURO (Padrão do seu backend)
    const token = await response.text();

    // 💾 Salva as informações de autenticação no navegador
    localStorage.setItem("token", token);
    sessionStorage.setItem("tipo", "0");
    
    console.log("Login efetuado com sucesso! Redirecionando...");

    // ⚡ Redirecionamento (ajuste o caminho se necessário)
    window.location.href = "/menu/menu.html";

  } catch (error) {
    console.error("Erro na autenticação:", error);
    alert(error.message);
  }
}

// 🚪 FUNÇÃO DE SAIR
function sair() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("tipo");
  window.location.href = "/login.html";
}

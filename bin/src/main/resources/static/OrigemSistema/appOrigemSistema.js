const API_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080"
        : window.location.origin;

let fornecedorSelecionadoId = null;
// Helper para pegar o token limpo do LocalStorage
function obterTokenPuro() {
    const dadosUsuarioBrutos = localStorage.getItem("token");
    if (!dadosUsuarioBrutos) {
        window.location.href = "login.html";
        return null;
    }
    try {
        const dadosUsuario = JSON.parse(dadosUsuarioBrutos);
        return dadosUsuario.token;
    } catch (e) {
        console.error("Erro ao ler token:", e);
        window.location.href = "login.html";
        return null;
    }
}

if (!localStorage.getItem("token")) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {

    carregarFornecedores();

    const form = document.getElementById("formFornecedor");

    if (form) {
        form.addEventListener("submit", cadastrarFornecedor);
    }

    // Busca automática quando o CEP completar 8 números
    const cepInput = document.getElementById("cep");

    if (cepInput) {

        cepInput.addEventListener("keyup", (e) => {

            const cepLimpo = e.target.value.replace(/\D/g, "");

            if (cepLimpo.length === 8) {
                buscarCepAutomatico();
            }

        });

    }

    bloquearFormulario(true);

});

function bloquearFormulario(status) {
    const campos = [
        "nome", "documento", "email", "telefone",
        "cep", "uf", "logradouro", "numero", "complemento", "bairro", "cidade"
    ];
    campos.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.disabled = status;
    });

    const btnSalvar = document.getElementById("btnSalvar");
    const formContainer = document.getElementById("formFornecedor");
    if (btnSalvar) btnSalvar.disabled = status;
    if (formContainer) formContainer.style.opacity = status ? "0.5" : "1";
}

function acionarIncluir() {
    fornecedorSelecionadoId = null; // Corrigido para iniciar com letra minúscula (caso sua variável global seja minúscula)
    const form = document.getElementById("formFornecedor");
    if (form) form.reset();
    
    document.getElementById("id").value = "";
    
    // ⚡ INCLUSÃO: Garante que o campo de Origem Ativa também seja limpo/resetado para o padrão
    const inputOrigem = document.getElementById("origemSistema");
    if (inputOrigem) inputOrigem.value = ""; 

    document.getElementById("tituloFormulario").textContent = "Cadastrar Origem";
    document.getElementById("btnSalvar").textContent = "Salvar Origem";
    document.querySelectorAll("#tabelaFornecedores tr").forEach(r => r.classList.remove("selecionado"));
    
    bloquearFormulario(false);
    ajustarTipoFormulario();
    
    const nomeInput = document.getElementById("nome");
    if (nomeInput) nomeInput.focus();
}


async function buscarCepAutomatico() { 
    const cepInput = document.getElementById("cep"); 
    if (!cepInput) return; 

    const cepObtido = cepInput.value.replace(/\D/g, ""); 
    if (cepObtido.length !== 8) return; 

    try { 
        const response = await fetch(`https://viacep.com.br/ws/${cepObtido}/json/`); 
        
        if (!response.ok) { 
            throw new Error("Erro na requisição da API"); 
        } 

        const dadosEndereco = await response.json(); 

		if (dadosEndereco.erro) {

		    alert("CEP não encontrado nas bases dos Correios!");

		    cepInput.value = "";
		    cepInput.focus();

		    return;
		}

        // Preenche os campos verificando se eles existem na tela para evitar erros
        if (document.getElementById("logradouro")) document.getElementById("logradouro").value = dadosEndereco.logradouro || ""; 
        if (document.getElementById("bairro")) document.getElementById("bairro").value = dadosEndereco.bairro || ""; 
        if (document.getElementById("cidade")) document.getElementById("cidade").value = dadosEndereco.localidade || ""; 

        // Injeta a UF direto no select
        const ufSelect = document.getElementById("uf"); 
        if (ufSelect) ufSelect.value = dadosEndereco.uf || ""; 

        // Move o foco para o campo número
        const numeroInput = document.getElementById("numero"); 
        if (numeroInput) numeroInput.focus(); 

    } catch (error) { 
        console.error("Falha na API ViaCEP:", error); 
        alert("Erro ao buscar o CEP. Tente digitar manualmente.");
    } 
}

async function carregarFornecedores() {
    const tokenPuro = obterTokenPuro();
    if (!tokenPuro) return;

    try {
        const response = await fetch(`${API_URL}/api/origemsistema`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${tokenPuro}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401 || response.status === 403) {
            alert("Sessão expirada. Faça login novamente!");
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) throw new Error("Erro ao buscar origem");

        const fornecedores = await response.json();
        renderizarTabelaFornecedores(fornecedores);
    } catch (error) {
        console.error("Erro:", error);
    }
}

function renderizarTabelaFornecedores(fornecedores) {
    const tbody = document.getElementById("tabelaFornecedores");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (fornecedores.length === 0) {
        // ⚡ Ajustado para 12 colunas para não quebrar a tabela visualmente
        tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;">Nenhum origem cadastrado.</td></tr>`;
        return;
    }

    fornecedores.forEach(cli => {
        const tr = document.createElement("tr");
        tr.dataset.id = cli.id;
        tr.dataset.nome = cli.nome;
        tr.dataset.cnpj = cli.cnpj || "";
        tr.dataset.telefone = cli.telefone || "";
        tr.dataset.email = cli.email || "";
        tr.dataset.cep = cli.cep || "";
        tr.dataset.uf = cli.uf || "";
        tr.dataset.logradouro = cli.logradouro || "";
        tr.dataset.numero = cli.numero || "";
        tr.dataset.bairro = cli.bairro || "";
        tr.dataset.cidade = cli.cidade || "";
        tr.dataset.complemento = cli.complemento || "";
		tr.dataset.notafiscal = cli.notafiscal || "";
        
        // ⚡ CONVERSÃO: Descobre se o Java mandou true/false ou S/N e padroniza
        const textoOrigem = (cli.origemSistema === true || cli.origemSistema === "S") ? "S" : "N";
        tr.dataset.origemsistema = textoOrigem;

        // 🌟 Tabela corrigida com as 12 colunas completas batendo com a tela
        tr.innerHTML = `
            <td>${cli.id}</td>
            <td>${cli.nome || ""}</td>
            <td>${cli.cnpj || "Não informado"}</td>
            <td>${cli.telefone || "Não informado"}</td>
            <td>${cli.email || "Não informado"}</td>
            <td>${cli.cep || ""}</td>
            <td>${cli.uf || ""}</td>
            <td>${cli.logradouro || ""}</td>
            <td>${cli.numero || ""}</td>
            <td>${cli.bairro || ""}</td>
            <td>${cli.cidade || ""}</td>
			<td>${cli.notafiscal || ""}</td>
			
            <!-- ⚡ 12ª COLUNA ADICIONADA: Agora o S ou N aparece no campo 'Origem' -->
            <td style="font-weight: bold; text-align: center;">${textoOrigem}</td>
        `;

        tr.addEventListener("click", () => {
            document.querySelectorAll("#tabelaFornecedores tr").forEach(r => r.classList.remove("selecionado"));
            tr.classList.add("selecionado");
            fornecedorSelecionadoId = cli.id;

            // ⚡ Ao clicar na linha, já joga o "S" ou "N" de volta para o input do formulário
            const inputOrigem = document.getElementById("unidadeAtiva");
            if (inputOrigem) {
                inputOrigem.value = tr.dataset.origemsistema;
            }
        });

        tbody.appendChild(tr);
    });
}
async function cadastrarFornecedor(event) {
    if (event) event.preventDefault();
    const tokenPuro = obterTokenPuro();
    if (!tokenPuro) return;

    // 1. Captura o valor do campo de origem (pode vir "S", "N", "1" ou "0")
    const inputOrigem = document.getElementById("origemSistema");
    let valorOrigem = inputOrigem ? inputOrigem.value.toUpperCase().trim() : "N";
    
    // Normaliza: se vier "1", transforma em "S" (Sim)
    if (valorOrigem === "1") valorOrigem = "S"; 
    if (valorOrigem === "0") valorOrigem = "N";

    // 2. Captura o valor do ID (se houver, para caso de atualização)
    const inputId = document.getElementById("id");
    const idReg = inputId && inputId.value ? parseInt(inputId.value) : null;

    const fornecedorDados = {
        id: idReg,
        nome: document.getElementById("nome").value,
        cnpj: document.getElementById("documento").value.replace(/\D/g, ""), 
		inscricaoEstadual: document.getElementById("inscricaoEstadual").value,
	    email: document.getElementById("email").value,
        telefone: document.getElementById("telefone").value,
        cep: document.getElementById("cep").value.replace(/\D/g, ""),
        logradouro: document.getElementById("logradouro").value,
        numero: document.getElementById("numero").value,
        complemento: document.getElementById("complemento").value,
        bairro: document.getElementById("bairro").value,
        cidade: document.getElementById("cidade").value,
        uf: document.getElementById("uf").value,
		
		notafiscal: document.getElementById("notafiscal").value,
		serie: document.getElementById("serie").value,
        
        // ⚡ CORREÇÃO DO ERRO: Envia sempre como booleano puro do JavaScript (true/false)
        unidadeAtiva: true, 
        
        // Envia a String formatada ("S" ou "N") para o DTO
        origemSistema: valorOrigem 
    };

    const url = fornecedorSelecionadoId ? `${API_URL}/api/origemsistema/${fornecedorSelecionadoId}` 
                                        : `${API_URL}/api/origemsistema`;
    const metodo = fornecedorSelecionadoId ? "PUT" : "POST";

    try {
		
		console.log("DADOS ENVIADOS:", fornecedorDados);
        const response = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenPuro}`
            },
            body: JSON.stringify(fornecedorDados)
        });

        if (response.ok) {
            alert(fornecedorSelecionadoId ? "✅ Registro alterado com sucesso!" : "✅ Registro cadastrado com sucesso!");
            acionarIncluir();
            carregarFornecedores();
        } else {
            const textoErro = await response.text();
            alert("❌ Erro ao salvar:\n" + textoErro);
        }
    } catch (e) {
        console.error("Erro na requisição:", e);
        alert("❌ Erro de rede ao tentar se conectar ao servidor.");
    }
}

function acionarAlterar() {
    if (!fornecedorSelecionadoId) {
        alert("⚠️ Selecione um fornecedor na tabela primeiro!");
        return;
    }
	
    const linhaSelecionada = document.querySelector("#tabelaFornecedores tr.selecionado");

    if (linhaSelecionada) {
        bloquearFormulario(false);
        document.getElementById("id").value = linhaSelecionada.dataset.id || "";
        document.getElementById("nome").value = linhaSelecionada.dataset.nome || "";
	
	
		document.getElementById("email").value = linhaSelecionada.dataset.email || "";
        document.getElementById("telefone").value = linhaSelecionada.dataset.telefone || "";
        document.getElementById("cep").value = linhaSelecionada.dataset.cep || "";
        document.getElementById("uf").value = linhaSelecionada.dataset.uf || "";
        document.getElementById("logradouro").value = linhaSelecionada.dataset.logradouro || "";
        document.getElementById("numero").value = linhaSelecionada.dataset.numero || "";
        document.getElementById("complemento").value = linhaSelecionada.dataset.complemento || "";
        document.getElementById("bairro").value = linhaSelecionada.dataset.bairro || "";
        document.getElementById("cidade").value = linhaSelecionada.dataset.cidade || "";
		document.getElementById("notafiscal").value = linhaSelecionada.dataset.notafiscal || "";
		document.getElementById("serie").value = linhaSelecionada.dataset.serie || "";  
		
        // ⚡ INCLUSÃO: Carrega o "S" ou "N" salvo de volta para o input da tela
        const inputOrigem = document.getElementById("unidadeAtiva");
        if (inputOrigem) {
            inputOrigem.value = linhaSelecionada.dataset.origemsistema || "N";
        }

        const docPuro = linhaSelecionada.dataset.cnpj || "";
        const inputDoc = document.getElementById("documento");

        if (docPuro.length <= 11) {
            document.querySelector('input[name="tipoPessoa"][value="CPF"]').checked = true;
        } else {
            document.querySelector('input[name="tipoPessoa"][value="CNPJ"]').checked = true;
        }

        ajustarTipoFormulario();
        inputDoc.value = docPuro;
        aplicarMascaraDocumento(inputDoc);
        inputDoc.disabled = true; // Segurança: Não deixa alterar o CPF/CNPJ após cadastrado
    }
}

async function acionarExcluir() {
    if (!fornecedorSelecionadoId) {
        alert("⚠️ Selecione um fornecedor na tabela para excluir!");
        return;
    }
    if (!confirm("Tem certeza que deseja remover este fornecedor?")) return;

    const tokenPuro = obterTokenPuro();
    try {
        const response = await fetch(`${API_URL}/api/origemsistema/${fornecedorSelecionadoId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${tokenPuro}` }
        });

        if (response.ok) {
            alert("🗑️ Fornecedor removido com sucesso!");
            acionarIncluir();
            carregarFornecedores();
        } else {
            alert("❌ Falha ao excluir.");
        }
    } catch (e) {
        console.error(e);
    }
}

function ajustarTipoFormulario() {
    const tipo = document.querySelector('input[name="tipoPessoa"]:checked').value;
    const label = document.getElementById("label-documento");
    const docInput = document.getElementById("documento");

    if (tipo === "CPF") {
        label.innerText = "CPF (Apenas números)";
        docInput.placeholder = "Ex: 000.000.000-00";
        docInput.maxLength = 14;
    } else {
        label.innerText = "CNPJ (Apenas números)";
        docInput.placeholder = "Ex: 00.000.000/0001-00";
        docInput.maxLength = 18;
    }
    docInput.value = "";
}

function aplicarMascaraDocumento(el) {
    let v = el.value.replace(/\D/g, "");
    const tipo = document.querySelector('input[name="tipoPessoa"]:checked').value;

    if (tipo === "CPF") {
        v = v.substring(0, 11);
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
        v = v.substring(0, 14);
        v = v.replace(/^(\d{2})(\d)/, "$1.$2");
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
        v = v.replace(/(\d{4})(\d)/, "$1-$2");
    }
    el.value = v;
}
function aplicarMascaraCEP(el) {
    let v = el.value.replace(/\D/g, ""); // Remove tudo que não for dígito
    v = v.substring(0, 8);               // Limita a 8 números
    
    // Aplica a máscara 00.000-000
    if (v.length > 5) {
        v = v.replace(/^(\d{2})(\d{3})(\d)/, "$1.$2-$3");
    } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d)/, "$1.$2");
    }
    
    el.value = v;
}









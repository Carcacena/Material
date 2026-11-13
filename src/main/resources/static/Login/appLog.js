let dadosLogs = [];
let idsSelecionados = new Set();

function obterToken() {
    const armazenado = localStorage.getItem("token");
    if (!armazenado) return null;
    try {
        const objeto = JSON.parse(armazenado);
        return objeto.token || armazenado;
    } catch (e) {
        return armazenado.replace(/^"+|"+$/g, "");
    }
}

function atualizarBarraAcoes() {
    const btnExcluir = document.getElementById("btnExcluirSelecionados");
    const qtd = idsSelecionados.size;

    if (qtd > 0) {
        btnExcluir.style.display = "inline-block";
        btnExcluir.innerText = `🗑️ Excluir Selecionados (${qtd})`;
    } else {
        btnExcluir.style.display = "none";
    }
}

function alternarSelecaoLinha(id, elementoLinha) {
    const chk = elementoLinha.querySelector(".chk-log");

    if (idsSelecionados.has(id)) {
        idsSelecionados.delete(id);
        elementoLinha.classList.remove("selecionado");
        if (chk) chk.checked = false;
    } else {
        idsSelecionados.add(id);
        elementoLinha.classList.add("selecionado");
        if (chk) chk.checked = true;
    }

    atualizarBarraAcoes();
}

function alternarTodos(chkMaster) {
    const linhas = document.querySelectorAll(".log-item");
    linhas.forEach(linha => {
        const id = Number(linha.dataset.id);
        const chk = linha.querySelector(".chk-log");

        if (chkMaster.checked) {
            idsSelecionados.add(id);
            linha.classList.add("selecionado");
            if (chk) chk.checked = true;
        } else {
            idsSelecionados.delete(id);
            linha.classList.remove("selecionado");
            if (chk) chk.checked = false;
        }
    });

    atualizarBarraAcoes();
}

function renderizarLogs(lista) {
    const container = document.getElementById("listaLogs");
    const contador = document.getElementById("contadorLogs");
    const chkMaster = document.getElementById("chkSelecionarTodos");

    if (chkMaster) chkMaster.checked = false;
    container.innerHTML = "";
    contador.innerText = `${lista.length} registro(s)`;

    if (lista.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#94a3b8; padding: 30px;">🗑️ Lixeira vazia. Nenhum log encontrado.</div>`;
        return;
    }

    lista.forEach(log => {
        const item = document.createElement("div");
        const marcado = idsSelecionados.has(log.id);
        item.className = "log-item" + (marcado ? " selecionado" : "");
        item.dataset.id = log.id;
        item.onclick = () => alternarSelecaoLinha(log.id, item);

        const tipo = log.sucesso ? "sucesso" : "erro";

        item.innerHTML = `
            <div><input type="checkbox" class="chk-log" ${marcado ? "checked" : ""} onclick="event.stopPropagation(); alternarSelecaoLinha(${log.id}, this.closest('.log-item'))"></div>
            <span class="log-data">${log.dataHora}</span>
            <span class="badge tipo-${tipo}">${tipo}</span>
            <span class="log-usuario">@${log.usuario || "sistema"}</span>
            <span class="log-desc">${log.acao} - ${log.detalhe || ""}</span>
        `;
        container.appendChild(item);
    });
}

function filtrarLogs() {
    const termo = document.getElementById("campoBusca").value.toLowerCase();
    const filtrados = dadosLogs.filter(log =>
        (log.usuario || "").toLowerCase().includes(termo) ||
        (log.acao || "").toLowerCase().includes(termo) ||
        (log.detalhe || "").toLowerCase().includes(termo) ||
        String(log.dataHora || "").toLowerCase().includes(termo)
    );
    renderizarLogs(filtrados);
}

async function carregarLogs() {
    try {
        const token = obterToken();
        const resposta = await fetch("/api/logs", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!resposta.ok) throw new Error("Não foi possível carregar os logs.");

        dadosLogs = await resposta.json();
        idsSelecionados.clear();
        atualizarBarraAcoes();
        filtrarLogs();
    } catch (erro) {
        console.error("Erro ao carregar logs:", erro);
    }
}

async function excluirSelecionados() {
    const listaIds = Array.from(idsSelecionados);
    if (listaIds.length === 0) return;

    if (!confirm(`Deseja excluir permanentemente ${listaIds.length} registro(s) selecionado(s)?`)) return;

    try {
        const token = obterToken();
        const resposta = await fetch("/api/logs/lote", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(listaIds)
        });

        if (resposta.ok) {
            await carregarLogs();
        } else {
            alert("Erro ao excluir os logs selecionados.");
        }
    } catch (erro) {
        console.error("Erro na exclusão seletiva:", erro);
    }
}

async function esvaziarLixeira() {
    if (dadosLogs.length === 0) {
        alert("A lixeira de logs já está vazia!");
        return;
    }

    if (!confirm(`ATENÇÃO: Deseja esvaziar toda a lixeira e apagar TODOS os ${dadosLogs.length} registros de log?`)) return;

    try {
        const token = obterToken();
        const resposta = await fetch("/api/logs/esvaziar", {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (resposta.ok) {
            await carregarLogs();
        } else {
            alert("Erro ao esvaziar a lixeira de logs.");
        }
    } catch (erro) {
        console.error("Erro ao esvaziar lixeira:", erro);
    }
}





let listaContasReceber = [];
let token = "";

try {
    const tokenStorage =
        localStorage.getItem("token");

    if (tokenStorage) {
        if (
            tokenStorage.trim().startsWith("ey") ||
            !tokenStorage.includes("{")
        ) {
            token = tokenStorage.trim();
        } else {
            const dados =
                JSON.parse(tokenStorage);

            token =
                dados.token || "";
        }
    }

} catch (erro) {
    console.error(
        "Erro ao ler token:",
        erro
    );

    token = "";
}
const API_URL =
    window.API_URL || "";

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarContasReceber();

        document
            .querySelectorAll(
                 "#filtroSituacao," +
                "#filtroDataInicial," +
                "#filtroDataFinal"
            )
            .forEach(elemento => {

                elemento.addEventListener(
                    "input",
                    aplicarFiltros
                );

                elemento.addEventListener(
                    "change",
                    aplicarFiltros
                );
            });
    }
);

async function carregarContasReceber() {

    try {

        const response =
            await fetch(
                `${API_URL}/contas-receber`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }

        listaContasReceber =
            await response.json();

        atualizarResumo(
            listaContasReceber
        );

        montarArvore(
            listaContasReceber
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar contas:",
            erro
        );

        alert(
            "Não foi possível carregar " +
            "o Contas a Receber."
        );
    }
}

function aplicarFiltros() {

    const situacao =
        document
        .getElementById("filtroSituacao")
        .value;

    const dataInicial =
        document
        .getElementById("filtroDataInicial")
        .value;

    const dataFinal =
        document
        .getElementById("filtroDataFinal")
        .value;

		const filtrados =
		    listaContasReceber.filter(conta => {

		        const okSituacao =
		            !situacao ||
		            conta.situacao === situacao;

		        const dataLancamento =
		            conta.dataLancamento
		                ? conta.dataLancamento.substring(0, 10)
		                : "";

		        const okInicial =
		            !dataInicial ||
		            dataLancamento >= dataInicial;

		        const okFinal =
		            !dataFinal ||
		            dataLancamento <= dataFinal;

		        return (
		            okSituacao &&
		            okInicial &&
		            okFinal
		        );
		    });

    montarArvore(filtrados);
}
function montarArvore(lista) {

    const container =
        document.getElementById(
            "arvoreContas"
        );

    container.innerHTML = "";

    if (!lista.length) {

        container.innerHTML =
            `
            <div style="
                text-align:center;
                color:#bdc3c7;
                padding:40px;">
                Nenhum título encontrado.
            </div>
            `;

        return;
    }

    const clientes = {};

    lista.forEach(conta => {

        const chaveCliente =
            `${conta.clienteId}|${conta.clienteNome}`;

        if (!clientes[chaveCliente]) {
            clientes[chaveCliente] = {};
        }

        const chaveNota =
            `${conta.numeroNotaFiscal}|${conta.serie}`;

        if (!clientes[chaveCliente][chaveNota]) {
            clientes[chaveCliente][chaveNota] = [];
        }

        clientes[chaveCliente][chaveNota]
            .push(conta);
    });

    Object
    .keys(clientes)
    .sort()
    .forEach(chaveCliente => {

        const [
            clienteId,
            clienteNome
        ] = chaveCliente.split("|");

        const blocoCliente =
            document.createElement("div");

        blocoCliente.className =
            "cliente";

        const cabecalhoCliente =
            document.createElement("div");

        cabecalhoCliente.className =
            "cliente-cabecalho";

        cabecalhoCliente.innerHTML =
            `▶ 👤 ${clienteNome}`;

        const corpoCliente =
            document.createElement("div");

        corpoCliente.style.display =
            "none";

        cabecalhoCliente.onclick =
            () => {

                const aberto =
                    corpoCliente.style.display
                    !== "none";

                corpoCliente.style.display =
                    aberto
                    ? "none"
                    : "block";

                cabecalhoCliente.innerHTML =
                    `${aberto ? "▶" : "▼"} ` +
                    `👤 ${clienteNome}`;
            };

        Object
        .keys(clientes[chaveCliente])
        .sort()
        .forEach(chaveNota => {

            const [
                nota,
                serie
            ] =
                chaveNota.split("|");

            const blocoNota =
                document.createElement("div");

            blocoNota.className =
                "nota";

            const cabecalhoNota =
                document.createElement("div");

            cabecalhoNota.className =
                "nota-cabecalho";

            cabecalhoNota.innerHTML =
                `▶ NF ${nota} / ${serie}`;

            const corpoParcelas =
                document.createElement("div");

            corpoParcelas.className =
                "parcelas";

            corpoParcelas.style.display =
                "none";

            cabecalhoNota.onclick =
                () => {

                    const aberto =
                        corpoParcelas.style.display
                        !== "none";

                    corpoParcelas.style.display =
                        aberto
                        ? "none"
                        : "block";

                    cabecalhoNota.innerHTML =
                        `${aberto ? "▶" : "▼"} ` +
                        `NF ${nota} / ${serie}`;
                };

            clientes[chaveCliente][chaveNota]
            .sort(
                (a, b) =>
                a.numeroParcela -
                b.numeroParcela
            )
            .forEach(conta => {

                corpoParcelas.appendChild(
                    criarLinhaParcela(conta)
                );
            });

            blocoNota.appendChild(
                cabecalhoNota
            );

            blocoNota.appendChild(
                corpoParcelas
            );

            corpoCliente.appendChild(
                blocoNota
            );
        });

        blocoCliente.appendChild(
            cabecalhoCliente
        );

        blocoCliente.appendChild(
            corpoCliente
        );

        container.appendChild(
            blocoCliente
        );
    });
}

function criarLinhaParcela(conta) {

    const linha =
        document.createElement("div");

    linha.className =
        "parcela";

    const classeStatus =
        conta.situacao
        .replaceAll(" ", "-");

    linha.innerHTML = `

        <div>
            ${conta.numeroParcela}/
            ${conta.totalParcelas}
        </div>

        <div>
            ${formatarData(
                conta.dataVencimento
            )}
        </div>

        <div class="valor">
            ${formatarMoeda(
                conta.valorParcela
            )}
        </div>

        <div>
            Saldo:
            ${formatarMoeda(
                conta.saldo
            )}
        </div>

        <div>
            <span
                class="status ${classeStatus}">
                ${conta.situacao}
            </span>
        </div>

        <div>
            ${
                conta.situacao !== "PAGO" &&
                conta.situacao !== "DEVOLVIDO"
                ?
                `
				<button
				    class="btn-baixar"
				    onclick="baixarTitulo(
				        ${conta.id},
				        ${conta.saldo}
				    )">
				    Confirmar pagamento
				</button>
                `
                :
                ""
            }
        </div>
    `;

    return linha;
}

async function baixarTitulo(id, saldo) {

    const valor =
        Number(saldo || 0);

    if (
        !Number.isFinite(valor) ||
        valor <= 0
    ) {
        alert("Este título não possui saldo para pagamento.");
        return;
    }

    const confirmar = confirm(
        "Confirma o recebimento deste título?\n\n" +
        "Valor: " +
        formatarMoeda(valor)
    );

    if (!confirmar) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/contas-receber/${id}/baixar`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify({
                            valorPago: valor
                        })
                }
            );

        if (!response.ok) {

            const erro =
                await response.text();

            throw new Error(erro);
        }

        alert(
            "✅ Pagamento confirmado com sucesso."
        );

        await carregarContasReceber();

    } catch (erro) {

        console.error(erro);

        alert(
            "Não foi possível confirmar o pagamento."
        );
    }
}

function atualizarResumo(lista) {

    let aberto = 0;
    let vincendo = 0;
    let vencido = 0;
    let pago = 0;
    let devolvido = 0;

    lista.forEach(conta => {

        const valor =
            Number(
                conta.valorParcela || 0
            );

        const saldo =
            Number(
                conta.saldo || 0
            );

        // DEVOLVIDO tem prioridade absoluta
        if (Number(conta.status) === 2) {

            devolvido += valor;

            return;
        }

        switch (
            conta.situacao
        ) {

            case "PAGO":
                pago += valor;
                break;

            case "VENCIDO":
                vencido += saldo;
                aberto += saldo;
                break;

            case "VINCENDO":
                vincendo += saldo;
                aberto += saldo;
                break;

            case "A VENCER":
                aberto += saldo;
                break;
        }
    });

    document
        .getElementById("cardAberto")
        .textContent =
        formatarMoeda(aberto);

    document
        .getElementById("cardVincendo")
        .textContent =
        formatarMoeda(vincendo);

    document
        .getElementById("cardVencido")
        .textContent =
        formatarMoeda(vencido);

    document
        .getElementById("cardPago")
        .textContent =
        formatarMoeda(pago);

    document
        .getElementById("cardDevolvido")
        .textContent =
        formatarMoeda(devolvido);
}
function formatarMoeda(valor) {

    return Number(valor || 0)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
}

function formatarData(data) {

    if (!data) {
        return "-";
    }

    const [
        ano,
        mes,
        dia
    ] = data.split("-");

    return `${dia}/${mes}/${ano}`;
}
function voltarMenu() {
    window.location.href =
        "/menu/menu.html";
}


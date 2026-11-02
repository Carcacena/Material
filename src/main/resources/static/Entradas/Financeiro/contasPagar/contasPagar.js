let listaContasPagar = [];
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

        carregarContasPagar();

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

async function carregarContasPagar() {

    try {

        const response =
            await fetch(
                `${API_URL}/contas-pagar`,
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

		listaContasPagar =
		    await response.json();

		console.log(
		    "🔥 TITULOS RECEBIDOS DO BACKEND:",
		    listaContasPagar
		);

		atualizarResumo(
		    listaContasPagar
		);

		montarArvore(
		    listaContasPagar
		);

    } catch (erro) {

        console.error(
            "Erro ao carregar contas:",
            erro
        );

        alert(
            "Não foi possível carregar " +
            "o Contas a Pagar."
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
        listaContasPagar.filter(conta => {

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

	const fornecedores = {};
	
    lista.forEach(conta => {

        const chaveFornecedor =
            `${conta.fornecedorId}|${conta.fornecedorNome}`;

        if (!fornecedores[chaveFornecedor]) {
            fornecedores[chaveFornecedor] = {};
        }

        const chaveNota =
            `${conta.numeroNotaFiscal}|${conta.serie}`;

        if (!fornecedores[chaveFornecedor][chaveNota]) {
            fornecedores[chaveFornecedor][chaveNota] = [];
        }

        fornecedores[chaveFornecedor][chaveNota]
            .push(conta);
    });

    Object
    .keys(fornecedores)
    .sort()
    .forEach(chaveFornecedor => {

        const [
            fornecedorId,
            fornecedorNome
        ] = chaveFornecedor.split("|");

        const blocoFornecedor =
            document.createElement("div");

        blocoFornecedor.className =
            "fornecedor";

        const cabecalhoFornecedor =
            document.createElement("div");

        cabecalhoFornecedor.className =
            "fornecedor-cabecalho";

        cabecalhoFornecedor.innerHTML =
            `▶ 👤 ${fornecedorNome}`;

        const corpoFornecedor =
            document.createElement("div");

        corpoFornecedor.style.display =
            "none";

        cabecalhoFornecedor.onclick =
            () => {

                const aberto =
                    corpoFornecedor.style.display
                    !== "none";

                corpoFornecedor.style.display =
                    aberto
                    ? "none"
                    : "block";

                cabecalhoFornecedor.innerHTML =
                    `${aberto ? "▶" : "▼"} ` +
                    `👤 ${fornecedorNome}`;
            };

        Object
        .keys(fornecedores[chaveFornecedor])
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

            fornecedores[chaveFornecedor][chaveNota]
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

            corpoFornecedor.appendChild(
                blocoNota
            );
        });

        blocoFornecedor.appendChild(
            cabecalhoFornecedor
        );

        blocoFornecedor.appendChild(
            corpoFornecedor
        );

        container.appendChild(
            blocoFornecedor
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
                conta.situacao !== "Cancelado"
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
       "Confirma o pagamento deste título?\n\n" +
        "Valor: " +
        formatarMoeda(valor)
    );

    if (!confirmar) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/contas-pagar/${id}/baixar`,
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
		
		await carregarContasPagar();

    

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
    let cancelado = 0;

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

            cancelado += valor;

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
        .getElementById("cardCancelado")
        .textContent =
        formatarMoeda(cancelado);
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


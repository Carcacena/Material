// 🌳 MÓDULO EXCLUSIVO: RENDERIZAÇÃO E FILTRO POR CATEGORIAS (SETOR)
async function carregarProdutosPorCategoria() {
    try {
        // 🔑 Busca os produtos na API protegida injetando o token JWT
        const resposta = await fetch(`${API_URL}/produtos`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (resposta.ok) {
            listaProdutosGlobal = await resposta.json();
			montarArvoreVendasPorCategoriaColapsavel();
           // montarArvoreVendasPorCategoria();
        } else {
            console.error("Erro ao carregar produtos por categoria. Status:", resposta.status);
        }
    } catch (erro) {
        console.error("Falha ao carregar produtos por categoria:", erro);
    }
}

function montarArvoreVendasPorCategoriaColapsavel() {
    const container = document.getElementById("containerArvoreVendas");
    if (!container) { return; }
    container.innerHTML = "";

    const txtContador = document.getElementById("contadorProdutosCatalogo");
    if (txtContador) {
        txtContador.textContent = listaProdutosGlobal.length;
    }

    // 🔄 1. Agrupa os produtos por Categoria na memória
    const categoriasAgrupadas = {};
    listaProdutosGlobal.forEach(prod => {
        const categoriaNome = prod.categoria ? prod.categoria.nome.trim().toUpperCase() : "GERAL / NÃO CATEGORIZADO";
        if (!categoriasAgrupadas[categoriaNome]) {
            categoriasAgrupadas[categoriaNome] = [];
        }
        categoriasAgrupadas[categoriaNome].push(prod);
    });

    // 🔤 2. Ordena as Categorias (Pastas) de A a Z
    const categoriasOrdenadas = Object.keys(categoriasAgrupadas).sort((a, b) => a.localeCompare(b, "pt-BR"));

    // 🔨 3. Monta as Pastas Físicas na Interface
    categoriasOrdenadas.forEach(categoriaSetor => {
        const divGrupo = document.createElement("div");
        divGrupo.style.cssText = "margin-bottom: 8px; font-family: Arial, sans-serif;";

        // 📁 LINHA RAIZ COLAPSADA: O Setor (Ex: CELULARES, ELÉTRICA)
		const divRaizRow = document.createElement("div");

		divRaizRow.style.cssText =
		    "display:flex;" +
		    "align-items:center;" +
		    "gap:8px;" +
		    "cursor:pointer;" +
		    "padding:10px 4px;" +
		    "width:100%;" +
		    "box-sizing:border-box;" +
		    "color:white;" +
		    "background:transparent;" +
		    "border:none;" +
		    "border-bottom:1px solid rgba(255,255,255,0.08);" +
		    "transition:0.2s;";

		divRaizRow.innerHTML =
		    `📁
		     <span style="
		        font-weight:bold;
		        font-size:13px;
		        color:#ffffff;
		     ">
		        ${categoriaSetor}
		     </span>

		     <span style="
		        color:#4af37a;
		        font-size:11px;
		        font-weight:bold;
		        margin-left:auto;
		     ">
		        (${categoriasAgrupadas[categoriaSetor].length} Itens)
		     </span>`;

        // Container oculto para a Subraiz de produtos
        const divSubRaizContainer = document.createElement("div");
        divSubRaizContainer.style.cssText = "display: none; padding-left: 12px; margin: 4px 0 10px 18px; border-left: 2px solid rgba(255, 152, 0, 0.25);";

		divRaizRow.addEventListener("click", () => {

		    const estaFechado =
		        divSubRaizContainer.style.display === "none";

		    divSubRaizContainer.style.display =
		        estaFechado ? "block" : "none";

		    divRaizRow.style.background =
		        estaFechado
		            ? "rgba(255,152,0,0.08)"
		            : "transparent";

		    divRaizRow.style.borderLeft =
		        estaFechado
		            ? "3px solid #ff9800"
		            : "none";
		});

        // Ordena os produtos de A a Z especificamente deste setor
        const produtosDaCategoria = categoriasAgrupadas[categoriaSetor].sort((a, b) => {
            const nomeA = a.nome ? a.nome.trim().toUpperCase() : "";
            const nomeB = b.nome ? b.nome.trim().toUpperCase() : "";
            return nomeA.localeCompare(nomeB, "pt-BR");
        });

        // 🔹 Varre a SUBRAIZ injetando os produtos na lista
        produtosDaCategoria.forEach(prod => {
            const fornecedorNome = prod.fornecedor ? prod.fornecedor.nome.trim().toUpperCase() : "PRODUTOS AVULSOS / ARTESANAIS";
            const tipoLabel = prod.aGranel ? "[Granel]" : "[Unid]";
            const precoVenda = Number(prod.precoVenda || 0);
            const precoCusto = Number(prod.precoCusto || 0);
            const estoqueAtual = Number(prod.estoqueAtual ?? 0);
            const margem = precoCusto > 0 ? (((precoVenda - precoCusto) / precoCusto) * 100).toFixed(0) : "0";
            const estoqueFormatado = prod.aGranel ? estoqueAtual.toFixed(3) : estoqueAtual.toFixed(0);

            const itemJaNoCupomInicial = typeof carrinho !== "undefined" && Array.isArray(carrinho) ? carrinho.find(item => {
                const idItem = item.produtoId ?? item.produto?.id ?? item.id;
                return Number(idItem) === Number(prod.id);
            }) : null;
            const quantidadeJaNoCupomInicial = Number(itemJaNoCupomInicial?.quantidade || 0);
            const saldoDisponivelInicial = estoqueAtual - quantidadeJaNoCupomInicial;
            const saldoFormatadoInicial = prod.aGranel ? saldoDisponivelInicial.toFixed(3) : saldoDisponivelInicial.toFixed(0);

            const divItemFilho = document.createElement("div");
            divItemFilho.style.cssText = "padding: 6px 8px; margin-bottom: 6px; font-size: 13px; color: #ecf0f1; background: rgba(255,255,255,0.02); border-radius: 4px; display: flex; flex-direction: column; gap: 2px;";

            const divTextoLinha = document.createElement("div");
            divTextoLinha.style.cssText = "cursor: pointer; display: inline-block; width: 100%; padding: 4px; border-radius: 3px;";
            divTextoLinha.innerHTML = `🔹 <span style="color: #4af37a; font-weight: bold; font-size: 13.5px;">${prod.nome.toUpperCase()}</span> <small style="color: #ff9800;"> ${tipoLabel} </small> <br> <span style="color: #bdc3c7; font-size: 11px;">🏭 Fornecedor: ${fornecedorNome}</span> | <span style="color: #5eff5e; font-weight: bold;"> R$ ${precoVenda.toFixed(2)} </span> <small style="color: #bdc3c7; font-size: 11px;"> (Margem: ${margem}%) </small> <small style="color: #ffd54f; font-size: 11px; font-weight: bold;"> | Est: ${estoqueFormatado} | Disp: <span class="txt-dinamico-estoque" style="color: #5eff5e;">${saldoFormatadoInicial}</span> </small>`;

            const divMenuBotoes = document.createElement("div");
            divMenuBotoes.className = "menu-botoes-pdv";
            divMenuBotoes.style.cssText = "display: none; gap: 6px; padding-left: 15px; margin-top: 4px; margin-bottom: 2px;";
            divMenuBotoes.innerHTML = ` <button class="btn" style="background: #27ae60; color: white; font-size: 11px; padding: 2px 8px; border: none; border-radius: 3px; font-weight: bold; text-transform: uppercase;"> Mover </button> <button class="btn" style="background: #7f8c8d; color: white; font-size: 11px; padding: 2px 8px; border: none; border-radius: 3px; font-weight: bold; text-transform: uppercase;" disabled> Alterar </button> <button class="btn" style="background: #7f8c8d; color: white; font-size: 11px; padding: 2px 8px; border: none; border-radius: 3px; font-weight: bold; text-transform: uppercase;" disabled> Incluir </button> `;

            divTextoLinha.addEventListener("click", evento => {
                evento.stopPropagation();
                container.querySelectorAll(".menu-botoes-pdv").forEach(menu => {
                    if (menu !== divMenuBotoes) { menu.style.display = "none"; }
                });
                divMenuBotoes.style.display = divMenuBotoes.style.display === "flex" ? "none" : "flex";
            });

            // (A lógica de clique do botão "Mover" continua idêntica à padrão...)
            const btnMoverLinha = divMenuBotoes.querySelector("button:nth-child(1)");
            btnMoverLinha.addEventListener("click", evento => {
                evento.stopPropagation();
                const inputQtd = document.getElementById("inputQuantidade");
                if (!inputQtd) { return; }
                const quantidadeInput = prod.aGranel ? parseFloat(inputQtd.value) : parseInt(inputQtd.value, 10);
                if (!Number.isFinite(quantidadeInput) || quantidadeInput <= 0) {
                    alert("Atenção, piá! Informe uma quantidade válida maior que zero.");
                    return;
                }
                const itemJaNoCupom = typeof carrinho !== "undefined" && Array.isArray(carrinho) ? carrinho.find(item => (item.produtoId ?? item.produto?.id ?? item.id) === prod.id) : null;
                const quantidadeJaNoCupom = Number(itemJaNoCupom?.quantidade || 0);
                if (quantidadeInput > (estoqueAtual - quantidadeJaNoCupom)) {
                    alert("Estoque insuficiente.");
                    return;
                }
                if (typeof adicionarProdutoAoCupom === "function") {
                    adicionarProdutoAoCupom(prod.id, prod.nome, quantidadeInput, precoVenda, precoCusto);
                    prod.estoqueAtual = estoqueAtual - quantidadeInput;
                    const txtEstoqueLinha = divTextoLinha.querySelector(".txt-dinamico-estoque");
                    if (txtEstoqueLinha) {
                        txtEstoqueLinha.textContent = prod.aGranel ? (prod.estoqueAtual - quantidadeJaNoCupom).toFixed(3) : (prod.estoqueAtual - quantidadeJaNoCupom).toFixed(0);
                    }
                }
            });

            divItemFilho.appendChild(divTextoLinha);
            divItemFilho.appendChild(divMenuBotoes);
            divSubRaizContainer.appendChild(divItemFilho);
        });

        divGrupo.appendChild(divRaizRow);
        divGrupo.appendChild(divSubRaizContainer);
        container.appendChild(divGrupo);
    });
}






function montarArvoreVendasPorCategoria() {
    const container = document.getElementById("containerArvoreVendas");
    if (!container) { return; }
    container.innerHTML = "";

    const txtContador = document.getElementById("contadorProdutosCatalogo");
    if (txtContador) {
        txtContador.textContent = listaProdutosGlobal.length;
    }

    // 🔄 1. Agrupa os produtos por Categoria na memória RAM
    const categoriasAgrupadas = {};
    
    listaProdutosGlobal.forEach(prod => {
        // Se o produto veio sem categoria por segurança, joga no grupo geral
        const categoriaNome = prod.categoria ? prod.categoria.nome.trim().toUpperCase() : "GERAL / NÃO CATEGORIZADO";
        
        if (!categoriasAgrupadas[categoriaNome]) {
            categoriasAgrupadas[categoriaNome] = [];
        }
        categoriasAgrupadas[categoriaNome].push(prod);
    });

    // 🔤 2. Ordena os nomes das categorias de A a Z
    const categoriasOrdenadas = Object.keys(categoriasAgrupadas).sort((a, b) => a.localeCompare(b, "pt-BR"));

    // 🔨 3. Renderiza os blocos divididos por Categoria na tela
    categoriasOrdenadas.forEach(categoria => {
        
        // 🧱 Cabeçalho visual divisor de Categoria (Muito limpo, sem colapsar)
        const divDivisorCategoria = document.createElement("div");
        divDivisorCategoria.style.cssText = "padding: 6px 10px; margin: 15px 0 8px 0; font-size: 12px; font-weight: bold; color: #ff9800; background: rgba(255, 152, 0, 0.08); border-left: 4px solid #ff9800; border-radius: 2px; text-transform: uppercase; font-family: Arial, sans-serif;";
        divDivisorCategoria.innerHTML = `📂 Setor: ${categoria} <small style="color: #bdc3c7; font-weight: normal; float: right;">(${categoriasAgrupadas[categoria].length} Itens)</small>`;
        container.appendChild(divDivisorCategoria);

        // Ordena os produtos de A a Z especificamente dentro DESTA categoria
        const produtosDaCategoria = categoriasAgrupadas[categoria].sort((a, b) => {
            const nomeA = a.nome ? a.nome.trim().toUpperCase() : "";
            const nomeB = b.nome ? b.nome.trim().toUpperCase() : "";
            return nomeA.localeCompare(nomeB, "pt-BR");
        });

        // Varre e monta a lista corrida da categoria atual
        produtosDaCategoria.forEach(prod => {
            const fornecedorNome = prod.fornecedor ? prod.fornecedor.nome.trim().toUpperCase() : "PRODUTOS AVULSOS / ARTESANAIS";
            const tipoLabel = prod.aGranel ? "[Granel]" : "[Unid]";
            const precoVenda = Number(prod.precoVenda || 0);
            const precoCusto = Number(prod.precoCusto || 0);
            const estoqueAtual = Number(prod.estoqueAtual ?? 0);
            const margem = precoCusto > 0 ? (((precoVenda - precoCusto) / precoCusto) * 100).toFixed(0) : "0";
            const estoqueFormatado = prod.aGranel ? estoqueAtual.toFixed(3) : estoqueAtual.toFixed(0);

            const itemJaNoCupomInicial = typeof carrinho !== "undefined" && Array.isArray(carrinho) ? carrinho.find(item => {
                const idItem = item.produtoId ?? item.produto?.id ?? item.id;
                return Number(idItem) === Number(prod.id);
            }) : null;
            const quantidadeJaNoCupomInicial = Number(itemJaNoCupomInicial?.quantidade || 0);
            const saldoDisponivelInicial = estoqueAtual - quantidadeJaNoCupomInicial;
            const saldoFormatadoInicial = prod.aGranel ? saldoDisponivelInicial.toFixed(3) : saldoDisponivelInicial.toFixed(0);

            // Bloco individual do produto
            const divItemFilho = document.createElement("div");
            divItemFilho.style.cssText = "padding: 6px 8px; margin-bottom: 6px; font-size: 13px; color: #ecf0f1; background: rgba(255,255,255,0.02); border-radius: 4px; display: flex; flex-direction: column; gap: 2px; font-family: Arial, sans-serif;";

            const divTextoLinha = document.createElement("div");
            divTextoLinha.style.cssText = "cursor: pointer; display: inline-block; width: 100%; padding: 4px; border-radius: 3px;";
            divTextoLinha.innerHTML = `🔹 <span style="color: #4af37a; font-weight: bold; font-size: 13.5px;">${prod.nome.toUpperCase()}</span> <small style="color: #ff9800;"> ${tipoLabel} </small> <br> <span style="color: #bdc3c7; font-size: 11px;">🏭 Fornecedor: ${fornecedorNome}</span> | <span style="color: #5eff5e; font-weight: bold;"> R$ ${precoVenda.toFixed(2)} </span> <small style="color: #bdc3c7; font-size: 11px;"> (Margem: ${margem}%) </small> <small style="color: #ffd54f; font-size: 11px; font-weight: bold;"> | Est: ${estoqueFormatado} | Disp: <span class="txt-dinamico-estoque" style="color: #5eff5e;">${saldoFormatadoInicial}</span> </small>`;

            // Menu contextual de operações inferiores (Mover)
            const divMenuBotoes = document.createElement("div");
            divMenuBotoes.className = "menu-botoes-pdv";
            divMenuBotoes.style.cssText = "display: none; gap: 6px; padding-left: 15px; margin-top: 4px; margin-bottom: 2px;";
            divMenuBotoes.innerHTML = ` <button class="btn" style="background: #27ae60; color: white; font-size: 11px; padding: 2px 8px; border: none; border-radius: 3px; font-weight: bold; text-transform: uppercase;"> Mover </button> <button class="btn" style="background: #7f8c8d; color: white; font-size: 11px; padding: 2px 8px; border: none; border-radius: 3px; font-weight: bold; text-transform: uppercase;" disabled> Alterar </button> <button class="btn" style="background: #7f8c8d; color: white; font-size: 11px; padding: 2px 8px; border: none; border-radius: 3px; font-weight: bold; text-transform: uppercase;" disabled> Incluir </button> `;

            // Evento de clique para expandir os botões contextuais
            divTextoLinha.addEventListener("click", evento => {
                evento.stopPropagation();
                container.querySelectorAll(".menu-botoes-pdv").forEach(menu => {
                    if (menu !== divMenuBotoes) { menu.style.display = "none"; }
                });
                divMenuBotoes.style.display = divMenuBotoes.style.display === "flex" ? "none" : "flex";
            });

            // Ação do botão Mover para o Cupom Fiscal
            const btnMoverLinha = divMenuBotoes.querySelector("button:nth-child(1)");
            btnMoverLinha.addEventListener("click", evento => {
                evento.stopPropagation();
                const inputQtd = document.getElementById("inputQuantidade");
                if (!inputQtd) { return; }
                const quantidadeInput = prod.aGranel ? parseFloat(inputQtd.value) : parseInt(inputQtd.value, 10);

                if (!Number.isFinite(quantidadeInput) || quantidadeInput <= 0) {
                    alert("Atenção, piá! Informe uma quantidade válida maior que zero.");
                    return;
                }

                const itemJaNoCupom = typeof carrinho !== "undefined" && Array.isArray(carrinho) ? carrinho.find(item => {
                    const idItem = item.produtoId ?? item.produto?.id ?? item.id;
                    return Number(idItem) === Number(prod.id);
                }) : null;
                const quantidadeJaNoCupom = Number(itemJaNoCupom?.quantidade || 0);
                const saldoDisponivel = estoqueAtual - quantidadeJaNoCupom;

                if (quantidadeInput > saldoDisponivel) {
                    alert(`Estoque insuficiente.\n\nEstoque atual: ${estoqueFormatado}\nJá lançado: ${quantidadeJaNoCupom}\nSaldo disponível: ${saldoDisponivel}`);
                    return;
                }

                if (typeof adicionarProdutoAoCupom === "function") {
                    adicionarProdutoAoCupom(prod.id, prod.nome, quantidadeInput, precoVenda, precoCusto);
                    prod.estoqueAtual = estoqueAtual - quantidadeInput;
                    const txtEstoqueLinha = divTextoLinha.querySelector(".txt-dinamico-estoque");
                    if (txtEstoqueLinha) {
                        const novoSaldo = prod.estoqueAtual - quantidadeJaNoCupom;
                        txtEstoqueLinha.textContent = prod.aGranel ? novoSaldo.toFixed(3) : novoSaldo.toFixed(0);
                    }
                }
            });

            divItemFilho.appendChild(divTextoLinha);
            divItemFilho.appendChild(divMenuBotoes);
            container.appendChild(divItemFilho);
        });
    });
}
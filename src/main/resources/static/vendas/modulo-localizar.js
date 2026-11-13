// 🌳 RENDEREZAÇÃO PURA
async function carregarProdutosPDV() { 
    try { 
        const response = await fetch(`${API_URL}/produtos`, { 
            method: "GET", 
            headers: { "Authorization": `Bearer ${token}` } 
        }); 
        if (response.ok) { 
            listaProdutosGlobal = await response.json(); 
            montarArvoreVendasCentro(); 
        } else { 
            console.error( "Erro ao carregar produtos. Status:", response.status ); 
        } 
    } catch (erro) { 
        console.error("Erro ao carregar produtos:", erro); 
    } 
}


function montarArvoreVendasCentro() { 
    const container = document.getElementById("containerArvoreVendas"); 
    if (!container) { return; } 
    container.innerHTML = ""; 

    // Atualiza o contador mestre do cabeçalho de vendas
    const txtContador = document.getElementById("contadorProdutosCatalogo"); 
    if (txtContador) { 
        txtContador.textContent = listaProdutosGlobal.length; 
    } 

    // 🔤 1. Ordena a lista global de produtos direto pelo Nome de A a Z
    const produtosOrdenados = [...listaProdutosGlobal].sort((a, b) => {
        const nomeA = a.nome ? a.nome.trim().toUpperCase() : "";
        const nomeB = b.nome ? b.nome.trim().toUpperCase() : "";
        return nomeA.localeCompare(nomeB, "pt-BR");
    });

    // 🔨 2. Renderiza a lista corrida na tela (Visão Direta de Balcão)
    produtosOrdenados.forEach(prod => { 
        const fornecedorNome = prod.fornecedor ? prod.fornecedor.nome.trim().toUpperCase() : "PRODUTOS AVULSOS / ARTESANAIS"; 
        const tipoLabel = prod.aGranel ? "[Granel]" : "[Unid]"; 
        const precoVenda = Number(prod.precoVenda || 0); 
        const precoCusto = Number(prod.precoCusto || 0); 
        const estoqueAtual = Number(prod.estoqueAtual ?? 0); 
        const margem = precoCusto > 0 ? (((precoVenda - precoCusto) / precoCusto) * 100).toFixed(0) : "0"; 
        const estoqueFormatado = prod.aGranel ? estoqueAtual.toFixed(3) : estoqueAtual.toFixed(0); 

        // Calcula o saldo dinâmico em tempo real cruzando com o cupom da memória
        const itemJaNoCupomInicial = typeof carrinho !== "undefined" && Array.isArray(carrinho) ? carrinho.find(item => { 
            const idItem = item.produtoId ?? item.produto?.id ?? item.id; 
            return Number(idItem) === Number(prod.id); 
        }) : null; 
        const quantidadeJaNoCupomInicial = Number(itemJaNoCupomInicial?.quantidade || 0); 
        const saldoDisponivelInicial = estoqueAtual - quantidadeJaNoCupomInicial; 
        const saldoFormatadoInicial = prod.aGranel ? saldoDisponivelInicial.toFixed(3) : saldoDisponivelInicial.toFixed(0);

        // Bloco individual do produto (Sem container pai colapsável)
        const divItemFilho = document.createElement("div"); 
        divItemFilho.style.cssText = "padding: 6px 8px; margin-bottom: 6px; font-size: 13px; color: #ecf0f1; background: rgba(255,255,255,0.02); border-radius: 4px; display: flex; flex-direction: column; gap: 2px; font-family: Arial, sans-serif;"; 

        // Texto da linha: O PRODUTO vem na frente com destaque máximo, seguido do seu fornecedor
        const divTextoLinha = document.createElement("div"); 
        divTextoLinha.style.cssText = "cursor: pointer; display: inline-block; width: 100%; padding: 4px; border-radius: 3px;"; 
        divTextoLinha.innerHTML = `🔹 <span style="color: #4af37a; font-weight: bold; font-size: 13.5px;">${prod.nome.toUpperCase()}</span> <small style="color: #ff9800;"> ${tipoLabel} </small> <br> <span style="color: #bdc3c7; font-size: 11px;">🏭 Fornecedor: ${fornecedorNome}</span> | <span style="color: #5eff5e; font-weight: bold;"> R$ ${precoVenda.toFixed(2)} </span> <small style="color: #bdc3c7; font-size: 11px;"> (Margem: ${margem}%) </small> <small style="color: #ffd54f; font-size: 11px; font-weight: bold;"> | Est: ${estoqueFormatado} | Disp: <span class="txt-dinamico-estoque" style="color: #5eff5e;">${saldoFormatadoInicial}</span> </small>`; 

        // Menu de botões inferior
        const divMenuBotoes = document.createElement("div"); 
        divMenuBotoes.className = "menu-botoes-pdv"; 
        divMenuBotoes.style.cssText = "display: none; gap: 6px; padding-left: 15px; margin-top: 4px; margin-bottom: 2px;"; 
        divMenuBotoes.innerHTML = ` <button class="btn" style="background: #27ae60; color: white; font-size: 11px; padding: 2px 8px; border: none; border-radius: 3px; font-weight: bold; text-transform: uppercase;"> Mover </button> <button class="btn" style="background: #7f8c8d; color: white; font-size: 11px; padding: 2px 8px; border: none; border-radius: 3px; font-weight: bold; text-transform: uppercase;" disabled> Alterar </button> <button class="btn" style="background: #7f8c8d; color: white; font-size: 11px; padding: 2px 8px; border: none; border-radius: 3px; font-weight: bold; text-transform: uppercase;" disabled> Incluir </button> `; 

        // Evento de clique para expandir os botões contextuais do item
        divTextoLinha.addEventListener("click", evento => { 
            evento.stopPropagation(); 
            container.querySelectorAll(".menu-botoes-pdv").forEach(menu => { 
                if (menu !== divMenuBotoes) { 
                    menu.style.display = "none"; 
                } 
            }); 
            divMenuBotoes.style.display = divMenuBotoes.style.display === "flex" ? "none" : "flex"; 
        }); 

        // Configuração do botão Mover
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
			// 4. Bloqueia se a quantidade estourar o saldo disponível 
			               if (quantidadeInput > saldoDisponivel) { 
			                   alert( `Estoque insuficiente.\n\n` + `Estoque atual: ${estoqueFormatado}\n` + `Já lançado no cupom: ${quantidadeJaNoCupom}\n` + `Saldo disponível: ${saldoDisponivel}` ); 
			                   return; 
			               } 
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
}
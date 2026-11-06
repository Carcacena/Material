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

    // 🔄 1. AGRUPAMENTO INTELIGENTE POR FORNECEDOR (O Pai da Árvore)
    const hierarquia = {}; 
    listaProdutosGlobal.forEach(prod => { 
        const fornecedorNome = prod.fornecedor ? prod.fornecedor.nome.trim().toUpperCase() : "PRODUTOS AVULSOS / ARTESANAIS"; 
        if (!hierarquia[fornecedorNome]) { 
            hierarquia[fornecedorNome] = []; 
        } 
        hierarquia[fornecedorNome].push(prod); 
    }); 

    // 🔤 2. Ordena os Fornecedores (ex: LORENZETTI, UNILEVER) de A a Z
    const fornecedoresOrdenados = Object.keys(hierarquia).sort((a, b) => a.localeCompare(b, "pt-BR")); 

    // 🔨 3. Monta a árvore física na interface do balcão
    fornecedoresOrdenados.forEach(fornecedorPai => { 
        const divGrupo = document.createElement("div"); 
        divGrupo.style.cssText = "margin-bottom: 8px; font-family: Arial, sans-serif;"; 

        // 📁 LINHA RAIZ: O Fornecedor Pai
        const divRaizRow = document.createElement("div"); 
        divRaizRow.style.cssText = "display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 8px; color: white; background: rgba(255,255,255,0.02); border-radius: 4px; transition: 0.2s;"; 
        divRaizRow.innerHTML = `📁 <span style="font-weight: bold; font-size: 13px; color: #4af37a;"> ${fornecedorPai} </span> <span style="color: #ff9800; font-size: 11px; font-weight: bold;"> (${hierarquia[fornecedorPai].length} Itens) </span>`; 

        // Container dos Produtos Filhos (Sub-Raiz) 
        const divSubRaizContainer = document.createElement("div"); 
        divSubRaizContainer.style.cssText = "display: none; padding-left: 18px; margin-top: 4px; border-left: 1px dashed rgba(74, 243, 122, 0.2);"; 

        // Abre e fecha a pasta do fornecedor com um clique macio
        divRaizRow.addEventListener("click", () => { 
            divSubRaizContainer.style.display = divSubRaizContainer.style.display === "none" ? "block" : "none"; 
        }); 

        // Varre os produtos pertencentes àquele Fornecedor Pai
        hierarquia[fornecedorPai].forEach(prod => { 
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

            // LINHA FILHO (O Produto cadastrado)
            const divItemFilho = document.createElement("div"); 
            divItemFilho.style.cssText = "padding: 4px 0; font-size: 13px; color: #ecf0f1; display: flex; flex-direction: column; gap: 2px;"; 

            // Texto descritivo da linha do produto
            const divTextoLinha = document.createElement("div"); 
            divTextoLinha.style.cssText = "cursor: pointer; display: inline-block; width: 100%; padding: 4px; border-radius: 3px;"; 
            divTextoLinha.innerHTML = `🔹 <strong>${prod.nome}</strong> <small style="color: #ff9800;"> ${tipoLabel} </small> - <span style="color: #5eff5e; font-weight: bold;"> R$ ${precoVenda.toFixed(2)} </span> <small style="color: #bdc3c7; font-size: 11px;"> (Margem: ${margem}%) </small> <small style="color: #ffd54f; font-size: 11px; font-weight: bold;"> | Est: ${estoqueFormatado} | Disp: <span class="txt-dinamico-estoque" style="color: #5eff5e;">${saldoFormatadoInicial}</span> </small>`; 

            // Menu contextual de operações inferiores (Mover / Incluir)
            const divMenuBotoes = document.createElement("div"); 
            divMenuBotoes.className = "menu-botoes-pdv"; 
            divMenuBotoes.style.cssText = "display: none; gap: 6px; padding-left: 15px; margin-top: 2px; margin-bottom: 4px;"; 
            divMenuBotoes.innerHTML = ` <button class="btn" style="background: #27ae60; color: white; font-size: 11px; padding: 2px 8px; border: none; border-radius: 3px; font-weight: bold; text-transform: uppercase;"> Mover </button> <button class="btn" style="background: #7f8c8d; color: white; font-size: 11px; padding: 2px 8px; border: none; border-radius: 3px; font-weight: bold; text-transform: uppercase;" disabled> Alterar </button> <button class="btn" style="background: #7f8c8d; color: white; font-size: 11px; padding: 2px 8px; border: none; border-radius: 3px; font-weight: bold; text-transform: uppercase;" disabled> Incluir </button> `; 

            // Clique abre o menu contextual do item e recolhe os demais
            divTextoLinha.addEventListener("click", evento => { 
                evento.stopPropagation(); 
                container.querySelectorAll(".menu-botoes-pdv").forEach(menu => { 
                    if (menu !== divMenuBotoes) { 
                        menu.style.display = "none"; 
                    } 
                }); 
                divMenuBotoes.style.display = divMenuBotoes.style.display === "flex" ? "none" : "flex"; 
            }); 

            // Atrela o botão mestre de movimentação para o carrinho definitivo
            const btnMoverLinha = divMenuBotoes.querySelector("button:nth-child(1)"); 
            btnMoverLinha.addEventListener("click", evento => { 
                evento.stopPropagation(); 
                const inputQtd = document.getElementById("inputQuantidade"); 
                if (!inputQtd) { return; } 
                const quantidadeInput = prod.aGranel ? parseFloat(inputQtd.value) : parseInt(inputQtd.value, 10); 

                if ( !Number.isFinite(quantidadeInput) || quantidadeInput <= 0 ) { 
                    alert( "Atenção, piá! Informe uma quantidade válida maior que zero." ); 
                    return; 
                } 

                const itemJaNoCupom = typeof carrinho !== "undefined" && Array.isArray(carrinho) ? carrinho.find(item => { 
                    const idItem = item.produtoId ?? item.produto?.id ?? item.id; 
                    return Number(idItem) === Number(prod.id); 
                }) : null; 
                const quantidadeJaNoCupom = Number( itemJaNoCupom?.quantidade || 0 ); 
                const saldoDisponivel = estoqueAtual - quantidadeJaNoCupom; 

                if (quantidadeInput > saldoDisponivel) { 
                    alert( `Estoque insuficiente.\n\nEstoque atual: ${estoqueFormatado}\nJá lançado: ${quantidadeJaNoCupom}\nSaldo disponível: ${saldoDisponivel}` ); 
                    return; 
                } 

				// 5. Somente agora pode entrar no cupom com as posições corrigidas de variáveis
				                if (typeof adicionarProdutoAoCupom === "function") { 
				                    // Garante que a quantidade digitada (quantidadeInput) preencha o campo certo
				                    adicionarProdutoAoCupom(
				                        prod.id, 
				                        prod.nome, 
				                        quantidadeInput, 
				                        precoVenda, 
				                        precoCusto 
				                    ); 

				                    // Abate localmente o saldo na memória ram para a tela atualizar
				                    prod.estoqueAtual = estoqueAtual - quantidadeInput;

				                    // Atualiza dinamicamente o contador de "Disp:" na coluna da esquerda
				                    const txtEstoqueLinha = divTextoLinha.querySelector(".txt-dinamico-estoque");
				                    if (txtEstoqueLinha) {
				                        const saldoAtualizado = prod.estoqueAtual;
				                        txtEstoqueLinha.textContent = prod.aGranel ? saldoAtualizado.toFixed(3) : saldoAtualizado.toFixed(0);
				                    }
				                    
				                    divMenuBotoes.style.display = "none"; // Recolhe o mini menu
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
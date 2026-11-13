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

    // Atualiza contador do cabeçalho 
    const txtContador = document.getElementById("contadorProdutosCatalogo"); 
    if (txtContador) { 
        txtContador.textContent = listaProdutosGlobal.length; 
    } 

    // 🔄 1. Agrupa por PRODUTO RAIZ 
    const hierarquia = {}; 
    listaProdutosGlobal.forEach(prod => { 
        const raiz = prod.nome.trim().toUpperCase(); 
        if (!hierarquia[raiz]) { 
            hierarquia[raiz] = []; 
        } 
        hierarquia[raiz].push(prod); 
    }); 

    // 🔤 2. Ordena de A a Z 
    const raizesOrdenadas = Object.keys(hierarquia).sort((a, b) => a.localeCompare(b)); 

    // 🔨 3. Monta a árvore 
    raizesOrdenadas.forEach(produtoRaiz => { 
        const divGrupo = document.createElement("div"); 
        divGrupo.style.cssText = "margin-bottom: 6px; font-family: Arial, sans-serif;"; 

        // 📁 LINHA RAIZ
        const divRaizRow = document.createElement("div"); 
        divRaizRow.style.cssText = "display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 0; color: white;"; 
        divRaizRow.innerHTML = `⚙️ <span style="font-weight: bold; font-size: 14px;"> ${produtoRaiz} </span> <span style="color: #ff9800; font-size: 11px;"> (${hierarquia[produtoRaiz].length} marcas) </span>`; 

        // Container dos filhos 
        const divSubRaizContainer = document.createElement("div"); 
        divSubRaizContainer.style.cssText = "display: none; padding-left: 24px; margin-top: 2px; border-left: 1px dashed rgba(255,255,255,0.15);"; 

        // Abre e fecha produto raiz 
        divRaizRow.addEventListener("click", () => { 
            divSubRaizContainer.style.display = divSubRaizContainer.style.display === "none" ? "block" : "none"; 
        }); 

        // Varre Clientes daquele produto 
        hierarquia[produtoRaiz].forEach(prod => { 
            const ClienteNome = prod.Cliente ? prod.Cliente.nome : "Sem Marca"; 
            const tipoLabel = prod.aGranel ? "[Granel]" : "[Unid]"; 
            const precoVenda = Number(prod.precoVenda || 0); 
            const precoCusto = Number(prod.precoCusto || 0); 
            const estoqueAtual = Number(prod.estoqueAtual ?? 0); 
            const margem = precoCusto > 0 ? (((precoVenda - precoCusto) / precoCusto) * 100).toFixed(0) : "0"; 
            const estoqueFormatado = prod.aGranel ? estoqueAtual.toFixed(3) : estoqueAtual.toFixed(0); 

            // Calcula o saldo dinâmico em tempo real antes de desenhar a linha
            const itemJaNoCupomInicial = typeof carrinho !== "undefined" && Array.isArray(carrinho) ? carrinho.find(item => { 
                const idItem = item.produtoId ?? item.produto?.id ?? item.id; 
                return Number(idItem) === Number(prod.id); 
            }) : null; 
            const quantidadeJaNoCupomInicial = Number(itemJaNoCupomInicial?.quantidade || 0); 
            const saldoDisponivelInicial = estoqueAtual - quantidadeJaNoCupomInicial; 
            const saldoFormatadoInicial = prod.aGranel ? saldoDisponivelInicial.toFixed(3) : saldoDisponivelInicial.toFixed(0);

            // LINHA SUB-RAIZ 
            const divItemFilho = document.createElement("div"); 
            divItemFilho.style.cssText = "padding: 6px 0; font-size: 13px; color: #ecf0f1; display: flex; flex-direction: column; gap: 4px;"; 

            // Texto da linha 
            const divTextoLinha = document.createElement("div"); 
            divTextoLinha.style.cssText = "cursor: pointer; display: inline-block;"; 
            divTextoLinha.innerHTML = `🔹 <strong>${ClienteNome}</strong> <small style="color: #ff9800;"> ${tipoLabel} </small> - <span style="color: #5eff5e; font-weight: bold;"> R$ ${precoVenda.toFixed(2)} </span> <small style="color: #bdc3c7; font-size: 11px;"> (Margem: ${margem}%) </small> <small style="color: #ffd54f; font-size: 11px; font-weight: bold;"> | Estoque: ${estoqueFormatado} | Est. Atual: <span class="txt-dinamico-estoque" style="color: #5eff5e;">${saldoFormatadoInicial}</span> </small>`; 

            // Menu contextual 
            const divMenuBotoes = document.createElement("div"); 
            divMenuBotoes.className = "menu-botoes-pdv"; 
            divMenuBotoes.style.cssText = "display: none; gap: 6px; padding-left: 15px; margin-top: 2px; margin-bottom: 4px;"; 
            divMenuBotoes.innerHTML = ` <button class="btn" style="background: #27ae60; color: white; font-size: 11px; padding: 2px 8px; border: none; border-radius: 3px; font-weight: bold; text-transform: uppercase;"> Mover </button> <button class="btn" style="background: #7f8c8d; color: white; font-size: 11px; padding: 2px 8px; border: none; border-radius: 3px; font-weight: bold; text-transform: uppercase;" disabled> Alterar </button> <button class="btn" style="background: #7f8c8d; color: white; font-size: 11px; padding: 2px 8px; border: none; border-radius: 3px; font-weight: bold; text-transform: uppercase;" disabled> Incluir </button> `; 

            // Clique no Cliente abre menu e fecha os outros 
            divTextoLinha.addEventListener("click", evento => { 
                evento.stopPropagation(); 
                container.querySelectorAll(".menu-botoes-pdv").forEach(menu => { 
                    if (menu !== divMenuBotoes) { 
                        menu.style.display = "none"; 
                    } 
                }); 
                divMenuBotoes.style.display = divMenuBotoes.style.display === "flex" ? "none" : "flex"; 
            }); 

            // Botão Mover 
            const btnMoverLinha = divMenuBotoes.querySelector("button:nth-child(1)"); 
            btnMoverLinha.addEventListener("click", evento => { 
                evento.stopPropagation(); 
                const inputQtd = document.getElementById("inputQuantidade"); 
                if (!inputQtd) { return; } 
                const quantidadeInput = prod.aGranel ? parseFloat(inputQtd.value) : parseInt(inputQtd.value, 10); 

                // 1. Valida a quantidade digitada 
                if ( !Number.isFinite(quantidadeInput) || quantidadeInput <= 0 ) { 
                    alert( "Atenção, piá! Informe uma quantidade válida maior que zero." ); 
                    return; 
                } 

                // 2. Descobre quanto deste mesmo produto já está reservado no cupom. 
                const itemJaNoCupom = typeof carrinho !== "undefined" && Array.isArray(carrinho) ? carrinho.find(item => { 
                    const idItem = item.produtoId ?? item.produto?.id ?? item.id; 
                    return Number(idItem) === Number(prod.id); 
                }) : null; 
                const quantidadeJaNoCupom = Number( itemJaNoCupom?.quantidade || 0 ); 

                // 3. Calcula o saldo ainda disponível 
                const saldoDisponivel = estoqueAtual - quantidadeJaNoCupom; 

                // 4. Bloqueia se a quantidade estourar o saldo disponível 
                if (quantidadeInput > saldoDisponivel) { 
                    alert( `Estoque insuficiente.\n\n` + `Estoque atual: ${estoqueFormatado}\n` + `Já lançado no cupom: ${quantidadeJaNoCupom}\n` + `Saldo disponível: ${saldoDisponivel}` ); 
                    return; 
                } 

                // 5. Somente agora pode entrar no cupom 
                if (typeof adicionarProdutoAoCupom === "function") { 
                    adicionarProdutoAoCupom( 
                        prod.id, 
                        `${produtoRaiz} (${ClienteNome})`, 
                        quantidadeInput, 
                        precoVenda, 
                        precoCusto 
                    ); 

                    // Salva a alteração local na memória ram
                    prod.estoqueAtual = estoqueAtual - quantidadeInput;

                    // Atualiza o texto do "Est. Atual" na linha do catálogo (Esquerda)
                    const txtEstoqueLinha = divTextoLinha.querySelector(".txt-dinamico-estoque");
                    if (txtEstoqueLinha) {
                        const novoSaldoCalculado = prod.estoqueAtual - quantidadeJaNoCupom;
                        txtEstoqueLinha.textContent = prod.aGranel ? novoSaldoCalculado.toFixed(3) : novoSaldoCalculado.toFixed(0);
                    }

                    // 🔥 REATIVIDADE DO CUPOM (DIREITA)
                    // Se você tiver uma função separada para renderizar/desenhar a lista da direita, chamamos ela aqui para o print atualizar na hora!
                    if (typeof renderizarItensCupom === "function") {
                        renderizarItensCupom(); 
                    } else if (typeof atualizarVisualCupom === "function") {
                        atualizarVisualCupom();
                    }

                    inputQtd.value = "1"; 
                    divMenuBotoes.style.display = "none"; 
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
// 🌟 Carrega os fornecedores do banco assim que a página abre

const API_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080"
        : window.location.origin;



async function carregarFornecedores() {

    const selectFornecedor =
        document.getElementById('fornecedorId');

    const selectTransportadora =
        document.getElementById('transportadoraId');


    selectFornecedor.innerHTML =
        '<option value="">Carregando fornecedores...</option>';


    if (selectTransportadora) {

        selectTransportadora.innerHTML =
            '<option value="">Carregando transportadoras...</option>';

    }


    try {

        const response = await fetch('/api/fornecedores', {

            method: 'GET',

            headers: montarHeaders()

        });


        if (!response.ok) {

            throw new Error(
                'Erro ao buscar fornecedores: ' + response.status
            );

        }


        const fornecedores =
            await response.json();


        // =============================
        // FORNECEDOR DA NOTA
        // =============================

        selectFornecedor.innerHTML =
            '<option value="">Selecione o Fornecedor...</option>';


        // =============================
        // TRANSPORTADORA
        // Mesma tabela fornecedor
        // =============================

        if (selectTransportadora) {

            selectTransportadora.innerHTML =
                '<option value="">Selecione a Transportadora...</option>';

        }


        fornecedores.forEach(f => {

            // FORNECEDOR
            const optFornecedor =
                document.createElement('option');

            optFornecedor.value = f.id;

            optFornecedor.textContent =
                `${f.nome} (ID: ${f.id})`;

            selectFornecedor.appendChild(
                optFornecedor
            );


            // TRANSPORTADORA
            if (selectTransportadora) {

                const optTransportadora =
                    document.createElement('option');

                optTransportadora.value = f.id;

                optTransportadora.textContent =
                    `${f.nome} (ID: ${f.id})`;

                selectTransportadora.appendChild(
                    optTransportadora
                );

            }

        });


    } catch (erro) {

        console.error(
            'Erro ao carregar fornecedores:',
            erro
        );


        selectFornecedor.innerHTML =
            '<option value="">Erro ao carregar fornecedores</option>';


        if (selectTransportadora) {

            selectTransportadora.innerHTML =
                '<option value="">Erro ao carregar transportadoras</option>';

        }

    }

}

carregarFornecedores();


// 📦 BUSCA PRODUTOS FILTRADOS POR FORNECEDOR (Modo Seletivo Manual Sem Conflito de Rota)
async function carregarProdutosPorFornecedor() {
    const fornecedorId = document.getElementById('fornecedorId').value;
    const selectProduto = document.getElementById('selectProduto');

    if (!fornecedorId) {
        selectProduto.innerHTML = '<option value="">Selecione o Fornecedor primeiro...</option>';
        return;
    }

    selectProduto.innerHTML = '<option value="">Carregando produtos...</option>';

    try {
        // Rota nativa corrigida para alinhar perfeitamente com o seu Back-End Java
        const response = await fetch('/produtos', {
            method: 'GET',
            headers: montarHeaders()
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar produtos: ' + response.status);
        }

        const todosProdutos = await response.json();
        
        // Mantém o cache invisível na memória para proteção do fluxo
        window.produtosFornecedorAtual = todosProdutos.filter(p =>
            p.fornecedor && Number(p.fornecedor.id) === Number(fornecedorId)
        );

        if (window.produtosFornecedorAtual.length === 0) {
            selectProduto.innerHTML = '<option value="">Nenhum produto cadastrado para este fornecedor</option>';
            return;
        }

        selectProduto.innerHTML = '<option value="">Escolha o Produto...</option>';
        window.produtosFornecedorAtual.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.nome} (ID: ${p.id})`;
            selectProduto.appendChild(opt);
        });

    } catch (erro) {
        console.error('Erro ao carregar produtos:', erro);
        selectProduto.innerHTML = '<option value="">Erro ao carregar produtos</option>';
    }
}
// 🔌 ATALHO DO HARDWARE: Intercepta o leitor USB na Entrada e faz a seleção automática
function buscarProdutoPorCodigoBarrasEntrada(codigo) {
    if (!codigo || !window.produtosFornecedorAtual) return;
    const codigoLimpo = codigo.trim();
    
    // Procura o produto bipado dentro da lista já filtrada do fornecedor
    const encontrado = window.produtosFornecedorAtual.find(p => p.codigoBarras === codigoLimpo);
    
    if (encontrado) {
        const selectProduto = document.getElementById('selectProduto');
        if (selectProduto) {
            selectProduto.value = encontrado.id;
            // Dispara manualmente o evento de mudança para que a tela carregue os preços de custo/venda antigos
            selectProduto.dispatchEvent(new Event('change'));
            console.log(`🔌 Scanner localizou o item: ${encontrado.nome}`);
        }
    } else {
        alert(`⚠️ Código [${codigoLimpo}] não localizado para este fornecedor. Registre o produto no cadastro primeiro ou digite manualmente.`);
    }
}

async function salvarEntrada() {

    const elNota = document.getElementById('numeroNota');
    const elSerie = document.getElementById('serie');
    const elChave = document.getElementById('chaveAcesso');
    const elData = document.getElementById('dataRecebimento');
    const elForn = document.getElementById('fornecedorId');

    if (!elNota || !elSerie || !elChave || !elData || !elForn) {
        alert("❌ Erro interno: Elementos do formulário HTML não foram encontrados.");
        return;
    }

    const numeroNota = elNota.value;
    const serie = elSerie.value;
    const chaveAcesso = elChave.value;
    const dataRecebimento = elData.value;
    const fornecedorId = elForn.value;

    if (!numeroNota || !chaveAcesso || !dataRecebimento ||
        !fornecedorId || itensNota.length === 0) {

        alert(
            "⚠️ Erro de Validação:\n" +
            "Por favor, preencha o cabeçalho da nota e insira pelo menos um item no grid."
        );
        return;
    }

    const payloadFiscal = {
        numeroNota: numeroNota,
        serie: serie,
        chaveAcesso: chaveAcesso,
        dataRecebimento: dataRecebimento,
        fornecedorId: parseInt(fornecedorId),
        itens: itensNota
    };

    try {

        // 1. GRAVA A ENTRADA E OS ITENS
        const response = await fetch('/api/entradas', {
            method: 'POST',
            headers: montarHeaders(),
            body: JSON.stringify(payloadFiscal)
        });

        if (!response.ok) {
            const textoErro = await response.text();

            alert(
                '❌ O Servidor Java recusou o registro:\n' +
                textoErro
            );
            return;
        }

        // 2. PEGA A ENTRADA QUE O JAVA ACABOU DE GRAVAR
        const entradaSalva = await response.json();

        // ✅ VALIDAÇÃO IMEDIATA: Garante o ID antes de gastar processamento no loop
        if (!entradaSalva || !entradaSalva.id) {
            throw new Error("A entrada foi gravada, mas o servidor não retornou o ID.");
        }

        // 🔮 MAGIA: Sincroniza e atualiza os preços e estoques na ficha master de cada produto
		// 🔮 MAGIA HÍBRIDA: Sincroniza e atualiza os preços e estoques na ficha master de cada produto
		       for (const item of itensNota) {
		           try {
		               // 1. Busca os dados atuais do produto para não perder campos master
		               const prodResp = await fetch(`${API_URL}/produtos/${item.produtoId || item.id}`, {
		                   method: 'GET',
		                   headers: montarHeaders()
		               });

		               if (prodResp.ok) {
		                   const prodAtual = await prodResp.json();

		                   // 2. Calcula as novas quantidades somando a entrada ao estoque antigo
		                   const novaQteEntrada = parseInt(item.quantidade) || 0;
		                   const novoEstoqueAtual = (parseInt(prodAtual.estoqueAtual) || 0) + novaQteEntrada;

		                   // 💰 Extrai e valida os preços vindos do grid da nota de entrada
		                   const custoInformado = parseFloat(item.precoCusto) || 0;
		                   let vendaInformada = parseFloat(item.precoVenda) || 0;

		                   // 🛡️ TRAVA DE SEGURANÇA: Se o preço de venda veio zerado da correria do balcão (manual ou scanner),
		                   // o sistema calcula automaticamente aplicando a margem comercial de 40% sobre o custo.
		                   if (vendaInformada <= 0 && custoInformado > 0) {
		                       vendaInformada = custoInformado * 1.40;
		                       console.log(`⚠️ Produto ID ${prodAtual.id} entrou zerado. Preço automático: R$ ${vendaInformada.toFixed(2)}`);
		                   } else if (vendaInformada <= 0) {
		                       // Se até o custo for zero, resgata o último preço de venda válido do cadastro master
		                       vendaInformada = parseFloat(prodAtual.precoVenda) || 0.00;
		                   }

		                   // 3. Monta o payload unificado achatando o fornecedorId para bater com o Spring/MySQL
		                   const produtoSincronizado = {
		                       id: prodAtual.id,
		                       nome: prodAtual.nome,
		                       codigoBarras: prodAtual.codigoBarras || null,
		                       aGranel: prodAtual.aGranel || false,
		                       dataValidade: prodAtual.dataValidade || null,
		                       precoCusto: custoInformado > 0 ? custoInformado : (parseFloat(prodAtual.precoCusto) || 0),
		                       precoVenda: vendaInformada,
		                       qteEntrada: novaQteEntrada,
		                       estoqueAtual: novoEstoqueAtual,
		                       fornecedorId: prodAtual.fornecedor ? parseInt(prodAtual.fornecedor.id) : parseInt(fornecedorId)
		                   };

		                   // 4. Dispara o PUT para atualizar o produto de forma definitiva no banco de dados
		                   await fetch(`${API_URL}/produtos/${produtoSincronizado.id}`, {
		                       method: 'PUT',
		                       headers: montarHeaders(),
		                       body: JSON.stringify(produtoSincronizado)
		                   });
		               }
		           } catch (err) {
		               console.error(`Falha ao sincronizar o produto ID ${item.produtoId}:`, err);
		           }
		       }



        if (!entradaSalva || !entradaSalva.id) {
            throw new Error(
                "A entrada foi gravada, mas o servidor não retornou o ID."
            );
        }

        console.log("Entrada gravada. ID:", entradaSalva.id);

        // 3. GARANTE QUE O TOTAL DA NOTA ESTÁ ATUALIZADO
        calcularTotalNota();

        const pegarValor = (id) => {
            const campo = document.getElementById(id);
            return campo ? (parseFloat(campo.value) || 0) : 0;
        };

        // 4. MONTA EXATAMENTE O EntradaImpostosDTO
        const impostos = {
            baseCalculoIcms: pegarValor("baseCalculoIcms"),
            valorIcms: pegarValor("valorIcms"),
            baseCalculoIcmsSt: pegarValor("baseCalculoIcmsSt"),
            valorIcmsSt: pegarValor("valorIcmsSt"),
            valorTotalProdutos: pegarValor("valorTotalProdutos"),
            valorFrete: pegarValor("valorFrete"),
            valorSeguro: pegarValor("valorSeguro"),
            valorDesconto: pegarValor("valorDesconto"),
            outrasDespesasAcessorias: pegarValor("outrasDespesasAcessorias"),
            valorIpi: pegarValor("valorIpi"),
            valorTotalNota: pegarValor("valorTotalNota")
        };

        console.log("Impostos enviados:", impostos);

        // 5. GRAVA OS IMPOSTOS LIGADOS À ENTRADA CRIADA
        const responseImpostos = await fetch(
            `/api/entradas/${entradaSalva.id}/impostos`,
            {
                method: 'POST',
                headers: montarHeaders(),
                body: JSON.stringify(impostos)
            }
        );

        if (!responseImpostos.ok) {
            const erroImpostos = await responseImpostos.text();

            alert(
                "⚠️ A Nota Fiscal foi gravada, mas houve erro ao gravar os impostos:\n" +
                erroImpostos
            );
            return;
        }

        const negociacao =
            window.dadosNegociacaoEntrada || {};


        console.log(
            "NEGOCIACAO ENTRADA:",
            negociacao
        );

        // ======================================================
        // 6. GERAÇÃO AUTOMÁTICA DO CONTAS A PAGAR
        // ======================================================

        if (!negociacao.parcelas ||
            negociacao.parcelas.length === 0) {

            throw new Error(
                "Dados financeiros da entrada não foram confirmados."
            );
        }

        const payloadContasPagar = {

            numeroEntrada:
                String(entradaSalva.id),

            fornecedorId:
                parseInt(fornecedorId),

            numeroNotaFiscal:
                parseInt(numeroNota),

            serie:
                serie,

            valorFinalCorrigido:
                Number(
                    negociacao.valorFinalCorrigido ||
                    impostos.valorTotalNota
                ),

            inpcAnualAplicado:
                Number(
                    negociacao.inpcAnualAplicado || 0
                ),

            formaPagamento:
                negociacao.formaPagamento || "DINHEIRO",

            parcelas:
                negociacao.parcelas
        };

        console.log(
            "📤 CONTAS A PAGAR:",
            payloadContasPagar
        );
        const responseContasPagar =
            await fetch(
                "/contas-pagar/gerar",
                {
                    method: "POST",
                    headers: montarHeaders(),
                    body: JSON.stringify(
                        payloadContasPagar
                    )
                }
            );


        if (!responseContasPagar.ok) {

            const erroFinanceiro =
                await responseContasPagar.text();

            throw new Error(
                "Entrada gravada, mas houve falha ao gerar Contas a Pagar: " +
                erroFinanceiro
            );
        }

        const titulosGerados = await responseContasPagar.json();

        console.log(
            "✅ CONTAS A PAGAR GERADO:",
            titulosGerados
        );

        // 7. SOMENTE AGORA ENCERRA A OPERAÇÃO COM SUCESSO E LIMPA A TELA
        alert(`🎉 Nota Fiscal nº ${numeroNota} registrada e estoque sincronizado com sucesso!`);

        // Reseta o formulário e limpa o grid de itens da memória
        if (typeof limparFormularioNota === "function") {
            limparFormularioNota();
        } else {
            document.getElementById("formEntrada")?.reset();
            if (typeof itensNota !== "undefined") itensNota.length = 0;
            if (typeof atualizarGrid === "function") atualizarGrid();
        }

    } catch (erro) {
        console.error("❌ Falha crítica no processamento da entrada:", erro);
        alert("Erro no processamento: " + erro.message);
    }
}

// 🛒 CAPTURA OS INPUTS DA TELA E INSERE O ITEM NO GRID DA NOTA COM VALIDAÇÃO DE VENDA
function adicionarItem() {
    const selectProduto = document.getElementById('selectProduto');
    const idProduto = selectProduto ? selectProduto.value : "";
    const nomeProduto = selectProduto ? selectProduto.options[selectProduto.selectedIndex]?.text : "";
    
    // Função auxiliar para limpar formatação brasileira (ex: "1.250,50" -> 1250.50)
    const limparNumero = (valorStr) => {
        if (!valorStr) return 0;
        let limpo = String(valorStr).trim();
        if (limpo.includes(',')) {
            limpo = limpo.replace(/\./g, '').replace(',', '.');
        }
        return parseFloat(limpo) || 0;
    };

    const qtd = parseInt(document.getElementById('qtdEntrada')?.value) || 0;
    const precoCustoItem = limparNumero(document.getElementById('precoCusto')?.value);
    
    // 🏷️ Captura o valor digitado no novo campo do HTML
    const elPrecoVenda = document.getElementById('precoVendaItem');
    const precoVendaItem = elPrecoVenda ? limparNumero(elPrecoVenda.value) : 0;

    // ==========================================
    // 🛡️ TRAVAS DE SEGURANÇA E VALIDAÇÃO (IH)
    // ==========================================
    if (!idProduto) {
        alert("⚠️ Por favor, escolha um produto antes de adicionar!");
        selectProduto.focus();
        return;
    }
    if (qtd <= 0 || qtd > 999999) {
        alert("⚠️ A quantidade de entrada deve ser entre 1 e 999.999!");
        document.getElementById('qtdEntrada').focus();
        return;
    }
    if (precoCustoItem <= 0 || precoCustoItem > 999999.99) {
        alert("⚠️ Por favor, informe um preço de custo válido (entre R$ 0,01 e R$ 999.999,99)!");
        document.getElementById('precoCusto').focus();
        return;
    }
    
    // 🛑 EXIGÊNCIA EXPLICÍTADA: Bloqueia a inserção se o operador tentar deixar a venda zerada ou acima do teto
    if (precoVendaItem <= 0 || precoVendaItem > 999999.99) {
        alert("⚠️ Exigência do Sistema:\nInforme um Preço de Venda válido (entre R$ 0,01 e R$ 999.999,99)!");
        elPrecoVenda.focus();
        return;
    }

    // Cria a estrutura exata exigida pela lista global 'itensNota'
    const novoItem = {
        produtoId: parseInt(idProduto),
        nome: nomeProduto,
        quantidade: qtd,
        precoCusto: precoCustoItem,
        precoVenda: precoVendaItem,
        total: Number((qtd * precoCustoItem).toFixed(2))
    };

    // Inicializa a lista global caso ela não tenha sido instanciada
    if (typeof itensNota === 'undefined') window.itensNota = [];
    itensNota.push(novoItem);
    console.log("📦 Item adicionado ao grid provisório:", novoItem);

    // Renderiza a nova linha na tabela do HTML e reseta os inputs locais de itens
    if (typeof atualizarGrid === 'function') {
        atualizarGrid();
    } else {
        // Fallback nativo formatado para valores altos
        const tbody = document.getElementById('tabelaItens')?.getElementsByTagName('tbody')[0];
        if (tbody) {
            const fmtMoeda = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const novaLinha = tbody.insertRow();
            novaLinha.innerHTML = `
                <td>${novoItem.nome}</td>
                <td style="text-align: right;">${novoItem.quantidade.toLocaleString('pt-BR')}</td>
                <td style="text-align: right;">${fmtMoeda(novoItem.precoCusto)}</td>
                <td style="text-align: right;">${fmtMoeda(novoItem.total)}</td>
            `;
        }
    }

    // Limpa apenas os inputs do produto que acabou de entrar, deixando o cursor pronto para o próximo bipe
    if (document.getElementById('precoCusto')) document.getElementById('precoCusto').value = "";
    if (elPrecoVenda) elPrecoVenda.value = "";
    if (document.getElementById('qtdEntrada')) document.getElementById('qtdEntrada').value = "1";
    if (selectProduto) {
        selectProduto.value = "";
        selectProduto.focus();
    }
}




// CONTROLE DO MENU: Abre ou fecha ao clicar
function alternarMenuSuspenso() {
    const menu = document.getElementById("menuSuspensoAcoes");
    menu.style.display = (menu.style.display === "none" || menu.style.display === "") ? "block" : "none";
}

function fecharMenuSuspenso() {
    document.getElementById("menuSuspensoAcoes").style.display = "none";
}

// Fecha se clicar fora dele
window.addEventListener("click", function(event) {
    const menu = document.getElementById("menuSuspensoAcoes");
    if (!event.target.closest('.btn-salvar') && menu && menu.style.display === "block") {
        fecharMenuSuspenso();
    }
});

// AÇÃO 1: Limpa completamente a tela (Cancelar)
function limparTelaEntradaCompleta() {
    if (confirm("Deseja realmente limpar todos os campos digitados?")) {
        document.getElementById("numeroNota").value = "";
        document.getElementById("serie").value = "";
        document.getElementById("chaveAcesso").value = "";
        document.getElementById("fornecedorId").value = "";
        document.getElementById('dataRecebimento').valueAsDate = new Date();
        document.getElementById("selectProduto").innerHTML = '<option value="">Selecione o Fornecedor primeiro...</option>';
        document.getElementById("qtdEntrada").value = "1";
        document.getElementById("precoCusto").value = "";

        // Limpa os campos ocultos do quadro de impostos
        const camposImpostos = ["baseCalculoIcms", "valorIcms", "baseCalculoIcmsSt", "valorIcmsSt", "valorTotalProdutos", "valorFrete", "valorSeguro", "valorDesconto", "outrasDespesasAcessorias", "valorIpi", "valorTotalNota"];
        camposImpostos.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) campo.value = "";
        });

        // Limpa o grid de itens
        itensNota = [];
        const tbody = document.getElementById("tabelaItens").querySelector("tbody");
        if (tbody) tbody.innerHTML = "";

        alert("Tela limpa com sucesso!");
    }
}

// AÇÃO 2: Dispara a devolução lógica (Muda para Status 2 e retira do estoque)
async function dispararDevolucaoEntradaPorNumero() {
    const numeroNotaParaEstornar = prompt("Digite o NÚMERO exato da Nota Fiscal que deseja DEVOLVER:");
    if (!numeroNotaParaEstornar) return;
    const prosseguir = confirm(`⚠️ ALERTA DE ESTORNO DE ESTOQUE:\n\nEsta ação localizará a Nota nº ${numeroNotaParaEstornar} no MySQL, SUBTRAIRÁ as quantidades do estoque e mudará o status da nota para DEVOLVIDO (Status 2).\n\nDeseja continuar?`);

    if (prosseguir) {
        try {
            // Usa a sua função nativa de cabeçalhos com token JWT
            const headersSeguros = montarHeaders();

            // ⚡ CORREÇÃO DO FETCH: Adicione a barra '/' antes de 'api/'
            const response = await fetch(
                `/api/entradas/devolver-nota/${numeroNotaParaEstornar}`,
                {
                    method: "PUT",
                    headers: headersSeguros
                }
            ); if (!response.ok) {
                const erroTexto = await response.text();
                throw new Error(erroTexto || "Ocorreu um erro no processamento do Java.");
            }

            alert(`✅ Sucesso! A nota ${numeroNotaParaEstornar} agora está como DEVOLVIDA (Status 2) e o estoque foi corrigido.`);
            location.reload(); // Recarrega a página limpa

        } catch (erro) {
            console.error("Erro no estorno:", erro);
            alert("❌ Falha na Devolução: " + erro.message);
        }
    }
}


function estornarNotaViaPainel(id) {
    if (confirm('Aviso Crítico: Deseja realmente estornar esta nota fiscal? O sistema irá retirar esses produtos do estoque físico da loja.')) {
        fetch(`/api/entradas/estornar/${id}`, {
            method: 'POST',
            headers: montarHeaders() // ⚡ UNIFICADO: Usando sua função padrão do sistema!
        })
            .then(res => {
                if (res.ok) {
                    alert('Nota estornada com sucesso e estoque atualizado!');
                    document.getElementById('selectNotaGerencial').dispatchEvent(new Event('change'));
                } else {
                    res.text().then(text => alert("Erro: " + text));
                }
            })
            .catch(err => alert("Erro na requisição de estorno: " + err));
    }
}



function fecharPainelGerencialFlutuante() {
    document.getElementById('modalPainelGerencial').style.display = 'none';
    document.getElementById('detalhesNotaGerencial').style.display = 'none';
    document.getElementById('selectNotaGerencial').value = "";
}

// 📦 FUNÇÃO AUXILIAR: Deixa o Painel Gerencial Arrastável pelo mouse
function tornarPainelArrastavel() {
    const header = document.getElementById("modalPainelHeader");
    const modal = document.getElementById("modalPainelGerencial");

    if (!header || !modal) return;

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Pega a posição inicial do mouse
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // Chama a função sempre que o mouse se mover
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // Calcula a nova posição do cursor
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Define a nova posição do modal na tela
        modal.style.top = (modal.offsetTop - pos2) + "px";
        modal.style.left = (modal.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // Para de mover quando o botão do mouse é solto
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
// ✨ COMPATIBILIDADE FORÇADA: Deixa a função exposta na raiz para o HTML ler direto!
window.filtrarNotas = function(event) {
    if (event) event.preventDefault(); // Impede o formulário de dar refresh na página

    const dataInicio = document.getElementById('filtroDataInicio').value;
    const dataFim = document.getElementById('filtroDataFim').value;
    const selectNota = document.getElementById('selectNotaGerencial');

    if (!dataInicio || !dataFim) {
        alert('Por favor, defina o período de datas completo.');
        return;
    }

    console.log(`Buscando notas no MySQL entre ${dataInicio} e ${dataFim}...`);

    fetch(`/api/entradas/filtrar?inicio=${dataInicio}&fim=${dataFim}`, {
        method: 'GET',
        headers: montarHeaders()
    })
        .then(res => res.json())
        .then(notas => {
            if (!selectNota) return;
            selectNota.innerHTML = '<option value="">-- Selecione uma Nota Fiscal --</option>';

            if (notas.length === 0) {
                alert('Nenhuma nota fiscal encontrada no MySQL para o período.');
                return;
            }

            console.log(`${notas.length} notas carregadas do banco!`);
            notas.forEach(nota => {
                const option = document.createElement('option');
                option.value = nota.id;
                option.textContent = nota.label;
                selectNota.appendChild(option);
            });
        })
        .catch(err => alert("Erro ao filtrar notas no banco local: " + err));
};
// ⚡ EVENTO: Dispara toda vez que o pião troca de nota no Dropdown do Painel
document.getElementById('selectNotaGerencial').addEventListener('change', function() {
    const entradaId = this.value;
    const containerDetalhes = document.getElementById('detalhesNotaGerencial');

    // Valida se o ID está vazio ou se não é um número válido (Evita disparar texto 'itens')
    if (!entradaId || isNaN(entradaId)) {
        if (containerDetalhes) containerDetalhes.style.display = 'none';
        return;
    }

    // Continua com o fetch normal...
    console.log(`Buscando produtos agrupados para o Lote ID: ${entradaId} no MySQL...`);


    // Faz o fetch para a API Java buscar os produtos e o status da nota
    // 🟩 CORRIGIDO: Trocado as aspas por CRASEs (o acento grave do teclado ` `)
    fetch(`/api/entradas/${entradaId}/itens`, {
        method: 'GET',
        headers: montarHeaders()
    })
        .then(res => {
            if (!res.ok) throw new Error("Erro ao buscar dados do lote no servidor Java.");
            return res.json();
        })
        .then(data => {
            // Preenche o cabeçalho de auditoria do lote
            document.getElementById('txtFornecedorNota').textContent = data.fornecedor;
            document.getElementById('txtTotalNotaBanco').textContent = data.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

            // Limpa e redesenha a tabela de produtos
            const tbody = document.getElementById('tbodyItensNota');
            tbody.innerHTML = '';

            data.itens.forEach(item => {

                const tr = document.createElement('tr');

                tr.innerHTML = `
		        <td style="padding: 10px; border-bottom: 1px solid #25422e; color: #fff;">
		            ${item.produtoDescricao}
		        </td>

		        <td style="padding: 10px; border-bottom: 1px solid #25422e; text-align: center; color: #fff;">
		            ${item.quantidade}
		        </td>

		        <td style="padding: 10px; border-bottom: 1px solid #25422e; color: #fff;">
		            R$ ${item.precoCusto.toFixed(2)}
		        </td>

		        <td style="padding: 10px; border-bottom: 1px solid #25422e; color: #fff;">
		            R$ ${item.total.toFixed(2)}
		        </td>
		    `;

                tbody.appendChild(tr);

            });
            // Injeta os botões de ação na base do painel (Igualzinho à tela de vendas!)
            const containerAcao = document.getElementById('containerAcaoNota');
            if (data.status === 1) { // Nota Ativa no banco
                containerAcao.innerHTML = `
                <div style="display: flex; gap: 10px;">
                    <button type="button" onclick="estornarNotaViaPainel(${entradaId})" style="background: #a855f7; color: white; border: none; padding: 10px 15px; border-radius: 4px; font-weight: bold; cursor: pointer;">
                        ↩️ Devolver Lote (Estornar)
                    </button>
                    <button type="button" onclick="imprimirDanfeDoLote(${entradaId})" style="background: #22c55e; color: white; border: none; padding: 10px 15px; border-radius: 4px; font-weight: bold; cursor: pointer;">
                        🖨️ Imprimir DANFE (PDF)
                    </button>
                </div>
            `;
            } else { // Nota Devolvida (Status 2)
                containerAcao.innerHTML = `
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span style="color: #ff4a4a; font-weight: bold; font-size: 14px;">🟥 ESTE LOTE JÁ FOI DEVOLVIDO</span>
                    <button type="button" onclick="imprimirDanfeDoLote(${entradaId})" style="background: #22c55e; color: white; border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px;">
                        🖨️ Imprimir Cópia PDF
                    </button>
                </div>
            `;
            }

            // Mostra o quadro com tudo renderizado na tela
            containerDetalhes.style.display = 'block';
        })
        .catch(err => alert("Erro ao carregar detalhes do lote: " + err));
});

// Função que chama o seu utils.js compartilhado para emitir o documento
function imprimirDanfeDoLote(id) {
    if (typeof window.baixarPdf === 'function') {
        window.baixarPdf(`/api/entradas/${id}/pdf`, `DANFE_NOTA_${id}`);
    } else {
        alert("Erro: Função 'baixarPdf' do arquivo utils.js não foi localizada na memória.");
    }
}

function toggleMenuNota() {
    const menu = document.getElementById("menuFlutuanteNota");
    if (menu.style.display === "block") {
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }
}

// ==========================================================
// 🚚 MODALIDADE DO FRETE - ENTRADA
// ==========================================================

function alterarModalidadeFrete() {

    const tipoFrete =
        document.getElementById("tipoFrete");

    const blocoTransportadora =
        document.getElementById("blocoTransportadora");

    const transportadora =
        document.getElementById("transportadoraId");

    const valorFrete =
        document.getElementById("valorFrete");


    if (!tipoFrete ||
        !blocoTransportadora ||
        !transportadora ||
        !valorFrete) {

        return;
    }


    // ======================================================
    // FOB
    // Comprador assume o frete
    // Mostra a transportadora
    // ======================================================

    if (tipoFrete.value === "FOB") {

        blocoTransportadora.style.display = "block";

        return;
    }


    // ======================================================
    // CIF
    // Fornecedor assume o frete
    // Não precisamos selecionar transportadora
    // Valor do frete permanece disponível
    // ======================================================

    if (tipoFrete.value === "CIF") {

        blocoTransportadora.style.display = "none";

        transportadora.value = "";

        return;
    }


    // ======================================================
    // SEM FRETE
    // Sem transportadora
    // Valor do frete obrigatoriamente zero
    // ======================================================

    if (tipoFrete.value === "SEM_FRETE") {

        blocoTransportadora.style.display = "none";

        transportadora.value = "";

        valorFrete.value = "0.00";

        calcularTotalNota();

        return;
    }


    // ======================================================
    // Nenhuma modalidade selecionada
    // ======================================================

    blocoTransportadora.style.display = "none";

    transportadora.value = "";
}


// ==========================================================
// 🔌 LIGA O SELECT AO COMPORTAMENTO DO FRETE
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    const tipoFrete =
        document.getElementById("tipoFrete");

    if (tipoFrete) {

        tipoFrete.addEventListener(
            "change",
            alterarModalidadeFrete
        );

    }

});







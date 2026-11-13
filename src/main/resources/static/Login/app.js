// ================================
// BASE URL (LOCAL + NUVEM)
// ================================
const BASE_URL = window.location.origin;

// ================================
// CONTROLE DE PERMISSÃO
// ================================
const tipoUsuario = parseInt(sessionStorage.getItem("tipo") || "9");

function podeEditar(){
    return tipoUsuario === 0 || tipoUsuario === 1;
}

function podeExcluir(){
    return tipoUsuario === 0;
}

function podeMover(){
    return true;
}

function podeIncluir(){
    return tipoUsuario <= 1;
}

// ================================
// ESCONDER BOTÕES AO CARREGAR
// ================================
window.onload = function(){

    if(!podeIncluir()){
        const btn = document.getElementById("btnIncluir");
        if(btn) btn.style.display="none";
    }

    if(!podeEditar()){
        const btn = document.getElementById("btnAlterar");
        if(btn) btn.style.display="none";
    }

    if(!podeExcluir()){
        const btn = document.getElementById("btnExcluir");
        if(btn) btn.style.display="none";
    }

};

// ================================
// VARIÁVEL GLOBAL
// ================================
let pessoaSelecionada = null;

// ================================
// INCLUIR
// ================================
function incluirPessoa(){

    if(!podeIncluir()){
        alert("Usuário sem permissão para incluir");
        return;
    }

    alert("Abrir tela incluir");

    // exemplo futuro:
    // fetch(BASE_URL + "/pessoa")
}

// ================================
// ALTERAR
// ================================
function alterarPessoa(){

    if(!podeEditar()){
        alert("Usuário sem permissão para alterar");
        return;
    }

    if(!pessoaSelecionada){
        alert("Selecione uma pessoa");
        return;
    }

    alert("Alterar pessoa");
}

// ================================
// EXCLUIR
// ================================
function excluirPessoa(){

    if(!podeExcluir()){
        alert("Usuário sem permissão para excluir");
        return;
    }

    if(!pessoaSelecionada){
        alert("Selecione uma pessoa");
        return;
    }

    if(pessoaSelecionada.id === 1 && tipoUsuario !== 0){
        alert("Somente administrador pode excluir raiz");
        return;
    }

    alert("Excluir pessoa");
}

// ================================
// MOVER
// ================================
function moverPessoa(){

    if(!podeMover()){
        alert("Usuário sem permissão para mover");
        return;
    }

    if(!pessoaSelecionada){
        alert("Selecione uma pessoa");
        return;
    }

    alert("Mover pessoa");
}
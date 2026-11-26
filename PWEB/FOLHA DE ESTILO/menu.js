
const API_URL = "http://localhost:3000";

// ========================================
// DADOS DO USUÁRIO
// ========================================

const usuarioCPF = localStorage.getItem("usuario_cpf");
const usuarioNome = localStorage.getItem("usuario_nome");
const usuarioEmail = localStorage.getItem("usuario_email");
const usuarioPerfil = localStorage.getItem("usuario_perfil");

let pontos = [];
let materiais = [];
let recompensas = [];
let entregas = [];
let resgates = [];
let carrinhoEntrega = [];

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function elemento(id) {
    return document.getElementById(id);
}

function valor(id) {
    return elemento(id)?.value?.trim() || "";
}

function mensagem(texto) {
    alert(texto);
}

function usuarioEhAdmin() {
    return ["ADM", "ADMIN", "ADMINISTRADOR"].includes(
        String(usuarioPerfil || "").toUpperCase()
    );
}

function dataAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function formatarData(data) {
    if (!data) return "-";

    const texto = String(data);

    if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
        const [ano, mes, dia] = texto.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    const dataFormatada = new Date(data);

    if (Number.isNaN(dataFormatada.getTime())) {
        return texto;
    }

    return dataFormatada.toLocaleDateString("pt-BR");
}

function formatarNumero(numero) {
    return Number(numero || 0).toLocaleString("pt-BR", {
        maximumFractionDigits: 2
    });
}

function parametroAdmin() {
    return usuarioCPF
        ? `?adminCpf=${encodeURIComponent(usuarioCPF)}`
        : "";
}

// ========================================
// COMUNICAÇÃO COM A API
// ========================================

async function requisicaoAPI(endpoint, opcoes = {}) {
    const configuracao = {
        ...opcoes,
        headers: {
            "Content-Type": "application/json",
            ...(opcoes.headers || {})
        }
    };

    const resposta = await fetch(
        `${API_URL}${endpoint}`,
        configuracao
    );

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
        throw new Error(
            dados.mensagem ||
            dados.erro ||
            `Erro na requisição: ${resposta.status}`
        );
    }

    return dados;
}

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener("DOMContentLoaded", async () => {

    if (!usuarioCPF) {
        window.location.href = "login.html";
        return;
    }

    if (elemento("userEmail")) {
        elemento("userEmail").textContent =
            usuarioEmail || usuarioNome || "";
    }

    configurarData();

    configurarMenuAdmin();

    await carregarTudo();
});

function configurarData() {
    const campoData = elemento("entData");

    if (!campoData) return;

    campoData.type = "date";
    campoData.removeAttribute("readonly");

    if (!campoData.value) {
        campoData.value = dataAtual();
    }
}

function configurarMenuAdmin() {
    const botaoGestao = elemento("btnGestaoAdm");
    const botaoPainel = elemento("btnPainelAdm");

    if (!usuarioEhAdmin()) {
        if (botaoGestao) {
            botaoGestao.style.display = "none";
        }

        if (botaoPainel) {
            botaoPainel.style.display = "none";
        }
    }
}

// ========================================
// CARREGAR DADOS
// ========================================

async function carregarTudo() {
    await Promise.all([
        carregarPontos(),
        carregarMateriais(),
        carregarRecompensas()
    ]);

    atualizarInterface();

    await atualizarResumo();
    await carregarHistorico();
}

async function carregarPontos() {
    try {
        const dados = await requisicaoAPI(
            `/pontos-coleta${parametroAdmin()}`
        );

        pontos = Array.isArray(dados)
            ? dados
            : dados.pontos || [];

        preencherPontos();

    } catch (erro) {
        console.error("Erro ao carregar pontos:", erro);
        pontos = [];
        preencherPontos();
    }
}

async function carregarMateriais() {
    try {
        const dados = await requisicaoAPI("/materiais");

        materiais = Array.isArray(dados)
            ? dados
            : dados.materiais || [];

        preencherMateriais();

    } catch (erro) {
        console.error("Erro ao carregar materiais:", erro);
        materiais = [];
        preencherMateriais();
    }
}

async function carregarRecompensas() {
    try {
        const dados = await requisicaoAPI("/recompensas");

        recompensas = Array.isArray(dados)
            ? dados
            : dados.recompensas || [];

        preencherRecompensas();

    } catch (erro) {
        console.error("Erro ao carregar recompensas:", erro);
        recompensas = [];
        preencherRecompensas();
    }
}

// ========================================
// PREENCHER SELETORES E TABELAS
// ========================================

function preencherPontos() {
    const select = elemento("entPonto");

    if (!select) return;

    select.innerHTML =
        '<option value="">Selecione um ponto</option>';

    pontos.forEach(ponto => {
        const id =
            ponto.id ??
            ponto.id_ponto ??
            ponto.cod_ponto;

        const nome =
            ponto.nome ??
            ponto.nome_ponto ??
            "Ponto de coleta";

        if (id === undefined || id === null) return;

        const opcao = document.createElement("option");

        opcao.value = id;
        opcao.textContent = nome;

        select.appendChild(opcao);
    });
}

function preencherMateriais() {
    const select = elemento("entMaterial");

    if (select) {
        select.innerHTML =
            '<option value="">Selecione um material</option>';

        materiais.forEach(material => {
            const codigo = material.cod_m;
            const nome = material.tipo;

            if (!codigo || !nome) return;

            const opcao = document.createElement("option");

            opcao.value = codigo;
            opcao.textContent = nome;

            select.appendChild(opcao);
        });
    }

    const tabela = elemento("tabelaMateriaisResumo");

    if (tabela) {
        tabela.innerHTML = materiais.map(material => `
            <tr>
                <td>${material.cod_m ?? "-"}</td>
                <td>${material.tipo ?? "-"}</td>
                <td>
                    ${formatarNumero(material.ponto_kg)} pts/kg
                </td>
            </tr>
        `).join("");
    }
}

function preencherRecompensas() {
    const select = elemento("selectRecompensa");

    if (!select) return;

    select.innerHTML =
        '<option value="">Selecione uma recompensa</option>';

    recompensas.forEach(recompensa => {
        const codigo = recompensa.cod_recomp;
        const nome = recompensa.catalogo;
        const custo = recompensa.registro_pontos;

        if (!codigo) return;

        const opcao = document.createElement("option");

        opcao.value = codigo;
        opcao.textContent =
            `${nome} - ${formatarNumero(custo)} pontos`;

        select.appendChild(opcao);
    });
}

// ========================================
// ATUALIZAR INTERFACE
// ========================================

function atualizarInterface() {
    preencherPontos();
    preencherMateriais();
    preencherRecompensas();
    atualizarCarrinho();
}

// ========================================
// NAVEGAÇÃO ENTRE ABAS
// ========================================

function mostrarAba(nomeAba, botao) {
    document.querySelectorAll(".aba").forEach(aba => {
        aba.classList.remove("ativa");
        aba.style.display = "none";
    });

    const abaSelecionada = elemento(nomeAba);

    if (abaSelecionada) {
        abaSelecionada.classList.add("ativa");
        abaSelecionada.style.display = "block";
    }

    document.querySelectorAll(".nav-btn").forEach(item => {
        item.classList.remove("ativo");
    });

    if (botao) {
        botao.classList.add("ativo");
    }

    if (nomeAba === "extrato") {
        carregarHistorico();
    }
}

// ========================================
// RESUMO DO MORADOR
// ========================================

async function atualizarResumo() {
    try {
        const dados = await requisicaoAPI(
            `/moradores/${encodeURIComponent(usuarioCPF)}/resumo`
        );

        if (elemento("saldoAtual")) {
            elemento("saldoAtual").textContent =
                `${formatarNumero(dados.pontos ?? dados.saldo ?? 0)} pts`;
        }

        if (elemento("totalKg")) {
            elemento("totalKg").textContent =
                `${formatarNumero(dados.total_kg ?? dados.totalKg ?? 0)} kg`;
        }

        if (elemento("totalEntregasCount")) {
            elemento("totalEntregasCount").textContent =
                dados.total_entregas ?? dados.totalEntregas ?? 0;
        }

    } catch (erro) {
        console.error("Erro ao carregar resumo:", erro);
    }
}

// ========================================
// CARRINHO DE ENTREGA
// ========================================

function adicionarItemCarrinho() {
    const codigoMaterial = valor("entMaterial");
    const peso = Number(valor("entPeso"));

    if (!codigoMaterial || !Number.isFinite(peso) || peso <= 0) {
        mensagem("Selecione um material e informe um peso válido.");
        return;
    }

    const material = materiais.find(item =>
        String(item.cod_m) === String(codigoMaterial)
    );

    if (!material) {
        mensagem("Material não encontrado.");
        return;
    }

    carrinhoEntrega.push({
        cod_m: codigoMaterial,
        nome: material.tipo,
        kg: peso,
        ponto_kg: Number(material.ponto_kg || 0)
    });

    elemento("entMaterial").value = "";
    elemento("entPeso").value = "";

    atualizarCarrinho();
}

function removerItemCarrinho(indice) {
    carrinhoEntrega.splice(indice, 1);
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const tabela = elemento("tabelaCarrinhoEntrega");

    if (!tabela) return;

    tabela.innerHTML = carrinhoEntrega.map((item, indice) => `
        <tr>
            <td>${item.nome}</td>
            <td>${formatarNumero(item.kg)} kg</td>
            <td>
                ${formatarNumero(item.kg * item.ponto_kg)} pts
            </td>
            <td>
                <button
                    type="button"
                    onclick="removerItemCarrinho(${indice})">
                    Remover
                </button>
            </td>
        </tr>
    `).join("");

    const box = elemento("boxItensEntrega");

    if (box) {
        box.style.display =
            carrinhoEntrega.length > 0 ? "block" : "none";
    }

    const total = carrinhoEntrega.reduce(
        (soma, item) =>
            soma + item.kg * item.ponto_kg,
        0
    );

    if (elemento("previaPontosEntrega")) {
        elemento("previaPontosEntrega").textContent =
            formatarNumero(total);
    }
}

// ========================================
// REGISTRAR ENTREGA
// ========================================

async function salvarEntrega(event) {
    if (event) event.preventDefault();

    const idPonto = valor("entPonto");
    const data = valor("entData");

    if (!idPonto) {
        mensagem("Selecione um ponto de coleta.");
        return;
    }

    if (!data) {
        mensagem("Informe a data da entrega.");
        return;
    }

    if (carrinhoEntrega.length === 0) {
        mensagem("Adicione pelo menos um material.");
        return;
    }

    const dados = {
        cpf: usuarioCPF,
        id: idPonto,
        data: data,
        itens: carrinhoEntrega.map(item => ({
            cod_m: item.cod_m,
            kg: item.kg
        }))
    };

    try {
        await requisicaoAPI("/entregas", {
            method: "POST",
            body: JSON.stringify(dados)
        });

        mensagem("Entrega registrada com sucesso!");

        carrinhoEntrega = [];

        elemento("entPonto").value = "";
        elemento("entData").value = dataAtual();

        atualizarCarrinho();

        await atualizarResumo();
        await carregarHistorico();

    } catch (erro) {
        console.error("Erro ao registrar entrega:", erro);
        mensagem(erro.message);
    }
}

// ========================================
// RESGATAR RECOMPENSA
// ========================================

async function realizarResgate(event) {
    if (event) event.preventDefault();

    const codigo = valor("selectRecompensa");

    if (!codigo) {
        mensagem("Selecione uma recompensa.");
        return;
    }

    const recompensa = recompensas.find(item =>
        String(item.cod_recomp) === String(codigo)
    );

    if (!recompensa) {
        mensagem("Recompensa não encontrada.");
        return;
    }

    const confirmar = confirm(
        `Deseja resgatar "${recompensa.catalogo}"?`
    );

    if (!confirmar) return;

    try {
        await requisicaoAPI("/resgates", {
            method: "POST",
            body: JSON.stringify({
                cpf: usuarioCPF,
                cod_recomp: codigo
            })
        });

        mensagem("Resgate realizado com sucesso!");

        elemento("selectRecompensa").value = "";

        await atualizarResumo();
        await carregarHistorico();

    } catch (erro) {
        console.error("Erro ao realizar resgate:", erro);
        mensagem(erro.message);
    }
}

// ========================================
// HISTÓRICO E EXTRATO
// ========================================

async function carregarHistorico() {
    try {
        const [dadosEntregas, dadosResgates] = await Promise.all([
            requisicaoAPI(
                `/moradores/${encodeURIComponent(usuarioCPF)}/entregas`
            ),
            requisicaoAPI(
                `/moradores/${encodeURIComponent(usuarioCPF)}/resgates`
            )
        ]);

        entregas = Array.isArray(dadosEntregas)
            ? dadosEntregas
            : dadosEntregas.entregas || [];

        resgates = Array.isArray(dadosResgates)
            ? dadosResgates
            : dadosResgates.resgates || [];

        preencherHistorico();

    } catch (erro) {
        console.error("Erro ao carregar histórico:", erro);
    }
}

function preencherHistorico() {
    const tabelaEntregas = elemento("tabelaEntregas");
    const tabelaResgates = elemento("tabelaResgates");
    const tabelaExtrato = elemento("tabelaExtrato");

    if (tabelaEntregas) {
        tabelaEntregas.innerHTML = entregas.map(item => `
            <tr>
                <td>${item.cod_entrega ?? item.codigo ?? "-"}</td>
                <td>${formatarData(item.data ?? item.data_entrega)}</td>
                <td>${item.nome_ponto ?? item.ponto ?? "-"}</td>
                <td>${item.itens ?? item.materiais ?? "-"}</td>
                <td>
                    ${formatarNumero(item.pontos ?? item.total_pontos)}
                </td>
            </tr>
        `).join("");
    }

    if (tabelaResgates) {
        tabelaResgates.innerHTML = resgates.map(item => `
            <tr>
                <td>${item.cod_resgate ?? item.codigo ?? "-"}</td>
                <td>${formatarData(item.data ?? item.data_resgate)}</td>
                <td>${item.catalogo ?? item.nome_recompensa ?? "-"}</td>
                <td>
                    ${formatarNumero(item.registro_pontos ?? item.pontos)}
                </td>
            </tr>
        `).join("");
    }

    if (tabelaExtrato) {
        const movimentacoes = [
            ...entregas.map(item => ({
                data: item.data ?? item.data_entrega,
                tipo: "Crédito",
                descricao: "Entrega de materiais",
                pontos: Number(item.pontos ?? item.total_pontos ?? 0)
            })),

            ...resgates.map(item => ({
                data: item.data ?? item.data_resgate,
                tipo: "Resgate",
                descricao: item.catalogo ?? item.nome_recompensa ?? "Resgate",
                pontos: Number(item.registro_pontos ?? item.pontos ?? 0)
            }))
        ];

        movimentacoes.sort((a, b) =>
            new Date(b.data) - new Date(a.data)
        );

        tabelaExtrato.innerHTML = movimentacoes.map(item => `
            <tr>
                <td>${formatarData(item.data)}</td>
                <td>${item.tipo}</td>
                <td>${item.descricao}</td>
                <td>
                    ${item.tipo === "Resgate" ? "-" : "+"}
                    ${formatarNumero(item.pontos)}
                </td>
            </tr>
        `).join("");
    }
}

// ========================================
// PERMISSÃO ADMINISTRATIVA
// ========================================

function verificarPermissaoAdmin() {
    if (!usuarioEhAdmin()) {
        mensagem("Apenas administradores podem realizar esta ação.");
        return false;
    }

    return true;
}

// ========================================
// CADASTRAR PONTO DE COLETA
// ========================================

async function cadastrarPonto(event) {
    if (event) event.preventDefault();

    if (!verificarPermissaoAdmin()) return;

    const nome = valor("novoPontoNome");
    const end = valor("novoPontoEnd");
    const tel = valor("novoPontoTel");

    if (!nome || !end) {
        mensagem("Preencha o nome e o endereço.");
        return;
    }

    try {
        await requisicaoAPI("/pontos-coleta", {
            method: "POST",
            body: JSON.stringify({
                nome,
                end,
                tel,
                adminCpf: usuarioCPF
            })
        });

        mensagem("Ponto de coleta cadastrado!");

        elemento("novoPontoNome").value = "";
        elemento("novoPontoEnd").value = "";
        elemento("novoPontoTel").value = "";

        await carregarPontos();

    } catch (erro) {
        console.error("Erro ao cadastrar ponto:", erro);
        mensagem(erro.message);
    }
}

// ========================================
// CADASTRAR MATERIAL
// ========================================

async function cadastrarMaterial(event) {
    if (event) event.preventDefault();

    if (!verificarPermissaoAdmin()) return;

    const cod_m = valor("novoMatCod");
    const tipo = valor("novoMatTipo");
    const ponto_kg = Number(valor("novoMatPontos"));

    if (!cod_m || !tipo || !Number.isFinite(ponto_kg) || ponto_kg <= 0) {
        mensagem("Preencha os dados do material corretamente.");
        return;
    }

    try {
        await requisicaoAPI("/materiais", {
            method: "POST",
            body: JSON.stringify({
                cod_m,
                tipo,
                ponto_kg,
                adminCpf: usuarioCPF
            })
        });

        mensagem("Material cadastrado com sucesso!");

        elemento("novoMatCod").value = "";
        elemento("novoMatTipo").value = "";
        elemento("novoMatPontos").value = "";

        await carregarMateriais();

    } catch (erro) {
        console.error("Erro ao cadastrar material:", erro);
        mensagem(erro.message);
    }
}

// ========================================
// CADASTRAR RECOMPENSA
// ========================================

async function cadastrarRecompensa(event) {
    if (event) event.preventDefault();

    if (!verificarPermissaoAdmin()) return;

    const catalogo = valor("novaRecNome");
    const registro_pontos = Number(valor("novaRecPontos"));

    if (
        !catalogo ||
        !Number.isFinite(registro_pontos) ||
        registro_pontos <= 0
    ) {
        mensagem("Preencha os dados da recompensa corretamente.");
        return;
    }

    const cod_recomp =
        `R${Date.now().toString().slice(-8)}`;

    try {
        await requisicaoAPI("/recompensas", {
            method: "POST",
            body: JSON.stringify({
                cod_recomp,
                catalogo,
                registro_pontos,
                adminCpf: usuarioCPF
            })
        });

        mensagem("Recompensa cadastrada com sucesso!");

        elemento("novaRecNome").value = "";
        elemento("novaRecPontos").value = "";

        await carregarRecompensas();

    } catch (erro) {
        console.error("Erro ao cadastrar recompensa:", erro);
        mensagem(erro.message);
    }
}

// ========================================
// SAIR DO SISTEMA
// ========================================

function sair() {
    const confirmar = confirm("Deseja realmente sair?");

    if (!confirmar) return;

    localStorage.removeItem("usuario_cpf");
    localStorage.removeItem("usuario_nome");
    localStorage.removeItem("usuario_email");
    localStorage.removeItem("usuario_perfil");

    window.location.href = "login.html";
}

const form = document.getElementById("form-gasto");
const listaGastos = document.getElementById("lista-gastos");
const saldoElemento = document.getElementById("saldo");
const receitasElemento = document.getElementById("receitas");
const despesasElemento = document.getElementById("despesas");

let gastos = JSON.parse(localStorage.getItem("gastos")) || [];

atualizarTela();

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const gasto = {
        data: document.getElementById("data").value,
        descricao: document.getElementById("descricao").value,
        categoria: document.getElementById("categoria").value,
        tipo: document.getElementById("tipo").value,
        valor: Number(document.getElementById("valor").value)
    };

    gastos.push(gasto);

    salvarDados();

    form.reset();
    atualizarTela();
});

function salvarDados() {
    localStorage.setItem("gastos", JSON.stringify(gastos));
}

function atualizarTela() {
    listaGastos.innerHTML = "";

    let saldo = 0;
    let receitas = 0;
    let despesas = 0;

    gastos.forEach((gasto, indice) => {

        const linha = document.createElement("tr");

       if (gasto.tipo === "receita") {
           receitas += gasto.valor;
           saldo += gasto.valor;
       } else {
           despesas += gasto.valor;
           saldo -= gasto.valor;
       }

        linha.innerHTML = `
            <td>${gasto.data}</td>
            <td>${gasto.descricao}</td>
            <td>${gasto.categoria}</td>
            <td>${gasto.tipo}</td>
            <td>R$ ${gasto.valor.toFixed(2)}</td>
            <td>
                <button onclick="removerGasto(${indice})">
                    Excluir
                </button>
            </td>
        `;

        listaGastos.appendChild(linha);
    });

receitasElemento.textContent =
    receitas.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

despesasElemento.textContent =
    despesas.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

saldoElemento.textContent =
    saldo.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });}

function removerGasto(indice) {
    gastos.splice(indice, 1);

    salvarDados();
    atualizarTela();
}
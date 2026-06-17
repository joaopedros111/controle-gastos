const exportarBackup = document.getElementById("exportar-backup");
const importarBackup = document.getElementById("importar-backup");
const botaoImportar = document.getElementById("botao-importar");
const form = document.getElementById("form-gasto");
const listaGastos = document.getElementById("lista-gastos");
const botaoSubmit = document.getElementById("botao-submit");
const cancelarEdicao = document.getElementById("cancelar-edicao");

let indiceEditando = null;
let gastos = JSON.parse(localStorage.getItem("gastos")) || [];

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const gasto = {
    data: document.getElementById("data").value,
    descricao: document.getElementById("descricao").value,
    categoria: document.getElementById("categoria").value,
    tipo: document.getElementById("tipo").value,
    valor: Number(document.getElementById("valor").value)
  };

  if (indiceEditando === null) {
    gastos.push(gasto);
  } else {
    gastos[indiceEditando] = gasto;
    indiceEditando = null;
    botaoSubmit.textContent = "Adicionar";
    cancelarEdicao.style.display = "none";
  }

  salvarGastos();
  renderizarGastos();
  form.reset();
});

function salvarGastos() {
  localStorage.setItem("gastos", JSON.stringify(gastos));
}

function renderizarGastos() {
  listaGastos.innerHTML = "";

const gastosFiltrados = [...gastos].sort((a, b) => {
  return new Date(b.data) - new Date(a.data);
});

gastosFiltrados.forEach(gasto => {
  const data = new Date(gasto.data + "T00:00:00");

const dia = data.getDate().toString().padStart(2, "0");

const mes = data.toLocaleDateString("pt-BR", {
  month: "short"
}).replace(".", "");

const ano = data.getFullYear();

const dataFormatada = `${dia} ${mes} ${ano}`;

  const indexReal = gastos.indexOf(gasto);
  const linha = document.createElement("tr");

linha.innerHTML = `
<td>${dataFormatada}</td>
<td>${gasto.descricao}</td>
<td>${gasto.categoria}</td>

      <td class="${gasto.tipo === "receita" ? "receita-texto" : "despesa-texto"}">
        ${gasto.tipo}
      </td>
      <td class="${gasto.tipo === "receita" ? "receita-texto" : "despesa-texto"}">
        ${gasto.valor.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        })}
      </td>
 <td>
  <button class="btn-editar" onclick="editarGasto(${indexReal})">
    Editar
  </button>

  <button class="btn-excluir" onclick="excluirGasto(${indexReal})">
    Excluir
  </button>
</td>
    `;

    listaGastos.appendChild(linha);
  });

  atualizarResumo(gastosFiltrados);
  atualizarCategorias(gastosFiltrados);
}

function atualizarResumo(lista) {
  let totalReceitas = 0;
  let totalDespesas = 0;

  lista.forEach(gasto => {
    if (gasto.tipo === "receita") {
      totalReceitas += Number(gasto.valor);
    } else {
      totalDespesas += Number(gasto.valor);
    }
  });

  const saldo = totalReceitas - totalDespesas;
  const saldoElemento = document.getElementById("saldo");

  saldoElemento.classList.remove("saldo-positivo", "saldo-negativo");

  if (saldo >= 0) {
    saldoElemento.classList.add("saldo-positivo");
  } else {
    saldoElemento.classList.add("saldo-negativo");
  }

  document.getElementById("receitas").textContent =
    totalReceitas.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

  document.getElementById("despesas").textContent =
    totalDespesas.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

  document.getElementById("saldo").textContent =
    saldo.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
}

function atualizarCategorias(lista) {
  const listaCategorias = document.getElementById("lista-categorias");
  listaCategorias.innerHTML = "";

  const despesas = lista.filter(gasto => gasto.tipo === "despesa");
  const totaisPorCategoria = {};

  despesas.forEach(gasto => {
    if (!totaisPorCategoria[gasto.categoria]) {
      totaisPorCategoria[gasto.categoria] = 0;
    }

    totaisPorCategoria[gasto.categoria] += Number(gasto.valor);
  });

  const categoriasOrdenadas = Object.entries(totaisPorCategoria)
    .sort((a, b) => b[1] - a[1]);

  if (categoriasOrdenadas.length === 0) {
    listaCategorias.innerHTML = "<p>Nenhuma despesa registrada.</p>";
    return;
  }

  categoriasOrdenadas.forEach(([categoria, valor]) => {
    const item = document.createElement("div");
    item.classList.add("categoria-item");

    item.innerHTML = `
      <span>${categoria}</span>
      <strong>${valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      })}</strong>
    `;

    listaCategorias.appendChild(item);
  });
}

function excluirGasto(index) {
  gastos.splice(index, 1);
  salvarGastos();
  renderizarGastos();
}

function editarGasto(index) {
  const gasto = gastos[index];

  document.getElementById("data").value = gasto.data;
  document.getElementById("descricao").value = gasto.descricao;
  document.getElementById("categoria").value = gasto.categoria;
  document.getElementById("tipo").value = gasto.tipo;
  document.getElementById("valor").value = gasto.valor;

  indiceEditando = index;
  botaoSubmit.textContent = "Salvar edição";
  cancelarEdicao.style.display = "inline-block";
}

cancelarEdicao.addEventListener("click", function () {
  indiceEditando = null;
  form.reset();
  botaoSubmit.textContent = "Adicionar";
  cancelarEdicao.style.display = "none";
});

exportarBackup.addEventListener("click", function () {
  const dados = JSON.stringify(gastos, null, 2);
  const blob = new Blob([dados], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "backup-controle-gastos.json";
  link.click();

  URL.revokeObjectURL(url);
});

botaoImportar.addEventListener("click", function () {
  importarBackup.click();
});

importarBackup.addEventListener("change", function (event) {
  const arquivo = event.target.files[0];

  if (!arquivo) {
    return;
  }

  const leitor = new FileReader();

  leitor.onload = function (e) {
    try {
      const dadosImportados = JSON.parse(e.target.result);

      if (!Array.isArray(dadosImportados)) {
        alert("Arquivo de backup inválido.");
        return;
      }

      gastos = dadosImportados;
      salvarGastos();
      renderizarGastos();

      alert("Backup importado com sucesso!");
    } catch (erro) {
      alert("Erro ao importar backup.");
    }
  };

  leitor.readAsText(arquivo);
});

renderizarGastos();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js");
}
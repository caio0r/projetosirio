let produtos = JSON.parse(localStorage.getItem("produtos")) || {};
let movimentacoes = JSON.parse(localStorage.getItem("movimentacoes")) || [];

// Função para salvar dados no localStorage
function salvarDados() {
  localStorage.setItem("produtos", JSON.stringify(produtos));
  localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes));
}

// Função para exibir mensagens de feedback
function exibirMensagem(elemento, mensagem, tipo) {
  elemento.innerHTML = mensagem;
  elemento.className = `mensagem ${tipo}`;
  setTimeout(() => (elemento.innerHTML = ""), 3000);
}

function exportarProdutosCSV() {
  let csvContent = "data:text/csv;charset=utf-8,";
  // Cabeçalho do CSV
  csvContent += "Nome,Categoria,Marca,Número de Série,Quantidade\n";

  // Adicionar cada produto ao CSV
  for (let chave in produtos) {
    let { categoria, marca, serie, quantidade } = produtos[chave];
    csvContent += `${
      chave.split("-")[0]
    },${categoria},${marca},${serie},${quantidade}\n`;
  }

  // Criar um link para download do arquivo CSV
  let encodedUri = encodeURI(csvContent);
  let link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "produtos.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link); // Remover o link após o download
}

// Adicionar produto
document
  .getElementById("produto-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    let nome = document.getElementById("nome").value.trim();
    let categoria = document.getElementById("categoria").value.trim();
    let marca = document.getElementById("marca").value.trim();
    let serie = document.getElementById("serie").value.trim();
    let quantidade = parseInt(document.getElementById("quantidade").value);

    if (
      !nome ||
      !categoria ||
      !marca ||
      !serie ||
      isNaN(quantidade) ||
      quantidade < 0
    ) {
      exibirMensagem(
        document.getElementById("mensagem-produto"),
        "Preencha todos os campos corretamente.",
        "erro"
      );
      return;
    }

    let chave = `${nome}-${serie}`;
    if (produtos[chave]) {
      exibirMensagem(
        document.getElementById("mensagem-produto"),
        "Produto com este número de série já existe!",
        "erro"
      );
    } else {
      produtos[chave] = { categoria, marca, serie, quantidade };
      salvarDados();
      atualizarTabelaProdutos();
      document.getElementById("produto-form").reset();
      exibirMensagem(
        document.getElementById("mensagem-produto"),
        "Produto adicionado com sucesso!",
        "sucesso"
      );
    }
  });

// Registrar movimentação
document
  .getElementById("movimentacao-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    let usuario = document.getElementById("usuario").value.trim();
    let produto = document.getElementById("produto").value.trim();
    let serie = document.getElementById("serie-mov").value.trim();
    let quantidade = parseInt(document.getElementById("quantidade-mov").value);
    let tipo = document.getElementById("tipo-mov").value;

    if (!usuario || !produto || !serie || isNaN(quantidade) || quantidade < 1) {
      exibirMensagem(
        document.getElementById("mensagem-movimentacao"),
        "Preencha todos os campos corretamente.",
        "erro"
      );
      return;
    }

    let chave = `${produto}-${serie}`;
    if (!produtos[chave]) {
      exibirMensagem(
        document.getElementById("mensagem-movimentacao"),
        "Produto não encontrado!",
        "erro"
      );
      return;
    }

    if (tipo === "saida" && produtos[chave].quantidade < quantidade) {
      exibirMensagem(
        document.getElementById("mensagem-movimentacao"),
        "Quantidade insuficiente em estoque!",
        "erro"
      );
      return;
    }

    if (tipo === "entrada") {
      produtos[chave].quantidade += quantidade;
    } else {
      produtos[chave].quantidade -= quantidade;
    }

    movimentacoes.push({
      usuario,
      produto,
      serie,
      quantidade,
      tipo,
      data: new Date().toLocaleString(),
    });
    salvarDados();
    atualizarTabelaProdutos();
    atualizarTabelaMovimentacoes();
    document.getElementById("movimentacao-form").reset();
    exibirMensagem(
      document.getElementById("mensagem-movimentacao"),
      "Movimentação registrada com sucesso!",
      "sucesso"
    );
  });

// Atualizar tabela de produtos
function atualizarTabelaProdutos() {
  let listaProdutos = document.getElementById("lista-produtos");
  listaProdutos.innerHTML = "";
  for (let chave in produtos) {
    let { categoria, marca, serie, quantidade } = produtos[chave];
    let newRow = listaProdutos.insertRow();
    newRow.innerHTML = `
      <td>${chave.split("-")[0]}</td>
      <td>${categoria}</td>
      <td>${marca}</td>
      <td>${serie}</td>
      <td class="${quantidade <= 5 ? "baixo-estoque" : ""}">${quantidade}</td>
      <td class="acoes">
        <button onclick="editarProduto('${chave}')">Editar</button>
        <button onclick="excluirProduto('${chave}')">Excluir</button>
      </td>
    `;
  }
}

// Editar produto
function editarProduto(chave) {
  let produto = produtos[chave];
  document.getElementById("nome").value = chave.split("-")[0];
  document.getElementById("categoria").value = produto.categoria;
  document.getElementById("marca").value = produto.marca;
  document.getElementById("serie").value = produto.serie;
  document.getElementById("quantidade").value = produto.quantidade;
  delete produtos[chave];
  salvarDados();
  atualizarTabelaProdutos();
}

// Excluir produto
function excluirProduto(chave) {
  if (confirm("Tem certeza que deseja excluir este produto?")) {
    delete produtos[chave];
    salvarDados();
    atualizarTabelaProdutos();
    exibirMensagem(
      document.getElementById("mensagem-produto"),
      "Produto excluído com sucesso!",
      "sucesso"
    );
  }
}

// Atualizar tabela de movimentações
function atualizarTabelaMovimentacoes() {
  let listaMovimentacoes = document.getElementById("lista-movimentacoes");
  listaMovimentacoes.innerHTML = "";
  movimentacoes.forEach((mov) => {
    let newRow = listaMovimentacoes.insertRow();
    newRow.innerHTML = `
      <td>${mov.usuario}</td>
      <td>${mov.produto}</td>
      <td>${mov.serie}</td>
      <td>${mov.quantidade}</td>
      <td>${mov.tipo}</td>
      <td>${mov.data}</td>
    `;
  });
}

// Filtros
function filtrarProdutos() {
  let busca = document.getElementById("busca-produto").value.toLowerCase();
  let linhas = document.querySelectorAll("#lista-produtos tr");
  linhas.forEach((linha) => {
    let nome = linha.cells[0].textContent.toLowerCase();
    linha.style.display = nome.includes(busca) ? "" : "none";
  });
}

function filtrarMovimentacoes() {
  let filtro = document.getElementById("filtro-movimentacao").value;
  let linhas = document.querySelectorAll("#lista-movimentacoes tr");
  linhas.forEach((linha) => {
    let tipo = linha.cells[4].textContent.toLowerCase();
    linha.style.display = filtro === "todos" || tipo === filtro ? "" : "none";
  });
}

// Exportar dados
function exportarDados(formato) {
  if (formato === "csv") {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Nome,Categoria,Marca,Número de Série,Quantidade\n";
    for (let chave in produtos) {
      let { categoria, marca, serie, quantidade } = produtos[chave];
      csvContent += `${
        chave.split("-")[0]
      },${categoria},${marca},${serie},${quantidade}\n`;
    }
    csvContent +=
      "\nUsuário,Produto,Número de Série,Quantidade,Tipo,Data/Hora\n";
    movimentacoes.forEach((mov) => {
      csvContent += `${mov.usuario},${mov.produto},${mov.serie},${mov.quantidade},${mov.tipo},${mov.data}\n`;
    });

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "estoque.csv");
    document.body.appendChild(link);
    link.click();
  } else if (formato === "json") {
    let data = { produtos, movimentacoes };
    let jsonContent = JSON.stringify(data, null, 2);
    let blob = new Blob([jsonContent], { type: "application/json" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "estoque.json";
    link.click();
  }
}
function login() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;

  // Verificação básica (substitua por uma verificação segura no backend)
  if (usuario === "admin" && senha === "admin123") {
    document.getElementById("login").style.display = "none";
    document.getElementById("conteudo").style.display = "block";
  } else {
    alert("Usuário ou senha incorretos!");
  }
}

// Carregar dados ao iniciar
window.onload = () => {
  atualizarTabelaProdutos();
  atualizarTabelaMovimentacoes();
};

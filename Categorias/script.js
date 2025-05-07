const form = document.getElementById('nova-categoria-form');
const lista = document.getElementById('lista-categorias');

function carregarCategorias() {
  const categorias = JSON.parse(localStorage.getItem('categorias')) || [];
  lista.innerHTML = '';

  categorias.forEach((cat, index) => {
    const li = document.createElement('li');
    li.style.borderLeft = `8px solid ${cat.cor}`;

    const span = document.createElement('span');
    span.textContent = `${cat.nome} - ${cat.cor}`;

    const btnExcluir = document.createElement('button');
    btnExcluir.className = 'excluir-btn';
    btnExcluir.textContent = '🗑️';
    btnExcluir.title = 'Excluir categoria';
    btnExcluir.onclick = () => {
      if (confirm(`Deseja excluir a categoria "${cat.nome}"?`)) {
        categorias.splice(index, 1);
        localStorage.setItem('categorias', JSON.stringify(categorias));
        carregarCategorias();
      }
    };

    li.appendChild(span);
    li.appendChild(btnExcluir);
    lista.appendChild(li);
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const nome = document.getElementById('nome-categoria').value.trim();
  const cor = document.getElementById('cor-categoria').value;
  if (!nome) return;

  const categorias = JSON.parse(localStorage.getItem('categorias')) || [];
  if (categorias.some(c => c.nome.toLowerCase() === nome.toLowerCase())) {
    alert("Essa categoria já existe!");
    return;
  }

  categorias.push({ nome, cor });
  localStorage.setItem('categorias', JSON.stringify(categorias));
  form.reset();
  carregarCategorias();
});

carregarCategorias();
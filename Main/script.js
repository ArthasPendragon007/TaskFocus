if (Notification.permission !== 'granted') {
  Notification.requestPermission();
}

const audio = new Audio('alerta.mp3');

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('lembrete-form');
  const lista = document.getElementById('lista-lembretes');
  const filtro = document.getElementById('filtro-lembretes');
  const filtroCategoria = document.getElementById('filtro-categoria');
  const categoriaSelect = document.getElementById('categoria');
  const frase = document.getElementById('frase');

  function carregarCategorias() {
    const categorias = JSON.parse(localStorage.getItem('categorias')) || [];
    categoriaSelect.innerHTML = '';
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.nome;
      option.textContent = cat.nome;
      categoriaSelect.appendChild(option);
    });

    filtroCategoria.innerHTML = '<option value="todas">Todas</option>';
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.nome;
      option.textContent = cat.nome;
      filtroCategoria.appendChild(option);
    });
  }

  function carregarLembretes() {
    let lembretes = JSON.parse(localStorage.getItem('lembretes')) || [];
    const categoriasSalvas = JSON.parse(localStorage.getItem('categorias')) || [];

    const filtroSelecionado = filtro?.value || 'todos';
    const categoriaSelecionada = filtroCategoria?.value || 'todas';
    lista.innerHTML = '';

    const agora = new Date();

    lembretes.sort((a, b) => {
      const dataA = new Date(`${a.data}T${a.hora || '00:00'}`);
      const dataB = new Date(`${b.data}T${b.hora || '00:00'}`);
      return dataA - dataB;
    });

    lembretes.forEach((lembrete, index) => {
      if (filtroSelecionado === 'concluidos' && !lembrete.concluido) return;
      if (filtroSelecionado === 'pendentes' && lembrete.concluido) return;
      if (categoriaSelecionada !== 'todas' && lembrete.categoria !== categoriaSelecionada) return;

      const li = document.createElement('li');
      const dataHoraStr = `${lembrete.data}T${lembrete.hora || '00:00'}`;
      const dataHoraLembrete = new Date(dataHoraStr);

      let tempoRestante = '';
      if (dataHoraLembrete > agora) {
        const diffMs = dataHoraLembrete - agora;
        const diffMin = Math.floor(diffMs / 60000);
        const horas = Math.floor(diffMin / 60);
        const minutos = diffMin % 60;
        if (diffMin >= 0 && diffMin < 60 && !lembrete.concluido) {
          li.classList.add('urgente');
        }
        tempoRestante = ` (Faltam ${horas}h ${minutos}min)`;
      } else {
        tempoRestante = ' (Já passou)';
      }

      const conteudoTexto = document.createElement('span');
      conteudoTexto.textContent = `${lembrete.descricao} - ${lembrete.data} ${lembrete.hora || ''}${tempoRestante}`;
      li.appendChild(conteudoTexto);

      // Aplicar cor da categoria
      const categoriaInfo = categoriasSalvas.find(cat => cat.nome === lembrete.categoria);
      if (categoriaInfo) {
        li.style.borderLeft = `8px solid ${categoriaInfo.cor}`;
      }

      if (lembrete.concluido) li.classList.add('concluido');

      const actions = document.createElement('div');
      actions.classList.add('actions');

      const copiarBtn = document.createElement('button');
      copiarBtn.textContent = '📋';
      copiarBtn.title = 'Copiar';
      copiarBtn.onclick = () => {
        navigator.clipboard.writeText(conteudoTexto.textContent)
          .then(() => alert('Lembrete copiado!'))
          .catch(() => alert('Erro ao copiar lembrete.'));
      };

      const toggleBtn = document.createElement('button');
      toggleBtn.textContent = lembrete.concluido ? '↩️' : '✅';
      toggleBtn.title = lembrete.concluido ? 'Marcar como pendente' : 'Concluir';
      toggleBtn.onclick = () => {
        lembrete.concluido = !lembrete.concluido;
        localStorage.setItem('lembretes', JSON.stringify(lembretes));
        carregarLembretes();
      };

      const apagarBtn = document.createElement('button');
      apagarBtn.textContent = '🗑️';
      apagarBtn.title = 'Remover';
      apagarBtn.onclick = () => {
        lembretes.splice(index, 1);
        localStorage.setItem('lembretes', JSON.stringify(lembretes));
        carregarLembretes();
      };

      actions.appendChild(copiarBtn);
      actions.appendChild(toggleBtn);
      actions.appendChild(apagarBtn);
      li.appendChild(actions);
      lista.appendChild(li);
    });
  }

  function verificarNotificacoes() {
    const agora = new Date();
    const hoje = agora.toISOString().split('T')[0];
    const horaAtual = agora.toTimeString().slice(0, 5);
    const lembretes = JSON.parse(localStorage.getItem('lembretes')) || [];

    lembretes.forEach(lembrete => {
      if (lembrete.data === hoje && lembrete.hora === horaAtual && !lembrete.notificado) {
        enviarNotificacao(`Lembrete: ${lembrete.descricao}`);
        audio.play();
        lembrete.notificado = true;
        localStorage.setItem('lembretes', JSON.stringify(lembretes));
      }
    });
  }

  function enviarNotificacao(texto) {
    if (Notification.permission === 'granted') {
      new Notification('🔔 Lembre.me', { body: texto });
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const descricao = document.getElementById('descricao').value;
    const dataHoraStr = document.getElementById('dataHora').value;
    const [data, hora] = dataHoraStr.split('T');
    const categoria = categoriaSelect?.value || 'padrao';
    const novo = { descricao, data, hora, categoria };
    const lembretes = JSON.parse(localStorage.getItem('lembretes')) || [];
    lembretes.push(novo);
    localStorage.setItem('lembretes', JSON.stringify(lembretes));
    form.reset();
    carregarLembretes();
  });

  if (filtro) filtro.addEventListener('change', carregarLembretes);
  if (filtroCategoria) filtroCategoria.addEventListener('change', carregarLembretes);

  async function carregarFrase() {
    try {
      const res = await fetch("frases.json");
      const data = await res.json();
      const fraseAleatoria = data[Math.floor(Math.random() * data.length)];
      frase.textContent = `"${fraseAleatoria.text}" - ${fraseAleatoria.author}`;
    } catch (err) {
      frase.textContent = 'Não foi possível carregar uma frase.';
    }
  }

  carregarCategorias();
  carregarLembretes();
  carregarFrase();
  verificarNotificacoes();

  setInterval(() => {
    carregarLembretes();
    verificarNotificacoes();
  }, 60000);
});
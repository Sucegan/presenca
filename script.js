const form = document.getElementById('attendanceForm');
const msg = document.getElementById('msg');
const companionToggle = document.getElementById('companionToggle');
const companionNameField = document.getElementById('companionNameField');
const companionInput = document.getElementById('companionInput');
const addCompanion = document.getElementById('addCompanion');
const companionList = document.getElementById('companionList');

let companionNames = [];

// Função de feedback visual
function showMessage(text, isError = false) {
  msg.textContent = text;
  msg.className = isError ? 'error-msg' : 'success-msg';
  msg.classList.remove('hidden');
  
  // Timeout para o scroll garantir que o layout já atualizou
  setTimeout(() => {
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);

  setTimeout(() => msg.classList.add('hidden'), 6000);
}

// Atualiza a lista de acompanhantes na tela
function renderCompanionList() {
  companionList.innerHTML = '';
  companionNames.forEach((name, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>🤠 ${name}</span>
      <button type="button" class="remove-companion" onclick="removeCompanion(${index})" title="Remover">&times;</button>
    `;
    companionList.appendChild(li);
  });
}

// Adicionar acompanhante
function handleAddCompanion() {
  const name = companionInput.value.trim();
  if (!name) { 
    companionInput.focus(); 
    return; 
  }
  if (companionNames.some(c => c.toLowerCase() === name.toLowerCase())) {
    alert('Este parceiro já está na lista!'); 
    return; 
  }
  
  companionNames.push(name);
  companionInput.value = '';
  renderCompanionList();
  companionInput.focus();
}

addCompanion.addEventListener('click', (e) => {
  e.preventDefault(); // Garante que não submeta o form sem querer
  handleAddCompanion();
});

companionInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') { 
    e.preventDefault(); 
    handleAddCompanion(); 
  }
});

// Remove acompanhante (Escopo Global para o onclick do HTML)
window.removeCompanion = function(index) {
  companionNames.splice(index, 1);
  renderCompanionList();
};

// Toggle do campo de acompanhantes
companionToggle.addEventListener('change', (e) => {
  if (e.target.checked) {
    companionNameField.classList.add('show');
    setTimeout(() => companionInput.focus(), 300);
  } else {
    companionNameField.classList.remove('show');
    companionNames = [];
    renderCompanionList();
  }
});

// LOGICA DE ENVIO PARA O BANCO DE DADOS
form.onsubmit = async (e) => {
  e.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');
  const nomeConvidado = document.getElementById('guestName').value.trim();

  if (!nomeConvidado) return;

  // NOVIDADE: Salva o acompanhante automaticamente se o campo não estiver vazio
  const companionValue = companionInput.value.trim();
  if (companionToggle.checked && companionValue) {
    // Verifica se já não foi adicionado antes para não duplicar
    if (!companionNames.includes(companionValue)) {
      companionNames.push(companionValue);
    }
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando para o rancho...';

  try {
    const response = await fetch('/api/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nomeConvidado,
        companionNames: companionNames // Aqui já vai o nome extra se ele digitou
      })
    });

    if (!response.ok) throw new Error('Erro na resposta do servidor');

    showMessage(`Confirmado! Esperamos você, ${nomeConvidado.split(' ')[0]}! 🥩`);
    
    // Limpa tudo
    form.reset();
    companionNames = [];
    renderCompanionList();
    companionNameField.classList.remove('show');
    companionToggle.checked = false;
    companionInput.value = ''; // Limpa o campo de texto extra
    
  } catch (error) {
    showMessage('Erro ao salvar. Verifique sua conexão.', true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirmar Presença';
  }
};
  // Bloqueia o botão para evitar cliques duplos
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando para o rancho...';

  try {
    const response = await fetch('/api/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nomeConvidado,
        companionNames: companionNames
      })
    });

    if (!response.ok) throw new Error();

    // Sucesso!
    showMessage(`Confirmado! Esperamos você, ${nomeConvidado.split(' ')[0]}! 🥩`);
    
    // Reseta tudo
    form.reset();
    companionNames = [];
    renderCompanionList();
    companionNameField.classList.remove('show');
    companionToggle.checked = false;
    
  } catch (error) {
    showMessage('Erro ao salvar. Verifique sua conexão ou tente novamente.', true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirmar Presença';
  }
};

// CONTADOR REGRESSIVO
function startCountdown() {
  const eventDate = new Date('2026-05-16T19:30:00-03:00').getTime();
  const format = (num) => String(num).padStart(2, '0');

  const update = () => {
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance < 0) {
      const countdownEl = document.querySelector('.countdown');
      if(countdownEl) countdownEl.innerHTML = "<h3>O Churrasco começou! 🎸</h3>";
      return;
    }

    // Só atualiza se os elementos existirem na página
    const d = document.getElementById('days');
    const h = document.getElementById('hours');
    const m = document.getElementById('minutes');
    const s = document.getElementById('seconds');

    if (d && h && m && s) {
        d.innerText = format(Math.floor(distance / (1000 * 60 * 60 * 24)));
        h.innerText = format(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        m.innerText = format(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
        s.innerText = format(Math.floor((distance % (1000 * 60)) / 1000));
    }
  };

  update();
  setInterval(update, 1000);
}

document.addEventListener('DOMContentLoaded', startCountdown);
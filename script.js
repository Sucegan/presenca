const form = document.getElementById('attendanceForm');
const msg = document.getElementById('msg');
const companionToggle = document.getElementById('companionToggle');
const companionNameField = document.getElementById('companionNameField');
const companionInput = document.getElementById('companionInput');
const addCompanion = document.getElementById('addCompanion');
const companionList = document.getElementById('companionList');

let companionNames = [];

function showMessage(text, isError = false) {
  msg.textContent = text;
  msg.className = isError ? 'error-msg' : 'success-msg';
  msg.classList.remove('hidden');
  msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => msg.classList.add('hidden'), 5000);
}

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

function handleAddCompanion() {
  const name = companionInput.value.trim();
  if (!name) { companionInput.focus(); return; }
  if (companionNames.includes(name)) { alert('Este nome já foi adicionado!'); return; }
  companionNames.push(name);
  companionInput.value = '';
  renderCompanionList();
  companionInput.focus();
}

addCompanion.addEventListener('click', handleAddCompanion);
companionInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); handleAddCompanion(); }
});

window.removeCompanion = function(index) {
  companionNames.splice(index, 1);
  renderCompanionList();
};

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

// LOGICA DE ENVIO PARA O BANCO DE DADOS (NEON + VERCEL)
form.onsubmit = async (e) => {
  e.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');
  const nomeConvidado = document.getElementById('guestName').value.trim();

  if (!nomeConvidado) return;

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

    if (!response.ok) throw new Error('Erro na resposta do servidor');

    showMessage(`Confirmado! Esperamos você, ${nomeConvidado.split(' ')[0]}! 🥩`);
    form.reset();
    companionNames = [];
    renderCompanionList();
    companionNameField.classList.remove('show');
    companionToggle.checked = false;
    
  } catch (error) {
    showMessage('Erro ao salvar. Verifique sua conexão.', true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirmar Presença';
  }
};

// CONTADOR
function startCountdown() {
  const eventDate = new Date('2026-05-16T19:30:00-03:00').getTime();
  const format = (num) => String(num).padStart(2, '0');

  const update = () => {
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance < 0) {
      document.querySelector('.countdown').innerHTML = "<h3>O Churrasco começou! 🎸</h3>";
      return;
    }

    document.getElementById('days').innerText = format(Math.floor(distance / (1000 * 60 * 60 * 24)));
    document.getElementById('hours').innerText = format(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    document.getElementById('minutes').innerText = format(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
    document.getElementById('seconds').innerText = format(Math.floor((distance % (1000 * 60)) / 1000));
  };

  update();
  setInterval(update, 1000);
}

document.addEventListener('DOMContentLoaded', startCountdown);
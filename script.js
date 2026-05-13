const STORAGE_KEY = 'presencaList';
const form = document.getElementById('attendanceForm');
const msg = document.getElementById('msg');
const companionToggle = document.getElementById('companionToggle');
const companionNameField = document.getElementById('companionNameField');
const companionInput = document.getElementById('companionInput');
const addCompanion = document.getElementById('addCompanion');
const companionList = document.getElementById('companionList');

let companionNames = [];

// Mostrar mensagens de sucesso/erro
function showMessage(text, isError = false) {
  msg.textContent = text;
  msg.className = isError ? 'error-msg' : 'success-msg';
  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), 4000);
}

// Atualizar a lista visual de acompanhantes
function renderCompanionList() {
  companionList.innerHTML = '';
  companionNames.forEach((name, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${name}</span>
      <button type="button" class="remove-companion" onclick="removeCompanion(${index})">&times;</button>
    `;
    companionList.appendChild(li);
  });
}

// Remover acompanhante da lista
window.removeCompanion = function(index) {
  companionNames.splice(index, 1);
  renderCompanionList();
};

// Adicionar acompanhante à lista
addCompanion.addEventListener('click', () => {
  const name = companionInput.value.trim();
  if (name) {
    companionNames.push(name);
    companionInput.value = '';
    renderCompanionList();
    companionInput.focus();
  }
});

// Alternar visibilidade do campo de acompanhantes
companionToggle.addEventListener('change', (e) => {
  if (e.target.checked) {
    companionNameField.classList.add('show');
  } else {
    companionNameField.classList.remove('show');
    companionNames = []; // Limpa a lista se desmarcar
    renderCompanionList();
  }
});

// Enviar Formulário
form.onsubmit = (e) => {
  e.preventDefault();
  const nome = document.getElementById('guestName').value.trim();
  
  if (!nome) return;

  const guests = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  const newGuest = {
    id: Date.now(),
    nome: nome,
    companionNames: [...companionNames]
  };

  guests.push(newGuest);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));

  showMessage('Presença confirmada com sucesso! 🚀');
  
  // Resetar formulário
  form.reset();
  companionNames = [];
  renderCompanionList();
  companionNameField.classList.remove('show');
};

// Countdown (Seu código original corrigido)
function startCountdown() {
  const eventDate = new Date('2026-05-16T19:30:00').getTime();
  const format = (num) => num < 10 ? `0${num}` : num;

  setInterval(() => {
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance < 0) return;

    document.getElementById('days').innerText = format(Math.floor(distance / (1000 * 60 * 60 * 24)));
    document.getElementById('hours').innerText = format(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    document.getElementById('minutes').innerText = format(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
    document.getElementById('seconds').innerText = format(Math.floor((distance % (1000 * 60)) / 1000));
  }, 1000);
}

document.addEventListener('DOMContentLoaded', startCountdown);
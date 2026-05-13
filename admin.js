const adminCode = 'gamepass';
const STORAGE_KEY = 'presencaList';

// Elementos
const loginSection = document.getElementById('loginSection');
const adminContent = document.getElementById('adminContent');
const passwordInput = document.getElementById('adminPasswordInput');
const loginButton = document.getElementById('loginButton');
const adminGuestList = document.getElementById('adminGuestList');
const adminMessage = document.getElementById('adminMessage');

// Função de Login
function checkLogin() {
    if (passwordInput.value === adminCode) {
        loginSection.classList.add('hidden');
        adminContent.classList.remove('hidden');
        loadAttendanceAdmin();
    } else {
        const err = document.getElementById('loginError');
        err.classList.remove('hidden');
        setTimeout(() => err.classList.add('hidden'), 3000);
    }
}

loginButton.onclick = checkLogin;
passwordInput.onkeypress = (e) => { if(e.key === 'Enter') checkLogin(); };

function loadAttendanceAdmin() {
    const guests = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    renderList(guests);
}

function renderList(guests) {
    adminGuestList.innerHTML = '';
    let totalPeople = 0; // Variável para o cálculo total

    guests.forEach(g => {
        // Soma 1 (o convidado) + a quantidade de acompanhantes
        totalPeople += 1;
        if (g.companionNames && g.companionNames.length > 0) {
            totalPeople += g.companionNames.length;
        }

        const li = document.createElement('li');
        li.style.padding = '10px';
        li.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        li.innerHTML = `
            <div>
                <strong>${g.nome}</strong><br>
                <small>${g.companionNames.join(', ') || 'Sem acompanhantes'}</small>
            </div>
            <button onclick="removeGuest(${g.id})" class="small-button danger" style="width: auto;">X</button>
        `;
        adminGuestList.appendChild(li);
    });

    // Atualiza os displays de contagem
    document.getElementById('guestCountDisplay').textContent = guests.length;
    document.getElementById('totalPeopleDisplay').textContent = totalPeople;
}

window.removeGuest = (id) => {
    if(!confirm('Remover convidado?')) return;
    let guests = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    guests = guests.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
    loadAttendanceAdmin();
};

// Exportar CSV corrigido para acentos
document.getElementById('exportButton').onclick = () => {
    const guests = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const csvHeader = '\uFEFFNome,Acompanhantes\n'; // \uFEFF resolve erros de acento no Excel
    const csvRows = guests.map(g => `"${g.nome}","${g.companionNames.join('; ')}"`).join('\n');
    
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lista_presenca.csv';
    link.click();
};

document.getElementById('logoutButton').onclick = () => {
    location.reload();
};
// --- Adicione isso ao seu admin.js ---

// Lógica de Busca em tempo real
document.getElementById('guestSearch').addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    const guests = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    const filtrados = guests.filter(g => 
        g.nome.toLowerCase().includes(termo) || 
        g.companionNames.some(c => c.toLowerCase().includes(termo))
    );
    
    renderList(filtrados);
});

// Lógica do botão Atualizar
document.getElementById('refreshButton').onclick = () => {
    loadAttendanceAdmin();
    document.getElementById('guestSearch').value = ''; // Limpa a busca
    console.log('Lista atualizada!');
};
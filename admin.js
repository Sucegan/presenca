const adminCode = 'gamepass';

const loginSection = document.getElementById('loginSection');
const adminContent = document.getElementById('adminContent');
const passwordInput = document.getElementById('adminPasswordInput');
const loginButton = document.getElementById('loginButton');
const adminGuestList = document.getElementById('adminGuestList');

let currentGuests = []; // Variável para armazenar os dados vindos do banco

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

// BUSCA DADOS DO BANCO (NEON + VERCEL)
async function loadAttendanceAdmin() {
    try {
        const response = await fetch('/api/guests');
        const guestsFromDB = await response.json();
        
        // Trata os dados do Postgres
        currentGuests = guestsFromDB.map(g => ({
            id: g.id,
            nome: g.nome,
            companionNames: typeof g.acompanhantes === 'string' 
                ? JSON.parse(g.acompanhantes) 
                : (g.acompanhantes || [])
        }));

        renderList(currentGuests);
    } catch (error) {
        console.error("Erro ao carregar lista:", error);
    }
}

function renderList(guests) {
    adminGuestList.innerHTML = '';
    let totalPeople = 0; 

    guests.forEach(g => {
        totalPeople += 1;
        if (g.companionNames && g.companionNames.length > 0) {
            totalPeople += g.companionNames.length;
        }

        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${g.nome}</strong><br>
                <small>${g.companionNames.join(', ') || 'Sem acompanhantes'}</small>
            </div>
            <button onclick="removeGuest(${g.id})" class="small-button danger" style="width: auto;">X</button>
        `;
        adminGuestList.appendChild(li);
    });

    document.getElementById('guestCountDisplay').textContent = guests.length;
    document.getElementById('totalPeopleDisplay').textContent = totalPeople;
}

// DELETA DO BANCO DE DADOS
window.removeGuest = async (id) => {
    if(!confirm('Remover convidado permanentemente?')) return;
    
    try {
        await fetch('/api/guests', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        // Recarrega a lista após deletar
        loadAttendanceAdmin();
    } catch(e) {
        console.error(e);
        alert("Erro ao remover do banco de dados.");
    }
};

// EXPORTAR CSV
document.getElementById('exportButton').onclick = () => {
    const csvHeader = '\uFEFFNome,Acompanhantes\n'; 
    const csvRows = currentGuests.map(g => `"${g.nome}","${g.companionNames.join('; ')}"`).join('\n');
    
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lista_presenca.csv';
    link.click();
};

document.getElementById('logoutButton').onclick = () => {
    location.reload();
};

// Lógica de Busca na página
document.getElementById('guestSearch').addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    
    const filtrados = currentGuests.filter(g => 
        g.nome.toLowerCase().includes(termo) || 
        g.companionNames.some(c => c.toLowerCase().includes(termo))
    );
    
    renderList(filtrados);
});

// Botão Atualizar
document.getElementById('refreshButton').onclick = () => {
    loadAttendanceAdmin();
    document.getElementById('guestSearch').value = ''; 
};
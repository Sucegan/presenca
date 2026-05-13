const adminCode = 'gamepass';
const loginSection = document.getElementById('loginSection');
const adminContent = document.getElementById('adminContent');
const passwordInput = document.getElementById('adminPasswordInput');
const loginButton = document.getElementById('loginButton');
const adminGuestList = document.getElementById('adminGuestList');
const adminMessage = document.getElementById('adminMessage'); // Garanta que este ID existe no seu HTML

let currentGuests = []; 

// Login
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

// BUSCA DADOS DO BANCO - Sincronização Segura
async function loadAttendanceAdmin() {
    try {
        if(adminMessage) adminMessage.classList.add('hidden');
        
        const response = await fetch('/api/guests');
        if (!response.ok) throw new Error('Erro ao conectar com o servidor');
        
        const guestsFromDB = await response.json();
        
        // TRATAMENTO DE DADOS: Evita erro se o Neon já retornar JSON ou String
        currentGuests = guestsFromDB.map(g => {
            let parsedCompanions = [];
            if (Array.isArray(g.acompanhantes)) {
                parsedCompanions = g.acompanhantes;
            } else if (typeof g.acompanhantes === 'string') {
                try { parsedCompanions = JSON.parse(g.acompanhantes); } catch(e) { parsedCompanions = []; }
            }
            
            return {
                id: g.id,
                nome: g.nome,
                companionNames: parsedCompanions
            };
        });

        renderList(currentGuests);
    } catch (error) {
        console.error("Erro ao carregar lista:", error);
        if(adminMessage) {
            adminMessage.textContent = "Erro de sincronização. Verifique sua conexão.";
            adminMessage.classList.remove('hidden');
            adminMessage.style.color = "red";
        }
    }
}

function renderList(guests) {
    adminGuestList.innerHTML = '';
    let totalPeople = 0; 

    if (guests.length === 0) {
        adminGuestList.innerHTML = '<p style="text-align:center; padding:20px; opacity:0.5;">Nenhum convidado encontrado.</p>';
    }

    guests.forEach(g => {
        totalPeople += 1;
        const companions = g.companionNames || [];
        totalPeople += companions.length;

        const li = document.createElement('li');
        li.innerHTML = `
            <div class="guest-info">
                <strong>${g.nome}</strong>
                <small>${companions.length > 0 ? '👥 ' + companions.join(', ') : '👤 Sem acompanhantes'}</small>
            </div>
            <button onclick="removeGuest(${g.id})" class="small-button danger" style="width: auto; min-width: 40px;">&times;</button>
        `;
        adminGuestList.appendChild(li);
    });

    document.getElementById('guestCountDisplay').textContent = guests.length;
    document.getElementById('totalPeopleDisplay').textContent = totalPeople;
}

// DELETA DO BANCO DE DADOS - Verificação de Sincronização
window.removeGuest = async (id) => {
    if(!confirm('Deseja remover este convidado permanentemente?')) return;
    
    try {
        const response = await fetch('/api/guests', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });

        if (response.ok) {
            // Sincronização imediata: remove do array local e renderiza
            currentGuests = currentGuests.filter(g => g.id !== id);
            renderList(currentGuests);
        } else {
            throw new Error("Não foi possível deletar no servidor.");
        }
    } catch(e) {
        console.error(e);
        alert("Erro ao remover: O servidor não respondeu corretamente.");
    }
};

// EXPORTAR CSV (Corrigido para evitar quebras de linha no Excel)
document.getElementById('exportButton').onclick = () => {
    const csvHeader = '\uFEFFNome;Acompanhantes\n'; // Usando ponto e vírgula para melhor compatibilidade com Excel Brasil
    const csvRows = currentGuests.map(g => 
        `"${g.nome.replace(/"/g, '""')}";"${g.companionNames.join(', ').replace(/"/g, '""')}"`
    ).join('\n');
    
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lista_churrasco.csv';
    link.click();
};

document.getElementById('logoutButton').onclick = () => {
    location.reload();
};

// Busca em tempo real
document.getElementById('guestSearch').addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const filtrados = currentGuests.filter(g => {
        const nomeNorm = g.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const compNorm = g.companionNames.join(' ').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return nomeNorm.includes(termo) || compNorm.includes(termo);
    });
    
    renderList(filtrados);
});

// Botão Atualizar (Força nova busca no banco)
document.getElementById('refreshButton').onclick = () => {
    const btn = document.getElementById('refreshButton');
    btn.disabled = true;
    btn.textContent = "...";
    
    loadAttendanceAdmin().finally(() => {
        btn.disabled = false;
        btn.textContent = "Atualizar";
        document.getElementById('guestSearch').value = ''; 
    });
};
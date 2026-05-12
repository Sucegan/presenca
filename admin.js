const adminCode = "gamepass"; // Senha que definiste
const adminPasswordInput = document.getElementById("adminPassword");
const adminAccessButton = document.getElementById("adminAccessButton");
const adminContent = document.getElementById("adminContent");
const adminGuestList = document.getElementById("adminGuestList");

async function loadAttendanceAdmin() {
    try {
        const res = await fetch('/api/presenca');
        const guests = await res.json();
        renderAdminList(guests);
    } catch (e) { console.error("Erro ao carregar:", e); }
}

function renderAdminList(guests) {
    adminGuestList.innerHTML = guests.length === 0 ? "<li>Ninguém na lista.</li>" : "";
    guests.forEach(g => {
        const li = document.createElement("li");
        li.className = "guest-item";
        li.innerHTML = `
            <span>${g.nome}</span>
            <button onclick="removeGuest(${g.id})" style="width: auto; padding: 5px 10px; background: #ff4d4d; color: white;">Remover</button>
        `;
        adminGuestList.appendChild(li);
    });
}

async function removeGuest(id) {
    if(confirm("Deseja remover este nome da lista?")) {
        await fetch(`/api/presenca?id=${id}`, { method: 'DELETE' });
        loadAttendanceAdmin();
    }
}

adminAccessButton.onclick = () => {
    if(adminPasswordInput.value === adminCode) {
        adminContent.classList.remove("hidden");
        loadAttendanceAdmin();
    } else {
        alert("Senha incorreta!");
    }
};
const form = document.getElementById("attendanceForm");
const guestList = document.getElementById("guestList");
const msg = document.getElementById("msg");

async function loadAttendance() {
    try {
        const res = await fetch('/api/presenca');
        const data = await res.json();
        renderList(data);
    } catch (e) { console.error(e); }
}

function renderList(guests) {
    guestList.innerHTML = guests.length === 0 ? "<li>Ninguém confirmou ainda...</li>" : "";
    guests.forEach(g => {
        const li = document.createElement("li");
        li.className = "guest-item";
        li.innerHTML = `<span>${g.nome}</span> <small>✓</small>`;
        guestList.appendChild(li);
    });
}

form.onsubmit = async (e) => {
    e.preventDefault();
    const nome = document.getElementById("guestName").value;
    
    const res = await fetch('/api/presenca', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ nome })
    });

    if(res.ok) {
        msg.textContent = "Presença confirmada com sucesso!";
        msg.className = "success-msg";
        form.reset();
        loadAttendance();
    }
};

loadAttendance();
setInterval(loadAttendance, 10000); // Atualiza a cada 10 segundos
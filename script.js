const form = document.getElementById("attendanceForm");
const msg = document.getElementById("msg");

form.onsubmit = async (e) => {
    e.preventDefault();
    const nome = document.getElementById("guestName").value;
    
    try {
        const res = await fetch('/api/presenca', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ nome })
        });

        if(res.ok) {
            msg.textContent = "Presença confirmada com sucesso!";
            msg.className = "success-msg";
            msg.classList.remove("hidden");
            form.reset();
        } else {
            msg.textContent = "Erro ao confirmar. Tente novamente.";
            msg.className = "error-msg"; // Adicione estilização para erro no CSS se desejar
            msg.classList.remove("hidden");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
};
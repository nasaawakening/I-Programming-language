const variables = {};

// 1. Highlight & Auto-save
function updateView() {
    let code = document.getElementById("editing").value;
    let resultElement = document.getElementById("highlighting-content");
    
    // Simulasikan pewarnaan syntax
    let highlighted = code
        .replace(/\b(cetak|simpan|tambah)\b/g, '<span style="color: #cc99cd;">$1</span>')
        .replace(/#.*/g, '<span style="color: #666; font-style: italic;">$&</span>')
        .replace(/\b\d+\b/g, '<span style="color: #f08d49;">$&</span>');

    resultElement.innerHTML = highlighted;
    
    // Auto-save ke LocalStorage
    localStorage.setItem("ipp_backup", code);
}

function syncScroll() {
    let editing = document.getElementById("editing");
    let highlighting = document.getElementById("highlighting");
    highlighting.scrollTop = editing.scrollTop;
    highlighting.scrollLeft = editing.scrollLeft;
}

// 2. Logic Interpreter I++
function jalankanIpp() {
    const code = document.getElementById('editing').value;
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = ""; 
    
    const lines = code.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line || line.startsWith('#')) continue;

        const tokens = line.split(' ');
        const command = tokens[0].toLowerCase();

        try {
            if (command === "cetak") {
                const content = tokens.slice(1).join(' ');
                if (!content) throw "Butuh teks untuk dicetak.";
                outputDiv.innerHTML += `> ${variables[content] || content}\n`;
            } 
            else if (command === "simpan") {
                if (tokens[2] !== "=") throw "Format: simpan [var] = [nilai]";
                variables[tokens[1]] = tokens.slice(3).join(' ');
            } 
            else if (command === "tambah") {
                const n1 = parseFloat(tokens[1]);
                const n2 = parseFloat(tokens[2]);
                if (isNaN(n1) || isNaN(n2)) throw "Input harus angka.";
                outputDiv.innerHTML += `> RESULT: ${n1 + n2}\n`;
            } 
            else {
                throw `Perintah '${command}' tidak dikenal.`;
            }
        } catch (e) {
            outputDiv.innerHTML += `<span style="color:#ff5f56">[ERR Baris ${i+1}]: ${e}</span>\n`;
            break;
        }
    }
}

function clearConsole() {
    document.getElementById('output').innerHTML = "> console cleared.";
}

// 3. Load Awal
window.onload = () => {
    const saved = localStorage.getItem("ipp_backup");
    if (saved) {
        document.getElementById("editing").value = saved;
    } else {
        document.getElementById("editing").value = "# Welcome to I++ Terminal\nsimpan toko = Bakso Bangi Pak Romdani\ncetak toko\ntambah 10 20";
    }
    updateView();
}

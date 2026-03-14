const variables = {};

function updateView() {
    let code = document.getElementById("editing").value;
    let resultElement = document.getElementById("highlighting-content");
    
    // Memberi warna pada keyword I++
    let highlighted = code
        .replace(/\b(cetak|simpan|tambah)\b/g, '<span style="color: #cc99cd;">$1</span>')
        .replace(/#.*/g, '<span style="color: #999; font-style: italic;">$&</span>')
        .replace(/\b\d+\b/g, '<span style="color: #f08d49;">$&</span>');

    resultElement.innerHTML = highlighted;
}

function syncScroll() {
    let editing = document.getElementById("editing");
    let highlighting = document.getElementById("highlighting");
    highlighting.scrollTop = editing.scrollTop;
    highlighting.scrollLeft = editing.scrollLeft;
}

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
                outputDiv.innerHTML += (variables[content] || content) + "\n";
            } 
            else if (command === "simpan") {
                if (tokens[2] !== "=") throw "Gunakan tanda '=' untuk simpan variabel.";
                variables[tokens[1]] = tokens.slice(3).join(' ');
            } 
            else if (command === "tambah") {
                const n1 = parseFloat(tokens[1]);
                const n2 = parseFloat(tokens[2]);
                if (isNaN(n1) || isNaN(n2)) throw "Input harus angka.";
                outputDiv.innerHTML += (n1 + n2) + "\n";
            } 
            else {
                throw `Perintah '${command}' tidak dikenal.`;
            }
        } catch (e) {
            outputDiv.innerHTML += `<span style="color:red">[ERROR Baris ${i+1}]: ${e}</span>\n`;
            break;
        }
    }
}

function clearConsole() {
    document.getElementById('output').innerHTML = "> Konsol dibersihkan...";
}

// Inisialisasi awal
window.onload = () => {
    document.getElementById("editing").value = "# I++ Language\ncetak Halo Bangi!\nsimpan nama = Nasa\ncetak nama";
    updateView();
}

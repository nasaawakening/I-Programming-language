/**
 * I++ Script Engine
 * Developed by: Nasa (Bangi, Kayenlor)
 * Features: SPA Navigation, Syntax Highlighting, Interpreter, Auto-save, 
 * Export/Import, Share Multiplayer, & Typewriter Sound.
 */

let variables = {};

// --- 1. EFEK SUARA (TYPEWRITER) ---
const typeSound = new Audio('https://www.soundjay.com/communication/typewriter-key-1.mp3');
const runSound = new Audio('https://www.soundjay.com/button/button-09.mp3');

function playTypeSound() {
    typeSound.currentTime = 0;
    typeSound.volume = 0.2;
    typeSound.play().catch(() => {}); // Catch error jika browser memblokir auto-play
}

// --- 2. NAVIGASI TAB ---
function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabId).classList.add('active');
    
    // Perbaikan: Gunakan currentTarget jika dipanggil dari HTML event
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

// --- 3. EDITOR & SYNTAX HIGHLIGHTING ---
function updateView() {
    playTypeSound(); // Bunyi setiap kali mengetik

    const editing = document.getElementById("editing");
    const resultElement = document.getElementById("highlighting-content");
    let code = editing.value;

    let highlighted = code
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") 
        .replace(/\b(cetak|simpan|tambah)\b/g, '<span style="color: #cc99cd;">$1</span>')
        .replace(/#.*/g, '<span style="color: #666; font-style: italic;">$&</span>')
        .replace(/\b\d+\b/g, '<span style="color: #f08d49;">$&</span>');

    resultElement.innerHTML = highlighted + "\n";
    localStorage.setItem("ipp_backup", code);
}

function syncScroll() {
    const editing = document.getElementById("editing");
    const highlighting = document.getElementById("highlighting");
    highlighting.scrollTop = editing.scrollTop;
    highlighting.scrollLeft = editing.scrollLeft;
}

// --- 4. INTERPRETER I++ ---
function jalankanIpp() {
    runSound.play().catch(() => {});
    
    const code = document.getElementById('editing').value;
    const outputDiv = document.getElementById('output');

    outputDiv.innerHTML = "Running system...\n"; 
    variables = {}; 

    const lines = code.split('\n');

    lines.forEach((line, i) => {
        let trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const tokens = trimmed.split(/\s+/);
        const command = tokens[0].toLowerCase();

        try {
            if (command === "cetak") {
                const target = tokens.slice(1).join(' ');
                const val = variables[target] !== undefined ? variables[target] : target;
                outputDiv.innerHTML += `> ${val}\n`;
            } 
            else if (command === "simpan") {
                const eqIndex = tokens.indexOf("=");
                if (eqIndex === -1) throw "Gunakan tanda '='. Contoh: simpan x = 10";

                const varName = tokens.slice(1, eqIndex).join(' ');
                const varValue = tokens.slice(eqIndex + 1).join(' ');
                variables[varName] = varValue;
            } 
            else if (command === "tambah") {
                if (tokens.length < 3) throw "Butuh 2 angka untuk ditambah.";
                const n1 = parseFloat(tokens[1]);
                const n2 = parseFloat(tokens[2]);
                if (isNaN(n1) || isNaN(n2)) throw "Input harus angka.";
                outputDiv.innerHTML += `> RESULT: ${n1 + n2}\n`;
            } 
            else {
                throw `Perintah '${command}' tidak dikenali.`;
            }
        } catch (e) {
            outputDiv.innerHTML += `<span style="color:#ff5f56">[ERR Baris ${i+1}]: ${e}</span>\n`;
        }
    });
}

// --- 5. EXPORT, IMPORT, & SHARE ---
function exportCode() {
    const code = document.getElementById("editing").value;
    const blob = new Blob([code], { type: "text/plain" });
    const anchor = document.createElement("a");
    anchor.download = "program_nasa.ipp";
    anchor.href = window.URL.createObjectURL(blob);
    anchor.click();
}

function importCode(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById("editing").value = e.target.result;
        updateView();
    };
    reader.readAsText(file);
}

function shareProject() {
    const code = document.getElementById("editing").value;
    const encodedCode = btoa(unescape(encodeURIComponent(code)));
    const shareUrl = window.location.origin + window.location.pathname + "?code=" + encodedCode;

    navigator.clipboard.writeText(shareUrl).then(() => {
        alert("Link Multiplayer berhasil disalin! Kirim ke temanmu.");
    });
}

// --- 6. INITIAL LOAD & URL PARSER ---
function clearConsole() {
    document.getElementById('output').innerHTML = "> console cleared.";
}

function isiContoh() {
    const code = "# Contoh Program I++\nsimpan warung = Bakso Bangi Pak Romdani\ncetak warung\n\nsimpan porsi = 15000\nsimpan es_teh = 3000\ncetak Total_Bayar:\ntambah 15000 3000";
    document.getElementById("editing").value = code;
    updateView();
}

window.onload = () => {
     // Meminta sistem mengunci layar ke landscape (jika didukung browser)
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(function(error) {
            console.log("Kunci orientasi ditolak/tidak didukung: ", error);
        });
    }

    // Kode onload kamu yang sudah ada sebelumnya
    const urlParams = new URLSearchParams(window.location.search);
    // 1. Cek apakah ada kode di URL (Multiplayer)
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    
    if (codeParam) {
        try {
            const decodedCode = decodeURIComponent(escape(atob(codeParam)));
            document.getElementById("editing").value = decodedCode;
            openTab('terminal'); // Langsung buka terminal jika lewat link share
        } catch (e) {
            console.error("Gagal memuat kode share.");
        }
    } else {
        // 2. Jika tidak ada share link, ambil dari Auto-save (LocalStorage)
        const saved = localStorage.getItem("ipp_backup");
        if (saved) {
            document.getElementById("editing").value = saved;
        } else {
            document.getElementById("editing").value = "# I++ Engine Ready\ncetak Halo dari Bangi!\nsimpan nama = Nasa\ncetak nama";
        }
    }
    
    // Inisialisasi tampilan
    updateView();
};

// Fungsi untuk memuat berbagai macam contoh kode
function isiContoh() {
    const select = document.getElementById("exampleSelect");
    const choice = select.value;
    let code = "";

    switch (choice) {
        case "halo":
            code = "# Contoh 1: Halo Dunia\ncetak Selamat Datang di I++ Engine\ncetak Bahasa ini lahir dari Kayenlor, Kediri.";
            break;
            
        case "variabel":
            code = "# Contoh 2: Variabel\nsimpan nama = Nasa\nsimpan status = Developer I++\ncetak Halo namaku:\ncetak nama\ncetak Pekerjaan:\ncetak status";
            break;
            
        case "matematika":
            code = "# Contoh 3: Penjumlahan\n# Masukkan angka pertama dan kedua\ncetak Hasil dari 500 + 250 adalah:\ntambah 500 250\n\ncetak Hasil dari 1000 + 750:\ntambah 1000 750";
            break;
            
        case "bakso":
            code = "# Contoh 4: Kasir Bakso Bangi Pak Romdani\nsimpan menu = Bakso Komplit\nsimpan harga = 15000\nsimpan es_teh = 3000\n\ncetak Pesanan:\ncetak menu\n\ncetak Total_Bayar:\ntambah 15000 3000\n\ncetak Terima_Kasih_Sudah_Mampir!";
            break;
            
        default:
            return;
    }

    // Masukkan ke editor dan update tampilan
    document.getElementById("editing").value = code;
    updateView();
}

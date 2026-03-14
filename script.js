/**
 * I++ Script Engine
 * Developed by: Nasa (Bangi, Kayenlor)
 * Features: SPA Navigation, Syntax Highlighting, Interpreter, Auto-save
 */

let variables = {};

// --- 1. NAVIGASI TAB ---
function openTab(tabId) {
    // Sembunyikan semua konten tab
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Matikan semua tombol aktif
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Tampilkan tab yang dipilih & aktifkan tombolnya
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// --- 2. EDITOR & SYNTAX HIGHLIGHTING ---
function updateView() {
    const editing = document.getElementById("editing");
    const resultElement = document.getElementById("highlighting-content");
    let code = editing.value;
    
    // Proses pewarnaan syntax (Regex)
    let highlighted = code
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") // Proteksi tag HTML
        .replace(/\b(cetak|simpan|tambah)\b/g, '<span style="color: #cc99cd;">$1</span>') // Command
        .replace(/#.*/g, '<span style="color: #666; font-style: italic;">$&</span>') // Komentar
        .replace(/\b\d+\b/g, '<span style="color: #f08d49;">$&</span>'); // Angka

    resultElement.innerHTML = highlighted + "\n";
    
    // Simpan otomatis ke memori browser
    localStorage.setItem("ipp_backup", code);
}

function syncScroll() {
    const editing = document.getElementById("editing");
    const highlighting = document.getElementById("highlighting");
    highlighting.scrollTop = editing.scrollTop;
    highlighting.scrollLeft = editing.scrollLeft;
}

// --- 3. INTERPRETER I++ ---
function jalankanIpp() {
    const code = document.getElementById('editing').value;
    const outputDiv = document.getElementById('output');
    
    outputDiv.innerHTML = "Running system...\n"; 
    variables = {}; // Reset variabel setiap kali dijalankan
    
    const lines = code.split('\n');
    
    lines.forEach((line, i) => {
        let trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const tokens = trimmed.split(/\s+/);
        const command = tokens[0].toLowerCase();

        try {
            if (command === "cetak") {
                const target = tokens.slice(1).join(' ');
                // Jika target adalah variabel yang ada di memori, ambil nilainya. Jika tidak, cetak teks aslinya.
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

// --- 4. FUNGSI PEMBANTU ---
function clearConsole() {
    document.getElementById('output').innerHTML = "> console cleared.";
}

function isiContoh() {
    const code = "# Contoh Program I++\nsimpan warung = Bakso Bangi Pak Romdani\ncetak warung\n\nsimpan porsi = 15000\nsimpan es_teh = 3000\ncetak Total_Bayar:\ntambah 15000 3000";
    document.getElementById("editing").value = code;
    updateView();
}

// --- 5. INITIAL LOAD ---
window.onload = () => {
    const saved = localStorage.getItem("ipp_backup");
    if (saved) {
        document.getElementById("editing").value = saved;
    } else {
        // Tampilan awal jika user baru pertama kali buka
        document.getElementById("editing").value = "# I++ Language\ncetak Halo dari Bangi!\nsimpan nama = Nasa\ncetak nama";
    }
    updateView();
};

// --- FITUR EXPORT & IMPORT ---

// 1. Export: Mengunduh teks di editor menjadi file .ipp
function exportCode() {
    const code = document.getElementById("editing").value;
    const blob = new Blob([code], { type: "text/plain" });
    const anchor = document.createElement("a");
    anchor.download = "program_nasa.ipp";
    anchor.href = window.URL.createObjectURL(blob);
    anchor.click();
}

// 2. Import: Membaca file .ipp dari komputer dan memasukkannya ke editor
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

// --- FITUR MULTIPLAYER (SHARE LINK) ---

// 3. Share: Membuat link unik yang berisi seluruh kode editor
function shareProject() {
    const code = document.getElementById("editing").value;
    // Mengubah kode menjadi format Base64 agar aman di dalam URL
    const encodedCode = btoa(unescape(encodeURIComponent(code)));
    const shareUrl = window.location.origin + window.location.pathname + "?code=" + encodedCode;
    
    // Copy ke clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
        alert("Link Multiplayer berhasil disalin! Kirim link ini ke temanmu untuk bekerja sama.");
    });
}

// 4. Load from URL: Saat halaman dibuka, cek apakah ada kode di URL
function loadFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    if (codeParam) {
        try {
            const decodedCode = decodeURIComponent(escape(atob(codeParam)));
            document.getElementById("editing").value = decodedCode;
            updateView();
            // Pindah ke tab terminal otomatis agar user bisa langsung lihat kodenya
            openTab('terminal');
        } catch (e) {
            console.error("Gagal memuat kode dari link.");
        }
    }
}

// Panggil fungsi loadFromUrl di dalam window.onload yang sudah ada
const originalOnload = window.onload;
window.onload = () => {
    if (originalOnload) originalOnload();
    loadFromUrl();
};
// Data untuk menyimpan ucapan
let ucapanData = [];
let currentPage = 1;
const itemsPerPage = 5;

// Pagination object
const pagination = {
    next: function () {
        const totalPages = Math.ceil(ucapanData.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderUcapan();
        }
    },
    previous: function () {
        if (currentPage > 1) {
            currentPage--;
            renderUcapan();
        }
    }
};

// Kirim ucapan baru
async function kirim() {
    const nama = document.getElementById('formnama').value.trim();
    const hadiran = document.getElementById('hadiran').value;
    const jumlahOrang = document.getElementById('jumlah_orang').value;
    const pesan = document.getElementById('formpesan').value.trim();

    // Validasi form
    if (!nama) { alert('Silakan isi nama Anda'); return; }
    if (hadiran === '0') { alert('Silakan konfirmasi kehadiran Anda'); return; }
    if (hadiran === '1' && (jumlahOrang === '' || parseInt(jumlahOrang) < 1)) {
        alert('Silakan isi jumlah orang yang akan hadir');
        return;
    }
    if (!pesan) { alert('Silakan tulis ucapan dan doa Anda'); return; }

    // Objek ucapan
    const ucapan = {
        nama: nama,
        hadiran: hadiran,
        jumlahOrang: hadiran === '1' ? jumlahOrang : "0",
        pesan: pesan,
        tanggal: new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    try {
        await database.ref('ucapan').push().set(ucapan);

        resetForm();
        alert('Terima kasih atas ucapan dan doanya!');
        currentPage = 1; // kembali ke halaman pertama
    } catch (error) {
        console.error("Error menyimpan ucapan:", error);
        alert('Terjadi kesalahan saat mengirim ucapan');
    }
}

// Ambil data realtime dari Firebase
function displayUcapan() {
    database.ref('ucapan').orderByChild('timestamp').on('value', (snapshot) => {
        const allUcapan = [];
        snapshot.forEach((childSnapshot) => {
            const ucapan = childSnapshot.val();
            ucapan.id = childSnapshot.key;
            allUcapan.unshift(ucapan); // terbaru di atas
        });
        ucapanData = allUcapan;
        renderUcapan();
    }, (error) => {
        console.error("Error mengambil data ucapan:", error);
        document.getElementById('daftarucapan').innerHTML =
            '<div class="text-center py-3 text-danger">Gagal memuat ucapan</div>';
    });
}

// Render daftar ucapan + pagination
function renderUcapan() {
    const daftarucapan = document.getElementById('daftarucapan');

    if (ucapanData.length === 0) {
        daftarucapan.innerHTML = '<div class="text-center py-3">Belum ada ucapan</div>';
        return;
    }

    const totalPages = Math.ceil(ucapanData.length / itemsPerPage);
    document.getElementById('previous').classList.toggle('disabled', currentPage === 1);
    document.getElementById('next').classList.toggle('disabled', currentPage === totalPages);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUcapan = ucapanData.slice(startIndex, endIndex);

    daftarucapan.innerHTML = '';
    currentUcapan.forEach(ucapan => {
        const ucapanElement = document.createElement('div');
        ucapanElement.className = 'card border-0 shadow-sm mb-3';
        ucapanElement.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5 class="card-title mb-0">${ucapan.nama}</h5>
                    <small class="text-muted">${ucapan.tanggal}</small>
                </div>
                <div class="d-flex align-items-center mb-2">
                    <span class="badge ${ucapan.hadiran === '1' ? 'bg-success' : 'bg-secondary'} me-2">
                        ${ucapan.hadiran === '1' ? 'Hadir ('+ucapan.jumlahOrang+' orang)' : 'Berhalangan'}
                    </span>
                </div>
                <p class="card-text text-start">${ucapan.pesan}</p>
            </div>
        `;
        daftarucapan.appendChild(ucapanElement);
    });
}

// Reset form
function resetForm() {
    document.getElementById('formnama').value = '';
    document.getElementById('hadiran').value = '0';
    document.getElementById('jumlah_orang').value = '';
    document.getElementById('formpesan').value = '';
    document.getElementById('jumlah_container').style.display = 'none';
}

// Init
document.addEventListener('DOMContentLoaded', function () {
    // Hitung total tamu hadir
    database.ref('ucapan').on('value', (snapshot) => {
        let totalGuest = 0;
        snapshot.forEach((childSnapshot) => {
            const ucapan = childSnapshot.val();
            if (ucapan.hadiran === '1') {
                totalGuest += Number(ucapan.jumlahOrang);
            }
        });
        console.log("Total tamu hadir:", totalGuest);
    });

    displayUcapan();

    // Toggle jumlah orang kalau pilih "Berhalangan"
    document.getElementById('hadiran').addEventListener('change', function () {
        if (this.value === '1') {
            document.getElementById('jumlah_container').style.display = 'block';
        } else {
            document.getElementById('jumlah_container').style.display = 'none';
            document.getElementById('jumlah_orang').value = '';
        }
    });

    // Sembunyikan tombol balasan yang tidak digunakan
    const batalBtn = document.getElementById('batal');
    const kirimBalasanBtn = document.getElementById('kirimbalasan');
    if (batalBtn) batalBtn.style.display = 'none';
    if (kirimBalasanBtn) kirimBalasanBtn.style.display = 'none';
});

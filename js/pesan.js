// Data untuk menyimpan ucapan
let ucapanData = [];
let currentPage = 1;
const itemsPerPage = 5;

// Objek untuk pagination
const pagination = {
    next: function() {
        currentPage++;
        displayUcapan();
    },
    previous: function() {
        if (currentPage > 1) {
            currentPage--;
            displayUcapan();
        }
    }
};

// Fungsi untuk mengirim ucapan baru
async function kirim() {
    const nama = document.getElementById('formnama').value.trim();
    const hadiran = document.getElementById('hadiran').value;
    const jumlahOrang  = document.getElementById('jumlah_orang').value;
    const pesan = document.getElementById('formpesan').value.trim();
    
    // Validasi form
    if (!nama) {
        alert('Silakan isi nama Anda');
        return;
    }
    
    if (hadiran === '0') {
        alert('Silakan konfirmasi kehadiran Anda');
        return;
    }

    if (hadiran === '1' && (jumlahOrang === '' || parseInt(jumlahOrang) < 1)) {
        alert('Silakan isi jumlah orang yang akan hadir');
        return;
    }
    
    if (!pesan) {
        alert('Silakan tulis ucapan dan doa Anda');
        return;
    }
    
    // Buat objek ucapan baru
    const ucapan = {
        nama: nama,
        hadiran: hadiran,
        jumlahOrang: jumlahOrang,
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
        // Kirim ke Firebase
        const newUcapanRef = database.ref('ucapan').push();
        await newUcapanRef.set(ucapan);
        
        // Reset form
        document.getElementById('formnama').value = '';
        document.getElementById('hadiran').value = '0';
        document.getElementById('formpesan').value = '';
        
        alert('Terima kasih atas ucapan dan doanya!');
        
        // Refresh tampilan ucapan
        currentPage = 1;
        displayUcapan();
    } catch (error) {
        console.error("Error menyimpan ucapan:", error);
        alert('Terjadi kesalahan saat mengirim ucapan');
    }
}

// Fungsi untuk menampilkan ucapan
function displayUcapan() {
    const daftarucapan = document.getElementById('daftarucapan');
    daftarucapan.innerHTML = '<div class="text-center py-3">Memuat ucapan...</div>';
    
    // Ambil data dari Firebase
    database.ref('ucapan').orderByChild('timestamp').once('value')
        .then((snapshot) => {
            const allUcapan = [];
            snapshot.forEach((childSnapshot) => {
                const ucapan = childSnapshot.val();
                ucapan.id = childSnapshot.key; // Tambahkan ID dari Firebase
                allUcapan.unshift(ucapan); // Masukkan di awal array untuk urutan terbaru pertama
            });
            
            // Update ucapanData untuk pagination
            ucapanData = allUcapan;
            
            // Hitung total halaman
            const totalPages = Math.ceil(ucapanData.length / itemsPerPage);
            
            // Update status pagination
            document.getElementById('previous').classList.toggle('disabled', currentPage === 1);
            document.getElementById('next').classList.toggle('disabled', currentPage === totalPages || ucapanData.length === 0);
            
            // Potong data untuk halaman saat ini
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentUcapan = ucapanData.slice(startIndex, endIndex);
            
            if (currentUcapan.length === 0) {
                daftarucapan.innerHTML = '<div class="text-center py-3">Belum ada ucapan</div>';
                return;
            }
            
            // Kosongkan daftar ucapan
            daftarucapan.innerHTML = '';
            
            // Buat elemen untuk setiap ucapan
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
                                ${ucapan.hadiran === '1' ? 'Hadir' : 'Berhalangan'}
                            </span>
                        </div>
                        <p class="card-text">${ucapan.pesan}</p>
                    </div>
                `;
                daftarucapan.appendChild(ucapanElement);
            });
        })
        .catch((error) => {
            console.error("Error mengambil data ucapan:", error);
            daftarucapan.innerHTML = '<div class="text-center py-3 text-danger">Gagal memuat ucapan</div>';
        });
}

function resetForm() {
    document.getElementById('formnama').value = '';
    document.getElementById('hadiran').value = '0';
    document.getElementById('jumlah_orang').value = '';
    document.getElementById('formpesan').value = '';
    document.getElementById('idbalasan').value = '';
    document.getElementById('batal').style.display = 'none';
    document.getElementById('kirimbalasan').style.display = 'none';
    document.getElementById('kirim').style.display = 'block';
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
        var totalGuest = 0;
        // To get the count of messages
        database.ref('ucapan').once('value')
        .then((snapshot) => {
        
        // You can also iterate through the messages if needed
        snapshot.forEach((childSnapshot) => {
            const ucapan = childSnapshot.val();
            if (ucapan.hadiran === '1') {
                totalGuest +=  Number(ucapan.jumlahOrang);
            }
        });
        console.log(totalGuest);
        })

        .catch((error) => {
        console.error("Error getting data:", error);
        });

    displayUcapan();
    
    // Sembunyikan tombol balasan yang tidak digunakan
    document.getElementById('batal').style.display = 'none';
    document.getElementById('kirimbalasan').style.display = 'none';
});

const audio = (() => {
    var instance = undefined;

    var getInstance = () => {
        if (!instance) {
            instance = new Audio();
            instance.autoplay = true;
            instance.src = document.getElementById('tombol-musik').getAttribute('data-url');
            instance.load();
            instance.currentTime = 0;
            instance.volume = 1;
            instance.muted = false;
            instance.loop = true;
        }

        return instance;
    };

    return {
        play: () => {
            getInstance().play();
        },
        pause: () => {
            getInstance().pause();
        }
    };
})();

const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const salin = (btn) => {
    navigator.clipboard.writeText(btn.getAttribute('data-nomer'));
    let tmp = btn.innerHTML;
    btn.innerHTML = 'Tersalin';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = tmp;
        btn.disabled = false;
    }, 1500);
};

document.addEventListener("DOMContentLoaded", function () {
    const timer = () => {
        const tampilanWaktu = document.getElementById("tampilan-waktu");
        if (!tampilanWaktu) return; // Ensure element exists before proceeding

        const countDownDate = new Date(tampilanWaktu.getAttribute("data-waktu").replace(" ", "T")).getTime();

        if (isNaN(countDownDate)) {
            console.error("Invalid date format.");
            return;
        }

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = countDownDate - now;

            if (distance < 0) {
                clearInterval(interval);
                document.getElementById("hari").innerText = "0";
                document.getElementById("jam").innerText = "0";
                document.getElementById("menit").innerText = "0";
                document.getElementById("detik").innerText = "0";
                return;
            }

            document.getElementById("hari").innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
            document.getElementById("jam").innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            document.getElementById("menit").innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            document.getElementById("detik").innerText = Math.floor((distance % (1000 * 60)) / 1000);
        };

        updateTimer(); // Initial call to avoid delay in UI update
        const interval = setInterval(updateTimer, 1000);
    };

    timer(); // Run the function after DOM has loaded
});


const buka = async () => {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('tombol-musik').style.display = 'block';
    audio.play();
    AOS.init();
    await login();
    timer();
};

const play = (btn) => {
    if (btn.getAttribute('data-status').toString() != 'true') {
        btn.setAttribute('data-status', 'true');
        audio.play();
        btn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
    } else {
        btn.setAttribute('data-status', 'false');
        audio.pause();
        btn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
    }
};

window.addEventListener('load', () => {
    let modal = new bootstrap.Modal('#exampleModal');
    let name = (new URLSearchParams(window.location.search)).get('to') ?? '';

    if (name.length == 0) {
        document.getElementById('namatamu').remove();
    } else {
        let div = document.createElement('div');
        div.classList.add('m-2');
        div.innerHTML = `
        <p class="mt-0 mb-1 mx-0 p-0 text-light">Kepada Yth Bapak/Ibu/Saudara/i</p>
        <h2 class="text-light">${escapeHtml(name)}</h2>
        `;

        document.getElementById('formnama').value = name;
        document.getElementById('namatamu').appendChild(div);
    }

    modal.show();
}, false);

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Get 'name' from URL
const name = getQueryParam("name");
const tipe = getQueryParam("tipe");

// If name exists, update the HTML
if (name) {
    document.getElementById("guest-name").textContent = name;
}

if (tipe) {
    if (tipe == '1') {
        document.getElementById("waktu-resepsi").textContent = "07.00 WIB - 08.30 WIB";
    } else if (tipe == '2') {
        document.getElementById("waktu-resepsi").textContent = "07.30 WIB - 9.30 WIB";
    } else if (tipe == '3'){
        const element = document.getElementById('tampilan-waktu');
        element.setAttribute('data-waktu', '2025-06-01 08:00:00');

        document.getElementById("tanggal-acara").textContent = "Rabu, 17 September 2025";
        document.getElementById("acara").textContent = "Ngunduh Mantu";
        document.getElementById("waktu-acara").hidden = true;
        document.getElementById("waktu-unduh").hidden = false;

        document.getElementById("lokasi-acara").hidden = true;
        document.getElementById("lokasi-unduh").hidden = false;
    }
}

function salin2(button) {
    const accountNumber = button.getAttribute('data-nomer');
    const bankName = button.getAttribute('data-bank');
    
    // Copy to clipboard
    navigator.clipboard.writeText(accountNumber).then(() => {
        // Show toast notification
        const toast = new bootstrap.Toast(document.getElementById('copyToast'));
        document.querySelector('.toast-body').textContent = `${bankName} account number copied to clipboard!`;
        toast.show();
        
        // Button feedback
        button.innerHTML = `<i class="fas fa-check me-2"></i>Copied!`;
        button.classList.add('btn-success');
        setTimeout(() => {
            button.innerHTML = `<i class="far fa-copy me-2"></i>Salin No. Rekening`;
            button.classList.remove('btn-success');
            if (bankName === 'BCA') button.classList.add('btn-primary');
            if (bankName === 'INA') button.classList.add('btn-danger');
            if (bankName === 'ShopeePay') button.classList.add('btn-warning');
        }, 2000);
    });
}

// Firebase
  const firebaseConfig = {
  apiKey: "AIzaSyCgqpe2h6Mlv44IwxzRlxpeMfj1-e0lVdE",
  authDomain: "ilham-invitation.firebaseapp.com",
  databaseURL: "https://ilham-invitation-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ilham-invitation",
  storageBucket: "ilham-invitation.firebasestorage.app",
  messagingSenderId: "80386578142",
  appId: "1:80386578142:web:e21bc01b683a6e6fbfd44f"
};
  
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
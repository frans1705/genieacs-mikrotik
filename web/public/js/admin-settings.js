// admin-settings.js

document.addEventListener('DOMContentLoaded', function () {
    pollWAStatus();
    loadSettings();
});

function pollWAStatus() {
    fetch('/admin/api/wa/status')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.status) {
                updateWAStatusUI(data.status);
            }
        })
        .catch(() => {
            updateWAStatusUI(null);
        });
    setTimeout(pollWAStatus, 3000);
}

function updateWAStatusUI(status) {
    const qrcodeImg = document.getElementById('wa-qrcode');
    const qrcodeMsg = document.getElementById('wa-qrcode-message');
    let statusDiv = document.getElementById('wa-status-info');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'wa-status-info';
        statusDiv.className = 'alert alert-success mt-2';
        qrcodeImg.parentNode.insertBefore(statusDiv, qrcodeImg.nextSibling);
    }
    if (status && status.connected) {
        // WhatsApp sudah terhubung
        qrcodeImg.style.display = 'none';
        qrcodeMsg.style.display = 'none';
        statusDiv.style.display = 'block';
        statusDiv.innerHTML = `<b>WhatsApp Terhubung!</b><br>Nomor: <span class='text-success'>${status.phoneNumber || '-'} </span><br><small>Sejak: ${status.connectedSince ? new Date(status.connectedSince).toLocaleString('id-ID') : '-'}</small>`;
    } else {
        // Belum terhubung, tampilkan QRCode
        qrcodeImg.style.display = '';
        qrcodeImg.src = '/admin/api/wa/qrcode?' + new Date().getTime(); // cache bust
        qrcodeMsg.style.display = '';
        statusDiv.style.display = 'none';
    }
}



function refreshWAQRCode() {
    fetch('/admin/api/wa/refresh-qrcode', {method: 'POST'})
        .then(() => {
            document.getElementById('wa-qrcode').src = '/admin/api/wa/qrcode?' + new Date().getTime();
        });
}
window.refreshWAQRCode = refreshWAQRCode;


function deleteWASession() {
    if (confirm('Yakin ingin menghapus sesi WhatsApp?')) {
        fetch('/admin/api/wa/delete-session', {method: 'POST'})
            .then(() => {
                alert('Session WhatsApp berhasil dihapus!');
                document.getElementById('wa-qrcode').src = '/admin/api/wa/qrcode?' + new Date().getTime();
            });
    }
}
window.deleteWASession = deleteWASession;


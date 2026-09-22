document.addEventListener('DOMContentLoaded', () => {
    const shareBtn = document.getElementById('shareBtn');
    const userIdElement = document.getElementById('userId');
    const toast = document.getElementById('toast');

    // Copiar ID al portapapeles
    shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const userIdText = userIdElement.textContent;

        navigator.clipboard.writeText(userIdText).then(() => {
            showToast('ID copiado al portapapeles');
        }).catch(err => {
            console.error('Error al copiar: ', err);
            showToast('No se pudo copiar el ID');
        });
    });

    // Notificación flotante Toast
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});
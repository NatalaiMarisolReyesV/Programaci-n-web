document.getElementById('contactForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    // 1. Limpiar errores previos
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.style.display = 'none');

    // 2. Obtener valores de los campos
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const interes = document.getElementById('interes').value;
    const privacy = document.getElementById('privacy').checked;

    let isValid = true;

    // Validación Nombre
    if (name === '') {
        document.getElementById('nameError').textContent = 'El nombre es obligatorio';
        document.getElementById('nameError').style.display = 'block';
        isValid = false;
    }

    // Validación Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === '' || !emailPattern.test(email)) {
        document.getElementById('emailError').textContent = 'Ingresa un correo electrónico válido';
        document.getElementById('emailError').style.display = 'block';
        isValid = false;
    }

    // Validación Teléfono (Mínimo 8-15 dígitos)
    const phonePattern = /^[0-9]{8,15}$/;
    if (phone === '' || !phonePattern.test(phone.replace(/\s+/g, ''))) {
        document.getElementById('phoneError').textContent = 'Ingresa un número telefónico válido';
        document.getElementById('phoneError').style.display = 'block';
        isValid = false;
    }

    // Validación Categoría
    if (interes === '') {
        document.getElementById('interesError').textContent = 'Por favor selecciona una opción';
        document.getElementById('interesError').style.display = 'block';
        isValid = false;
    }

    // Validación Políticas de privacidad
    if (!privacy) {
        document.getElementById('privacyError').textContent = 'Debes aceptar las políticas de privacidad';
        document.getElementById('privacyError').style.display = 'block';
        isValid = false;
    }

    // 3. Envío al Correo vía Formspree
    if (isValid) {
        const submitBtn = document.getElementById('btnSubmit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        // ⚠️ REEMPLAZA ESTA URL CON TU CÓDIGO DE FORMSPREE
        const FORMSPREE_ENDPOINT = 'https://formspree.io/f/TU_CODIGO_AQUI';

        const formData = new FormData(this);

        try {
            const response = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Ocultar formulario y mostrar confirmación
                document.getElementById('formCard').style.display = 'none';
                document.getElementById('successMessage').style.display = 'block';
            } else {
                throw new Error('Error al enviar');
            }
        } catch (error) {
            alert('Hubo un error al enviar tu solicitud. Inténtalo de nuevo.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Solicitar cotización';
        }
    }
});
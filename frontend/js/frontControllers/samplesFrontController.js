// Evento para el formulario de subida
const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('display_name', document.getElementById('display_name').value);
        formData.append('category', document.getElementById('category').value);
        formData.append('bpm', document.getElementById('bpm').value);
        formData.append('audioFile', document.getElementById('audioFile').files[0]);

        try {
            await apiService.request('/samples/upload', 'POST', formData, true);
            showModal('Éxito', 'Sample guardado.');
            uploadForm.reset();
            loadSamples();
        } catch (error) {
            // --- VALIDACIÓN DEL TEST 6 (Coherencia del BPM) ---
            // Verificamos si el mensaje del error del backend contiene la frase sobre el BPM
            if (error.message && error.message.includes("BPM inválido")) {
                showModal('Error al subir', 'BPM inválido. Ingrese un valor numérico correcto');
            } else {
                // Para cualquier otro tipo de error (falta de red, formato, etc.)
                showModal('Error al subir', error.message);
            }
            // ----------------------------------------------------------
        }
    });
}
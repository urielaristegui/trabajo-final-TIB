/**
 * Test 6: Subida - Coherencia del BPM (HTTP 400 Bad Request)
 * Desarrollado por: Lucas Sosa
 */
testUtils.createTestButton("Test 6: Coherencia del BPM (BPM Inválido)", async (btn) => {
    // 1. Asegurar y guardar una sesión válida de productor
    await okLogin();
    const token = localStorage.getItem('test_token');
    
    // 2. Creamos el FormData inyectando un valor ilógico
    const formData = new FormData();
    formData.append('display_name', 'Test Loop BPM Defectuoso');
    formData.append('category', 'Drums');
    formData.append('bpm', 'ciento veinte'); // <-- Forzamos el string para que falle el backend

    // Simulamos el archivo binario básico que pide la ruta
    const blob = new Blob(["Simulated Audio Content"], { type: 'audio/wav' });
    formData.append('audioFile', blob, 'DRUM_LOOP_01.wav');

    // 3. Realizamos la petición POST al backend
    const response = await fetch('/api/samples/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    const data = await response.json();
    testUtils.log(data); // Imprime la respuesta del backend en la consola de la página

    // 4. Verificación de éxito del test: Esperamos un HTTP 400 Bad Request
    // y el mensaje exacto exigido por la cátedra
    if (response.status === 400 && data.message && data.message.includes("BPM inválido")) {
        testUtils.setSuccess(btn); // El botón se pinta de verde si el backend rechazó el dato correctamente
        
        // Disparamos el modal visual de W3.CSS para cumplir con la validación de UI
        if (typeof showModal === 'function') {
            showModal('Error al subir', 'BPM inválido. Ingrese un valor numérico correcto');
        }
    }
});
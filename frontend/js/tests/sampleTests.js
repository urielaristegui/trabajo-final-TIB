/**
 * Test: GET /api/samples/my-samples
 */
testUtils.createTestButton("Test Listar Mis Samples", async (btn) => {
    // 1. Asegurar y guardar una sesión válida
    await testUtils.okLogin();
    const token = localStorage.getItem('test_token');
    
    // 2. Realizar la petición
    const response = await fetch('/api/samples/my-samples', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    testUtils.log(data);
    if (response.ok) testUtils.setSuccess(btn);
});

/**
 * Test: POST /api/samples/upload (Simulado)
 */
testUtils.createTestButton("Test Subir Sample (Simulado)", async (btn) => {
    // 1. Asegurar y guardar una sesión válida
    await testUtils.okLogin();
    const token = localStorage.getItem('test_token');
    
    // Creamos un FormData
    const formData = new FormData();
    formData.append('display_name', 'Test Loop Pedagogico');
    formData.append('category', 'Drums');
    formData.append('bpm', '120');

    // Simulamos un archivo WAV (binario vacío para la prueba)
    const blob = new Blob(["Simulated Audio Content"], { type: 'audio/wav' });
    formData.append('audioFile', blob, 'DRUM_LOOP_01.wav');

    const response = await fetch('/api/samples/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    const data = await response.json();
    testUtils.log(data);
    if (response.ok) testUtils.setSuccess(btn);
});

/**
 * Test 6: Subida - Coherencia del BPM (HTTP 400 Bad Request)
 */
testUtils.createTestButton("Test 6: Coherencia del BPM (BPM Inválido)", async (btn) => {
    await testUtils.okLogin();
    const token = localStorage.getItem('test_token');
    
    const formData = new FormData();
    formData.append('display_name', 'Test Loop BPM Defectuoso');
    formData.append('category', 'Drums');
    formData.append('bpm', 'ciento veinte'); // <-- Forzamos el error exigido por la consigna
    formData.append('audioFile', new Blob(["Audio"], { type: 'audio/wav' }), 'track.wav');

    const response = await fetch('/api/samples/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    const data = await response.json();
    testUtils.log(data);

    if (response.status === 400 && data.message?.includes("BPM inválido")) {
        testUtils.setSuccess(btn);
        if (typeof showModal === 'function') showModal('Error al subir', data.message);
    }
});
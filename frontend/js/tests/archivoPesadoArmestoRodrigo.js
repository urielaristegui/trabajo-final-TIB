// test Límite de Peso

testUtils.createTestButton("Test Límite de Peso (HTTP 413 Payload Too Large)", async (btn) => {
    // 1. Asegurar y guardar una sesión válida
    await testUtils.okLogin();
    const token = localStorage.getItem('test_token');
    
    // Creo un FormData
    const formData = new FormData();
    formData.append('display_name', 'Test Tamaño Maximo - Rodrigo');
    formData.append('category', 'Drums');
    formData.append('bpm', '120');

    // Simulo un archivo WAV de 6 MB para enviar al backend
    const TAMAÑO_6MB = 6 * 1024 * 1024;
    const dummyBuffer = new Uint8Array(TAMAÑO_6MB);
    const blob = new Blob([dummyBuffer], { type: 'audio/wav' });
    formData.append('audioFile', blob, 'DRUM_LOOP_PESADO.wav');

    const response = await fetch('/api/samples/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    const data = await response.json();
    testUtils.log(data);
    if (response.status === 413)
        testUtils.setSuccess(btn);
});

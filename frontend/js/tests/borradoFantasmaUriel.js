/**
 * Función para asegurar independencia de los tests de samples 
 * y no depender de otro test para tener un token de sesión válido
 */
 async function okLogin()
 {
    // 1. Login como productor (pepe) para obtener un token válido
     const response = await fetch('/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ username: 'pepe', password: '12345' }) // Usamos pepe hardcodeado
     });
     const data = await response.json();
     // Guardamos el token para tests de samples
     localStorage.setItem('test_token', data.token);
 }

testUtils.createTestButton("9. Eliminación - Borrado Fantasma (HTTP 404)", async (btn) => {
    //asegurar y guardar la sesion valida
    await okLogin();
    
    // 1. Buscamos en la memoria del navegador el token que guardó la función de Login (el "pase VIP").
    const token = localStorage.getItem('test_token');      

    // 2. Disparamos la petición al backend apuntando al ID 99999 (que sabemos que no existe).
    // Usamos "await" para que el código pause y espere acá hasta que el servidor responda.
    const response = await fetch('/api/samples/99999', {
        method: 'DELETE', // Indicamos que la intención es borrar
        headers: {'Authorization': `Bearer ${token}`}  // Mandamos el token en los encabezados para que el backend sepa que estamos autenticados
    });

    // 3. Intentamos procesar el cuerpo de lo que nos contestó el servidor.
   const data = await response.json();
    testUtils.log(data);

    // 4. Evaluar el resultado
    if (response.status === 404) 
        testUtils.setSuccess(btn);      //pinta el boton verde
});
/**
* Project     : Sample Vault
* Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
* License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
*/

// Al cargar la página, traer los samples del usuario
document.addEventListener('DOMContentLoaded', loadSamples);

async function loadSamples() {
    try {
        // Se agrega el parámetro token (true) si apiService lo requiere para rutas protegidas
        const samples = await apiService.request('/samples/my-samples', 'GET', null, true);
        renderSamplesTable(samples);
    } catch (error) {
        showModal('Error', 'No se pudieron cargar los samples: ' + error.message);
    }
}

function renderSamplesTable(samples) {
    // Intentamos buscar el ID original o la clase CSS que tenga tu tabla en el HTML
    const tbody = document.getElementById('samplesTableBody') || document.querySelector('table tbody');
    if (!tbody) return;

    tbody.replaceChildren(); // Limpia el contenido de forma eficiente

    if (samples.length === 0) {
        const rowEmpty = document.createElement('tr');
        rowEmpty.innerHTML = `<td colspan="5" style="text-align:center;">No hay samples en tu biblioteca</td></tr>`;
        tbody.appendChild(rowEmpty);
        return;
    }

    samples.forEach(s => {
        const row = document.createElement('tr');

        // Celda Nombre
        const tdName = document.createElement('td');
        tdName.textContent = s.display_name;
        
        // Celda Categoría
        const tdCat = document.createElement('td');
        const spanCat = document.createElement('span');
        spanCat.className = 'badge bg-secondary w3-tag w3-round w3-black'; // Soporta ambos estilos
        spanCat.textContent = s.category;
        tdCat.appendChild(spanCat);

        // Celda BPM
        const tdBpm = document.createElement('td');
        tdBpm.textContent = s.bpm || '-';

        // Celda Audio (Reproductor)
        const tdAudio = document.createElement('td');
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.style.height = '30px';
        audio.style.width = '180px';
        const source = document.createElement('source');
        // Usamos ruta relativa o absoluta según el entorno
        source.src = s.file_path.startsWith('http') ? s.file_path : `http://localhost:3000${s.file_path}`;
        source.type = 'audio/mpeg';
        audio.appendChild(source);
        tdAudio.appendChild(audio);

        // Celda Acciones
        const tdActions = document.createElement('td');
        const btnDelete = document.createElement('button');
        btnDelete.className = 'btn btn-danger btn-sm w3-button w3-red w3-tiny w3-round';
        btnDelete.textContent = 'Borrar';
        btnDelete.addEventListener('click', () => deleteSample(s.id));
        tdActions.appendChild(btnDelete);

        // Armar fila
        row.append(tdName, tdCat, tdBpm, tdAudio, tdActions);
        tbody.appendChild(row);
    });
}
//validacion del modal borrado(ya estaba hecha pero debo entenderlo)
async function deleteSample(id) {
    if (!confirm('¿Estás seguro de eliminar este sonido?')) return;
    try {
        await apiService.request(`/samples/${id}`, 'DELETE');
        showModal('Eliminado', 'El registro ya fue eliminado.');
        loadSamples();
    } catch (error) {
        showModal('ERROR: El registro no existe o ya fue eliminado', error.message);
    }
}

// Evento para el formulario de subida
const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        /* Validacion en el frontend: Primero capturo el archivo en el frontend y analizo si el 
           archivo es pesado para evitar ir al backend. Si el usuario manipula el frontend para 
           saltearse esta validación, igualmente voy a tener la validación del backend
        */
        const audioFileInput = document.getElementById('audioFile');
        const file = audioFileInput.files[0];

        if (file) {
            const MAX_SIZE_BYTES = 5 * 1024 * 1024;
            if (file.size > MAX_SIZE_BYTES) {
                showModal('Archivo muy pesado', 'El archivo supera el límite de tamaño permitido');
                return; // Corta la ejecución, no se crea el FormData ni se envía nada al servidor
            }
        }


        const formData = new FormData();
        formData.append('display_name', document.getElementById('display_name').value);
        formData.append('category', document.getElementById('category').value);
        formData.append('bpm', document.getElementById('bpm').value);
        formData.append('audioFile', document.getElementById('audioFile').files[0]);

        try {
            await apiService.request('/samples/upload', 'POST', formData, true);
            showModal('Éxito', 'Sample guardado.');
            uploadForm.reset();
            loadSamples(); // Ahora sí va a ejecutar de forma segura la función base
        } catch (error) {
            // --- VALIDACIÓN DEL TEST 6 (Coherencia del BPM) ---
            if (error.message && error.message.includes("BPM inválido")) {
                showModal('Error al subir', 'BPM inválido. Ingrese un valor numérico correcto');
            } else {
                showModal('Error al subir', error.message);
            }
            // --------------------------------------------------
            /* Si el error fue por el tamaño, el modal mostrará ese mensaje, con ese título. 
               Si no, mostrará un título y mensaje de error genéricos.
            */
            if (error.message === 'El archivo supera el límite de tamaño permitido') {
                showModal('Archivo muy pesado', error.message);
            } else {
                // Para cualquier otro error inesperado (como el 500)
                showModal('Error al subir', error.message);
            }
        }
    });
}
// Variables en camelCase según estándares del grupo
const formDeportes = document.getElementById('formularioDeportes');
const inputNombre = document.getElementById('nombre');
const inputOrden = document.getElementById('orden');
const inputValor = document.getElementById('valor');
const tablaDeportes = document.getElementById('tablaDeportes').querySelector('tbody');

const urlBackend = 'http://localhost:3000';

// Cargar deportes al iniciar
document.addEventListener('DOMContentLoaded', cargarDeportes);

// Enviar formulario
formDeportes.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const item = inputNombre.value.trim();
    const posicion = parseInt(inputOrden.value);
    const valor = parseInt(inputValor.value);
    
    if (!item || !posicion || !valor) {
        alert('Completa todos los campos');
        return;
    }
    
    try {
        const respuesta = await fetch(`${urlBackend}/api/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item, posicion, valor })
        });
        
        const data = await respuesta.json();
        
        if (data.status === 'success') {
            alert(data.mensaje);
            formDeportes.reset();
            cargarDeportes();
        } else {
            alert('Error: ' + data.mensaje);
        }
    } catch (error) {
        console.error('Error en registro:', error);
        alert('Error de conexión con el servidor');
    }
});

// Cargar lista de deportes
async function cargarDeportes() {
    try {
        const respuesta = await fetch(`${urlBackend}/api/listar`);
        const deportes = await respuesta.json();
        
        tablaDeportes.innerHTML = '';
        deportes.forEach(deporte => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${deporte.posicion}</td>
                <td>${deporte.item}</td>
                <td>${deporte.valor}</td>
            `;
            tablaDeportes.appendChild(fila);
        });
    } catch (error) {
        console.error('Error al cargar deportes:', error);
    }
}

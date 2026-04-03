async function cargarDeportes() {
  const resp = await fetch('/deportes');
  const datos = await resp.json();
  const tbody = document.querySelector('#tabla tbody');
  tbody.innerHTML = '';
  datos.forEach(d => {
    const fila = document.createElement('tr');
    fila.innerHTML = `<td>${d.nombre}</td><td>${d.orden}</td><td>${d.valor}</td>`;
    tbody.appendChild(fila);
  });
}

document.getElementById('formulario').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const orden = parseInt(document.getElementById('orden').value, 10);
  const valor = parseInt(document.getElementById('valor').value, 10);

  if (!nombre) {
    document.getElementById('mensaje').textContent = 'Ingrese un nombre';
    return;
  }

  const resp = await fetch('/registrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, orden, valor })
  });

  const data = await resp.json();
  document.getElementById('mensaje').textContent = data.mensaje;

  if (data.ok) {
    document.getElementById('formulario').reset();
    cargarDeportes();
  }
});

document.addEventListener('DOMContentLoaded', cargarDeportes);

const formBase         = document.getElementById('formBase');
const btnRegistrarBase = document.getElementById('btnRegistrarBase');
const mensajeBase      = document.getElementById('mensajeBase');

const formRegistro    = document.getElementById('formRegistro');
const itemInput       = document.getElementById('item');
const posInput        = document.getElementById('pos');
const valorInput      = document.getElementById('valor');
const btnRegistrar    = document.getElementById('btnRegistrar');
const mensajeRegistro = document.getElementById('mensajeRegistro');

const formVerificar         = document.getElementById('formVerificar');
const buscarItemInput       = document.getElementById('buscarItem');
const btnVerificar          = document.getElementById('btnVerificar');
const resultadoVerificacion = document.getElementById('resultadoVerificacion');

const btnMostrarLista = document.getElementById('btnMostrarLista');
const tablaDeportes   = document.getElementById('tablaDeportes');
const contenedorTabla = document.getElementById('contenedorTabla');

const panelRegistro  = document.getElementById('panel-registro');
const panelVerificar = document.getElementById('panel-verificar');
const panelLista     = document.getElementById('panel-lista');

let listaVisible = false;

function setSistemaHabilitado(habilitado) {
  panelRegistro.classList.toggle('bloqueado', !habilitado);
  panelVerificar.classList.toggle('bloqueado', !habilitado);
  panelLista.classList.toggle('bloqueado', !habilitado);

  itemInput.disabled       = !habilitado;
  posInput.disabled        = !habilitado;
  valorInput.disabled      = !habilitado;
  btnRegistrar.disabled    = !habilitado;
  buscarItemInput.disabled = !habilitado;
  btnVerificar.disabled    = !habilitado;
  btnMostrarLista.disabled = !habilitado;
}

function renderizarTabla(items) {
  tablaDeportes.innerHTML = '';

  if (!items.length) {
    tablaDeportes.innerHTML = `
      <tr><td colspan="3">No hay deportes registrados.</td></tr>
    `;
    return;
  }

  items.forEach(item => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${item.item}</td>
      <td>${item.posicion}</td>
      <td>${item.valor}</td>
    `;
    tablaDeportes.appendChild(fila);
  });
}

async function cargarLista() {
  try {
    const res  = await fetch('/api/items');
    const data = await res.json();
    renderizarTabla(data);
  } catch (error) {
    console.error(error);
    alert('No se pudo cargar la lista.');
  }
}

async function verificarBaseRegistrada() {
  try {
    const res  = await fetch('/api/items/posicion/1');
    const data = await res.json();

    if (data.existe) {
      setSistemaHabilitado(true);
      btnRegistrarBase.disabled = true;
      mensajeBase.textContent   = 'El elemento base ya está registrado.';
    } else {
      setSistemaHabilitado(false);
      btnRegistrarBase.disabled = false;
      mensajeBase.textContent   = 'Primero registre el elemento base.';
    }
  } catch (error) {
    console.error(error);
    setSistemaHabilitado(false);
    mensajeBase.textContent = 'No se pudo verificar el elemento base.';
  }
}

formBase.addEventListener('submit', async (e) => {
  e.preventDefault();
  const item  = document.getElementById('baseItem').value.trim();
  const valor = Number(document.getElementById('baseValor').value);

  const res = await fetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item, posicion: 1, valor })
  });
  const data = await res.json();

  if (!res.ok) {
    mensajeBase.textContent = data.error;
    return;
  }
  mensajeBase.textContent   = 'Elemento base registrado correctamente.';
  btnRegistrarBase.disabled = true;
  setSistemaHabilitado(true);
});

formRegistro.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensajeRegistro.textContent = '';

  const item     = itemInput.value.trim();
  const posicion = Number(posInput.value);
  const valor    = Number(valorInput.value);

  try {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item, posicion, valor })
    });
    const data = await res.json();

    if (!res.ok) {
      mensajeRegistro.textContent = data.error || 'No se pudo registrar el deporte.';
      return;
    }

    mensajeRegistro.textContent =
      `Registrado: ${data.datos.item} | Posición: ${data.datos.posicion} | Valor: ${data.datos.valor}`;
    formRegistro.reset();
  } catch (error) {
    console.error(error);
    mensajeRegistro.textContent = 'Error al registrar el deporte.';
  }
});

formVerificar.addEventListener('submit', async (e) => {
  e.preventDefault();
  resultadoVerificacion.textContent = '';

  const item = buscarItemInput.value.trim();
  if (!item) {
    resultadoVerificacion.textContent = 'Ingrese un deporte.';
    return;
  }

  try {
    const res  = await fetch(`/api/items/existe/${encodeURIComponent(item)}`);
    const data = await res.json();

    resultadoVerificacion.textContent = data.existe
      ? `Sí existe: ${data.datos.item} | Posición: ${data.datos.posicion} | Valor: ${data.datos.valor}`
      : 'No existe en la lista.';
  } catch (error) {
    console.error(error);
    resultadoVerificacion.textContent = 'Error al verificar existencia.';
  }
});

btnMostrarLista.addEventListener('click', async () => {
  if (listaVisible) {
    contenedorTabla.style.display = 'none';
    tablaDeportes.innerHTML       = '';
    btnMostrarLista.textContent   = 'Mostrar lista';
    listaVisible = false;
    return;
  }

  await cargarLista();
  contenedorTabla.style.display = 'block';
  btnMostrarLista.textContent   = 'Ocultar lista';
  listaVisible = true;
});

(async () => {
  tablaDeportes.innerHTML       = '';
  contenedorTabla.style.display = 'none';
  btnMostrarLista.textContent   = 'Mostrar lista';
  listaVisible = false;

  await verificarBaseRegistrada();
})();
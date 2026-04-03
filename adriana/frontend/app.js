const urlBase = "http://localhost:3000";

function mostrarMensaje(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.className = "mensaje " + tipo;
}

function ocultarMensaje(elemento) {
    elemento.className = "mensaje oculto";
    elemento.textContent = "";
}

const inputNombre = document.getElementById("inputNombre");
const inputCosto = document.getElementById("inputCosto");
const btnRegistrar = document.getElementById("btnRegistrar");
const mensajeRegistrar = document.getElementById("mensajeRegistrar");

btnRegistrar.addEventListener("click", async () => {
    const nombre = inputNombre.value.trim();
    const costo = Number(inputCosto.value);

    if (!nombre) {
        mostrarMensaje(mensajeRegistrar, "Falta el nombre del deporte.", "error");
        return;
    }
    if (!inputCosto.value || isNaN(costo) || costo < 0) {
        mostrarMensaje(mensajeRegistrar, "El costo tiene que ser un numero valido.", "error");
        return;
    }

    btnRegistrar.disabled = true;
    ocultarMensaje(mensajeRegistrar);

    try {
        const respuesta = await fetch(urlBase + "/deportes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, costo }),
        });

        const texto = await respuesta.text();

        if (respuesta.ok) {
            mostrarMensaje(mensajeRegistrar, "Deporte registrado correctamente.", "exito");
            inputNombre.value = "";
            inputCosto.value = "";
        } else {
            mostrarMensaje(mensajeRegistrar, texto, "error");
        }
    } catch (err) {
        mostrarMensaje(mensajeRegistrar, "No se pudo conectar con el servidor.", "error");
    } finally {
        btnRegistrar.disabled = false;
    }
});

const btnLista = document.getElementById("btnLista");
const contenedorLista = document.getElementById("contenedorLista");
const cuerpoTabla = document.getElementById("cuerpoTabla");
const mensajeLista = document.getElementById("mensajeLista");

btnLista.addEventListener("click", async () => {
    btnLista.disabled = true;
    ocultarMensaje(mensajeLista);
    contenedorLista.classList.add("oculto");
    cuerpoTabla.innerHTML = "";

    try {
        const respuesta = await fetch(urlBase + "/deportes");

        if (!respuesta.ok) {
            mostrarMensaje(mensajeLista, "No se pudo cargar la lista.", "error");
            return;
        }

        const deportes = await respuesta.json();

        if (deportes.length === 0) {
            mostrarMensaje(mensajeLista, "Todavia no hay deportes registrados.", "error");
            return;
        }

        deportes.forEach((deporte) => {
            const fila = document.createElement("tr");
            fila.className = "tabla-fila";

            const celdaPos = document.createElement("td");
            celdaPos.className = "tabla-pos";
            celdaPos.textContent = deporte.posicion;

            const celdaNombre = document.createElement("td");
            celdaNombre.className = "tabla-nombre";
            celdaNombre.textContent = deporte.nombre;

            const celdaCosto = document.createElement("td");
            celdaCosto.className = "tabla-costo";
            celdaCosto.textContent = deporte.costo;

            fila.appendChild(celdaPos);
            fila.appendChild(celdaNombre);
            fila.appendChild(celdaCosto);
            cuerpoTabla.appendChild(fila);
        });

        contenedorLista.classList.remove("oculto");
    } catch (err) {
        mostrarMensaje(mensajeLista, "No se pudo conectar con el servidor.", "error");
    } finally {
        btnLista.disabled = false;
    }
});
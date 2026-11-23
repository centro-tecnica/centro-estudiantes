window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("pantalla-inicio").classList.add("oculto");
  }, 2000); 
});


document.querySelectorAll(".slider").forEach((slider) => {
  const pista = slider.querySelector(".slider-pista");
  const fotos = slider.querySelectorAll(".slider-pista > img, .slider-pista > video");
  const btnPrev = slider.querySelector(".prev");
  const btnNext = slider.querySelector(".next");
  const cajaPuntos = slider.querySelector(".slider-puntos");
  const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let actual = 0;
  let timer;

  
  fotos.forEach((_, i) => {
    const punto = document.createElement("button");
    punto.type = "button";
    punto.className = "punto";
    punto.setAttribute("aria-label", `Ir a la foto ${i + 1}`);
    punto.addEventListener("click", () => { ir(i); reiniciar(); });
    cajaPuntos.appendChild(punto);
  });
  const puntos = cajaPuntos.querySelectorAll(".punto");

  function ir(n) {
    actual = (n + fotos.length) % fotos.length;
    pista.style.transform = `translateX(-${actual * 100}%)`;
    puntos.forEach((p, i) => p.classList.toggle("activo", i === actual));
  }

  function iniciar() {
    if (reducirMovimiento) return;
    timer = setInterval(() => ir(actual + 1), 5000); 
  }

  function reiniciar() {
    clearInterval(timer);
    iniciar();
  }

  btnPrev.addEventListener("click", () => { ir(actual - 1); reiniciar(); });
  btnNext.addEventListener("click", () => { ir(actual + 1); reiniciar(); });

  
  slider.addEventListener("mouseenter", () => clearInterval(timer));
  slider.addEventListener("mouseleave", reiniciar);

  
  let inicioX = null;
  pista.addEventListener("touchstart", (e) => {
    inicioX = e.touches[0].clientX;
  }, { passive: true });

  pista.addEventListener("touchend", (e) => {
    if (inicioX === null) return;
    const diferencia = e.changedTouches[0].clientX - inicioX;
    if (Math.abs(diferencia) > 40) {
      ir(actual + (diferencia < 0 ? 1 : -1));
      reiniciar();
    }
    inicioX = null;
  });

  ir(0);
  iniciar();
});
document.documentElement.classList.add("js");

const elementosAnimados = document.querySelectorAll(
  ".tarjeta, .seccion h2, .seccion > p, .frase"
);

elementosAnimados.forEach((el) => {
  el.classList.add("reveal");


  const hermanos = [...el.parentElement.children];
  el.style.setProperty("--delay", `${(hermanos.indexOf(el) % 3) * 0.15}s`);
});

const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add("visible");
      observador.unobserve(entrada.target); 
    }
  });
}, { threshold: 0.15 });

elementosAnimados.forEach((el) => observador.observe(el));
const textosPortada = document.querySelectorAll(
  ".portada h1, .portada > div > p, .frase h2, .frase h3"
);

let retraso = 0.3; 

textosPortada.forEach((el) => {
  const texto = el.textContent.trim();
  el.textContent = "";

  texto.split(" ").forEach((palabra, i, lista) => {
    const spanPalabra = document.createElement("span");
    spanPalabra.className = "palabra";

    [...palabra].forEach((letra) => {
      const spanLetra = document.createElement("span");
      spanLetra.className = "letra";
      spanLetra.textContent = letra;
      spanLetra.style.animationDelay = `${retraso}s`;
      retraso += 0.04;
      spanPalabra.appendChild(spanLetra);
    });

    el.appendChild(spanPalabra);
    if (i < lista.length - 1) el.appendChild(document.createTextNode(" "));
  });

  retraso += 0.25; 
});
const formulario = document.querySelector(".formulario");

if (formulario) {
  const btn = document.getElementById("btn-enviar");
  const estado = document.getElementById("estado");
  const mensaje = document.getElementById("mensaje");
  const contador = document.getElementById("contador");

  function mostrarEstado(texto, tipo) {
    estado.textContent = texto;
    estado.className = `estado ${tipo} visible`;
  }

  // Contador de caracteres
  mensaje.addEventListener("input", () => {
    contador.textContent = `${mensaje.value.length} / ${mensaje.maxLength}`;
  });

  // Quitar el borde rojo cuando la persona corrige
  formulario.querySelectorAll("input, textarea, select").forEach((campo) => {
    campo.addEventListener("input", () => campo.classList.remove("error"));
  });

  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validación: marca en rojo los campos obligatorios vacíos
    let valido = true;
    formulario.querySelectorAll("[required]").forEach((campo) => {
      if (!campo.value.trim()) {
        campo.classList.add("error");
        valido = false;
      }
    });

    if (!valido) {
      mostrarEstado("Completá los campos obligatorios.", "error");
      return;
    }

   
    btn.disabled = true;
    btn.textContent = "Enviando...";
    estado.className = "estado";
    estado.textContent = "";

    try {
      const respuesta = await fetch(formulario.action, {
        method: "POST",
        body: new FormData(formulario),
        headers: { Accept: "application/json" }
      });

      if (respuesta.ok) {
        formulario.reset();
        contador.textContent = `0 / ${mensaje.maxLength}`;
        mostrarEstado("¡Gracias! Recibimos tu mensaje.", "ok");
      } else {
        throw new Error("Error del servidor");
      }
    } catch (err) {
      mostrarEstado("No se pudo enviar. Probá de nuevo en un rato.", "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Enviar";
    }
  });
}

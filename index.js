function renderizar(top100) {
  let canvas = document.getElementById("nubePalabras");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "nubePalabras";
    canvas.width = 800;
    canvas.height = 400;
    console.log(canvas);
    document.getElementById("centrar-input").appendChild(canvas);
  }

  const palabrasFormateadas = top100.map(([palabra, frecuencia]) => [
    palabra,
    frecuencia,
  ]);

  WordCloud(canvas, {
    list: palabrasFormateadas,
    gridSize: Math.round(800 / 50),
    weightFactor: 3,
    fontFamily: "Impact",
    color: () => `hsl(${Math.random() * 360}, 100%, 70%)`,
    backgroundColor: "#222",
    rotateRatio: 0.1,
    minRotation: -Math.PI / 4,
    maxRotation: Math.PI / 4,
    drawOutOfBound: false,
  });
  document.getElementById("fileInput").style.display = "none";
  document.querySelector("label[for='fileInput']").style.display = "none";
}

function topPalabrasUsadas(mensajes, top = 100) {
  const stopwords = new Set([
    "a",
    "de",
    "la",
    "el",
    "y",
    "en",
    "que",
    "los",
    "las",
    "un",
    "una",
    "con",
    "por",
    "para",
    "es",
    "al",
    "lo",
    "del",
    "se",
    "me",
    "te",
    "mi",
    "tu",
    "su",
    "ya",
    "o",
    "no",
    "si",
    "como",
    "pero",
    "omitted",
    "image",
    "audio",
    "voice",
    "missed",
    "call",
    "le",
    "this",
    "message",
    "was",
    "deleted",
    "sticker",
    "waiting",
    "for",
    "this",
    "may",
    "take",
    "while",
    "video",
    "tap",
    "call",
    "back",
    "to",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ]);
  const texto = mensajes.join(" ").toLowerCase();

  const palabras = texto
    .replace(/[^\w\sáéíóúñü]/gi, "") // quitar puntuación
    .split(/\s+/); // separar por espacios

  const frecuencias = {};

  for (const palabra of palabras) {
    if (palabra === "" || stopwords.has(palabra)) continue;
    frecuencias[palabra] = (frecuencias[palabra] || 0) + 1;
  }

  // Convertir a array y ordenar por frecuencia descendente
  const palabrasOrdenadas = Object.entries(frecuencias)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top);

  return palabrasOrdenadas;
}

function obtenerSoloMensajes(texto) {
  const lineas = texto.split("\n");
  const mensajes = [];

  for (const linea of lineas) {
    const partes = linea.split(":");

    if (partes.length >= 3) {
      const mensaje = partes.slice(3).join(":").trim();
      mensajes.push(mensaje);
    }
  }

  return mensajes;
}

document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("fileInput");

  fileInput.addEventListener("change", function (event) {
    const archivo = event.target.files[0];

    if (!archivo) {
      alert("No se seleccionó ningún archivo.");
      return;
    }

    const reader = new FileReader();

    if (archivo.name.endsWith(".txt")) {
      reader.onload = function (e) {
        const contenido = e.target.result;
        mensajes = obtenerSoloMensajes(contenido);
        const top100 = topPalabrasUsadas(mensajes);
        renderizar(top100);
        console.log("Top 10 palabras más usadas:");
        top10.forEach(([palabra, frecuencia], index) => {
          console.log(`${index + 1}. ${palabra} - ${frecuencia} veces`);
        });
      };

      reader.readAsText(archivo);
    } else if (archivo.name.endsWith(".zip")) {
      reader.onload = function (e) {
        JSZip.loadAsync(e.target.result)
          .then(function (zip) {
            const nombreTxt = Object.keys(zip.files).find((nombre) =>
              nombre.endsWith(".txt")
            );

            if (nombreTxt) {
              zip.files[nombreTxt]
                .async("string")
                .then(function (contenidoTxt) {
                  mensajes = obtenerSoloMensajes(contenidoTxt);
                  const top100 = topPalabrasUsadas(mensajes);
                  renderizar(top100);
                  console.log("Top 10 palabras más usadas:");
                  top100.forEach(([palabra, frecuencia], index) => {
                    console.log(
                      `${index + 1}. ${palabra} - ${frecuencia} veces`
                    );
                  });
                });
            } else {
              alert("No se encontró ningún archivo .txt dentro del .zip.");
            }
          })
          .catch((err) => {
            alert("Error al leer el archivo ZIP:", err);
          });
      };

      reader.readAsArrayBuffer(archivo);
    } else {
      alert("Por favor subí un archivo .txt o .zip.");
    }
  });
});

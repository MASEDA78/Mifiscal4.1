document.addEventListener("DOMContentLoaded", () => {
  const sesionActiva = localStorage.getItem("sesionActiva");
  if (sesionActiva === "true") {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("home").style.display = "block";
  }
});

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const loginError = document.getElementById("loginError");

  if (username === "fiscalweb" && password === "FW2025") {
    localStorage.setItem("sesionActiva", "true");
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("home").style.display = "block";
    loginError.innerText = "";
  } else {
    loginError.innerText = "❌ Usuario o clave incorrecta";
  }
}

function logout() {
  localStorage.removeItem("sesionActiva");
  document.getElementById("home").style.display = "none";
  document.getElementById("loginScreen").style.display = "block";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
}

function showForm() {
  document.getElementById("home").style.display = "none";
  document.getElementById("iframeView").style.display = "none";
  document.getElementById("voteForm").style.display = "block";
  document.getElementById("resumen").innerText = "";
}

function goHome() {
  document.getElementById("home").style.display = "block";
  document.getElementById("iframeView").style.display = "none";
  document.getElementById("voteForm").style.display = "none";
  document.getElementById("iframeBox").src = "";
}

function openIframe(url) {
  document.getElementById("home").style.display = "none";
  document.getElementById("voteForm").style.display = "none";
  document.getElementById("iframeView").style.display = "block";
  document.getElementById("iframeBox").src = url;
}

function obtenerDatos() {
  const fiscal = document.getElementById("fiscal").value.trim();
  const mesa = document.getElementById("mesa").value.trim();
  const padron = parseInt(document.getElementById("padron").value) || 0;
  const cand1 = parseInt(document.getElementById("cand1").value) || 0;
  const cand2 = parseInt(document.getElementById("cand2").value) || 0;
  const blanco = parseInt(document.getElementById("blanco").value) || 0;

  const validos = cand1 + cand2;
  const total = validos + blanco;

  const porcentaje = (votos) => validos > 0 ? ((votos / validos) * 100).toFixed(2) + "%" : "–";
  const participacion = padron > 0 ? ((total / padron) * 100).toFixed(2) + "%" : "–";

  const resumen = `🗳️ Fiscal: ${fiscal}
Mesa: ${mesa}
Electores habilitados: ${padron}

1️⃣ FUERZA PATRIA – Jorge Taiana: ${cand1} votos (${porcentaje(cand1)})
2️⃣ LA LIBERTAD AVANZA – Diego Santilli: ${cand2} votos (${porcentaje(cand2)})

🟦 Blanco: ${blanco}

✅ Votos válidos: ${validos}
📊 Total votos emitidos: ${total}
📈 Participación: ${participacion}`;

  return { fiscal, mesa, padron, cand1, cand2, blanco, validos, total, resumen };
}

function verificarResultados() {
  const { fiscal, mesa, padron, total } = obtenerDatos();
  if (!fiscal || !mesa) {
    alert("⚠️ Debes completar los campos Fiscal y Mesa.");
    return false;
  }
  if (total > padron) {
    alert("⚠️ Error: El total de votos supera la cantidad de electores habilitados.");
    return false;
  }
  if (total === 0) {
    alert("⚠️ No hay votos ingresados.");
    return false;
  }
  return true;
}

function copiarAlPortapapeles() {
  if (!verificarResultados()) return;
  const { resumen } = obtenerDatos();
  navigator.clipboard.writeText(resumen).then(() => {
    document.getElementById("resumen").innerText = resumen;
    alert("Resumen copiado al portapapeles.");
  });
}

function enviarWhatsApp() {
  if (!verificarResultados()) return;
  const { resumen } = obtenerDatos();
  const mensaje = encodeURIComponent(resumen);
  const numero = "5491168650195";
  const url = `https://wa.me

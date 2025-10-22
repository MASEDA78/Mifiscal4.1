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
  const nulo = parseInt(document.getElementById("nulo").value) || 0;
  const recurrido = parseInt(document.getElementById("recurrido").value) || 0;

  const validos = cand1 + cand2;
  const total = validos + blanco + nulo + recurrido;

  const porcentaje = (votos) => validos > 0 ? ((votos / validos) * 100).toFixed(2) + "%" : "–";
  const participacion = padron > 0 ? ((total / padron) * 100).toFixed(2) + "%" : "–";

  const resumen = `🗳️ Fiscal: ${fiscal}
Mesa: ${mesa}
Electores habilitados: ${padron}

1️⃣ FUERZA PATRIA – Jorge Taiana: ${cand1} votos (${porcentaje(cand1)})
2️⃣ LA LIBERTAD AVANZA – Diego Santilli: ${cand2} votos (${porcentaje(cand2)})

🟦 Blanco: ${blanco}
🟥 Nulo: ${nulo}
🟨 Recurrido: ${recurrido}

✅ Votos válidos: ${validos}
📊 Total votos emitidos: ${total}
📈 Participación: ${participacion}`;

  return { fiscal, mesa, padron, cand1, cand2, blanco, nulo, recurrido, validos, total, resumen };
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
  const url = `https://wa.me/${numero}?text=${mensaje}`;
  window.open(url, "_blank");

  document.querySelectorAll("#voteForm input").forEach(input => input.value = "");
  document.getElementById("resumen").innerText = "";

  const botonInformar = document.querySelector("button[onclick='showForm()']");
  if (botonInformar) {
    botonInformar.style.display = "none";
    const aviso = document.createElement("div");
    aviso.innerText = "✅ Voto informado. El botón estará disponible nuevamente en 1 minuto.";
    aviso.style.color = "#007bff";
    aviso.style.marginTop = "10px";
    aviso.style.fontWeight = "bold";
    botonInformar.parentNode.insertBefore(aviso, botonInformar);

    setTimeout(() => {
      botonInformar.style.display = "block";
      aviso.remove();
    }, 60000);
  }
}

function descargarPDF() {
  if (!verificarResultados()) return;
  const { fiscal, mesa, resumen } = obtenerDatos();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Acta de Fiscalización – Elecciones 2025", 20, 20);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(resumen, 170);
  doc.text(lines, 20, 35);

  const fecha = new Date().toLocaleString();
  const pageHeight = doc.internal.pageSize.height;
  doc.text(`Fecha y hora: ${fecha}`, 20, pageHeight - 20);

  const qrText = `Acta de Fiscalización – Elecciones 2025 COMANDO ELECTORAL PJ`;
  doc.addImage(generateQR(qrText), "PNG", 150, pageHeight - 50, 40, 40);

  const nombreArchivo = `Acta_Mesa_${mesa}_${fiscal.replace(/\s+/g, "_")}.pdf`;
  doc.save(nombreArchivo);
}

function generateQR(texto) {
  const canvas = document.createElement("canvas");
  new QRious({
    element: canvas,
    value: texto,
    size: 150,
    level: "H"
  });
  return canvas.toDataURL("image/png");
}

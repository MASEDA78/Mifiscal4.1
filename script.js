// ==========================
// NAVEGACIÓN ENTRE VISTAS
// ==========================
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

// ==========================
// OBTENER DATOS DEL FORMULARIO
// ==========================
function obtenerDatos() {
  const fiscal = document.getElementById("fiscal").value.trim();
  const mesa = document.getElementById("mesa").value.trim();
  const padron = parseInt(document.getElementById("padron").value) || 0;
  const cand1 = parseInt(document.getElementById("cand1").value) || 0;
  const cand2 = parseInt(document.getElementById("cand2").value) || 0;
  const cand3 = parseInt(document.getElementById("cand3").value) || 0;
  const cand4 = parseInt(document.getElementById("cand4").value) || 0;
  const blanco = parseInt(document.getElementById("blanco").value) || 0;
  const nulo = parseInt(document.getElementById("nulo").value) || 0;
  const impugnado = parseInt(document.getElementById("impugnado").value) || 0;

  const validos = cand1 + cand2 + cand3 + cand4;
  const total = validos + blanco + nulo + impugnado;

  // Porcentaje sobre válidos
  const porcentaje = (votos) => validos > 0 ? ((votos / validos) * 100).toFixed(2) + "%" : "–";

  // Participación (total sobre padrón)
  const participacion = padron > 0 ? ((total / padron) * 100).toFixed(2) + "%" : "–";

  const resumen = `🗳️ Fiscal: ${fiscal}
Mesa: ${mesa}
Electores habilitados: ${padron}

1️⃣ FUERZA PATRIA – ${cand1} votos (${porcentaje(cand1)})
2️⃣ SOMOS BUENOS AIRES – ${cand2} votos (${porcentaje(cand2)})
3️⃣ LLA-PRO – ${cand3} votos (${porcentaje(cand3)})
4️⃣ UNION LIBERAL – ${cand4} votos (${porcentaje(cand4)})

🟦 Blanco: ${blanco}
❌ Nulos: ${nulo}
⚠️ Impugnados: ${impugnado}

✅ Votos válidos: ${validos}
📊 Total votos emitidos: ${total}
📈 Participación: ${participacion}`;

  return { fiscal, mesa, padron, cand1, cand2, cand3, cand4, blanco, nulo, impugnado, validos, total, resumen };
}

// ==========================
// VERIFICAR RESULTADOS
// ==========================
function verificarResultados() {
  const { padron, total } = obtenerDatos();
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

// ==========================
// COPIAR AL PORTAPAPELES
// ==========================
function copiarAlPortapapeles() {
  if (!verificarResultados()) return;
  const { resumen } = obtenerDatos();
  navigator.clipboard.writeText(resumen).then(() => {
    document.getElementById("resumen").innerText = resumen;
    alert("Resumen copiado al portapapeles.");
  });
}

// ==========================
// ENVIAR POR WHATSAPP
// ==========================
function enviarWhatsApp() {
  if (!verificarResultados()) return;
  const { resumen } = obtenerDatos();
  const mensaje = encodeURIComponent(resumen);
  const numero = "5491168650195"; // Número internacional
  const url = `https://wa.me/${numero}?text=${mensaje}`;
  window.open(url, "_blank");

  // Limpiar campos numéricos
  document.querySelectorAll("#voteForm input[type='number']").forEach(input => input.value = 0);
  document.getElementById("resumen").innerText = "";

  // Ocultar botón por 1 minuto
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

// ==========================
// DESCARGAR ACTA EN PDF
// ==========================
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

  // Agregar QR
  const qrText = `Acta de Fiscalización – Elecciones 2025 COMANDO ELECTORAL PJ`;
  const pageHeight = doc.internal.pageSize.height;
  doc.addImage(generateQR(qrText), "PNG", 150, pageHeight - 50, 40, 40);

  const nombreArchivo = `Acta_Mesa_${mesa}_${fiscal.replace(/\s+/g, "_")}.pdf`;
  doc.save(nombreArchivo);
}

// ==========================
// GENERAR QR
// ==========================
function generateQR(texto) {
  const canvas = document.createElement("canvas");
  const qr = new QRious({
    element: canvas,
    value: texto,
    size: 150,
    level: "H"
  });
  return canvas.toDataURL("image/png");
}

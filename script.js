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
  const cand3 = parseInt(document.getElementById("cand3").value) || 0;
  const cand4 = parseInt(document.getElementById("cand4").value) || 0;
  const blanco = parseInt(document.getElementById("blanco").value) || 0;
 
  const validos = cand1 + cand2 + cand3 + cand4;
  const total = validos + blanco ;

  const porcentaje = (votos) => padron > 0 ? ((votos / validos) * 100).toFixed(2) + "%" : "–";

  const resumen = `🗳️ Fiscal: ${fiscal}
Mesa: ${mesa}
Electores habilitados: ${padron}

1️⃣ FUERZA PATRIA – ${cand1} votos (${porcentaje(cand1)})
2️⃣ SOMOS BUENOS AIRES – ${cand2} votos (${porcentaje(cand2)})
3️⃣ LLA-PRO – ${cand3} votos (${porcentaje(cand3)})
4️⃣ UNION LIBERAL – ${cand4} votos (${porcentaje(cand4)})

🟦 Blanco: ${blanco}

✅ Votos válidos: ${validos}
📊 Total votos emitidos: ${total}`;

  return { fiscal, mesa, resumen };
}

function copiarAlPortapapeles() {
  const { resumen } = obtenerDatos();
  navigator.clipboard.writeText(resumen).then(() => {
    document.getElementById("resumen").innerText = resumen;
    alert("Resumen copiado al portapapeles.");
  });
}

function enviarWhatsApp() {
  const { resumen } = obtenerDatos();
  const mensaje = encodeURIComponent(resumen);
  const numero = "5491168650195"; // Número en formato internacional sin signos
  const url = `https://wa.me/${numero}?text=${mensaje}`;
  window.open(url, "_blank");

  // ✅ Limpieza de campos
  document.querySelectorAll("#voteForm input").forEach(input => input.value = "");

  // ✅ Limpieza del resumen visual
  document.getElementById("resumen").innerText = "";

  // ✅ Ocultar botón "Informar votos a Concejales" por 1 minuto
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

  const qrText = `Acta de Fiscalización – Elecciones 2025 COMANDO ELECTORAL PJ`;
  doc.addImage(generateQR(qrText), "PNG", 150, 250, 40, 40);

  const nombreArchivo = `Acta_Mesa_${mesa}_${fiscal.replace(/\s+/g, "_")}.pdf`;
  doc.save(nombreArchivo);
}

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

// Cargar QRious dinámicamente
(function cargarQRious() {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js";
  document.head.appendChild(script);

})();



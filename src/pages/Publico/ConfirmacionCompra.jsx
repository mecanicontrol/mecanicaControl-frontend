import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { CheckCircle, Download, ShoppingBag, Truck, User, Mail, MapPin, FileText } from "lucide-react";
import { jsPDF } from "jspdf";

function formatCLP(valor) {
  const n = typeof valor === "number" ? valor : parseFloat(valor ?? 0);
  return n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

function generarPDF(pedido) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const margen = 20;

  // ── Encabezado (fondo oscuro) ──
  doc.setFillColor(15, 23, 42); // blue-950
  doc.rect(0, 0, W, 45, "F");

  doc.setTextColor(255, 165, 0); // orange
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("MecánicaHub", margen, 18);

  doc.setTextColor(180, 180, 180);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Tienda Online · Santiago, Chile", margen, 26);
  doc.text("contacto@mecanicahub.cl", margen, 32);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(`N° ${pedido.numeroPedido}`, W - margen, 18, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text(`Fecha: ${new Date(pedido.fecha).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" })}`, W - margen, 26, { align: "right" });
  doc.text("COMPROBANTE DE PEDIDO", W - margen, 33, { align: "right" });

  // ── Subtítulo ──
  doc.setFillColor(249, 115, 22); // orange-500
  doc.rect(0, 45, W, 6, "F");

  // ── Datos del cliente ──
  let y = 62;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("DATOS DEL CLIENTE", margen, y);

  doc.setDrawColor(230, 230, 230);
  doc.line(margen, y + 2, W - margen, y + 2);

  y += 10;
  const c = pedido.cliente;
  const infoCliente = [
    ["Nombre:", c.nombre],
    ["Email:", c.email],
    ["Teléfono:", c.telefono || "—"],
    ["Dirección:", c.direccion],
    ["Ciudad:", `${c.ciudad}, ${c.region}`],
  ];

  doc.setFontSize(9.5);
  infoCliente.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text(label, margen, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(val, margen + 30, y);
    y += 7;
  });

  if (c.notas) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text("Notas:", margen, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    const lineas = doc.splitTextToSize(c.notas, W - margen - 50);
    doc.text(lineas, margen + 30, y);
    y += lineas.length * 6;
  }

  // ── Tabla de productos ──
  y += 6;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("DETALLE DE PRODUCTOS", margen, y);
  doc.setDrawColor(230, 230, 230);
  doc.line(margen, y + 2, W - margen, y + 2);

  y += 8;
  // Cabecera tabla
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margen, y - 4, W - margen * 2, 8, "F");
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("Producto", margen + 2, y + 0.5);
  doc.text("Cant.", 138, y + 0.5);
  doc.text("P. Unit.", 152, y + 0.5);
  doc.text("Subtotal", W - margen - 2, y + 0.5, { align: "right" });

  y += 10;
  pedido.items.forEach((item, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(250, 251, 252);
      doc.rect(margen, y - 4.5, W - margen * 2, 8, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    const nombre = item.nombre.length > 48 ? item.nombre.substring(0, 48) + "…" : item.nombre;
    doc.text(nombre, margen + 2, y);
    doc.text(String(item.cantidad), 140, y, { align: "center" });
    doc.text(formatCLP(item.precioVenta), 165, y, { align: "right" });
    doc.text(formatCLP(parseFloat(item.precioVenta ?? 0) * item.cantidad), W - margen - 2, y, { align: "right" });
    y += 9;
  });

  // ── Totales ──
  y += 4;
  doc.setDrawColor(210, 210, 210);
  doc.line(margen + 80, y, W - margen, y);
  y += 6;

  doc.setFontSize(9.5);
  const totales = [
    ["Subtotal:", formatCLP(pedido.subtotal)],
    ["Envío:", pedido.envio === 0 ? "GRATIS" : formatCLP(pedido.envio)],
  ];
  totales.forEach(([label, val]) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(label, 135, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text(val, W - margen - 2, y, { align: "right" });
    y += 7;
  });

  y += 2;
  doc.setFillColor(15, 23, 42);
  doc.rect(margen + 80, y - 5, W - margen - (margen + 80), 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL:", 136, y + 1.5);
  doc.setTextColor(255, 165, 0);
  doc.text(formatCLP(pedido.total), W - margen - 3, y + 1.5, { align: "right" });

  // ── Pie de página ──
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(160, 160, 160);
  doc.text(
    "Este documento es un comprobante de pedido. No constituye boleta tributaria válida.",
    W / 2, 282, { align: "center" }
  );
  doc.text("MecánicaHub · Santiago, Chile · www.mecanicahub.cl", W / 2, 287, { align: "center" });

  doc.save(`pedido-${pedido.numeroPedido}.pdf`);
}

export default function ConfirmacionCompra() {
  const location = useLocation();
  const navigate  = useNavigate();
  const pedido    = location.state?.pedido;

  if (!pedido) {
    navigate("/tienda");
    return null;
  }

  const { numeroPedido, fecha, cliente, items, subtotal, envio, total } = pedido;
  const fechaFormateada = new Date(fecha).toLocaleDateString("es-CL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-14 px-4">
        <div className="max-w-3xl mx-auto">

          {/* ── Éxito ── */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
            <div className="bg-green-500 px-8 py-10 flex flex-col items-center text-white text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={46} className="text-white" />
              </div>
              <h1 className="text-3xl font-black mb-1">¡Pedido confirmado!</h1>
              <p className="text-green-100 text-sm">Tu pedido fue recibido y está siendo procesado</p>
            </div>

            <div className="px-8 py-6 border-b border-gray-100 flex flex-wrap gap-6 justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">N° de pedido</p>
                <p className="text-xl font-black text-blue-950 font-mono">{numeroPedido}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Fecha</p>
                <p className="font-semibold text-gray-700 capitalize">{fechaFormateada}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Total pagado</p>
                <p className="text-xl font-black text-orange-500">{formatCLP(total)}</p>
              </div>
            </div>

            {/* ── Info cliente ── */}
            <div className="px-8 py-5 grid sm:grid-cols-2 gap-4 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-blue-950" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-semibold mb-0.5">Cliente</p>
                  <p className="font-bold text-gray-800 text-sm">{cliente.nombre}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><Mail size={11} /> {cliente.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Truck size={16} className="text-orange-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-semibold mb-0.5">Envío a</p>
                  <p className="font-bold text-gray-800 text-sm flex items-start gap-1"><MapPin size={12} className="mt-0.5 flex-shrink-0" />{cliente.direccion}</p>
                  <p className="text-sm text-gray-500">{cliente.ciudad}, {cliente.region}</p>
                </div>
              </div>
            </div>

            {/* ── Productos ── */}
            <div className="px-8 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag size={16} className="text-orange-500" />
                <h2 className="font-black text-blue-950">Productos ({items.length})</h2>
              </div>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-bold text-gray-800 leading-tight">{item.nombre}</p>
                      {item.marca && <p className="text-xs text-gray-400 mt-0.5">{item.marca}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">×{item.cantidad}</p>
                      <p className="text-sm font-black text-blue-950">{formatCLP(parseFloat(item.precioVenta ?? 0) * item.cantidad)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Totales ── */}
            <div className="px-8 py-5">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatCLP(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1"><Truck size={13} /> Envío</span>
                  <span className={`font-semibold ${envio === 0 ? "text-green-600" : ""}`}>
                    {envio === 0 ? "GRATIS" : formatCLP(envio)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-black text-blue-950 pt-2 border-t border-gray-100 mt-2">
                  <span>Total</span>
                  <span className="text-orange-500">{formatCLP(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Acciones ── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => generarPDF(pedido)}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-950 text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 transition"
            >
              <Download size={18} />
              Descargar comprobante PDF
            </button>
            <button
              onClick={() => navigate("/tienda")}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition"
            >
              <ShoppingBag size={18} className="text-orange-500" />
              Seguir comprando
            </button>
          </div>

          <div className="mt-4 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
            <FileText size={16} className="flex-shrink-0 mt-0.5 text-orange-500" />
            <p>
              Recibirás un email de confirmación en <strong>{cliente.email}</strong> con los detalles del pedido.
              Si tienes consultas contáctanos en <strong>contacto@mecanicahub.cl</strong>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
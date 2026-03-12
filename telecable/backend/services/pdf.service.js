const PDFDocument = require('pdfkit');

function buildReceipt(dataCallback, endCallback, userData, paymentData) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  doc.on('data', dataCallback);
  doc.on('end', endCallback);

  // Header
  doc
    .fontSize(20)
    .text('TELECABLE', 50, 57)
    .fontSize(10)
    .text('Recibo de Pago', 200, 65, { align: 'right' });

  // Info Section
  doc.moveTo(50, 90).lineTo(550, 90).stroke();
  doc
    .fontSize(10)
    .text(`Nombre del Cliente: ${userData.nombre}`, 50, 100)
    .text(`Numero de Contrato: ${userData.numero}`, 50, 115)
    .text(`Fecha de Pago: ${paymentData.fecha}`, 50, 130)
    .text(`Localidad: ${userData.localidad}`, 300, 100);
  doc.moveTo(50, 150).lineTo(550, 150).stroke();

  // Body
  doc.fontSize(12).text('Descripcion', 50, 170);
  doc.text('Monto', 250, 170);
  doc.moveTo(50, 190).lineTo(550, 190).stroke();
  doc.text('Pago de servicio de cable/internet', 50, 200);
  doc.text(`$${paymentData.monto.toFixed(2)}`, 250, 200);
  doc.moveTo(50, 220).lineTo(550, 220).stroke();

  // Footer
  doc.fontSize(10).text('Pago recibido. Gracias por su preferencia.', 50, 250, { align: 'center' });

  doc.end();
}

module.exports = { buildReceipt };

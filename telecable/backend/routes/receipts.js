const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { buildReceipt } = require('../services/pdf.service');

router.get('/:userId/:paymentIndex', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }

    const paymentIndex = parseInt(req.params.paymentIndex);
    if (isNaN(paymentIndex) || paymentIndex < 0 || paymentIndex >= user.historialPagos.length) {
      return res.status(404).send('Pago no encontrado');
    }

    const payment = user.historialPagos[paymentIndex];
    
    const stream = res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment;filename=recibo-${payment.fecha}.pdf`,
    });

    buildReceipt(
      (chunk) => stream.write(chunk),
      () => stream.end(),
      user,
      payment
    );

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al generar el recibo');
  }
});

module.exports = router;

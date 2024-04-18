const express = require('express');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const qr = require('qrcode');
const { IDontWannaSleepPapa } = require('./yo-no-sleepo-senior');

const app = express();
const port = 3000;
const QR_SIZE = 104;

app.get('/genera-qr/:testo', async (req, res) => {
  try {
    const testo = req.params.testo;

    const qrDataUri = await qr.toDataURL(testo, { errorCorrectionLevel: 'H', width: QR_SIZE });

    const qrBuffer = Buffer.from(qrDataUri.split(',')[1], 'base64');

    const immagineBianca = await sharp({
      create: {
        width: QR_SIZE,
        height: QR_SIZE,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .png()
    .toBuffer();

    const qrImageResized = await sharp(qrBuffer)
      .toBuffer();

    const qrImage = await sharp(immagineBianca)
      .composite([{ input: qrImageResized, top: 0, left: 0 }])
      .toBuffer();

    const immagineClonata = Buffer.from(fs.readFileSync(path.join(__dirname, 'template_sticker.PNG')));

    const risultato = await sharp(immagineClonata)
    .composite([{ input: qrImage, top: 10, left: 177 }])
    .png()
    .toBuffer();

    res.set('Content-Type', 'image/png');
    res.send(risultato);
  } catch (error) {
    console.error('Si è verificato un errore durante la generazione del QR code:', error);
    res.status(500).send('Si è verificato un errore durante la generazione del QR code');
  }
});

app.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
  IDontWannaSleepPapa();
});
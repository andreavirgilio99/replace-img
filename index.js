const express = require('express');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const qr = require('qrcode');
const { createCanvas, loadImage } = require('canvas');

const app = express();
const port = 3000;
const QR_SIZE = 104;

app.get('/genera-qr/:tipo/:testo', async (req, res) => {
  const tipo = req.params.tipo;
  const testo = req.params.testo;

  if (tipo !== "pausamatic" && tipo !== "gettoniera") {
    res.set('Content-Type', 'text/plain');
    res.send('tipo dispositivo non valido, il tipo deve essere pausamatic oppure gettoniera');
  } else {
    try {
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

      let risultato = await sharp(immagineClonata)
        .composite([{ input: qrImage, top: 10, left: 177 }])
        .png()
        .toBuffer();

      if (tipo === 'gettoniera') {
        const canvas = createCanvas(500, 500);
        const ctx = canvas.getContext('2d');

        const image = await loadImage(risultato);
        ctx.drawImage(image, 0, 0);

        ctx.font = '17.5px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText('GETTONIERA', 58.5, 110);

        risultato = Buffer.from(canvas.toBuffer('image/png'));
      }

      res.set('Content-Type', 'image/png');
      res.send(risultato);

    } catch (error) {
      console.error('Si è verificato un errore durante la generazione del QR code:', error);
      res.status(500).send('Si è verificato un errore durante la generazione del QR code');
    }
  }
});

app.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
});
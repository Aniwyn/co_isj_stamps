require("dotenv").config();
const express = require('express')
const cors = require('cors')
const pdfParse = require('pdf-parse')

const app = express()
app.use(cors())

app.get('/api/pdf', async (req, res) => {
  const url = req.query.url
  if (!url) return res.status(400).send('Falta la URL')

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'application/pdf',
      },
      redirect: 'follow',
    })

    if (!response.ok) {
      console.error('Status:', response.status)
      return res.status(502).send('No se pudo descargar el PDF (status ' + response.status + ')')
    }

    const bufferFetch = await response.arrayBuffer()
    const buffer = Buffer.from(bufferFetch)
    const parsed = await pdfParse(buffer)

    res.json({
      text: parsed.text,
      pdf: buffer.toString('base64'),
    })
  } catch (error) {
    console.error('Error al descargar PDF:', error)
    res.status(500).send('Error interno al descargar PDF')
  }
})

const PORT = process.env.PORT || 5002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

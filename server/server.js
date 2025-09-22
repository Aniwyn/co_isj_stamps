// server.js
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const pdfParse = require('pdf-parse')
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js')
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib')

const fsp = require('fs').promises // para logs

const app = express()
app.use(cors())
app.use(express.json())

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toUpperCase();

async function extractSinglePageItems(buffer) {
    const loadingTask = pdfjsLib.getDocument({ data: buffer })
    const pdf = await loadingTask.promise

    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1 })
    const content = await page.getTextContent()

    const items = content.items.map(it => {
        const [a, b, c, d, e, f] = it.transform // e->x, f->y MAPA !!user units!!
        return {
            str: it.str,
            x: e,
            y: f,
            ax: a,   // estimardor ancho - borrar si no lo uso
            dy: d    // estimardor alto - borrar si no lo uso
        }
    })

    return {
        width: viewport.width,
        height: viewport.height,
        items
    }
}

function findAnchorsSinglePage(page, phrases) {
    const results = []
    const strings = page.items.map(i => i.str)
    const maxWindow = 12

    for (let start = 0; start < strings.length; start++) {
        let combined = strings[start]

        for (let end = start; end < Math.min(strings.length, start + maxWindow); end++) {
            if (end > start) combined += ' ' + strings[end]
            const nc = norm(combined)

            for (const ph of phrases) {
                const target = norm(ph.text)
                if (!nc.includes(target)) continue
                if (ph.exclude && ph.exclude.test(nc)) continue

                const involved = page.items.slice(start, end + 1)
                if (!involved.length) continue

                const xs = involved.map(i => i.x)
                const ys = involved.map(i => i.y)
                const minX = Math.min(...xs)
                const minY = Math.min(...ys)

                const first = involved[0]
                const last = involved[involved.length - 1]
                const approxCharW = Math.abs(last.ax || 6) * 0.6
                const tail = (last.str || '').length * approxCharW
                const w = Math.max(12, (last.x - first.x) + tail + 2)
                const h = Math.max(10, Math.abs(first.dy || 12))

                results.push({
                    key: ph.key,
                    phrase: ph.text,
                    page: 1,
                    bboxUser: { x: minX, y: minY, w, h },
                    matchedSample: combined
                })
            }
        }
    }

    return results
}

// ******************** RUTAS ********************

app.get('/', (_req, res) => res.send('API OK...'));

app.get('/api/pdf', async (req, res) => {
    const url = req.query.url
    if (!url) return res.status(400).send('Falta la URL')

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/pdf' },
            redirect: 'follow',
        })
        if (!response.ok) return res.status(502).send(`No se pudo descargar el PDF (status ${response.status})`)

        const arrayBuf = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuf)
        const parsed = await pdfParse(buffer)
        const page = await extractSinglePageItems(buffer)

        const phrases = [
            { key: 'firma', text: 'Firma Profesional, Aclaración y Matrícula' },
            { key: 'fecha', text: 'Fecha', exclude: /FECHA\s+EMISI[ÓO]N/ },
            { key: 'diagnostico', text: 'Diagnóstico CIE-10' }
        ]
        const anchors = findAnchorsSinglePage(page, phrases)

        res.json({
            ok: true,
            meta: {
                pageCount: 1,
                pageSizeUserUnits: { width: page.width, height: page.height }
            },
            anchors,     // ← coordenadas en user units para usar directo en pdf-lib
            text: parsed.text,
            pdfBase64: buffer.toString('base64')
        })
    } catch (err) {
        console.error('Error /api/pdf:', err)
        res.status(500).send('Error interno al procesar PDF')
    }
})

app.post('/api/test/logs', async (req, res) => {
    try {
        const { url, time } = req.body || {};
        if (!url) return res.status(400).send('Falta url');

        const logDir = 'logs';
        const logFile = path.join(logDir, 'captured_pdfs.jsonl');
        await fsp.mkdir(logDir, { recursive: true });
        await fsp.appendFile(logFile, JSON.stringify({ url, time: time || new Date().toISOString() }) + '\n', 'utf8');

        res.send('OK');
    } catch (e) {
        console.error('Error guardando log:', e);
        res.status(500).send('Error al guardar log');
    }
});

const PORT = process.env.PORT || 5003
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`)
})



/**
 * (Opcional) POST /api/pdf/stamp
 * Body:
 * {
 *   url: string,
 *   stamps: [
 *     { page: 1, x: 50, y: 120, text: "H53", fontSize: 10 },
 *     { page: 1, x: 220, y: 380, text: "25 / 09 / 2025", fontSize: 10 }
 *   ]
 * }
 * Devuelve: { pdfBase64 }
 * Nota: x,y en user units (origen bottom-left), tal como devuelve /api/pdf (bboxUser).
 */
// app.post('/api/pdf/stamp', async (req, res) => {
//     try {
//         const { url, stamps = [] } = req.body || {};
//         if (!url) return res.status(400).send('Falta url');
// 
//         const response = await fetch(url, {
//             method: 'GET',
//             headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/pdf' },
//             redirect: 'follow'
//         });
//         if (!response.ok) return res.status(502).send(`No se pudo descargar el PDF (status ${response.status})`);
// 
//         const arrayBuf = await response.arrayBuffer();
//         const buffer = Buffer.from(arrayBuf);
// 
//         const pdfDoc = await PDFDocument.load(buffer);
//         const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
// 
//         stamps.forEach(s => {
//             const pIndex = (s.page || 1) - 1;
//             const page = pdfDoc.getPage(pIndex);
//             const fontSize = s.fontSize || 10;
//             const color = rgb(0, 0, 0);
// 
//             page.drawText(String(s.text ?? ''), {
//                 x: s.x,
//                 y: s.y,         // ← coordenadas PDF (bottom-left). Si querés centrar: x - (font.widthOfTextAtSize/2)
//                 size: fontSize,
//                 font,
//                 color
//             });
//         });
// 
//         const outBytes = await pdfDoc.save();
//         res.json({ ok: true, pdfBase64: Buffer.from(outBytes).toString('base64') });
//     } catch (err) {
//         console.error('Error /api/pdf/stamp:', err);
//         res.status(500).send('Error interno al estampar PDF');
//     }
// });


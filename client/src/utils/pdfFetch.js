import { PDFDocument } from 'pdf-lib'

const BASE_URL = import.meta.env.VITE_API_URL

const fetchPdf = async (url) => {
    try {
        const response = await fetch(`${BASE_URL}/pdf?url=${encodeURIComponent(url)}`)
        const { pdf, text } = await response.json()

        const binary = Uint8Array.from(atob(pdf), c => c.charCodeAt(0))
        const file = new File([binary], 'receta.pdf', { type: 'application/pdf' })
        const arrayBuffer = await file.arrayBuffer()

        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const page = pdfDoc.getPages()[0]
        const { width, height } = page.getSize()

        const newHeight = 430
        const yOffset = height - newHeight
        page.setMediaBox(0, yOffset, width, newHeight)

        const modifiedPdf = await pdfDoc.save()

        // Solo para pruebas
        //const modifiedBlob = new Blob([modifiedPdf], { type: 'application/pdf' })
        //const modifiedUrl = URL.createObjectURL(modifiedBlob)
        //window.open(modifiedUrl, '_blank')
        //console.log("PDF: ", text)

        return { modifiedPdf, text }
    } catch (err) {
        console.error('Error to fetch PDF:', err)
    }
}

export default fetchPdf
import { useMemo } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

const PdfPreview = ({ file }) => {
    const blob = useMemo(() => new Blob([file], { type: 'application/pdf' }), [file])

    return (
        <div className="w-full flex justify-center bg-gray-100">
            <Document file={blob} onLoadError={console.error}>
                <Page pageNumber={1} width={360} />
            </Document>
        </div>
    )
}

export default PdfPreview
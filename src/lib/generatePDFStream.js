import PdfPrinter from "pdfmake"
import striptags from 'striptags'

export const generatePDFStream = data => {
    const fonts = {
        Roboto: {
            normal: "Helvetica",
            bold: "Helvetica-Bold",
            italics: "Helvetica-Oblique",
            bolditalics: "Helvetica-BoldOblique",
        },
    }

    const printer = new PdfPrinter(fonts)

    const docDefinition = {
        content: [{ text: data.title, bold: true, fontSize: 20, margin: [0, 0, 0, 20] }, { text: striptags(data.content) }],
    }

    const options = {
        // ...
    }

    const pdfReadableStream = printer.createPdfKitDocument(docDefinition, options)
    pdfReadableStream.end()

    return pdfReadableStream
}

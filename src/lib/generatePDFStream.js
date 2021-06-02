import axios from "axios"
import PdfPrinter from "pdfmake"
import striptags from 'striptags'
import { extname } from 'path'

export const generatePDFStream = async data => {
    let imagePart = {}
    if (data.cover) {
        const image = await axios.get(data.cover, { responseType: 'arraybuffer' })
        const mime = extname(data.cover)
        const base64 = image.data.toString('base64')
        const base64Image = `data:image/${mime};base64,${base64}`
        imagePart = { image: base64Image, width: 500, margin: [0, 0, 0, 40] }
    }
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
        content: [imagePart, { text: data.title, lineHeight: 1.25, bold: true, fontSize: 20, margin: [0, 0, 0, 40] }, { text: striptags(data.content), alignment: 'justify', lineHeight: 2 }],
    }

    const options = {
        // ...
    }

    const pdfReadableStream = printer.createPdfKitDocument(docDefinition, options)
    pdfReadableStream.end()

    return pdfReadableStream
}

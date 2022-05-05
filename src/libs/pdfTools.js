import PdfPrinter from "pdfmake";

const generateUserPdfReadableStream = (user) => {
  console.log(user);
  let fonts = {
    Helvetica: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
      },
    }

  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    content: [
      {
        text: `${user.name}`,
        styles: "header",
      },
    ],
    styles: {
        header: {
          fontSize: 18,
          bold: true,
        },
        subheader: {
          fontSize: 15,
          bold: true,
        },
        small: {
          fontSize: 8,
        },
      },
      defaultStyle: {
        font: "Helvetica",
      },
  };
  const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {});
  pdfReadableStream.end();

  return pdfReadableStream;
};

export default generateUserPdfReadableStream;

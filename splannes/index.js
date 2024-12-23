

console.log("hello")
const userName = document.getElementById("name");
const submitBtn = document.getElementById("submitBtn");
const { PDFDocument, rgb, degrees } = PDFLib;


submitBtn.addEventListener("click", () => {
    const val =userName.value;
    if (val.trim() !== "" && userName.checkValidity()) {
        // console.log(val);
        generatePDF(val);
      } else {
        userName.reportValidity();
      }
});
const generatePDF = async (name) => {
    const existingPdfBytes = await fetch("asseys.pdf").then((res) =>
      res.arrayBuffer()
    );

    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);

    
  //get font
  const fontBytes = await fetch("Sanchez-Regular.ttf").then((res) =>
  res.arrayBuffer()
);
  // Embed our custom font in the document
  const SanChezFont  = await pdfDoc.embedFont(fontBytes);
   // Get the first page of the document
   const pages = pdfDoc.getPages();
   const firstPage = pages[0];
 
   const text=`completed  internet programming 
               and  application i course
               2024 `;
   // Draw a string of text diagonally across the first page
   firstPage.drawText(name, {
     x: 180,
     y: 364,
     size: 58,
     font: SanChezFont ,
     color: rgb(0.2, 0.84, 0.67),
   });
   firstPage.drawText(text, {
    x:160,
    y: 320,
    size: 28,
    font: SanChezFont ,
    color: rgb(0.2, 0.84, 0.67),
  });
  const cod=`course coordinator`;
  firstPage.drawText(cod, {
    x:520,
    y: 120,
    size: 28,
    font: SanChezFont ,
    color: rgb(0.2, 0.84, 0.67),
  });

  const coded=`tutor`;
  firstPage.drawText(coded, {
    x:120,
    y: 120,
    size: 28,
    font: SanChezFont ,
    color: rgb(0.2, 0.84, 0.67),
  });

  
  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
  saveAs(pdfDataUri,"newcertificate.pdf")
};


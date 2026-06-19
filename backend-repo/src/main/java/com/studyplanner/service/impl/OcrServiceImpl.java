package com.studyplanner.service.impl;

import com.studyplanner.enums.SyllabusFileType;
import com.studyplanner.service.OcrService;
import net.sourceforge.tess4j.Tesseract;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;

@Service
public class OcrServiceImpl implements OcrService {

    private static final float RENDER_DPI = 200f;

    @Value("${tesseract.datapath}")
    private String tesseractDatapath;

    @Override
    public String extractText(byte[] fileBytes, SyllabusFileType fileType) throws Exception {
        if (fileType == SyllabusFileType.PDF) {
            return extractFromPdf(fileBytes);
        }
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(fileBytes));
        if (image == null) {
            throw new IllegalArgumentException("Could not read image file — it may be corrupted or an unsupported format");
        }
        return ocrImage(image);
    }

    private String extractFromPdf(byte[] fileBytes) throws Exception {
        StringBuilder text = new StringBuilder();
        try (PDDocument document = Loader.loadPDF(fileBytes)) {
            PDFRenderer renderer = new PDFRenderer(document);
            int pageCount = document.getNumberOfPages();
            for (int i = 0; i < pageCount; i++) {
                BufferedImage pageImage = renderer.renderImageWithDPI(i, RENDER_DPI);
                text.append(ocrImage(pageImage)).append("\n");
            }
        }
        return text.toString();
    }

    /* A fresh Tesseract instance per call — instances aren't safe to share across
       concurrent OCR calls, and syllabus processing runs on a background thread pool. */
    private String ocrImage(BufferedImage image) throws Exception {
        Tesseract tesseract = new Tesseract();
        tesseract.setDatapath(tesseractDatapath);
        return tesseract.doOCR(image);
    }
}

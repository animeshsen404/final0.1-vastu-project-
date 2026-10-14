import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface HandbookContentInfo {
  title: string;
  subtitle: string;
  targetAudience: string;
  pages: number;
  topics: string[];
  summary: string;
}

/**
 * Standard PDF Generator powered by pdf-lib.
 * Produces 100% compliant, standard PDF-1.4 documents compatible with
 * Chrome PDFium, Firefox, Safari, Edge, mobile viewers, and iframe embeds.
 */
export async function generateVastuHandbookPdf(info: HandbookContentInfo): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  // Document Metadata
  pdfDoc.setTitle(info.title);
  pdfDoc.setAuthor('Vastu Ritam Research Foundation');
  pdfDoc.setSubject(info.subtitle || 'Authentic Vastu Architectural Treatise');
  pdfDoc.setKeywords(['Vastu Shastra', 'Architecture', 'Mayamatam', 'Vedic Design', 'Space Planning']);
  pdfDoc.setProducer('Vastu Ritam Document Engine');
  pdfDoc.setCreator('Vastu Ritam Classical Monograph Publisher');

  // Embed standard typography
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  // Vedic Color Palette
  const crimson = rgb(0.42, 0.12, 0.12);     // #6B1F1F
  const gold = rgb(0.83, 0.65, 0.17);        // #D4A72C
  const amber = rgb(0.91, 0.54, 0.09);       // #E88A16
  const emerald = rgb(0.06, 0.36, 0.33);     // #0F5C55
  const charcoal = rgb(0.18, 0.11, 0.08);    // #2D1B14
  const warmBg = rgb(0.99, 0.98, 0.95);      // Warm parchment
  const mutedText = rgb(0.35, 0.28, 0.24);
  const white = rgb(1, 1, 1);

  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;

  // Helper: Draw decorative ornamental border around page
  function drawPageBorder(page: any) {
    // Parchment background fill
    page.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      color: warmBg,
    });

    // Outer gold border
    page.drawRectangle({
      x: 25,
      y: 25,
      width: PAGE_WIDTH - 50,
      height: PAGE_HEIGHT - 50,
      borderColor: gold,
      borderWidth: 1.5,
    });

    // Inner crimson frame
    page.drawRectangle({
      x: 30,
      y: 30,
      width: PAGE_WIDTH - 60,
      height: PAGE_HEIGHT - 60,
      borderColor: crimson,
      borderWidth: 0.75,
    });

    // Top decorative header banner
    page.drawRectangle({
      x: 30,
      y: PAGE_HEIGHT - 62,
      width: PAGE_WIDTH - 60,
      height: 32,
      color: crimson,
    });

    page.drawText('VASTU RITAM · VEDIC ARCHITECTURAL MONOGRAPH ARCHIVE', {
      x: 45,
      y: PAGE_HEIGHT - 48,
      size: 10,
      font: helveticaBold,
      color: white,
    });

    page.drawText('AUTHENTIC RESEARCH', {
      x: PAGE_WIDTH - 180,
      y: PAGE_HEIGHT - 48,
      size: 8.5,
      font: helveticaBold,
      color: gold,
    });

    // Bottom footer bar
    page.drawRectangle({
      x: 30,
      y: 30,
      width: PAGE_WIDTH - 60,
      height: 24,
      color: emerald,
    });

    page.drawText('www.vasturitam.com · Non-Destructive Architectural Shastra Treatise', {
      x: 45,
      y: 38,
      size: 8.5,
      font: helvetica,
      color: white,
    });
  }

  // =========================================================================
  // PAGE 1: COVER FOLIO
  // =========================================================================
  const page1 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawPageBorder(page1);

  // Sanskrit Motto
  page1.drawText('|| santulanaat samriddhih sukham ||', {
    x: 45,
    y: PAGE_HEIGHT - 95,
    size: 11,
    font: timesItalic,
    color: amber,
  });

  // Title (with wrapping if long)
  const titleWords = info.title.split(' ');
  let titleLine1 = '';
  let titleLine2 = '';
  for (const word of titleWords) {
    if ((titleLine1 + ' ' + word).trim().length <= 32) {
      titleLine1 = (titleLine1 + ' ' + word).trim();
    } else {
      titleLine2 = (titleLine2 + ' ' + word).trim();
    }
  }

  page1.drawText(titleLine1, {
    x: 45,
    y: PAGE_HEIGHT - 135,
    size: 23,
    font: timesBold,
    color: crimson,
  });

  if (titleLine2) {
    page1.drawText(titleLine2, {
      x: 45,
      y: PAGE_HEIGHT - 165,
      size: 21,
      font: timesBold,
      color: crimson,
    });
  }

  // Subtitle
  const subY = titleLine2 ? PAGE_HEIGHT - 200 : PAGE_HEIGHT - 170;
  page1.drawText(info.subtitle || 'Classical Vastu Principles Applied to Modern Habitations', {
    x: 45,
    y: subY,
    size: 12,
    font: timesItalic,
    color: charcoal,
  });

  // Divider line
  page1.drawLine({
    start: { x: 45, y: subY - 15 },
    end: { x: PAGE_WIDTH - 45, y: subY - 15 },
    color: gold,
    thickness: 1.5,
  });

  // Meta Badges Box
  const metaBoxY = subY - 85;
  page1.drawRectangle({
    x: 45,
    y: metaBoxY,
    width: PAGE_WIDTH - 90,
    height: 55,
    color: white,
    borderColor: gold,
    borderWidth: 1,
  });

  page1.drawText('TARGET AUDIENCE:', {
    x: 60,
    y: metaBoxY + 35,
    size: 8.5,
    font: helveticaBold,
    color: amber,
  });
  page1.drawText(info.targetAudience || 'Architects, Engineers & Homeowners', {
    x: 60,
    y: metaBoxY + 18,
    size: 10,
    font: helvetica,
    color: charcoal,
  });

  page1.drawText('DOCUMENT FOLIO EXTENT:', {
    x: 320,
    y: metaBoxY + 35,
    size: 8.5,
    font: helveticaBold,
    color: emerald,
  });
  page1.drawText(`${info.pages || 48} Comprehensive Folio Units`, {
    x: 320,
    y: metaBoxY + 18,
    size: 10,
    font: helvetica,
    color: charcoal,
  });

  // Executive Summary Card
  const summaryBoxY = metaBoxY - 170;
  page1.drawRectangle({
    x: 45,
    y: summaryBoxY,
    width: PAGE_WIDTH - 90,
    height: 150,
    color: white,
    borderColor: crimson,
    borderWidth: 1,
  });

  page1.drawRectangle({
    x: 45,
    y: summaryBoxY + 122,
    width: PAGE_WIDTH - 90,
    height: 28,
    color: crimson,
  });

  page1.drawText('EXECUTIVE SUMMARY & ARCHITECTURAL FOUNDATION', {
    x: 60,
    y: summaryBoxY + 132,
    size: 10,
    font: helveticaBold,
    color: white,
  });

  // Wrap summary text
  const cleanSummary = (info.summary || 'A structured architectural treatise rooted in classical Shastra wisdom without superstitious or destructive alterations.').replace(/[\r\n]+/g, ' ');
  const sumWords = cleanSummary.split(' ');
  let curLine = '';
  let lineY = summaryBoxY + 100;
  for (const w of sumWords) {
    if ((curLine + ' ' + w).trim().length <= 75) {
      curLine = (curLine + ' ' + w).trim();
    } else {
      page1.drawText(curLine, {
        x: 60,
        y: lineY,
        size: 10,
        font: timesRoman,
        color: charcoal,
      });
      curLine = w;
      lineY -= 16;
      if (lineY < summaryBoxY + 15) break;
    }
  }
  if (curLine && lineY >= summaryBoxY + 15) {
    page1.drawText(curLine, {
      x: 60,
      y: lineY,
      size: 10,
      font: timesRoman,
      color: charcoal,
    });
  }

  // Foundational Motto Quote Box
  const mottoY = summaryBoxY - 110;
  page1.drawRectangle({
    x: 45,
    y: mottoY,
    width: PAGE_WIDTH - 90,
    height: 90,
    color: rgb(0.97, 0.94, 0.88),
    borderColor: gold,
    borderWidth: 1,
  });

  page1.drawText('OUR FOUNDATIONAL IDEAL:', {
    x: 60,
    y: mottoY + 68,
    size: 9,
    font: helveticaBold,
    color: amber,
  });

  page1.drawText('"We do not begin with remedies. We begin with understanding."', {
    x: 60,
    y: mottoY + 46,
    size: 12,
    font: timesBold,
    color: crimson,
  });

  page1.drawText('Authentic Vastu Shastra is a science of harmony, solar orientation, and non-destructive spatial mechanics.', {
    x: 60,
    y: mottoY + 24,
    size: 9.5,
    font: timesItalic,
    color: mutedText,
  });

  page1.drawText('Folio 1 of 4 | Registered Monograph Series', {
    x: PAGE_WIDTH - 240,
    y: 38,
    size: 8.5,
    font: helvetica,
    color: white,
  });

  // =========================================================================
  // PAGE 2: CANONICAL SHASTRAS & SOLAR GEOMETRY
  // =========================================================================
  const page2 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawPageBorder(page2);

  page2.drawText('SECTION 1: CANONICAL SHASTRAS & SOLAR GEOMETRY', {
    x: 45,
    y: PAGE_HEIGHT - 95,
    size: 14,
    font: helveticaBold,
    color: crimson,
  });

  page2.drawText('The Classical Treatises: Mayamatam, Manasara, Brihat Samhita & Samarangana Sutradhara', {
    x: 45,
    y: PAGE_HEIGHT - 115,
    size: 10,
    font: timesItalic,
    color: mutedText,
  });

  page2.drawLine({
    start: { x: 45, y: PAGE_HEIGHT - 125 },
    end: { x: PAGE_WIDTH - 45, y: PAGE_HEIGHT - 125 },
    color: gold,
    thickness: 1,
  });

  // Explanatory paragraphs
  let p2Y = PAGE_HEIGHT - 145;
  const p2Texts = [
    'Traditional Vastu Shastra is fundamentally an empirical discipline of sacred architecture, solar physics, and terrestrial magnetics developed across millennia. Classical authorities establish that every built space acts as an energetic prism altering the vitality, mental serenity, and productivity of its inhabitants.',
    '1. The Solar Principle (Surya Mandala): The morning sunlight traveling from Ishanya (North-East) to Purva (East) carries beneficial ultraviolet frequencies, promoting vitality and cellular repair. Hence, ancient texts mandate lightweight architecture, water bodies, and expansive openings in the North-East.',
    '2. The Terrestrial Principle (Prithvi Mandala): High infrared and thermal heat accumulate in Dakshina (South) and Nairutya (South-West) as the afternoon progresses. Classical treatises prescribe maximum structural mass, heavy storage, and master occupancies in these sectors to anchor stability.',
    '3. The Magnetic Grid (Jaala Sthapana): Earth’s geomagnetic vectors flow from North to South. Alignment of human sleep orientation and primary axis paths with these lines ensures equilibrium of the circadian rhythms and blood circulation.',
  ];

  for (const text of p2Texts) {
    const words = text.split(' ');
    let line = '';
    for (const w of words) {
      if ((line + ' ' + w).trim().length <= 76) {
        line = (line + ' ' + w).trim();
      } else {
        page2.drawText(line, {
          x: 45,
          y: p2Y,
          size: 10,
          font: line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') ? timesBold : timesRoman,
          color: charcoal,
        });
        line = w;
        p2Y -= 15;
      }
    }
    if (line) {
      page2.drawText(line, {
        x: 45,
        y: p2Y,
        size: 10,
        font: timesRoman,
        color: charcoal,
      });
      p2Y -= 22;
    }
  }

  // Key Topics Covered in this Handbook
  p2Y -= 10;
  page2.drawRectangle({
    x: 45,
    y: p2Y - 140,
    width: PAGE_WIDTH - 90,
    height: 140,
    color: white,
    borderColor: emerald,
    borderWidth: 1,
  });

  page2.drawText('CURATED STUDY MODULES IN THIS MONOGRAPH:', {
    x: 60,
    y: p2Y - 20,
    size: 9.5,
    font: helveticaBold,
    color: emerald,
  });

  const topicsToDraw = (info.topics && info.topics.length > 0)
    ? info.topics
    : ['Solar Vector Alignment', 'Brahmasthan Sanctity in Modern Apartments', 'Non-Destructive Elemental Rebalancing', 'Entry Padas & Architectural Flow'];

  let topY = p2Y - 45;
  for (let idx = 0; idx < Math.min(topicsToDraw.length, 5); idx++) {
    page2.drawText(`* Module ${idx + 1}: ${topicsToDraw[idx]}`, {
      x: 60,
      y: topY,
      size: 10,
      font: helvetica,
      color: charcoal,
    });
    topY -= 20;
  }

  page2.drawText('Folio 2 of 4 | Canonical Shastras & Solar Geometry', {
    x: PAGE_WIDTH - 270,
    y: 38,
    size: 8.5,
    font: helvetica,
    color: white,
  });

  // =========================================================================
  // PAGE 3: ARCHITECTURAL CHECKLIST & SPATIAL DIAGNOSTICS
  // =========================================================================
  const page3 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawPageBorder(page3);

  page3.drawText('SECTION 2: SPATIAL DIAGNOSTICS & ARCHITECTURAL CHECKLIST', {
    x: 45,
    y: PAGE_HEIGHT - 95,
    size: 14,
    font: helveticaBold,
    color: crimson,
  });

  page3.drawText('Systematic Inspection Grid for Flats, Independent Villas, and Corporate Sites', {
    x: 45,
    y: PAGE_HEIGHT - 115,
    size: 10,
    font: timesItalic,
    color: mutedText,
  });

  page3.drawLine({
    start: { x: 45, y: PAGE_HEIGHT - 125 },
    end: { x: PAGE_WIDTH - 45, y: PAGE_HEIGHT - 125 },
    color: gold,
    thickness: 1,
  });

  const checklistItems = [
    { zone: 'Brahmasthan (Central Core)', ideal: 'Free from structural columns, heavy staircases, or water tanks. Must retain luminosity and unimpeded circulation.' },
    { zone: 'Ishanya (North-East)', ideal: 'Ideal for study, meditation, living rooms, and clean water inlets. Strictly avoid toilets, heavy storage, or heating machinery.' },
    { zone: 'Agni (South-East)', ideal: 'Zone of Fire (Tejas). Ideal for kitchen cooktops, electrical meters, transformers, and boiler setups.' },
    { zone: 'Nairutya (South-West)', ideal: 'Zone of Earth (Prithvi). Master bedroom, heavy structural mass, and senior management cabins to foster authority and groundedness.' },
    { zone: 'Vayavya (North-West)', ideal: 'Zone of Air (Vayu). Guest suites, sales dispatch, active finished goods storage, and dynamic movement zones.' },
  ];

  let checkY = PAGE_HEIGHT - 150;
  for (const item of checklistItems) {
    page3.drawRectangle({
      x: 45,
      y: checkY - 55,
      width: PAGE_WIDTH - 90,
      height: 50,
      color: white,
      borderColor: gold,
      borderWidth: 0.75,
    });

    page3.drawText(item.zone, {
      x: 60,
      y: checkY - 20,
      size: 10.5,
      font: helveticaBold,
      color: crimson,
    });

    const descWords = item.ideal.split(' ');
    let dLine = '';
    let dY = checkY - 35;
    for (const w of descWords) {
      if ((dLine + ' ' + w).trim().length <= 75) {
        dLine = (dLine + ' ' + w).trim();
      } else {
        page3.drawText(dLine, {
          x: 60,
          y: dY,
          size: 9.5,
          font: timesRoman,
          color: charcoal,
        });
        dLine = w;
        dY -= 14;
      }
    }
    if (dLine) {
      page3.drawText(dLine, {
        x: 60,
        y: dY,
        size: 9.5,
        font: timesRoman,
        color: charcoal,
      });
    }

    checkY -= 68;
  }

  // Warning Note
  page3.drawRectangle({
    x: 45,
    y: checkY - 80,
    width: PAGE_WIDTH - 90,
    height: 75,
    color: rgb(0.98, 0.94, 0.94),
    borderColor: crimson,
    borderWidth: 1,
  });

  page3.drawText('IMPORTANT ARCHITECTURAL DIRECTIVE:', {
    x: 60,
    y: checkY - 25,
    size: 9,
    font: helveticaBold,
    color: crimson,
  });

  page3.drawText('Never accept fear-mongering claims that require reckless demolition of load-bearing structural members. Real classical Vastu respects civil engineering first. Elemental remedies and spatial reassignment provide profound corrections without damaging structures.', {
    x: 60,
    y: checkY - 45,
    size: 9.5,
    font: timesItalic,
    color: charcoal,
  });

  page3.drawText('Folio 3 of 4 | Spatial Diagnostics & Architectural Checklist', {
    x: PAGE_WIDTH - 300,
    y: 38,
    size: 8.5,
    font: helvetica,
    color: white,
  });

  // =========================================================================
  // PAGE 4: INSTITUTIONAL METHODOLOGY & VERIFICATION
  // =========================================================================
  const page4 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawPageBorder(page4);

  page4.drawText('SECTION 3: INSTITUTIONAL METHODOLOGY & REMEDIAL ETHOS', {
    x: 45,
    y: PAGE_HEIGHT - 95,
    size: 14,
    font: helveticaBold,
    color: crimson,
  });

  page4.drawText('Research Credentials, Non-Destructive Solutions, and Certified Review Process', {
    x: 45,
    y: PAGE_HEIGHT - 115,
    size: 10,
    font: timesItalic,
    color: mutedText,
  });

  page4.drawLine({
    start: { x: 45, y: PAGE_HEIGHT - 125 },
    end: { x: PAGE_WIDTH - 45, y: PAGE_HEIGHT - 125 },
    color: gold,
    thickness: 1,
  });

  const p4Sections = [
    {
      title: '1. The Non-Destructive Standard (Ahimsa in Architecture)',
      body: 'Vastu Ritam operates on a foundational mandate: no arbitrary knocking down of structural columns, RCC beams, or load-bearing lintels. When spatial layouts present imbalances, traditional Shastras advocate Pancha Tattva (Five Elemental) corrections through directional lighting, mineral resonance, acoustics, and conscious functional zone reallocation.',
    },
    {
      title: '2. Professional Collaboration with Architects and Structural Engineers',
      body: 'We speak the language of AutoCAD, BIM, structural loads, and modern municipal building bylaws. Consultations are structured to integrate seamlessly into working drawings without compromising structural integrity or construction timelines.',
    },
    {
      title: '3. Intellectual Honesty & Anti-Commercialization',
      body: 'Authentic Vastu does not endorse commercial superstition or the indiscriminate placement of plastic pyramids and commercial charms. First principles must be honored; remedies are only meaningful when the underlying spatial mechanics are thoroughly understood.',
    },
  ];

  let p4Y = PAGE_HEIGHT - 150;
  for (const sec of p4Sections) {
    page4.drawText(sec.title, {
      x: 45,
      y: p4Y,
      size: 11,
      font: helveticaBold,
      color: emerald,
    });
    p4Y -= 16;

    const words = sec.body.split(' ');
    let line = '';
    for (const w of words) {
      if ((line + ' ' + w).trim().length <= 75) {
        line = (line + ' ' + w).trim();
      } else {
        page4.drawText(line, {
          x: 45,
          y: p4Y,
          size: 9.5,
          font: timesRoman,
          color: charcoal,
        });
        line = w;
        p4Y -= 14;
      }
    }
    if (line) {
      page4.drawText(line, {
        x: 45,
        y: p4Y,
        size: 9.5,
        font: timesRoman,
        color: charcoal,
      });
      p4Y -= 25;
    }
  }

  // Official Institutional Seal Card
  const sealY = p4Y - 50;
  page4.drawRectangle({
    x: 45,
    y: sealY - 95,
    width: PAGE_WIDTH - 90,
    height: 95,
    color: white,
    borderColor: gold,
    borderWidth: 1.5,
  });

  page4.drawText('VASTU RITAM INTELLECTUAL PROPERTY & VERIFICATION', {
    x: 60,
    y: sealY - 25,
    size: 10,
    font: helveticaBold,
    color: crimson,
  });

  page4.drawText('This verified digital folio is published for personal study, client review, and architectural reference.', {
    x: 60,
    y: sealY - 42,
    size: 9,
    font: timesRoman,
    color: charcoal,
  });

  page4.drawText('Research Lead: CA. Animesh Sen | Founder & Vastu Researcher', {
    x: 60,
    y: sealY - 60,
    size: 9.5,
    font: timesBold,
    color: emerald,
  });

  page4.drawText('Registered Trademark & Classical Monograph Series | All Rights Reserved.', {
    x: 60,
    y: sealY - 78,
    size: 8.5,
    font: timesItalic,
    color: mutedText,
  });

  page4.drawText('Folio 4 of 4 | Institutional Methodology & End of Monograph', {
    x: PAGE_WIDTH - 320,
    y: 38,
    size: 8.5,
    font: helvetica,
    color: white,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

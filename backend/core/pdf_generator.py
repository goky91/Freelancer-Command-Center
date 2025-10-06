from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime


def generate_invoice_pdf(invoice):
    """
    Generates PDF invoice for given Invoice object
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)

    # Document elements
    elements = []

    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=30,
        alignment=TA_CENTER
    )

    normal_style = styles['Normal']
    heading_style = styles['Heading2']

    # Title
    title = Paragraph(f"INVOICE NO. {invoice.invoice_number}", title_style)
    elements.append(title)
    elements.append(Spacer(1, 0.5*cm))

    # Invoice information
    invoice_info_data = [
        ['Issue Date:', invoice.issue_date.strftime('%Y-%m-%d')],
        ['Due Date:', invoice.due_date.strftime('%Y-%m-%d')],
        ['Status:', invoice.get_status_display()],
    ]

    invoice_info_table = Table(invoice_info_data, colWidths=[5*cm, 5*cm])
    invoice_info_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(invoice_info_table)
    elements.append(Spacer(1, 1*cm))

    # Client information
    elements.append(Paragraph("CLIENT:", heading_style))
    elements.append(Spacer(1, 0.3*cm))

    client = invoice.client
    client_info = f"<b>{client.name}</b><br/>"
    if client.company:
        client_info += f"{client.company}<br/>"
    if client.address:
        client_info += f"{client.address}<br/>"
    if client.pib:
        client_info += f"Tax ID: {client.pib}<br/>"
    if client.email:
        client_info += f"Email: {client.email}<br/>"

    elements.append(Paragraph(client_info, normal_style))
    elements.append(Spacer(1, 1*cm))

    # Invoice items
    elements.append(Paragraph("ITEMS:", heading_style))
    elements.append(Spacer(1, 0.3*cm))

    time_entry = invoice.time_entry

    # Items table
    data = [
        ['Description', 'Month', 'Hours', 'Rate', 'Total'],
        [
            time_entry.description or f'Work for {client.name}',
            f'{time_entry.month}/{time_entry.year}',
            str(time_entry.hours),
            f'{time_entry.hourly_rate:,.2f}',
            f'{time_entry.total_amount:,.2f}'
        ]
    ]

    table = Table(data, colWidths=[6*cm, 2.5*cm, 2*cm, 3*cm, 3*cm])
    table.setStyle(TableStyle([
        # Header
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4a90e2')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),

        # Data
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('ALIGN', (0, 1), (0, -1), 'LEFT'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),

        # Grid
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))

    elements.append(table)
    elements.append(Spacer(1, 1*cm))

    # Total amount
    total_data = [
        ['TOTAL AMOUNT:', f'{invoice.total_amount:,.2f}']
    ]
    total_table = Table(total_data, colWidths=[10*cm, 6.5*cm])
    total_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'RIGHT'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 14),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1a1a1a')),
        ('BACKGROUND', (1, 0), (1, 0), colors.HexColor('#e8f4f8')),
        ('BOX', (0, 0), (-1, -1), 2, colors.HexColor('#4a90e2')),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(total_table)

    # Notes
    if invoice.notes:
        elements.append(Spacer(1, 1*cm))
        elements.append(Paragraph("NOTES:", heading_style))
        elements.append(Spacer(1, 0.3*cm))
        elements.append(Paragraph(invoice.notes, normal_style))

    # Build PDF
    doc.build(elements)

    buffer.seek(0)
    return buffer

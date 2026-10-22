from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path('/Users/aleksandrmikejlov/Documents/ChatGPT/Математика уроки')
OUT = ROOT / 'output/pdf/шпаргалка-действия-с-дробями.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)

font_dir = Path('/System/Library/Fonts/Supplemental')
pdfmetrics.registerFont(TTFont('Georgia', str(font_dir / 'Georgia.ttf')))
pdfmetrics.registerFont(TTFont('Georgia-Bold', str(font_dir / 'Georgia Bold.ttf')))
pdfmetrics.registerFont(TTFont('Georgia-Italic', str(font_dir / 'Georgia Italic.ttf')))
pdfmetrics.registerFont(TTFont('Georgia-BoldItalic', str(font_dir / 'Georgia Bold Italic.ttf')))

W, H = A4
NAVY = HexColor('#101A29')
NAVY_LIGHT = HexColor('#19283A')
GOLD = HexColor('#C6A66D')
GOLD_PALE = HexColor('#E7D7B8')
PAPER = HexColor('#F5F0E5')
INK = HexColor('#1B2633')
MUTED = HexColor('#7E705A')
WHITE = HexColor('#FFFDF7')

c = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1)
c.setTitle('Действия с обыкновенными дробями — Александр Микейлов')
c.setAuthor('Александр Микейлов')
c.setSubject('Памятка по действиям с дробями')

# Deep navy ground and a restrained double frame.
c.setFillColor(NAVY)
c.rect(0, 0, W, H, fill=1, stroke=0)
c.setStrokeColor(GOLD)
c.setLineWidth(0.8)
c.roundRect(20, 20, W - 40, H - 40, 13, fill=0, stroke=1)
c.setStrokeColor(HexColor('#6E5B3E'))
c.setLineWidth(0.35)
c.roundRect(25, 25, W - 50, H - 50, 10, fill=0, stroke=1)

# Small corner ornaments.
for x, y, sx, sy in [(34, H-34, 1, -1), (W-34, H-34, -1, -1), (34, 34, 1, 1), (W-34, 34, -1, 1)]:
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.line(x, y, x + 9*sx, y)
    c.line(x, y, x, y + 9*sy)
    c.setFillColor(GOLD)
    p = c.beginPath()
    p.moveTo(x + 5*sx, y)
    p.lineTo(x + 8*sx, y + 3*sy)
    p.lineTo(x + 5*sx, y + 6*sy)
    p.lineTo(x + 2*sx, y + 3*sy)
    p.close()
    c.drawPath(p, fill=1, stroke=0)

# Title block.
c.setFillColor(WHITE)
c.setFont('Georgia-Bold', 26)
c.drawString(42, 766, 'ОБЫКНОВЕННЫЕ ДРОБИ')
c.setFillColor(GOLD)
c.setFont('Georgia', 10.5)
c.drawString(43, 744, 'Четыре действия и один полезный приём')
c.setStrokeColor(GOLD)
c.setLineWidth(0.75)
c.line(42, 729, W - 42, 729)
c.setFillColor(GOLD)
c.circle(W/2, 729, 2, fill=1, stroke=0)

MATH_FONT = 'Georgia'
MATH_SIZE = 15.5
OP_SIZE = 15

def text_width(value, size=MATH_SIZE, font=MATH_FONT):
    return pdfmetrics.stringWidth(value, font, size)

def item_width(item):
    if isinstance(item, tuple):
        _, numerator, denominator = item
        return max(text_width(numerator), text_width(denominator)) + 12
    return text_width(item, OP_SIZE) + 1

def draw_item(item, x, cy):
    if isinstance(item, tuple):
        _, numerator, denominator = item
        w = item_width(item)
        c.setFillColor(INK)
        c.setFont(MATH_FONT, MATH_SIZE)
        c.drawCentredString(x + w/2, cy + 8, numerator)
        c.setStrokeColor(INK)
        c.setLineWidth(0.8)
        c.line(x + 3, cy + 4.5, x + w - 3, cy + 4.5)
        c.drawCentredString(x + w/2, cy - 17, denominator)
        return w
    c.setFillColor(INK)
    c.setFont(MATH_FONT, OP_SIZE)
    c.drawString(x, cy - 4, item)
    return item_width(item)

def draw_equation(items, left, right, cy):
    gap = 8
    widths = [item_width(item) for item in items]
    total = sum(widths) + gap * (len(items) - 1)
    x = (left + right - total) / 2
    for item, width in zip(items, widths):
        draw_item(item, x, cy)
        x += width + gap

cards = [
    ('Сложение', 'общий знаменатель', [('f','a','b'), '+', ('f','c','d'), '=', ('f','a·d + c·b','b·d')]),
    ('Вычитание', 'общий знаменатель', [('f','a','b'), '−', ('f','c','d'), '=', ('f','a·d − c·b','b·d')]),
    ('Умножение', 'перемножаем числители и знаменатели', [('f','a','b'), '·', ('f','c','d'), '=', ('f','a·c','b·d')]),
    ('Деление', 'умножаем на обратную дробь', [('f','a','b'), ':', ('f','c','d'), '=', ('f','a','b'), '·', ('f','d','c'), '=', ('f','a·d','b·c')]),
    ('Смешанное число', 'целая часть × знаменатель + числитель', ['m', ('f','a','b'), '=', ('f','m·b + a','b')]),
]

card_x, card_w, card_h, gap_y = 42, W - 84, 78, 9
top = 711
for i, (label, hint, formula) in enumerate(cards, start=1):
    y = top - card_h - (i - 1) * (card_h + gap_y)
    cy = y + card_h / 2
    c.setFillColor(PAPER)
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.7)
    c.roundRect(card_x, y, card_w, card_h, 9, fill=1, stroke=1)
    c.setFillColor(GOLD_PALE)
    c.circle(card_x + 25, cy, 12.5, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.setFont('Georgia-Bold', 7.2)
    c.drawCentredString(card_x + 25, cy - 2.6, f'{i:02d}')
    c.setFillColor(INK)
    c.setFont('Georgia-Bold', 10.5 if i < 5 else 9.6)
    c.drawString(card_x + 49, y + 48, label)
    c.setFillColor(MUTED)
    c.setFont('Georgia-Italic', 7.3)
    c.drawString(card_x + 49, y + 28, hint)
    draw_equation(formula, card_x + 190, card_x + card_w - 17, cy)

# Compact reminder panel.
rem_y = 193
c.setFillColor(NAVY_LIGHT)
c.setStrokeColor(HexColor('#6E5B3E'))
c.setLineWidth(0.55)
c.roundRect(42, rem_y, W - 84, 45, 8, fill=1, stroke=1)
c.setFillColor(GOLD)
c.setFont('Georgia-Bold', 8)
c.drawString(56, rem_y + 27, 'ПОМНИ')
c.setFillColor(WHITE)
c.setFont('Georgia', 8.8)
c.drawString(111, rem_y + 27, 'Знаменатель не равен нулю. При делении делитель тоже не равен нулю.')
c.setFillColor(GOLD_PALE)
c.setFont('Georgia-Italic', 8)
c.drawString(56, rem_y + 11, 'Если можно — сократи полученную дробь.')

# Author signature and monogram seal.
c.setStrokeColor(GOLD)
c.setLineWidth(0.6)
c.line(W/2 - 110, 137, W/2 + 110, 137)
c.setStrokeColor(GOLD)
c.setLineWidth(1.1)
seal_x, seal_y = W/2 - 93, 88
c.circle(seal_x, seal_y, 20, fill=0, stroke=1)
c.setStrokeColor(HexColor('#6E5B3E'))
c.setLineWidth(0.45)
c.circle(seal_x, seal_y, 16, fill=0, stroke=1)
c.setFillColor(GOLD_PALE)
c.setFont('Georgia-Bold', 11.5)
c.drawCentredString(seal_x, seal_y - 4, 'АМ')
c.setFillColor(GOLD_PALE)
c.setFont('Georgia-Italic', 14)
c.drawString(W/2 - 64, 91, 'Александр Микейлов')
c.setFillColor(GOLD)
c.setFont('Georgia-Bold', 7.3)
c.drawString(W/2 - 64, 72, 'АВТОРСКАЯ ШКОЛА  ·  МАТЕМАТИКА')

c.showPage()
c.save()
print(OUT)

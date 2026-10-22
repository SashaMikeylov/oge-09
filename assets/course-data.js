const gridFigure = (marks, label = 'Чертёж на клетчатой сетке') => `<svg viewBox="0 0 280 136" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="oge-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#dfe4ec" stroke-width="1"/></pattern></defs><rect width="280" height="136" rx="10" fill="#f8f9fc"/><rect width="280" height="136" rx="10" fill="url(#oge-grid)"/><path d="M20 116H260M20 116V16" stroke="#aeb8c8" stroke-width="1.2"/>${marks}</svg>`;

const svgFigure = (label, content, viewBox = '0 0 320 160') => `<svg viewBox="${viewBox}" role="img" aria-label="${label}" focusable="false" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
const svgText = (x, y, value, size = 13, fill = '#42506a', anchor = 'middle') => `<text x="${x}" y="${y}" fill="${fill}" font-family="system-ui, sans-serif" font-size="${Math.max(size, 13)}" text-anchor="${anchor}">${value}</text>`;
const svgAngleArc = (vertex, firstRay, secondRay, radius = 13) => {
  const start = Math.atan2(firstRay.y - vertex.y, firstRay.x - vertex.x);
  const end = Math.atan2(secondRay.y - vertex.y, secondRay.x - vertex.x);
  const delta = ((end - start + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  const point = angle => ({ x: vertex.x + radius * Math.cos(angle), y: vertex.y + radius * Math.sin(angle) });
  const from = point(start), to = point(start + delta);
  return `<path d="M${from.x.toFixed(1)} ${from.y.toFixed(1)}A${radius} ${radius} 0 0 ${delta >= 0 ? 1 : 0} ${to.x.toFixed(1)} ${to.y.toFixed(1)}" fill="none" stroke="#ff795f" stroke-width="1.8"/>`;
};
const svgRightAngleMark = (vertex, firstRay, secondRay, size = 12) => {
  const unit = ray => {
    const dx = ray.x - vertex.x, dy = ray.y - vertex.y, length = Math.hypot(dx, dy) || 1;
    return { x: dx / length, y: dy / length };
  };
  const a = unit(firstRay), b = unit(secondRay);
  const p = { x: vertex.x + a.x * size, y: vertex.y + a.y * size };
  const q = { x: vertex.x + b.x * size, y: vertex.y + b.y * size };
  const corner = { x: p.x + b.x * size, y: p.y + b.y * size };
  return `<path d="M${p.x.toFixed(1)} ${p.y.toFixed(1)}L${corner.x.toFixed(1)} ${corner.y.toFixed(1)}L${q.x.toFixed(1)} ${q.y.toFixed(1)}" fill="none" stroke="#ff795f" stroke-width="1.8"/>`;
};
const triangleFigure = (options = {}) => {
  const { angleA = '', angleB = '', angleC = '', sideAB = '', sideAC = '', sideBC = '', equalSides = false, label = 'Схема треугольника' } = options;
  const degrees = value => Number.parseFloat(String(value).replace('°', ''));
  let aAngle = degrees(angleA), bAngle = degrees(angleB), cAngle = degrees(angleC);
  const ab = degrees(sideAB), ac = degrees(sideAC), bc = degrees(sideBC);
  const equalAll = equalSides && Number.isFinite(ab) && Number.isFinite(ac) && Number.isFinite(bc) && Math.abs(ab - ac) < 1e-8 && Math.abs(ab - bc) < 1e-8;
  if (equalAll) aAngle = bAngle = cAngle = 60;
  if (Number.isFinite(ab) && Number.isFinite(ac) && Number.isFinite(aAngle)) {
    const A0 = { x: 0, y: 0 }, B0 = { x: ab, y: 0 }, C0 = { x: ac * Math.cos(aAngle * Math.PI / 180), y: ac * Math.sin(aAngle * Math.PI / 180) };
    const points = [A0, B0, C0], minX = Math.min(...points.map(p => p.x)), maxX = Math.max(...points.map(p => p.x)), maxY = Math.max(...points.map(p => p.y));
    const scale = Math.min(208 / (maxX - minX), 108 / maxY);
    const map = p => ({ x: 160 + (p.x - (minX + maxX) / 2) * scale, y: 148 - p.y * scale });
    const [A, B, C] = points.map(map);
    const mid = (P, Q) => ({ x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 });
    const outward = (P, Q) => { const M = mid(P, Q), dx = M.x - (A.x + B.x + C.x) / 3, dy = M.y - (A.y + B.y + C.y) / 3, length = Math.hypot(dx, dy) || 1; return { x: M.x + dx / length * 12, y: M.y + dy / length * 12 }; };
    const angleLabel = P => { const G = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 }; return { x: P.x + (G.x - P.x) * .25, y: P.y + (G.y - P.y) * .25 }; };
    const sideLabel = (P, Q, value) => { const M = outward(P, Q); return value ? svgText(M.x, M.y, value) : ''; };
    const tick = (P, Q) => { const M = mid(P, Q), dx = Q.x - P.x, dy = Q.y - P.y, len = Math.hypot(dx, dy), nx = -dy / len * 5, ny = dx / len * 5; return `<path d="M${(M.x - nx).toFixed(1)} ${(M.y - ny).toFixed(1)}L${(M.x + nx).toFixed(1)} ${(M.y + ny).toFixed(1)}" stroke="#ff795f" stroke-width="2.2"/>`; };
    const GA = angleLabel(A), GB = angleLabel(B), GC = angleLabel(C);
    return svgFigure(label, `<path d="M${A.x.toFixed(1)} ${A.y.toFixed(1)} ${B.x.toFixed(1)} ${B.y.toFixed(1)} ${C.x.toFixed(1)} ${C.y.toFixed(1)}Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/>${angleA ? svgAngleArc(A, B, C) : ''}${angleB ? svgAngleArc(B, C, A) : ''}${angleC ? svgAngleArc(C, A, B) : ''}${equalSides ? tick(A, C) + tick(B, C) : ''}${angleA ? svgText(GA.x, GA.y, angleA) : ''}${angleB ? svgText(GB.x, GB.y, angleB) : ''}${angleC ? svgText(GC.x, GC.y, angleC) : ''}${sideLabel(A, C, sideAC)}${sideLabel(B, C, sideBC)}${sideAB ? svgText((A.x + B.x) / 2, 174, sideAB) : ''}${svgText(A.x - 12, A.y + 15, 'A', 12)}${svgText(B.x + 12, B.y + 15, 'B', 12)}${svgText(C.x, C.y - 8, 'C', 12)}`,'0 0 320 190');
  }
  if (equalSides) {
    if (Number.isFinite(cAngle)) aAngle = bAngle = (180 - cAngle) / 2;
    else if (Number.isFinite(aAngle)) bAngle = aAngle, cAngle = 180 - aAngle - bAngle;
    else if (Number.isFinite(bAngle)) aAngle = bAngle, cAngle = 180 - aAngle - bAngle;
  }
  if (Number.isFinite(aAngle) && Number.isFinite(bAngle) && !Number.isFinite(cAngle)) cAngle = 180 - aAngle - bAngle;
  else if (Number.isFinite(aAngle) && Number.isFinite(cAngle) && !Number.isFinite(bAngle)) bAngle = 180 - aAngle - cAngle;
  else if (Number.isFinite(bAngle) && Number.isFinite(cAngle) && !Number.isFinite(aAngle)) aAngle = 180 - bAngle - cAngle;
  if (Number.isFinite(aAngle) && Number.isFinite(bAngle) && Number.isFinite(cAngle)) {
    const base = 200, A0 = { x: 0, y: 0 }, B0 = { x: base, y: 0 }, sideAC0 = base * Math.sin(bAngle * Math.PI / 180) / Math.sin(cAngle * Math.PI / 180), C0 = { x: sideAC0 * Math.cos(aAngle * Math.PI / 180), y: sideAC0 * Math.sin(aAngle * Math.PI / 180) };
    const points = [A0, B0, C0], minX = Math.min(...points.map(p => p.x)), maxX = Math.max(...points.map(p => p.x)), maxY = Math.max(...points.map(p => p.y));
    const scale = Math.min(208 / (maxX - minX), 108 / maxY);
    const map = p => ({ x: 160 + (p.x - (minX + maxX) / 2) * scale, y: 148 - p.y * scale });
    const [A, B, C] = points.map(map), G = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
    const inside = P => ({ x: P.x + (G.x - P.x) * .25, y: P.y + (G.y - P.y) * .25 });
    const mid = (P, Q) => ({ x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 });
    const outside = (P, Q) => { const M = mid(P, Q), dx = M.x - G.x, dy = M.y - G.y, len = Math.hypot(dx, dy) || 1; return { x: M.x + dx / len * 12, y: M.y + dy / len * 12 }; };
    const tick = (P, Q) => { const M = mid(P, Q), dx = Q.x - P.x, dy = Q.y - P.y, len = Math.hypot(dx, dy), nx = -dy / len * 5, ny = dx / len * 5; return `<path d="M${(M.x - nx).toFixed(1)} ${(M.y - ny).toFixed(1)}L${(M.x + nx).toFixed(1)} ${(M.y + ny).toFixed(1)}" stroke="#ff795f" stroke-width="2.2"/>`; };
    const GA = inside(A), GB = inside(B), GC = inside(C), AC = outside(A, C), BC = outside(B, C);
    return svgFigure(label, `<path d="M${A.x.toFixed(1)} ${A.y.toFixed(1)} ${B.x.toFixed(1)} ${B.y.toFixed(1)} ${C.x.toFixed(1)} ${C.y.toFixed(1)}Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/>${angleA ? svgAngleArc(A, B, C) : ''}${angleB ? svgAngleArc(B, C, A) : ''}${angleC ? svgAngleArc(C, A, B) : ''}${equalSides ? tick(A, C) + tick(B, C) + (equalAll ? tick(A, B) : '') : ''}${angleA ? svgText(GA.x, GA.y, angleA) : ''}${angleB ? svgText(GB.x, GB.y, angleB) : ''}${angleC ? svgText(GC.x, GC.y, angleC) : ''}${sideAC ? svgText(AC.x, AC.y, sideAC) : ''}${sideBC ? svgText(BC.x, BC.y, sideBC) : ''}${sideAB ? svgText(160, 174, sideAB) : ''}${svgText(A.x - 12, 163, 'A', 12)}${svgText(B.x + 12, 163, 'B', 12)}${svgText(C.x, C.y - 8, 'C', 12)}`,'0 0 320 190');
  }
  return svgFigure(label, `<path d="M48 158 272 158 160 42Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/>${equalSides ? '<path d="M98 95l10 8m94-8-10 8" stroke="#ff795f" stroke-width="2.5"/>' : ''}${angleA ? svgText(74, 145, angleA) : ''}${angleB ? svgText(246, 145, angleB) : ''}${angleC ? svgText(160, 65, angleC) : ''}${sideAC ? svgText(91, 96, sideAC) : ''}${sideBC ? svgText(229, 96, sideBC) : ''}${sideAB ? svgText(160, 178, sideAB) : ''}${svgText(36, 174, 'A', 12)}${svgText(284, 174, 'B', 12)}${svgText(160, 35, 'C', 12)}`,'0 0 320 190');
};
const externalAngleFigure = () => {
  const A = { x: 48, y: 132 }, B = { x: 240, y: 132 }, C = { x: B.x + 100 * Math.cos(52 * Math.PI / 180), y: B.y - 100 * Math.sin(52 * Math.PI / 180) }, E = { x: 322, y: 132 };
  return svgFigure('Треугольник с внутренним углом 128 градусов и смежным внешним углом x', `<path d="M${A.x} ${A.y} ${B.x} ${B.y} ${C.x.toFixed(2)} ${C.y.toFixed(2)}Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/><path d="M${B.x} ${B.y}h82" stroke="#3158f5" stroke-width="2.5"/>${svgAngleArc(B, A, C, 14)}${svgAngleArc(B, C, E, 14)}${svgText(210, 112, '128°')}${svgText(275, 112, 'x')}${svgText(37, 147, 'A', 12)}${svgText(240, 147, 'B', 12)}${svgText(C.x + 5, C.y - 4, 'C', 12)}<text x="45" y="18" fill="#8490a5" font-family="system-ui,sans-serif" font-size="13">схема, не в масштабе</text>`,'0 0 360 160');
};
const triangleExteriorFigure = () => {
  const A = { x: 48, y: 150 }, B = { x: 272, y: 150 }, angleA = 43 * Math.PI / 180, angleB = 62 * Math.PI / 180;
  const height = (B.x - A.x) / (1 / Math.tan(angleA) + 1 / Math.tan(angleB));
  const C = { x: A.x + height / Math.tan(angleA), y: A.y - height }, E = { x: C.x + (C.x - B.x) * .4, y: C.y + (C.y - B.y) * .4 };
  return svgFigure('Треугольник с углами 43 и 62 градусов и внешним углом x', `<path d="M${A.x} ${A.y} ${B.x} ${B.y} ${C.x.toFixed(2)} ${C.y.toFixed(2)}Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/><path d="M${C.x.toFixed(2)} ${C.y.toFixed(2)} ${E.x.toFixed(2)} ${E.y.toFixed(2)}" stroke="#3158f5" stroke-width="2.5"/>${svgAngleArc(A, B, C, 13)}${svgAngleArc(B, C, A, 13)}${svgAngleArc(C, A, E, 13)}${svgText(82, 132, '43°')}${svgText(239, 132, '62°')}${svgText(174, -3, 'x')}${svgText(37, 160, 'A', 12)}${svgText(284, 160, 'B', 12)}${svgText(C.x + 9, C.y, 'C', 12)}<text x="12" y="16" fill="#8490a5" font-family="system-ui,sans-serif" font-size="13">схема, не в масштабе</text>`,'0 -55 320 230');
};
const similarTrianglesFigure = ({ small = '', large = '', factor = '' } = {}) => {
  const firstNumber = value => {
    const match = String(value).match(/[\d.,]+/);
    return match ? Number.parseFloat(match[0].replace(',', '.')) : NaN;
  };
  const explicitFactor = String(factor).match(/k\s*=\s*([\d.,]+(?:\s*\/\s*[\d.,]+)?)/i);
  const ratioPair = String(factor).match(/([\d.,]+)\s*:\s*([\d.,]+)/);
  const smallValue = firstNumber(small), largeValue = firstNumber(large);
  const isArea = /^\s*S\s*=/i.test(String(small)) && /^\s*S\s*=/i.test(String(large));
  const parseRatio = value => {
    const parts = String(value).split('/').map(part => Number.parseFloat(part.replace(',', '.')));
    return parts.length === 2 ? parts[0] / parts[1] : parts[0];
  };
  const factorValue = explicitFactor ? parseRatio(explicitFactor[1]) : NaN;
  const pairValue = ratioPair ? Number.parseFloat(ratioPair[2].replace(',', '.')) / Number.parseFloat(ratioPair[1].replace(',', '.')) : NaN;
  const ratio = Number.isFinite(factorValue) ? factorValue
    : Number.isFinite(pairValue) ? (isArea ? Math.sqrt(pairValue) : pairValue)
    : Number.isFinite(smallValue) && Number.isFinite(largeValue) && smallValue > 0 && largeValue > 0
      ? (isArea ? Math.sqrt(largeValue / smallValue) : largeValue / smallValue) : 2;
  const k = Number.isFinite(ratio) && ratio > 0 ? ratio : 2;
  const largeBase = Math.min(140, 80 * k), smallBase = largeBase / k;
  const smallHeight = smallBase * 55 / 70, largeHeight = largeBase * 55 / 70;
  const smallPoints = { B: { x: 70 - smallBase / 2, y: 140 }, A: { x: 70, y: 140 - smallHeight }, C: { x: 70 + smallBase / 2, y: 140 } };
  const largePoints = { B: { x: 235 - largeBase / 2, y: 140 }, A: { x: 235, y: 140 - largeHeight }, C: { x: 235 + largeBase / 2, y: 140 } };
  const labels = (value, points, centroid) => {
    if (!value) return '';
    const parts = String(value).split(';').map(part => part.trim()).filter(Boolean);
    if (parts.length < 2) return svgText(centroid.x, parts[0].startsWith('S') ? 164 : 157, parts[0], 11);
    return parts.slice(0, 2).map((part, index) => {
      const [P, Q] = index === 0 ? [points.B, points.A] : [points.A, points.C];
      const M = { x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 };
      const dx = M.x - centroid.x, dy = M.y - centroid.y, length = Math.hypot(dx, dy) || 1;
      return svgText(M.x + dx / length * 11, M.y + dy / length * 11, part, 11);
    }).join('');
  };
  const smallCentroid = { x: 70, y: (smallPoints.A.y + 280) / 3 }, largeCentroid = { x: 235, y: (largePoints.A.y + 280) / 3 };
  const labelPoint = (point, label, anchor = 'middle') => svgText(point.x, point.y, label, 11, '#42506a', anchor);
  return svgFigure('Два подобных треугольника с соответствующими сторонами', `<path d="M${smallPoints.B.x} 140 ${smallPoints.A.x} ${smallPoints.A.y} ${smallPoints.C.x} 140Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.2"/><path d="M${largePoints.B.x} 140 ${largePoints.A.x} ${largePoints.A.y} ${largePoints.C.x} 140Z" fill="#f3efff" stroke="#8b68b3" stroke-width="2.2"/>${labels(small, smallPoints, smallCentroid)}${labels(large, largePoints, largeCentroid)}${factor ? svgText(160, 18, factor, 11, '#42506a') : ''}${labelPoint({ x: 70, y: smallPoints.A.y - 6 }, 'A')}${labelPoint({ x: smallPoints.B.x - 6, y: 150 }, 'B')}${labelPoint({ x: smallPoints.C.x + 6, y: 150 }, 'C')}${labelPoint({ x: 235, y: largePoints.A.y - 6 }, 'A′')}${labelPoint({ x: largePoints.B.x - 6, y: 150 }, 'B′')}${labelPoint({ x: largePoints.C.x + 6, y: 150 }, 'C′')}`, '0 0 320 178');
};
const congruenceFigure = () => {
  const A = { x: 35, y: 132 }, B = { x: 115, y: 132 }, C = { x: 75, y: 56 };
  const Ap = { x: 205, y: 132 }, Bp = { x: 285, y: 132 }, Cp = { x: 245, y: 56 };
  return svgFigure('Два треугольника с двумя соответствующими сторонами и углом между ними, отмеченными одинаково', `<path d="M35 132 115 132 75 56Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.2"/><path d="M205 132 285 132 245 56Z" fill="#f3efff" stroke="#8b68b3" stroke-width="2.2"/><path d="M75 128v8M245 128v8M49 95l9 5M53 87l9 5M219 95l9 5M223 87l9 5" stroke="#ff795f" stroke-width="2"/>${svgAngleArc(A, B, C, 16)}${svgAngleArc(Ap, Bp, Cp, 16)}${svgText(75, 153, 'A', 11)}${svgText(31, 145, 'B', 11)}${svgText(75, 49, 'C', 11)}${svgText(245, 153, 'A′', 11)}${svgText(201, 145, 'B′', 11)}${svgText(245, 49, 'C′', 11)}${svgText(160, 34, 'две стороны и угол между ними', 11)}`);
};
const similarityCriterionFigure = () => {
  const A = { x: 35, y: 132 }, B = { x: 115, y: 132 }, C = { x: 75, y: 56 };
  const Ap = { x: 205, y: 132 }, Bp = { x: 285, y: 132 }, Cp = { x: 245, y: 56 };
  return svgFigure('Два треугольника с двумя парами равных углов', `<path d="M35 132 115 132 75 56Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.2"/><path d="M205 132 285 132 245 56Z" fill="#f3efff" stroke="#8b68b3" stroke-width="2.2"/>${svgAngleArc(A, B, C, 14)}${svgAngleArc(Ap, Bp, Cp, 14)}${svgAngleArc(C, A, B, 14)}${svgAngleArc(C, A, B, 20)}${svgAngleArc(Cp, Ap, Bp, 14)}${svgAngleArc(Cp, Ap, Bp, 20)}${svgText(75, 153, 'A', 11)}${svgText(31, 145, 'B', 11)}${svgText(75, 49, 'C', 11)}${svgText(245, 153, 'A′', 11)}${svgText(201, 145, 'B′', 11)}${svgText(245, 49, 'C′', 11)}${svgText(160, 34, 'две пары равных углов', 11)}`);
};
const rightTriangleFigure = ({ vertical = '', base = '', hypotenuse = '', angleB = '', angleC = '', label = 'Прямоугольный треугольник' } = {}) => {
  const number = value => Number.parseFloat(String(value).replace('°', ''));
  const a = number(vertical), b = number(base), c = number(hypotenuse), angle = number(angleB);
  let ratio = Number.isFinite(angle) ? Math.tan(angle * Math.PI / 180) : Number.isFinite(a) && Number.isFinite(b) ? a / b : Number.isFinite(a) && Number.isFinite(c) && c > a ? a / Math.sqrt(c * c - a * a) : Number.isFinite(b) && Number.isFinite(c) && c > b ? Math.sqrt(c * c - b * b) / b : .75;
  if (!Number.isFinite(ratio) || ratio <= 0) ratio = .75;
  const baseLength = Math.min(170, 112 / ratio), height = baseLength * ratio;
  const x = 160 - baseLength / 2, y = 158, bx = x + baseLength, cy = y - height;
  const A = { x, y }, B = { x: bx, y }, C = { x, y: cy };
  return svgFigure(label, `<path d="M${x.toFixed(1)} ${y} ${bx.toFixed(1)} ${y} ${x.toFixed(1)} ${cy.toFixed(1)}Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/><path d="M${x.toFixed(1)} ${(y - 13).toFixed(1)}h13v13" fill="none" stroke="#ff795f" stroke-width="2"/>${angleB ? svgAngleArc(B, A, C) : ''}${angleC ? svgAngleArc(C, A, B) : ''}${vertical ? svgText(x + 9, (y + cy) / 2, vertical) : ''}${base ? svgText(160, 178, base) : ''}${hypotenuse ? svgText((bx + x) / 2 + 11, (y + cy) / 2, hypotenuse) : ''}${angleB ? svgText(bx - 24, y - 10, angleB) : ''}${angleC ? svgText(x + 20, cy + 22, angleC) : ''}${svgText(x - 12, 174, 'A', 12)}${svgText(bx + 12, 174, 'B', 12)}${svgText(x - 3, cy - 7, 'C', 12)}`,'0 0 320 190');
};
const triangleHeightFigure = ({ base = '', height = '' } = {}) => {
  const a = Number.parseFloat(base), h = Number.parseFloat(height);
  const scale = Number.isFinite(a) && a > 0 && Number.isFinite(h) && h > 0 ? Math.min(230 / a, 105 / h) : 1;
  const basePx = Number.isFinite(a) && a > 0 ? a * scale : 230, heightPx = Number.isFinite(h) && h > 0 ? h * scale : 105;
  const left = 160 - basePx / 2, right = 160 + basePx / 2, top = 130 - heightPx;
  return svgFigure('Треугольник с высотой к основанию', `<path d="M${left} 130 160 ${top} ${right} 130Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/><path d="M160 ${top}v${heightPx}" fill="none" stroke="#ff795f" stroke-width="2" stroke-dasharray="5 3"/><path d="M160 130v-15h15v15" fill="none" stroke="#ff795f" stroke-width="2"/>${base ? svgText(160, 151, base) : ''}${height ? svgText(168, (top + 130) / 2, height) : ''}${svgText(left - 7, 145, 'A', 12)}${svgText(right + 7, 145, 'B', 12)}${svgText(160, top - 6, 'C', 12)}${svgText(142, 126, 'H', 11)}`);
};
const altitudeFigure = () => {
  const A = { x: 48, y: 126 }, B = { x: 272, y: 126 }, scale = (B.x - A.x) / 13;
  const D = { x: A.x + 4 * scale, y: 126 }, height = 6 * scale, C = { x: D.x, y: D.y - height };
  return svgFigure('Высота прямоугольного треугольника делит гипотенузу на отрезки 4 и 9', `<path d="M${A.x} ${A.y} ${C.x.toFixed(2)} ${C.y.toFixed(2)} ${B.x} ${B.y}Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/><path d="M${C.x.toFixed(2)} ${C.y.toFixed(2)}V${D.y}" fill="none" stroke="#ff795f" stroke-width="2" stroke-dasharray="5 3"/>${svgRightAngleMark(D, C, B)}${svgRightAngleMark(C, A, B, 10)}${svgText((A.x + D.x) / 2, 145, '4')}${svgText((D.x + B.x) / 2, 145, '9')}${svgText(D.x + 10, (C.y + D.y) / 2, 'h')}${svgText(A.x - 5, 141, 'A', 12)}${svgText(B.x + 8, 141, 'B', 12)}${svgText(C.x, C.y - 7, 'C', 12)}${svgText(D.x, 145, 'D', 12)}`);
};
const parallelogramFigure = ({ angle = '', opposite = '', base = '', height = '', diagonals = false, label = 'Параллелограмм' } = {}) => {
  const a = Number.parseFloat(base), h = Number.parseFloat(height);
  const heightPx = Number.isFinite(a) && a > 0 && Number.isFinite(h) && h > 0 ? Math.min(96, 208 * h / a) : 96;
  const top = 128 - heightPx, A = { x: 70, y: top }, B = { x: 278, y: top }, C = { x: 240, y: 128 }, D = { x: 32, y: 128 };
  return svgFigure(label, `<path d="M${A.x} ${A.y} ${B.x} ${B.y} ${C.x} ${C.y} ${D.x} ${D.y}Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/>${diagonals ? `<path d="M${A.x} ${A.y} ${C.x} ${C.y}M${B.x} ${B.y} ${D.x} ${D.y}" stroke="#ff795f" stroke-width="1.7"/>` : ''}${angle ? svgAngleArc(A, B, D, 14) : ''}${opposite ? svgAngleArc(D, A, C, 14) : ''}${angle ? svgText(92, 52, angle) : ''}${opposite ? svgText(61, 111, opposite) : ''}${base ? svgText(162, 149, base) : ''}${height ? `<path d="M${A.x} ${A.y}V${D.y}" stroke="#ff795f" stroke-width="1.8" stroke-dasharray="4 3"/><path d="M${A.x} 128v-14h14v14" stroke="#ff795f" stroke-width="1.8"/>${svgText(83, (top + 128) / 2, height)}` : ''}${svgText(58, top - 7, 'A', 12)}${svgText(286, top - 7, 'B', 12)}${svgText(247, 145, 'C', 12)}${svgText(23, 145, 'D', 12)}`);
};
const equalDiagonalsParallelogramFigure = () => svgFigure('Параллелограмм с равными диагоналями', `<path d="M70 32H278V128H70Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/><path d="M70 32 278 128M278 32 70 128" stroke="#ff795f" stroke-width="1.8"/><path d="M161.5 79.7 165.7 70.7M182.3 70.7 186.5 79.7" stroke="#3158f5" stroke-width="2.2"/>${svgText(58, 27, 'A', 12)}${svgText(290, 27, 'B', 12)}${svgText(290, 143, 'C', 12)}${svgText(58, 143, 'D', 12)}`);
const bisectedDiagonalsFigure = () => {
  const A = { x: 70, y: 32 }, B = { x: 278, y: 32 }, C = { x: 240, y: 128 }, D = { x: 32, y: 128 }, O = { x: 155, y: 80 };
  const tick = (P, Q, count = 1) => {
    const dx = Q.x - P.x, dy = Q.y - P.y, length = Math.hypot(dx, dy), nx = -dy / length * 5, ny = dx / length * 5, tx = dx / length * 3, ty = dy / length * 3;
    return Array.from({ length: count }, (_, index) => {
      const shift = (index - (count - 1) / 2) * 5, x = (P.x + Q.x) / 2 + tx * shift, y = (P.y + Q.y) / 2 + ty * shift;
      return `M${(x - nx).toFixed(1)} ${(y - ny).toFixed(1)}L${(x + nx).toFixed(1)} ${(y + ny).toFixed(1)}`;
    }).join('');
  };
  const marks = `${tick(A, O)}${tick(O, C)}${tick(B, O, 2)}${tick(O, D, 2)}`;
  return svgFigure('Четырёхугольник с диагоналями, которые точкой пересечения делятся пополам', `<path d="M70 32 278 32 240 128 32 128Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/><path d="M70 32 240 128M278 32 32 128" stroke="#ff795f" stroke-width="1.8"/><path d="${marks}" stroke="#3158f5" stroke-width="2.2"/>${svgText(58, 27, 'A', 12)}${svgText(290, 27, 'B', 12)}${svgText(250, 143, 'C', 12)}${svgText(20, 143, 'D', 12)}${svgText(164, 78, 'O', 11)}`);
};
const rectangleFigure = ({ sideA = '', sideB = '', diagonal = '', diagonals = false, label = 'Прямоугольник' } = {}) => {
  const a = Number.parseFloat(sideA), b = Number.parseFloat(sideB);
  if (Number.isFinite(a) && Number.isFinite(b) && a > 0 && b > 0) {
    let height = 130, width = height * a / b;
    if (width > 190) width = 190, height = width * b / a;
    const x = (320 - width) / 2, y = (180 - height) / 2;
    return svgFigure(label, `<path d="M${x.toFixed(1)} ${y.toFixed(1)}h${width.toFixed(1)}v${height.toFixed(1)}h-${width.toFixed(1)}Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/><path d="M${x.toFixed(1)} ${y.toFixed(1)}l${width.toFixed(1)} ${height.toFixed(1)}${diagonals ? `M${(x + width).toFixed(1)} ${y.toFixed(1)}l-${width.toFixed(1)} ${height.toFixed(1)}` : ''}" stroke="#ff795f" stroke-width="2"/>${svgText(x + width / 2, y - 7, sideA)}${svgText(x - 14, y + height / 2, sideB)}${diagonal ? svgText(x + width / 2 + 8, y + height / 2 - 4, diagonal) : ''}${svgText(x - 9, y + 3, 'A', 12)}${svgText(x + width + 9, y + 3, 'B', 12)}${svgText(x + width + 9, y + height + 3, 'C', 12)}${svgText(x - 9, y + height + 3, 'D', 12)}`, '0 0 320 190');
  }
  return svgFigure(label, `<path d="M65 32h190v96H65Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/><path d="M65 32 255 128${diagonals ? 'M255 32 65 128' : ''}" stroke="#ff795f" stroke-width="2"/>${diagonal ? svgText(164, 72, diagonal) : ''}${svgText(58, 28, 'A', 12)}${svgText(263, 28, 'B', 12)}${svgText(263, 144, 'C', 12)}${svgText(58, 144, 'D', 12)}`);
};
const rhombusFigure = ({ diagonal1 = '', diagonal2 = '', label = 'Ромб и его диагонали' } = {}) => {
  const d1 = Number.parseFloat(diagonal1), d2 = Number.parseFloat(diagonal2);
  const scale = Number.isFinite(d1) && d1 > 0 && Number.isFinite(d2) && d2 > 0 ? Math.min(120 / d1, 210 / d2) : 1;
  const half1 = Number.isFinite(d1) && d1 > 0 ? d1 * scale / 2 : 60;
  const half2 = Number.isFinite(d2) && d2 > 0 ? d2 * scale / 2 : 110;
  const top = 80 - half1, bottom = 80 + half1, left = 160 - half2, right = 160 + half2;
  return svgFigure(label, `<path d="M160 ${top} ${right} 80 160 ${bottom} ${left} 80Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/><path d="M160 ${top}v${half1 * 2}M${left} 80h${half2 * 2}" stroke="#ff795f" stroke-width="2"/>${diagonal1 ? svgText(171, 48, diagonal1, 12, '#42506a', 'start') : ''}${diagonal2 ? svgText(right + 5, 76, diagonal2, 12, '#42506a', 'start') : ''}<path d="M160 72h8v8" fill="none" stroke="#42506a" stroke-width="1.5"/>`);
};
const squareFigure = (diagonal = '') => svgFigure('Квадрат с диагональю', `<path d="M95 25h130v130H95Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/><path d="M95 155 225 25" stroke="#ff795f" stroke-width="2.2"/>${diagonal ? svgText(172, 84, diagonal) : ''}`);
const trapezoidFigure = ({ baseA = '', baseB = '', height = '', midline = false, label = 'Трапеция' } = {}) => {
  const a = Number.parseFloat(baseA), b = Number.parseFloat(baseB), h = Number.parseFloat(height);
  const scale = Number.isFinite(a) && a > 0 && Number.isFinite(b) && b > 0 ? Math.min(160 / a, 120 / b, Number.isFinite(h) && h > 0 ? 96 / h : Infinity) : 1;
  const bottom = Number.isFinite(a) && a > 0 ? a * scale : 160, top = Number.isFinite(b) && b > 0 ? b * scale : 100;
  const leftBottom = 160 - bottom / 2, rightBottom = 160 + bottom / 2, leftTop = 160 - top / 2, rightTop = 160 + top / 2;
  const heightPx = Number.isFinite(h) && h > 0 ? h * scale : 96, topY = 130 - heightPx;
  const midLeft = (leftBottom + leftTop) / 2, midRight = (rightBottom + rightTop) / 2, midY = (130 + topY) / 2;
  return svgFigure(label, `<path d="M${leftBottom} 130 ${leftTop} ${topY} ${rightTop} ${topY} ${rightBottom} 130Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/>${midline ? `<path d="M${midLeft} ${midY}H${midRight}" stroke="#ff795f" stroke-width="2" stroke-dasharray="5 3"/>${svgText(160, midY - 10, 'm')}` : ''}${height ? `<path d="M${leftTop} ${topY}V130" stroke="#ff795f" stroke-width="1.8" stroke-dasharray="4 3"/><path d="M${leftTop} 130v-14h14v14" stroke="#ff795f" stroke-width="1.8"/>${svgText(leftTop + 10, midY, height)}` : ''}${baseA ? svgText(160, 151, baseA) : ''}${baseB ? svgText(160, topY - 7, baseB) : ''}`);
};
const compositeAreaFigure = () => svgFigure('Прямоугольник 8 на 6 с вырезанным прямоугольным треугольником 4 на 3', `<path d="M64 16h192v144H64Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/><path d="M64 88h96v72Z" fill="#fff" stroke="#ff795f" stroke-width="2.2"/><path d="M147 88h13v13" fill="none" stroke="#ff795f" stroke-width="1.6"/>${svgText(160, 34, '8')}${svgText(52, 94, '6')}${svgText(112, 82, '4')}${svgText(170, 127, '3')}`);
const circleAngleFigure = ({ kind = 'central', given = '', unknown = 'x', label = 'Центральный и вписанный углы одной окружности' } = {}) => {
  const givenValue = Number.parseFloat(String(given).replace('°', ''));
  const central = kind === 'central' ? givenValue : givenValue * 2;
  const half = Math.max(18, Math.min(78, (Number.isFinite(central) ? central : 90) / 2));
  const rad = value => value * Math.PI / 180, point = angle => ({ x: 160 + 61 * Math.cos(rad(angle)), y: 82 + 61 * Math.sin(rad(angle)) });
  const A = point(-90 - half), B = point(-90 + half), C = point(90);
  const arcPath = (vertex, start, end, radius) => {
    const P = { x: vertex.x + radius * Math.cos(rad(start)), y: vertex.y + radius * Math.sin(rad(start)) }, Q = { x: vertex.x + radius * Math.cos(rad(end)), y: vertex.y + radius * Math.sin(rad(end)) };
    return `M${P.x.toFixed(1)} ${P.y.toFixed(1)}A${radius} ${radius} 0 0 1 ${Q.x.toFixed(1)} ${Q.y.toFixed(1)}`;
  };
  const center = { x: 160, y: 82 }, centralArc = arcPath(center, -90 - half, -90 + half, 12);
  const directionA = Math.atan2(A.y - C.y, A.x - C.x) * 180 / Math.PI, directionB = Math.atan2(B.y - C.y, B.x - C.x) * 180 / Math.PI;
  const inscribedArc = arcPath(C, directionA, directionB, 12);
  const rays = `M160 82L${A.x.toFixed(1)} ${A.y.toFixed(1)}M160 82L${B.x.toFixed(1)} ${B.y.toFixed(1)}M${C.x.toFixed(1)} ${C.y.toFixed(1)}L${A.x.toFixed(1)} ${A.y.toFixed(1)}M${C.x.toFixed(1)} ${C.y.toFixed(1)}L${B.x.toFixed(1)} ${B.y.toFixed(1)}`;
  return svgFigure(label, `<circle cx="160" cy="82" r="61" fill="#f2f4ff" stroke="#3158f5" stroke-width="2.2"/><path d="${rays}" fill="none" stroke="#52617b" stroke-width="1.8"/><path d="${centralArc} ${inscribedArc}" fill="none" stroke="#ff795f" stroke-width="2.2"/><circle cx="160" cy="82" r="2.8" fill="#ff795f"/>${kind === 'central' ? `${svgText(160, 52, given)}${svgText(160, 112, unknown)}` : `${svgText(160, 52, unknown)}${svgText(160, 112, given)}`}${svgText(A.x - 8, A.y - 5, 'A', 12)}${svgText(B.x + 8, B.y - 5, 'B', 12)}${svgText(C.x, C.y + 17, 'C', 12)}${svgText(173, 94, 'O', 12)}`, '0 0 320 178');
};
const diameterFigure = () => {
  const A = { x: 98, y: 80 }, B = { x: 222, y: 80 }, C = { x: 160, y: 18 };
  return svgFigure('Вписанный угол, опирающийся на диаметр AB', `<circle cx="160" cy="80" r="62" fill="#f2f4ff" stroke="#3158f5" stroke-width="2.2"/><path d="M98 80h124M160 18 98 80m62-62 62 62" fill="none" stroke="#52617b" stroke-width="1.8"/>${svgAngleArc(C, A, B, 13)}${svgText(95, 83, 'A', 12)}${svgText(225, 83, 'B', 12)}${svgText(160, 15, 'C', 12)}${svgText(160, 45, 'x')}`);
};
const chordFigure = ({ radius = '', distance = '', chord = '', halfChord = '', label = 'Хорда и перпендикуляр из центра окружности' } = {}) => {
  const value = text => Number.parseFloat(text);
  const radiusValue = value(radius), distanceValue = value(distance), chordValue = value(chord), halfValue = value(halfChord);
  let r = Number.isFinite(radiusValue) ? radiusValue : NaN;
  let d = Number.isFinite(distanceValue) ? distanceValue : NaN;
  let h = Number.isFinite(halfValue) ? halfValue : Number.isFinite(chordValue) ? chordValue / 2 : NaN;
  if (!Number.isFinite(h) && Number.isFinite(r) && Number.isFinite(d) && r > d) h = Math.sqrt(r * r - d * d);
  if (!Number.isFinite(r) && Number.isFinite(h) && Number.isFinite(d)) r = Math.hypot(h, d);
  if (!Number.isFinite(d) && Number.isFinite(r) && Number.isFinite(h) && r > h) d = Math.sqrt(r * r - h * h);
  if (![r, d, h].every(Number.isFinite) || r <= 0 || d < 0 || h <= 0) r = 65, d = 25, h = 60;
  const scale = Math.min(65 / r, 12), drawnR = r * scale, drawnD = d * scale, drawnH = h * scale, chordY = 82 - drawnD;
  const left = 160 - drawnH, right = 160 + drawnH;
  const radiusLabel = Number.isFinite(radiusValue) || (Number.isFinite(chordValue) && Number.isFinite(distanceValue)) ? svgText(160 - drawnH / 2 - 7, 82 - drawnD / 2 - 7, radius || `√(${chord}² + ${distance}²)`, 12) : '';
  return svgFigure(label, `<circle cx="160" cy="82" r="${drawnR}" fill="#f2f4ff" stroke="#3158f5" stroke-width="2.2"/><path d="M${left} ${chordY}H${right}M160 82V${chordY}M160 82 ${left} ${chordY}" fill="none" stroke="#52617b" stroke-width="1.8"/><path d="M160 ${chordY}h9v9h-9" fill="none" stroke="#ff795f" stroke-width="1.8"/><circle cx="160" cy="82" r="2.8" fill="#ff795f"/>${radiusLabel}${distance ? svgText(146, (82 + chordY) / 2, distance) : ''}${chord ? svgText(160, chordY - 14, chord) : ''}${halfChord ? svgText(160 + drawnH / 2, chordY + 16, halfChord) : ''}${svgText(left - 7, chordY - 3, 'A', 12)}${svgText(right + 7, chordY - 3, 'B', 12)}${svgText(173, 98, 'O', 12)}${svgText(174, chordY - 4, 'H', 12)}`);
};
const equalChordsFigure = () => {
  const half = Math.sqrt(65 ** 2 - 37 ** 2), left = 160 - half, right = 160 + half;
  return svgFigure('Равные хорды AB и CD в одной окружности', `<circle cx="160" cy="82" r="65" fill="#f2f4ff" stroke="#3158f5" stroke-width="2.2"/><path d="M${left.toFixed(2)} 45H${right.toFixed(2)}M${left.toFixed(2)} 119H${right.toFixed(2)}" stroke="#52617b" stroke-width="2"/><path d="M154 40v10m12-10v10M154 114v10m12-10v10" stroke="#ff795f" stroke-width="2"/>${svgText(left - 6, 43, 'A', 12)}${svgText(right + 6, 43, 'B', 12)}${svgText(left - 6, 123, 'C', 12)}${svgText(right + 6, 123, 'D', 12)}${svgText(160, 86, 'O', 12)}`);
};
const tangentFigure = ({ type = 'radius', first = '', second = '', label = 'Касательная к окружности и радиус в точке касания' } = {}) => {
  if (type === 'two') {
    const P = { x: 80, y: 82 }, O = { x: 200, y: 82 }, r = 48, delta = O.x - P.x;
    const offset = Math.sqrt(r * r - (r * r / delta) ** 2), A = { x: O.x - r * r / delta, y: O.y - offset }, B = { x: O.x - r * r / delta, y: O.y + offset };
    return svgFigure('Две касательные из точки P к окружности', `<circle cx="${O.x}" cy="${O.y}" r="${r}" fill="#f2f4ff" stroke="#3158f5" stroke-width="2.2"/><path d="M${P.x} ${P.y} ${A.x.toFixed(2)} ${A.y.toFixed(2)}M${P.x} ${P.y} ${B.x.toFixed(2)} ${B.y.toFixed(2)}M${O.x} ${O.y} ${A.x.toFixed(2)} ${A.y.toFixed(2)}M${O.x} ${O.y} ${B.x.toFixed(2)} ${B.y.toFixed(2)}" fill="none" stroke="#52617b" stroke-width="1.8"/>${svgRightAngleMark(A, O, P, 8)}${svgRightAngleMark(B, O, P, 8)}<circle cx="${A.x.toFixed(2)}" cy="${A.y.toFixed(2)}" r="2.8" fill="#ff795f"/><circle cx="${B.x.toFixed(2)}" cy="${B.y.toFixed(2)}" r="2.8" fill="#ff795f"/>${svgText(75, 77, 'P', 12)}${svgText(A.x - 5, A.y - 8, 'A', 12)}${svgText(B.x - 5, B.y + 16, 'B', 12)}${svgText(201, 86, 'O', 12)}${svgText(127, 49, first)}${svgText(127, 121, second)}`);
  }
  if (type === 'secant') {
    const P = { x: 76, y: 82 }, O = { x: 206, y: 82 }, r = 46, delta = O.x - P.x;
    const offset = Math.sqrt(r * r - (r * r / delta) ** 2), T = { x: O.x - r * r / delta, y: O.y - offset }, A = { x: O.x - r, y: O.y }, B = { x: O.x + r, y: O.y };
    return svgFigure('Касательная и секущая из точки P: PA — внешняя часть, PB — вся секущая', `<circle cx="${O.x}" cy="${O.y}" r="${r}" fill="#f2f4ff" stroke="#3158f5" stroke-width="2.2"/><path d="M${P.x} ${P.y}H${B.x}M${P.x} ${P.y} ${T.x.toFixed(2)} ${T.y.toFixed(2)}M${O.x} ${O.y} ${T.x.toFixed(2)} ${T.y.toFixed(2)}" fill="none" stroke="#52617b" stroke-width="1.8"/><path d="M${P.x} 100H${A.x}M${P.x} 119H${B.x}" stroke="#ff795f" stroke-width="1.3" stroke-dasharray="3 3"/><circle cx="${A.x}" cy="${A.y}" r="3" fill="#ff795f"/><circle cx="${B.x}" cy="${B.y}" r="3" fill="#ff795f"/><circle cx="${T.x.toFixed(2)}" cy="${T.y.toFixed(2)}" r="2.8" fill="#ff795f"/><circle cx="${O.x}" cy="${O.y}" r="2.8" fill="#ff795f"/>${svgRightAngleMark(T, O, P, 8)}${svgText(69, 77, 'P', 12)}${svgText(A.x, 103, 'A', 12)}${svgText(B.x + 7, 103, 'B', 12)}${svgText(212, 86, 'O', 12)}${svgText(T.x + 3, T.y - 9, 'T', 12)}${svgText((P.x + A.x) / 2, 96, first)}${svgText((P.x + B.x) / 2, 116, second)}${svgText(133, 55, 'x')}`);
  }
  return svgFigure(label, `<circle cx="160" cy="82" r="55" fill="#f2f4ff" stroke="#3158f5" stroke-width="2.2"/><path d="M215 20v124M160 82h55" fill="none" stroke="#52617b" stroke-width="1.8"/><path d="M199 82v-16h16v16" fill="none" stroke="#ff795f" stroke-width="1.8"/>${svgText(160, 86, 'O', 12)}${svgText(224, 83, 'T', 12)}${svgText(188, 74, first)}${svgText(231, 45, second)}`);
};
const parallelAngleFigure = ({ kind = 'alternate', given = '', unknown = 'x', label = 'Параллельные прямые и секущая' } = {}) => {
  if (kind === 'vertical' || kind === 'adjacent') {
    const O = { x: 160, y: 80 }, value = Number.parseFloat(String(given).replace('°', ''));
    const acute = Number.isFinite(value) ? Math.min(value, 180 - value) : 58, rad = acute * Math.PI / 180;
    const NE = { x: O.x + 75 * Math.cos(rad), y: O.y - 75 * Math.sin(rad) };
    const SW = { x: O.x - 75 * Math.cos(rad), y: O.y + 75 * Math.sin(rad) };
    const E = { x: 275, y: 80 }, W = { x: 45, y: 80 }, obtuseGiven = Number.isFinite(value) && value > 90;
    const point = degrees => ({ x: O.x + 25 * Math.cos(degrees * Math.PI / 180), y: O.y + 25 * Math.sin(degrees * Math.PI / 180) });
    const givenAngle = obtuseGiven ? 270 - acute / 2 : -acute / 2;
    const unknownAngle = kind === 'vertical' ? (obtuseGiven ? 90 - acute / 2 : 180 - acute / 2) : (obtuseGiven ? -acute / 2 : 270 - acute / 2);
    const marks = kind === 'vertical'
      ? (obtuseGiven ? `${svgAngleArc(O, NE, W)}${svgAngleArc(O, SW, E)}` : `${svgAngleArc(O, NE, E)}${svgAngleArc(O, W, SW)}`)
      : (obtuseGiven ? `${svgAngleArc(O, NE, W)}${svgAngleArc(O, NE, E)}` : `${svgAngleArc(O, NE, E)}${svgAngleArc(O, NE, W)}`);
    return svgFigure('Две пересекающиеся прямые и вертикальные или смежные углы', `<path d="M${SW.x} ${SW.y} ${NE.x} ${NE.y}M45 80h230" stroke="#3158f5" stroke-width="2.4"/>${marks}<circle cx="160" cy="80" r="3" fill="#ff795f"/>${svgText(point(givenAngle).x, point(givenAngle).y, given)}${svgText(point(unknownAngle).x, point(unknownAngle).y, unknown)}`);
  }
  const value = Number.parseFloat(String(given).replace('°', ''));
  const acute = Number.isFinite(value) ? Math.min(value, 180 - value) : 72;
  const alpha = acute * Math.PI / 180, dx = 75 / Math.tan(alpha);
  const upper = { x: 210, y: 45 }, lower = { x: upper.x - dx, y: 120 };
  const upperEast = { x: 285, y: 45 }, upperWest = { x: 35, y: 45 }, lowerEast = { x: 285, y: 120 }, lowerWest = { x: 35, y: 120 };
  const anglePoint = (center, degrees) => ({ x: center.x + 25 * Math.cos(degrees * Math.PI / 180), y: center.y + 25 * Math.sin(degrees * Math.PI / 180) });
  const upperAcute = anglePoint(upper, 180 - acute / 2), upperObtuse = anglePoint(upper, 90 - acute / 2);
  const lowerAcute = anglePoint(lower, 360 - acute / 2), lowerObtuse = anglePoint(lower, 270 - acute / 2);
  const givenAcute = !Number.isFinite(value) || value <= 90;
  const givenLabel = svgText(givenAcute ? upperAcute.x : upperObtuse.x, givenAcute ? upperAcute.y : upperObtuse.y, given);
  const unknownPoint = kind === 'same-side' ? (givenAcute ? lowerObtuse : lowerAcute) : (givenAcute ? lowerAcute : lowerObtuse);
  const secondLabel = svgText(unknownPoint.x, unknownPoint.y, unknown);
  const upperMark = givenAcute ? svgAngleArc(upper, upperWest, lower) : svgAngleArc(upper, upperEast, lower);
  const lowerMark = kind === 'same-side'
    ? (givenAcute ? svgAngleArc(lower, lowerWest, upper) : svgAngleArc(lower, upper, lowerEast))
    : (givenAcute ? svgAngleArc(lower, upper, lowerEast) : svgAngleArc(lower, lowerWest, upper));
  const startX = lower.x - 28 / Math.tan(alpha), endX = upper.x + 28 / Math.tan(alpha);
  return svgFigure(label, `<path d="M35 45h250M35 120h250M${startX} 148 ${endX} 17" stroke="#3158f5" stroke-width="2.4"/><path d="M72 39h14m-7-6 7 6-7 6M72 114h14m-7-6 7 6-7 6" stroke="#ff795f" stroke-width="1.8"/>${upperMark}${lowerMark}${givenLabel}${secondLabel}`);
};
const axesFigure = (label, content) => svgFigure(label, `<path d="M35 130h250M160 150V15" stroke="#aeb8c8" stroke-width="1.4"/><path d="m285 130-7-4v8Zm-125-115-4 7h8Z" fill="#aeb8c8"/>${content}`);
const coordinateSegmentFigure = () => axesFigure('Точки A(1; 2) и B(4; 6) на координатной плоскости', `<path d="M180 106V42H240" fill="none" stroke="#ff795f" stroke-width="1.7" stroke-dasharray="4 3"/><path d="M180 106 240 42" stroke="#3158f5" stroke-width="2.5"/><circle cx="180" cy="106" r="4" fill="#ff795f"/><circle cx="240" cy="42" r="4" fill="#ff795f"/>${svgText(174, 120, 'A(1; 2)', 11)}${svgText(250, 37, 'B(4; 6)', 11, '#42506a', 'start')}`);
const midpointCoordinateFigure = () => axesFigure('Отрезок AB и его середина M', `<path d="M136 82 232 130" stroke="#3158f5" stroke-width="2.5"/><circle cx="136" cy="82" r="4" fill="#ff795f"/><circle cx="232" cy="130" r="4" fill="#ff795f"/><circle cx="184" cy="106" r="4" fill="#8b68b3"/>${svgText(127, 75, 'A(−2; 4)', 11)}${svgText(241, 143, 'B(6; 0)', 11, '#42506a', 'start')}${svgText(184, 96, 'M', 11)}`);
const vectorCoordinateFigure = () => axesFigure('Вектор AB от точки A к точке B', `<path d="M145 100 205 55" stroke="#3158f5" stroke-width="2.5"/><path d="M205 55 196.2 63 201 56.6Z" fill="#3158f5"/><circle cx="145" cy="100" r="4" fill="#ff795f"/><circle cx="205" cy="55" r="4" fill="#ff795f"/>${svgText(139, 115, 'A(−1; 2)', 11)}${svgText(214, 50, 'B(3; 5)', 11, '#42506a', 'start')}`);
const vectorLengthFigure = () => axesFigure('Вектор с координатами минус 5 и 12', `<path d="M160 130 120 34" stroke="#3158f5" stroke-width="2.5"/><path d="m120 34 2 10 7-5Z" fill="#3158f5"/><circle cx="160" cy="130" r="3.5" fill="#52617b"/><circle cx="120" cy="34" r="4" fill="#ff795f"/>${svgText(160, 145, 'O')}${svgText(111, 29, 'A(−5; 12)', 11, '#42506a', 'end')}`);
const vectorSumFigure = () => axesFigure('Сложение векторов по правилу треугольника', `<path d="M112 115 170 65 225 97" fill="none" stroke="#3158f5" stroke-width="2.5"/><path d="M170 65 160.6 67.9 165.8 73.9Z M225 97 215.2 95.9 219.2 89Z" fill="#3158f5"/><path d="M112 115 225 97" stroke="#ff795f" stroke-width="2" stroke-dasharray="5 3"/><path d="M225 97 216.7 102.4 215.5 94.5Z" fill="#ff795f"/>${svgText(140, 83, 'a')}${svgText(201, 72, 'b')}${svgText(170, 132, 'a + b')}`);
const circleCoordinateFigure = () => svgFigure('Окружность с центром O(2; −1) и радиусом 3', `<path d="M35 90h250M160 155V15" stroke="#aeb8c8" stroke-width="1.4"/><path d="m285 90-7-4v8Zm-125-75-4 7h8Z" fill="#aeb8c8"/><circle cx="184" cy="102" r="36" fill="#f2f4ff" stroke="#3158f5" stroke-width="2.2"/><circle cx="184" cy="102" r="3.5" fill="#ff795f"/><path d="M184 102h36" stroke="#ff795f" stroke-width="1.8"/>${svgText(191, 98, 'O(2; −1)', 11, '#42506a', 'start')}${svgText(208, 117, 'R = 3', 11)}`);
const transformedPointFigure = (label, content) => svgFigure(label, `<path d="M40 90h240M160 148V18" stroke="#aeb8c8" stroke-width="1.4"/><path d="m280 90-7-4v8Zm-120-72-4 7h8Z" fill="#aeb8c8"/>${content}`);
const reflectionXFigure = () => transformedPointFigure('Отражение точки относительно оси Ox', `<path d="M216 63V117" stroke="#ff795f" stroke-width="1.6" stroke-dasharray="4 3"/><circle cx="216" cy="117" r="4" fill="#52617b"/><circle cx="216" cy="63" r="4" fill="#ff795f"/>${svgText(229, 121, 'A(4; −3)', 11, '#42506a', 'start')}${svgText(229, 59, 'A′(4; 3)', 11, '#42506a', 'start')}`);
const centralReflectionFigure = () => transformedPointFigure('Центральная симметрия точки относительно начала координат', `<path d="M132 45 188 135" stroke="#ff795f" stroke-width="1.6" stroke-dasharray="4 3"/><circle cx="132" cy="45" r="4" fill="#52617b"/><circle cx="188" cy="135" r="4" fill="#ff795f"/><circle cx="160" cy="90" r="3" fill="#3158f5"/>${svgText(124, 39, 'B(−2; 5)', 11, '#42506a', 'end')}${svgText(198, 144, 'B′', 11, '#42506a', 'start')}${svgText(166, 85, 'O', 11)}`);
const translationFigure = () => transformedPointFigure('Параллельный перенос точки на вектор (3; −2)', `<path d="M174 54 216 72" stroke="#3158f5" stroke-width="2.5"/><path d="M216 72 208 72.9 211.2 65.6Z" fill="#3158f5"/><circle cx="174" cy="54" r="4" fill="#52617b"/><circle cx="216" cy="72" r="4" fill="#ff795f"/>${svgText(168, 45, 'A(1; 4)', 11, '#42506a', 'end')}${svgText(225, 76, 'A′(4; 2)', 11, '#42506a', 'start')}`);
const movementFigure = () => {
  const A = { x: 38, y: 126 }, B = { x: 105, y: 126 }, C = { x: 72, y: 71 };
  const Ap = { x: 205, y: 126 }, Bp = { x: 272, y: 126 }, Cp = { x: 239, y: 71 };
  return svgFigure('Две равные фигуры до и после движения: соответствующие стороны и углы сохраняются', `<path d="M38 126 105 126 72 71Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.2"/><path d="M205 126 272 126 239 71Z" fill="#f3efff" stroke="#8b68b3" stroke-width="2.2"/><path d="M71.5 126v-8m167 8v-8M118 96h59m-6-6 6 6-6 6" fill="none" stroke="#ff795f" stroke-width="2"/>${svgAngleArc(A, B, C, 15)}${svgAngleArc(Ap, Bp, Cp, 15)}${svgText(72, 66, 'до', 11)}${svgText(239, 66, 'после', 11)}`);
};
const rotationFigure = () => transformedPointFigure('Поворот точки на 90 градусов против часовой стрелки', `<path d="M160 90 188 76M160 90 146 62M188 76A31.305 31.305 0 0 0 146 62" fill="none" stroke="#52617b" stroke-width="2"/><path d="m146 62 5.4-7.2 3.6 7.2Z" fill="#ff795f"/><circle cx="188" cy="76" r="4" fill="#52617b"/><circle cx="146" cy="62" r="4" fill="#ff795f"/>${svgText(201, 76, '(2; 1)', 11, '#42506a', 'start')}${svgText(138, 55, '(−1; 2)', 11, '#42506a', 'end')}${svgText(160, 85, 'O', 11)}`);
const isoscelesAxisFigure = () => svgFigure('Ось симметрии равнобедренного треугольника', `<path d="M55 132 160 25 265 132Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/><path d="M160 25v107" stroke="#ff795f" stroke-width="2" stroke-dasharray="5 3"/><path d="M160 132v-13h13" fill="none" stroke="#52617b" stroke-width="1.6"/><path d="M104 78l10 8m102-8-10 8" stroke="#52617b" stroke-width="2"/>${svgText(160, 21, 'A', 12)}${svgText(45, 145, 'B', 12)}${svgText(275, 145, 'C', 12)}${svgText(168, 83, 'ось', 11)}`);
const incenterFigure = () => svgFigure('Треугольник с вписанной окружностью и центром I', `<path d="M95 132 160 20 225 132Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.3"/><circle cx="160" cy="94.5698" r="37.4302" fill="none" stroke="#ff795f" stroke-width="2"/><path d="M160 94.5698V132M160 94.5698 127.6267 75.7817" stroke="#52617b" stroke-width="1.4" stroke-dasharray="4 3"/><path d="M160 132v-10h10v10" stroke="#52617b" stroke-width="1.4"/><circle cx="160" cy="94.5698" r="2.8" fill="#3158f5"/>${svgText(174, 99, 'I', 12)}${svgText(160, 15, 'A', 12)}${svgText(88, 145, 'B', 12)}${svgText(232, 145, 'C', 12)}`);
const circumcenterFigure = () => svgFigure('Треугольник, вписанный в окружность с центром O', `<circle cx="160" cy="94.31" r="69.31" fill="#f2f4ff" stroke="#ff795f" stroke-width="2"/><path d="M160 25 100 129 220 129Z" fill="#eef1ff" fill-opacity=".75" stroke="#3158f5" stroke-width="2.3"/><path d="M160 94.31 160 25M160 94.31 100 129M160 94.31 220 129" stroke="#52617b" stroke-width="1.3" stroke-dasharray="4 3"/><circle cx="160" cy="94.31" r="2.8" fill="#3158f5"/>${svgText(173, 99, 'O', 12)}${svgText(160, 21, 'A', 12)}${svgText(93, 138, 'B', 12)}${svgText(227, 138, 'C', 12)}`);
const cyclicQuadrilateralFigure = () => {
  const point = degrees => ({ x: 160 + 66 * Math.cos(degrees * Math.PI / 180), y: 82 + 66 * Math.sin(degrees * Math.PI / 180) });
  const A = point(-120), B = point(-20), C = point(65), D = point(165);
  return svgFigure('Вписанный в окружность четырёхугольник ABCD', `<circle cx="160" cy="82" r="66" fill="#f2f4ff" stroke="#3158f5" stroke-width="2.2"/><path d="M${A.x.toFixed(2)} ${A.y.toFixed(2)} ${B.x.toFixed(2)} ${B.y.toFixed(2)} ${C.x.toFixed(2)} ${C.y.toFixed(2)} ${D.x.toFixed(2)} ${D.y.toFixed(2)}Z" fill="#fff" fill-opacity=".7" stroke="#52617b" stroke-width="2"/>${svgAngleArc(A, B, D, 13)}${svgAngleArc(C, B, D, 13)}${svgText(A.x - 7, A.y - 4, 'A', 12)}${svgText(B.x + 9, B.y - 2, 'B', 12)}${svgText(C.x + 5, C.y + 13, 'C', 12)}${svgText(D.x - 8, D.y + 4, 'D', 12)}${svgText(139, 37, 'x')}${svgText(171, 125, 'y')}`);
};
const cyclicAnglePairFigure = ({ given = '108°', unknown = 'x' } = {}) => {
  const point = degrees => ({ x: 160 + 64 * Math.cos(degrees * Math.PI / 180), y: 84 + 64 * Math.sin(degrees * Math.PI / 180) });
  const A = point(-120), B = point(-20), C = point(65), D = point(165);
  return svgFigure('Вписанный четырёхугольник: противоположные углы B и D', `<circle cx="160" cy="84" r="64" fill="#f2f4ff" stroke="#3158f5" stroke-width="2.2"/><path d="M${A.x.toFixed(2)} ${A.y.toFixed(2)} ${B.x.toFixed(2)} ${B.y.toFixed(2)} ${C.x.toFixed(2)} ${C.y.toFixed(2)} ${D.x.toFixed(2)} ${D.y.toFixed(2)}Z" fill="#fff" fill-opacity=".7" stroke="#52617b" stroke-width="2"/>${svgAngleArc(B, A, C, 13)}${svgAngleArc(D, C, A, 13)}${svgText(A.x - 8, A.y - 5, 'A', 12)}${svgText(B.x + 8, B.y - 4, 'B', 12)}${svgText(C.x + 7, C.y + 14, 'C', 12)}${svgText(D.x - 8, D.y + 5, 'D', 12)}${svgText(B.x + 7, B.y + 18, given)}${svgText(D.x - 8, D.y - 15, unknown)}`);
};
const rectangleDiagonalAngleFigure = ({ given = '32°', unknown = 'x' } = {}) => {
  const A = { x: 54, y: 20 }, B = { x: 266, y: 20 }, C = { x: 266, y: 152 }, D = { x: 54, y: 152 }, O = { x: 160, y: 86 };
  return svgFigure('Прямоугольник с диагоналями: угол диагонали со стороной и острый угол между диагоналями', `<path d="M54 20H266V152H54Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/><path d="M54 20 266 152M266 20 54 152" stroke="#52617b" stroke-width="2"/><path d="${svgAngleArc(A, B, C, 16)}${svgAngleArc(O, B, C, 19)}" fill="none" stroke="#ff795f" stroke-width="2.2"/>${svgText(84, 46, given)}${svgText(198, 84, unknown)}${svgText(46, 18, 'A', 12)}${svgText(274, 18, 'B', 12)}${svgText(274, 165, 'C', 12)}${svgText(46, 165, 'D', 12)}`, '0 0 320 178');
};
const diameterTriangleAnglesFigure = ({ given = '34°', unknown = 'x' } = {}) => {
  const O = { x: 160, y: 94 }, r = 62, A = { x: 98, y: 94 }, B = { x: 222, y: 94 }, angle = -68 * Math.PI / 180, C = { x: O.x + r * Math.cos(angle), y: O.y + r * Math.sin(angle) };
  return svgFigure('Треугольник ABC вписан в окружность, AB — диаметр', `<circle cx="160" cy="94" r="62" fill="#f2f4ff" stroke="#3158f5" stroke-width="2.2"/><path d="M98 94H222M98 94 ${C.x.toFixed(2)} ${C.y.toFixed(2)} ${C.x.toFixed(2)} ${C.y.toFixed(2)} 222 94" fill="none" stroke="#52617b" stroke-width="1.9"/>${svgAngleArc(A, B, C, 12)}${svgAngleArc(B, C, A, 12)}${svgRightAngleMark(C, A, B, 8)}${svgText(116, 88, given)}${svgText(205, 88, unknown)}${svgText(90, 108, 'A', 12)}${svgText(230, 108, 'B', 12)}${svgText(C.x + 8, C.y - 3, 'C', 12)}`);
};
const tangentTriangleFigure = () => {
  const O = { x: 96, y: 98 }, T = { x: 96, y: 44 }, P = { x: 168, y: 44 }, R = 54;
  return svgFigure('Прямоугольный треугольник OPT: OT — радиус, TP — касательная', `<circle cx="${O.x}" cy="${O.y}" r="${R}" fill="#f2f4ff" stroke="#3158f5" stroke-width="2.2"/><path d="M${O.x} ${O.y} ${T.x} ${T.y}H258M${O.x} ${O.y} ${P.x} ${P.y}" fill="none" stroke="#52617b" stroke-width="1.9"/>${svgRightAngleMark(T, O, P, 9)}${svgText(83, 73, '6')}${svgText(132, 36, 'x')}${svgText(128, 81, '10')}${svgText(84, 116, 'O', 12)}${svgText(87, 36, 'T', 12)}${svgText(173, 40, 'P', 12)}`);
};
const trapezoidMidlineDiagonalFigure = () => svgFigure('Трапеция с основаниями 14 и 8, средней линией и диагональю AC', `<path d="M35.5 140 88 48 228 48 280.5 140Z" fill="#eef1ff" stroke="#3158f5" stroke-width="2.5"/><path d="M35.5 140 228 48M61.75 94H254.25" fill="none" stroke="#ff795f" stroke-width="2"/><circle cx="131.75" cy="94" r="3.5" fill="#ff795f"/>${svgText(158, 41, '8')}${svgText(158, 159, '14')}${svgText(96.75, 87, '4')}${svgText(193, 87, '7')}${svgText(28, 154, 'A', 12)}${svgText(288, 154, 'B', 12)}${svgText(234, 47, 'C', 12)}${svgText(82, 47, 'D', 12)}`, '0 0 320 178');

window.GEO09_UNITS = [
  {
    title: 'Треугольники', short: 'Углы, виды, равенство и теорема Пифагора', color: 'art-1',
    art: '<svg viewBox="0 0 60 55" fill="none" aria-hidden="true"><path d="m8 45 18-34 27 34H8Z" stroke="currentColor" stroke-width="1.8"/><path d="M26 11v34M26 45h27" stroke="currentColor" stroke-opacity=".3" stroke-dasharray="3 3"/><circle cx="26" cy="11" r="2.5" fill="#ff795f"/></svg>',
    questions: [
      { q: 'В треугольнике два угла равны 48° и 67°. Найдите третий угол.', a: ['55°', '65°', '75°', '85°'], correct: 1, line: 15, figure: triangleFigure({ angleA: '48°', angleB: '67°', angleC: 'x' }), note: 'Сумма углов треугольника равна 180°. Третий угол: 180° − 48° − 67° = 65°.' },
      { q: 'В равнобедренном треугольнике угол при вершине равен 40°. Чему равен каждый угол при основании?', a: ['70°', '40°', '140°', '80°'], correct: 0, line: 16, figure: triangleFigure({ angleA: 'x', angleB: 'x', angleC: '40°', equalSides: true }), note: 'Углы при основании равнобедренного треугольника равны. Каждый равен (180° − 40°) / 2 = 70°.' },
      { q: 'Катеты прямоугольного треугольника равны 9 и 12. Найдите гипотенузу.', a: ['13', '15', '18', '21'], correct: 1, line: 16, figure: rightTriangleFigure({ vertical: '9', base: '12', hypotenuse: 'c' }), note: 'По теореме Пифагора c² = 9² + 12² = 81 + 144 = 225, поэтому c = 15.' },
      { q: 'Какой признак позволяет доказать равенство двух треугольников по двум сторонам и углу между ними?', a: ['По трём углам', 'По двум углам и стороне', 'По двум сторонам и углу между ними', 'По одной стороне'], correct: 2, line: 19, figure: congruenceFigure(), note: 'Первый признак равенства треугольников: если две стороны и угол между ними одного треугольника соответственно равны двум сторонам и углу между ними другого, треугольники равны.' },
      { q: 'Внешний угол треугольника смежен с внутренним углом 128°. Найдите внешний угол.', a: ['42°', '52°', '62°', '128°'], correct: 1, line: 15, figure: externalAngleFigure(), note: 'Смежные углы в сумме дают 180°. Внешний угол равен 180° − 128° = 52°.' },
      { q: 'Найдите периметр равностороннего треугольника со стороной 6.', a: ['12', '18', '24', '36'], correct: 1, line: 16, figure: triangleFigure({ sideAB: '6', sideAC: '6', sideBC: '6', equalSides: true, label: 'Равносторонний треугольник со стороной 6' }), note: 'У равностороннего треугольника три равные стороны. Периметр равен 3 · 6 = 18.' }
    ]
  },
  {
    title: 'Подобие треугольников', short: 'Пропорциональные стороны и коэффициент подобия', color: 'art-2',
    art: '<svg viewBox="0 0 60 55" fill="none" aria-hidden="true"><path d="m5 45 13-26 23 26H5Z" stroke="currentColor" stroke-width="1.7"/><path d="m29 45 10-20 17 20H29Z" stroke="currentColor" stroke-width="1.7"/><path d="M18 19 39 25" stroke="#ff795f" stroke-dasharray="2 3"/></svg>',
    questions: [
      { q: 'Треугольники подобны с коэффициентом увеличения 1,5. Сторона меньшего треугольника равна 8. Чему равна соответствующая сторона большего?', a: ['9,5', '12', '14', '16'], correct: 1, line: 23, figure: similarTrianglesFigure({ small: '8', large: 'x', factor: 'k = 1,5' }), note: 'Соответствующие стороны подобных треугольников относятся как коэффициент увеличения: 8 · 1,5 = 12.' },
      { q: 'Стороны подобной фигуры увеличили в 3 раза. Во сколько раз увеличилась её площадь?', a: ['В 3 раза', 'В 6 раз', 'В 9 раз', 'В 12 раз'], correct: 2, line: 17, figure: similarTrianglesFigure({ factor: 'k = 3' }), note: 'Площади подобных фигур относятся как квадрат коэффициента подобия. 3² = 9, значит площадь увеличилась в 9 раз.' },
      { q: 'В подобных треугольниках стороне 6 соответствует сторона 9, а стороне 8 — сторона x. Найдите x.', a: ['10', '11', '12', '14'], correct: 2, line: 23, figure: similarTrianglesFigure({ small: '6; 8', large: '9; x' }), note: 'Коэффициент подобия равен 9/6 = 1,5. Тогда x = 8 · 1,5 = 12.' },
      { q: 'Какой признак подобия треугольников верен?', a: ['Равны любые две стороны', 'Равны два угла', 'Равны периметры', 'Равны площади'], correct: 1, line: 19, figure: similarityCriterionFigure(), note: 'Если два угла одного треугольника соответственно равны двум углам другого, треугольники подобны по двум углам.' },
      { q: 'В прямоугольном треугольнике гипотенуза равна 13, один катет равен 5. Найдите второй катет.', a: ['8', '10', '12', '18'], correct: 2, line: 16, figure: rightTriangleFigure({ vertical: '5', hypotenuse: '13', base: 'x' }), note: 'По теореме Пифагора второй катет равен √(13² − 5²) = √144 = 12.' },
      { q: 'Высота прямоугольного треугольника делит гипотенузу на отрезки 4 и 9. Чему равна высота?', a: ['5', '6', '√13', '13'], correct: 1, line: 25, figure: altitudeFigure(), note: 'Высота к гипотенузе — среднее геометрическое отрезков гипотенузы: h² = 4 · 9 = 36, значит h = 6.' }
    ]
  },
  {
    title: 'Тригонометрия и площадь треугольника', short: 'Синус, косинус, тангенс и формулы площади', color: 'art-3',
    art: '<svg viewBox="0 0 60 55" fill="none" aria-hidden="true"><path d="m9 44 18-34 25 34H9Z" stroke="currentColor" stroke-width="1.8"/><path d="M27 10v34M27 44h25" stroke="currentColor" stroke-opacity=".35" stroke-dasharray="3 3"/><text x="13" y="38" fill="currentColor" font-size="8">α</text></svg>',
    questions: [
      { q: 'Чему равен sin 30°?', a: ['1', '√3/2', '1/2', '0'], correct: 2, line: 19, figure: rightTriangleFigure({ vertical: 'a', base: 'b', hypotenuse: 'c', angleB: '30°' }), note: 'Табличное значение: sin 30° = 1/2. В прямоугольном треугольнике синус — отношение противолежащего катета к гипотенузе.' },
      { q: 'Чему равен cos 60°?', a: ['1/2', '√3/2', '1', '0'], correct: 0, line: 19, figure: rightTriangleFigure({ vertical: 'a', base: 'b', hypotenuse: 'c', angleB: '60°' }), note: 'Табличное значение: cos 60° = 1/2. Косинус острого угла — отношение прилежащего катета к гипотенузе.' },
      { q: 'Чему равен tg 45°?', a: ['0', '1/2', '1', '√3'], correct: 2, line: 19, figure: rightTriangleFigure({ vertical: 'a', base: 'b', hypotenuse: 'c', angleB: '45°' }), note: 'tg 45° = 1. В прямоугольном равнобедренном треугольнике катеты равны, поэтому их отношение равно 1.' },
      { q: 'В прямоугольном треугольнике гипотенуза равна 14, а острый угол — 30°. Найдите катет, лежащий напротив этого угла.', a: ['7', '7√3', '14√3', '28'], correct: 0, line: 23, figure: rightTriangleFigure({ vertical: 'x', hypotenuse: '14', angleB: '30°' }), note: 'Противолежащий катет равен гипотенузе, умноженной на синус угла: 14 · sin 30° = 14 · 1/2 = 7.' },
      { q: 'Две стороны треугольника равны 8 и 5, а угол между ними — 30°. Найдите площадь.', a: ['10', '20', '40', '5'], correct: 0, line: 17, figure: triangleFigure({ angleA: '30°', sideAB: '8', sideAC: '5', label: 'Треугольник со сторонами 8 и 5 и углом 30 градусов между ними' }), note: 'Площадь по двум сторонам и углу между ними: S = 1/2 ab sin α. Здесь α = 30°, поэтому S = 1/2 · 8 · 5 · sin 30° = 10.' },
      { q: 'Основание треугольника равно 14, высота к нему — 5. Найдите площадь.', a: ['19', '35', '70', '140'], correct: 1, line: 17, figure: triangleHeightFigure({ base: '14', height: '5' }), note: 'Площадь треугольника S = 1/2 ah. Значит S = 1/2 · 14 · 5 = 35.' }
    ]
  },
  {
    title: 'Четырёхугольники', short: 'Свойства и признаки параллелограмма, ромба, прямоугольника и квадрата', color: 'art-4',
    art: '<svg viewBox="0 0 60 55" fill="none" aria-hidden="true"><path d="m16 10 35 0-8 35H8l8-35Z" stroke="currentColor" stroke-width="1.8"/><path d="M16 10 43 45M51 10 8 45" stroke="currentColor" stroke-opacity=".35" stroke-dasharray="3 3"/></svg>',
    questions: [
      { q: 'Один угол параллелограмма равен 68°. Найдите соседний угол.', a: ['68°', '102°', '112°', '136°'], correct: 2, line: 15, figure: parallelogramFigure({ angle: 'x', opposite: '68°' }), note: 'Соседние углы параллелограмма в сумме дают 180°. 180° − 68° = 112°.' },
      { q: 'Стороны прямоугольника равны 5 и 12. Найдите длину его диагонали.', a: ['13', '15', '17', '60'], correct: 0, line: 16, figure: rectangleFigure({ sideA: '12', sideB: '5', diagonal: 'x' }), note: 'Диагональ прямоугольника — гипотенуза прямоугольного треугольника с катетами 5 и 12. По теореме Пифагора диагональ равна √(25 + 144) = 13.' },
      { q: 'Диагонали ромба равны 6 и 8. Найдите его площадь.', a: ['14', '24', '48', '28'], correct: 1, line: 17, figure: rhombusFigure({ diagonal1: '6', diagonal2: '8' }), note: 'Площадь ромба через диагонали: S = d₁d₂/2 = 6 · 8 / 2 = 24.' },
      { q: 'Диагональ квадрата равна 6. Найдите площадь квадрата.', a: ['18', '24', '36', '12'], correct: 0, line: 17, figure: squareFigure('6'), note: 'Площадь квадрата через диагональ: S = d²/2. Получаем 36/2 = 18.' },
      { q: 'Основания трапеции равны 7 и 13. Чему равна её средняя линия?', a: ['6', '10', '20', '91'], correct: 1, line: 16, figure: trapezoidFigure({ baseA: '13', baseB: '7', midline: true }), note: 'Средняя линия трапеции равна полусумме оснований: (7 + 13)/2 = 10.' },
      { q: 'Основания трапеции равны 8 и 14, высота равна 5. Найдите площадь.', a: ['55', '70', '110', '27,5'], correct: 0, line: 17, figure: trapezoidFigure({ baseA: '14', baseB: '8', height: '5' }), note: 'S = (a + b)h/2. Подставляем: (8 + 14) · 5 / 2 = 55.' },
      { q: 'Параллелограмм имеет равные диагонали. Какой вывод можно сделать?', a: ['Это обязательно ромб', 'Это прямоугольник', 'Это квадрат', 'Такого быть не может'], correct: 1, line: 19, figure: equalDiagonalsParallelogramFigure(), note: 'Если диагонали параллелограмма равны, то он является прямоугольником. Квадратом он будет только при дополнительном условии равенства соседних сторон.' },
      { q: 'Какое условие достаточно, чтобы доказать, что четырёхугольник — параллелограмм?', a: ['Одна пара противоположных сторон равна', 'Диагонали равны', 'Диагонали точкой пересечения делятся пополам', 'Все углы острые'], correct: 2, line: 19, figure: bisectedDiagonalsFigure(), note: 'Если диагонали четырёхугольника точкой пересечения делятся пополам, этот четырёхугольник — параллелограмм.' }
    ]
  },
  {
    title: 'Окружность: углы и хорды', short: 'Центральные и вписанные углы, хорды и радиусы', color: 'art-5',
    art: '<svg viewBox="0 0 60 55" fill="none" aria-hidden="true"><circle cx="30" cy="28" r="21" stroke="currentColor" stroke-width="1.7"/><path d="M12 18 47 20M30 28 12 18M30 28 47 20" stroke="currentColor" stroke-width="1.4"/><path d="M18 20a12 12 0 0 1 10-6" stroke="#ff795f"/></svg>',
    questions: [
      { q: 'Центральный угол, опирающийся на дугу AB, равен 100°. Найдите вписанный угол, опирающийся на ту же дугу.', a: ['25°', '50°', '100°', '200°'], correct: 1, line: 15, figure: circleAngleFigure({ kind: 'central', given: '100°', unknown: 'x' }), note: 'Вписанный угол, опирающийся на ту же дугу, равен половине центрального: 100°/2 = 50°.' },
      { q: 'Вписанный угол равен 35°. Найдите центральный угол, опирающийся на ту же дугу.', a: ['17,5°', '35°', '70°', '145°'], correct: 2, line: 15, figure: circleAngleFigure({ kind: 'inscribed', given: '35°', unknown: 'x' }), note: 'Центральный угол вдвое больше вписанного, если они опираются на одну дугу: 2 · 35° = 70°.' },
      { q: 'AB — диаметр окружности, C — точка на окружности. Чему равен угол ACB?', a: ['45°', '60°', '90°', '180°'], correct: 2, line: 19, figure: diameterFigure(), note: 'Вписанный угол, опирающийся на диаметр, равен 90°.' },
      { q: 'Радиус окружности равен 13. Расстояние от центра до хорды равно 5. Найдите длину хорды.', a: ['12', '18', '24', '26'], correct: 2, line: 25, figure: chordFigure({ radius: '13', distance: '5', chord: 'x' }), note: 'Перпендикуляр из центра к хорде делит её пополам. Половина хорды равна √(13² − 5²) = 12, значит вся хорда равна 24.' },
      { q: 'В одной окружности хорды AB и CD равны. Как связаны меньшие дуги, на которые они опираются?', a: ['Дуги равны', 'Одна дуга вдвое больше другой', 'Дуги обязательно полуокружности', 'Связь установить нельзя'], correct: 0, line: 19, figure: equalChordsFigure(), note: 'В одной окружности равным хордам соответствуют равные меньшие дуги и равные центральные углы.' },
      { q: 'Хорда окружности равна 8, а расстояние от центра до неё — 3. Найдите радиус.', a: ['4', '5', '√73', '7'], correct: 1, line: 25, figure: chordFigure({ radius: 'x', distance: '3', chord: '8', halfChord: '4' }), note: 'Перпендикуляр из центра делит хорду пополам. Радиус — гипотенуза с катетами 4 и 3: R = √(4² + 3²) = 5.' }
    ]
  },
  {
    title: 'Касательные и окружности', short: 'Касательные, секущие, вписанные и описанные окружности', color: 'art-6',
    art: '<svg viewBox="0 0 60 55" fill="none" aria-hidden="true"><circle cx="27" cy="29" r="19" stroke="currentColor" stroke-width="1.7"/><path d="M8 10 46 48M8 48 46 10M27 29 8 48" stroke="currentColor" stroke-opacity=".65"/><path d="M34 8v42" stroke="#ff795f" stroke-width="1.6"/><circle cx="34" cy="29" r="2" fill="currentColor"/></svg>',
    questions: [
      { q: 'Радиус проведён в точку касания прямой и окружности. Как он расположен относительно касательной?', a: ['Параллелен ей', 'Перпендикулярен ей', 'Образует угол 45°', 'Совпадает с ней'], correct: 1, line: 19, figure: tangentFigure({ label: 'Радиус OT проведён в точку касания T' }), note: 'Радиус, проведённый в точку касания, перпендикулярен касательной.' },
      { q: 'Из точки P к окружности проведены две касательные PA и PB. Если PA = 9, найдите PB.', a: ['4,5', '9', '18', 'Недостаточно данных'], correct: 1, line: 23, figure: tangentFigure({ type: 'two', first: '9', second: 'x' }), note: 'Отрезки касательных, проведённых из одной точки к окружности, равны. Поэтому PB = PA = 9.' },
      { q: 'Из точки проведена касательная длины x и секущая: внешняя часть равна 4, вся секущая — 9. Найдите x.', a: ['5', '6', '√13', '13'], correct: 1, line: 25, figure: tangentFigure({ type: 'secant', first: '4', second: '9' }), note: 'По теореме о касательной и секущей x² = 4 · 9 = 36, поэтому x = 6.' },
      { q: 'В какой точке пересекаются биссектрисы углов треугольника?', a: ['В центре описанной окружности', 'В центре вписанной окружности', 'В середине гипотенузы', 'На стороне треугольника'], correct: 1, line: 19, figure: incenterFigure(), note: 'Биссектрисы углов треугольника пересекаются в центре вписанной окружности. Эта точка равноудалена от всех сторон.' },
      { q: 'Где находится центр окружности, описанной около треугольника?', a: ['На пересечении медиан', 'На пересечении высот', 'На пересечении серединных перпендикуляров к сторонам', 'На пересечении биссектрис'], correct: 2, line: 19, figure: circumcenterFigure(), note: 'Серединные перпендикуляры к сторонам треугольника пересекаются в центре описанной окружности.' },
      { q: 'Расстояние от центра окружности до касательной равно 7. Чему равен радиус окружности?', a: ['3,5', '7', '14', '49'], correct: 1, line: 23, figure: tangentFigure({ first: '7', label: 'Расстояние от центра до касательной — перпендикулярный отрезок' }), note: 'Перпендикуляр из центра к касательной — радиус, проведённый в точку касания. Поэтому это расстояние равно радиусу: 7.' }
    ]
  },
  {
    title: 'Площади и многоугольники', short: 'Формулы площадей и разбиение сложных фигур', color: 'art-1',
    art: '<svg viewBox="0 0 60 55" fill="none" aria-hidden="true"><path d="M9 43 17 13h34v30H9Z" stroke="currentColor" stroke-width="1.7"/><path d="M17 13 29 43M29 43 51 13" stroke="currentColor" stroke-opacity=".55" stroke-dasharray="3 3"/><text x="31" y="31" fill="currentColor" font-size="8">S</text></svg>',
    questions: [
      { q: 'Основание параллелограмма равно 9, высота к нему — 4. Найдите площадь.', a: ['13', '18', '36', '72'], correct: 2, line: 17, figure: parallelogramFigure({ base: '9', height: '4' }), note: 'Площадь параллелограмма равна произведению основания на высоту: S = 9 · 4 = 36.' },
      { q: 'Основания трапеции равны 6 и 12, высота равна 5. Найдите площадь.', a: ['30', '45', '60', '90'], correct: 1, line: 17, figure: trapezoidFigure({ baseA: '12', baseB: '6', height: '5' }), note: 'S = (a + b)h/2 = (6 + 12) · 5 / 2 = 45.' },
      { q: 'Диагонали ромба равны 10 и 12. Найдите площадь ромба.', a: ['22', '60', '120', '30'], correct: 1, line: 17, figure: rhombusFigure({ diagonal1: '10', diagonal2: '12' }), note: 'Площадь ромба равна половине произведения диагоналей: S = 10 · 12 / 2 = 60.' },
      { q: 'Коэффициент увеличения подобных многоугольников равен 2. Площадь меньшего равна 7. Найдите площадь большего.', a: ['14', '21', '28', '49'], correct: 2, line: 17, figure: similarTrianglesFigure({ small: 'S = 7', large: 'S = x', factor: 'k = 2' }), note: 'Площади подобных фигур относятся как k². Площадь большего равна 7 · 2² = 28.' },
      { q: 'Основание треугольника равно 12, высота к нему — 7. Найдите площадь.', a: ['19', '42', '84', '168'], correct: 1, line: 17, figure: triangleHeightFigure({ base: '12', height: '7' }), note: 'S = ah/2 = 12 · 7 / 2 = 42.' },
      { q: 'Фигура состоит из прямоугольника 8 × 6, из которого вырезан прямоугольный треугольник с катетами 4 и 3. Найдите оставшуюся площадь.', a: ['36', '42', '48', '54'], correct: 1, line: 17, figure: compositeAreaFigure(), note: 'Площадь прямоугольника равна 48. Площадь вырезанного треугольника — 4 · 3 / 2 = 6. Остаётся 48 − 6 = 42.' }
    ]
  },
  {
    title: 'Геометрия на клетчатой бумаге', short: 'Длины, углы и площади по клеткам', color: 'art-2',
    art: '<svg viewBox="0 0 60 55" fill="none" aria-hidden="true"><path d="M8 10h44M8 20h44M8 30h44M8 40h44M8 50h44M10 8v44M20 8v44M30 8v44M40 8v44M50 8v44" stroke="currentColor" stroke-opacity=".22"/><path d="m10 40 30-20 10 20H10Z" stroke="currentColor" stroke-width="1.8"/></svg>',
    questions: [
      { q: 'На клетчатой бумаге отмечены точки A(1; 1) и B(5; 4). Найдите длину AB, если сторона клетки равна 1.', a: ['4', '5', '6', '7'], correct: 1, line: 18, figure: gridFigure('<path d="M40 96 120 36" stroke="#3158f5" stroke-width="3"/><circle cx="40" cy="96" r="4" fill="#ff795f"/><circle cx="120" cy="36" r="4" fill="#ff795f"/><text x="25" y="113" fill="#35415b" font-size="13">A</text><text x="125" y="33" fill="#35415b" font-size="13">B</text>'), note: 'По клеткам получаем горизонтальный катет 4 и вертикальный катет 3. По теореме Пифагора AB = √(4² + 3²) = 5.' },
      { q: 'Вершины прямоугольного треугольника на сетке имеют координаты (0; 0), (6; 0), (6; 4). Найдите площадь.', a: ['10', '12', '20', '24'], correct: 1, line: 18, figure: gridFigure('<path d="M20 116 140 116 140 36Z" fill="#dfe5ff" fill-opacity=".8" stroke="#3158f5" stroke-width="2.5"/><path d="M128 116v-12h12" fill="none" stroke="#ff795f" stroke-width="2"/><circle cx="20" cy="116" r="3" fill="#ff795f"/><circle cx="140" cy="116" r="3" fill="#ff795f"/><circle cx="140" cy="36" r="3" fill="#ff795f"/>'), note: 'Катеты по сетке равны 6 и 4. Площадь прямоугольного треугольника S = 6 · 4 / 2 = 12 квадратных клеток.' },
      { q: 'Прямоугольник на сетке имеет вершины (1; 1), (6; 1), (6; 4), (1; 4). Найдите его площадь.', a: ['8', '15', '20', '30'], correct: 1, line: 18, figure: gridFigure('<path d="M40 96V36H140V96Z" fill="#dff4e8" stroke="#478c70" stroke-width="2.5"/><text x="90" y="76" fill="#386e59" font-size="13">S</text>'), note: 'По сетке стороны прямоугольника равны 5 и 3 клетки. Площадь равна 5 · 3 = 15 квадратных клеток.' },
      { q: 'Две прямые сетки пересекаются под прямым углом. Чему равен угол между ними?', a: ['45°', '60°', '90°', '180°'], correct: 2, line: 18, figure: gridFigure('<path d="M100 16V116M20 76H260" stroke="#3158f5" stroke-width="2.5"/><path d="M100 76h18v18" fill="none" stroke="#ff795f" stroke-width="2"/>'), note: 'Линии квадратной клетчатой сетки взаимно перпендикулярны, поэтому угол между ними равен 90°.' },
      { q: 'Вершины треугольника на сетке имеют координаты (0; 0), (4; 0), (1; 3). Найдите площадь.', a: ['6', '9', '12', '18'], correct: 0, line: 18, figure: gridFigure('<path d="M40 116 120 116 60 56Z" fill="#fff0e8" stroke="#d87659" stroke-width="2.5"/><path d="M60 56V116" stroke="#d87659" stroke-dasharray="4 3"/><path d="M60 116h-12v-12h12" fill="none" stroke="#d87659" stroke-width="1.8"/>'), note: 'Основание треугольника равно 4 клетки, высота к нему — 3 клетки. S = 4 · 3 / 2 = 6 квадратных клеток.' },
      { q: 'Трапеция на сетке имеет основания 6 и 4 клетки, высоту 3 клетки. Найдите площадь.', a: ['12', '15', '18', '30'], correct: 1, line: 18, figure: gridFigure('<path d="M60 116 80 56 160 56 180 116Z" fill="#eee6fb" stroke="#8b68b3" stroke-width="2.5"/><path d="M80 56V116" stroke="#8b68b3" stroke-dasharray="4 3"/><path d="M80 116h12v-12h-12" fill="none" stroke="#8b68b3" stroke-width="1.8"/>'), note: 'Площадь трапеции равна полусумме оснований, умноженной на высоту: (6 + 4) · 3 / 2 = 15 квадратных клеток.' }
    ]
  },
  {
    title: 'Углы и параллельные прямые', short: 'Вертикальные, смежные и накрест лежащие углы', color: 'art-3',
    art: '<svg viewBox="0 0 60 55" fill="none" aria-hidden="true"><path d="M6 17h48M6 39h48M14 48 46 8" stroke="currentColor" stroke-width="1.7"/><path d="M24 17a9 9 0 0 1 7 4M33 39a9 9 0 0 0-7-5" stroke="#ff795f"/></svg>',
    questions: [
      { q: 'Один из вертикальных углов равен 58°. Найдите второй вертикальный угол.', a: ['32°', '58°', '122°', '302°'], correct: 1, line: 15, figure: parallelAngleFigure({ kind: 'vertical', given: '58°', unknown: 'x' }), note: 'Вертикальные углы равны. Поэтому второй угол также равен 58°.' },
      { q: 'Параллельные прямые пересечены секущей. Один накрест лежащий угол равен 72°. Найдите второй накрест лежащий угол.', a: ['72°', '108°', '144°', '288°'], correct: 0, line: 15, figure: parallelAngleFigure({ kind: 'alternate', given: '72°', unknown: 'x' }), note: 'При параллельных прямых накрест лежащие углы равны. Искомый угол — 72°.' },
      { q: 'При пересечении параллельных прямых секущей внутренние односторонние углы равны 70° и x. Найдите x.', a: ['70°', '100°', '110°', '130°'], correct: 2, line: 15, figure: parallelAngleFigure({ kind: 'same-side', given: '70°', unknown: 'x' }), note: 'Сумма внутренних односторонних углов при параллельных прямых равна 180°. x = 180° − 70° = 110°.' },
      { q: 'В треугольнике два внутренних угла равны 43° и 62°. Найдите внешний угол при третьей вершине.', a: ['75°', '95°', '105°', '118°'], correct: 2, line: 15, figure: triangleExteriorFigure(), note: 'Внешний угол треугольника равен сумме двух внутренних углов, не смежных с ним: 43° + 62° = 105°.' },
      { q: 'Один из смежных углов равен 37°. Чему равен другой?', a: ['37°', '53°', '143°', '323°'], correct: 2, line: 15, figure: parallelAngleFigure({ kind: 'adjacent', given: '37°', unknown: 'x' }), note: 'Сумма смежных углов равна 180°. Второй угол: 180° − 37° = 143°.' },
      { q: 'При пересечении двух прямых один угол равен 125°. Найдите меньший из остальных трёх углов.', a: ['55°', '125°', '180°', '235°'], correct: 0, line: 15, figure: parallelAngleFigure({ kind: 'adjacent', given: '125°', unknown: 'x' }), note: 'Вертикальный угол равен 125°, а два смежных с ним равны 180° − 125° = 55°. Меньший угол — 55°.' }
    ]
  },
  {
    title: 'Координаты и векторы', short: 'Расстояние, середина отрезка и координаты вектора', color: 'art-4',
    art: '<svg viewBox="0 0 60 55" fill="none" aria-hidden="true"><path d="M9 44h43M15 50V7M18 39 43 15" stroke="currentColor" stroke-width="1.7"/><path d="m36 15 8-1-1 8" stroke="#ff795f" stroke-width="1.7"/><circle cx="18" cy="39" r="2.5" fill="currentColor"/><circle cx="43" cy="15" r="2.5" fill="#ff795f"/></svg>',
    questions: [
      { q: 'Найдите расстояние между точками A(1; 2) и B(4; 6).', a: ['3', '4', '5', '7'], correct: 2, line: 23, figure: coordinateSegmentFigure(), note: 'AB = √((4 − 1)² + (6 − 2)²) = √(9 + 16) = 5.' },
      { q: 'Найдите координаты середины отрезка с концами A(−2; 4) и B(6; 0).', a: ['(2; 2)', '(4; 4)', '(−4; 2)', '(2; 4)'], correct: 0, line: 23, figure: midpointCoordinateFigure(), note: 'Координаты середины — полусуммы координат концов: ((−2 + 6)/2; (4 + 0)/2) = (2; 2).' },
      { q: 'Найдите координаты вектора AB, если A(−1; 2), B(3; 5).', a: ['(2; 4)', '(4; 3)', '(−4; −3)', '(3; 5)'], correct: 1, line: 23, figure: vectorCoordinateFigure(), note: 'Координаты вектора AB находят как «конец минус начало»: (3 − (−1); 5 − 2) = (4; 3).' },
      { q: 'Найдите длину вектора (−5; 12).', a: ['7', '12', '13', '17'], correct: 2, line: 23, figure: vectorLengthFigure(), note: 'Длина вектора (x; y) равна √(x² + y²): √(25 + 144) = √169 = 13.' },
      { q: 'Даны векторы a = (2; −3) и b = (−4; 5). Найдите a + b.', a: ['(−2; 2)', '(6; −8)', '(−8; −15)', '(2; 8)'], correct: 0, line: 23, figure: vectorSumFigure(), note: 'При сложении складывают соответствующие координаты: (2 + (−4); −3 + 5) = (−2; 2).' },
      { q: 'Запишите уравнение окружности с центром O(2; −1) и радиусом 3.', a: ['(x + 2)² + (y − 1)² = 9', '(x − 2)² + (y + 1)² = 9', 'x² + y² = 3', '(x − 2) + (y + 1) = 9'], correct: 1, line: 25, figure: circleCoordinateFigure(), note: 'Окружность с центром (a; b) и радиусом R задаётся уравнением (x − a)² + (y − b)² = R². Подставляем (2; −1) и R = 3.' }
    ]
  },
  {
    title: 'Геометрические утверждения', short: 'Проверка свойств фигур и поиск верного вывода', color: 'art-5',
    art: '<svg viewBox="0 0 60 55" fill="none" aria-hidden="true"><path d="m8 44 17-31 27 31H8Z" stroke="currentColor" stroke-width="1.7"/><path d="M17 35 24 42l16-18" stroke="#ff795f" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    questions: [
      { q: 'Какое утверждение всегда верно?', a: ['Любой прямоугольник — квадрат', 'Диагонали любого ромба равны', 'Сумма углов треугольника равна 180°', 'Любой параллелограмм имеет прямой угол'], correct: 2, line: 19, figure: triangleFigure(), note: 'Сумма внутренних углов любого треугольника всегда равна 180°. Остальные утверждения верны лишь для отдельных фигур.' },
      { q: 'Какое утверждение верно для любого квадрата?', a: ['У него только одна пара параллельных сторон', 'Он является и ромбом, и прямоугольником', 'Его диагонали не равны', 'Все углы острые'], correct: 1, line: 19, figure: squareFigure(), note: 'У квадрата равны все стороны и все углы прямые, поэтому он одновременно является ромбом и прямоугольником.' },
      { q: 'Выберите верное утверждение о диагоналях прямоугольника.', a: ['Они всегда перпендикулярны', 'Они равны и точкой пересечения делятся пополам', 'Они равны только при квадрате', 'Они не пересекаются'], correct: 1, line: 19, figure: rectangleFigure({ diagonals: true }), note: 'Диагонали прямоугольника равны и делятся точкой пересечения пополам. Перпендикулярны они только у квадрата.' },
      { q: 'Какое свойство диагоналей верно для любого ромба?', a: ['Они равны', 'Они перпендикулярны', 'Они параллельны', 'Они не делятся пополам'], correct: 1, line: 19, figure: rhombusFigure(), note: 'Диагонали ромба взаимно перпендикулярны, делятся пополам и являются биссектрисами его углов. Равны они не у каждого ромба.' },
      { q: 'Какое утверждение о хорде окружности верно?', a: ['Перпендикуляр из центра к хорде делит её пополам', 'Любая хорда равна диаметру', 'Хорда проходит через центр', 'Радиус параллелен хорде'], correct: 0, line: 19, figure: chordFigure({ distance: 'd', chord: 'AB' }), note: 'Перпендикуляр, опущенный из центра окружности на хорду, делит эту хорду пополам.' },
      { q: 'Как связаны противоположные углы четырёхугольника, вписанного в окружность?', a: ['Они равны', 'Их сумма равна 90°', 'Их сумма равна 180°', 'Один вдвое больше другого'], correct: 2, line: 19, figure: cyclicQuadrilateralFigure(), note: 'Сумма противоположных углов вписанного четырёхугольника равна 180°.' }
    ]
  },
  {
    title: 'Смешанные задачи ОГЭ', short: 'Комбинации свойств, вычисления и теорем', color: 'art-6',
    art: '<svg viewBox="0 0 60 55" fill="none" aria-hidden="true"><circle cx="31" cy="28" r="21" stroke="currentColor" stroke-width="1.5"/><path d="m9 42 16-29 27 29H9ZM12 28h36M31 7v42" stroke="currentColor" stroke-opacity=".7"/><circle cx="31" cy="28" r="2.5" fill="#ff795f"/></svg>',
    questions: [
      { q: 'В равнобедренном треугольнике угол при вершине равен 40°. Найдите угол при основании.', a: ['40°', '60°', '70°', '80°'], correct: 2, line: 16, figure: triangleFigure({ angleA: 'x', angleB: 'x', angleC: '40°', equalSides: true }), note: 'Углы при основании равны. Каждый равен (180° − 40°)/2 = 70°.' },
      { q: 'Катеты прямоугольного треугольника равны 6 и 8. Найдите его площадь.', a: ['14', '24', '48', '28'], correct: 1, line: 17, figure: rightTriangleFigure({ vertical: '6', base: '8' }), note: 'Площадь прямоугольного треугольника равна половине произведения катетов: 6 · 8 / 2 = 24.' },
      { q: 'Центральный угол окружности равен 90°. Найдите вписанный угол, опирающийся на ту же дугу.', a: ['30°', '45°', '90°', '180°'], correct: 1, line: 15, figure: circleAngleFigure({ kind: 'central', given: '90°', unknown: 'x' }), note: 'Вписанный угол равен половине центрального, опирающегося на ту же дугу: 90° / 2 = 45°.' },
      { q: 'Основания трапеции равны 9 и 15. Найдите длину средней линии.', a: ['6', '12', '24', '135'], correct: 1, line: 16, figure: trapezoidFigure({ baseA: '15', baseB: '9', midline: true }), note: 'Средняя линия трапеции равна полусумме оснований: (9 + 15) / 2 = 12.' },
      { q: 'Площади подобных треугольников относятся как 4:25. Во сколько раз соответствующая сторона большего треугольника больше?', a: ['В 2 раза', 'В 2,5 раза', 'В 5 раз', 'В 6,25 раза'], correct: 1, line: 25, figure: similarTrianglesFigure({ small: 'S = 4', large: 'S = 25', factor: 'отношение площадей 4 : 25' }), note: 'Отношение площадей равно квадрату коэффициента подобия. Отношение соответствующих сторон равно √(25/4) = 5/2 = 2,5.' },
      { q: 'Какое условие достаточно, чтобы доказать равенство двух треугольников?', a: ['Равенство двух соответствующих сторон и угла между ними', 'Равенство только периметров', 'Равенство одного угла', 'Равенство площадей'], correct: 0, line: 24, figure: congruenceFigure(), note: 'По первому признаку равенства достаточно установить равенство двух сторон и угла между ними в каждом треугольнике.' }
    ]
  },
  {
    title: 'Движения и симметрия', short: 'Осевая и центральная симметрия, перенос и поворот', color: 'art-3',
    art: '<svg viewBox="0 0 60 55" fill="none" aria-hidden="true"><path d="m11 39 12-24 13 24H11Zm13-24 13 24h12L37 15H24Z" stroke="currentColor" stroke-width="1.6"/><path d="M30 8v40" stroke="#ff795f" stroke-dasharray="3 3"/></svg>',
    questions: [
      { q: 'Точка A(4; −3) отражена относительно оси Ox. Найдите координаты её образа.', a: ['(−4; −3)', '(4; 3)', '(−4; 3)', '(3; 4)'], correct: 1, line: 23, figure: reflectionXFigure(), note: 'При отражении относительно Ox абсцисса сохраняется, а знак ординаты меняется: (x; y) → (x; −y). Образ — (4; 3).' },
      { q: 'Точка B(−2; 5) отражена относительно начала координат. Найдите её образ.', a: ['(2; −5)', '(−2; −5)', '(2; 5)', '(5; −2)'], correct: 0, line: 23, figure: centralReflectionFigure(), note: 'Центральная симметрия относительно начала координат меняет знаки обеих координат: (x; y) → (−x; −y).' },
      { q: 'Параллельный перенос задан вектором (3; −2). Точка A(1; 4) переходит в A′. Найдите координаты A′.', a: ['(4; 2)', '(−2; 6)', '(3; −2)', '(4; 6)'], correct: 0, line: 23, figure: translationFigure(), note: 'При переносе к координатам точки прибавляют координаты вектора: A′ = (1 + 3; 4 − 2) = (4; 2).' },
      { q: 'Точку (2; 1) повернули вокруг начала координат на 90° против часовой стрелки. Каковы координаты образа?', a: ['(1; −2)', '(−1; 2)', '(−2; −1)', '(2; −1)'], correct: 1, line: 23, figure: rotationFigure(), note: 'При повороте на 90° против часовой стрелки вокруг начала координат (x; y) переходит в (−y; x). Поэтому (2; 1) → (−1; 2).' },
      { q: 'Какое свойство сохраняет любое движение плоскости?', a: ['Площадь всегда увеличивается', 'Длины отрезков и величины углов', 'Параллельность превращается в перпендикулярность', 'Координаты всех точек остаются прежними'], correct: 1, line: 19, figure: movementFigure(), note: 'Движение плоскости сохраняет расстояния между точками, поэтому сохраняются длины отрезков и величины углов; фигура остаётся равной исходной.' },
      { q: 'Какая прямая является осью симметрии равнобедренного треугольника?', a: ['Прямая, содержащая боковую сторону', 'Прямая через вершину и середину основания', 'Любая прямая через центр основания', 'Прямая, параллельная основанию'], correct: 1, line: 19, figure: isoscelesAxisFigure(), note: 'Ось симметрии равнобедренного треугольника проходит через вершину и середину основания. Она одновременно является медианой, высотой и биссектрисой.' }
    ]
  }
];

// New, original practice items follow the geometry task formats in the 2027 OGE sample materials.
const appendOgeQuestions = (title, questions) => {
  const unit = window.GEO09_UNITS.find(item => item.title === title);
  if (!unit) throw new Error(`Unknown geometry topic: ${title}`);
  unit.questions.push(...questions);
};

appendOgeQuestions('Треугольники', [
  { q: 'В прямоугольном треугольнике ∠A = 90°, AB = 15 и AC = 8. Найдите BC.', a: ['16', '17', '18', '23'], correct: 1, line: 15, figure: rightTriangleFigure({ vertical: '8', base: '15', hypotenuse: 'x' }), note: 'BC — гипотенуза. По теореме Пифагора BC² = 15² + 8² = 225 + 64 = 289, поэтому BC = 17.' },
  { q: 'В треугольнике ABC углы A и B равны 56° и 39°. Найдите угол C.', a: ['75°', '85°', '95°', '105°'], correct: 1, line: 15, figure: triangleFigure({ angleA: '56°', angleB: '39°', angleC: 'x' }), note: 'Сумма углов треугольника равна 180°. ∠C = 180° − 56° − 39° = 85°.' },
  { q: 'В равнобедренном треугольнике угол при вершине равен 44°. Найдите угол при основании.', a: ['58°', '68°', '78°', '88°'], correct: 1, line: 15, figure: triangleFigure({ angleA: 'x', angleB: 'x', angleC: '44°', equalSides: true }), note: 'Углы при основании равны. Каждый равен (180° − 44°) / 2 = 68°.' },
  { q: 'Основание треугольника равно 12, а проведённая к нему высота — 7. Найдите площадь треугольника.', a: ['38', '42', '48', '84'], correct: 1, line: 17, figure: triangleHeightFigure({ base: '12', height: '7' }), note: 'Площадь треугольника равна половине произведения основания на высоту: S = 12 · 7 / 2 = 42.' }
]);

appendOgeQuestions('Подобие треугольников', [
  { q: 'В подобных треугольниках стороне 4 меньшего соответствует сторона 10 большего. Стороне 8 меньшего соответствует сторона x. Найдите x.', a: ['16', '18', '20', '24'], correct: 2, line: 15, figure: similarTrianglesFigure({ small: '4; 8', large: '10; x', factor: 'k = 2,5' }), note: 'Коэффициент подобия большего треугольника к меньшему равен 10 / 4 = 2,5. Тогда x = 8 · 2,5 = 20.' },
  { q: 'Площади подобных треугольников равны 36 и x. Коэффициент подобия большего треугольника к меньшему равен 5/3. Найдите x.', a: ['60', '90', '100', '120'], correct: 2, line: 17, figure: similarTrianglesFigure({ small: 'S = 36', large: 'S = x', factor: 'k = 5/3' }), note: 'Площади подобных фигур относятся как квадрат коэффициента подобия: x = 36 · (5/3)² = 36 · 25/9 = 100.' },
  { q: 'Периметры подобных треугольников относятся как 3 : 4. Периметр меньшего треугольника равен 27. Найдите периметр большего.', a: ['30', '32', '36', '48'], correct: 2, line: 17, figure: similarTrianglesFigure({ factor: 'периметры 3 : 4' }), note: 'Периметры подобных треугольников относятся так же, как соответствующие стороны. Больший периметр равен 27 · 4/3 = 36.' },
  { q: 'Соответствующие стороны двух подобных треугольников равны 12 и 18. Другая сторона меньшего треугольника равна 8. Найдите соответствующую сторону большего.', a: ['10', '12', '14', '16'], correct: 1, line: 15, figure: similarTrianglesFigure({ small: '12; 8', large: '18; x', factor: 'k = 1,5' }), note: 'Коэффициент подобия равен 18/12 = 1,5. Искомая сторона равна 8 · 1,5 = 12.' }
]);

appendOgeQuestions('Тригонометрия и площадь треугольника', [
  { q: 'В прямоугольном треугольнике катеты равны 9 и 12. Найдите тангенс угла, противолежащего катету 9.', a: ['3/4', '4/3', '3/5', '4/5'], correct: 0, line: 15, figure: rightTriangleFigure({ vertical: '9', base: '12', angleB: 'x' }), note: 'Тангенс острого угла — отношение противолежащего катета к прилежащему: tg x = 9/12 = 3/4.' },
  { q: 'Две стороны треугольника равны 10 и 12, а угол между ними — 30°. Найдите площадь.', a: ['24', '30', '60', '120'], correct: 1, line: 17, figure: triangleFigure({ angleA: '30°', sideAB: '10', sideAC: '12' }), note: 'S = ab · sin α / 2. Поэтому S = 10 · 12 · sin 30° / 2 = 60 · 1/2 = 30.' },
  { q: 'Площадь треугольника со сторонами 6 и 12 равна 18. Найдите синус угла между этими сторонами.', a: ['1/4', '1/2', '√3/2', '1'], correct: 1, line: 17, figure: triangleFigure({ angleA: 'α', sideAB: '6', sideAC: '12' }), note: 'По формуле S = ab · sin α / 2 получаем sin α = 2S/(ab) = 36/(6 · 12) = 1/2.' },
  { q: 'В прямоугольном треугольнике гипотенуза равна 20, а один острый угол — 30°. Найдите катет, лежащий напротив этого угла.', a: ['8', '10', '10√3', '20'], correct: 1, line: 15, figure: rightTriangleFigure({ vertical: 'x', hypotenuse: '20', angleB: '30°' }), note: 'Противолежащий катет равен гипотенузе, умноженной на синус угла: 20 · sin 30° = 20 · 1/2 = 10.' },
  { q: 'Основание треугольника равно 18, высота к нему равна 8. Найдите площадь.', a: ['64', '72', '144', '288'], correct: 1, line: 17, figure: triangleHeightFigure({ base: '18', height: '8' }), note: 'Площадь равна половине произведения основания на высоту: S = 18 · 8 / 2 = 72.' }
]);

appendOgeQuestions('Четырёхугольники', [
  { q: 'Один угол параллелограмма равен 124°. Найдите соседний угол.', a: ['56°', '66°', '124°', '236°'], correct: 0, line: 17, figure: parallelogramFigure({ angle: '124°', opposite: 'x' }), note: 'Соседние углы параллелограмма в сумме дают 180°. Искомый угол равен 180° − 124° = 56°.' },
  { q: 'Основания трапеции равны 9 и 15. Найдите её среднюю линию.', a: ['6', '12', '24', '135'], correct: 1, line: 17, figure: trapezoidFigure({ baseA: '15', baseB: '9', midline: true }), note: 'Средняя линия трапеции равна полусумме оснований: (9 + 15)/2 = 12.' },
  { q: 'Основания трапеции равны 14 и 8. Диагональ делит среднюю линию на два отрезка. Найдите больший отрезок.', a: ['4', '6', '7', '11'], correct: 2, line: 17, figure: trapezoidMidlineDiagonalFigure(), note: 'Диагональ делит среднюю линию на отрезки, равные половинам оснований. Получаются 14/2 = 7 и 8/2 = 4; больший отрезок равен 7.' },
  { q: 'Диагональ прямоугольника равна 10, одна сторона равна 8. Найдите другую сторону.', a: ['4', '6', '8', '12'], correct: 1, line: 17, figure: rectangleFigure({ sideA: '8', sideB: '6', diagonal: '10' }), note: 'Стороны и диагональ образуют прямоугольный треугольник. Неизвестная сторона равна √(10² − 8²) = √36 = 6.' },
  { q: 'Диагонали ромба равны 12 и 16. Найдите площадь ромба.', a: ['48', '84', '96', '192'], correct: 2, line: 17, figure: rhombusFigure({ diagonal1: '12', diagonal2: '16' }), note: 'Площадь ромба равна половине произведения диагоналей: S = 12 · 16 / 2 = 96.' }
]);

appendOgeQuestions('Окружность: углы и хорды', [
  { q: 'Центральный угол, опирающийся на дугу AB, равен 116°. Найдите вписанный угол, опирающийся на ту же дугу.', a: ['29°', '58°', '116°', '232°'], correct: 1, line: 16, figure: circleAngleFigure({ kind: 'central', given: '116°', unknown: 'x' }), note: 'Вписанный угол, опирающийся на ту же дугу, равен половине центрального: 116° / 2 = 58°.' },
  { q: 'Вписанный угол равен 48°. Найдите центральный угол, опирающийся на ту же дугу.', a: ['24°', '48°', '96°', '132°'], correct: 2, line: 16, figure: circleAngleFigure({ kind: 'inscribed', given: '48°', unknown: 'x' }), note: 'Центральный угол, опирающийся на ту же дугу, вдвое больше вписанного: 2 · 48° = 96°.' },
  { q: 'Четырёхугольник ABCD вписан в окружность. Угол B равен 107°. Найдите угол D.', a: ['63°', '73°', '83°', '107°'], correct: 1, line: 16, figure: cyclicAnglePairFigure({ given: '107°', unknown: 'x' }), note: 'Противоположные углы вписанного четырёхугольника в сумме равны 180°. ∠D = 180° − 107° = 73°.' },
  { q: 'AB — диаметр окружности. Угол CAB равен 34°. Найдите угол CBA.', a: ['34°', '46°', '56°', '90°'], correct: 2, line: 16, figure: diameterTriangleAnglesFigure({ given: '34°', unknown: 'x' }), note: 'Угол ACB, опирающийся на диаметр, прямой. Тогда ∠CBA = 180° − 90° − 34° = 56°.' },
  { q: 'Радиус окружности равен 10, а расстояние от центра до хорды — 6. Найдите длину хорды.', a: ['8', '12', '16', '20'], correct: 2, line: 16, figure: chordFigure({ radius: '10', distance: '6', chord: 'x' }), note: 'Перпендикуляр из центра делит хорду пополам. Половина хорды равна √(10² − 6²) = 8, значит вся хорда равна 16.' }
]);

appendOgeQuestions('Касательные и окружности', [
  { q: 'Из одной точки проведены касательная длины x и секущая. Внешняя часть секущей равна 4, вся секущая — 25. Найдите x.', a: ['8', '10', '12', '21'], correct: 1, line: 16, figure: tangentFigure({ type: 'secant', first: '4', second: '25' }), note: 'По теореме о касательной и секущей x² = 4 · 25 = 100. Длина отрезка положительна, поэтому x = 10.' },
  { q: 'В треугольнике OPT радиус OT равен 6, OP = 10, а TP — касательная. Найдите TP.', a: ['6', '7', '8', '10'], correct: 2, line: 16, figure: tangentTriangleFigure(), note: 'Радиус к точке касания перпендикулярен касательной, поэтому треугольник OPT прямоугольный. TP = √(OP² − OT²) = √(100 − 36) = 8.' },
  { q: 'Из точки P к окружности проведены две касательные. Одна касательная равна 11. Найдите длину другой.', a: ['5,5', '11', '22', 'Недостаточно данных'], correct: 1, line: 16, figure: tangentFigure({ type: 'two', first: '11', second: 'x' }), note: 'Касательные, проведённые к окружности из одной точки, равны. Искомая длина также равна 11.' },
  { q: 'Радиус вписанной в треугольник окружности равен 5. Чему равно расстояние от центра окружности до любой стороны треугольника?', a: ['2,5', '5', '10', '25'], correct: 1, line: 16, figure: incenterFigure(), note: 'Радиус вписанной окружности — это перпендикулярное расстояние от её центра до каждой стороны. Оно равно 5.' }
]);

appendOgeQuestions('Площади и многоугольники', [
  { q: 'Основания трапеции равны 9 и 17, а высота равна 5. Найдите площадь.', a: ['52', '60', '65', '130'], correct: 2, line: 17, figure: trapezoidFigure({ baseA: '17', baseB: '9', height: '5' }), note: 'Площадь трапеции равна полусумме оснований, умноженной на высоту: S = (9 + 17) · 5 / 2 = 65.' },
  { q: 'Основание параллелограмма равно 14, высота к нему — 6. Найдите площадь.', a: ['20', '42', '84', '168'], correct: 2, line: 17, figure: parallelogramFigure({ base: '14', height: '6' }), note: 'Площадь параллелограмма равна произведению основания на высоту: S = 14 · 6 = 84.' },
  { q: 'Периметр квадрата равен 36. Найдите его площадь.', a: ['36', '72', '81', '144'], correct: 2, line: 17, figure: rectangleFigure({ sideA: '9', sideB: '9' }), note: 'Сторона квадрата равна 36/4 = 9. Площадь равна 9² = 81.' },
  { q: 'Площадь параллелограмма ABCD равна 150. Найдите площадь треугольника ABC, образованного его диагональю AC.', a: ['50', '75', '100', '150'], correct: 1, line: 17, figure: parallelogramFigure({ diagonals: true }), note: 'Диагональ параллелограмма делит его на два равных по площади треугольника. Площадь ABC равна 150/2 = 75.' }
]);

appendOgeQuestions('Геометрия на клетчатой бумаге', [
  { q: 'На клетчатой бумаге отмечены точки A(2; 0) и B(5; 4). Сторона клетки равна 1. Найдите AB.', a: ['4', '5', '6', '7'], correct: 1, line: 18, figure: gridFigure('<path d="M60 116 120 36" stroke="#3158f5" stroke-width="3"/><circle cx="60" cy="116" r="4" fill="#ff795f"/><circle cx="120" cy="36" r="4" fill="#ff795f"/><text x="47" y="108" fill="#35415b" font-size="13">A</text><text x="127" y="33" fill="#35415b" font-size="13">B</text>', 'Отрезок AB на сетке: смещение 3 клетки по горизонтали и 4 по вертикали'), note: 'По сетке горизонтальный катет равен 3, вертикальный — 4. По теореме Пифагора AB = √(3² + 4²) = 5.' },
  { q: 'На сетке изображён треугольник с основанием 6 клеток и высотой 4 клетки. Найдите его площадь.', a: ['10', '12', '18', '24'], correct: 1, line: 18, figure: gridFigure('<path d="M40 96 160 96 80 16Z" fill="#dfe5ff" stroke="#3158f5" stroke-width="2.5"/><path d="M80 16V96M68 84H80V96" fill="none" stroke="#ff795f" stroke-width="1.8"/><circle cx="40" cy="96" r="3" fill="#ff795f"/><circle cx="160" cy="96" r="3" fill="#ff795f"/><circle cx="80" cy="16" r="3" fill="#ff795f"/>', 'Треугольник на сетке: основание 6 клеток, высота 4 клетки'), note: 'Площадь треугольника равна половине произведения основания на высоту: 6 · 4 / 2 = 12 квадратных клеток.' },
  { q: 'На сетке изображена трапеция с основаниями 8 и 4 клетки и высотой 3 клетки. Найдите её площадь.', a: ['12', '16', '18', '24'], correct: 2, line: 18, figure: gridFigure('<path d="M40 96 80 36 160 36 200 96Z" fill="#eee6fb" stroke="#8b68b3" stroke-width="2.5"/><path d="M80 36V96M80 84H92V96" fill="none" stroke="#ff795f" stroke-width="1.8"/><circle cx="40" cy="96" r="3" fill="#ff795f"/><circle cx="200" cy="96" r="3" fill="#ff795f"/>', 'Трапеция на сетке: основания 8 и 4 клетки, высота 3 клетки'), note: 'S = (a + b)h/2 = (8 + 4) · 3 / 2 = 18 квадратных клеток.' },
  { q: 'На сетке изображён параллелограмм с основанием 5 клеток и высотой 3 клетки. Найдите его площадь.', a: ['8', '15', '16', '30'], correct: 1, line: 18, figure: gridFigure('<path d="M60 96 160 96 200 36 100 36Z" fill="#dff4e8" stroke="#478c70" stroke-width="2.5"/><path d="M100 36V96M100 84H112V96" fill="none" stroke="#ff795f" stroke-width="1.8"/>', 'Параллелограмм на сетке: основание 5 клеток, высота 3 клетки'), note: 'Площадь параллелограмма равна основанию, умноженному на высоту: 5 · 3 = 15 квадратных клеток.' },
  { q: 'Диагонали ромба на клетчатой бумаге равны 6 и 4 клеткам. Найдите площадь ромба.', a: ['10', '12', '20', '24'], correct: 1, line: 18, figure: gridFigure('<path d="M120 36 180 76 120 116 60 76Z" fill="#f3efff" stroke="#8b68b3" stroke-width="2.5"/><path d="M60 76H180M120 36V116" stroke="#ff795f" stroke-width="1.8"/><circle cx="120" cy="36" r="3" fill="#ff795f"/><circle cx="120" cy="116" r="3" fill="#ff795f"/>', 'Ромб на сетке с диагоналями длиной 6 и 4 клетки'), note: 'Площадь ромба равна половине произведения диагоналей: S = 6 · 4 / 2 = 12 квадратных клеток.' },
  { q: 'В прямоугольном треугольнике на сетке катеты равны 4 и 3 клетки. Найдите тангенс угла, противолежащего катету 3.', a: ['3/4', '4/3', '3/5', '4/5'], correct: 0, line: 18, figure: gridFigure('<path d="M60 96H140V36Z" fill="#dfe5ff" stroke="#3158f5" stroke-width="2.5"/><path d="M128 96V84H140" fill="none" stroke="#ff795f" stroke-width="1.8"/><text x="48" y="108" fill="#35415b" font-size="13">A</text><text x="144" y="34" fill="#35415b" font-size="13">B</text><text x="144" y="108" fill="#35415b" font-size="13">C</text>', 'Прямоугольный треугольник на сетке с катетами 4 и 3 клетки'), note: 'Тангенс указанного острого угла равен отношению противолежащего катета к прилежащему: 3/4.' }
]);

appendOgeQuestions('Углы и параллельные прямые', [
  { q: 'При пересечении параллельных прямых секущей внутренние односторонние углы равны 124° и x. Найдите x.', a: ['46°', '56°', '124°', '236°'], correct: 1, line: 15, figure: parallelAngleFigure({ kind: 'same-side', given: '124°', unknown: 'x' }), note: 'Внутренние односторонние углы при параллельных прямых в сумме равны 180°. x = 180° − 124° = 56°.' },
  { q: 'Параллельные прямые пересечены секущей. Один из накрест лежащих углов равен 67°. Найдите другой.', a: ['67°', '113°', '123°', '293°'], correct: 0, line: 15, figure: parallelAngleFigure({ kind: 'alternate', given: '67°', unknown: 'x' }), note: 'Накрест лежащие углы при параллельных прямых равны. Искомый угол равен 67°.' },
  { q: 'При пересечении двух прямых один угол равен 116°. Найдите вертикальный ему угол.', a: ['64°', '74°', '116°', '180°'], correct: 2, line: 15, figure: parallelAngleFigure({ kind: 'vertical', given: '116°', unknown: 'x' }), note: 'Вертикальные углы равны, поэтому искомый угол тоже равен 116°.' },
  { q: 'В трапеции основания параллельны. Угол при одном основании и боковой стороне равен 112°. Найдите внутренний односторонний угол при той же боковой стороне.', a: ['58°', '68°', '78°', '112°'], correct: 1, line: 17, figure: parallelAngleFigure({ kind: 'same-side', given: '112°', unknown: 'x' }), note: 'Боковая сторона трапеции является секущей параллельных оснований. Внутренние односторонние углы в сумме дают 180°: x = 180° − 112° = 68°.' }
]);

appendOgeQuestions('Геометрические утверждения', [
  { q: 'Какое утверждение верно?', a: ['В прямоугольном треугольнике сумма острых углов равна 90°', 'Любые два прямоугольных треугольника равны', 'Диагонали любого параллелограмма равны', 'У любого треугольника есть два прямых угла'], correct: 0, line: 19, figure: rightTriangleFigure({ angleB: 'x', vertical: 'a', base: 'b' }), note: 'Сумма углов треугольника равна 180°. Один угол прямоугольного треугольника равен 90°, значит сумма двух острых углов также 90°.' },
  { q: 'Какое утверждение всегда верно для параллелограмма?', a: ['Диагонали равны', 'Диагонали взаимно перпендикулярны', 'Диагонали точкой пересечения делятся пополам', 'Все углы прямые'], correct: 2, line: 19, figure: bisectedDiagonalsFigure(), note: 'Диагонали любого параллелограмма делятся точкой пересечения пополам. Равными или перпендикулярными они бывают только у отдельных параллелограммов.' },
  { q: 'Какое утверждение о трапеции верно?', a: ['У неё две пары параллельных сторон', 'Её основания параллельны', 'Все её стороны равны', 'Диагонали всегда равны'], correct: 1, line: 19, figure: trapezoidFigure({ baseA: '14', baseB: '8', midline: true }), note: 'У трапеции основания — параллельные стороны. Остальные перечисленные свойства есть только у отдельных видов четырёхугольников.' },
  { q: 'Выберите верное утверждение об окружности.', a: ['Все радиусы одной окружности равны', 'Любая хорда является диаметром', 'Диаметр меньше радиуса', 'Касательная пересекает окружность в двух точках'], correct: 0, line: 19, figure: diameterFigure(), note: 'Все радиусы одной окружности равны по определению. Диаметр — частный случай хорды, проходящей через центр, и равен двум радиусам.' },
  { q: 'Какое свойство касательной верно?', a: ['Касательная перпендикулярна радиусу в точке касания', 'Касательная параллельна радиусу в точке касания', 'Из внешней точки можно провести ровно одну касательную', 'Любая прямая пересекает окружность в двух точках'], correct: 0, line: 19, figure: tangentFigure({ label: 'Касательная и радиус, проведённый в точку касания' }), note: 'Радиус, проведённый в точку касания, перпендикулярен касательной. Из точки вне окружности можно провести две касательные.' },
  { q: 'Какое утверждение верно для любого прямоугольника?', a: ['Диагонали равны и делятся точкой пересечения пополам', 'Диагонали обязательно перпендикулярны', 'Все стороны равны', 'Противоположные стороны не параллельны'], correct: 0, line: 19, figure: rectangleFigure({ diagonals: true }), note: 'Диагонали прямоугольника равны и делятся точкой пересечения пополам. Перпендикулярны они только в частном случае квадрата.' }
]);

appendOgeQuestions('Смешанные задачи ОГЭ', [
  { q: 'Катеты прямоугольного треугольника равны 7 и 24. Найдите гипотенузу.', a: ['25', '26', '31', '√527'], correct: 0, line: 15, figure: rightTriangleFigure({ vertical: '7', base: '24', hypotenuse: 'x' }), note: 'По теореме Пифагора x² = 7² + 24² = 49 + 576 = 625, поэтому x = 25.' },
  { q: 'Центральный угол равен 84°. Найдите вписанный угол, опирающийся на ту же дугу.', a: ['21°', '42°', '84°', '168°'], correct: 1, line: 16, figure: circleAngleFigure({ kind: 'central', given: '84°', unknown: 'x' }), note: 'Вписанный угол на той же дуге равен половине центрального: 84° / 2 = 42°.' },
  { q: 'Основания трапеции равны 10 и 18, высота равна 4. Найдите площадь.', a: ['28', '40', '56', '112'], correct: 2, line: 17, figure: trapezoidFigure({ baseA: '18', baseB: '10', height: '4' }), note: 'S = (a + b)h/2 = (10 + 18) · 4 / 2 = 56.' },
  { q: 'Площадь параллелограмма равна 96, основание — 12. Найдите высоту, проведённую к этому основанию.', a: ['6', '8', '12', '24'], correct: 1, line: 17, figure: parallelogramFigure({ base: '12', height: '8' }), note: 'S = ah, поэтому h = S/a = 96/12 = 8.' },
  { q: 'AB — диаметр окружности, ∠CAB = 28°. Найдите ∠CBA.', a: ['28°', '52°', '62°', '90°'], correct: 2, line: 16, figure: diameterTriangleAnglesFigure({ given: '28°', unknown: 'x' }), note: 'Угол ACB равен 90°, так как опирается на диаметр. Тогда ∠CBA = 180° − 90° − 28° = 62°.' },
  { q: 'Диагонали ромба равны 14 и 16. Найдите площадь ромба.', a: ['56', '96', '112', '224'], correct: 2, line: 17, figure: rhombusFigure({ diagonal1: '14', diagonal2: '16' }), note: 'Площадь ромба равна половине произведения диагоналей: 14 · 16 / 2 = 112.' }
]);

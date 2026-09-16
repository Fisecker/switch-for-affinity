'use strict';
// InDesign "Objekt > Anpassen" fuer Affinity – MODE wird vom Aufrufer ersetzt
const MODE = '__MODE__'; // center | fitProp | fillProp | contentToFrame | frameToContent
const { app } = require('/application.js');
const { Document } = require('/document.js');
const { DocumentCommand } = require('/commands.js');
const { Selection } = require('/selections.js');
const { Transform } = require('/geometry.js');
const { createTypedNode } = require('/nodes.js');

function frameOf(node) {
  try { if (node.pictureFrameInterface && node.pictureFrameInterface.enabled) return node; } catch (e) {}
  return null;
}
function contentOf(frame) {
  const pf = frame.pictureFrameInterface;
  try { if (pf.hasFrameContents) return createTypedNode(pf.frameContents); } catch (e) {}
  try { return frame.firstChild; } catch (e) {}
  return null;
}
function box(n) { const b = n.getSpreadBaseBox(false); return { x: b.x, y: b.y, w: b.width, h: b.height }; }
function xfAbout(cx, cy, sx, sy) {
  return Transform.createTranslate(cx, cy).multiply(Transform.createScale(sx, sy)).multiply(Transform.createTranslate(-cx, -cy));
}

const doc = Document.current;
if (!doc) { console.log('KEIN_DOKUMENT'); }
else {
  const sel = [...doc.selection.nodes];
  let done = 0;
  for (const node of sel) {
    let frame = frameOf(node), content = null;
    if (frame) content = contentOf(frame);
    else { const p = node.parent; if (p && frameOf(p)) { frame = p; content = node; } }
    if (!frame || !content) continue;
    const fb = box(frame), cb = box(content);
    if (cb.w <= 0 || cb.h <= 0 || fb.w <= 0 || fb.h <= 0) continue;
    const ccx = cb.x + cb.w / 2, ccy = cb.y + cb.h / 2;
    const fcx = fb.x + fb.w / 2, fcy = fb.y + fb.h / 2;
    let xf = null;
    if (MODE === 'center') {
      xf = Transform.createTranslate(fcx - ccx, fcy - ccy);
    } else if (MODE === 'fitProp' || MODE === 'fillProp') {
      const s = MODE === 'fitProp' ? Math.min(fb.w / cb.w, fb.h / cb.h) : Math.max(fb.w / cb.w, fb.h / cb.h);
      xf = Transform.createTranslate(fcx - ccx, fcy - ccy).multiply(xfAbout(ccx, ccy, s, s));
    } else if (MODE === 'contentToFrame') {
      xf = Transform.createTranslate(fcx - ccx, fcy - ccy).multiply(xfAbout(ccx, ccy, fb.w / cb.w, fb.h / cb.h));
    }
    if (xf) {
      doc.executeCommand(DocumentCommand.createTransform(Selection.create(doc, content), xf, { mergeable: false }));
      done++;
    } else if (MODE === 'frameToContent') {
      const fx = Transform.createTranslate(cb.x, cb.y).multiply(Transform.createScale(cb.w / fb.w, cb.h / fb.h)).multiply(Transform.createTranslate(-fb.x, -fb.y));
      doc.executeCommand(DocumentCommand.createTransform(Selection.create(doc, frame), fx, { mergeable: false, correctChildren: true }));
      done++;
    }
    try { const a = box(frame), b = box(content); console.log('frame', JSON.stringify(a), 'content', JSON.stringify(b)); } catch (e) {}
  }
  console.log('ANGEPASST:' + done + ' von ' + sel.length);
}

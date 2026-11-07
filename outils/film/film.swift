// Tournage des vidéos de l'accueil : une page web filmée hors écran, image par image, sur une horloge virtuelle.
// Le temps de la page (performance.now, Date, requestAnimationFrame, setTimeout/setInterval, animations CSS) n'avance
// que d'une image à la fois : la vidéo est parfaitement régulière, quelle que soit la lenteur de la machine.
//
// Compilation : swiftc -O outils/film/film.swift -o outils/film/film
// Usage : film <url> <largeur> <hauteur> <scenario.js[,autre.js]> <dossier de sortie> [options]
//   --fps 30          images par seconde
//   --duree 8         secondes filmées
//   --sortie 1920     largeur des images (pixels)
//   --attente 1.5     secondes d'attente après le chargement, avant la préparation
//   --sombre          apparence sombre
//   --avant f.js      script injecté au tout début de la page (avant les siens)
//
// Le scénario (JS, exécuté dans la page) peut définir :
//   async function preparer()  — en temps réel, avant le tournage (chargements, réglages)
//   async function scenario()  — en temps virtuel, pendant le tournage
// Outils dans la page : voir INJECTE ci-dessous (__film.attendre, aller, cliquer, glisser, taper, camera…).
import AppKit
import WebKit

let INJECTE = #"""
(() => {
  if (window.__film) return;
  const nat = { now: performance.now.bind(performance), dnow: Date.now, raf: window.requestAnimationFrame.bind(window),
    caf: window.cancelAnimationFrame.bind(window), st: window.setTimeout.bind(window), ct: window.clearTimeout.bind(window),
    si: window.setInterval.bind(window) };
  let virt = false, t = 0, base = 0, seq = 1e7;
  const minuteries = new Map();
  let images = new Map(), attentes = [];
  const debuts = new WeakMap();
  const F = window.__film = { workers: [], chaqueImage: [], cadre: null, journal: [], avance: 0 };
  F.t = () => (virt ? t : nat.now());
  F.virtuel = () => virt;

  // ——— horloge ——— (F.avance : avance rapide de l'heure vue par la page, sans toucher aux animations ni aux minuteries)
  performance.now = () => (virt ? t + F.avance : nat.now());
  const D = Date;
  const FD = function (...a) {
    if (!new.target) return new D(FD.now()).toString();
    return Reflect.construct(D, a.length ? a : [FD.now()], new.target);
  };
  FD.prototype = D.prototype;
  Object.setPrototypeOf(FD, D);
  FD.now = () => (virt ? base + t + F.avance : nat.dnow());
  window.Date = FD;
  window.requestAnimationFrame = (cb) => { if (!virt) return nat.raf(cb); const id = ++seq; images.set(id, cb); return id; };
  window.cancelAnimationFrame = (id) => { if (images.has(id)) images.delete(id); else nat.caf(id); };
  window.setTimeout = (fn, ms, ...args) => {
    if (!virt) return nat.st(fn, ms, ...args);
    const id = ++seq; minuteries.set(id, { due: t + Math.max(0, +ms || 0), fn, args, pas: 0 }); return id;
  };
  window.setInterval = (fn, ms, ...args) => {
    if (!virt) return nat.si(fn, ms, ...args);
    const p = Math.max(1, +ms || 0), id = ++seq; minuteries.set(id, { due: t + p, fn, args, pas: p }); return id;
  };
  window.clearTimeout = window.clearInterval = (id) => { if (minuteries.has(id)) minuteries.delete(id); else nat.ct(id); };

  // ——— page toujours visible ———
  Object.defineProperty(Document.prototype, 'hidden', { get: () => false, configurable: true });
  Object.defineProperty(Document.prototype, 'visibilityState', { get: () => 'visible', configurable: true });
  Document.prototype.hasFocus = () => true;
  if (window.Worker) window.Worker = new Proxy(window.Worker, { construct(T, a) { const w = Reflect.construct(T, a); F.workers.push(w); return w; } });
  window.addEventListener('error', (e) => F.journal.push(String(e.message)));
  const ce = console.error.bind(console);
  console.error = (...a) => { F.journal.push(a.map(String).join(' ')); ce(...a); };

  // ——— passage en temps virtuel ———
  F.figer = () => { if (virt) return; t = nat.now(); base = nat.dnow() - t; virt = true; F.t0 = t; };
  F.lancer = () => { if (typeof window.__scenario === 'function') window.__scenario().catch((e) => F.journal.push('scénario : ' + e)); };

  function animer() {
    for (const a of document.getAnimations()) {
      let s = debuts.get(a);
      if (s === undefined) { s = t - (a.currentTime || 0); debuts.set(a, s); try { a.pause(); } catch (e) {} }
      try { a.currentTime = Math.max(0, t - s); } catch (e) {}
    }
  }

  // F.pause : l'horloge avance au rythme réel mais rien n'est filmé (attendre un téléchargement sans le montrer)
  F.dormirReel = (ms) => new Promise((r) => nat.st(r, ms));
  F.pas = async (dt) => {
    if (F.pause && dt > 0) await new Promise((r) => nat.st(r, dt));
    const fin = t + dt;
    t = fin; animer(); t = fin - dt;   // les animations en cours avancent avant que la page ne les relance (transitions reprises à chaque image)
    for (let n = 0; n < 20000; n++) {
      let id = null, m = null;
      for (const [k, v] of minuteries) if (v.due <= fin && (!m || v.due < m.due)) { id = k; m = v; }
      if (!m) break;
      t = Math.max(t, m.due);
      if (m.pas) m.due += m.pas; else minuteries.delete(id);
      try { if (typeof m.fn === 'function') m.fn(...m.args); } catch (e) { F.journal.push('minuterie : ' + e); }
      await 0;
    }
    t = fin;
    const a = attentes; attentes = [];
    for (const r of a) r(t);
    await 0; await 0;
    for (const h of F.chaqueImage) { try { h(t); } catch (e) { F.journal.push('image : ' + e); } }
    const cbs = [...images.values()]; images = new Map();
    for (const cb of cbs) { try { cb(t); } catch (e) { F.journal.push('raf : ' + e); } }
    await 0;
    animer();
    poserCurseur();
    await new Promise((r) => nat.st(r, 0));
    if (F.pause) return 'sauter';
    return F.cadre ? JSON.stringify(F.cadre) : '';
  };

  // ——— outils du scénario ———
  F.attendre = (ms) => new Promise((r) => window.setTimeout(r, ms));
  F.prochaine = () => new Promise((r) => attentes.push(r));
  F.lisse = (k) => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  F.doux = (k) => 1 - Math.pow(1 - k, 3);
  /// Fait varier une valeur de 0 à 1 pendant ms (temps virtuel), en appelant f(k) à chaque image.
  F.pendant = async (ms, f, courbe = F.lisse) => {
    const t0 = t;
    for (;;) { const tt = await F.prochaine(); const k = Math.min(1, (tt - t0) / ms); f(courbe(k), k); if (k >= 1) return; }
  };
  F.el = (s) => (typeof s === 'string' ? document.querySelector(s) : s);
  F.centre = (s, fx = .5, fy = .5) => { const r = F.el(s).getBoundingClientRect(); return [r.left + r.width * fx, r.top + r.height * fy]; };

  // caméra : un rectangle filmé (pixels CSS, proportions 2:1), ou une liste de rectangles côte à côte (écran partagé,
  // chacun mis à la même hauteur : deux carrés font une image 2:1)
  F.camera = async (c, ms = 0, courbe = F.lisse) => {
    const liste = Array.isArray(c);
    if (!ms || !F.cadre || Array.isArray(F.cadre) !== liste) { F.cadre = liste ? c.map((r) => ({ ...r })) : { ...c }; return; }
    const a = liste ? F.cadre.map((r) => ({ ...r })) : { ...F.cadre };
    const mel = (p, q, k) => ({ x: p.x + (q.x - p.x) * k, y: p.y + (q.y - p.y) * k, w: p.w + (q.w - p.w) * k, h: p.h + (q.h - p.h) * k });
    await F.pendant(ms, (k) => { F.cadre = liste ? c.map((q, i) => mel(a[i] || q, q, k)) : mel(a, c, k); }, courbe);
  };

  // curseur dessiné et événements de souris synthétiques
  const cur = { x: -40, y: -40, bas: false, visible: false, appui: 0, el: null, capt: null, forme: 'fleche' };   // forme : 'fleche' ou 'ns' (redimensionner)
  F.curseur = cur;
  const spc = Element.prototype.setPointerCapture, rpc = Element.prototype.releasePointerCapture;
  Element.prototype.setPointerCapture = function (id) { try { spc.call(this, id); } catch (e) {} if (cur.bas) cur.capt = this; };
  Element.prototype.releasePointerCapture = function (id) { try { rpc.call(this, id); } catch (e) {} if (cur.capt === this) cur.capt = null; };
  Element.prototype.hasPointerCapture = function () { return cur.capt === this; };
  function poserCurseur() {
    if (!cur.el) {
      if (!document.body) return;
      cur.el = document.createElement('div');
      cur.el.setAttribute('data-film', '');
      cur.el.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;z-index:2147483647;pointer-events:none';
      cur.el.innerHTML = '<i style="position:absolute;left:-22px;top:-22px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.35);border:2px solid rgba(255,255,255,.9);box-shadow:0 0 0 1px rgba(0,0,0,.12);opacity:0"></i>'
        + '<svg width="26" height="30" viewBox="0 0 26 30" style="position:absolute;left:-3px;top:-2px;filter:drop-shadow(0 1.5px 2px rgba(0,0,0,.35))">'
        + '<path d="M3 2 L3 24 L8.6 18.6 L12.6 27.4 L16.4 25.7 L12.5 17.1 L20.2 17.1 Z" fill="#111" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/></svg>'
        + '<svg width="24" height="32" viewBox="0 0 24 32" style="position:absolute;left:-12px;top:-16px;display:none;filter:drop-shadow(0 1.5px 2px rgba(0,0,0,.35))">'
        + '<path d="M12 1.5 L18.5 9 H14.2 V13.6 H21 V18.4 H14.2 V23 H18.5 L12 30.5 L5.5 23 H9.8 V18.4 H3 V13.6 H9.8 V9 H5.5 Z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
      document.documentElement.appendChild(cur.el);
    }
    cur.el.style.display = cur.visible ? '' : 'none';
    cur.el.style.transform = `translate(${cur.x}px, ${cur.y}px)`;
    const ond = cur.el.firstChild, k = cur.appui ? Math.min(1, (t - cur.appui) / 450) : 1;
    ond.style.opacity = cur.appui && k < 1 ? String(.9 * (1 - k)) : '0';
    ond.style.transform = `scale(${.35 + .9 * F.doux(k)})`;
    const fl = cur.el.children[1], ns = cur.el.children[2];
    fl.style.display = cur.forme === 'ns' ? 'none' : '';
    ns.style.display = cur.forme === 'ns' ? '' : 'none';
    fl.style.transform = cur.bas ? 'scale(.86)' : '';
  }
  function cible(x, y) {
    if (cur.el) cur.el.style.display = 'none';
    const e = document.elementFromPoint(x, y) || document.body;
    if (cur.el) cur.el.style.display = cur.visible ? '' : 'none';
    return e;
  }
  F.cible = cible;
  function envoyer(type, x, y, el, extra = {}) {
    const o = { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, screenX: x, screenY: y, view: window,
      button: 0, buttons: cur.bas ? 1 : 0, pointerId: 1, pointerType: 'mouse', isPrimary: true, width: 1, height: 1, pressure: cur.bas ? .5 : 0, ...extra };
    const C = type.startsWith('pointer') ? PointerEvent : type === 'wheel' ? WheelEvent : MouseEvent;
    el.dispatchEvent(new C(type, o));
  }
  F.envoyer = envoyer;
  function bouger(x, y) {
    cur.x = x; cur.y = y;
    const el = (cur.bas && cur.capt) || cible(x, y);
    envoyer('pointermove', x, y, el); envoyer('mousemove', x, y, el);
  }
  F.montrer = (x, y) => { cur.visible = true; if (x !== undefined) { cur.x = x; cur.y = y; } };
  F.cacher = () => { cur.visible = false; };
  /// Déplace le curseur vers (x, y) ou vers le centre d'un élément.
  F.aller = async (x, y, ms = 700) => {
    if (typeof x !== 'number') [x, y] = F.centre(x, y?.fx ?? .5, y?.fy ?? .5);
    cur.visible = true;
    const x0 = cur.x, y0 = cur.y;
    await F.pendant(ms, (k) => bouger(x0 + (x - x0) * k, y0 + (y - y0) * k));
  };
  F.appuyer = () => {
    const el = cible(cur.x, cur.y); cur.bas = true; cur.appui = t; cur.capt = null;
    envoyer('pointerdown', cur.x, cur.y, el); envoyer('mousedown', cur.x, cur.y, el);
    cur.basSur = el;
    if (el.focus && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName)) el.focus();
  };
  F.relacher = () => {
    const el = cur.capt || cible(cur.x, cur.y); cur.bas = false;
    envoyer('pointerup', cur.x, cur.y, el); envoyer('mouseup', cur.x, cur.y, el);
    if (cur.basSur && (cur.basSur === el || cur.basSur.contains(el) || el.contains(cur.basSur))) envoyer('click', cur.x, cur.y, el, { detail: 1 });
    cur.capt = null; cur.basSur = null;
  };
  F.cliquer = async (x, y, ms = 700) => {
    if (x !== undefined) await F.aller(x, y, ms);
    F.appuyer(); await F.attendre(90); F.relacher(); await F.attendre(120);
  };
  /// Glisse le bouton enfoncé jusqu'à (x, y) en ms ; chemin = fonction k → [x, y] facultative.
  F.glisser = async (x, y, ms = 800, chemin = null) => {
    const x0 = cur.x, y0 = cur.y;
    F.appuyer(); await F.attendre(60);
    await F.pendant(ms, (k) => { const p = chemin ? chemin(k) : [x0 + (x - x0) * k, y0 + (y - y0) * k]; bouger(p[0], p[1]); });
    await F.attendre(60); F.relacher();
  };
  F.molette = (dy, x = cur.x, y = cur.y) => envoyer('wheel', x, y, cible(x, y), { deltaY: dy, deltaMode: 0 });
  /// Tape un texte dans un champ, lettre après lettre.
  F.taper = async (s, texte, ms = 70) => {
    const el = F.el(s); el.focus();
    for (const c of texte) {
      el.value += c;
      el.dispatchEvent(new InputEvent('input', { bubbles: true, data: c, inputType: 'insertText' }));
      await F.attendre(ms);
    }
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  F.touche = (key, el = document.activeElement || document.body) => {
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    el.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }));
  };
})();
"""#

let a = CommandLine.arguments
guard a.count >= 6 else {
  print("usage : film <url> <largeur> <hauteur> <scenario.js> <dossier> [--fps 30] [--duree 8] [--sortie 1920] [--attente 1.5] [--sombre]")
  exit(64)
}
func option(_ nom: String, _ defaut: Double) -> Double {
  if let i = a.firstIndex(of: nom), i + 1 < a.count, let v = Double(a[i + 1]) { return v }
  return defaut
}
let url = URL(string: a[1])!, L = Double(a[2])!, H = Double(a[3])!
let scenarioSource = a[4].split(separator: ",").map { try! String(contentsOfFile: String($0), encoding: .utf8) }.joined(separator: "\n")   // plusieurs fichiers : « commun.js,extrait.js »
let dossier = URL(fileURLWithPath: a[5])
let fps = option("--fps", 30), duree = option("--duree", 8), largeurSortie = option("--sortie", 1920)
let attente = option("--attente", 1.5)
let total = Int((fps * duree).rounded())
try? FileManager.default.createDirectory(at: dossier, withIntermediateDirectories: true)

let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
let conf = WKWebViewConfiguration()
conf.websiteDataStore = .nonPersistent()
conf.userContentController.addUserScript(WKUserScript(source: INJECTE, injectionTime: .atDocumentStart, forMainFrameOnly: true))
if let i = a.firstIndex(of: "--avant"), i + 1 < a.count, let js = try? String(contentsOfFile: a[i + 1], encoding: .utf8) {
  conf.userContentController.addUserScript(WKUserScript(source: js, injectionTime: .atDocumentStart, forMainFrameOnly: true))
}
conf.preferences.setValue(true, forKey: "developerExtrasEnabled")
let vue = WKWebView(frame: NSRect(x: 0, y: 0, width: L, height: H), configuration: conf)
if a.contains("--sombre") { vue.appearance = NSAppearance(named: .darkAqua) } else { vue.appearance = NSAppearance(named: .aqua) }
let fen = NSWindow(contentRect: vue.frame, styleMask: [.borderless], backing: .buffered, defer: false)
fen.contentView = vue
fen.alphaValue = 0
fen.orderFrontRegardless()
let echelle = fen.backingScaleFactor
let file = DispatchQueue(label: "png", attributes: .concurrent)
let groupe = DispatchGroup()

func ecrire(_ cg: CGImage, _ n: Int) {
  groupe.enter()
  file.async {
    let u = dossier.appendingPathComponent(String(format: "%04d.png", n))
    if let d = CGImageDestinationCreateWithURL(u as CFURL, "public.png" as CFString, 1, nil) {
      CGImageDestinationAddImage(d, cg, nil); CGImageDestinationFinalize(d)
    }
    groupe.leave()
  }
}

func journal(_ fin: @escaping () -> Void) {
  vue.evaluateJavaScript("JSON.stringify(__film.journal.slice(0, 20))") { r, _ in
    if let s = r as? String, s != "[]" { print("journal de la page :", s) }
    fin()
  }
}

var debut = Date()
/// Prend une capture par rectangle (en séquence) ; plusieurs rectangles = écran partagé, côte à côte.
func capturer(_ rects: [NSRect], _ i: Int = 0, _ faites: [CGImage] = [], fin: @escaping ([CGImage]) -> Void) {
  if i == rects.count { fin(faites); return }
  let c = WKSnapshotConfiguration()
  let r = rects[i]
  if !r.isNull { c.rect = r }
  let hauteurSortie = largeurSortie / 2
  let largeurPx = rects.count == 1 ? largeurSortie : hauteurSortie * (r.isNull ? L / H : r.width / r.height)
  c.snapshotWidth = NSNumber(value: max(r.isNull ? L : r.width, largeurPx / echelle))
  c.afterScreenUpdates = true
  vue.takeSnapshot(with: c) { img, e in
    var f = faites
    if let img, let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) { f.append(cg) } else { print("capture impossible :", e as Any) }
    capturer(rects, i + 1, f, fin: fin)
  }
}
func assembler(_ images: [CGImage]) -> CGImage? {
  if images.count == 1 { return images[0] }
  let h = images.map { $0.height }.max() ?? 1
  let largeurs = images.map { Int((Double($0.width) * Double(h) / Double($0.height)).rounded()) }
  guard let ctx = CGContext(data: nil, width: largeurs.reduce(0, +), height: h, bitsPerComponent: 8, bytesPerRow: 0,
                            space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { return nil }
  ctx.interpolationQuality = .high
  var x = 0
  for (k, im) in images.enumerated() { ctx.draw(im, in: CGRect(x: x, y: 0, width: largeurs[k], height: h)); x += largeurs[k] }
  return ctx.makeImage()
}
func rectangle(_ d: [String: Double]) -> NSRect { NSRect(x: d["x"] ?? 0, y: d["y"] ?? 0, width: d["w"] ?? L, height: d["h"] ?? H) }
func image(_ n: Int) {
  if n == total {
    groupe.notify(queue: .main) {
      journal { print(String(format: "%d images en %.0f s → %@", total, Date().timeIntervalSince(debut), dossier.path)); exit(0) }
    }
    return
  }
  vue.callAsyncJavaScript("return await __film.pas(dt)", arguments: ["dt": n == 0 ? 0 : 1000 / fps], in: nil, in: .page) { r in
    if case .success(let v) = r, let s = v as? String, s == "sauter" { image(n); return }   // pause : rien n'est filmé
    var rects = [NSRect.null]
    if case .success(let v) = r, let s = v as? String, !s.isEmpty, let o = try? JSONSerialization.jsonObject(with: Data(s.utf8)) {
      if let d = o as? [String: Double] { rects = [rectangle(d)] }
      else if let l = o as? [[String: Double]], !l.isEmpty { rects = l.map(rectangle) }
    } else if case .failure(let e) = r { print("pas \(n) :", e) }
    capturer(rects) { images in
      if let cg = assembler(images) { ecrire(cg, n) }
      if n % 60 == 0 { print("image \(n)/\(total)") }
      image(n + 1)
    }
  }
}

final class Navigation: NSObject, WKNavigationDelegate {
  var parti = false
  func webView(_ w: WKWebView, didFinish n: WKNavigation!) {
    if parti { return }
    parti = true
    DispatchQueue.main.asyncAfter(deadline: .now() + attente) {
      let corps = scenarioSource + """

        ;window.__scenario = (typeof scenario === 'function') ? scenario : null;
        if (typeof preparer === 'function') await preparer();
        return 'prêt';
        """
      w.callAsyncJavaScript(corps, arguments: [:], in: nil, in: .page) { r in
        if case .failure(let e) = r { print("préparation :", e); journal { exit(1) }; return }
        w.evaluateJavaScript("__film.figer(); __film.lancer(); 1") { _, e in
          if let e { print("lancement :", e); exit(1) }
          debut = Date()
          image(0)
        }
      }
    }
  }
  func webView(_ w: WKWebView, didFail n: WKNavigation!, withError e: Error) { print("échec :", e); exit(1) }
  func webView(_ w: WKWebView, didFailProvisionalNavigation n: WKNavigation!, withError e: Error) { print("échec :", e); exit(1) }
}
let nav = Navigation()
vue.navigationDelegate = nav
vue.load(URLRequest(url: url))
DispatchQueue.main.asyncAfter(deadline: .now() + 900) { print("délai dépassé"); exit(2) }
app.run()

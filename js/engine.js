// 장면 그리기와 공통 화면 도구 (로딩, 알림, 사용법 창)
var UI = (function () {
  var stage, topTitle, topProgress, loadingEl, loadingMsg, toastEl, toastTimer;

  function init() {
    stage = document.getElementById('stage');
    topTitle = document.getElementById('topTitle');
    topProgress = document.getElementById('topProgress');
    loadingEl = document.getElementById('loading');
    loadingMsg = document.getElementById('loadingMsg');
    toastEl = document.getElementById('toast');
    document.getElementById('helpBtn').addEventListener('click', function () { showHelp(); });
    document.getElementById('helpClose').addEventListener('click', function () { document.getElementById('help').hidden = true; });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function setTheme(name) { document.body.className = 'theme-' + name; }

  function setTop(title, progress) {
    topTitle.textContent = title || '';
    topProgress.textContent = progress || '';
  }

  var keyHandler = null;

  function clear() {
    if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
    stage.innerHTML = '';
    window.scrollTo(0, 0);
    stage.classList.remove('fade-in');
    void stage.offsetWidth;
    stage.classList.add('fade-in');
    return stage;
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  // 그림 불러오기: 'img01.jpg'를 주면 .jpg → .png → .jpeg 순서로 찾아봄
  // 주인공이 철수면 남자 버전(img01_m.*)을 먼저 찾고, 없으면 원래 그림을 보여 줌
  var EXTS = ['.jpg', '.png', '.jpeg'];
  var gender = '';
  function setGender(g) { gender = g || ''; }
  function loadImg(img, src, onFail) {
    var base = src.replace(/\.(jpg|jpeg|png)$/i, '');
    var cands = [];
    if (gender === '철수') EXTS.forEach(function (e) { cands.push(base + '_m' + e); });
    EXTS.forEach(function (e) { cands.push(base + e); });
    var k = 0;
    img.onerror = function () {
      k++;
      if (k < cands.length) img.src = CONFIG.IMG_DIR + cands[k];
      else if (onFail) onFail();
    };
    img.src = CONFIG.IMG_DIR + cands[0];
  }

  // 그림이 실제로 있는지 찾아서 주소를 알려 줌 (없으면 null)
  function findImg(src, cb) {
    var img = new Image();
    img.onload = function () { cb(img.src); };
    loadImg(img, src, function () { cb(null); });
  }

  // 사진틀 (그림이 없으면 회색 칸으로 대신 보여 줌)
  function photo(src, label, caption) {
    var wrap = el('div', 'photo-wrap');
    var frame = el('div', 'photo');
    var img = document.createElement('img');
    img.alt = label || '';
    loadImg(img, src, function () {
      var ph = el('div', 'photo-ph');
      ph.textContent = '그림: ' + (label || src);
      if (img.parentNode === frame) frame.replaceChild(ph, img);
    });
    frame.appendChild(img);
    frame.appendChild(el('span', 'corner tl'));
    frame.appendChild(el('span', 'corner tr'));
    frame.appendChild(el('span', 'corner bl'));
    frame.appendChild(el('span', 'corner br'));
    wrap.appendChild(frame);
    if (caption) wrap.appendChild(el('p', 'pen caption', esc(caption)));
    return wrap;
  }

  /**
   * 장면 하나 그리기
   * o = { img, imgLabel, caption, title, paras[], quote, lines[{who,text}], choices[{label,onPick}], next{label,onNext}, extra(DOM) }
   * paras/quote/lines 문장은 이야기 원문(신뢰 가능)이라 HTML 허용, 학생 입력은 반드시 esc()로 감싸서 넣기
   */
  function scene(o) {
    var s = clear();
    var box = el('section', 'scene' + (o.img ? '' : ' scene--text'));
    if (o.img) box.appendChild(photo(o.img, o.imgLabel, o.caption));
    var t = el('div', 'scene-text');
    if (o.title) t.appendChild(el('h2', 'scene-title', o.title));
    (o.paras || []).forEach(function (p) { t.appendChild(el('p', 'para', p)); });
    if (o.quote) t.appendChild(el('div', 'quote', o.quote));
    if (o.lines && o.lines.length) {
      var ls = el('div', 'lines');
      o.lines.forEach(function (l) { ls.appendChild(el('p', 'line', '<b>' + l.who + '</b> ' + l.text)); });
      t.appendChild(ls);
    }
    if (o.extra) t.appendChild(o.extra);
    var act = el('div', 'actions');
    if (o.choices && o.choices.length) {
      o.choices.forEach(function (c, i) {
        var b = el('button', 'slip', (i === 0 ? '가. ' : i === 1 ? '나. ' : i === 2 ? '다. ' : '') + c.label);
        b.type = 'button';
        b.addEventListener('click', function () { c.onPick(); });
        act.appendChild(b);
      });
    }
    if (o.next) {
      var n = el('button', 'btn-main', o.next.label || '다음');
      n.type = 'button';
      n.addEventListener('click', function () { o.next.onNext(); });
      act.appendChild(n);
    }
    t.appendChild(act);
    box.appendChild(t);
    s.appendChild(box);
    return box;
  }

  /**
   * 노블게임식 장면: 대사 묶음(beat)을 한 번에 1~3줄씩 넘겨 가며 보여 줌
   * o = { img, imgLabel, caption, title, beats[], choices[], next{}, extra(fn → DOM) }
   * beat = [줄, 줄] 또는 { img, lines:[줄] }
   * 줄 = '서술 문장' | { w:'말하는 사람', t:'대사' } | { q:'광고·화면 글' } | { v:'음성 메시지' }
   * 이야기 원문은 HTML 허용(신뢰), 학생 입력은 esc()로 감싸기
   */
  function novel(o) {
    var s = clear();
    var box = el('section', 'scene novel' + (o.img ? '' : ' scene--text'));
    var photoBox = null;
    if (o.img) { photoBox = photo(o.img, o.imgLabel, o.caption); box.appendChild(photoBox); }
    var t = el('div', 'scene-text');
    if (o.title) t.appendChild(el('h2', 'scene-title', o.title));
    var log = el('div', 'log');
    t.appendChild(log);
    var tap = el('button', 'tap-next', '다음 ▼');
    tap.type = 'button';
    t.appendChild(tap);
    var act = el('div', 'actions');
    t.appendChild(act);
    box.appendChild(t);
    s.appendChild(box);

    var beats = o.beats || [];
    var i = 0;

    function lineEl(l) {
      if (typeof l === 'string') return el('p', 'ln nar', l);
      if (l.w) return el('p', 'ln say', '<b class="who">' + l.w + '</b><span>' + l.t + '</span>');
      if (l.q) return el('div', 'ln quote', l.q);
      if (l.v) return el('div', 'ln voice', '<span class="voice-tag">음성 메시지</span>' + l.v);
      return el('p', 'ln nar', '');
    }

    function showActions() {
      tap.hidden = true;
      if (o.extra) act.appendChild(o.extra());
      (o.choices || []).forEach(function (c, k) {
        var b = el('button', 'slip', ['가. ', '나. ', '다. '][k] + c.label + (c.disabled ? ' <small>(' + c.disabled + ')</small>' : ''));
        b.type = 'button';
        if (c.disabled) { b.disabled = true; b.classList.add('off'); }
        else b.addEventListener('click', function () { c.onPick(); });
        act.appendChild(b);
      });
      if (o.next) {
        var n = el('button', 'btn-main', o.next.label || '다음');
        n.type = 'button';
        n.addEventListener('click', function () { o.next.onNext(); });
        act.appendChild(n);
      }
      act.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function step() {
      if (i >= beats.length) return;
      Array.prototype.forEach.call(log.children, function (c) { c.classList.add('past'); });
      var b = beats[i];
      var lines = Array.isArray(b) ? b : b.lines;
      if (!Array.isArray(b) && b.img && photoBox) {
        var img = photoBox.querySelector('img');
        if (img) loadImg(img, b.img, null);
      }
      var g = el('div', 'beat');
      lines.forEach(function (l) { g.appendChild(lineEl(l)); });
      log.appendChild(g);
      i++;
      g.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      if (i >= beats.length) showActions();
    }

    tap.addEventListener('click', step);
    log.addEventListener('click', function () { if (!tap.hidden) step(); });
    keyHandler = function (e) {
      if ((e.key === ' ' || e.key === 'Enter') && !tap.hidden && ['TEXTAREA', 'INPUT', 'BUTTON'].indexOf(document.activeElement.tagName) < 0) {
        e.preventDefault();
        step();
      }
    };
    document.addEventListener('keydown', keyHandler);
    step();
    return box;
  }

  /**
   * 엔딩 크레딧: 어두운 화면에 한두 문장씩, 누를 때마다 넘어감
   * beats = [{ lines:['문장'], q:true(질문 강조), img:'img08.jpg', title:true(큰 제목) }]
   * 너무 빨리 넘기지 않도록 한 장면당 최소 0.7초 머무름
   */
  function credits(beats, onDone) {
    var ov = el('div', 'credits');
    var box = el('div', 'credits-box');
    var hint = el('p', 'credits-hint', '화면을 누르면 넘어가요 ▼');
    ov.appendChild(box);
    ov.appendChild(hint);
    document.body.appendChild(ov);
    var i = 0, shownAt = 0, busy = false;
    function paint(b) {
      box.className = 'credits-box' + (b.q ? ' is-q' : '') + (b.title ? ' is-title' : '');
      box.innerHTML = '';
      if (b.img) {
        var im = document.createElement('img');
        im.className = 'credits-img';
        im.alt = '';
        loadImg(im, b.img, function () { im.remove(); });
        box.appendChild(im);
      }
      (b.lines || []).forEach(function (t) { box.appendChild(el('p', 'credits-line', t)); });
      void box.offsetWidth;
      box.classList.add('in');
      shownAt = Date.now();
      hint.textContent = i >= beats.length ? '화면을 누르면 계속돼요 ▼' : '화면을 누르면 넘어가요 ▼';
      busy = false;
    }
    function next() {
      if (busy || Date.now() - shownAt < 700) return;
      if (i >= beats.length) {
        document.removeEventListener('keydown', onKey);
        ov.classList.add('closing');
        setTimeout(function () { ov.remove(); onDone(); }, 350);
        return;
      }
      var b = beats[i++];
      busy = true;
      if (!box.childNodes.length) { paint(b); return; }
      box.classList.remove('in');
      box.classList.add('out');           // 이전 문장을 천천히 흐리게
      setTimeout(function () { paint(b); }, 320);
    }
    function onKey(e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); next(); } }
    ov.addEventListener('click', next);
    document.addEventListener('keydown', onKey);
    next();
  }

  function loading(on, msg) {
    loadingMsg.textContent = msg || '잠시만 기다려 주세요';
    loadingEl.hidden = !on;
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 2600);
  }

  function showHelp() { document.getElementById('help').hidden = false; }

  return { init: init, esc: esc, el: el, setGender: setGender, findImg: findImg, setTheme: setTheme, setTop: setTop, clear: clear, photo: photo, scene: scene, novel: novel, credits: credits, loading: loading, toast: toast };
})();

// 3회차 「영원히」 — 보편성과 삶의 의미
// 지난 이야기 → 마지막 밤(낯선 사람) → A 영원한 삶(50·100·200·300년) 또는 B 마지막 하루 → 엔딩 크레딧 → 소감 3개
var Ep3 = (function () {
  var TITLE = '영원히';
  var DAUGHTER = '시안이';   // 자녀, 서술용
  var D_NAME = '시안';
  var STRANGER = '낯선 사람';
  var ctx, N, P, S, st;

  var CARD_KO = { '1개월': '한 달', '6개월': '6개월', '1년': '1년', '3년': '3년', '10년': '10년' };
  // 2회차 추도사의 첫 문장 (B 결말에서 실제로 읽힘)
  var EULOGY = {
    A: '"우리 {P}는 원래 바쁜 사람이었어요. 그런데 마지막에는 거의 매일 저녁 식탁에 있었어요."',
    B: '"우리 {P}는 끝까지 회사 사람들을 챙겼어요. 저는 {P} 얼굴보다 뒷모습을 더 많이 기억해요."',
    C: '"우리 {P}는 마지막에 하고 싶던 걸 했어요. 그때 {P} 얼굴이 제일 반짝였어요."',
    D: '"우리 {P}는 마지막에 혼자 있는 시간이 많았어요. 일기장을 읽고서야 알았어요. 매일 저를 생각하고 있었다는 걸."',
    E: '"우리 {P}는 정말 살고 싶어 했어요. 병원 창가에서 늘 바깥을 봤어요."',
    F: '"우리 {P}는 마지막까지 그냥 평소의 {P}였어요. 그 평범한 날들이 이렇게 소중한 줄 몰랐어요."'
  };

  // ───── 도우미 ─────
  function W(who, t) { return { w: who, t: t }; }
  function ME(t) { return W(N, t); }
  function X(t) { return W(STRANGER, t); }
  function hasBatchim(w) { var c = w.charCodeAt(w.length - 1); return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0; }
  function ga(w) { return w + (hasBatchim(w) ? '이' : '가'); }
  function neun(w) { return w + (hasBatchim(w) ? '은' : '는'); }
  function eul(w) { return w + (hasBatchim(w) ? '을' : '를'); }
  function L(t) { return { lines: [t] }; }

  // 2회차 기록 읽기
  function readPrev() {
    var e2 = ctx.prev.ep2 || {};
    var bucket = String(e2['버킷리스트'] || '').split(' | ').filter(function (x) { return x; }).map(function (x) {
      var m = x.match(/^(.*)\[(.*)\]([✓✗])$/);
      return m ? { text: m[1], cat: m[2], done: m[3] === '✓' } : { text: x, cat: '', done: false };
    });
    return {
      card: e2['카드'] || ctx.card || '1년',
      treat: String(e2['치료'] || '').indexOf('받음') === 0,
      code: String(e2['결말'] || '').charAt(0) || 'F',
      title: String(e2['결말'] || '').slice(2),
      bucket: bucket,
      ep1: ((ctx.prev.ep1 && ctx.prev.ep1['결말']) || '').charAt(0)
    };
  }

  function start(c) {
    ctx = c;
    N = c.name;
    P = N === '영희' ? '엄마' : '아빠';
    S = N === '영희' ? '남편' : '아내';
    st = { prev: readPrev(), asked: [], pill: '', child: '', relation: '', lastDay: '', age: 45, farewell: 0, faces: 20, thrill: 10, portrait: { mode: 'none' } };
    findPortrait();
    prologue();
  }

  // ───── 늙지 않는 얼굴 카드 ─────
  function findPortrait() {
    UI.findImg('portrait.png', function (u) {
      if (u) { st.portrait = { mode: 'sheet', src: u }; return; }
      UI.findImg('portrait1.png', function (u1) { if (u1) st.portrait = { mode: 'single', src: u1 }; });
    });
  }
  function ageCard() {
    var p = st.portrait, face;
    if (p.mode === 'sheet') face = '<span class="portrait" role="img" aria-label="' + N + '의 얼굴" style="background-image:url(\'' + p.src.replace(/'/g, '%27') + '\');background-position:0% 12%"></span>';
    else if (p.mode === 'single') face = '<span class="portrait"><img src="' + p.src + '" alt="' + N + '의 얼굴" style="width:100%;height:100%;object-fit:cover"></span>';
    else face = '<span class="portrait ph">' + N + '</span>';
    var card = UI.el('div', 'age-card',
      face +
      '<div class="age-rows">' +
      '<span class="big">' + st.age + '세의 ' + N + ' <small style="font-weight:400;font-size:13px">· 얼굴은 마흔다섯 그대로</small></span>' +
      '<div class="age-row"><span>배웅한 사람</span><span></span><span class="num">' + st.farewell + '명</span></div>' +
      '<div class="age-row"><span>기억나는 얼굴</span><span class="bar"><span style="width:' + (st.faces * 5) + '%"></span></span><span class="num">' + st.faces + '</span></div>' +
      '<div class="age-row"><span>설렘</span><span class="bar"><span style="width:' + (st.thrill * 10) + '%"></span></span><span class="num">' + st.thrill + '</span></div>' +
      '</div>');
    return card;
  }
  // 노블 장면 위쪽에 카드 붙이기
  function withCard(box) {
    var t = box.querySelector('.scene-text');
    t.insertBefore(ageCard(), t.firstChild);
  }

  // ───── 0. 지난 이야기 ─────
  function prologue() {
    UI.setTop(TITLE, '지난 이야기');
    var pr = st.prev;
    var miss = pr.bucket.filter(function (b) { return !b.done; });
    var beats = [
      { title: true, lines: ['세 번째 이야기', '영원히'] },
      L('지난 이야기.'),
      L(N + '에게 남은 시간은 ' + (CARD_KO[pr.card] || pr.card) + '이었다.')
    ];
    if (miss.length) beats.push({ lines: ['수첩에는 끝내 지우지 못한 줄이 남아 있었다.', '\'' + UI.esc(miss[0].text) + '\''] });
    else if (pr.bucket.length) beats.push(L('버킷리스트는 모두 지웠다. 그런데도 무언가가 남아 있었다.'));
    beats.push(L('그리고 마지막 밤, 낯선 사람이 찾아왔다.'));
    UI.credits(beats, s1);
  }

  // ───── 1. 마지막 밤 ─────
  function s1() {
    UI.setTop(TITLE, '1장 · 마지막 밤');
    var pr = st.prev;
    var miss = pr.bucket.filter(function (b) { return !b.done; });
    var tempt = (pr.card === '1개월' || pr.card === '6개월')
      ? X('너무 짧았죠? ' + (CARD_KO[pr.card]) + '은.')
      : X((CARD_KO[pr.card] || pr.card) + '으로 충분하셨나요? 정말로요?');
    var beats = [
      [(pr.treat ? '병실' : '안방') + ' 창밖으로 비가 내렸다. 모두 잠든 새벽이었다.'],
      ['곁의 의자에서 ' + ga(S) + ' 잠들어 있었다. 손에는 ' + DAUGHTER + '가 그린 그림이 쥐여 있었다.'],
      ['문이 열렸다. 긴 코트를 입은 사람이 서 있었다. 얼굴은 그림자에 가려 보이지 않았다.'],
      [X('늦은 시간에 죄송합니다. 이걸 드리려고 왔습니다.'), '작은 유리병 안에서 알약 하나가 희미하게 빛났다.'],
      [X('이걸 드시면, 죽지 않습니다. 병도, 늙음도 멈춥니다. 영원히.')],
      [X('단, 오직 당신만. 그리고 한 번 드시면 되돌릴 수 없습니다.')],
      [tempt]
    ];
    if (miss.length) beats.push([X('\'' + UI.esc(miss[0].text) + '\'… 아직 하실 일이 남았잖아요.')]);
    beats.push(['묻고 싶은 것이 많았다. 하지만 시간은 많지 않았다. <b>두 가지만 물어보자.</b>']);

    var QA = [
      { k: '누구', q: '"당신은 누구죠?"', a: [X('…오래 산 사람입니다. 아주 오래.'), X('이름은, 잊어버렸습니다.')] },
      { k: '왜', q: '"왜 하필 저에게?"', a: [X('당신이 무엇을 잃게 될지 아는 사람이니까요.'), X('그리고… 혼자는, 생각보다 길거든요.')] },
      { k: '먹으면', q: '"먹으면 어떻게 되죠?"', a: [X('내일 아침이면 병은 사라질 겁니다. 그다음부터는… 직접 겪어 보시게 되겠죠.'), X('다만 한 가지. 사랑하는 사람들은, 당신을 두고 계속 나이를 먹습니다.')] }
    ];

    UI.novel({
      img: 'img08.jpg', imgLabel: '약을 내미는 낯선 사람', caption: '마지막 밤',
      title: '마지막 밤',
      beats: beats,
      extra: function () {
        var wrap = UI.el('div', 'ask-wrap');
        wrap.appendChild(UI.el('p', 'ask-label', '물어볼 것 고르기 (2개)'));
        var btns = UI.el('div', 'ask-btns');
        var answers = UI.el('div', 'stack');
        var decide = UI.el('div', 'actions');
        decide.hidden = true;
        QA.forEach(function (item) {
          var b = UI.el('button', 'ask-btn', item.q);
          b.type = 'button';
          b.addEventListener('click', function () {
            if (st.asked.length >= 2) return;
            st.asked.push(item.k);
            b.disabled = true;
            var box = UI.el('div', 'ask-answer');
            box.appendChild(UI.el('p', '', '<b>' + N + '</b> ' + item.q));
            item.a.forEach(function (l) { box.appendChild(UI.el('p', '', '<b>' + l.w + '</b> ' + l.t)); });
            answers.appendChild(box);
            if (st.asked.length >= 2) {
              Array.prototype.forEach.call(btns.children, function (x) { x.disabled = true; });
              answers.appendChild(UI.el('p', 'para', '<b>' + STRANGER + '</b> …이제, 대답을 들려주시겠습니까?'));
              decide.hidden = false;
              decide.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          });
          btns.appendChild(b);
        });
        [['약을 먹는다', function () { st.pill = '먹음'; a1(); }], ['약병을 돌려준다', function () { st.pill = '거절'; b1(); }]].forEach(function (c, i) {
          var b = UI.el('button', 'slip', ['가. ', '나. '][i] + c[0]);
          b.type = 'button';
          b.addEventListener('click', c[1]);
          decide.appendChild(b);
        });
        wrap.appendChild(btns);
        wrap.appendChild(answers);
        wrap.appendChild(decide);
        return wrap;
      }
    });
  }

  // ───── A 갈래: 영원한 삶 ─────
  function a1() {
    UI.setTop(TITLE, 'A · 다음 날 아침');
    var box = UI.novel({
      title: '다음 날 아침',
      beats: [
        ['눈을 떴다. 몸이 가벼웠다. 숨을 쉬어도 아프지 않았다.'],
        [W('의사', '…이건, 말이 안 됩니다. 검사 결과가 깨끗해요.')],
        [ga(S) + ' 울면서 웃었다. ' + neun(DAUGHTER) + ' ' + eul(P) + ' 붙잡고 놓지 않았다.'],
        ['그날 밤 수첩을 펼쳤다. 남은 시간 칸 위에 길게 줄을 그었다.', '이제 남은 시간은 없다. 끝도 없다.']
      ],
      next: { label: '50년 뒤', onNext: a2 }
    });
    withCard(box);
  }

  function a2() {
    st.age = 95; st.farewell = 4; st.faces = 16; st.thrill = 7;
    UI.setTop(TITLE, 'A · 50년 뒤');
    var box = UI.novel({
      title: '50년 뒤',
      beats: [
        ['50년이 흘렀다. 거울 속 얼굴은 그대로였다. 마흔다섯.'],
        ['어머니를 먼저 보냈다. 마지막까지 어머니는 물었다. "밥은 먹었니?"'],
        [neun(S) + ' 그로부터 30년 뒤에 떠났다. 마지막 날, ' + ga(S) + ' 웃으며 말했다.', W(S, '당신은 여전히 젊네. 나만 늙어서 미안해.')],
        ['하은이의 장례식장에서, 사람들은 ' + eul(N) + ' 하은이의 손주쯤으로 여겼다.'],
        [neun(DAUGHTER) + ' 이제 예순셋이다. 흰머리가 ' + P + '보다 많다.', W(D_NAME, P + ', 나 요즘 무릎이 아파.')],
        ['그날 밤, 오래전 그 낯선 사람에게서 짧은 편지가 왔다.', { q: '한 알을 더 구할 수 있습니다. 원하신다면.' }]
      ],
      choices: [
        { label: DAUGHTER + '에게도 약을 구해 준다', onPick: function () { st.child = '줌'; a3(); } },
        { label: DAUGHTER + '는 ' + DAUGHTER + '의 시간대로 살게 둔다', onPick: function () { st.child = '안 줌'; a3(); } }
      ]
    });
    withCard(box);
  }

  function a3() {
    st.age = 145; st.farewell = 37; st.faces = 9; st.thrill = 4;
    UI.setTop(TITLE, 'A · 100년 뒤');
    var gave = st.child === '줌';
    var beats = [['100년이 흘렀다.']];
    if (gave) beats.push([neun(DAUGHTER) + ' 예순셋에서 멈췄다. 우리는 같은 집에서, 같은 얼굴로 살았다.'], ['어느 밤, 어머니의 얼굴이 기억나지 않았다.']);
    else beats.push([ga(DAUGHTER) + ' 떠났다. 아흔셋이었다. 마지막에 ' + ga(DAUGHTER) + ' 내 손을 잡고 말했다.', W(D_NAME, P + '는 그대로네. 다행이다.')], ['어느 밤, ' + DAUGHTER + '의 목소리가 기억나지 않았다.']);
    beats.push(['휴대폰에 손이 갔다. 검색창에 이렇게 적었다.', { q: '다시 만나요 AI' }]);
    beats.push([st.prev.ep1 === 'D'
      ? '그 회사는 아직도 있었다. 130년 전, 정순 할머니를 되살렸던 바로 그 회사.'
      : '130년 전, 엄마와 삼촌이 다투던 그 광고가 떠올랐다.']);
    beats.push(['…검색창을 닫았다. 그때 할머니에게 던졌던 질문이, 이제 나에게 돌아와 있었다.']);
    beats.push(['이웃집에 새로 이사 온 사람이 인사를 했다. 같이 저녁을 먹자고 했다.']);
    var box = UI.novel({
      title: '100년 뒤',
      beats: beats,
      choices: [
        { label: '다시 사람을 만나 본다', onPick: function () { st.relation = '맺음'; a4(); } },
        { label: '정중히 거절하고 문을 닫는다', onPick: function () { st.relation = '닫음'; a4(); } }
      ]
    });
    withCard(box);
  }

  // 200년 뒤: 같은 아침을 직접 여러 번 넘기기
  function a4() {
    st.age = 245; st.farewell = st.relation === '맺음' ? 412 : 58; st.faces = 4; st.thrill = 1;
    UI.setTop(TITLE, 'A · 200년 뒤');
    var s = UI.clear();
    var wrap = UI.el('section', 'scene scene--text');
    var t = UI.el('div', 'scene-text');
    t.appendChild(ageCard());
    var rep = UI.el('div', 'repeat');
    var count = UI.el('p', 'repeat-count', '73,001번째 아침');
    var line = UI.el('p', 'repeat-line', '오늘도 해가 떴다.');
    var btn = UI.el('button', 'repeat-btn', '다음 날');
    btn.type = 'button';
    var n = 0, NEED = 10;
    btn.addEventListener('click', function () {
      n++;
      count.textContent = (73001 + n).toLocaleString('ko-KR') + '번째 아침';
      line.classList.remove('blink'); void line.offsetWidth; line.classList.add('blink');
      if (n === 6) btn.textContent = '다음 날…';
      if (n >= NEED) { btn.disabled = true; setTimeout(a4b, 600); }
    });
    rep.appendChild(count);
    rep.appendChild(line);
    rep.appendChild(btn);
    t.appendChild(rep);
    wrap.appendChild(t);
    s.appendChild(wrap);
  }
  function a4b() {
    var beats = [
      ['200년이 흘렀다.'],
      ['버킷리스트를 펼쳤다. 모든 줄에 줄이 그어져 있었다. 다 이뤘다.', '그런데, 아무것도 하고 싶지 않았다.']
    ];
    if (st.child === '줌') beats.push(['시안이와 같은 식탁에 앉았다. 둘 다 할 말이 없었다. 200년 동안 할 말을 다 해 버렸다.']);
    else if (st.relation === '맺음') beats.push(['이번 세기에 사귄 친구가 또 떠났다. 몇 번째인지, 세지 않기로 했다.']);
    else beats.push(['마지막으로 누군가와 이야기한 게 언제였는지, 기억나지 않는다.']);
    beats.push(['"나중에 하지 뭐." 이 말을 몇만 번쯤 한 것 같다.', '나중은, 언제나 있었으니까.']);
    var box = UI.novel({ title: '200년 뒤', beats: beats, next: { label: '300년 뒤', onNext: a5 } });
    withCard(box);
  }

  function a5() {
    st.age = 345; st.faces = 1; st.thrill = 0;
    UI.setTop(TITLE, 'A · 300년 뒤');
    var box = UI.novel({
      img: 'img09.jpg', imgLabel: '300년 뒤 텅 빈 도시', caption: '300년 뒤',
      title: '300년 뒤',
      beats: [
        ['도시는 텅 비어 있었다. 사람들은 다른 도시로, 다른 별로 떠났다.'],
        ['다리 위에 섰다. 10만 번째 노을이 졌다.', '아무 느낌도 없었다.'],
        ['주머니 속 낡은 수첩을 꺼냈다. 첫 장의 글씨가 낯설었다.', { q: '죽기 전에 꼭 하고 싶은 일' }],
        ['죽기 전에. 그 말이 이제는 농담처럼 들렸다.'],
        ['나는 아직, ' + N + '일까?']
      ],
      next: { label: '이야기의 끝', onNext: function () {
        if (st.child === '줌') endA3(); else if (st.relation === '맺음') endA2(); else endA1();
      } }
    });
    withCard(box);
  }

  // ───── B 갈래: 마지막 하루 ─────
  function b1() {
    UI.setTop(TITLE, 'B · 거절');
    UI.novel({
      img: 'img08.jpg', imgLabel: '약을 내미는 낯선 사람', caption: '마지막 밤',
      title: '대답',
      beats: [
        [ME('…돌려 드릴게요.')],
        ['낯선 사람은 한참 동안 약병을 내려다보았다.'],
        [X('…저는 300년 전에 그걸 먹었습니다.')],
        [X('그날 거절했다면, 저도 누군가의 추도사 속에 있었겠지요.'), X('당신은, 저보다 현명하군요.')],
        ['문이 닫혔다. 빗소리만 남았다.']
      ],
      next: { label: '아침', onNext: b2 }
    });
  }

  function b2() {
    UI.setTop(TITLE, 'B · 마지막 하루');
    UI.novel({
      img: 'img10.jpg', imgLabel: '바닷가 노을', caption: '마지막 하루',
      title: '마지막 하루',
      beats: [
        ['아침이 밝았다. 마지막 하루였다.', '몸은 무거웠지만, 이상하게 마음은 가벼웠다.'],
        ['누구와 보낼까.']
      ],
      choices: [
        { label: '가족과 함께 보낸다', onPick: function () { st.lastDay = '가족'; b3(); } },
        { label: '하은이를 부른다', onPick: function () { st.lastDay = '하은'; b3(); } },
        { label: '혼자 바다에 간다', onPick: function () { st.lastDay = '혼자'; b3(); } }
      ]
    });
  }

  function b3() {
    var d = st.lastDay, beats;
    var contacted = (ctx.prev.ep2 && ctx.prev.ep2['사건3']) !== '그냥 둠';
    if (d === '가족') beats = [
      ['창가에 가족이 모였다. ' + ga(S) + ' 손을 잡았다. ' + ga(DAUGHTER) + ' 기타를 들었다.'],
      ['서툰 연주였다. 틀린 코드에서, 셋이 동시에 웃었다.'],
      [W(D_NAME, P + ', 다음 곡도 들을 거지?'), ME('…응. 계속 듣고 있을게.')]
    ];
    else if (d === '하은') beats = [
      [contacted ? '하은이가 떡볶이를 사 들고 왔다.' : '하은이에게 처음으로 먼저 전화를 걸었다. 하은이는 한 시간 만에 떡볶이를 사 들고 달려왔다.'],
      [W('하은', '야, 46점 기억나?'), ME('기억나지. 너 38점이었잖아.')],
      ['둘은 배가 아플 때까지 웃었다. 중학교 3학년, 그날처럼.']
    ];
    else beats = [
      ['혼자 바다에 갔다. 파도가 밀려왔다가, 밀려갔다.'],
      ['수첩을 펼쳐 마지막 장에 적었다.', { q: '고마웠다. 전부.' }],
      ['노을이 졌다. 마지막이라서, 이렇게 아름다웠다.']
    ];
    UI.novel({ img: 'img10.jpg', imgLabel: '바닷가 노을', caption: '마지막 하루', title: '마지막 하루', beats: beats, next: { label: '이야기의 끝', onNext: endB } });
  }

  // ───── 결말 ─────
  function commonEnd() {
    return [
      { q: true, lines: ['죽음이 없다면,', '삶은 더 의미 있어질까?'] },
      { q: true, lines: ['끝이 있어서 소중한 것은,', '무엇일까?'] },
      { q: true, lines: ['그렇다면 오늘,', '나는 무엇을 하며 살까?'] },
      { title: true, lines: ['등장인물'] },
      { lines: ['정순 할머니 — "밥은 먹었니?"', '엄마 — 마지막 전화를 받지 못한 사람', '삼촌 — 이미 충분히 작별한 사람'] },
      { lines: ['하은이 — 46점과 38점', '시안이 — 기타를 치는 아이', '그리고 ' + N + ' — 바로 너'] },
      { title: true, lines: ['세 번의 이야기, 끝.'] },
      L('이제, 너의 이야기를 살 차례.')
    ];
  }

  function endA1() {
    finish('A1', '끝없는 하루', [
      L('모든 날이 같은 날이 되었다. 오늘이 며칠인지, 더는 중요하지 않았다.'),
      L('……'),
      L('어느 비 오는 밤. 낡은 병원 복도를 걸었다.'),
      L('한 병실 앞에서 멈췄다. 안에서 누군가 마지막 숨을 고르고 있었다.'),
      L('주머니 속에서 작은 유리병이 희미하게 빛났다.'),
      { img: 'img08.jpg', lines: ['문을 열었다.', '"늦은 시간에 죄송합니다. 이걸 드리려고 왔습니다."'] },
      L('그날 밤의 낯선 사람이 왜 찾아왔는지, 이제야 알 것 같았다.'),
      { q: true, lines: ['혼자는,', '생각보다 길었다.'] }
    ], ['마음을 닫은 채 300년을 살았다. 모든 날이 같은 날이 되었다.', '그리고 어느 비 오는 밤, 이번엔 내가 누군가의 병실 문을 열었다.']);
  }
  function endA2() {
    finish('A2', '영원한 이방인', [
      L('그 뒤로도 사람을 만났다. 사랑했고, 떠나보냈다.'),
      L('또 만났고, 또 떠나보냈다.'),
      L('언제부턴가 누군가를 처음 만나면, 이별의 날부터 세게 되었다.'),
      { lines: ['배웅한 사람: ' + st.farewell + '명.'] },
      { q: true, lines: ['사랑할수록,', '이별은 길어졌다.'] }
    ], ['다시 사람을 만나며 300년을 살았다.', '사랑할 때마다 이별의 날을 먼저 세게 되었다.']);
  }
  function endA3() {
    finish('A3', '둘만의 영원', [
      L(DAUGHTER + '와 나는 300년째 같은 얼굴이다.'),
      { lines: ['"' + P + '."', '"가끔은… 그때 받지 말 걸 그랬다는 생각을 해."'] },
      L('"친구들은 다 할머니 할아버지가 돼서 떠났는데, 나만 그대로였어."'),
      { q: true, lines: ['우리는 함께였지만,', '세상 누구와도 함께가 아니었다.'] }
    ], [DAUGHTER + '에게도 약을 주었다. 둘은 300년째 같은 얼굴로 산다.', '함께였지만, 세상 누구와도 함께가 아니었다.']);
  }
  function endB() {
    var eu = (EULOGY[st.prev.code] || EULOGY.F).replace(/\{P\}/g, P);
    var last = st.lastDay === '가족' ? '"다음 곡도, 계속 듣고 있을게."'
      : (st.lastDay === '하은' ? '"하은아, 다음 떡볶이는 네가 사."' : '"고마웠다. 전부."');
    finish('B', '마지막 노을', [
      L('그날 밤, ' + neun(N) + ' 잠들듯 떠났다.'),
      L('장례식장. ' + ga(DAUGHTER) + ' 종이 한 장을 펼쳤다.'),
      L(eu),
      L('추도사 끝에는, ' + N + '의 글씨로 한 줄이 덧붙어 있었다.'),
      { q: true, lines: [last] },
      L('창밖으로 노을이 졌다. 마지막이라서, 아름다웠다.')
    ], ['낯선 사람의 약을 돌려주었다.', '마지막 하루를 보내고, 잠들듯 떠났다. 추도사 끝에는 한 줄이 덧붙어 있었다.']);
  }

  function finish(code, title, scenes, summary) {
    var beats = [{ title: true, lines: ['결말 ' + code, title] }].concat(scenes).concat(commonEnd());
    var chips = [st.pill === '먹음' ? '약을 먹음' : '약을 돌려줌'].concat(st.asked.map(function (k) { return '질문: ' + k; }));
    if (st.pill === '먹음') chips = chips.concat([DAUGHTER + '에게 약 ' + st.child, '사람과 ' + (st.relation === '맺음' ? '다시 만남' : '문을 닫음')]);
    else chips.push('마지막 하루: ' + st.lastDay);
    UI.credits(beats, function () {
      Reflect.show({
        ctx: ctx, ep: 3, topTitle: TITLE,
        ending: { code: code, title: title, paras: summary, chips: chips },
        questions: [
          { q: '나는 약을 먹었나, 먹지 않았나? 그 이유는 무엇인가? 그리고 반대 선택을 한 친구에게 하고 싶은 말을 써 보자.', hint: '내 선택 → 그 이유 → 반대 선택을 한 친구에게' },
          { q: '죽음이 없다면 삶은 더 의미 있어질까, 덜 의미 있어질까? 3회차에서 본 장면 하나를 근거로 내 생각을 써 보자.', hint: '내 생각 → 근거가 된 장면 → 그 장면에서 느낀 것' },
          { q: '세 번의 이야기를 거치며, \'잘 산다는 것\'에 대한 내 생각은 어떻게 바뀌었나?', hint: '처음 생각 → 가장 기억에 남는 장면 → 지금의 생각' }
        ],
        fields: {
          '결말': code + ' ' + title,
          '약선택': st.pill,
          '딸에게약': st.child,          // 시트 열 이름은 그대로, 내용은 자녀(시안이)에게 약을 줬는지
          '관계선택': st.relation,
          '마지막하루': st.lastDay
        },
        submitLabel: '필름 감기 · 제출',
        closing: '이제, 너의 이야기를 살 차례.'
      });
    });
  }

  return { start: start };
})();

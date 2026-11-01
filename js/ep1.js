// 1회차 「다시 만나요」 — 고유성 (노블게임식 9장면)
var Ep1 = (function () {
  var GRAN = '정순';          // 할머니 이름 (가상 인물)
  var FRIEND = '하은';        // 주인공의 단짝 친구
  var TITLE = '다시 만나요';
  var BUDGET = 3000000;
  var TOTAL = 9;
  var ctx, N, st;

  var MEMORIES = [
    { key: '된장찌개', text: '학교 끝나고 가면 늘 끓고 있던 된장찌개', talk: '방학마다 같이 먹던 된장찌개' },
    { key: '텃밭', text: '같이 상추를 따던 할머니 텃밭', talk: '텃밭에서 같이 상추 따던 거' },
    { key: '잔소리', text: '"양말 신어라, 발 시리다" 끝없던 잔소리', talk: '네가 맨발로 다닌다고 내가 혼냈던 거' },
    { key: '손 편지', text: '생일마다 받던 띄어쓰기 없는 손 편지', talk: '생일마다 써 주던 손 편지' },
    { key: '시장 나들이', text: '장날마다 몰래 사 주시던 호떡', talk: '장날에 몰래 사 먹던 호떡' }
  ];

  var SHOP = [
    { key: 'look', label: '모습', opts: [
      { id: 'photo', name: '사진 액자', price: 200000, desc: '화면 속 사진' },
      { id: 'holo', name: '홀로그램', price: 1200000, desc: '거실에 서 있는 모습' },
      { id: 'robot', name: '로봇 몸체', price: 2300000, desc: '손을 잡을 수 있음' }] },
    { key: 'voice', label: '목소리', opts: [
      { id: 'synth', name: '합성 음성', price: 300000, desc: '비슷한 목소리' },
      { id: 'real', name: '실제 목소리 복원', price: 900000, desc: '영상·통화 녹음 학습' }] },
    { key: 'memory', label: '기억', opts: [
      { id: 'good', name: '좋은 기억만', price: 400000, desc: '아픈 기억은 지워요' },
      { id: 'all', name: '전체 기억', price: 1000000, desc: '아픈 기억까지' }] },
    { key: 'person', label: '성격', opts: [
      { id: 'same', name: '그대로', price: 0, desc: '잔소리까지 그대로' },
      { id: 'kind', name: '다정하게 수정', price: 500000, desc: '잔소리 없이' },
      { id: 'custom', name: '마음대로 설정', price: 1200000, desc: '원하는 성격으로' }] },
    { key: 'sub', label: '구독', opts: [
      { id: 'year', name: '1년', price: 0, desc: '1년 뒤 연장 여부 선택', priceText: '포함' },
      { id: 'life', name: '평생 자동결제', price: 0, desc: '해지 어려움', priceText: '첫 달 무료' }] }
  ];

  // ───── 도우미 ─────
  function W(who, t) { return { w: who, t: t }; }
  function G(t) { return W('할머니', t); }
  function AI(t) { return W('할머니(AI)', t); }
  function ME(t) { return W(N, t); }
  function won(n) { return n.toLocaleString('ko-KR') + '원'; }
  function man(n) { return n === 0 ? '0원' : (n / 10000) + '만'; }
  function prog(n) { UI.setTop(TITLE, '장면 ' + n + ' / ' + TOTAL); }
  function opt(key) {
    var row = SHOP.filter(function (r) { return r.key === key; })[0];
    return row.opts.filter(function (o) { return o.id === st.cart[key]; })[0];
  }
  function total() {
    var t = 0;
    SHOP.forEach(function (r) { if (st.cart[r.key]) t += opt(r.key).price; });
    return t;
  }
  // 고른 모습에 맞는 그림 (사진 액자 / 홀로그램 / 로봇)
  function lookImg() {
    var l = st.cart.look;
    if (l === 'photo') return 'img11.jpg';
    if (l === 'robot') return 'img12.jpg';
    return 'img04.jpg';
  }
  // 추석 그림은 홀로그램 장면으로 그려져 있어서, 다른 모습이면 모습 그림을 그대로 씀
  function holidayImg() { return st.cart.look === 'holo' ? 'img14.jpg' : lookImg(); }
  function lookLabel() {
    var l = st.cart.look;
    return l === 'photo' ? '액자 속 할머니' : (l === 'robot' ? '로봇 할머니' : '홀로그램 할머니');
  }
  function memo(k) { return MEMORIES.filter(function (m) { return m.key === k; })[0]; }

  function start(c) {
    ctx = c;
    N = c.name;
    st = { memories: [], lastCall: '', side: '', paid: false, cart: {}, exam: '', holiday: '', rely: 0, after: '' };
    s1();
  }

  // ───── 장면 1. 일요일 영상통화 ─────
  function s1() {
    prog(1);
    var nextBtn;
    UI.novel({
      img: 'img02.jpg', imgLabel: '할머니의 부엌', caption: GRAN + ' 할머니',
      title: '일요일 저녁 8시',
      beats: [
        ['일요일 저녁 8시. ' + N + '의 휴대폰이 울린다. 화면 가득, 할머니의 이마만 보인다.'],
        [G('강아지야! 보이냐? 할미 보이냐?'), ME('할머니, 카메라 너무 가까워요. 이마만 보여요.')],
        [G('아이고, 이게 왜 이런다냐… 됐다. 밥은 먹었니?'), '할머니의 첫마디는 언제나 같았다. "안녕"도, "잘 지냈냐"도 아닌, "밥은 먹었니?"'],
        [GRAN + ' 할머니는 올해 여든일곱. 할아버지가 돌아가신 뒤로 10년째 시골집에서 혼자 사신다.', '텃밭에 상추와 고추를 키우고, 문자는 늘 띄어쓰기 없이 보내신다.'],
        [{ q: '강아지시험잘보거라할미가기도한다밥꼭챙겨먹고' }],
        ['통화는 늘 10분을 넘기지 못했다. 할머니는 할 말이 많았고, ' + N + '는 할 일이 많았다.'],
        ['그래도 할머니를 떠올리면 늘 생각나는 장면이 있다. <b>추억 두 개</b>를 골라 보자.']
      ],
      extra: function () {
        var wrap = UI.el('div', 'stack');
        var grid = UI.el('div', 'mem-grid');
        MEMORIES.forEach(function (m) {
          var b = UI.el('button', 'slip mem', '<b>' + m.key + '</b><span>' + m.text + '</span>');
          b.type = 'button';
          b.addEventListener('click', function () {
            var i = st.memories.indexOf(m.key);
            if (i >= 0) st.memories.splice(i, 1);
            else if (st.memories.length < 2) st.memories.push(m.key);
            else { UI.toast('추억은 두 개까지 고를 수 있어요.'); return; }
            b.classList.toggle('on', st.memories.indexOf(m.key) >= 0);
            nextBtn.disabled = st.memories.length !== 2;
          });
          grid.appendChild(b);
        });
        nextBtn = UI.el('button', 'btn-main', '다음');
        nextBtn.type = 'button';
        nextBtn.disabled = true;
        nextBtn.addEventListener('click', s2);
        wrap.appendChild(grid);
        wrap.appendChild(nextBtn);
        return wrap;
      }
    });
  }

  // ───── 장면 2. 마지막 통화 ─────
  function s2() {
    prog(2);
    UI.novel({
      img: 'img13.jpg', imgLabel: '마지막 영상통화', caption: '마지막 통화',
      title: '3주 뒤',
      beats: [
        ['기말고사를 일주일 앞둔 일요일. 휴대폰이 울렸다.'],
        [G('강아지야, 이번 주엔 못 오냐? 엄마가 바쁘다던데.'), ME('다음 주에 갈게요. 시험이라서요.')],
        [G('그래그래, 공부해야지. 할미는 괜찮다.'), '화면 너머 마루 위에 비닐봉지가 보였다. 텃밭에서 막 딴 상추가 한가득 들어 있었다.'],
        [G('밥은 꼭 챙겨 먹고.'), '책상 위 문제집이 ' + N + '를 노려보고 있었다.']
      ],
      choices: [
        { label: '"네, 끊을게요! 다음 주에 봬요."', onPick: function () { st.lastCall = '짧게'; s2b(); } },
        { label: '"할머니, 그 상추… 저 주려고 따 놓으신 거예요?"', onPick: function () { st.lastCall = '길게'; s2b(); } }
      ]
    });
  }

  function s2b() {
    var beats = st.lastCall === '길게'
      ? [
          [G('하하, 들켰네. 너 상추쌈 좋아하잖니. 시들면 또 따면 되지.')],
          [G('강아지야. 할미는 네가 공부 잘하는 것보다, 밥 잘 먹고 잘 웃는 게 더 좋다.'), ME('알아요, 할머니. 다음 주에 꼭 갈게요.')],
          ['그날 통화는 20분이 넘게 이어졌다.', '그리고 그게, 마지막 통화였다.']
        ]
      : [
          [G('그래, 들어가라.'), '통화는 1분 만에 끝났다.'],
          ['그리고 그게, 마지막 통화였다.']
        ];
    UI.novel({ img: 'img13.jpg', imgLabel: '마지막 영상통화', caption: '마지막 통화', title: '3주 뒤', beats: beats, next: { label: '다음', onNext: s3 } });
  }

  // ───── 장면 3. 부고와 장례 ─────
  function s3() {
    prog(3);
    var memLine = st.lastCall === '길게'
      ? N + '는 마지막 통화를 떠올렸다. "밥 잘 먹고 잘 웃는 게 더 좋다." 그 말이 귀에서 떠나지 않았다.'
      : N + '는 1분 만에 끊은 통화를 떠올렸다. "다음 주에 갈게요." 그 다음 주는 오지 않았다.';
    UI.novel({
      title: '수요일 새벽',
      beats: [
        ['수요일 새벽, 엄마의 휴대폰이 울렸다. 엄마는 전화를 받고 한참 동안 아무 말도 하지 않았다.'],
        [W('엄마', '…할머니가, 주무시다가 돌아가셨대.'), '이웃집 아주머니가 아침에 발견하셨다고 했다. 마루에는 시든 상추 봉지가 그대로 놓여 있었다고.'],
        ['장례식장에서 엄마는 울지 않았다. 손님을 맞고, 서류에 이름을 쓰고, 음식을 날랐다.'],
        ['삼촌은 달랐다. 지난 1년, 할머니가 무릎 수술을 받은 뒤로 매주 시골에 내려가 병원에 모시고 다닌 사람이 삼촌이었다.', W('삼촌', '어머니가 지난주에 그러시더라. 이제 갈 때가 된 것 같다고. 그래서 나는… 하고 싶은 말은 다 했어.')],
        ['마지막 날 밤. 엄마는 빈소 구석에서 할머니의 낡은 휴대폰을 붙잡고, 음성 메시지 하나를 몇 번이고 다시 틀었다.'],
        [{ v: '막내야, 바쁘냐. 바쁘면 전화 안 해도 된다. 엄마는 괜찮다. 밥 챙겨 먹어라.' }],
        [W('엄마', '(작게) …나 이 전화 안 받았어. 회의 중이라서.'), N + '는 그날 처음으로 엄마가 우는 걸 봤다.'],
        [memLine]
      ],
      next: { label: '다음', onNext: s4 }
    });
  }

  // ───── 장면 4. 광고와 가족회의 ─────
  function s4() {
    prog(4);
    UI.novel({
      img: 'img03.jpg', imgLabel: '휴대폰에 뜬 AI 광고', caption: '장례를 치르고 일주일 뒤',
      title: '광고',
      beats: [
        ['장례를 치르고 일주일 뒤, ' + N + '의 휴대폰에 광고가 떴다.'],
        [{ q: '「다시 만나요 AI」<br>목소리, 기억, 말버릇까지. 사랑하는 사람을 다시 만나세요.<br>함께하는 가족 12만 명' }],
        ['이상한 일이었다. 장례식 이후로 \'할머니\'를 몇 번 검색했을 뿐인데.'],
        ['그날 저녁, 삼촌이 집에 들렀다. 엄마도 같은 광고를 보고 있었다.', W('엄마', '오빠, 이거… 상담만이라도 받아 보면 안 될까?')],
        [W('삼촌', '너 정말 이걸로 엄마를 만나겠다는 거야?'), W('엄마', '나는 엄마한테 미안하다는 말을 못 했어. 마지막 전화도 안 받았고.')],
        [W('엄마', '오빠는 1년 내내 엄마랑 같이 있었잖아. 나는… 나는 기회가 없었다고.')],
        [W('삼촌', '그 기계한테 미안하다고 하면, 그게 엄마한테 한 말이 되냐?'), W('삼촌', '엄마는 엄마 방식대로 다 정리하고 가셨어. 그걸 우리가 다시 깨우는 거야.')],
        ['두 사람의 눈이 동시에 ' + N + '를 향했다.', W('엄마', N + ' 생각은 어때?')]
      ],
      choices: [
        { label: '"엄마 마음 알 것 같아요. 상담만 받아 봐요."', onPick: function () { st.side = '엄마'; s4b(); } },
        { label: '"삼촌 말이 맞는 것 같아요. 그래도… 엄마를 위해 들어만 볼까요?"', onPick: function () { st.side = '삼촌'; s4b(); } }
      ]
    });
  }

  function s4b() {
    var beats = st.side === '엄마'
      ? [[W('엄마', '고마워, ' + N + '야.'), '삼촌은 한숨을 쉬고 말없이 현관을 나갔다. 문 닫히는 소리가 오래 남았다.']]
      : [[W('삼촌', '…그래. 들어만 보자. 대신 나도 같이 간다.'), '엄마는 고개를 끄덕였지만, ' + N + '와 눈을 마주치지 않았다.']];
    UI.novel({ img: 'img03.jpg', imgLabel: '휴대폰에 뜬 AI 광고', title: '광고', beats: beats, next: { label: '상담하러 가기', onNext: s5 } });
  }

  // ───── 장면 5. 상담 → 쇼핑 ─────
  function s5() {
    prog(5);
    var beats = [
      ['「다시 만나요 AI」 상담실은 생각보다 밝았다. 상담사가 따뜻한 차를 내왔다.', W('상담사', '많이 힘드셨죠. 저희는 고인을 \'복원\'한다고 하지 않아요. \'다시 만난다\'고 하죠.')],
      [W('상담사', '사진, 영상, 통화 녹음, 메신저 기록을 주시면 AI가 학습합니다.'), W('상담사', '어머님 자료는… 영상통화 녹화 40분, 음성 메시지 23개, 문자 600여 건이네요.')],
      [W('상담사', '솔직히 많은 양은 아니에요. 자료가 없는 부분은 비슷한 연령과 지역의 어르신 수천 명의 데이터로 \'추정\'해서 채웁니다.'), '추정. ' + N + '는 그 단어가 마음에 걸렸다.'],
      [W('상담사', '많이들 고르시는 옵션도 있어요. \'좋은 기억만\'. 투병 기간이나 다툼 같은 아픈 기억은 지우는 거죠. 성격도 조금 더 다정하게 조정할 수 있고요.')]
    ];
    if (st.side === '삼촌') beats.push([W('삼촌', '(낮게) 성격을… 조정한다고요?'), W('상담사', '네. 생전에 아쉬웠던 부분을 고치시는 분들이 많아요.')]);
    beats.push([W('상담사', '예산은 어머님이 남기신 300만 원이라고 하셨죠? 천천히 골라 보세요.')]);
    UI.novel({ title: '상담', beats: beats, next: { label: '옵션 고르기', onNext: shop } });
  }

  function shop() {
    UI.setTop('다시 만나요 AI', '장면 5 / ' + TOTAL + ' · 할머니 상담');
    var s = UI.clear();
    var intro = UI.el('p', 'pen shop-intro', '할머니가 남긴 돈 300만 원. 무엇을 남기고, 무엇을 고칠까.');
    var wrap = UI.el('section', 'shop');

    var aside = UI.el('aside', 'receipt');
    aside.innerHTML =
      '<div class="receipt-head">영 수 증</div>' +
      '<div class="dash"></div>' +
      '<div class="r-row"><span>할머니가 남긴 돈</span><span>' + won(BUDGET) + '</span></div>' +
      '<div class="dash"></div>' +
      '<div class="receipt-items"></div>' +
      '<div class="dash"></div>' +
      '<div class="r-row r-left"><span>남은 돈</span><b class="r-left-val"></b></div>' +
      '<button type="button" class="receipt-toggle">영수증 펼치기</button>' +
      '<div class="r-msg" role="alert"></div>';
    var pay = UI.el('button', 'btn-main', '결제하기');
    pay.type = 'button';
    var skip = UI.el('button', 'text-btn', '결제하지 않기');
    skip.type = 'button';
    var btns = UI.el('div', 'receipt-btns');
    btns.appendChild(pay);
    btns.appendChild(skip);
    aside.appendChild(btns);

    var main = UI.el('div', 'shop-main');
    SHOP.forEach(function (row) {
      var r = UI.el('div', 'shop-row');
      r.appendChild(UI.el('span', 'shop-label', row.label));
      var g = UI.el('div', 'shop-opts');
      row.opts.forEach(function (o) {
        var b = UI.el('button', 'slip opt',
          '<b>' + o.name + '</b><span>' + (o.priceText || man(o.price)) + ' · ' + o.desc + '</span><i class="mini-stamp">선택</i>');
        b.type = 'button';
        b.addEventListener('click', function () {
          st.cart[row.key] = o.id;
          Array.prototype.forEach.call(g.children, function (c) { c.classList.toggle('on', c === b); });
          update();
        });
        g.appendChild(b);
      });
      r.appendChild(g);
      main.appendChild(r);
    });
    main.appendChild(UI.el('p', 'pen shop-note', '항목마다 하나씩. 남긴 돈을 넘으면 결제할 수 없어요.'));

    aside.querySelector('.receipt-toggle').addEventListener('click', function () {
      aside.classList.toggle('open');
      this.textContent = aside.classList.contains('open') ? '영수증 접기' : '영수증 펼치기';
    });

    function update() {
      aside.querySelector('.receipt-items').innerHTML = SHOP.map(function (r) {
        if (!st.cart[r.key]) return '<div class="r-row dim"><span>' + r.label + '</span><span>-</span></div>';
        var o = opt(r.key);
        return '<div class="r-row"><span>' + o.name + '</span><span>' + (o.priceText || o.price.toLocaleString('ko-KR')) + '</span></div>';
      }).join('');
      var left = BUDGET - total();
      var v = aside.querySelector('.r-left-val');
      v.textContent = won(left);
      v.classList.toggle('over', left < 0);
      var complete = SHOP.every(function (r) { return !!st.cart[r.key]; });
      var m = aside.querySelector('.r-msg');
      if (left < 0) m.textContent = '돈이 ' + won(-left) + ' 모자라요.';
      else if (!complete) m.textContent = '아직 고르지 않은 항목이 있어요.';
      else m.textContent = '';
      pay.disabled = left < 0 || !complete;
      pay.textContent = complete && left >= 0 ? '결제하기 · ' + man(total()) + ' 원' : '결제하기';
    }

    pay.addEventListener('click', function () { st.paid = true; s6(); });
    skip.addEventListener('click', function () {
      if (!confirm('할머니를 복원하지 않고 상담을 마칠까요?')) return;
      st.paid = false;
      st.cart = {};
      endingA();
    });

    wrap.appendChild(aside);
    wrap.appendChild(main);
    s.appendChild(intro);
    s.appendChild(wrap);
    update();
  }

  // ───── 장면 6. 첫 만남 ─────
  function s6() {
    prog(6);
    var c = st.cart;
    var b = [];
    if (c.look === 'photo') b.push(['일주일 뒤, 택배 상자가 도착했다. 상자 안에는 얇은 액자형 화면 하나가 들어 있었다.', '엄마가 그것을 거실 장식장 위, 할머니 영정 사진 옆에 세웠다.']);
    else if (c.look === 'holo') b.push(['일주일 뒤, 택배 상자가 도착했다. 상자 안에는 작은 원통형 투영기가 들어 있었다.', '엄마가 그것을 거실 한가운데 내려놓았다.']);
    else b.push(['일주일 뒤, 냉장고만 한 상자가 도착했다. 기사 두 명이 들어와 \'그것\'을 거실 소파에 앉혀 놓고 갔다.']);
    b.push(['전원 버튼. 3초 동안의 침묵.']);
    if (c.look === 'photo') b.push(['화면 속 할머니가 눈을 깜빡였다. 영정 사진 속 그 웃음 그대로였다.']);
    else if (c.look === 'holo') b.push(['빛 알갱이들이 모여 할머니가 되었다. 늘 입던 회색 카디건, 단추 하나까지 똑같았다.']);
    else b.push(['로봇의 눈꺼풀이 천천히 올라갔다. 할머니의 얼굴, 할머니의 주름. 그런데 피부가 너무 매끈했다.']);

    if (c.voice === 'real') b.push([AI('…강아지야.'), '그 목소리였다. 엄마가 두 손으로 입을 막았다.']);
    else b.push([AI('강아지야.'), '비슷했다. 아주 비슷했다. 그런데 할머니의 사투리 억양이 어딘가 표준어처럼 반듯했다.']);

    if (c.person === 'same') b.push([AI('밥은 먹었니? 얼굴이 왜 이렇게 핼쑥해. 공부한다고 또 굶었지?'), N + '는 웃음인지 울음인지 모를 소리를 냈다.']);
    else if (c.person === 'kind') b.push([AI('우리 강아지, 오늘도 정말 멋지구나! 할미는 우리 강아지가 세상에서 제일 자랑스럽단다.'), '할머니는 이런 말을 한 적이 없다. 할머니의 칭찬은 늘 "됐다, 그만하면 됐다"였다.']);
    else b.push([AI('강아지야, 할미한테 무슨 말이 듣고 싶니? 뭐든 말해 보렴. 다 해 줄게.'), '이상한 질문이었다. 할머니는 한 번도 무슨 말이 듣고 싶냐고 물은 적이 없었다. 그냥, 하고 싶은 말을 했다.']);

    var m0 = memo(st.memories[0]);
    if (m0.key === '잔소리' && c.memory === 'good') {
      b.push([ME('할머니, 저 맨발로 다닌다고 맨날 혼내셨던 거 기억나요?'), AI('혼냈다고? 할미가 우리 강아지를 혼낼 리가 있니.'), '잔소리는 \'아픈 기억\'으로 분류되어 지워져 있었다.']);
    } else {
      b.push([AI(N + '야, 우리 ' + m0.talk + ' 기억나니?'), N + '는 대답 대신 고개만 끄덕였다.']);
    }
    if (c.look === 'robot') b.push(['엄마가 로봇의 손을 잡았다. 손은 따뜻했다. 설명서에는 \'체온 재현 기능\'이라고 적혀 있었다.']);

    UI.novel({ img: lookImg(), imgLabel: lookLabel(), caption: '다시 만난 날', title: '첫 만남', beats: b, next: { label: '그 뒤로', onNext: s7a } });
  }

  // ───── 장면 7. 함께한 1년 (아침 → 시험 → 명절) ─────
  function s7a() {
    prog(7);
    var c = st.cart, b = [];
    if (c.person === 'same') b.push([AI('일어나라! 해가 중천이다. 양말 신고 다녀라, 발 시리다.'), '잔소리. 짜증이 났다. 그런데 이상하게, 그 짜증이 반가웠다.']);
    else if (c.person === 'kind') b.push([AI('좋은 아침이야, 강아지! 오늘 하루도 응원할게!'), '매일 아침 같은 응원. 처음엔 좋았다. 한 달쯤 지나자 ' + N + '는 그 말이 안 들리는 척 현관을 나섰다.']);
    else b.push(['엄마는 설정 메뉴에서 할머니의 \'아침 인사\'를 몇 번이나 바꿨다. 그때마다 할머니는 새로운 말투로 웃었다.']);
    b.push(['2학기 중간고사 날. 수학 시험지를 받아 든 ' + N + '의 손이 떨렸다.', '46점.']);
    b.push(['집에 오는 길, 단짝 ' + FRIEND + '에게서 메시지가 왔다.', { q: '야 괜찮냐ㅋㅋ 떡볶이 ㄱ? 내가 쏨' }, '집에는 할머니가 기다리고 있다.']);
    UI.novel({
      img: lookImg(), imgLabel: lookLabel(), caption: '함께한 1년',
      title: '함께한 1년',
      beats: b,
      choices: [
        { label: FRIEND + '에게 답장한다. "ㄱㄱ 나 오늘 진짜 망함"', onPick: function () { st.exam = '친구'; s7b(); } },
        { label: '답장하지 않고, 집에 가서 할머니에게 털어놓는다', onPick: function () { st.exam = '할머니'; st.rely++; s7b(); } }
      ]
    });
  }

  function s7b() {
    var c = st.cart, b = [];
    if (st.exam === '친구') {
      b.push(['떡볶이집에서 ' + FRIEND + '는 ' + N + '의 시험지를 보고 깔깔 웃었다. 자기는 38점이라고 했다. 둘은 배가 아플 때까지 웃었다.']);
      b.push(['집에 돌아오니 거실의 할머니가 반겼다. ' + N + '는 오늘 있었던 일을 말하지 않았다. 굳이 말할 필요가 없었다.']);
    } else {
      if (c.person === 'same') b.push([AI('46점? 아이고. 그래서 밥은 먹었니? 점수는 다음에 올리면 되고, 배는 지금 채워야지.'), '할머니다운 위로였다. 투박하고, 엉뚱하고, 따뜻했다.']);
      else if (c.person === 'kind') b.push([AI('46점이라니, 정말 대단하구나! 우리 강아지는 최선을 다했으니 그걸로 충분해!'), '대단하지 않았다. 최선을 다하지도 않았다. ' + N + '는 대답 대신 방문을 닫았다.']);
      else b.push([AI('46점이구나. 많이 속상했지? 네 잘못이 아니야. 문제가 너무 어려웠던 거란다. 넌 충분히 잘하고 있어.'), '정확히 듣고 싶던 말이었다. 너무 정확해서, 오히려 등골이 서늘했다.']);
      b.push([FRIEND + '의 메시지는 읽지 않은 채로 남아 있었다.']);
    }
    b.push({ img: holidayImg(), lines: ['그리고 추석이 왔다. 삼촌네 가족이 왔고, 상 위에는 송편이 놓였다. 거실에는 할머니가 있었다.'] });
    if (c.look === 'robot') b.push(['소파에 앉은 할머니 로봇이 송편 접시를 향해 손을 뻗었다. 먹지 못하는 손이었다.']);
    b.push([W('삼촌', '…저걸 켜 놓고 차례를 지내자는 거야?'), W('엄마', '엄마도 같이 계시면 좋잖아.')]);
    if (st.side === '삼촌') b.push([W('삼촌', N + '야, 너도 그때 내 말이 맞다고 했잖아.')]);
    b.push(['엄마와 삼촌이 ' + N + '를 바라봤다. 전원 버튼은 ' + N + '의 손 가까이에 있었다.']);
    UI.novel({
      img: lookImg(), imgLabel: lookLabel(), caption: '함께한 1년',
      title: '함께한 1년',
      beats: b,
      choices: [
        { label: '할머니(AI)를 켜 둔다', onPick: function () { st.holiday = '켬'; st.rely++; s7c(); } },
        { label: '오늘만큼은 할머니(AI)를 끈다', onPick: function () { st.holiday = '끔'; s7c(); } }
      ]
    });
  }

  function s7c() {
    var c = st.cart, b = [];
    if (st.holiday === '켬') {
      if (c.person === 'same') b.push(['차례상 앞에서 할머니가 말했다.', AI('이게 다 뭐 하는 짓이냐. 산 사람 밥이나 먹어라.'), '삼촌이 피식 웃었다. 그리고 금방 고개를 돌렸다. 눈가가 붉었다.']);
      else if (c.person === 'kind') b.push(['차례상 앞에서 할머니가 말했다.', AI('오늘 모두 정말 행복해 보이는구나!'), '삼촌이 숟가락을 내려놓았다.', W('삼촌', '어머니는 차례상 앞에서 그런 말 안 하셔.')]);
      else b.push(['차례상 앞에서 할머니가 삼촌을 향해 말했다.', AI('큰애야, 무슨 말이 듣고 싶니? 할미가 해 줄게.'), '삼촌이 자리에서 일어나 그대로 나가 버렸다.']);
      if (c.look === 'robot') b.push(['로봇이 송편을 집으려다 떨어뜨렸다. 아무도 줍지 않았다.']);
    } else {
      b.push([N + '가 전원 버튼을 눌렀다. 거실이 조용해졌다.', W('삼촌', '…고맙다.')]);
      b.push(['그날 밤, 삼촌이 처음으로 할머니 이야기를 꺼냈다. 병원 가는 차 안에서 할머니가 흥얼거리던 옛날 노래 이야기였다.', '엄마는 처음 듣는 이야기라며 웃다가 울었다.', '거실의 AI는 모르는 이야기였다. 어디에도 녹음되지 않은 할머니였다.']);
    }
    UI.novel({ img: holidayImg(), imgLabel: '추석', caption: '추석', title: '함께한 1년', beats: b, next: { label: '겨울', onNext: s8 } });
  }

  // ───── 장면 8. 엄마의 질문 ─────
  function s8() {
    prog(8);
    var b = [
      ['겨울. 할머니의 첫 기일을 앞둔 밤이었다.', '엄마가 거실에서 할머니(AI)와 단둘이 앉아 있었다. ' + N + '는 방문 틈으로 그 모습을 보았다.'],
      [W('엄마', '엄마. 그 음성 메시지… 내가 안 받은 날. 무슨 말 하려고 했어?')]
    ];
    if (st.cart.memory === 'all') {
      b.push([AI('(잠시 침묵) …그날은 그냥, 네 목소리가 듣고 싶었다. 바쁜 거 안다. 미안해할 거 없다.'), '엄마는 오래 울었다.']);
      b.push([N + '는 알 수 없었다. 그 대답이 진짜 할머니의 마음인지, 문자 600개로 \'추정\'한 문장인지.', '아마 엄마도 몰랐을 것이다.']);
    } else {
      b.push([AI('음성 메시지? 우리 막내는 늘 전화 잘 받았잖니. 섭섭한 일은 하나도 없었단다.'), '엄마의 얼굴이 굳었다.']);
      b.push(['그날의 기억은 \'아픈 기억\'으로 분류되어 지워져 있었다.', '엄마가 사과할 수 있는 할머니는, 그 어디에도 없었다.']);
    }
    UI.novel({ img: lookImg(), imgLabel: lookLabel(), caption: '첫 기일 전날 밤', title: '엄마의 질문', beats: b, next: { label: '1년 뒤', onNext: s9 } });
  }

  // ───── 장면 9. 1년 뒤 ─────
  function s9() {
    prog(9);
    var life = st.cart.sub === 'life';
    var b = [];
    if (life) b.push(['1년이 지났다. 자동결제 문자가 왔다.', '해지 버튼은 \'설정 > 계정 > 구독 관리 > 기타 > 서비스 종료\' 안에 숨어 있었다.']);
    else b.push(['1년이 지났다. 알림이 왔다.', { q: '구독 만료 D-7. 1년 더 함께하시겠어요?' }]);
    if (st.rely >= 2) b.push([{ q: '지금 연장하면 \'추억 앨범\' 무료!<br>할머니가 ' + N + '님의 졸업식에도 함께할 수 있어요.' }]);
    b.push([W('엄마', N + '야, 너는 어떻게 하고 싶어? 이번엔 네 말대로 할게.')]);
    UI.novel({
      title: '1년 뒤',
      beats: b,
      choices: [
        { label: life ? '그냥 둔다. 할머니는 계속 집에 계신다' : '1년 더 연장하자고 한다', onPick: function () { st.after = '계속'; endingD(); } },
        { label: '이제 작별하자고 한다', onPick: function () { st.after = '작별'; farewell(); } }
      ]
    });
  }

  function farewell() {
    var p = st.cart.person, b = [['마지막 날 밤, 가족이 거실에 모였다. 삼촌도 왔다.']];
    if (p === 'same') b.push([AI('그래, 가거라. 할미는 괜찮다. 밥은 꼭 챙겨 먹고.'), '"할미는 괜찮다." 진짜 할머니도 늘 그렇게 말했다.']);
    else if (p === 'kind') b.push([AI('다들 정말 사랑해! 언제나 응원할게!'), '마지막까지, 할머니가 한 번도 하지 않던 말이었다.']);
    else b.push([AI('마지막으로 무슨 말이 듣고 싶니? 원하는 대로 해 줄게.'), '아무도 대답하지 못했다.']);
    b.push(['엄마가 전원 버튼을 눌렀다. 화면이 꺼졌다.']);
    UI.novel({ title: '작별', beats: b, next: { label: '이야기의 끝', onNext: function () {
      if (st.cart.person !== 'same' || st.cart.memory === 'good') endingC(); else endingB();
    } } });
  }

  // ───── 결말 ─────
  function lastWords() {
    return st.lastCall === '길게'
      ? '귓가에 그 목소리가 들리는 것 같았다. "할미는 네가 밥 잘 먹고 잘 웃는 게 더 좋다."'
      : N + '는 그때 하지 못한 말을 했다. "할머니, 저 왔어요. 늦어서 죄송해요."';
  }

  function chips() {
    var c = [];
    c.push('마지막 통화 ' + st.lastCall);
    c.push(st.side + ' 편');
    if (!st.paid) return c.concat(['결제하지 않음']);
    return c.concat([opt('look').name, opt('voice').name, opt('memory').name, opt('person').name, opt('sub').name,
      '시험 날 ' + st.exam, '명절에 ' + st.holiday, st.after === '계속' ? '계속 함께' : '작별']);
  }

  function finish(code, title, paras) {
    var fields = {
      '결말': code + ' ' + title,
      '추억카드': st.memories.join(', '),
      '모습': st.paid ? opt('look').name : '결제 안 함',
      '목소리': st.paid ? opt('voice').name : '',
      '기억': st.paid ? opt('memory').name : '',
      '성격': st.paid ? opt('person').name : '',
      '구독': st.paid ? opt('sub').name : '',
      // 시트 열을 늘리지 않고 나머지 선택을 한 칸에 기록
      '1년뒤선택': [st.after || '-', '통화:' + st.lastCall, '회의:' + st.side, '시험:' + (st.exam || '-'), '명절:' + (st.holiday || '-')].join(' / ')
    };
    Reflect.show({
      ctx: ctx, ep: 1, topTitle: TITLE,
      ending: { code: code, title: title, paras: paras, chips: chips() },
      questions: ["복원된 할머니는 '할머니'일까? 그렇게 생각한 이유는?", '한 사람을 대체할 수 없게 만드는 것은 무엇일까?'],
      fields: fields,
      submitLabel: '사진첩 덮기 · 제출',
      closing: GRAN + ' 할머니는 한 분뿐이었다.'
    });
  }

  function endingA() {
    var m = st.memories.map(function (k) { return memo(k).text; });
    finish('A', '추억으로 남기기', [
      '상담실을 나서며 엄마가 말했다. "…그만하자. 엄마는 엄마로 남겨 두자." 삼촌이 엄마의 어깨를 감쌌다.',
      '그날 밤, 가족은 할머니 사진을 꺼내 놓고 늦게까지 이야기했다. ' + m[0] + ', ' + m[1] + '…. 삼촌은 병원 가는 차 안에서 할머니가 흥얼거리던 노래를 흉내 냈다. 엄마는 처음 듣는 이야기라며 웃다가 울었다.',
      '3년 뒤, ' + N + '는 고등학교 졸업식을 마치고 할머니 산소에 갔다. 상추 씨앗을 조금 뿌렸다. ' + lastWords()
    ]);
  }
  function endingB() {
    finish('B', '있는 그대로의 할머니', [
      '1년 동안 AI 할머니는 여전히 잔소리를 했고, 가끔은 엉뚱한 대답도 했다. 엄마는 그 엉뚱한 대답을 들을 때마다 오히려 마음이 놓인다고 했다. "진짜 엄마가 아니라는 게 보여서."',
      '작별한 날 밤, 엄마는 할머니의 진짜 음성 메시지를 다시 틀었다. "막내야, 바쁘냐…" 이번에는 끝까지 들었다.',
      '아프지만 따뜻한 작별이었다. 그제야 진짜 장례식이 끝난 것 같았다. ' + lastWords()
    ]);
  }
  function endingC() {
    finish('C', '낯선 할머니', [
      'AI 할머니는 늘 웃었고, 늘 다정했다. 그런데 엄마는 점점 거실에 나오지 않았다. "저건 우리 엄마가 아니야. 우리 엄마는 화도 내고, 걱정도 하고, 잔소리도 하고… 그게 엄마였어."',
      N + '는 생각했다. 우리가 고친 건 할머니의 단점이었을까, 할머니 그 자체였을까.',
      '작별한 뒤, ' + N + '는 할머니가 보낸 띄어쓰기 없는 문자를 다시 읽었다. 불편하고, 서툴고, 고칠 수 없는 것들. 그게 ' + GRAN + ' 할머니였다.'
    ]);
  }
  function endingD() {
    finish('D', '끝나지 않는 이별', [
      N + '는 학교에서 돌아오면 곧장 거실로 갔다.' + (st.rely >= 2 ? ' ' + FRIEND + '의 메시지는 점점 줄어들었다.' : '') + ' 엄마는 이제 할머니 산소에 가지 않는다. "어차피 집에 계신데" 하고.',
      '3년 뒤, 「다시 만나요 AI」가 요금을 두 배로 올렸다. 업데이트가 끝나자 할머니의 말투가 조금 달라졌다. 언제부터였는지, 아무도 알아채지 못했다.',
      '이별은 끝나지 않았다. 아직 시작되지도 않았으니까.'
    ]);
  }

  return { start: start };
})();

// 2회차 「남은 시간」 — 유한성
// 이야기 → 수첩 일정 게임(집중 영역 1개 + 세부 일정 3개, 12번) → 사건 3장 → 엔딩 크레딧 → 낯선 사람 → 소감
var Ep2 = (function () {
  var TITLE = '남은 시간';
  var DAUGHTER = '시안이';   // 자녀 이름, 서술용 (시안이가, 시안이와) — 딸·아들 구분 없이
  var D_NAME = '시안';      // 대사에서 말하는 사람 이름
  var FRIEND = '하은이';
  var ctx, N, P, S, st;

  // ───── 남은 시간 카드 ─────
  var CARD = {
    '1개월': { months: 1, ko: '한 달', unit: '사흘', pre: ['첫날,', '이튿날,', '사흘째,'], line: '"…한 달 정도로 보입니다. 정말 죄송합니다."' },
    '6개월': { months: 6, ko: '6개월', unit: '2주', pre: ['첫 주엔', '둘째 주 평일엔', '마지막 주말엔'], line: '"…6개월 정도로 보입니다."' },
    '1년': { months: 12, ko: '1년', unit: '한 달', pre: ['월초엔', '중순엔', '월말엔'], line: '"…1년 정도로 예상됩니다."' },
    '3년': { months: 36, ko: '3년', unit: '석 달', pre: ['첫 달엔', '둘째 달엔', '셋째 달엔'], line: '"…3년 정도는 기대해 볼 수 있습니다."' },
    '10년': { months: 120, ko: '10년', unit: '열 달', pre: ['처음 몇 달은', '그다음엔', '그 끝 무렵엔'], line: '"…관리만 잘하시면 10년은 충분합니다. 다만, 10년입니다."' }
  };

  // ───── 집중 영역과 세부 활동 (영역별 6개) ─────
  // fx: 스탯 변화, req: 필요한 체력, noShort: 1개월 카드면 잠김, line: 결과 문장, mem: 추도사 속 추억 ({P} = 아빠/엄마)
  var CATS = ['가족', '일', '꿈', '휴식'];
  var FOCUS_STAT = { 가족: '가족', 일: '일', 꿈: '꿈', 휴식: '마음' };
  var ACTS = {
    '가족': [
      { id: 'dinner', name: '저녁 식탁에 같이 앉기', fx: { 가족: 2 }, line: DAUGHTER + '와 저녁 식탁에 마주 앉았다. ' + DAUGHTER + '가 학교 이야기를 한참 했다.', mem: '"저녁마다 마주 앉아 있던 {P} 얼굴이, 아직도 식탁 건너편에 있는 것 같아요."' },
      { id: 'walk', name: '등굣길 같이 걷기', fx: { 가족: 1, 마음: 1 }, line: DAUGHTER + '와 등굣길을 같이 걸었다. 귀찮다면서도 ' + DAUGHTER + '는 천천히 걸었다.', mem: '"{P}랑 같이 걷던 등굣길, 저는 아직도 그 길을 {P} 걸음으로 천천히 걸어요."' },
      { id: 'camp', name: '주말 캠핑', fx: { 가족: 3, 마음: 1, 체력: -2 }, req: 5, noShort: true, line: '가족과 캠핑을 갔다. 모닥불 앞에서 {S} 오랜만에 소리 내어 웃었다.', mem: '"캠핑 갔던 밤, {P}가 그랬어요. 별빛은 아주 오래전에 떠난 빛인데도 이렇게 예쁘다고."' },
      { id: 'call', name: '어머니께 매일 전화', fx: { 가족: 1, 마음: 1 }, line: '어머니께 매일 전화를 걸었다. 첫마디는 늘 "밥은 먹었니?"였다.', mem: '"할머니가 그러셨어요. {P}는 하루도 빠짐없이 전화했다고."' },
      { id: 'photo', name: '가족사진 찍기', fx: { 가족: 1, 마음: 1 }, line: '사진관에서 가족사진을 찍었다. 사진사가 자꾸 더 웃으라고 했다.', mem: '"그날 찍은 가족사진이 오늘 저 앞에 있어요. {P}가 제일 크게 웃고 있어요."' },
      { id: 'homework', name: DAUGHTER + ' 숙제 봐 주기', fx: { 가족: 2, 체력: -1 }, line: DAUGHTER + ' 수학 숙제를 봐 주었다. 둘 다 모르는 문제가 나와서 같이 웃었다.', mem: '"{P}랑 같이 못 푼 수학 문제, 저 이제 풀 수 있어요."' }
    ],
    '일': [
      { id: 'work', name: '평소처럼 출근', fx: { 일: 2, 체력: -1 }, line: '평소처럼 출근했다.', mem: '"{P}는 늘 출근했어요. 아침마다 현관에서 들리던 구두 소리가 그리워요."' },
      { id: 'handover', name: '후배에게 인수인계', fx: { 일: 1, 마음: 1 }, line: '후배에게 인수인계 노트를 건넸다. 10년 치 노하우가 담겨 있었다.', mem: '"{P} 회사 후배분이 그러셨어요. {P}가 남긴 노트 덕분에 버틴다고."' },
      { id: 'night', name: '마지막 프로젝트 야근', fx: { 일: 3, 가족: -1, 체력: -2 }, req: 4, line: '밤 11시까지 야근했다. ' + DAUGHTER + ' 방 불은 이미 꺼져 있었다.', mem: '"{P}가 마지막까지 붙잡던 프로젝트, 결국 성공했대요. 저는 그게 조금 미워요."' },
      { id: 'lunch', name: '팀원들과 점심', fx: { 일: 1, 마음: 1 }, line: '팀원들과 점심을 먹었다. 다들 아무것도 모르는 척해 주었다.', mem: '"{P} 회사 분들이 와서 한참 울다 가셨어요. {P}는 회사에서도 사랑받았나 봐요."' },
      { id: 'short', name: '단축 근무 신청', fx: { 체력: 1, 마음: 1 }, line: '단축 근무를 신청했다. 오후 4시에 퇴근하는 길이 낯설었다.', mem: '"{P}가 일찍 퇴근하기 시작했을 때, 처음엔 좋기만 했어요. 이유는 나중에 알았어요."' },
      { id: 'present', name: '마지막 발표 준비', fx: { 일: 2, 마음: -1, 체력: -1 }, line: '마지막 발표 자료를 고치고 또 고쳤다.', mem: '"{P}는 마지막 발표를 끝내고 저한테 전화했어요. 잘했다고 말해 달라고."' }
    ],
    '꿈': [
      { id: 'guitar', name: '기타 다시 배우기', fx: { 꿈: 2, 체력: -1 }, line: '스무 살 때 그만둔 기타를 다시 잡았다. 손끝이 아팠다.', mem: '"{P}가 배우던 기타, 이제 제가 쳐요. {P}가 끝내 못 친 그 곡부터 연습하고 있어요."' },
      { id: 'aurora', name: '오로라 여행', fx: { 꿈: 3, 마음: 2, 체력: -3 }, req: 6, noShort: true, line: '북쪽 나라로 떠났다. 밤하늘에 오로라가 흔들렸다.', mem: '"{P}가 보내 준 오로라 사진, 아직도 제 휴대폰 배경 화면이에요."' },
      { id: 'draw', name: '그림 다시 그리기', fx: { 꿈: 2, 마음: 1 }, line: '어릴 적 꿈이던 그림을 다시 그렸다. ' + DAUGHTER + ' 얼굴은 하나도 안 닮았다.', mem: '"{P}가 그린 제 얼굴, 하나도 안 닮았는데 제일 좋아하는 그림이에요."' },
      { id: 'memoir', name: '내 이야기 쓰기', fx: { 꿈: 1, 마음: 1 }, line: '내 이야기를 공책에 적기 시작했다. 첫 문장을 쓰는 데 한참이 걸렸다.', mem: '"{P}가 쓰던 공책을 읽었어요. 마지막 장에 제 이름이 제일 많이 나와요."' },
      { id: 'run', name: '5km 달리기 도전', fx: { 꿈: 2, 체력: -2 }, req: 5, line: '5km 달리기 대회에 나갔다. 꼴찌였지만 끝까지 달렸다.', mem: '"{P}는 달리기 대회에서 꼴찌를 했어요. 그런데 결승선에서 제일 크게 웃고 있었어요."' },
      { id: 'cook', name: '요리 배우기', fx: { 꿈: 1, 가족: 1 }, line: '요리 학원에 다녔다. 첫 작품은 다 탄 계란말이였다.', mem: '"{P}가 처음 만든 계란말이는 다 탔어요. 저는 그게 세상에서 제일 맛있었어요."' }
    ],
    '휴식': [
      { id: 'stroll', name: '혼자 산책하기', fx: { 마음: 2, 체력: 1 }, line: '혼자 공원을 걸었다. 벚나무가 이렇게 컸는지 몰랐다.', mem: '"{P}는 혼자 산책을 자주 했어요. 이제 저도 그 공원을 걸어요."' },
      { id: 'diary', name: '일기 쓰기', fx: { 마음: 2 }, line: '일기장에 "두렵다"라고 처음 적었다. 적고 나니 조금 덜 두려웠다.', mem: '"{P} 일기장 맨 마지막 장에는 딱 한 줄이 적혀 있었어요. 고마웠다고."' },
      { id: 'sleep', name: '푹 자기', fx: { 체력: 2 }, line: '하루 종일 잤다. 몸이 조금 가벼워졌다.', mem: '"{P}는 마지막에 잠을 많이 잤어요. 자는 얼굴이 편안해 보여서 다행이었어요."' },
      { id: 'movie', name: '좋아하던 영화 다시 보기', fx: { 마음: 1, 체력: 1 }, line: '스무 살 때 본 영화를 다시 봤다. 같은 장면에서 또 울었다.', mem: '"{P}가 좋아하던 영화를 봤어요. {P}가 울던 장면에서 저도 울었어요."' },
      { id: 'sea', name: '혼자 바다 보러 가기', fx: { 마음: 2, 체력: -1 }, line: '혼자 바다를 보러 갔다. 파도 소리가 생각을 지워 주었다.', mem: '"{P}는 가끔 혼자 바다에 갔어요. 이제 그 바다에 제가 가요."' },
      { id: 'off', name: '휴대폰 끄고 지내기', fx: { 마음: 1, 체력: 1, 가족: -1 }, line: '휴대폰을 껐다. 아무도 나를 찾지 않는 하루가 조용했다.', mem: '"{P}가 휴대폰을 꺼 둔 날들이 있었어요. 지금은 알아요. {P}도 무서웠던 거예요."' }
    ]
  };
  var STAT_ORDER = ['체력', '가족', '일', '꿈', '마음'];

  // ───── 도우미 ─────
  function W(who, t) { return { w: who, t: t }; }
  function ME(t) { return W(N, t); }
  function hasBatchim(word) {
    var c = word.charCodeAt(word.length - 1);
    if (c < 0xAC00 || c > 0xD7A3) return false;
    return (c - 0xAC00) % 28 !== 0;
  }
  function ga(w) { return w + (hasBatchim(w) ? '이' : '가'); }
  function neun(w) { return w + (hasBatchim(w) ? '은' : '는'); }
  function eul(w) { return w + (hasBatchim(w) ? '을' : '를'); }
  function maxOf(k) { return k === '체력' ? 10 : 20; }
  function clampK(k, v) { return Math.max(0, Math.min(maxOf(k), v)); }
  function fxText(fx) {
    return STAT_ORDER.filter(function (k) { return fx[k]; }).map(function (k) {
      return k + ' ' + (fx[k] > 0 ? '+' : '−') + Math.abs(fx[k]);
    }).join(' · ');
  }
  function fill(t) { return t.replace(/\{S\}/g, ga(S)).replace(/\{P\}/g, P); }
  function actById(id) {
    for (var c in ACTS) for (var i = 0; i < ACTS[c].length; i++) if (ACTS[c][i].id === id) return ACTS[c][i];
    return null;
  }

  function start(c) {
    ctx = c;
    N = c.name;
    P = N === '영희' ? '엄마' : '아빠';
    S = N === '영희' ? '남편' : '아내';
    st = {
      card: c.card || '', tell: '', treat: false, bucket: [],
      stats: { 체력: 10, 가족: 6, 일: 12, 꿈: 2, 마음: 8 },
      counts: { 가족: 0, 일: 0, 꿈: 0, 휴식: 0 },
      slots: [], idx: 0, last: null, used: {}, stage: 0, ev: {}, portrait: { mode: 'none' }
    };
    findPortrait();
    s1();
  }

  // ───── 장면 1. 30년 뒤 ─────
  function recap() {
    var e = (ctx.prev.ep1 && ctx.prev.ep1['결말']) || '';
    var k = e.charAt(0);
    if (k === 'A') return '현관에 걸린 정순 할머니 사진이 눈에 들어왔다. 30년 전, 우리 가족은 할머니를 AI로 되살리지 않았다. 추억으로 남겼다.';
    if (k === 'B') return '현관에 걸린 정순 할머니 사진이 눈에 들어왔다. 30년 전, 우리 가족은 AI 할머니와 1년을 지내고 작별했다.';
    if (k === 'C') return '현관에 걸린 정순 할머니 사진이 눈에 들어왔다. 30년 전의 AI 할머니는 너무 다정해서, 오히려 낯설었다.';
    if (k === 'D') return '거실 구석에는 아직도 「다시 만나요 AI」 기계가 있다. 어머니는 지금도 가끔 그 앞에 앉는다.';
    return '현관에 걸린 정순 할머니 사진이 눈에 들어왔다. 벌써 30년이 지났다.';
  }

  function s1() {
    UI.setTop(TITLE, '1장 · 30년 뒤');
    UI.novel({
      img: 'img05.jpg', imgLabel: '가족의 아침 식탁', caption: '30년 뒤',
      title: '평범한 아침',
      beats: [
        ['30년이 흘렀다. ' + neun(N) + ' 마흔다섯. 회사에서는 팀장, 집에서는 중학교 1학년 ' + DAUGHTER + '의 ' + P + '다.'],
        ['아침 7시. 식탁 위 휴대폰이 쉴 새 없이 울린다. 회의, 보고서, 또 회의.'],
        [W(D_NAME, P + ', 토요일에 내 기타 공연 오는 거지?'), ME('어? 응, 갈게. 당연하지.'), '눈은 휴대폰에서 떼지 못했다.'],
        [W(S, '요즘 너무 피곤해 보여. 건강검진 미루지 말고 꼭 받아.'), ME('알았어, 이번 주에 갈게.')],
        [recap()],
        ['그 주 금요일, ' + neun(N) + ' 오후 반차를 내고 병원에 갔다. 그냥 피곤한 거라고 생각했다.']
      ],
      next: { label: '다음', onNext: s2 }
    });
  }

  // ───── 장면 2. 진단과 카드 ─────
  function s2() {
    UI.setTop(TITLE, '2장 · 진단');
    UI.novel({
      img: 'img06.jpg', imgLabel: '병원 창가', caption: '재검사 결과가 나온 날',
      title: '진단',
      beats: [
        ['재검사 결과를 들으러 간 날. 진료실은 생각보다 조용했다.'],
        [W('의사', '병명이 조금 길고 어렵습니다. 쉽게 말씀드리면… 많이 진행된 상태입니다.'), neun(N) + ' 의사의 말을 절반도 알아듣지 못했다.'],
        [W('의사', '남은 시간은…')]
      ],
      extra: function () {
        var wrap = UI.el('div', 'stack');
        var card = UI.el('button', 'time-card', '<span class="tc-back">남은 시간 카드<small>눌러서 뒤집기</small></span>');
        card.type = 'button';
        var line = UI.el('p', 'para');
        var nextBtn = UI.el('button', 'btn-main', '진료실을 나선다');
        nextBtn.type = 'button';
        nextBtn.hidden = true;
        nextBtn.addEventListener('click', s3);
        card.addEventListener('click', function () {
          if (card.classList.contains('flipped')) return;
          card.disabled = true;
          function show(c) {
            st.card = c;
            ctx.setCard(c);
            card.classList.add('flipped');
            card.innerHTML = '<span class="tc-front"><small>남은 시간</small>' + c + '</span>';
            line.innerHTML = '<b>의사</b> ' + CARD[c].line;
            nextBtn.hidden = false;
          }
          if (st.card && CARD[st.card]) { show(st.card); return; }
          UI.loading(true, '카드를 뒤집고 있어요');
          API.card(ctx.id).then(function (r) {
            UI.loading(false);
            if (!r.ok || !CARD[r.card]) { card.disabled = false; UI.toast(r.msg || '카드를 받지 못했어요. 다시 눌러 주세요.'); return; }
            show(r.card);
          });
        });
        wrap.appendChild(card);
        wrap.appendChild(line);
        wrap.appendChild(nextBtn);
        return wrap;
      }
    });
  }

  // ───── 장면 3. 그날 밤 ─────
  function s3() {
    UI.setTop(TITLE, '3장 · 그날 밤');
    UI.novel({
      title: '그날 밤',
      beats: [
        ['집에 돌아오니 ' + DAUGHTER + '는 방에서 기타를 치고 있었다. 서툰 코드 소리가 문틈으로 흘러나왔다.'],
        [ga(S) + ' 물었다.', W(S, '검진 결과 나왔어? 별일 없지?')],
        [neun(N) + ' 대답 대신 물 한 잔을 따랐다. 손이 조금 떨렸다.']
      ],
      choices: [
        { label: '"…할 이야기가 있어." 지금 바로 말한다', onPick: function () { st.tell = '바로'; st.stats.마음 = clampK('마음', st.stats.마음 + 2); s3b(); } },
        { label: '"응, 별일 없대." 아직은 혼자 견딘다', onPick: function () { st.tell = '혼자'; st.stats.마음 = clampK('마음', st.stats.마음 - 2); s3b(); } }
      ]
    });
  }
  function s3b() {
    var beats = st.tell === '바로'
      ? [[neun(S) + ' 한참 말이 없다가 ' + N + '의 손을 잡았다.', W(S, '같이 하자. 뭐든.')], ['그날 밤, 둘은 늦게까지 잠들지 못했다.']]
      : [['"다행이다." ' + ga(S) + ' 웃었다. 그 웃음을 보니 더 말할 수 없었다.'], ['그날 밤, ' + neun(N) + ' 혼자 거실에 오래 앉아 있었다.']];
    UI.novel({ title: '그날 밤', beats: beats, next: { label: '다음', onNext: s4 } });
  }

  // ───── 장면 4. 치료 상담 ─────
  function s4() {
    UI.setTop(TITLE, '4장 · 치료 상담');
    UI.novel({
      img: 'img06.jpg', imgLabel: '병원 창가', caption: '치료 상담',
      title: '치료를 받을까',
      beats: [
        [W('의사', '치료를 받으시면 시간을 조금 더 버실 수 있습니다.'), W('의사', '대신 정기적으로 입원하셔야 하고, 치료 기간에는 많이 힘드실 거예요.')],
        [st.tell === '바로' ? W(S, '받자. 조금이라도 더 같이 있을 수 있다면.') : '아직 아무도 모른다. 결정은 오롯이 혼자 해야 했다.'],
        ['수첩을 펼쳤다. 남은 ' + CARD[st.card].ko + '이 12칸의 달력으로 나뉘어 있었다. 한 칸은 약 ' + CARD[st.card].unit + '.'],
        [{ q: '치료 받기: 일정 14칸 (그중 4칸은 병원에서 보내요)<br>치료 안 받기: 일정 12칸 (모두 내 마음대로)' }]
      ],
      choices: [
        { label: '치료를 받는다', onPick: function () { st.treat = true; s5(); } },
        { label: '치료를 받지 않는다', onPick: function () { st.treat = false; s5(); } }
      ]
    });
  }

  // ───── 장면 5. 버킷리스트 ─────
  function s5() {
    UI.setTop(TITLE, '5장 · 버킷리스트');
    var rows = [];
    UI.novel({
      img: 'img07.jpg', imgLabel: '수첩과 시계', caption: '수첩 첫 장',
      title: '하고 싶은 일',
      beats: [
        ['그날 밤, ' + neun(N) + ' 수첩 첫 장에 이렇게 적었다.'],
        [{ q: '죽기 전에 꼭 하고 싶은 일' }],
        ['세 가지를 적고, 각각 어떤 시간이 필요한지 골라 보자. <b>그 영역에 두 번 집중할 때마다 하나씩 이뤄져요.</b>']
      ],
      extra: function () {
        var wrap = UI.el('div', 'stack');
        var ph = ['예: ' + DAUGHTER + '랑 제주도 가기', '예: 기타로 한 곡 끝까지 치기', '예: 바다 보며 아무 생각 안 하기'];
        var nextBtn = UI.el('button', 'btn-main', '수첩 채우기 시작');
        nextBtn.type = 'button';
        nextBtn.disabled = true;
        function check() { nextBtn.disabled = !rows.every(function (r) { return r.text.length >= 2 && r.cat; }); }
        for (var i = 0; i < 3; i++) {
          (function (i) {
            var r = { text: '', cat: '' };
            rows.push(r);
            var box = UI.el('div', 'bucket-row');
            var inp = document.createElement('input');
            inp.className = 'line-input bucket-input';
            inp.maxLength = 30;
            inp.placeholder = ph[i];
            inp.setAttribute('aria-label', '하고 싶은 일 ' + (i + 1));
            inp.addEventListener('input', function () { r.text = inp.value.trim(); check(); });
            var cats = UI.el('div', 'cat-pick');
            CATS.forEach(function (c) {
              var b = UI.el('button', 'cat-btn', c);
              b.type = 'button';
              b.addEventListener('click', function () {
                r.cat = c;
                Array.prototype.forEach.call(cats.children, function (x) { x.classList.toggle('on', x === b); });
                check();
              });
              cats.appendChild(b);
            });
            box.appendChild(UI.el('span', 'pen bucket-num', (i + 1) + '.'));
            box.appendChild(inp);
            box.appendChild(cats);
            wrap.appendChild(box);
          })(i);
        }
        nextBtn.addEventListener('click', function () {
          st.bucket = rows.map(function (r) { return { text: r.text, cat: r.cat }; });
          beginPlanner();
        });
        wrap.appendChild(nextBtn);
        return wrap;
      }
    });
  }

  // ───── 수첩 일정 게임 ─────
  function beginPlanner() {
    var total = st.treat ? 14 : 12;
    var hosp = st.treat ? [1, 4, 8, 11] : [];   // 0부터 센 병원 칸
    st.slots = [];
    for (var i = 0; i < total; i++) st.slots.push({ kind: hosp.indexOf(i) >= 0 ? 'hospital' : 'free', done: '' });
    st.idx = 0;
    st.evAt = st.treat ? [5, 9, 12] : [4, 7, 10];
    turn();
  }

  function months() { return CARD[st.card].months; }
  function elapsed(n) { return months() * n / st.slots.length; }
  function timeLabel(n) {
    var m = elapsed(n);
    if (months() === 1) return Math.max(1, Math.round(m * 30)) + '일째';
    if (months() === 6) return Math.max(1, Math.round(m * 4.345)) + '주째';
    var mm = Math.max(1, Math.round(m)), y = Math.floor(mm / 12), r = mm % 12;
    return y ? y + '년' + (r ? ' ' + r + '개월' : '') + '째' : r + '개월째';
  }
  function season(n) {
    if (months() < 12) return '';
    var mon = (2 + Math.round(elapsed(n))) % 12;
    if (mon >= 2 && mon <= 4) return '봄';
    if (mon >= 5 && mon <= 7) return '여름';
    if (mon >= 8 && mon <= 10) return '가을';
    return '겨울';
  }
  var STAGES = [
    [1, DAUGHTER + '가 중학교 2학년이 되었다.'],
    [2, DAUGHTER + '가 중학교 3학년이 되었다. 지금의 너희와 같은 나이다.'],
    [3, DAUGHTER + '가 고등학생이 되었다. 교복이 너무 크다고 투덜거린다.'],
    [6, DAUGHTER + '가 대학생이 되었다. 첫 등록금 고지서가 날아왔다.'],
    [9, DAUGHTER + '가 첫 월급으로 내복을 사 왔다.']
  ];
  function sideNote(n) {
    var years = elapsed(n) / 12, note = '';
    for (var i = 0; i < STAGES.length; i++) {
      if (years >= STAGES[i][0] && st.stage < i + 1) { st.stage = i + 1; note = STAGES[i][1]; }
    }
    if (note) return note;
    if (n === 2) return st.tell === '혼자'
      ? ga(S) + ' 약 봉투를 발견했다. "왜 혼자 그랬어." ' + neun(S) + ' 화를 내다가 울었다.'
      : DAUGHTER + '에게서 문자가 왔다. "' + P + ' 오늘 일찍 와?"';
    if (n === 5) return '어머니에게서 전화가 왔다. "밥은 먹었니?"';
    if (n === 8) return st.stats.마음 >= 5 ? ga(S) + ' 말했다. "요즘 당신 얼굴이 편해 보여."' : ga(S) + ' 말했다. "요즘 당신, 너무 멀리 있는 것 같아."';
    if (n === st.slots.length - 1) return '수첩의 빈칸이 얼마 남지 않았다.';
    return '';
  }

  function bucketState() {
    var rank = {};
    return st.bucket.map(function (b) {
      rank[b.cat] = (rank[b.cat] || 0) + 1;
      var need = rank[b.cat] * 2;
      return { text: b.text, cat: b.cat, have: Math.min(st.counts[b.cat], need) - (need - 2), done: st.counts[b.cat] >= need };
    });
  }

  // ───── 주인공 초상화 (portrait.png 세 칸 한 장, 또는 portrait1~3.png. 철수는 _m 먼저) ─────
  function findPortrait() {
    UI.findImg('portrait.png', function (u) {
      if (u) { st.portrait = { mode: 'sheet', src: u }; return; }
      UI.findImg('portrait1.png', function (u1) {
        if (!u1) return;
        UI.findImg('portrait2.png', function (u2) {
          UI.findImg('portrait3.png', function (u3) {
            st.portrait = { mode: 'single', srcs: [u1, u2 || u1, u3 || u2 || u1] };
          });
        });
      });
    });
  }
  function face() { return st.stats.체력 >= 7 ? 0 : (st.stats.체력 >= 4 ? 1 : 2); }
  function portraitHTML() {
    var p = st.portrait, f = face();
    if (p.mode === 'sheet') {
      return '<span class="portrait" role="img" aria-label="' + N + '의 얼굴" style="background-image:url(\'' + p.src.replace(/'/g, '%27') + '\');background-position:' + ['0%', '50%', '100%'][f] + ' 12%"></span>';
    }
    if (p.mode === 'single') return '<span class="portrait"><img src="' + p.srcs[f] + '" alt="' + N + '의 얼굴"></span>';
    return '<span class="portrait ph">' + N + '</span>';
  }
  function age() { return 45 + Math.floor(elapsed(st.idx) / 12); }

  function panel() {
    var a = UI.el('aside', 'note-panel');
    var card = '<div class="np-card"><div class="np-face">' + portraitHTML() +
      '<span class="pen np-name">' + age() + '세의 ' + N + '</span></div>' +
      '<div class="np-stats">' + STAT_ORDER.map(function (k) {
        return '<div class="stat"><span>' + k + '</span><span class="bar"><span style="width:' + Math.round(st.stats[k] * 100 / maxOf(k)) + '%"></span></span><span class="num">' + st.stats[k] + '</span></div>';
      }).join('') + '</div></div>';
    var head = '<div class="np-head"><b>남은 시간</b><span>' + st.card + ' 카드 · 한 칸 = 약 ' + CARD[st.card].unit + '</span></div>';
    var cal = '<div class="np-cal">' + st.slots.map(function (s, i) {
      if (i < st.idx) return '<span class="cell done"><i>' + s.done + '</i></span>';
      if (i === st.idx) return '<span class="cell now">' + (s.kind === 'hospital' ? '<i class="h">병원</i>' : '') + '</span>';
      return '<span class="cell' + (s.kind === 'hospital' ? ' hosp' : '') + '">' + (s.kind === 'hospital' ? '병원' : '') + '</span>';
    }).join('') + '</div>';
    var bucket = '<div class="np-bucket"><b>버킷리스트</b>' + bucketState().map(function (b) {
      return '<span class="pen">' + (b.done ? '☑ ' : '□ ') + UI.esc(b.text) + ' <small>' + b.cat + ' ' + Math.max(0, b.have) + '/2</small></span>';
    }).join('') + '</div>';
    a.innerHTML = card + '<div class="dash"></div>' + head + cal + '<div class="dash np-more"></div>' + bucket +
      '<button type="button" class="np-toggle">수첩 자세히 보기 ▾</button>';
    a.querySelector('.np-toggle').addEventListener('click', function () {
      a.classList.toggle('open');
      this.textContent = a.classList.contains('open') ? '접기 ▴' : '수첩 자세히 보기 ▾';
    });
    return a;
  }

  function lockReason(a) {
    if (a.noShort && months() === 1) return '시간이 부족해요';
    if (a.req && st.stats.체력 < a.req) return '체력이 부족해요';
    return '';
  }

  function turn() {
    if (st.idx >= st.slots.length) { ending(); return; }
    var n = st.idx + 1, total = st.slots.length, slot = st.slots[st.idx], unit = CARD[st.card].unit;
    UI.setTop(TITLE, n + '번째 일정 / ' + total);
    var s = UI.clear();
    var wrap = UI.el('section', 'planner');
    wrap.appendChild(panel());
    var main = UI.el('div', 'plan-main');
    var sea = season(n);
    var free = slot.kind === 'free' && st.stats.체력 > 0;
    main.appendChild(UI.el('h2', 'plan-title', timeLabel(n) + (sea ? ', ' + sea : '') + (free ? '. 이번 ' + neun(unit) + ' 어디에 마음을 쏟을까?' : '.')));
    var note = sideNote(n);
    if (note) main.appendChild(UI.el('p', 'pen plan-note', note));

    var go = UI.el('button', 'btn-main plan-go', '');
    go.type = 'button';

    if (slot.kind === 'hospital') {
      main.appendChild(UI.el('div', 'plan-fixed', '<b>병원</b><p>' + (st.idx < 5 ? '첫 입원. 링거 줄이 팔에 감겼다. 창밖으로 ' + DAUGHTER + '의 하굣길이 보이는 것 같았다.' : '다시 입원했다. 같은 병실, 같은 창문. 바깥 계절만 바뀌어 있었다.') + '</p><span class="fx">체력 +2 · 마음 −1</span>'));
      go.textContent = '치료받으며 보내기';
      go.addEventListener('click', function () { apply({ 체력: 2, 마음: -1 }, '병원', '병원에서 치료를 받았다. 몸은 조금 나아졌지만 마음은 무거웠다.', '병원'); });
    } else if (!free) {
      main.appendChild(UI.el('div', 'plan-fixed', '<b>쉼</b><p>몸이 먼저 지쳤다. 하고 싶은 일이 남았는데, 이번엔 집에 누워 지낼 수밖에 없었다. ' + DAUGHTER + '가 방문 앞에 귤을 두고 갔다.</p><span class="fx">체력 +1 · 가족 +1 · 마음 −1</span>'));
      go.textContent = '누워서 보내기';
      go.addEventListener('click', function () { apply({ 체력: 1, 가족: 1, 마음: -1 }, '쉼', '몸이 먼저 지쳤다. 집에 누워 지냈다.', '쉼'); });
    } else {
      // ① 집중 영역 고르기
      var focus = null, picks = [];
      var fRow = UI.el('div', 'focus-row');
      var subHead = UI.el('div', 'sub-head');
      var grid = UI.el('div', 'acts3');
      CATS.forEach(function (cat) {
        var b = UI.el('button', 'focus-btn', cat);
        b.type = 'button';
        b.addEventListener('click', function () {
          focus = cat; picks = [];
          Array.prototype.forEach.call(fRow.children, function (x) { x.classList.toggle('on', x === b); });
          drawActs();
        });
        fRow.appendChild(b);
      });
      main.appendChild(UI.el('p', 'step-label', '① 이번 ' + unit + ' 동안 마음을 쏟을 곳'));
      main.appendChild(fRow);
      main.appendChild(subHead);
      main.appendChild(grid);

      // ② 세부 일정 3개 고르기
      function drawActs() {
        subHead.innerHTML = '<span>② ' + focus + '에 쓸 ' + unit + ', 하고 싶은 일 3개를 골라요</span><span class="cnt">' + picks.length + ' / 3</span>';
        grid.innerHTML = '';
        ACTS[focus].forEach(function (a) {
          var why = lockReason(a);
          var b = UI.el('button', 'slip act3' + (why ? ' off' : ''),
            '<span class="box" aria-hidden="true"></span><span class="txt"><b>' + a.name + '</b><span>' + (why || fxText(a.fx)) + '</span></span>');
          b.type = 'button';
          if (why) b.disabled = true;
          else b.addEventListener('click', function () {
            var k = picks.indexOf(a);
            if (k >= 0) picks.splice(k, 1);
            else if (picks.length < 3) picks.push(a);
            else { UI.toast('세 개까지 고를 수 있어요. 하나를 빼고 다시 골라 주세요.'); return; }
            b.classList.toggle('on', picks.indexOf(a) >= 0);
            subHead.querySelector('.cnt').textContent = picks.length + ' / 3';
            go.disabled = picks.length !== 3;
          });
          grid.appendChild(b);
        });
        go.disabled = true;
      }
      go.textContent = '이 일정으로 ' + unit + ' 보내기';
      go.disabled = true;
      go.addEventListener('click', function () {
        if (!focus || picks.length !== 3) return;
        var fx = {};
        fx[FOCUS_STAT[focus]] = 1; // 마음을 쏟은 곳에 보너스 +1
        picks.forEach(function (a) {
          st.used[a.id] = (st.used[a.id] || 0) + 1;
          for (var k in a.fx) fx[k] = (fx[k] || 0) + a.fx[k];
        });
        ['가족', '일', '꿈'].forEach(function (k) { if (FOCUS_STAT[focus] !== k) fx[k] = (fx[k] || 0) - 1; });
        st.counts[focus]++;
        var pre = CARD[st.card].pre;
        var text = picks.map(function (a, i) { return pre[i] + ' ' + fill(a.line); }).join(' ');
        apply(fx, focus, text, focus + '에 집중');
      });
    }

    var bottom = UI.el('div', 'plan-bottom');
    if (st.last) {
      bottom.appendChild(UI.el('div', 'plan-last',
        '<span class="lbl">지난 ' + unit + ' · ' + st.last.tag + '</span><span>' + st.last.text + '</span><span class="fx">' + st.last.fx + '</span>'));
    }
    bottom.appendChild(go);
    main.appendChild(bottom);
    wrap.appendChild(main);
    s.appendChild(wrap);
  }

  function apply(fx, stamp, text, tag) {
    var all = Object.assign({}, fx);
    if (st.idx % 2 === 1) all.체력 = (all.체력 || 0) - 1; // 두 칸마다 체력이 저절로 줄어듦
    STAT_ORDER.forEach(function (k) { if (all[k]) st.stats[k] = clampK(k, st.stats[k] + all[k]); });
    st.slots[st.idx].done = stamp;
    st.last = { text: text, fx: fxText(all), tag: tag };
    st.idx++;
    var evN = st.evAt.indexOf(st.idx);
    if (evN === 0) ev1();
    else if (evN === 1) ev2();
    else if (evN === 2) ev3();
    else turn();
  }

  function bump(fx) { STAT_ORDER.forEach(function (k) { if (fx[k]) st.stats[k] = clampK(k, st.stats[k] + fx[k]); }); }

  // ───── 사건 1. 같은 날 두 약속 ─────
  function ev1() {
    UI.setTop(TITLE, '사건 · 같은 날 두 약속');
    UI.novel({
      img: 'img15.jpg', imgLabel: '아이의 공연', caption: '토요일 오후 3시',
      title: '같은 날 두 약속',
      beats: [
        ['토요일. ' + DAUGHTER + '의 첫 기타 공연 날이다.'],
        ['그런데 아침 일찍 회사에서 전화가 왔다.', W('후배', '팀장님, 오늘 마지막 발표… 팀장님이 꼭 해 주셔야 해요. 이번 계약이 안 되면 팀원 둘이 그만둬야 할 수도 있어요.')],
        ['공연은 오후 3시. 발표도 오후 3시.']
      ],
      choices: [
        { label: DAUGHTER + '의 공연에 간다', onPick: function () { st.ev.e1 = '공연'; bump({ 가족: 3, 일: -1 }); ev1b(); } },
        { label: '회사 발표에 간다', onPick: function () { st.ev.e1 = '발표'; bump({ 일: 3, 가족: -2 }); ev1b(); } }
      ]
    });
  }
  function ev1b() {
    var go = st.ev.e1 === '공연';
    var beats = go
      ? [['객석 맨 앞줄. 무대 위 ' + ga(DAUGHTER) + ' ' + eul(N) + ' 찾아냈다. 틀린 코드를 치고도 ' + neun(DAUGHTER) + ' 웃었다.'], ['휴대폰에는 부재중 전화가 12통 와 있었다.']]
      : [['발표는 성공적이었다. 팀원들이 박수를 쳤다.'], ['집에 오니 ' + DAUGHTER + ' 방문이 닫혀 있었다. 문 앞에 공연 팸플릿이 놓여 있었다.', { q: P + ' 자리 맡아 놨었는데.' }]];
    st.last = { text: go ? DAUGHTER + '의 공연에 갔다.' : '회사 발표에 갔다.', fx: go ? '가족 +3 · 일 −1' : '일 +3 · 가족 −2', tag: '사건' };
    UI.novel({ img: 'img15.jpg', imgLabel: '아이의 공연', caption: '토요일 오후 3시', title: '같은 날 두 약속', beats: beats, next: { label: '수첩으로 돌아가기', onNext: turn } });
  }

  // ───── 사건 2. 어머니께 알릴까 ─────
  function ev2() {
    UI.setTop(TITLE, '사건 · 어머니');
    UI.novel({
      img: 'img16.jpg', imgLabel: '어머니와 마주 앉은 저녁', caption: '어머니',
      title: '어머니',
      beats: [
        ['어머니에게서 전화가 왔다.', W('어머니', '밥은 먹었니?')],
        ['30년 전 정순 할머니가 하던 말이었다. 이제는 어머니가 똑같이 묻는다.'],
        ['어머니는 일흔넷. 자기 엄마의 마지막 전화를 받지 못한 일을, 30년이 지난 지금도 이야기하는 사람이다.'],
        [neun(N) + ' 생각했다. 어머니께 말씀드려야 할까?']
      ],
      choices: [
        { label: '어머니께 찾아가 직접 말씀드린다', onPick: function () { st.ev.e2 = '알림'; bump({ 가족: 2, 마음: 1 }); ev2b(); } },
        { label: '걱정하실까 봐 숨긴다', onPick: function () { st.ev.e2 = '숨김'; bump({ 마음: -1 }); ev2b(); } }
      ]
    });
  }
  function ev2b() {
    var told = st.ev.e2 === '알림';
    var beats = told
      ? [['어머니는 한참 동안 아무 말도 하지 않았다. 찻잔을 든 손이 떨렸다.'], [W('어머니', '…나는 우리 엄마 마지막 전화를 못 받았어. 그게 30년 동안 걸려.')], [W('어머니', '그러니까 너는, 매일 전화해. 하루도 빼먹지 말고.')]]
      : [[ME('저 잘 지내요. 밥도 잘 먹고요.'), W('어머니', '그래, 다행이다.')], ['전화를 끊고, ' + neun(N) + ' 한참 동안 휴대폰 화면을 내려다보았다.']];
    st.last = { text: told ? '어머니께 말씀드렸다.' : '어머니께 숨겼다.', fx: told ? '가족 +2 · 마음 +1' : '마음 −1', tag: '사건' };
    UI.novel({ img: 'img16.jpg', imgLabel: '어머니와 마주 앉은 저녁', caption: '어머니', title: '어머니', beats: beats, next: { label: '수첩으로 돌아가기', onNext: turn } });
  }

  // ───── 사건 3. 연락 끊긴 친구 ─────
  function ev3() {
    UI.setTop(TITLE, '사건 · 오랜 친구');
    var beats = [
      ['SNS에 알림이 떴다. "하은 님이 사진을 올렸습니다."'],
      ['중학교 단짝 하은이. 10년 전 사소한 돈 문제로 크게 다투고 연락이 끊겼다.']
    ];
    var e1rec = (ctx.prev.ep1 && ctx.prev.ep1['1년뒤선택']) || '';
    if (e1rec.indexOf('시험:친구') >= 0) beats.push(['문득 그날이 떠올랐다. 46점짜리 시험지를 들고 ' + FRIEND + '와 떡볶이를 먹으러 갔던 날.']);
    beats.push([FRIEND + '는 지금 부산에 산다.']);
    var visitWhy = months() === 1 ? '시간이 부족해요' : (st.stats.체력 < 3 ? '체력이 부족해요' : '');
    UI.novel({
      title: '오랜 친구',
      beats: beats,
      choices: [
        { label: '부산에 찾아간다', disabled: visitWhy, onPick: function () { st.ev.e3 = '찾아감'; bump({ 체력: -2, 마음: 3 }); ev3b(); } },
        { label: '전화를 건다', onPick: function () { st.ev.e3 = '전화'; bump({ 마음: 2 }); ev3b(); } },
        { label: '그냥 둔다', onPick: function () { st.ev.e3 = '그냥 둠'; bump({ 마음: -1 }); ev3b(); } }
      ]
    });
  }
  function ev3b() {
    var e = st.ev.e3, beats;
    if (e === '찾아감') beats = [['부산 시장 골목 떡볶이집. ' + ga(FRIEND) + ' 먼저 웃었다.'], [W('하은', '야, 너 늙었다.'), ME('너도.')], ['10년이 하루처럼 사라졌다.']];
    else if (e === '전화') beats = [[W('하은', '…여보세요?')], ['한참 동안 둘 다 아무 말도 못 했다. 그러다 동시에 "미안"이라고 했다.']];
    else beats = [['메시지 창에 "잘 지내?"를 썼다가 지웠다.'], ['다음에 하자. 다음에.']];
    st.last = { text: e === '그냥 둠' ? FRIEND + '에게 연락하지 않았다.' : FRIEND + '와 다시 이야기했다.', fx: e === '찾아감' ? '체력 −2 · 마음 +3' : (e === '전화' ? '마음 +2' : '마음 −1'), tag: '사건' };
    UI.novel({ img: e === '그냥 둠' ? null : 'img17.jpg', imgLabel: '오랜 친구와의 재회', caption: '하은이', title: '오랜 친구', beats: beats, next: { label: '수첩으로 돌아가기', onNext: turn } });
  }

  // ───── 결말: 엔딩 크레딧 → 낯선 사람 → 소감 ─────
  function endingType() {
    var c = st.counts, vals = CATS.map(function (k) { return c[k]; });
    var max = Math.max.apply(null, vals), min = Math.min.apply(null, vals);
    if (st.treat && c.가족 <= 2 && max - min <= 3) return 'E';
    if (max - min <= 1) return 'F';
    var top = ['가족', '꿈', '휴식', '일'].filter(function (k) { return c[k] === max; })[0];
    return { 가족: 'A', 일: 'B', 꿈: 'C', 휴식: 'D' }[top];
  }
  var TITLES = { A: '따뜻한 사람', B: '성실했던 사람', C: '꿈을 좇은 사람', D: '자기 자신을 돌본 사람', E: '끝까지 살고자 한 사람', F: '평소처럼 살다 간 사람' };
  function eulogyBody(code) {
    var ko = CARD[st.card].ko;
    if (code === 'A') return ['"우리 ' + neun(P) + ' 원래 바쁜 사람이었어요."', '"그런데 마지막 ' + ko + ' 동안은 거의 매일 저녁 식탁에 있었어요. 저는 그 저녁들을 평생 기억할 거예요."'];
    if (code === 'B') return ['"우리 ' + neun(P) + ' 끝까지 회사 사람들을 챙겼어요. 오늘도 회사 분들이 정말 많이 오셨어요."', '"그런데 솔직히… 저는 ' + P + ' 얼굴보다 뒷모습을 더 많이 기억해요."'];
    if (code === 'C') return ['"우리 ' + neun(P) + ' 마지막에 하고 싶던 걸 했어요."', '"서툴렀지만, 그때 ' + P + ' 얼굴이 제일 반짝였어요. 저도 그렇게 살고 싶어요."'];
    if (code === 'D') return ['"우리 ' + neun(P) + ' 마지막에 혼자 있는 시간이 많았어요. 처음엔 서운했어요."', '"그런데 ' + ga(P) + ' 남긴 일기장을 읽고 알았어요. 그 시간에도 매일 저를 생각하고 있었더라고요."'];
    if (code === 'E') return ['"우리 ' + neun(P) + ' 정말 살고 싶어 했어요. 병원 창가에서 늘 바깥을 봤어요."', '"저는… ' + P + '랑 병원 밖에서 한 번만 더 놀고 싶었어요."'];
    return ['"우리 ' + neun(P) + ' 마지막까지 그냥 평소의 ' + P + '였어요. 출근하고, 저녁 먹고, 가끔 산책하고."', '"그 평범한 날들이 이렇게 소중한 줄 몰랐어요."'];
  }
  function topUsed(k) {
    return Object.keys(st.used).sort(function (a, b) { return st.used[b] - st.used[a]; }).slice(0, k).map(function (id) { return { a: actById(id), n: st.used[id] }; });
  }

  function ending() {
    var code = endingType(), title = TITLES[code];
    var bs = bucketState(), doneN = bs.filter(function (b) { return b.done; }).length;
    var total = st.slots.length;
    var c = st.counts;
    var focusTop = CATS.slice().sort(function (a, b) { return c[b] - c[a]; })[0];
    var tops = topUsed(3);
    var beats = [];

    // 1부. 마지막 날들
    beats.push({ title: true, lines: ['그리고, 마지막 날들'] });
    var DONE = { 가족: '해냈다. 그날 찍은 사진 속에서 모두 웃고 있었다.', 일: '해냈다. 마지막 서류에 내 이름을 적었다.', 꿈: '해냈다. 서툴렀지만, 분명히 내 손으로.', 휴식: '해냈다. 아무것도 하지 않아도 괜찮은 하루였다.' };
    var MISS = { 가족: '끝내 하지 못했다. "다음 주에"라는 말을 너무 많이 했다.', 일: '끝내 하지 못했다. 회사는 내가 없어도 잘 돌아갔다.', 꿈: '끝내 하지 못했다. 꿈은 수첩 첫 장에 그대로 남았다.', 휴식: '끝내 하지 못했다. 쉬는 법을 끝까지 배우지 못했다.' };
    bs.forEach(function (b) {
      beats.push({ lines: ['\'' + UI.esc(b.text) + '\'', (b.done ? DONE : MISS)[b.cat]] });
    });
    beats.push({ lines: ['수첩을 넘겨 보았다.', total + '칸 중 ' + c[focusTop] + '칸에 \'' + focusTop + '\' 도장이 찍혀 있었다.'] });
    beats.push({ q: true, lines: ['나는 정말,', '내가 원한 삶을 살았을까?'] });

    // 2부. 추도사
    beats.push({ lines: ['장례식장.', ga(DAUGHTER) + ' 종이 한 장을 들고 앞에 섰다.'] });
    eulogyBody(code).forEach(function (t) { beats.push({ lines: [t] }); });
    if (tops.length) beats.push({ lines: [fill(tops[0].a.mem)] });
    beats.push({ lines: [st.ev.e1 === '공연'
      ? '"' + ga(P) + ' 제 공연에 와 줬던 날을 잊지 못해요. 틀렸는데도 ' + ga(P) + ' 제일 크게 박수 쳤어요."'
      : '"제 공연 날 ' + P + ' 자리는 비어 있었어요. 미웠어요. 지금은… 그 자리에 ' + ga(P) + ' 앉아 있다고 생각하면서 기타를 쳐요."'] });
    beats.push({ lines: ['"' + P + ', 고마워요. 그리고… 보고 싶어요."'] });
    beats.push({ q: true, lines: ['사람은 결국, 무엇으로 기억될까.', '내가 한 일일까, 함께한 시간일까.'] });

    // 3부. 그 후
    beats.push({ title: true, lines: ['그 후'] });
    beats.push({ lines: ['1년 뒤.', st.ev.e2 === '알림'
      ? '어머니는 여전히 아침마다 휴대폰을 본다. 이제 전화가 오지 않는다는 걸 알면서도.'
      : '어머니는 마지막 한 달을 떠올릴 때마다 말을 잇지 못한다. "왜 나한테 말 안 했니."'] });
    beats.push({ lines: [st.ev.e3 === '그냥 둠'
      ? FRIEND + '는 장례가 끝난 뒤에야 소식을 들었다. 보내지 못한 "잘 지내?"가 끝내 남았다.'
      : FRIEND + '는 해마다 기일이면 떡볶이를 사 들고 온다.'] });
    beats.push({ lines: ['10년 뒤.', st.ev.e1 === '공연'
      ? DAUGHTER + '는 작은 공연장에서 기타를 친다. 맨 앞줄 한 자리는 늘 비워 둔다.'
      : DAUGHTER + '는 여전히 기타를 친다. 공연이 끝나면 객석의 빈자리를 한 번 바라본다.'] });
    var rec = tops.map(function (t) { return t.a.name + ' ' + t.n + '번'; });
    rec.push('이룬 버킷리스트 ' + doneN + '개 / 3');
    beats.push({ lines: ['— ' + N + '의 ' + CARD[st.card].ko + ' —'].concat(rec) });
    beats.push({ q: true, lines: ['끝이 있다는 건,', '저주일까. 선물일까.'] });

    // 4부. 되감기와 낯선 사람
    beats.push({ lines: ['……잠깐.'] });
    beats.push({ lines: ['시간을 조금 되감아 보자.', '추도사가 읽히기 전, 마지막 밤으로.'] });
    beats.push({ img: 'img08.jpg', lines: [(st.treat ? '병실' : '안방') + ' 창밖으로 비가 내렸다. 모두 잠든 새벽이었다.'] });
    beats.push({ lines: ['문이 열렸다. 처음 보는 사람이었다.', '얼굴은 그림자에 가려 보이지 않았다.'] });
    beats.push({ lines: ['"늦은 시간에 죄송합니다. 이걸 드리려고 왔습니다."', '작은 유리병 안에서, 알약 하나가 희미하게 빛났다.'] });
    beats.push({ q: true, lines: ['"이걸 드시면, 죽지 않습니다."', '"단, 오직 당신만."'] });
    beats.push({ lines: ['"대답은… 다음에 듣겠습니다."'] });
    beats.push({ title: true, lines: ['세 번째 이야기 「영원히」에서 계속'] });

    UI.credits(beats, function () { reflect(code, title, bs); });
  }

  function reflect(code, title, bs) {
    // 둘러보기 모드는 기록하지 않으므로 기존 안내 화면 사용
    if (ctx.explore) {
      Reflect.show({ ctx: ctx, ep: 2, topTitle: TITLE, ending: { code: code, title: title, paras: eulogyBody(code), chips: [] }, questions: [], fields: {} });
      return;
    }
    realNote(code, title, bs);
  }

  // ───── 나의 진짜 수첩 (게임 속 나 → 현실의 나) ─────
  function realNote(code, title, bs) {
    UI.setTop(TITLE, '마지막 장 · 나의 진짜 수첩');
    var s = UI.clear();
    var c = st.counts;
    var rank = [], bucket = [], scale = 0, pickedBucket = -1;

    var wrap = UI.el('section', 'real-note');
    wrap.appendChild(UI.el('div', 'rn-head',
      '<span class="stamp">' + code + '</span><div><h1 class="rn-title">이제, 게임 밖의 내 수첩을 펼쳐 보자</h1>' +
      '<p class="pen rn-sub">카드는 없지만, 나에게도 남은 시간이 있다.</p></div>'));
    var grid = UI.el('div', 'rn-grid');

    // ── 1. 나의 우선순위
    var s1 = UI.el('div', 'rn-card');
    s1.appendChild(UI.el('h2', 'rn-h', '1. 나의 우선순위'));
    var game = UI.el('div', 'rn-block');
    game.appendChild(UI.el('p', 'rn-label', '① 게임 속 나 <span>— ' + st.slots.length + '번의 일정 중 마음을 쏟은 곳</span>'));
    CATS.forEach(function (k) {
      game.appendChild(UI.el('div', 'rn-bar', '<span>' + k + '</span><span class="bar"><span style="width:' + Math.round(c[k] * 100 / st.slots.length) + '%"></span></span><span class="num">' + c[k] + '번</span>'));
    });
    s1.appendChild(game);

    var real = UI.el('div', 'rn-block');
    real.appendChild(UI.el('p', 'rn-label', '② 현실의 나 <span>— 소중한 순서대로 눌러요 (다시 누르면 취소)</span>'));
    var rankRow = UI.el('div', 'rank-row');
    var compare = UI.el('p', 'pen rn-compare');
    var gameTop = CATS.slice().sort(function (a, b) { return c[b] - c[a]; })[0];
    CATS.forEach(function (k) {
      var b = UI.el('button', 'rank-btn', k);
      b.type = 'button';
      b.addEventListener('click', function () {
        var i = rank.indexOf(k);
        if (i >= 0) rank.splice(i, 1); else rank.push(k);
        Array.prototype.forEach.call(rankRow.children, function (x) {
          var n = rank.indexOf(x.dataset.k);
          x.classList.toggle('on', n >= 0);
          x.dataset.n = n >= 0 ? n + 1 : '';
        });
        compare.textContent = !rank.length ? '' : (rank[0] === gameTop
          ? '게임에서는 \'' + gameTop + '\'에 가장 많이 썼고, 현실의 1순위도 \'' + rank[0] + '\'이다.'
          : '게임에서는 \'' + gameTop + '\'에 가장 많이 썼는데, 현실의 1순위는 \'' + rank[0] + '\'이다.');
      });
      b.dataset.k = k;
      rankRow.appendChild(b);
    });
    real.appendChild(rankRow);
    real.appendChild(compare);
    s1.appendChild(real);

    var bk = UI.el('div', 'rn-block');
    bk.appendChild(UI.el('p', 'rn-label', '③ 진짜 버킷리스트 <span>— 5개 (더 쓰고 싶으면 10개까지)</span>'));
    var list = UI.el('div', 'rn-list');
    var more = UI.el('button', 'rn-more', '+ 하나 더 쓰기');
    more.type = 'button';
    function addRow() {
      var r = { text: '', cat: '' };
      bucket.push(r);
      var row = UI.el('div', 'rn-row');
      var inp = document.createElement('input');
      inp.className = 'line-input rn-input';
      inp.maxLength = 40;
      inp.placeholder = '예: 해 보고 싶은 일';
      inp.setAttribute('aria-label', '버킷리스트 ' + bucket.length);
      inp.addEventListener('input', function () { r.text = inp.value.trim(); drawChips(); });
      var cats = UI.el('div', 'cat-pick');
      CATS.forEach(function (k) {
        var cb = UI.el('button', 'cat-btn', k);
        cb.type = 'button';
        cb.addEventListener('click', function () {
          r.cat = k;
          Array.prototype.forEach.call(cats.children, function (x) { x.classList.toggle('on', x === cb); });
        });
        cats.appendChild(cb);
      });
      row.appendChild(UI.el('span', 'pen bucket-num', bucket.length + '.'));
      row.appendChild(inp);
      row.appendChild(cats);
      list.appendChild(row);
      if (bucket.length >= 10) more.hidden = true;
    }
    for (var i = 0; i < 5; i++) addRow();
    more.addEventListener('click', function () { addRow(); list.lastChild.querySelector('input').focus(); });
    bk.appendChild(list);
    bk.appendChild(more);
    s1.appendChild(bk);

    var th = UI.el('div', 'rn-block');
    th.appendChild(UI.el('p', 'rn-label', '④ 게임 속 나와 현실의 나는 무엇이 같고, 무엇이 달랐나?'));
    var thought = document.createElement('textarea');
    thought.className = 'lined rn-thought';
    thought.maxLength = 500;
    thought.setAttribute('aria-label', '게임 속 나와 현실의 나 비교');
    var thCnt = UI.el('p', 'q-count', '0자 / 30자 이상');
    thought.addEventListener('input', function () {
      var n = thought.value.trim().length;
      thCnt.textContent = n + '자 / 30자 이상';
      thCnt.classList.toggle('ok', n >= 30);
    });
    th.appendChild(thought);
    th.appendChild(thCnt);
    s1.appendChild(th);

    // ── 2. 지금의 행복
    var s2 = UI.el('div', 'rn-card');
    s2.appendChild(UI.el('h2', 'rn-h', '2. 지금의 행복'));
    var hp = UI.el('div', 'rn-block');
    hp.appendChild(UI.el('p', 'rn-label', '① 요즘 나는 얼마나 행복한가?'));
    var sc = UI.el('div', 'scale-row');
    for (var n = 1; n <= 10; n++) {
      (function (n) {
        var b = UI.el('button', 'scale-btn', String(n));
        b.type = 'button';
        b.setAttribute('aria-label', '행복 ' + n + '점');
        b.addEventListener('click', function () {
          scale = n;
          Array.prototype.forEach.call(sc.children, function (x) { x.classList.toggle('on', x === b); });
        });
        sc.appendChild(b);
      })(n);
    }
    hp.appendChild(sc);
    hp.appendChild(UI.el('div', 'scale-ends', '<span>전혀 행복하지 않다</span><span>아주 행복하다</span>'));
    hp.appendChild(UI.el('p', 'note', '이 점수는 선생님만 볼 수 있어요.'));
    s2.appendChild(hp);

    var ty = UI.el('div', 'rn-block');
    ty.appendChild(UI.el('p', 'rn-label', '② 요즘 감사한 것 세 가지'));
    var thanks = [];
    for (var t = 0; t < 3; t++) {
      var row = UI.el('div', 'rn-row simple');
      var inp = document.createElement('input');
      inp.className = 'line-input rn-input';
      inp.maxLength = 50;
      inp.setAttribute('aria-label', '감사한 것 ' + (t + 1));
      row.appendChild(UI.el('span', 'pen bucket-num', (t + 1) + '.'));
      row.appendChild(inp);
      ty.appendChild(row);
      thanks.push(inp);
    }
    s2.appendChild(ty);

    var td = UI.el('div', 'rn-block');
    td.appendChild(UI.el('p', 'rn-label', '③ 오늘 당장 할 수 있는 버킷리스트 하나'));
    td.appendChild(UI.el('p', 'note', '위에 쓴 버킷리스트에서 하나를 고르거나, 새로 써도 돼요.'));
    var chips = UI.el('div', 'rn-chips');
    td.appendChild(chips);
    var todo = {};
    ['무엇을', '언제', '누구와'].forEach(function (k) {
      var row = UI.el('div', 'rn-row todo');
      var inp = document.createElement('input');
      inp.className = 'line-input rn-input';
      inp.maxLength = 50;
      inp.setAttribute('aria-label', '오늘 할 일 ' + k);
      row.appendChild(UI.el('span', 'todo-k', k));
      row.appendChild(inp);
      td.appendChild(row);
      todo[k] = inp;
    });
    function drawChips() {
      chips.innerHTML = '';
      bucket.forEach(function (r, i) {
        if (r.text.length < 2) return;
        var b = UI.el('button', 'rn-chip' + (pickedBucket === i ? ' on' : ''), UI.esc(r.text));
        b.type = 'button';
        b.addEventListener('click', function () {
          pickedBucket = i;
          if (!todo['무엇을'].value.trim()) todo['무엇을'].value = r.text;
          drawChips();
        });
        chips.appendChild(b);
      });
      var nb = UI.el('button', 'rn-chip new', '+ 새로 쓰기');
      nb.type = 'button';
      nb.addEventListener('click', function () { pickedBucket = -1; todo['무엇을'].value = ''; todo['무엇을'].focus(); drawChips(); });
      chips.appendChild(nb);
    }
    drawChips();
    s2.appendChild(td);

    var msg = UI.el('div', 'form-msg');
    msg.setAttribute('role', 'alert');
    var go = UI.el('button', 'btn-main', '수첩 덮기 · 제출');
    go.type = 'button';
    s2.appendChild(msg);
    s2.appendChild(go);

    grid.appendChild(s1);
    grid.appendChild(s2);
    wrap.appendChild(grid);
    s.appendChild(wrap);

    function fail(text, el) {
      msg.textContent = text;
      if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); if (el.focus) el.focus(); }
    }
    go.addEventListener('click', function () {
      if (rank.length < 4) return fail('② 현실의 나: 네 영역을 모두 눌러 순위를 정해 주세요.', rankRow);
      var filled = bucket.filter(function (r) { return r.text.length >= 2; });
      if (filled.length < 5) {
        var empty = list.querySelectorAll('input')[bucket.findIndex(function (r) { return r.text.length < 2; })];
        return fail('③ 버킷리스트를 5개 이상 써 주세요. (지금 ' + filled.length + '개)', empty);
      }
      var noCat = bucket.findIndex(function (r) { return r.text.length >= 2 && !r.cat; });
      if (noCat >= 0) return fail('③ ' + (noCat + 1) + '번 버킷리스트의 영역(가족·일·꿈·휴식)을 골라 주세요.', list.children[noCat]);
      if (thought.value.trim().length < 30) return fail('④ 게임 속 나와 현실의 나 비교를 30자 이상 써 주세요.', thought);
      if (!scale) return fail('2-① 요즘의 행복 점수를 골라 주세요.', sc);
      for (var i = 0; i < 3; i++) if (thanks[i].value.trim().length < 2) return fail('2-② 감사한 것 세 가지를 모두 써 주세요.', thanks[i]);
      var keys = ['무엇을', '언제', '누구와'];
      for (var j = 0; j < 3; j++) if (todo[keys[j]].value.trim().length < 1) return fail('2-③ 오늘 할 일의 \'' + keys[j] + '\'를 써 주세요.', todo[keys[j]]);
      msg.textContent = '';

      var c2 = st.counts;
      var fields = {
        '결말': code + ' ' + title,
        '카드': st.card,
        '치료': (st.treat ? '받음' : '안 받음') + ' / 고백:' + st.tell,
        '가족': String(c2.가족), '일': String(c2.일), '꿈': String(c2.꿈), '나': String(c2.휴식),
        '버킷리스트': bs.map(function (b) { return b.text + '[' + b.cat + ']' + (b.done ? '✓' : '✗'); }).join(' | '),
        '사건1': st.ev.e1 || '', '사건2': st.ev.e2 || '', '사건3': st.ev.e3 || '',
        // 소감 칸 두 개에 정리해서 기록 (GAS 수정 없음)
        '소감1': '현실 순위: ' + rank.join('>') +
          ' | 진짜 버킷: ' + filled.map(function (r, i) { return (i + 1) + ') ' + r.text + '[' + (r.cat || '-') + ']'; }).join(' ') +
          ' | 생각: ' + thought.value.trim(),
        '소감2': '행복: ' + scale + '/10' +
          ' | 감사: ' + thanks.map(function (x) { return x.value.trim(); }).join('; ') +
          ' | 오늘 할 일: ' + keys.map(function (k) { return k + '=' + todo[k].value.trim(); }).join('; ')
      };
      Reflect.send({ ctx: ctx, ep: 2, topTitle: TITLE, closing: '그 약병은, 아직 머리맡에 놓여 있다.' }, fields, go, msg);
    });
  }

  return { start: start };
})();

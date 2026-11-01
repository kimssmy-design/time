// 로그인 → 본인 확인 → 주인공 선택 → 회차 목록 → 회차 시작
var App = (function () {
  var S = {}; // 로그인한 학생 상태

  var EP_INFO = {
    1: { title: '다시 만나요', sub: '사랑하는 사람을 다시 만날 수 있다면', theme: 'album' },
    2: { title: '남은 시간', sub: '나에게 남은 시간이 정해져 있다면', theme: 'notebook' },
    3: { title: '영원히', sub: '죽지 않을 수 있다면', theme: 'film' }
  };

  function episodeModule(n) {
    if (n === 1) return window.Ep1;
    if (n === 2) return window.Ep2;
    if (n === 3) return window.Ep3;
    return null;
  }

  // ───── 1. 학번 입력 ─────
  function showLogin() {
    UI.setTheme('album');
    UI.setTop('', '');
    var s = UI.clear();
    var box = UI.el('section', 'scene login-screen');
    box.appendChild(UI.photo('img01.jpg', '할머니와 나 (표지)', '할머니와 나, 어느 여름날'));
    var t = UI.el('div', 'scene-text login');
    t.innerHTML =
      '<h1 class="big-title">삶과 죽음</h1>' +
      '<p class="para sub">세 번의 이야기, 한 사람의 인생</p>' +
      '<p class="how"><b>학번</b>을 입력하고 <b>확인</b>을 눌러요.</p>' +
      '<label class="field-label" for="sid">학번</label>' +
      '<input id="sid" class="line-input" inputmode="numeric" maxlength="5" placeholder="예: 30101" autocomplete="off">' +
      '<div id="loginMsg" class="form-msg" role="alert"></div>' +
      '<div class="actions"><button id="loginBtn" class="btn-main" type="button">확인</button></div>';
    box.appendChild(t);
    s.appendChild(box);
    var input = document.getElementById('sid');
    var btn = document.getElementById('loginBtn');
    function go() {
      var id = input.value.trim();
      if (!/^\d{5}$/.test(id)) { document.getElementById('loginMsg').textContent = '학번 다섯 자리를 입력해 주세요.'; return; }
      btn.disabled = true;
      UI.loading(true, '학번을 확인하고 있어요');
      API.login(id).then(function (r) {
        UI.loading(false);
        btn.disabled = false;
        if (!r.ok) { document.getElementById('loginMsg').textContent = r.msg; return; }
        S = r; S.id = id;
        showConfirm();
      });
    }
    btn.addEventListener('click', go);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    input.focus();
  }

  // ───── 2. 본인 확인 ─────
  function showConfirm() {
    UI.scene({
      img: 'img01.jpg', imgLabel: '할머니와 나 (표지)',
      title: '이 학생이 맞나요?',
      paras: ['<span class="pen big-pen">3학년 ' + UI.esc(S.cls) + ' ' + UI.esc(S.name) + '</span>'],
      choices: [
        { label: '네, 저예요', onPick: function () { if (S.gender) showHub(); else showGender(); } },
        { label: '아니에요, 다시 입력할게요', onPick: showLogin }
      ]
    });
  }

  // ───── 3. 주인공 고르기 (한 번 정하면 3회차까지 고정) ─────
  function showGender() {
    var picked = '';
    var wrap = UI.el('div', 'pair');
    ['철수', '영희'].forEach(function (g) {
      var b = UI.el('button', 'slip slip-center', g);
      b.type = 'button';
      b.addEventListener('click', function () {
        picked = g;
        Array.prototype.forEach.call(wrap.children, function (c) { c.classList.toggle('on', c === b); });
        done.disabled = false;
      });
      wrap.appendChild(b);
    });
    var done = UI.el('button', 'btn-main', '이 주인공으로 시작하기');
    done.type = 'button';
    done.disabled = true;
    done.addEventListener('click', function () {
      done.disabled = true;
      UI.loading(true, '주인공을 정하고 있어요');
      API.gender(S.id, picked).then(function (r) {
        UI.loading(false);
        if (!r.ok) { UI.toast(r.msg); done.disabled = false; return; }
        S.gender = r.gender;
        showHub();
      });
    });
    var extra = UI.el('div', 'stack');
    extra.appendChild(wrap);
    extra.appendChild(done);
    UI.scene({
      img: 'img01.jpg', imgLabel: '할머니와 나 (표지)',
      title: '이야기의 주인공',
      paras: ['세 번의 수업 동안 여러분은 한 사람이 되어 그 사람의 인생을 따라가요.', '주인공은 한 번 고르면 바꿀 수 없어요.'],
      extra: extra
    });
  }

  // ───── 4. 회차 목록 ─────
  function showHub() {
    UI.setGender(S.gender); // 철수면 남자 버전 그림(_m)을 먼저 보여 줌
    UI.setTheme('album');
    UI.setTop('삶과 죽음', S.name + ' · 주인공 ' + S.gender);
    var s = UI.clear();
    var box = UI.el('section', 'hub');
    box.appendChild(UI.el('h1', 'big-title', S.gender + '의 이야기'));
    var list = UI.el('div', 'hub-list');
    [1, 2, 3].forEach(function (n) {
      var info = EP_INFO[n];
      var key = 'ep' + n;
      var isOpen = !!S.open[key];
      var isDone = !!S.done[key];
      var mod = episodeModule(n);
      var label, enabled = false, explore = false;
      if (!mod) label = '준비 중이에요';
      else if (isDone && S.open.explore) { label = '다른 길 둘러보기'; enabled = true; explore = true; }
      else if (isDone) label = '완료했어요';
      else if (isOpen) { label = '시작하기'; enabled = true; }
      else label = '아직 열리지 않았어요';

      var card = UI.el('div', 'hub-card' + (isDone ? ' done' : ''));
      card.innerHTML =
        '<span class="hub-num">' + ['첫', '두', '세'][n - 1] + ' 번째 이야기</span>' +
        '<h2>' + info.title + '</h2><p>' + info.sub + '</p>' +
        (isDone ? '<span class="stamp">완료</span>' : '');
      var b = UI.el('button', enabled ? 'slip slip-center' : 'slip slip-center off', label);
      b.type = 'button';
      b.disabled = !enabled;
      b.addEventListener('click', function () { startEpisode(n, explore); });
      card.appendChild(b);
      list.appendChild(card);
    });
    box.appendChild(list);
    var re = UI.el('button', 'text-btn', '선생님이 열어 주셨다면 눌러서 새로고침');
    re.type = 'button';
    re.addEventListener('click', refresh);
    box.appendChild(re);
    s.appendChild(box);
  }

  function refresh() {
    UI.loading(true, '열린 이야기를 확인하고 있어요');
    API.login(S.id).then(function (r) {
      UI.loading(false);
      if (!r.ok) { UI.toast(r.msg); return; }
      var id = S.id; S = r; S.id = id;
      showHub();
    });
  }

  // ───── 5. 회차 시작 ─────
  function startEpisode(n, explore) {
    var mod = episodeModule(n);
    UI.setTheme(EP_INFO[n].theme);
    mod.start({
      id: S.id,
      name: S.gender,          // 주인공 이름 (철수/영희)
      card: S.card,
      prev: S.prev || {},
      explore: explore,        // true면 기록 없이 둘러보기
      setCard: function (c) { S.card = c; },
      onFinish: function (submitted) {
        if (submitted) S.done['ep' + n] = true;
        showHub();
      }
    });
  }

  function init() {
    UI.init();
    showLogin();
  }

  return { init: init, epInfo: EP_INFO };
})();

document.addEventListener('DOMContentLoaded', App.init);

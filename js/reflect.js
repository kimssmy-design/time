// 결말 보여 주기 + 소감 쓰기 + 제출 (회차 공통)
var Reflect = (function () {

  /**
   * o = { ctx, ep, topTitle, ending:{code,title,paras[],chips[]}, questions[], fields{}, closing }
   */
  function show(o) {
    UI.setTop(o.topTitle, '마지막 장');
    var s = UI.clear();
    var box = UI.el('section', 'ending');

    // 왼쪽: 결말 이야기
    var paper = UI.el('div', 'ending-paper');
    paper.innerHTML =
      '<span class="stamp big"><small>결말</small>' + UI.esc(o.ending.code) + '</span>' +
      '<h2 class="scene-title">' + o.ending.title + '</h2>' +
      o.ending.paras.map(function (p) { return '<p class="para">' + p + '</p>'; }).join('');
    if (o.ending.chips && o.ending.chips.length) {
      var cw = UI.el('div', 'chips-wrap');
      cw.innerHTML = '<span class="pen">내가 고른 것들</span><div class="chips">' +
        o.ending.chips.map(function (c) { return '<span class="chip">' + UI.esc(c) + '</span>'; }).join('') + '</div>';
      paper.appendChild(cw);
    }
    box.appendChild(paper);

    // 오른쪽: 소감
    var form = UI.el('div', 'ending-form');
    if (o.ctx.explore) {
      form.innerHTML = '<p class="para">둘러보기 중이라 이번 결말은 기록되지 않아요.</p>' +
        '<p class="pen big-pen">처음 고른 길이 나의 이야기예요.</p>';
      var back = UI.el('button', 'btn-main', '목록으로');
      back.type = 'button';
      back.addEventListener('click', function () { o.ctx.onFinish(false); });
      form.appendChild(back);
    } else {
      var MIN = o.minLen || 50;
      o.questions.forEach(function (item, i) {
        // 질문은 '문장' 또는 { q: 질문, hint: 생각 도움말 }
        var q = typeof item === 'string' ? item : item.q;
        var hint = typeof item === 'string' ? '' : (item.hint || '');
        var f = UI.el('div', 'q');
        f.innerHTML = '<label class="q-label" for="rq' + i + '">' + (i + 1) + '. ' + q + '</label>' +
          (hint ? '<p class="q-hint">' + hint + '</p>' : '') +
          '<textarea id="rq' + i + '" class="lined" maxlength="800"></textarea>' +
          '<p class="q-count" id="rc' + i + '">0자 / ' + MIN + '자 이상</p>';
        form.appendChild(f);
        var ta = f.querySelector('textarea'), cnt = f.querySelector('.q-count');
        ta.addEventListener('input', function () {
          var n = ta.value.trim().length;
          cnt.textContent = n + '자 / ' + MIN + '자 이상';
          cnt.classList.toggle('ok', n >= MIN);
        });
      });
      form.appendChild(UI.el('p', 'note', '소감은 이름 없이 화면에 소개될 수 있어요.'));
      var msg = UI.el('div', 'form-msg');
      msg.setAttribute('role', 'alert');
      form.appendChild(msg);
      var btn = UI.el('button', 'btn-main', o.submitLabel || '제출하기');
      btn.type = 'button';
      btn.addEventListener('click', function () {
        var answers = [];
        for (var i = 0; i < o.questions.length; i++) {
          var v = document.getElementById('rq' + i).value.trim();
          if (v.length < MIN) { msg.textContent = (i + 1) + '번 답을 조금 더 써 주세요. 지금 ' + v.length + '자, ' + MIN + '자 이상 필요해요.'; document.getElementById('rq' + i).focus(); return; }
          answers.push(v);
        }
        var fields = Object.assign({}, o.fields);
        answers.forEach(function (a, i) { fields['소감' + (i + 1)] = a; });
        btn.disabled = true;
        UI.loading(true, '이야기를 저장하고 있어요');
        API.submit(o.ctx.id, o.ep, fields).then(function (r) {
          UI.loading(false);
          if (r.ok || /이미 제출/.test(r.msg || '')) { noRetry(o); return; }
          btn.disabled = false;
          msg.textContent = r.msg;
        });
      });
      form.appendChild(btn);
    }
    box.appendChild(form);
    s.appendChild(box);
  }

  // 제출 직후: 다시 하기 버튼이 없다는 것을 보여 주는 화면
  function noRetry(o) {
    UI.setTop(o.topTitle, '');
    var s = UI.clear();
    var box = UI.el('section', 'closing');
    box.innerHTML = '<p class="closing-text">현실의 삶에는<br>다시 하기 버튼이 없습니다.</p>' +
      (o.closing ? '<p class="pen big-pen">' + o.closing + '</p>' : '');
    var b = UI.el('button', 'btn-main', '목록으로');
    b.type = 'button';
    b.addEventListener('click', function () { o.ctx.onFinish(true); });
    box.appendChild(b);
    s.appendChild(box);
  }

  // 다른 화면(예: 2회차 '나의 진짜 수첩')에서 만든 값을 제출하고 마무리 화면으로
  // o = { ctx, ep, topTitle, closing }, fields = 시트에 넣을 값, btn·msg = 제출 버튼과 안내 칸
  function send(o, fields, btn, msg) {
    btn.disabled = true;
    UI.loading(true, '이야기를 저장하고 있어요');
    API.submit(o.ctx.id, o.ep, fields).then(function (r) {
      UI.loading(false);
      if (r.ok || /이미 제출/.test(r.msg || '')) { noRetry(o); return; }
      btn.disabled = false;
      msg.textContent = r.msg;
    });
  }

  return { show: show, send: send };
})();

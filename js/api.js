// GAS 서버 통신 (text/plain 전송으로 CORS 사전요청을 피하고, 실패 시 자동 재시도)
var API = (function () {
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function once(payload) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 20000);
    return fetch(CONFIG.GAS_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      signal: ctrl.signal
    }).then(function (res) {
      clearTimeout(timer);
      return res.json();
    });
  }

  // 네트워크 오류·접속 몰림이면 최대 3번까지 다시 시도
  function call(action, data) {
    var payload = Object.assign({ action: action }, data || {});
    var tries = 0;
    function attempt() {
      tries++;
      return once(payload).then(function (r) {
        if (!r.ok && /몰렸|동시에/.test(r.msg || '') && tries < 3) {
          return wait(800 * tries + Math.random() * 600).then(attempt);
        }
        return r;
      }).catch(function () {
        if (tries < 3) return wait(800 * tries + Math.random() * 600).then(attempt);
        return { ok: false, msg: '인터넷 연결을 확인하고 다시 눌러 주세요.' };
      });
    }
    return attempt();
  }

  return {
    login: function (id) { return call('login', { id: id }); },
    gender: function (id, g) { return call('gender', { id: id, gender: g }); },
    card: function (id) { return call('card', { id: id }); },
    submit: function (id, ep, fields) { return call('submit', { id: id, ep: ep, fields: fields }); },
    dash: function (pin) { return call('dash', { pin: pin }); },
    setOpen: function (pin, target, key, value) { return call('setOpen', { pin: pin, target: target, key: key, value: value }); }
  };
})();

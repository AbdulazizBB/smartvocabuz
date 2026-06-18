/* ============================================================
   tracker.js — Online kuzatish va statistika sync
   ============================================================ */

const tracker = {
  _heartbeatTimer: null,
  _syncTimer:      null,
  _prevCorrect:    0,
  _prevWrong:      0,

  async _post(action, extra = {}) {
    if (!currentUser) return;
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userId:       currentUser.id,
          name:         currentUser.name,
          sessionId:    currentUser.sessionId,
          lang:         currentUser.lang || _lang || 'uz',
          xp:           typeof xp !== 'undefined' ? xp : 0,
          streak:       typeof streak !== 'undefined' ? streak : 0,
          totalCorrect: typeof totalCorrect !== 'undefined' ? totalCorrect : ld('totalCorrect', 0),
          totalWrong:   (ld('totalAnswered', 0)) - (ld('totalCorrect', 0)),
          ...extra
        })
      });
    } catch {}
  },

  async registerSession(user) {
    currentUser = user;
    await this._post('session_start');
  },

  async endSession(sessionId) {
    await this._post('session_end');
    this.stopHeartbeat();
  },

  startHeartbeat() {
    this.stopHeartbeat();
    this._heartbeatTimer = setInterval(() => this._post('heartbeat'), 30000);
    this._syncTimer      = setInterval(() => this.syncStats(), 60000);

    window.addEventListener('beforeunload', () => {
      if (!currentUser) return;
      try {
        navigator.sendBeacon('/api/track', JSON.stringify({
          action: 'session_end',
          userId: currentUser.id,
          sessionId: currentUser.sessionId,
          name: currentUser.name
        }));
      } catch {}
    });
  },

  stopHeartbeat() {
    if (this._heartbeatTimer) clearInterval(this._heartbeatTimer);
    if (this._syncTimer)      clearInterval(this._syncTimer);
    this._heartbeatTimer = null;
    this._syncTimer = null;
  },

  async syncStats() {
    await this._post('sync_stats');
  },

  async updateLang(l) {
    if (!currentUser) return;
    currentUser.lang = l;
    saveUser(currentUser);
    await this._post('update_lang', { lang: l });
  }
};

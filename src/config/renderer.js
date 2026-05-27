document.addEventListener('DOMContentLoaded', async () => {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('hidden');
    });
  });

  document.getElementById('close-btn').addEventListener('click', () => {
    if (window.configAPI) window.configAPI.close();
  });

  if (window.configAPI) {
    const state = await window.configAPI.getState();
    if (state.petSize !== undefined) document.getElementById('petSize').value = state.petSize;
    if (state.opacity !== undefined) document.getElementById('opacity').value = state.opacity * 100;
    if (state.soundEnabled !== undefined) document.getElementById('soundEnabled').checked = state.soundEnabled;
    if (state.soundVolume !== undefined) document.getElementById('soundVolume').value = state.soundVolume * 100;
    if (state.followMouse !== undefined) document.getElementById('followMouse').checked = state.followMouse;
    if (state.randomEvents !== undefined) document.getElementById('randomEvents').checked = state.randomEvents;
    if (state.walkingEnabled !== undefined) document.getElementById('walkingEnabled').checked = state.walkingEnabled;
    if (state.autoStart !== undefined) document.getElementById('autoStart').checked = state.autoStart;

    document.querySelectorAll('.character-card').forEach(card => {
      if (card.dataset.char === state.currentCharacter) card.classList.add('selected');
      card.addEventListener('click', () => {
        document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        window.configAPI.updateSetting('currentCharacter', card.dataset.char);
      });
    });

    document.querySelectorAll('.costume-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.costume-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
      });
    });
  }

  document.getElementById('petSize').addEventListener('input', (e) => {
    if (window.configAPI) window.configAPI.updateSetting('petSize', parseInt(e.target.value));
  });
  document.getElementById('opacity').addEventListener('input', (e) => {
    if (window.configAPI) window.configAPI.updateSetting('opacity', parseInt(e.target.value) / 100);
  });
  document.getElementById('soundVolume').addEventListener('input', (e) => {
    if (window.configAPI) window.configAPI.updateSetting('soundVolume', parseInt(e.target.value) / 100);
  });

  ['soundEnabled', 'followMouse', 'randomEvents', 'walkingEnabled', 'autoStart'].forEach(key => {
    document.getElementById(key).addEventListener('change', (e) => {
      if (window.configAPI) window.configAPI.updateSetting(key, e.target.checked);
    });
  });
});

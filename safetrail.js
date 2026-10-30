(() => {
  const STORAGE_KEY = 'atlas-safetrail-demo-v1';
  const MAX_VISIBLE_HISTORY = 20;
  const MAX_NOTIFICATIONS = 100;
  const routes = {
    khumbu: {
      name: 'Khumbu · Nepal',
      svgPath: 'M90 278 C180 230 170 150 300 172 S430 98 530 74',
      points: [
        { x: 90, y: 278, lat: 27.9881, lon: 86.9250 },
        { x: 180, y: 230, lat: 27.9910, lon: 86.9212 },
        { x: 170, y: 150, lat: 27.9941, lon: 86.9174 },
        { x: 300, y: 172, lat: 27.9972, lon: 86.9131 },
        { x: 430, y: 98, lat: 28.0004, lon: 86.9098 },
        { x: 530, y: 74, lat: 28.0030, lon: 86.9052 },
      ],
    },
    patagonia: {
      name: 'Patagonia · Chile',
      svgPath: 'M84 82 C150 130 175 235 275 215 S405 285 520 260',
      points: [
        { x: 84, y: 82, lat: -50.9423, lon: -73.4068 },
        { x: 150, y: 130, lat: -50.9451, lon: -73.4017 },
        { x: 175, y: 235, lat: -50.9492, lon: -73.3974 },
        { x: 275, y: 215, lat: -50.9524, lon: -73.3911 },
        { x: 405, y: 285, lat: -50.9568, lon: -73.3863 },
        { x: 520, y: 260, lat: -50.9601, lon: -73.3810 },
      ],
    },
    aconcagua: {
      name: 'Aconcagua · Argentina',
      svgPath: 'M70 260 C180 260 160 170 280 175 S390 95 550 102',
      points: [
        { x: 70, y: 260, lat: -32.6532, lon: -70.0118 },
        { x: 180, y: 260, lat: -32.6501, lon: -70.0063 },
        { x: 160, y: 170, lat: -32.6466, lon: -70.0007 },
        { x: 280, y: 175, lat: -32.6421, lon: -69.9962 },
        { x: 390, y: 95, lat: -32.6377, lon: -69.9910 },
        { x: 550, y: 102, lat: -32.6331, lon: -69.9855 },
      ],
    },
    lofoten: {
      name: 'Lofoten Islands · Norway',
      svgPath: 'M72 120 C140 88 210 160 280 135 S400 210 540 180',
      points: [
        { x: 72, y: 120, lat: 68.2098, lon: 13.6102 },
        { x: 140, y: 88, lat: 68.2130, lon: 13.6171 },
        { x: 210, y: 160, lat: 68.2164, lon: 13.6239 },
        { x: 280, y: 135, lat: 68.2201, lon: 13.6314 },
        { x: 400, y: 210, lat: 68.2243, lon: 13.6390 },
        { x: 540, y: 180, lat: 68.2282, lon: 13.6468 },
      ],
    },
  };

  const sampleContacts = [
    { id: 'sample-contact-family', name: 'Alex Morgan', relationship: 'Family', email: '', receivesUpdates: true, sample: true },
    { id: 'sample-contact-friend', name: 'Sam Rivera', relationship: 'Friend', email: '', receivesUpdates: true, sample: true },
  ];

  function defaultState() {
    return {
      contacts: sampleContacts.map((contact) => ({ ...contact })),
      notifications: [],
      history: [],
      pending: [],
      networkMode: 'online',
      intervalMinutes: 5,
      destination: 'khumbu',
      hikerName: 'Atlas traveler',
      session: { status: 'not-started', startedAt: null, step: 0 },
      lastSyncedAt: null,
      checkin: { deadline: null, overdue: false },
    };
  }

  function loadState() {
    const fallback = defaultState();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return fallback;
      const contacts = Array.isArray(saved.contacts) ? saved.contacts
        .filter((contact) => contact && typeof contact.id === 'string' && typeof contact.name === 'string')
        .map((contact) => ({
          id: contact.id,
          name: contact.name.slice(0, 50),
          relationship: typeof contact.relationship === 'string' ? contact.relationship : 'Other',
          email: typeof contact.email === 'string' ? contact.email.slice(0, 100) : '',
          receivesUpdates: contact.receivesUpdates === true,
          sample: contact.sample === true,
        })) : fallback.contacts;
      const history = Array.isArray(saved.history) ? saved.history.filter((record) => (
        record && typeof record.id === 'string' && Number.isFinite(record.lat) && Number.isFinite(record.lon)
        && typeof record.recordedAt === 'string' && Array.isArray(record.recipientIds)
      )) : [];
      const validIds = new Set(history.map((record) => record.id));
      const pending = Array.isArray(saved.pending) ? saved.pending.filter((record) => validIds.has(record.id)) : [];
      const notifications = Array.isArray(saved.notifications) ? saved.notifications
        .filter((notice) => notice && typeof notice.id === 'string' && typeof notice.title === 'string')
        .slice(0, MAX_NOTIFICATIONS) : [];
      const savedSession = saved.session && typeof saved.session === 'object' ? saved.session : {};
      const statuses = ['not-started', 'active', 'paused', 'ended'];
      const interval = Number(saved.intervalMinutes);
      const destination = routes[saved.destination] ? saved.destination : fallback.destination;
      return {
        contacts,
        notifications,
        history,
        pending,
        networkMode: saved.networkMode === 'offline' ? 'offline' : 'online',
        intervalMinutes: [1, 5, 15, 30].includes(interval) ? interval : 5,
        destination,
        hikerName: typeof saved.hikerName === 'string' && saved.hikerName.trim() ? saved.hikerName.trim().slice(0, 50) : 'Atlas traveler',
        session: {
          status: statuses.includes(savedSession.status) ? savedSession.status : 'not-started',
          startedAt: typeof savedSession.startedAt === 'string' ? savedSession.startedAt : null,
          step: Number.isInteger(savedSession.step) && savedSession.step >= 0 ? savedSession.step : 0,
        },
        lastSyncedAt: typeof saved.lastSyncedAt === 'string' ? saved.lastSyncedAt : null,
        checkin: {
          deadline: Number.isFinite(saved.checkin?.deadline) ? saved.checkin.deadline : null,
          overdue: saved.checkin?.overdue === true,
        },
      };
    } catch {
      return fallback;
    }
  }

  const state = loadState();
  const $ = (selector) => document.querySelector(selector);
  const sessionStatus = $('#session-status');
  const sessionDot = $('#session-status-dot');
  const networkStatus = $('#network-status');
  const networkDot = $('#network-status-dot');
  const networkToggle = $('#toggle-network');
  const sessionMessage = $('#safetrail-message');
  const destinationSelect = $('#safetrail-destination');
  const updateInterval = $('#update-interval');
  const mapMarker = $('#map-marker');
  const mapRoute = $('#map-route');
  const mapRouteShadow = $('#map-route-shadow');
  const startButton = $('#start-session');
  const pauseButton = $('#toggle-session');
  const endButton = $('#end-session');
  const recordButton = $('#record-location');
  const checkinTimerKey = 'atlas-safetrail-checkin';
  let locationTimer = null;
  let checkinTimer = null;
  let syncTimer = null;
  let syncInProgress = false;
  let recordCounter = 0;
  let markerFrame = null;
  let selectedViewRecord = null;

  function persistState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      showMessage('Browser storage is unavailable or full. SafeTrail changes may not survive a refresh.', 'warning');
      return false;
    }
  }

  function showMessage(message, type = 'success') {
    sessionMessage.textContent = message;
    sessionMessage.className = `safetrail-feedback ${type}`;
    sessionMessage.hidden = !message;
  }

  function clearMessage() {
    sessionMessage.textContent = '';
    sessionMessage.hidden = true;
  }

  function formatTime(value) {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  }

  function formatCoordinate(value, isLatitude) {
    const direction = isLatitude ? (value < 0 ? 'S' : 'N') : (value < 0 ? 'W' : 'E');
    return `${Math.abs(value).toFixed(4)}° ${direction}`;
  }

  function currentRoute() {
    return routes[state.destination] || routes.khumbu;
  }

  function activeContacts() {
    return state.contacts.filter((contact) => contact.receivesUpdates);
  }

  function animateMarker(point) {
    const startX = Number(mapMarker.dataset.x || point.x);
    const startY = Number(mapMarker.dataset.y || point.y);
    mapMarker.dataset.x = String(point.x);
    mapMarker.dataset.y = String(point.y);
    if (markerFrame) window.cancelAnimationFrame(markerFrame);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof window.requestAnimationFrame !== 'function') {
      mapMarker.setAttribute('transform', `translate(${point.x} ${point.y})`);
      return;
    }
    const started = performance.now();
    const duration = 850;
    const move = (now) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - ((1 - progress) ** 3);
      const x = startX + ((point.x - startX) * eased);
      const y = startY + ((point.y - startY) * eased);
      mapMarker.setAttribute('transform', `translate(${x} ${y})`);
      if (progress < 1) markerFrame = window.requestAnimationFrame(move);
      else markerFrame = null;
    };
    markerFrame = window.requestAnimationFrame(move);
  }

  function renderRoute(animate = true) {
    const route = currentRoute();
    const mapPoints = route.points;
    const startingPoint = mapPoints[state.session.step % mapPoints.length];
    $('#map-destination-name').textContent = route.name;
    $('#map-title').textContent = `${route.name} demo route`;
    $('#map-description').textContent = `An illustrative route for ${route.name}; the marker is a simulated position and the map is not to scale.`;
    mapRoute.setAttribute('d', route.svgPath);
    mapRouteShadow.setAttribute('d', route.svgPath);
    $('.waypoint-start').setAttribute('transform', `translate(${mapPoints[0].x} ${mapPoints[0].y})`);
    const finish = mapPoints[mapPoints.length - 1];
    $('.waypoint-finish').setAttribute('transform', `translate(${finish.x} ${finish.y})`);
    if (!animate) {
      mapMarker.dataset.x = String(startingPoint.x);
      mapMarker.dataset.y = String(startingPoint.y);
      mapMarker.setAttribute('transform', `translate(${startingPoint.x} ${startingPoint.y})`);
    } else {
      animateMarker(startingPoint);
    }
    $('#current-latitude').textContent = formatCoordinate(startingPoint.lat, true);
    $('#current-longitude').textContent = formatCoordinate(startingPoint.lon, false);
    $('#map-coordinate-summary').textContent = `${formatCoordinate(startingPoint.lat, true)}, ${formatCoordinate(startingPoint.lon, false)}`;
  }

  function renderStatus() {
    const labels = { 'not-started': 'Not started', active: 'Active', paused: 'Paused', ended: 'Ended' };
    sessionStatus.textContent = labels[state.session.status];
    sessionDot.classList.toggle('is-active', state.session.status === 'active');
    sessionDot.classList.toggle('is-offline', state.session.status === 'paused' || state.session.status === 'ended');
    networkStatus.textContent = state.networkMode === 'online' ? 'Online' : 'Offline';
    networkDot.classList.toggle('is-active', state.networkMode === 'online');
    networkDot.classList.toggle('is-offline', state.networkMode === 'offline');
    networkToggle.setAttribute('aria-pressed', String(state.networkMode === 'offline'));
    networkToggle.textContent = state.networkMode === 'online' ? 'Simulate offline' : 'Return demo online';
    $('#offline-banner').hidden = state.networkMode !== 'offline';
    startButton.disabled = state.session.status === 'active' || state.session.status === 'paused';
    const startLabel = state.session.status === 'ended' ? 'Start a new session' : 'Start session';
    const startArrow = startButton.querySelector('span');
    startButton.textContent = `${startLabel} `;
    if (startArrow) startButton.append(startArrow);
    pauseButton.disabled = !['active', 'paused'].includes(state.session.status);
    pauseButton.textContent = state.session.status === 'paused' ? 'Resume session' : 'Pause session';
    endButton.disabled = !['active', 'paused'].includes(state.session.status);
    recordButton.disabled = state.session.status !== 'active';
    $('#set-checkin').disabled = state.session.status !== 'active';
    $('#im-safe').disabled = state.session.status !== 'active' || !state.checkin.deadline;
    $('#checkin-overdue').hidden = !state.checkin.overdue;
    const deadline = $('#checkin-deadline');
    deadline.textContent = state.checkin.deadline ? `Planned check-in: ${formatTime(state.checkin.deadline)}` : 'No check-in scheduled.';
  }

  function renderMetrics() {
    const latest = state.history[0];
    const latestForRoute = state.history.find((record) => record.destination === state.destination);
    const routeStart = currentRoute().points[0];
    const position = latestForRoute || routeStart;
    $('#current-latitude').textContent = formatCoordinate(position.lat, true);
    $('#current-longitude').textContent = formatCoordinate(position.lon, false);
    $('#last-recorded').textContent = latest ? formatTime(latest.recordedAt) : 'No location recorded';
    $('#last-synced').textContent = state.lastSyncedAt ? formatTime(state.lastSyncedAt) : 'No locations synced';
    $('#pending-count').textContent = String(state.pending.length);
    $('#delivery-count').textContent = String(state.history.reduce((total, record) => total + (record.deliveryContactIds?.length || 0), 0));
    $('#map-coordinate-summary').textContent = `${formatCoordinate(position.lat, true)}, ${formatCoordinate(position.lon, false)}`;
    $('#map-timestamp').textContent = latestForRoute ? formatTime(latestForRoute.recordedAt) : 'Waiting for a location on this route';
  }

  function renderHistory() {
    const container = $('#location-history');
    container.replaceChildren();
    $('#history-count').textContent = `${state.history.length} ${state.history.length === 1 ? 'update' : 'updates'}`;
    if (!state.history.length) {
      container.append(makeTextElement('p', 'safetrail-empty', 'No demo locations yet. Start a session and record a sample coordinate.'));
      return;
    }
    state.history.slice(0, MAX_VISIBLE_HISTORY).forEach((record) => {
      const row = document.createElement('article');
      row.className = 'history-record';
      const copy = document.createElement('div');
      copy.append(makeTextElement('strong', '', `${formatCoordinate(record.lat, true)}, ${formatCoordinate(record.lon, false)}`));
      copy.append(makeTextElement('span', '', `${routes[record.destination]?.name || 'Expedition'} · SIMULATED`));
      copy.append(makeTextElement('time', '', formatTime(record.recordedAt)));
      const status = makeTextElement('span', 'history-state', record.statusLabel);
      row.append(copy, status);
      container.append(row);
    });
  }

  function makeTextElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  }

  function renderNotifications() {
    const list = $('#notification-list');
    list.replaceChildren();
    const unread = state.notifications.filter((notice) => !notice.read).length;
    $('#unread-count').textContent = String(unread);
    if (!state.notifications.length) {
      list.append(makeTextElement('p', 'notification-empty', 'No SafeTrail notifications yet.'));
      return;
    }
    state.notifications.slice(0, 30).forEach((notice) => {
      const item = document.createElement('article');
      item.className = `notification-item${notice.read ? '' : ' is-unread'}`;
      const title = makeTextElement('h4', '', notice.title);
      const description = makeTextElement('p', '', notice.description);
      const audience = notice.recipientName ? `SIMULATED · TO ${notice.recipientName}` : 'LOCAL ONLY · DEMO';
      const time = makeTextElement('time', '', `${audience} · ${formatTime(notice.createdAt)}`);
      item.append(title, description, time);
      if (!notice.read) {
        const markRead = makeTextElement('button', '', 'Mark read');
        markRead.type = 'button';
        markRead.addEventListener('click', () => {
          notice.read = true;
          persistState();
          renderNotifications();
        });
        item.append(markRead);
      }
      list.append(item);
    });
  }

  function addNotification(title, description, recipient = null) {
    state.notifications.unshift({
      id: makeId('notice'),
      title,
      description,
      recipientId: recipient?.id || null,
      recipientName: recipient?.name || '',
      createdAt: new Date().toISOString(),
      read: false,
    });
    state.notifications = state.notifications.slice(0, MAX_NOTIFICATIONS);
    renderNotifications();
  }

  function notifySelected(title, description) {
    const recipients = activeContacts();
    if (state.networkMode !== 'online') {
      addNotification(`${title} · local demo`, `${description} No contact received this while the network simulation is offline.`);
      return;
    }
    recipients.forEach((recipient) => addNotification(title, description, recipient));
  }

  function renderContacts() {
    const list = $('#trusted-contact-list');
    list.replaceChildren();
    if (!state.contacts.length) {
      list.append(makeTextElement('p', 'safetrail-empty', 'No contacts added. Add a demo contact to preview selected recipients.'));
    }
    state.contacts.forEach((contact) => {
      const row = document.createElement('article');
      row.className = 'contact-list-item';
      const details = document.createElement('div');
      details.append(makeTextElement('h4', '', contact.name));
      details.append(makeTextElement('p', '', `${contact.relationship} · ${contact.sample ? 'Sample contact · not registered' : 'Demo contact · not registered'}`));
      const actions = document.createElement('div');
      actions.className = 'contact-list-actions';
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = contact.receivesUpdates;
      checkbox.setAttribute('aria-label', `Send simulated notifications to ${contact.name}`);
      checkbox.addEventListener('change', () => {
        contact.receivesUpdates = checkbox.checked;
        persistState();
        renderTrustedContactOptions();
        renderTrustedContactView();
      });
      label.append(checkbox, document.createTextNode('Receive updates'));
      const remove = makeTextElement('button', 'remove-contact', 'Remove');
      remove.type = 'button';
      remove.addEventListener('click', () => {
        if (!window.confirm(`Remove ${contact.name} from this local demo?`)) return;
        state.contacts = state.contacts.filter((item) => item.id !== contact.id);
        persistState();
        renderContacts();
        renderTrustedContactOptions();
        renderTrustedContactView();
      });
      actions.append(label, remove);
      row.append(details, actions);
      list.append(row);
    });
  }

  function renderTrustedContactOptions() {
    const select = $('#trusted-view-contact');
    const previous = select.value;
    select.replaceChildren();
    if (!state.contacts.length) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No contacts available';
      select.append(option);
      select.disabled = true;
      return;
    }
    select.disabled = false;
    state.contacts.forEach((contact) => {
      const option = document.createElement('option');
      option.value = contact.id;
      option.textContent = `${contact.name} · ${contact.relationship}`;
      select.append(option);
    });
    select.value = state.contacts.some((contact) => contact.id === previous) ? previous : state.contacts[0].id;
  }

  function renderTrustedContactView() {
    const contactId = $('#trusted-view-contact').value;
    const contact = state.contacts.find((item) => item.id === contactId);
    const summary = $('#trusted-view-summary');
    const mapButton = $('#open-coordinate-map');
    summary.replaceChildren();
    selectedViewRecord = null;
    if (!contact) {
      summary.append(makeTextElement('p', 'safetrail-empty', 'Add a contact to preview a trusted-contact view.'));
      mapButton.disabled = true;
      return;
    }
    const received = state.history.filter((record) => record.deliveryContactIds?.includes(contact.id));
    const latest = received[0];
    if (!latest) {
      summary.append(makeTextElement('p', 'safetrail-empty', `${contact.name} has no simulated location update yet. Start a session and select this contact for notifications.`));
      mapButton.disabled = true;
      return;
    }
    selectedViewRecord = latest;
    mapButton.disabled = false;
    summary.append(makeTextElement('h4', '', contact.name));
    summary.append(makeTextElement('p', '', `Expeditioner: ${state.hikerName}`));
    summary.append(makeTextElement('p', '', `Expedition: ${routes[latest.destination]?.name || 'Atlas expedition'}`));
    summary.append(makeTextElement('p', '', `Latest received coordinates: ${formatCoordinate(latest.lat, true)}, ${formatCoordinate(latest.lon, false)}`));
    summary.append(makeTextElement('p', '', `Location recorded: ${formatTime(latest.recordedAt)}`));
    summary.append(makeTextElement('p', '', `Update received: ${formatTime(latest.deliveredAt)}`));
    summary.append(makeTextElement('p', '', 'Location accuracy: simulated · real GPS unavailable'));
    summary.append(makeTextElement('p', '', `Delivery: ${latest.status === 'synced' ? 'synchronized after an offline period' : 'delivered immediately in the demo'}`));
    summary.append(makeTextElement('p', '', `Recent received updates: ${received.length}`));
    const recentHistory = document.createElement('ol');
    recentHistory.className = 'trusted-history';
    received.slice(0, 5).forEach((record) => {
      const item = document.createElement('li');
      item.textContent = `${formatCoordinate(record.lat, true)}, ${formatCoordinate(record.lon, false)} · recorded ${formatTime(record.recordedAt)} · received ${formatTime(record.deliveredAt)} · ${record.status === 'synced' ? 'synced later' : 'immediate demo delivery'}`;
      recentHistory.append(item);
    });
    summary.append(recentHistory);
  }

  function renderAll() {
    $('#safetrail-hiker-name').value = state.hikerName;
    destinationSelect.value = state.destination;
    updateInterval.value = String(state.intervalMinutes);
    renderRoute(false);
    renderStatus();
    renderMetrics();
    renderHistory();
    renderNotifications();
    renderContacts();
    renderTrustedContactOptions();
    renderTrustedContactView();
  }

  function makeId(prefix) {
    if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`;
    recordCounter += 1;
    return `${prefix}-${Date.now()}-${recordCounter}`;
  }

  function clearLocationTimer() {
    if (locationTimer) window.clearInterval(locationTimer);
    locationTimer = null;
  }

  function startLocationTimer() {
    clearLocationTimer();
    if (state.session.status !== 'active') return;
    locationTimer = window.setInterval(recordDemoLocation, state.intervalMinutes * 60 * 1000);
  }

  function changeDestination(destination) {
    if (!routes[destination]) return;
    state.destination = destination;
    state.session.step = 0;
    renderRoute(true);
    renderMetrics();
    persistState();
    showMessage(`Route preview changed to ${routes[destination].name}. The marker follows this illustrative route.`, 'success');
  }

  function startSession() {
    clearMessage();
    state.session.status = 'active';
    state.session.startedAt = new Date().toISOString();
    state.session.step = 0;
    state.checkin = { deadline: null, overdue: false };
    renderAll();
    persistState();
    notifySelected('SafeTrail session started', `${routes[state.destination].name} · simulated expedition session is active.`);
    startLocationTimer();
    renderNotifications();
    showMessage('Demo session active. Record a test point now or wait for the selected interval.', 'success');
  }

  function toggleSession() {
    if (state.session.status === 'active') {
      state.session.status = 'paused';
      clearLocationTimer();
      clearCheckinTimer();
      notifySelected('SafeTrail session paused', 'Simulated location recording is paused.');
      showMessage('Session paused. No locations will be generated until you resume.', 'warning');
    } else if (state.session.status === 'paused') {
      state.session.status = 'active';
      notifySelected('SafeTrail session resumed', 'Simulated location recording has resumed.');
      startLocationTimer();
      scheduleCheckinTimer();
      showMessage('Session resumed.', 'success');
    }
    persistState();
    renderStatus();
    renderNotifications();
  }

  function endSession() {
    if (!['active', 'paused'].includes(state.session.status)) return;
    if (!window.confirm('End this SafeTrail demo session? Any offline records remain queued for a later simulated sync.')) return;
    state.session.status = 'ended';
    state.checkin = { deadline: null, overdue: false };
    clearLocationTimer();
    clearCheckinTimer();
    notifySelected('SafeTrail session ended', 'The simulated expedition session has ended.');
    persistState();
    renderStatus();
    renderNotifications();
    showMessage('Demo session ended. Any queued locations remain available for simulated synchronization.', 'success');
  }

  function recordDemoLocation() {
    if (state.session.status !== 'active') return;
    const route = currentRoute();
    state.session.step += 1;
    const point = route.points[state.session.step % route.points.length];
    const recipients = activeContacts();
    const record = {
      id: makeId('location'),
      destination: state.destination,
      lat: point.lat,
      lon: point.lon,
      recordedAt: new Date().toISOString(),
      deliveredAt: null,
      synchronizedAt: null,
      status: 'pending',
      statusLabel: '',
      recipientIds: recipients.map((contact) => contact.id),
      deliveryContactIds: [],
    };

    if (state.networkMode === 'offline') {
      record.status = 'pending';
      record.statusLabel = 'Saved offline · pending sync';
      state.pending.push({ ...record });
      state.history.unshift(record);
      addNotification('Location update queued offline', `${formatCoordinate(record.lat, true)}, ${formatCoordinate(record.lon, false)} saved locally. Contacts have not received it.`);
      showMessage('Simulated location saved offline and added to the pending queue.', 'warning');
    } else {
      record.deliveredAt = new Date().toISOString();
      record.status = recipients.length ? 'delivered' : 'recorded';
      record.statusLabel = recipients.length ? 'Delivered · simulated' : 'Recorded · no recipients';
      record.deliveryContactIds = recipients.map((contact) => contact.id);
      state.history.unshift(record);
      state.lastSyncedAt = record.deliveredAt;
      recipients.forEach((contact) => addNotification('New location update delivered', `${formatCoordinate(record.lat, true)}, ${formatCoordinate(record.lon, false)} · ${routes[state.destination].name}.`, contact));
      showMessage(recipients.length ? `Location update simulated for ${recipients.length} selected contact${recipients.length === 1 ? '' : 's'}. No message was sent.` : 'Location recorded locally. Select at least one contact to simulate a delivery.', recipients.length ? 'success' : 'warning');
    }

    animateMarker(point);
    renderMetrics();
    renderHistory();
    renderTrustedContactView();
    persistState();
    renderNotifications();
  }

  function syncPendingRecords() {
    if (state.networkMode !== 'online' || !state.pending.length || syncInProgress) return;
    syncInProgress = true;
    const count = state.pending.length;
    showMessage(`Synchronizing ${count} saved demo update${count === 1 ? '' : 's'}…`, 'sync');
    syncTimer = window.setTimeout(() => {
      if (state.networkMode !== 'online') {
        syncInProgress = false;
        return;
      }
      const queued = [...state.pending].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
      const recipientsById = new Map(state.contacts.map((contact) => [contact.id, contact]));
      const allRecipients = new Set();
      queued.forEach((record) => {
        const historyRecord = state.history.find((item) => item.id === record.id);
        if (!historyRecord) return;
        const recipients = record.recipientIds
          .map((id) => recipientsById.get(id))
          .filter((contact) => contact?.receivesUpdates);
        const timestamp = new Date().toISOString();
        historyRecord.status = 'synced';
        historyRecord.statusLabel = recipients.length ? 'Synced · simulated' : 'Synced · no active recipients';
        historyRecord.deliveredAt = timestamp;
        historyRecord.synchronizedAt = timestamp;
        historyRecord.deliveryContactIds = recipients.map((contact) => contact.id);
        recipients.forEach((contact) => allRecipients.add(contact));
      });
      state.pending = [];
      state.lastSyncedAt = new Date().toISOString();
      allRecipients.forEach((contact) => addNotification('Offline locations synchronized', `${queued.length} saved update${queued.length === 1 ? '' : 's'} synchronized in chronological order.`, contact));
      if (!allRecipients.size) addNotification('Offline queue synchronized', `${queued.length} local update${queued.length === 1 ? '' : 's'} synchronized. No active selected contacts received an update.`);
      syncInProgress = false;
      syncTimer = null;
      persistState();
      renderMetrics();
      renderHistory();
      renderTrustedContactView();
      renderNotifications();
      showMessage(`${queued.length} simulated update${queued.length === 1 ? '' : 's'} synchronized. This was a local prototype action, not a network delivery.`, 'success');
    }, 650);
  }

  function setNetworkMode(mode) {
    const nextMode = mode === 'offline' ? 'offline' : 'online';
    if (state.networkMode === nextMode) return;
    state.networkMode = nextMode;
    persistState();
    renderStatus();
    if (nextMode === 'online') {
      syncPendingRecords();
      if (!state.pending.length) showMessage('Demo network is online. This does not check your actual internet connection.', 'success');
    } else {
      if (syncTimer) window.clearTimeout(syncTimer);
      syncTimer = null;
      syncInProgress = false;
      showMessage('Offline simulation is on. New demo records will queue locally.', 'warning');
    }
  }

  function clearCheckinTimer() {
    if (checkinTimer) window.clearTimeout(checkinTimer);
    checkinTimer = null;
  }

  function markCheckinOverdue() {
    if (state.session.status !== 'active' || state.checkin.overdue || !state.checkin.deadline) return;
    state.checkin.overdue = true;
    persistState();
    renderStatus();
    notifySelected('Safety check-in time passed', 'A local demo check-in is overdue. This is not proof that the hiker is in danger.');
    renderNotifications();
  }

  function scheduleCheckinTimer() {
    clearCheckinTimer();
    if (state.session.status !== 'active' || !state.checkin.deadline || state.checkin.overdue) return;
    const remaining = state.checkin.deadline - Date.now();
    if (remaining <= 0) {
      markCheckinOverdue();
      return;
    }
    checkinTimer = window.setTimeout(markCheckinOverdue, remaining);
  }

  function selectedCheckinDuration() {
    return Number($('#checkin-duration').value) || 2;
  }

  function setCheckin() {
    if (state.session.status !== 'active') return;
    state.checkin = { deadline: Date.now() + (selectedCheckinDuration() * 60 * 60 * 1000), overdue: false };
    persistState();
    renderStatus();
    scheduleCheckinTimer();
    showMessage(`Local check-in reminder set for ${formatTime(state.checkin.deadline)}. It cannot alert contacts while offline.`, 'success');
  }

  function confirmSafe() {
    if (state.session.status !== 'active' || !state.checkin.deadline) return;
    state.checkin = { deadline: Date.now() + (selectedCheckinDuration() * 60 * 60 * 1000), overdue: false };
    persistState();
    renderStatus();
    scheduleCheckinTimer();
    notifySelected('Demo check-in confirmed', `The hiker selected “I'm Safe”. Next local reminder: ${formatTime(state.checkin.deadline)}.`);
    renderNotifications();
    showMessage('Check-in recorded in this browser only. No emergency service or real contact was notified.', 'success');
  }

  function openCoordinateMap() {
    if (!selectedViewRecord) return;
    const { lat, lon } = selectedViewRecord;
    const url = `https://www.openstreetmap.org/?mlat=${encodeURIComponent(lat)}&mlon=${encodeURIComponent(lon)}#map=13/${encodeURIComponent(lat)}/${encodeURIComponent(lon)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function addContact(event) {
    event.preventDefault();
    const form = $('#contact-form');
    const name = form.elements.name.value.trim();
    const relationship = form.elements.relationship.value;
    const email = form.elements.email.value.trim();
    form.elements.name.setCustomValidity(name ? '' : 'Enter a display name.');
    if (!form.reportValidity()) return;
    const contact = {
      id: makeId('contact'), name, relationship, email,
      receivesUpdates: form.elements.receive.checked,
      sample: false,
    };
    state.contacts.push(contact);
    persistState();
    form.reset();
    form.hidden = true;
    $('#contact-message').textContent = '';
    renderContacts();
    renderTrustedContactOptions();
    renderTrustedContactView();
    showMessage(`${contact.name} added as a local demo contact. They have not registered or received an invitation.`, 'success');
  }

  function connectivityTest() {
    const browserOnline = navigator.onLine;
    const result = $('#connectivity-result');
    result.textContent = browserOnline
      ? 'Browser reports online. Demo delivery mode is controlled separately above.'
      : 'Browser reports offline. Demo delivery mode is controlled separately above.';
  }

  function readAllNotifications() {
    state.notifications.forEach((notice) => { notice.read = true; });
    persistState();
    renderNotifications();
  }

  function clearNotifications() {
    if (!state.notifications.length) return;
    if (!window.confirm('Clear this browser’s SafeTrail demo notifications?')) return;
    state.notifications = [];
    persistState();
    renderNotifications();
  }

  function wireEvents() {
    $('#safetrail-hiker-name').addEventListener('change', (event) => {
      state.hikerName = event.target.value.trim().slice(0, 50) || 'Atlas traveler';
      event.target.value = state.hikerName;
      persistState();
      renderTrustedContactView();
    });
    destinationSelect.addEventListener('change', () => changeDestination(destinationSelect.value));
    updateInterval.addEventListener('change', () => {
      state.intervalMinutes = Number(updateInterval.value);
      persistState();
      if (state.session.status === 'active') startLocationTimer();
      showMessage(`Demo coordinate interval set to ${state.intervalMinutes} minute${state.intervalMinutes === 1 ? '' : 's'}. Use the manual record button to test now.`, 'success');
    });
    startButton.addEventListener('click', startSession);
    pauseButton.addEventListener('click', toggleSession);
    endButton.addEventListener('click', endSession);
    recordButton.addEventListener('click', recordDemoLocation);
    networkToggle.addEventListener('click', () => setNetworkMode(state.networkMode === 'online' ? 'offline' : 'online'));
    $('#test-connectivity').addEventListener('click', connectivityTest);
    $('#set-checkin').addEventListener('click', setCheckin);
    $('#im-safe').addEventListener('click', confirmSafe);
    $('#open-contact-form').addEventListener('click', () => {
      const form = $('#contact-form');
      form.hidden = false;
      form.elements.name.focus();
    });
    $('#cancel-contact-form').addEventListener('click', () => {
      $('#contact-form').reset();
      $('#contact-form').hidden = true;
    });
    $('#contact-form').addEventListener('submit', addContact);
    $('#trusted-view-contact').addEventListener('change', renderTrustedContactView);
    $('#open-coordinate-map').addEventListener('click', openCoordinateMap);
    $('#mark-all-read').addEventListener('click', readAllNotifications);
    $('#clear-notifications').addEventListener('click', clearNotifications);
  }

  function boot() {
    wireEvents();
    renderAll();
    if (state.session.status === 'active') startLocationTimer();
    if (state.session.status === 'active' && state.checkin.deadline && !state.checkin.overdue) scheduleCheckinTimer();
    else if (state.session.status === 'active' && state.checkin.deadline && state.checkin.deadline <= Date.now()) markCheckinOverdue();
    if (state.networkMode === 'online' && state.pending.length) syncPendingRecords();
  }

  boot();
})();

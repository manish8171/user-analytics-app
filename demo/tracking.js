(function() {
  const hostname = window.location.hostname || 'localhost';
  const BACKEND_URL = `http://${hostname}:5000/api/events`;
  
  // Get or create session_id
  function getSessionId() {
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  const sessionId = getSessionId();

  // Helper to send event
  function sendEvent(eventType, eventData = {}) {
    const payload = {
      session_id: sessionId,
      event_type: eventType,
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
      ...eventData
    };

    // Use fetch with keepalive for reliable tracking that handles CORS properly
    fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(err => console.error('Analytics error:', err));
  }

  // Track page_view
  sendEvent('page_view');

  // Track clicks
  document.addEventListener('click', function(e) {
    // Try to get meaningful text from the clicked element
    let target = e.target;
    let targetText = '';
    
    // If it's a structural element, prefer its ID or class
    if (['DIV', 'BODY', 'HTML', 'SECTION', 'MAIN', 'HEADER', 'FOOTER'].includes(target.tagName)) {
       targetText = target.id ? `#${target.id}` : (target.className ? `.${target.className.split(' ')[0]}` : target.tagName);
    } else {
       // For buttons, links, spans, etc., get their text
       targetText = target.textContent ? target.textContent.substring(0, 30).trim() : '';
       if (!targetText) targetText = target.value || target.id || target.tagName;
    }
    
    // In case the text is extremely long, fallback to tag
    if (targetText.length > 30) {
      targetText = targetText.substring(0, 30) + '...';
    }
    
    sendEvent('click', {
      click_x: e.clientX + window.scrollX,
      click_y: e.clientY + window.scrollY,
      element_text: targetText || 'Unknown'
    });
  });
})();

let eventsData = [];

document.addEventListener('DOMContentLoaded', async () => {
  await fetchEvents();
});

async function fetchEvents() {
  const upcomingContainer = document.getElementById('upcoming-events-grid');
  const pastContainer = document.getElementById('past-events-grid');
  
  try {
    const { data, error } = await window.supabaseClient
      .from('events')
      .select('*')
      .order('event_date', { ascending: false });
      
    if (error) throw error;
    
    eventsData = data || [];
    
    const upcoming = eventsData.filter(e => e.is_upcoming);
    const past = eventsData.filter(e => !e.is_upcoming);
    
    renderEvents(upcoming, upcomingContainer, 'No upcoming events currently scheduled.');
    renderEvents(past, pastContainer, 'No past events found.');
    
    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error('Error fetching events:', err);
    upcomingContainer.innerHTML = '<div class="empty-state">Error loading events.</div>';
    pastContainer.innerHTML = '<div class="empty-state">Error loading events.</div>';
  }
}

function renderEvents(events, container, emptyMsg) {
  if (events.length === 0) {
    container.innerHTML = `<div class="empty-state">${emptyMsg}</div>`;
    return;
  }
  
  container.innerHTML = events.map((ev, index) => `
    <div class="card reveal" style="transition-delay: ${index * 0.1}s; cursor: pointer;" onclick="openModal('${ev.id}')">
      <div class="card-img-wrapper">
        <img src="${window.getPublicUrl('events-images', ev.image_url)}" alt="${ev.name}" class="card-img">
      </div>
      <div class="card-content">
        <h3 class="card-title">${ev.name}</h3>
        <p style="color: var(--accent-color); font-size: 0.9rem; margin-bottom: 10px;">${new Date(ev.event_date).toLocaleDateString()}</p>
        <p class="card-desc">${ev.description || ''}</p>
      </div>
    </div>
  `).join('');
}

function openModal(id) {
  const ev = eventsData.find(e => e.id === id);
  if (!ev) return;
  
  document.getElementById('modal-img').src = window.getPublicUrl('events-images', ev.image_url);
  document.getElementById('modal-title').textContent = ev.name;
  document.getElementById('modal-date').textContent = new Date(ev.event_date).toLocaleDateString();
  document.getElementById('modal-desc').textContent = ev.description || 'No description provided.';
  
  document.getElementById('event-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('event-modal').classList.remove('active');
}

// Close modal on outside click
document.getElementById('event-modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('event-modal')) {
    closeModal();
  }
});

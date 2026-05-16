document.addEventListener('DOMContentLoaded', async () => {
  loadLatestBiobuzz();
  loadUpcomingEvents();
});

async function loadLatestBiobuzz() {
  const container = document.getElementById('latest-biobuzz-grid');
  try {
    const { data, error } = await window.supabaseClient
      .from('biobuzz')
      .select('*')
      .order('release_date', { ascending: false })
      .limit(2);
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="card reveal" style="grid-column: 1 / -1; padding: 60px 40px; border-radius: var(--border-radius); text-align: center; display: flex; flex-direction: column; align-items: center;">
          <h3 style="color: var(--accent-color); font-size: 2rem; margin-bottom: 15px;">Latest Biobuzz</h3>
          <p style="color: var(--accent-color); font-size: 1.1rem; opacity: 0.8;">No Biobuzz issues published yet. Check back soon!</p>
        </div>
      `;
      window.dispatchEvent(new Event('scroll'));
      return;
    }
    
    container.innerHTML = data.map((issue, index) => `
      <div class="card reveal" style="transition-delay: ${index * 0.1}s; padding: 40px; border-radius: var(--border-radius); display: flex; flex-direction: column;">
        <h3 style="color: var(--accent-color); font-size: 2rem; margin-bottom: 20px;">Latest Biobuzz</h3>
        <p style="color: var(--accent-color); font-size: 1.1rem; line-height: 1.6; margin-bottom: 30px; flex-grow: 1; opacity: 0.9;">
          ${issue.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent placerat urna nibh, eu elementum purus pulvinar in. Mauris at libero ipsum. Pellentesque venenatis, erat quis pretium malesuada, arcu elit consectetur metus.'}
        </p>
        <a href="${window.getPublicUrl('biobuzz-articles', issue.read_link)}" target="_blank" class="btn-primary" style="text-align: center; background-color: #8cbdb1; color: #1a1a1a; width: 100%; border-radius: 12px; font-size: 1.2rem; padding: 15px;">Click Here</a>
      </div>
    `).join('');
    
    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error('Error fetching latest biobuzz:', err);
    container.innerHTML = '<div class="empty-state">No issues found.</div>';
  }
}

async function loadUpcomingEvents() {
  const container = document.getElementById('upcoming-events-grid');
  try {
    const { data, error } = await window.supabaseClient
      .from('events')
      .select('*')
      .eq('is_upcoming', true)
      .order('event_date', { ascending: true })
      .limit(3);
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      container.innerHTML = '<div class="empty-state">No upcoming events scheduled.</div>';
      return;
    }
    
    container.innerHTML = data.map((ev, index) => `
      <div class="card reveal" style="transition-delay: ${index * 0.1}s">
        <div class="card-img-wrapper" style="height: 200px;">
          <img src="${window.getPublicUrl('events-images', ev.image_url)}" alt="${ev.name}" class="card-img">
        </div>
        <div class="card-content">
          <h3 class="card-title" style="font-size: 1.3rem;">${ev.name}</h3>
          <p style="color: var(--accent-color); font-size: 0.85rem; margin-bottom: 10px;">${new Date(ev.event_date).toLocaleDateString()}</p>
          <p class="card-desc" style="font-size: 0.9rem;">${ev.description || ''}</p>
        </div>
      </div>
    `).join('');
    
    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error('Error fetching events:', err);
    container.innerHTML = '<div class="empty-state">Error loading events.</div>';
  }
}

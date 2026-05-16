document.addEventListener('DOMContentLoaded', async () => {
  const track = document.getElementById('teams-carousel');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  
  try {
    const { data, error } = await window.supabaseClient
      .from('team_events')
      .select('*')
      .order('event_date', { ascending: false });
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      track.innerHTML = '<div class="empty-state">No team events uploaded yet.</div>';
      btnPrev.style.display = 'none';
      btnNext.style.display = 'none';
      return;
    }
    
    track.innerHTML = data.map(ev => `
      <div class="card carousel-card">
        <div class="card-img-wrapper" style="height: 200px;">
          <img src="${window.getPublicUrl('team-images', ev.image_url)}" alt="${ev.name}" class="card-img">
        </div>
        <div class="card-content">
          <h3 class="card-title" style="font-size: 1.3rem;">${ev.name}</h3>
          <p style="color: var(--accent-color); font-size: 0.9rem; margin-bottom: 10px;">${new Date(ev.event_date).toLocaleDateString()}</p>
          <p style="font-weight: 600; margin-bottom: 10px; color: var(--brand-color);">Result: ${ev.result || 'N/A'}</p>
          <p class="card-desc">${ev.description || ''}</p>
        </div>
      </div>
    `).join('');
    
    // Carousel scrolling logic
    const scrollAmount = 330; // approx card width + gap
    
    btnNext.addEventListener('click', () => {
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
    
    btnPrev.addEventListener('click', () => {
      track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    
  } catch (err) {
    console.error('Error fetching team events:', err);
    track.innerHTML = '<div class="empty-state">Error loading team events.</div>';
  }
});

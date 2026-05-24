document.addEventListener('DOMContentLoaded', async () => {
  const featuredContainer = document.getElementById('featured-issue');
  const archiveContainer = document.getElementById('archive-grid');
  
  try {
    const { data, error } = await window.supabaseClient
      .from('biobuzz')
      .select('*')
      .order('release_date', { ascending: false });
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      featuredContainer.innerHTML = '<div class="card-content">No Biobuzz issues published yet.</div>';
      archiveContainer.innerHTML = '';
      return;
    }
    
    // Featured Issue (Latest)
    const featured = data[0];
    featuredContainer.innerHTML = `
      <div style="display: flex; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 300px; background: #333;">
          <img src="${window.getPublicUrl('biobuzz-covers', featured.cover_url)}" alt="${featured.edition_name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="flex: 1; min-width: 300px; padding: 40px; display: flex; flex-direction: column; justify-content: center;">
          <h2 style="color: var(--brand-color); font-size: 2rem; margin-bottom: 15px;">${featured.edition_name}</h2>
          <p style="color: var(--accent-color); margin-bottom: 20px;">Released: ${new Date(featured.release_date).toLocaleDateString()}</p>
          <p style="font-size: 1.1rem; margin-bottom: 30px; opacity: 0.9;">${featured.description || 'No description provided.'}</p>
          <a href="#" onclick="openBiobuzzModal('${window.getPublicUrl('biobuzz-articles', featured.read_link)}', event)" class="btn-primary" style="align-self: flex-start;">Read / Download</a>
        </div>
      </div>
    `;
    
    // Archive (The Rest)
    const archive = data.slice(1);
    if (archive.length === 0) {
      archiveContainer.innerHTML = '<div class="empty-state">No past issues.</div>';
    } else {
      archiveContainer.innerHTML = archive.map((issue, index) => `
        <div class="card reveal" style="transition-delay: ${index * 0.1}s">
          <div class="card-img-wrapper" style="height: 300px;">
            <img src="${window.getPublicUrl('biobuzz-covers', issue.cover_url)}" alt="${issue.edition_name}" class="card-img" style="object-position: top;">
          </div>
          <div class="card-content">
            <h3 class="card-title" style="font-size: 1.2rem;">${issue.edition_name}</h3>
            <p style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 15px;">${new Date(issue.release_date).toLocaleDateString()}</p>
            <a href="#" onclick="openBiobuzzModal('${window.getPublicUrl('biobuzz-articles', issue.read_link)}', event)" class="card-btn" style="font-size: 0.85rem; padding: 5px 15px;">Read</a>
          </div>
        </div>
      `).join('');
    }
    
    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error('Error fetching biobuzz:', err);
    featuredContainer.innerHTML = '<div class="card-content">Error loading Biobuzz.</div>';
    archiveContainer.innerHTML = '';
  }
});

// Modal Logic
window.openBiobuzzModal = function(url, event) {
  if (event) event.preventDefault();
  const modal = document.getElementById('biobuzz-modal');
  const iframe = document.getElementById('biobuzz-iframe');
  
  if (modal && iframe) {
    iframe.src = url;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop background scrolling
  }
};

window.closeBiobuzzModal = function() {
  const modal = document.getElementById('biobuzz-modal');
  const iframe = document.getElementById('biobuzz-iframe');
  
  if (modal && iframe) {
    modal.classList.remove('active');
    iframe.src = ''; // Unload iframe to stop background CPU load
    document.body.style.overflow = '';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('close-modal-btn');
  const modal = document.getElementById('biobuzz-modal');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', window.closeBiobuzzModal);
  }
  
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        window.closeBiobuzzModal();
      }
    });
  }
});

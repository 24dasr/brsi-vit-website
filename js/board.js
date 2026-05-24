document.addEventListener('DOMContentLoaded', async () => {
  const currentGrid = document.getElementById('current-board-grid');
  const pastGrid = document.getElementById('past-board-grid');
  const dropdown = document.getElementById('year-dropdown');
  const currentLabel = document.getElementById('current-year-label');
  
  let boardData = [];
  let years = [];
  
  try {
    const { data, error } = await window.supabaseClient
      .from('board_members')
      .select('*')
      .order('position_order', { ascending: true });
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      currentGrid.innerHTML = '<div class="empty-state">No board members found.</div>';
      return;
    }
    
    boardData = data;
    
    // Extract unique years and sort descending
    years = [...new Set(data.map(m => m.year))].sort((a, b) => b.localeCompare(a));
    
    const currentYear = years[0];
    currentLabel.textContent = `(${currentYear})`;
    
    const currentMembers = data.filter(m => m.year === currentYear);
    renderBoard(currentMembers, currentGrid);
    
    // Populate dropdown with previous years
    const pastYears = years.slice(1);
    if (pastYears.length > 0) {
      pastYears.forEach(y => {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        dropdown.appendChild(opt);
      });
      
      dropdown.addEventListener('change', (e) => {
        const selected = e.target.value;
        if (selected) {
          const pastMembers = data.filter(m => m.year === selected);
          renderBoard(pastMembers, pastGrid);
          pastGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          pastGrid.innerHTML = '';
        }
      });
    } else {
      document.querySelector('.year-select-container').style.display = 'none';
    }
    
    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error('Error fetching board:', err);
    currentGrid.innerHTML = '<div class="empty-state">Error loading board members.</div>';
  }
});

function renderBoard(members, container) {
  if (members.length === 0) {
    container.innerHTML = '<div class="empty-state">No members found for this year.</div>';
    return;
  }
  
  container.innerHTML = members.map((m, index) => `
    <div class="card member-card reveal" style="transition-delay: ${index * 0.1}s">
      <img src="${window.getPublicUrl('board-photos', m.photo_url)}" alt="${m.member_name}" class="member-photo">
      <div class="member-info">
        <h3 class="card-title" style="font-size: 1.2rem; margin-bottom: 5px;">${m.member_name}</h3>
        <p style="color: var(--accent-color); font-weight: 500;">${m.position}</p>
      </div>
    </div>
  `).join('');
  
  // Re-trigger scroll animation classes for newly rendered content
  setTimeout(() => window.dispatchEvent(new Event('scroll')), 50);
}

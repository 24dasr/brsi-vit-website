document.addEventListener('DOMContentLoaded', async () => {
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
    
    // Trigger scroll animation for newly added elements
    window.dispatchEvent(new Event('scroll'));
    
  } catch (err) {
    console.error('Error fetching latest biobuzz:', err);
    // Fallback dummy data for previewing without Supabase configured
    const dummyData = [{}, {}];
    container.innerHTML = dummyData.map((_, index) => `
      <div class="card reveal" style="transition-delay: ${index * 0.1}s; padding: 40px; border-radius: var(--border-radius); display: flex; flex-direction: column;">
        <h3 style="color: var(--accent-color); font-size: 2rem; margin-bottom: 20px;">Latest Biobuzz</h3>
        <p style="color: var(--accent-color); font-size: 1.1rem; line-height: 1.6; margin-bottom: 30px; flex-grow: 1; opacity: 0.9;">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent placerat urna nibh, eu elementum purus pulvinar in. Mauris at libero ipsum. Pellentesque venenatis, erat quis pretium malesuada, arcu elit consectetur metus.
        </p>
        <a href="#" class="btn-primary" style="text-align: center; background-color: #8cbdb1; color: #1a1a1a; width: 100%; border-radius: 12px; font-size: 1.2rem; padding: 15px;">Click Here</a>
      </div>
    `).join('');
    window.dispatchEvent(new Event('scroll'));
  }
});

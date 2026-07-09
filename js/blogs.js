document.addEventListener('DOMContentLoaded', async () => {
  const featuredContainer = document.getElementById('featured-post');
  const archiveContainer = document.getElementById('archive-grid');
  
  try {
    const { data, error } = await window.supabaseClient
      .from('blogs')
      .select('*')
      .order('published_date', { ascending: false });
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      featuredContainer.innerHTML = '<div class="card-content">No blog posts published yet.</div>';
      archiveContainer.innerHTML = '';
      return;
    }
    
    // Featured Post (Latest)
    const featured = data[0];
    featuredContainer.innerHTML = `
      <div style="display: flex; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 300px; background: #333;">
          <img src="${window.getPublicUrl('blog-covers', featured.cover_url)}" alt="${featured.title}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="flex: 1; min-width: 300px; padding: 40px; display: flex; flex-direction: column; justify-content: center;">
          <h2 style="color: var(--brand-color); font-size: 2rem; margin-bottom: 15px;">${featured.title}</h2>
          <p style="color: var(--accent-color); margin-bottom: 10px;">By ${featured.author || 'BRSI'} &middot; ${new Date(featured.published_date).toLocaleDateString()}</p>
          <p style="font-size: 1.1rem; margin-bottom: 30px; opacity: 0.9;">${featured.excerpt || 'No excerpt provided.'}</p>
          <a href="blog-post.html?id=${featured.id}" class="btn-primary" style="align-self: flex-start;">Read Post</a>
        </div>
      </div>
    `;
    
    // Archive (The Rest)
    const archive = data.slice(1);
    if (archive.length === 0) {
      archiveContainer.innerHTML = '<div class="empty-state">No older posts.</div>';
    } else {
      archiveContainer.innerHTML = archive.map((post, index) => `
        <div class="card reveal" style="transition-delay: ${index * 0.1}s">
          <div class="card-img-wrapper" style="height: 200px;">
            <img src="${window.getPublicUrl('blog-covers', post.cover_url)}" alt="${post.title}" class="card-img">
          </div>
          <div class="card-content">
            <h3 class="card-title" style="font-size: 1.2rem; margin-bottom: 5px;">${post.title}</h3>
            <p style="font-size: 0.85rem; opacity: 0.7; margin-bottom: 15px;">${new Date(post.published_date).toLocaleDateString()}</p>
            <p class="card-desc" style="font-size: 0.9rem; margin-bottom: 20px;">${post.excerpt || ''}</p>
            <a href="blog-post.html?id=${post.id}" class="card-btn" style="font-size: 0.85rem; padding: 5px 15px;">Read More</a>
          </div>
        </div>
      `).join('');
    }
    
    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    featuredContainer.innerHTML = '<div class="card-content">Error loading blog.</div>';
    archiveContainer.innerHTML = '';
  }
});

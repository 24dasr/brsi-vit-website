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
    const featuredCover = featured.cover_url 
      ? window.getPublicUrl('blog-covers', featured.cover_url) 
      : 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80';

    featuredContainer.innerHTML = `
      <div style="display: flex; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 300px; background: #333;">
          <img src="${featuredCover}" alt="${featured.title}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="flex: 1; min-width: 300px; padding: 40px; display: flex; flex-direction: column; justify-content: center; gap: 15px;">
          <h2 style="color: var(--brand-color); font-size: 2.2rem; font-weight: 700; line-height: 1.3; margin: 0;">${featured.title}</h2>
          <p style="color: var(--accent-color); font-size: 0.9rem; opacity: 0.7; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">
            By ${featured.author || 'BRSI'} &middot; ${new Date(featured.published_date).toLocaleDateString()}
          </p>
          <p style="font-size: 1.1rem; line-height: 1.6; font-style: italic; opacity: 0.8; margin: 0 0 10px 0; color: var(--card-text-color);">
            "${featured.excerpt || 'No excerpt provided.'}"
          </p>
          <a href="blog-post.html?id=${featured.id}" class="btn-primary" style="align-self: flex-start; margin-top: 5px;">Read Post</a>
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
            <img src="${post.cover_url ? window.getPublicUrl('blog-covers', post.cover_url) : 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80'}" alt="${post.title}" class="card-img">
          </div>
          <div class="card-content">
            <h3 class="card-title" style="font-size: 1.2rem; margin-bottom: 10px; line-height: 1.4; height: 2.8em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${post.title}</h3>
            <p style="font-size: 0.85rem; opacity: 0.7; margin-bottom: 12px;">${new Date(post.published_date).toLocaleDateString()}</p>
            <p class="card-desc" style="font-size: 0.9rem; margin-bottom: 20px; font-style: italic; opacity: 0.8; line-height: 1.5;">${post.excerpt || ''}</p>
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

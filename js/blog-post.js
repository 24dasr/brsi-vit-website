document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('blog-post-container');
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('id');
  
  if (!postId) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No post specified.</p>
        <a href="blogs.html" class="btn-primary" style="margin-top: 20px; display: inline-block;">Back to Blog</a>
      </div>
    `;
    return;
  }
  
  try {
    const { data, error } = await window.supabaseClient
      .from('blogs')
      .select('*')
      .eq('id', postId)
      .single();
      
    if (error) throw error;
    
    if (!data) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Post not found.</p>
          <a href="blogs.html" class="btn-primary" style="margin-top: 20px; display: inline-block;">Back to Blog</a>
        </div>
      `;
      return;
    }
    
    document.title = `${data.title} | BRSI – VIT Chapter`;
    
    container.innerHTML = `
      <div class="reveal" style="max-width: 800px; margin: 0 auto 30px auto;">
        <a href="blogs.html" class="btn-primary" style="display: inline-block; font-size: 0.95rem; padding: 10px 20px;">&larr; Back to Blog</a>
      </div>
      <div class="card reveal" style="max-width: 800px; margin: 0 auto; transition-delay: 0.1s; overflow: hidden;">
        <div style="width: 100%; height: 400px; background: #333;">
          <img src="${data.cover_url ? window.getPublicUrl('blog-covers', data.cover_url) : 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80'}" alt="${data.title}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="padding: 40px 50px;">
          <h1 style="color: var(--brand-color); font-size: 3rem; margin-bottom: 15px; font-weight: 700; line-height: 1.2;">${data.title}</h1>
          <p style="color: var(--accent-color); font-size: 0.9rem; font-weight: 500; opacity: 0.8; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 0;">
            By ${data.author || 'BRSI'} &middot; ${new Date(data.published_date).toLocaleDateString()}
          </p>
          <hr style="border: 0; border-top: 1px solid rgba(140, 189, 177, 0.15); margin: 25px 0 30px 0;">
          <div style="font-size: 1.05rem; line-height: 1.8;">
            ${(data.content || 'No content available.')
              .split(/\n\s*\n/)
              .map(p => p.trim())
              .filter(p => p.length > 0)
              .map((p, idx) => {
                if (idx === 0) {
                  return `<p style="font-size: 1.2rem; font-weight: 500; margin-bottom: 1.8rem; line-height: 1.75; opacity: 0.95; color: var(--brand-color); font-style: italic;">${p.replace(/\n/g, '<br>')}</p>`;
                }
                return `<p style="margin-bottom: 1.5rem; opacity: 0.9; color: var(--card-text-color);">${p.replace(/\n/g, '<br>')}</p>`;
              }).join('')}
          </div>
        </div>
      </div>
    `;
    
    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error('Error fetching blog post:', err);
    container.innerHTML = `
      <div class="empty-state">
        <p>Error loading post.</p>
        <a href="blogs.html" class="btn-primary" style="margin-top: 20px; display: inline-block;">Back to Blog</a>
      </div>
    `;
  }
});

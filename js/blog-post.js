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
      <div class="reveal">
        <a href="blogs.html" class="btn-primary" style="margin-bottom: 30px; display: inline-block; font-size: 0.95rem; padding: 10px 20px;">&larr; Back to Blog</a>
      </div>
      <div class="card reveal" style="transition-delay: 0.1s; overflow: hidden;">
        <div style="width: 100%; height: 400px; background: #333;">
          <img src="${window.getPublicUrl('blog-covers', data.cover_url)}" alt="${data.title}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="padding: 40px;">
          <h1 style="color: var(--brand-color); font-size: 2.5rem; margin-bottom: 15px;">${data.title}</h1>
          <p style="color: var(--accent-color); font-size: 1rem; margin-bottom: 30px; font-weight: 600;">By ${data.author || 'BRSI'} &middot; ${new Date(data.published_date).toLocaleDateString()}</p>
          <div style="font-size: 1.1rem; line-height: 1.8; white-space: pre-line; opacity: 0.9;">${data.content || 'No content available.'}</div>
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

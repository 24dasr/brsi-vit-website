const navHTML = `
<nav class="navbar reveal" style="background-color: var(--card-bg); border-radius: 24px; padding: 15px 40px; margin-top: 40px; max-width: 1200px; box-shadow: none;">
  <a href="index.html" class="nav-brand" style="color: var(--brand-color); font-size: 1.8rem; font-weight: 600;">
    <img src="assets/placeholder.png" alt="BRSI Logo" class="nav-logo" style="width: 50px; height: 50px; border-radius: 50%;" onerror="this.src='https://via.placeholder.com/50x50?text=B'">
    BRSI - VIT Chapter
  </a>
  <button class="mobile-menu-toggle">☰</button>
  <ul class="nav-links" style="gap: 30px;">
    <li><a href="index.html" class="nav-link" id="nav-home">Home</a></li>
    <li><a href="events.html" class="nav-link" id="nav-events">Events</a></li>
    <li><a href="biobuzz.html" class="nav-link" id="nav-biobuzz">Biobuzz</a></li>
    <li><a href="blogs.html" class="nav-link" id="nav-blogs">Blog</a></li>
    <li><a href="podcast.html" class="nav-link" id="nav-podcast">Podcast</a></li>
    <li><a href="teams.html" class="nav-link" id="nav-teams">BRSI-Teams</a></li>
    <li><a href="board.html" class="nav-link" id="nav-board">Board</a></li>
    <li><a href="contact.html" class="nav-btn-outline" style="border: 1px solid rgba(140, 189, 177, 0.5); padding: 10px 25px; border-radius: 12px; color: rgba(140, 189, 177, 0.8);">Contact us</a></li>
  </ul>
</nav>
`;

const footerHTML = `
<footer class="footer">
  <div class="container">
    <p>&copy; ${new Date().getFullYear()} <a href="admin/index.html" style="color: inherit; text-decoration: none; cursor: default;">BRSI VIT Chapter</a></p>
    <p class="roaming-credits" style="font-size: 0.9rem; opacity: 0.8;">Website designed and developed by <span class="animated-name">Rishabh Das</span></p>
  </div>
</footer>
`;

document.addEventListener('DOMContentLoaded', () => {
  // Inject Ambient Background Globs
  const glow1 = document.createElement('div');
  glow1.className = 'bg-glow-1';
  const glow2 = document.createElement('div');
  glow2.className = 'bg-glow-2';
  const glow3 = document.createElement('div');
  glow3.className = 'bg-glow-3';
  document.body.appendChild(glow1);
  document.body.appendChild(glow2);
  document.body.appendChild(glow3);

  // Inject Navbar
  const navPlaceholder = document.getElementById('navbar-container');
  if (navPlaceholder) {
    navPlaceholder.innerHTML = navHTML;
    
    // Set Active Link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const linkId = 'nav-' + currentPath.replace('.html', '');
    const activeLink = document.getElementById(linkId);
    if (activeLink) activeLink.classList.add('active');

    // Mobile Menu Toggle
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (toggle && navLinks) {
      toggle.addEventListener('click', () => {
        navLinks.classList.toggle('show');
      });
    }
  }

  // Inject Footer
  const footerPlaceholder = document.getElementById('footer-container');
  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = footerHTML;
  }
});

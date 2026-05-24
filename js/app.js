document.addEventListener('DOMContentLoaded', async () => {
  // Load Theme
  await loadTheme();
  
  // Setup scroll animations
  setupScrollAnimations();
});

async function loadTheme() {
  try {
    const { data, error } = await window.supabaseClient
      .from('settings')
      .select('key, value');
      
    if (error) throw error;
    
    if (data && data.length > 0) {
      data.forEach(setting => {
        // Handle CSS Theme Variables
        let cssVar = '';
        if (setting.key === 'theme_bg') cssVar = '--bg-color';
        else if (setting.key === 'theme_card') cssVar = '--card-bg';
        else if (setting.key === 'theme_accent') cssVar = '--accent-color';
        else if (setting.key === 'theme_brand') cssVar = '--brand-color';
        else if (setting.key === 'theme_heading') cssVar = '--heading-color';
        else if (setting.key === 'theme_text') cssVar = '--text-color';
        
        if (cssVar && setting.value) {
          document.documentElement.style.setProperty(cssVar, setting.value);
        }

        // Handle Site Content Descriptions
        if (setting.key === 'desc_about' && document.getElementById('desc-about-text')) {
          document.getElementById('desc-about-text').textContent = setting.value;
        }
        if (setting.key === 'desc_teams' && document.getElementById('desc-teams-text')) {
          document.getElementById('desc-teams-text').textContent = setting.value;
        }
        if (setting.key === 'desc_podcast' && document.getElementById('desc-podcast-text')) {
          document.getElementById('desc-podcast-text').textContent = setting.value;
        }
      });

      // Load Logo if available
      const logoData = data.find(d => d.key === 'logo_url');
      if (logoData && logoData.value) {
        const logos = document.querySelectorAll('.nav-logo');
        logos.forEach(img => img.src = window.getPublicUrl('site-assets', logoData.value));
      }

      // Load Homepage Banner if available
      const bannerData = data.find(d => d.key === 'homepage_banner_url');
      const homepageBanner = document.getElementById('homepage-banner');
      if (bannerData && bannerData.value && homepageBanner) {
        homepageBanner.src = window.getPublicUrl('site-assets', bannerData.value);
      }
    }
  } catch (err) {
    console.error('Error loading settings:', err);
  }
}

function setupScrollAnimations() {
  const revealOnScroll = () => {
    // Query reveals dynamically so dynamically injected elements are animated
    const reveals = document.querySelectorAll('.reveal');
    const windowHeight = window.innerHeight;
    const elementVisible = 100;
    
    reveals.forEach(reveal => {
      const elementTop = reveal.getBoundingClientRect().top;
      if (elementTop < windowHeight - elementVisible) {
        reveal.classList.add('active');
      }
    });
  };
  
  window.addEventListener('scroll', revealOnScroll);
  
  // Create an observer to trigger reveal when DOM changes (e.g., after fetching data)
  const observer = new MutationObserver(() => {
    revealOnScroll();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  
  revealOnScroll(); // Trigger on load
}

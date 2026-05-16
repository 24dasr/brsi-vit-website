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
      .select('key, value')
      .like('key', 'theme_%');
      
    if (error) throw error;
    
    if (data && data.length > 0) {
      data.forEach(setting => {
        // e.g. theme_bg -> --bg-color
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
      });
    }

    // Load Logo if available
    const { data: logoData } = await window.supabaseClient
      .from('settings')
      .select('value')
      .eq('key', 'logo_url')
      .single();
      
    if (logoData && logoData.value) {
      const logos = document.querySelectorAll('.nav-logo');
      logos.forEach(img => img.src = window.getPublicUrl('site-assets', logoData.value));
    }
  } catch (err) {
    console.error('Error loading theme:', err);
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

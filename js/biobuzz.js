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
          <a href="#" onclick="openBiobuzzModal('${window.getPublicUrl('biobuzz-articles', featured.read_link)}', '${featured.edition_name.replace(/'/g, "\\'")}', event)" class="btn-primary" style="align-self: flex-start;">Read / Download</a>
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
            <h3 class="card-title" style="font-size: 1.2rem; margin-bottom: 5px;">${issue.edition_name}</h3>
            <p style="font-size: 0.85rem; opacity: 0.7; margin-bottom: 15px;">Released: ${new Date(issue.release_date).toLocaleDateString()}</p>
            <p class="card-desc" style="font-size: 0.9rem; margin-bottom: 20px; line-height: 1.5;">${issue.description || 'No description provided.'}</p>
            <a href="#" onclick="openBiobuzzModal('${window.getPublicUrl('biobuzz-articles', issue.read_link)}', '${issue.edition_name.replace(/'/g, "\\'")}', event)" class="card-btn" style="font-size: 0.85rem; padding: 5px 15px;">Read</a>
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

// PDF.js State Variables for Inline Scrolling Viewer
let pdfDoc = null;
let activeRenderingPages = new Set();
let lazyObserver = null;
let activePageObserver = null;

// Initialize PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
}

// Renders an individual page inline
async function renderPageInline(num, wrapper) {
  if (!pdfDoc || activeRenderingPages.has(num)) return;
  activeRenderingPages.add(num);
  
  const canvas = wrapper.querySelector('.pdf-page-canvas');
  const loader = wrapper.querySelector('.pdf-page-loader');
  
  if (!canvas) {
    activeRenderingPages.delete(num);
    return;
  }
  
  const ctx = canvas.getContext('2d');
  
  try {
    const page = await pdfDoc.getPage(num);
    
    // devicePixelRatio for crisp text rendering on Retina/High-DPI screens
    const dpr = window.devicePixelRatio || 1;
    const wrapperWidth = wrapper.clientWidth;
    const unscaledViewport = page.getViewport({ scale: 1 });
    const scaleFactor = wrapperWidth / unscaledViewport.width;
    
    const viewport = page.getViewport({ scale: scaleFactor * dpr });
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Make sure CSS visual size matches the wrapper width precisely
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
    
    if (loader) loader.style.display = 'none';
    canvas.style.display = 'block';
  } catch (err) {
    console.error(`Error rendering page ${num}:`, err);
    if (loader) {
      loader.innerHTML = `<span style="color: #ff6b6b; font-size: 0.8rem; font-weight: bold;">Failed to load page</span>`;
    }
  } finally {
    activeRenderingPages.delete(num);
  }
}

// Set up lazy-loading and active indicators via IntersectionObservers
function setupObservers() {
  const readerContainer = document.getElementById('native-pdf-reader');
  
  // 1. Lazy Loading Observer: loads page canvas when wrapper is near screen
  lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const wrapper = entry.target;
        const pageNum = parseInt(wrapper.getAttribute('data-page-number'));
        renderPageInline(pageNum, wrapper);
        lazyObserver.unobserve(wrapper); // Stop observing once rendered
      }
    });
  }, {
    root: readerContainer,
    rootMargin: '800px 0px' // Fetch page canvas 800px before scrolling in
  });

  // 2. Active Page Observer: updates sticky header page number indicator
  activePageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const pageNum = entry.target.getAttribute('data-page-number');
        const indicator = document.getElementById('reader-page-indicator');
        if (indicator && pdfDoc) {
          indicator.textContent = `Page ${pageNum} of ${pdfDoc.numPages}`;
        }
      }
    });
  }, {
    root: readerContainer,
    rootMargin: '-30% 0px -50% 0px', // Updates when page occupies center viewport
    threshold: 0.05
  });
}

// Triggered when user clicks a Biobuzz issue Card
window.openBiobuzzModal = function(url, title, event) {
  if (event) event.preventDefault();
  
  const reader = document.getElementById('native-pdf-reader');
  const pagesContainer = document.getElementById('reader-pages-container');
  const readerTitleElem = document.getElementById('reader-title');
  const pageIndicator = document.getElementById('reader-page-indicator');
  
  if (!reader || !pagesContainer) return;
  
  // Show page Title and resetting UI
  if (readerTitleElem) readerTitleElem.textContent = title || 'Biobuzz Magazine';
  if (pageIndicator) pageIndicator.textContent = 'Loading Document...';
  
  pagesContainer.innerHTML = `
    <div id="pdf-document-loader" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; color: #fff; padding: 100px 0;">
      <div class="loader" style="margin: 0; width: 50px; height: 50px; border-width: 4px;"></div>
      <span style="opacity: 0.8; font-size: 1.1rem; font-family: var(--font-body);">Initializing Digital Reader...</span>
    </div>
  `;
  
  // Transition views: Hide main scroll and display reader overlay
  reader.style.display = 'block';
  reader.scrollTop = 0;
  document.body.style.overflow = 'hidden';
  
  if (typeof pdfjsLib === 'undefined') {
    pagesContainer.innerHTML = `
      <div style="color: #ff6b6b; font-weight: bold; text-align: center; padding: 50px;">
        Viewer library failed to initialize. Please try reloading the page.
      </div>
    `;
    return;
  }
  
  // Fetch actual document from Supabase public URL
  pdfjsLib.getDocument(url).promise.then(async (pdfDoc_) => {
    pdfDoc = pdfDoc_;
    pagesContainer.innerHTML = ''; // Empty initial spinner
    
    if (pageIndicator) pageIndicator.textContent = `Page 1 of ${pdfDoc.numPages}`;
    
    // Clean-up any old observers
    if (lazyObserver) lazyObserver.disconnect();
    if (activePageObserver) activePageObserver.disconnect();
    
    setupObservers();
    
    // Get the first page to calculate precise aspect ratio for page wrappers
    try {
      const firstPage = await pdfDoc.getPage(1);
      const firstViewport = firstPage.getViewport({ scale: 1 });
      const aspectRatio = firstViewport.width / firstViewport.height;
      
      // Inject stacked canvas wrappers for all pages
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'pdf-page-wrapper';
        wrapper.setAttribute('data-page-number', i);
        
        // Dynamic aspect-ratio guarantees no scroll bar jumps
        wrapper.style.aspectRatio = aspectRatio.toString();
        
        wrapper.innerHTML = `
          <canvas class="pdf-page-canvas"></canvas>
          <div class="pdf-page-loader">
            <div class="loader" style="margin: 0; width: 32px; height: 32px; border-width: 3px;"></div>
            <span style="font-size: 0.85rem; opacity: 0.7;">Rendering Page ${i}...</span>
          </div>
        `;
        
        pagesContainer.appendChild(wrapper);
        
        // Register wrappers to the lazy loading and active indicators
        if (lazyObserver) lazyObserver.observe(wrapper);
        if (activePageObserver) activePageObserver.observe(wrapper);
      }
    } catch (err) {
      console.error('Error rendering page wrappers:', err);
    }
  }).catch(err => {
    console.error('Error fetching document from storage bucket:', err);
    pagesContainer.innerHTML = `
      <div style="color: #ff6b6b; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 100px 0;">
        <span style="font-weight: bold; font-size: 1.2rem;">Failed to fetch Biobuzz document</span>
        <span style="font-size: 0.9rem; opacity: 0.7; max-width: 350px; text-align: center; line-height: 1.5;">
          ${err.message || 'Check your network connection or CORS security configurations.'}
        </span>
      </div>
    `;
  });
};

// Returns to the primary listing page
window.closeBiobuzzReader = function() {
  const reader = document.getElementById('native-pdf-reader');
  const pagesContainer = document.getElementById('reader-pages-container');
  
  if (reader) {
    reader.style.display = 'none';
    document.body.style.overflow = '';
  }
  
  // Clean up observers
  if (lazyObserver) {
    lazyObserver.disconnect();
    lazyObserver = null;
  }
  if (activePageObserver) {
    activePageObserver.disconnect();
    activePageObserver = null;
  }
  
  // Free up canvas allocations and clear HTML
  if (pagesContainer) pagesContainer.innerHTML = '';
  pdfDoc = null;
  activeRenderingPages.clear();
};

// Handle event setups
document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('reader-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', window.closeBiobuzzReader);
  }
  
  // Re-adjust page canvas resolution on layout resize if visible
  window.addEventListener('resize', () => {
    const reader = document.getElementById('native-pdf-reader');
    if (reader && reader.style.display === 'block' && pdfDoc) {
      clearTimeout(window.pdfResizeTimeout);
      window.pdfResizeTimeout = setTimeout(() => {
        const wrappers = document.querySelectorAll('.pdf-page-wrapper');
        wrappers.forEach(wrapper => {
          const canvas = wrapper.querySelector('.pdf-page-canvas');
          // Only re-draw pages that are already loaded/visible to preserve CPU
          if (canvas && canvas.style.display === 'block') {
            const pageNum = parseInt(wrapper.getAttribute('data-page-number'));
            renderPageInline(pageNum, wrapper);
          }
        });
      }, 300);
    }
  });
});

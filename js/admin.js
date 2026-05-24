// Admin Auth & Logic
const SESSION_KEY = 'brsi_admin_auth';

document.addEventListener('DOMContentLoaded', async () => {
  // Check Login Status
  const session = sessionStorage.getItem(SESSION_KEY);
  if (session) {
    // Basic expiration check (8 hours)
    const data = JSON.parse(session);
    if (new Date().getTime() - data.time < 8 * 60 * 60 * 1000) {
      showDashboard();
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }

  // Login Handler
  document.getElementById('btn-login').addEventListener('click', handleLogin);
  document.getElementById('btn-logout').addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.reload();
  });

  // Tab Switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      document.getElementById(e.target.dataset.target).classList.add('active');
    });
  });

  // Setup Form Listeners
  setupForm('form-events', 'events', 'events-images', loadEvents);
  setupForm('form-biobuzz', 'biobuzz', 'biobuzz-covers', loadBiobuzz);
  setupForm('form-board', 'board_members', 'board-photos', loadBoard);
  setupForm('form-teams', 'team_events', 'team-images', loadTeams);
});

// Crypto Helper
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function handleLogin() {
  const pwd = document.getElementById('admin-pwd').value;
  const errorMsg = document.getElementById('login-error');
  if (!pwd) return;

  try {
    const hash = await sha256(pwd);
    
    // Fetch both admin hashes
    const { data, error } = await window.supabaseClient
      .from('settings')
      .select('key, value')
      .in('key', ['admin1_hash', 'admin2_hash']);
      
    if (error) throw error;

    const validHashes = data.map(d => d.value);
    if (validHashes.includes(hash)) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ hash, time: new Date().getTime() }));
      showDashboard();
    } else {
      errorMsg.style.display = 'block';
    }
  } catch (err) {
    console.error('Login error:', err);
    errorMsg.textContent = 'Server Error';
    errorMsg.style.display = 'block';
  }
}

function showDashboard() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('dashboard-screen').style.display = 'flex';
  
  // Load initial data
  loadEvents();
  loadBiobuzz();
  loadBoard();
  loadTeams();
  loadSettings();
}

// ========================================
// FILE UPLOAD UTILITY
// ========================================
async function uploadFile(file, bucket) {
  if (!file) return null;
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
  
  const { data, error } = await window.supabaseClient.storage
    .from(bucket)
    .upload(fileName, file, { cacheControl: '3600', upsert: false });
    
  if (error) {
    console.error('Upload Error:', error);
    alert('File upload failed: ' + error.message);
    return null;
  }
  return data.path; // Save this path to DB
}

// ========================================
// GENERIC CRUD SETUP
// ========================================
function setupForm(formId, table, bucket, reloadFn) {
  document.getElementById(formId).addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
      let payload = {};
      let idInput = e.target.querySelector('input[type="hidden"]');
      let id = idInput ? idInput.value : null;

      // Map fields specifically
      if (table === 'events') {
        payload = {
          name: document.getElementById('ev-name').value,
          event_date: document.getElementById('ev-date').value,
          description: document.getElementById('ev-desc').value,
          is_upcoming: document.getElementById('ev-upcoming').checked
        };
        const file = document.getElementById('ev-img').files[0];
        if (file) payload.image_url = await uploadFile(file, bucket);
      } 
      else if (table === 'biobuzz') {
        payload = {
          edition_name: document.getElementById('bb-name').value,
          release_date: document.getElementById('bb-date').value,
          description: document.getElementById('bb-desc').value,
          read_link: document.getElementById('bb-link').value
        };
        const imgFile = document.getElementById('bb-img').files[0];
        if (imgFile) payload.cover_url = await uploadFile(imgFile, bucket);
        
        const pdfFile = document.getElementById('bb-pdf').files[0];
        if (pdfFile) payload.read_link = await uploadFile(pdfFile, 'biobuzz-articles');
      }
      else if (table === 'board_members') {
        payload = {
          year: document.getElementById('bm-year').value,
          name: document.getElementById('bm-name').value, // mapping mismatch? table has member_name
          position: document.getElementById('bm-pos').value,
          position_order: parseInt(document.getElementById('bm-order').value) || 0
        };
        if (table === 'board_members') { payload.member_name = payload.name; delete payload.name; }
        const file = document.getElementById('bm-img').files[0];
        if (file) payload.photo_url = await uploadFile(file, bucket);
      }
      else if (table === 'team_events') {
        payload = {
          name: document.getElementById('te-name').value,
          event_date: document.getElementById('te-date').value,
          result: document.getElementById('te-result').value,
          description: document.getElementById('te-desc').value
        };
        const file = document.getElementById('te-img').files[0];
        if (file) payload.image_url = await uploadFile(file, bucket);
      }

      if (id) {
        // Update
        const { error } = await window.supabaseClient.from(table).update(payload).eq('id', id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await window.supabaseClient.from(table).insert([payload]);
        if (error) throw error;
      }

      e.target.reset();
      if(idInput) idInput.value = '';
      alert('Saved successfully!');
      reloadFn();

    } catch (err) {
      console.error(err);
      alert('Error saving data: ' + err.message);
    } finally {
      btn.textContent = 'Save';
      btn.disabled = false;
    }
  });
}

window.deleteRecord = async function(table, id, reloadFnName) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  try {
    const { error } = await window.supabaseClient.from(table).delete().eq('id', id);
    if (error) throw error;
    alert('Deleted successfully');
    
    // Call reload string
    if(reloadFnName === 'loadEvents') loadEvents();
    if(reloadFnName === 'loadBiobuzz') loadBiobuzz();
    if(reloadFnName === 'loadBoard') loadBoard();
    if(reloadFnName === 'loadTeams') loadTeams();
  } catch (err) {
    alert('Error deleting: ' + err.message);
  }
}

// ========================================
// LOAD DATA FUNCTIONS
// ========================================
async function loadEvents() {
  const { data } = await window.supabaseClient.from('events').select('*').order('event_date', { ascending: false });
  const tbody = document.querySelector('#table-events tbody');
  tbody.innerHTML = (data || []).map(ev => `
    <tr>
      <td>${ev.name}</td>
      <td>${ev.event_date}</td>
      <td>${ev.is_upcoming ? 'Yes' : 'No'}</td>
      <td>
        <button class="btn-small btn-danger" onclick="deleteRecord('events', '${ev.id}', 'loadEvents')">Del</button>
      </td>
    </tr>
  `).join('');
}

async function loadBiobuzz() {
  const { data } = await window.supabaseClient.from('biobuzz').select('*').order('release_date', { ascending: false });
  const tbody = document.querySelector('#table-biobuzz tbody');
  tbody.innerHTML = (data || []).map(bb => `
    <tr>
      <td>${bb.edition_name}</td>
      <td>${bb.release_date}</td>
      <td>
        <button class="btn-small btn-danger" onclick="deleteRecord('biobuzz', '${bb.id}', 'loadBiobuzz')">Del</button>
      </td>
    </tr>
  `).join('');
}

async function loadBoard() {
  const { data } = await window.supabaseClient.from('board_members').select('*').order('year', { ascending: false }).order('position_order', { ascending: true });
  const tbody = document.querySelector('#table-board tbody');
  tbody.innerHTML = (data || []).map(bm => `
    <tr>
      <td>${bm.year}</td>
      <td>${bm.member_name}</td>
      <td>${bm.position}</td>
      <td>
        <button class="btn-small btn-danger" onclick="deleteRecord('board_members', '${bm.id}', 'loadBoard')">Del</button>
      </td>
    </tr>
  `).join('');
}

async function loadTeams() {
  const { data } = await window.supabaseClient.from('team_events').select('*').order('event_date', { ascending: false });
  const tbody = document.querySelector('#table-teams tbody');
  tbody.innerHTML = (data || []).map(te => `
    <tr>
      <td>${te.name}</td>
      <td>${te.event_date}</td>
      <td>${te.result || '-'}</td>
      <td>
        <button class="btn-small btn-danger" onclick="deleteRecord('team_events', '${te.id}', 'loadTeams')">Del</button>
      </td>
    </tr>
  `).join('');
}

// ========================================
// SETTINGS / THEME LOGIC
// ========================================
async function loadSettings() {
  const { data } = await window.supabaseClient.from('settings').select('*');
  if(!data) return;

  const map = {};
  data.forEach(d => map[d.key] = d.value);

  // Set inputs
  if(map.theme_bg) document.getElementById('theme-bg').value = map.theme_bg;
  if(map.theme_card) document.getElementById('theme-card').value = map.theme_card;
  if(map.theme_accent) document.getElementById('theme-accent').value = map.theme_accent;
  if(map.theme_brand) document.getElementById('theme-brand').value = map.theme_brand;
  if(map.theme_heading) document.getElementById('theme-heading').value = map.theme_heading;
  if(map.theme_text) document.getElementById('theme-text').value = map.theme_text;
  
  if(map.contact_email) document.getElementById('set-email').value = map.contact_email;
  if(map.link_linkedin) document.getElementById('set-linkedin').value = map.link_linkedin;
  if(map.link_instagram) document.getElementById('set-instagram').value = map.link_instagram;
  
  if(map.desc_about) document.getElementById('set-desc-about').value = map.desc_about;
  if(map.desc_teams) document.getElementById('set-desc-teams').value = map.desc_teams;
  if(map.desc_podcast) document.getElementById('set-desc-podcast').value = map.desc_podcast;
}

window.saveSetting = async function(key, value) {
  try {
    const { error } = await window.supabaseClient.from('settings').upsert({ key, value });
    if(error) throw error;
    alert('Saved ' + key);
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

window.saveTheme = async function(key, value) {
  try {
    // Save to DB
    const { error } = await window.supabaseClient.from('settings').upsert({ key, value });
    if(error) throw error;
    // Apply live to admin panel preview
    let cssVar = '';
    if(key === 'theme_bg') cssVar = '--bg-color';
    else if(key === 'theme_card') cssVar = '--card-bg';
    else if(key === 'theme_accent') cssVar = '--accent-color';
    else if(key === 'theme_brand') cssVar = '--brand-color';
    else if(key === 'theme_heading') cssVar = '--heading-color';
    else if(key === 'theme_text') cssVar = '--text-color';
    if(cssVar) document.documentElement.style.setProperty(cssVar, value);
  } catch (err) {
    console.error(err);
  }
}

window.applyPreset = async function(type) {
  const presets = {
    dark: { theme_bg: '#f2e8c8', theme_card: '#161616', theme_accent: '#6bbfaa', theme_brand: '#d4af37', theme_heading: '#1a1a1a', theme_text: '#333333' },
    navy: { theme_bg: '#0a192f', theme_card: '#112240', theme_accent: '#64ffda', theme_brand: '#ccd6f6', theme_heading: '#ccd6f6', theme_text: '#8892b0' },
    forest: { theme_bg: '#fdfbf7', theme_card: '#1a2e1a', theme_accent: '#90ee90', theme_brand: '#d4af37', theme_heading: '#2c3e2c', theme_text: '#4a5d4a' }
  };
  const p = presets[type];
  if(!p) return;

  for(const [k, v] of Object.entries(p)) {
    document.getElementById(k.replace('_', '-')).value = v;
    await saveTheme(k, v);
  }
  alert('Preset applied!');
}

window.uploadLogo = async function() {
  const file = document.getElementById('set-logo').files[0];
  if(!file) return alert('Select an image');
  const path = await uploadFile(file, 'site-assets');
  if(path) {
    await saveSetting('logo_url', path);
  }
}

window.uploadBanner = async function() {
  const file = document.getElementById('set-banner').files[0];
  if(!file) return alert('Select an image');
  const path = await uploadFile(file, 'site-assets');
  if(path) {
    await saveSetting('homepage_banner_url', path);
  }
}

window.changePassword = async function() {
  const current = document.getElementById('pwd-current').value;
  const newpwd = document.getElementById('pwd-new').value;
  const msg = document.getElementById('pwd-msg');
  if(!current || !newpwd) return;

  try {
    const currentHash = await sha256(current);
    const newHash = await sha256(newpwd);

    // Verify current against session DB
    const { data } = await window.supabaseClient.from('settings').select('key, value').in('key', ['admin1_hash', 'admin2_hash']);
    const match = data.find(d => d.value === currentHash);
    
    if(!match) {
      msg.style.color = 'red';
      msg.textContent = 'Current password incorrect.';
      return;
    }

    // Update that specific admin hash
    const { error } = await window.supabaseClient.from('settings').update({ value: newHash }).eq('key', match.key);
    if(error) throw error;
    
    msg.style.color = 'green';
    msg.textContent = 'Password changed successfully.';
    document.getElementById('pwd-current').value = '';
    document.getElementById('pwd-new').value = '';

    // Update session
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ hash: newHash, time: new Date().getTime() }));
  } catch (err) {
    msg.style.color = 'red';
    msg.textContent = err.message;
  }
}

// Auto-update board order based on position selection
window.updateBoardOrder = function() {
  const positions = [
    "Chairperson", "Vice Chair", "Secretary", "Co Secretary", 
    "Research Head", "Editorial Head", "Events Head", 
    "Design Head", "Finance Head", "Internal Creatives", 
    "Teams Lead", "Internal HR", "PR Head"
  ];
  const pos = document.getElementById('bm-pos').value;
  const index = positions.indexOf(pos);
  if (index !== -1) {
    document.getElementById('bm-order').value = index + 1;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  initRotatingBanner();
  initHomePage();
  initDirectoryPage();
  initServiceWorker();
});

// Register Service Worker for PWA Offline Caching & Push Notifications
function initServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  // Service workers only run on HTTPS (or localhost). Registering on plain
  // http:// always throws a TypeError, so we catch that case early with a
  // clear message instead of letting the browser throw a vague error.
  const isSecure = window.location.protocol === 'https:' ||
                    window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1';

  if (!isSecure) {
    console.warn('NaijaFix: Service workers require HTTPS. Skipping registration on', window.location.origin);
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        console.log('NaijaFix Service Worker registered successfully:', reg.scope);
      })
      .catch(err => {
        console.error('NaijaFix Service Worker registration failed. Common causes: sw.js not found at site root (check the exact URL/site-root/sw.js in a browser tab), or the site is not served over HTTPS.', err);
      });
  });
}

function setupNavigation() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const closeBtn = document.getElementById('closeBtn');
  const navDrawer = document.getElementById('navDrawer');

  if (hamburgerBtn && navDrawer) {
    hamburgerBtn.addEventListener('click', () => navDrawer.classList.add('open'));
  }

  if (closeBtn && navDrawer) {
    closeBtn.addEventListener('click', () => navDrawer.classList.remove('open'));
  }
}

function initRotatingBanner() {
  const bannerSlider = document.getElementById('bannerSlider');
  if (!bannerSlider) return;

  const banners = dprosDatabase.getBanners();
  if (!banners || banners.length === 0) return;

  bannerSlider.innerHTML = banners.map((banner, index) => `
    <div class="banner-slide ${index === 0 ? 'active' : ''}">
      ${banner.image && banner.image.trim() !== "" 
        ? `<img src="${banner.image}" alt="${banner.name}" class="banner-bg-img">` 
        : `<div class="banner-bg-placeholder"><span>📷 Rotating Sponsor Banner Placeholder</span></div>`
      }
      <div class="banner-content-overlay">
        <span class="banner-tag">Featured Sponsor</span>
        <h3>${banner.name}</h3>
        <p>${banner.category} • 📍 ${banner.location}</p>
      </div>
      <a href="https://wa.me/${banner.phone}" class="banner-contact-btn" target="_blank">Chat on WhatsApp</a>
    </div>
  `).join('');

  let currentSlide = 0;
  const slides = bannerSlider.querySelectorAll('.banner-slide');

  if (slides.length > 1) {
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 4000);
  }
}

function initHomePage() {
  const featuredGrid = document.getElementById('featuredGrid');
  const categoryScroll = document.getElementById('categoryScroll');
  const homeSearchBtn = document.getElementById('homeSearchBtn');
  const homeSearchInput = document.getElementById('homeSearchInput');

  if (!featuredGrid) return; 

  const categories = dprosDatabase.getCategories();

  if (categoryScroll) {
    categoryScroll.innerHTML = categories.map((cat, index) => `
      <button class="category-chip ${index === 0 ? 'active' : ''}" data-category="${cat}">
        ${cat}
      </button>
    `).join('');

    categoryScroll.querySelectorAll('.category-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        categoryScroll.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        renderFilteredFeatured(e.target.getAttribute('data-category'));
      });
    });
  }

  renderFilteredFeatured("All Categories");

  if (homeSearchBtn && homeSearchInput) {
    homeSearchBtn.addEventListener('click', () => {
      const query = homeSearchInput.value.trim();
      window.location.href = query ? `search.html?q=${encodeURIComponent(query)}` : `search.html`;
    });

    homeSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') homeSearchBtn.click();
    });
  }
}

function renderFilteredFeatured(category) {
  const featuredGrid = document.getElementById('featuredGrid');
  if (!featuredGrid) return;

  const artisans = dprosDatabase.getArtisans();
  // Filter for active & featured professionals
  let filtered = artisans.filter(a => a.featured === true && a.active !== false);

  if (category !== "All Categories") {
    filtered = filtered.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }

  renderArtisanGrid(featuredGrid, filtered, "No featured professionals found in this category.");
}

function initDirectoryPage() {
  const directoryGrid = document.getElementById('directoryGrid');
  const dirCategoryScroll = document.getElementById('dirCategoryScroll');
  const dirSearchBtn = document.getElementById('dirSearchBtn');
  const dirSearchInput = document.getElementById('dirSearchInput');

  if (!directoryGrid) return;

  const categories = dprosDatabase.getCategories();
  let currentCategory = "All Categories";
  let searchQuery = "";

  const urlParams = new URLSearchParams(window.location.search);
  const qParam = urlParams.get('q');
  if (qParam && dirSearchInput) {
    searchQuery = qParam.toLowerCase();
    dirSearchInput.value = qParam;
  }

  if (dirCategoryScroll) {
    dirCategoryScroll.innerHTML = categories.map((cat, index) => `
      <button class="category-chip ${index === 0 ? 'active' : ''}" data-category="${cat}">
        ${cat}
      </button>
    `).join('');

    dirCategoryScroll.querySelectorAll('.category-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        dirCategoryScroll.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        currentCategory = e.target.getAttribute('data-category');
        applyDirectoryFilters();
      });
    });
  }

  if (dirSearchBtn && dirSearchInput) {
    dirSearchBtn.addEventListener('click', () => {
      searchQuery = dirSearchInput.value.trim().toLowerCase();
      applyDirectoryFilters();
    });

    dirSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') dirSearchBtn.click();
    });
  }

  function applyDirectoryFilters() {
    const artisans = dprosDatabase.getArtisans();
    // Only show active artisans in the directory
    let filtered = artisans.filter(a => a.active !== false);

    if (currentCategory !== "All Categories") {
      filtered = filtered.filter(a => a.category.toLowerCase() === currentCategory.toLowerCase());
    }

    if (searchQuery !== "") {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchQuery) || 
        a.category.toLowerCase().includes(searchQuery) || 
        a.location.toLowerCase().includes(searchQuery) || 
        a.description.toLowerCase().includes(searchQuery)
      );
    }

    renderArtisanGrid(directoryGrid, filtered, "No professionals matched your search criteria.");
  }

  applyDirectoryFilters();
}

function renderArtisanGrid(container, artisans, emptyMessage) {
  if (artisans.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 2rem;">${emptyMessage}</p>`;
    return;
  }

  container.innerHTML = artisans.map(artisan => `
    <div class="artisan-card">
      <div class="artisan-img-wrapper">
        ${artisan.image && artisan.image.trim() !== "" 
          ? `<img src="${artisan.image}" alt="${artisan.name}">` 
          : `<div class="img-placeholder"><span>📷 Add Picture</span></div>`
        }
        ${artisan.verified === true ? '<span class="verified-badge">Verified</span>' : ''}
      </div>
      
      <div class="artisan-info">
        <span class="artisan-category">${artisan.category}</span>
        <h3 class="artisan-name">${artisan.name}</h3>
        <p class="artisan-location">📍 ${artisan.location}</p>
        <p class="artisan-desc">${artisan.description}</p>
        
        <div class="card-footer-row">
          <span class="artisan-rating">⭐ ${artisan.rating} (${artisan.reviewsCount})</span>
          <a href="https://wa.me/${artisan.phone}" class="whatsapp-btn-small" target="_blank">
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

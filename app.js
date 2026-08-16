document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  initRotatingBanner();
  initHomePage();
  initDirectoryPage();
  initServiceWorker();
});

// Register Service Worker for PWA Offline Caching & Push Notifications
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('NaijaFix Service Worker registered successfully:', reg.scope);
        })
        .catch(err => {
          console.log('NaijaFix Service Worker registration failed:', err);
        });
    });
  }
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
      <a href="https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent('Hi NaijaFix, I\'m interested in ' + banner.name + ' (' + banner.category + ', ' + banner.location + ')')}" class="banner-contact-btn" target="_blank">Chat on WhatsApp</a>
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

// Combine static artisans (data.js) with live artisan listings from
// Firestore (submitted by artisans through artisan-dashboard.html).
// Falls back to static-only data if Firestore is unreachable.
async function getAllArtisans() {
  const staticArtisans = dprosDatabase.getArtisans();

  if (typeof db === 'undefined') {
    return staticArtisans;
  }

  try {
    const snapshot = await db.collection('artisans').get();
    const liveArtisans = [];

    snapshot.forEach(doc => {
      const a = doc.data();
      // Skip empty/incomplete profiles (e.g. signed up but never filled the form)
      // and skip anything the admin has deactivated
      if (!a.name || !a.category || a.active === false) return;

      liveArtisans.push({
        id: doc.id,
        name: a.name,
        category: a.category,
        location: a.location || '',
        description: a.description || '',
        phone: a.phone || '',
        image: a.image || '',
        images: a.images || [],
        verified: a.verified === true,
        featured: a.featured === true,
        active: a.active !== false,
        rating: a.rating || 0,
        reviewsCount: a.reviewsCount || 0
      });
    });

    return [...staticArtisans, ...liveArtisans];
  } catch (err) {
    console.error('NaijaFix: could not load live listings, showing static listings only.', err);
    return staticArtisans;
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

async function renderFilteredFeatured(category) {
  const featuredGrid = document.getElementById('featuredGrid');
  if (!featuredGrid) return;

  const artisans = await getAllArtisans();
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

  async function applyDirectoryFilters() {
    const artisans = await getAllArtisans();
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

// All customer WhatsApp contact goes through the platform owner's number,
// never the artisan's own number directly — this keeps every conversation
// routed through NaijaFix admin.
const OWNER_WHATSAPP = '2349135580184';

function renderArtisanGrid(container, artisans, emptyMessage) {
  if (artisans.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 2rem;">${emptyMessage}</p>`;
    return;
  }

  container.innerHTML = artisans.map((artisan, index) => `
    <div class="artisan-card">
      <div class="artisan-img-wrapper" ${(artisan.images && artisan.images.length > 0) ? `data-gallery-index="${index}"` : ''} style="${(artisan.images && artisan.images.length > 0) ? 'cursor:pointer;' : ''}">
        ${artisan.image && artisan.image.trim() !== "" 
          ? `<img src="${artisan.image}" alt="${artisan.name}">` 
          : `<div class="img-placeholder"><span>📷 Add Picture</span></div>`
        }
        ${artisan.verified === true ? '<span class="verified-badge">Verified</span>' : ''}
        ${(artisan.images && artisan.images.length > 1) ? `<span class="photo-count-badge">📷 ${artisan.images.length}</span>` : ''}
      </div>
      
      <div class="artisan-info">
        <span class="artisan-category">${artisan.category}</span>
        <h3 class="artisan-name">${artisan.name}</h3>
        <p class="artisan-location">📍 ${artisan.location}</p>
        <p class="artisan-desc">${artisan.description}</p>
        
        <div class="card-footer-row">
          <span class="artisan-rating">⭐ ${artisan.rating ? artisan.rating.toFixed(1) : '0.0'} (${artisan.reviewsCount || 0})</span>
          <a href="https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent('Hi NaijaFix, I\'m interested in ' + artisan.name + ' (' + artisan.category + ', ' + artisan.location + ')')}" class="whatsapp-btn-small" target="_blank">
            WhatsApp
          </a>
        </div>
        ${artisan.id ? `<button class="review-link-btn" data-review-id="${artisan.id}" data-review-name="${artisan.name}">Leave a Review</button>` : ''}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.review-link-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openReviewModal(btn.getAttribute('data-review-id'), btn.getAttribute('data-review-name'));
    });
  });

  // Store the artisan list on the container so the gallery can look up
  // photos by index when a card image is tapped.
  container._artisanList = artisans;

  container.querySelectorAll('[data-gallery-index]').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.getAttribute('data-gallery-index'));
      const artisan = container._artisanList[idx];
      if (artisan && artisan.images && artisan.images.length > 0) {
        openPhotoGallery(artisan.images, artisan.name);
      }
    });
  });
}

// ---------- Photo gallery lightbox (shared across all pages) ----------
let galleryPhotos = [];
let galleryCurrentIndex = 0;

function ensureGalleryModal() {
  if (document.getElementById('photoGalleryModal')) return;

  const modal = document.createElement('div');
  modal.id = 'photoGalleryModal';
  modal.innerHTML = `
    <div class="gallery-backdrop">
      <button class="gallery-close" aria-label="Close">&times;</button>
      <button class="gallery-nav gallery-prev" aria-label="Previous">&#8249;</button>
      <img class="gallery-image" src="" alt="">
      <button class="gallery-nav gallery-next" aria-label="Next">&#8250;</button>
      <div class="gallery-counter"></div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('.gallery-close').addEventListener('click', closePhotoGallery);
  modal.querySelector('.gallery-backdrop').addEventListener('click', (e) => {
    if (e.target.classList.contains('gallery-backdrop')) closePhotoGallery();
  });
  modal.querySelector('.gallery-prev').addEventListener('click', () => showGalleryPhoto(galleryCurrentIndex - 1));
  modal.querySelector('.gallery-next').addEventListener('click', () => showGalleryPhoto(galleryCurrentIndex + 1));
}

function openPhotoGallery(images, artisanName) {
  ensureGalleryModal();
  galleryPhotos = images;
  galleryCurrentIndex = 0;
  showGalleryPhoto(0);
  document.getElementById('photoGalleryModal').classList.add('open');
}

function showGalleryPhoto(index) {
  if (index < 0) index = galleryPhotos.length - 1;
  if (index >= galleryPhotos.length) index = 0;
  galleryCurrentIndex = index;

  const modal = document.getElementById('photoGalleryModal');
  modal.querySelector('.gallery-image').src = galleryPhotos[index];
  modal.querySelector('.gallery-counter').innerText = `${index + 1} / ${galleryPhotos.length}`;

  const showNav = galleryPhotos.length > 1;
  modal.querySelector('.gallery-prev').style.display = showNav ? 'flex' : 'none';
  modal.querySelector('.gallery-next').style.display = showNav ? 'flex' : 'none';
}

function closePhotoGallery() {
  const modal = document.getElementById('photoGalleryModal');
  if (modal) modal.classList.remove('open');
}

// ---------- Review submission modal ----------
function ensureReviewModal() {
  if (document.getElementById('reviewModal')) return;

  const modal = document.createElement('div');
  modal.id = 'reviewModal';
  modal.innerHTML = `
    <div class="review-backdrop">
      <div class="review-box">
        <button class="review-close" aria-label="Close">&times;</button>
        <h3 id="reviewModalTitle">Leave a Review</h3>
        <div class="star-picker" id="starPicker">
          <span data-star="1">★</span><span data-star="2">★</span><span data-star="3">★</span><span data-star="4">★</span><span data-star="5">★</span>
        </div>
        <input type="text" id="reviewerName" placeholder="Your name" />
        <textarea id="reviewComment" rows="3" placeholder="Share your experience..."></textarea>
        <div id="reviewMsg" style="min-height:1.2em; font-size:0.85rem; margin-bottom:8px;"></div>
        <button id="submitReviewBtn">Submit Review</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('.review-close').addEventListener('click', closeReviewModal);
  modal.querySelector('.review-backdrop').addEventListener('click', (e) => {
    if (e.target.classList.contains('review-backdrop')) closeReviewModal();
  });

  let selectedStars = 0;
  modal.querySelectorAll('#starPicker span').forEach(star => {
    star.addEventListener('click', () => {
      selectedStars = parseInt(star.getAttribute('data-star'));
      modal.querySelectorAll('#starPicker span').forEach((s, i) => {
        s.classList.toggle('selected', i < selectedStars);
      });
    });
  });

  modal.querySelector('#submitReviewBtn').addEventListener('click', async () => {
    const name = document.getElementById('reviewerName').value.trim();
    const comment = document.getElementById('reviewComment').value.trim();
    const msgEl = document.getElementById('reviewMsg');

    if (!name || selectedStars === 0) {
      msgEl.style.color = '#ff6b6b';
      msgEl.innerText = 'Please add your name and select a star rating.';
      return;
    }

    if (typeof db === 'undefined') {
      msgEl.style.color = '#ff6b6b';
      msgEl.innerText = 'Reviews are unavailable right now. Please try again later.';
      return;
    }

    const submitBtn = document.getElementById('submitReviewBtn');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Submitting...';

    try {
      await db.collection('reviews').add({
        artisanId: currentReviewArtisanId,
        artisanName: currentReviewArtisanName,
        customerName: name,
        rating: selectedStars,
        comment: comment,
        approved: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      msgEl.style.color = '#6dfca0';
      msgEl.innerText = 'Thank you! Your review will appear once approved.';
      setTimeout(closeReviewModal, 1800);
    } catch (err) {
      msgEl.style.color = '#ff6b6b';
      msgEl.innerText = 'Something went wrong submitting your review. Please try again.';
      console.error(err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Submit Review';
    }
  });
}

let currentReviewArtisanId = null;
let currentReviewArtisanName = null;

function openReviewModal(artisanId, artisanName) {
  ensureReviewModal();
  currentReviewArtisanId = artisanId;
  currentReviewArtisanName = artisanName;
  document.getElementById('reviewModalTitle').innerText = `Review: ${artisanName}`;
  document.getElementById('reviewerName').value = '';
  document.getElementById('reviewComment').value = '';
  document.getElementById('reviewMsg').innerText = '';
  document.querySelectorAll('#starPicker span').forEach(s => s.classList.remove('selected'));
  document.getElementById('reviewModal').classList.add('open');
}

function closeReviewModal() {
  const modal = document.getElementById('reviewModal');
  if (modal) modal.classList.remove('open');
}

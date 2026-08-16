const dprosDatabase = {
  version: "5.0",

  defaultArtisans: [
    {
      id: "art-004",
      name: "Dx Officials",
      category: "website creator",
      location: "lagos,lekki,ogombo",
      rating: 0,
      reviewsCount: 0,
      verified: false,
      featured: true,
      active: true, // Profile toggle: set to false to hide profile automatically
      phone: "2349135580184",
      image: "bicon.png", // Type your personal picture filename here
      description: "we make affordable websites for businesses and brands."
    },
  ],

  getArtisans() {
    // Only return artisans whose active status is true
    return this.defaultArtisans.filter(artisan => artisan.active !== false);
  },

  getBanners() {
    // Only return active featured artisans for the banner slider
    return this.defaultArtisans.filter(artisan => artisan.featured === true && artisan.active !== false);
  },

  getCategories() {
    // Derive categories strictly from active profiles
    const activeArtisans = this.getArtisans();
    const categories = activeArtisans.map(item => item.category);
    return ["All Categories", ...new Set(categories)];
  }
};

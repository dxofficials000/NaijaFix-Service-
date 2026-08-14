const dprosDatabase = {
  version: "4.0",

  defaultArtisans: [
    {
      id: "art-001",
      name: "Adebayo Tailoring Hub",
      category: "Tailors & Fashion",
      location: "Ikeja, Lagos",
      rating: 0,
      reviewsCount: 0,
      verified: true,
      featured: false,
      active: true, // Profile toggle: set to false to hide profile automatically
      phone: "2349135580184",
      image: "", // Type your personal picture filename here (e.g. "adebayo.jpg")
      description: "Master tailors specializing in bespoke Agbada, Senator wears, and clean corporate fitting."
    },
    {
      id: "art-002",
      name: "Chinedu Electrical & Solar",
      category: "Electricians",
      location: "Alaba, Lagos",
      rating: 0,
      reviewsCount: 0,
      verified: true,
      featured: false,
      active: true, // Profile toggle: set to false to hide profile automatically
      phone: "2349135580184",
      image: "", // Type your personal picture filename here
      description: "Professional residential wiring, solar inverter installation, and fault troubleshooting."
    },
    {
      id: "art-003",
      name: "Fatima Plumbing & Pipeworks",
      category: "Plumbers",
      location: "Abuja, FCT",
      rating: 0,
      reviewsCount: 0,
      verified: true,
      featured: false,
      active: true, // Profile toggle: set to false to hide profile automatically
      phone: "2349135580184",
      image: "", // Type your personal picture filename here
      description: "Expert leak detection, sanitary ware installation, and general domestic plumbing services."
    },
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
    {
      id: "art-005",
      name: "God's Pinnacle",
      category: "Plumbers",
      location: "lagos,lekki,ogombo",
      rating: 0,
      reviewsCount:0,
      verified: true,
      featured: true,
      active: true, // Profile toggle: set to false to hide profile automatically
      phone: "2349135580184",
      image: "vague.jpg", // Type your personal picture filename here
      description: "Expert leak detection, sanitary ware installation, and general domestic plumbing services."
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

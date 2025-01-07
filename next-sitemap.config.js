module.exports = {
    siteUrl: 'https://www.freelancedevelopmentagency.com',  // Replace with your website URL
    generateRobotsTxt: true, // Generate a robots.txt file
    exclude: [
      '/admin/*',
      '/profile/*',
      '/account/*',
      '/login',
      '/signup',
      '/reset-password',
      '/api/*',
      '/blog/edit/*',   // Exclude edit blog page
      '/blog/create',   // Exclude blog creation page
      '/confirm-email/'
    ],
    // Only include blog pages
    sitemapSize: 5000,
    changefreq: 'daily',
    priority: 0.7,  // Optional priority for blog pages
  };
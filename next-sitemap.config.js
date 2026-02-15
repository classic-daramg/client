/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.classicaldaramz.com',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 50000,
  exclude: ['/admin', '/private', '/write'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/private'],
      },
    ],
    additionalSitemaps: [
      'https://www.classicaldaramz.com/sitemap.xml',
    ],
  },
};

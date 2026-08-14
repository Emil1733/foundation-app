import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        // Explicitly welcome OpenAI's ChatGPT crawler
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
      {
        // Explicitly welcome OpenAI's Search crawler
        userAgent: 'OAI-SearchBot',
        allow: '/',
      },
      {
        // Explicitly welcome Google's AI crawler
        userAgent: 'Google-Extended',
        allow: '/',
      },
      {
        // Explicitly welcome Anthropic's Claude crawler
        userAgent: 'ClaudeBot',
        allow: '/',
      }
    ],
    sitemap: 'https://foundationrisk.org/sitemap.xml',
  };
}

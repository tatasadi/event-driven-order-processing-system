export const siteConfig = {
  name: 'Order Processing System',
  description: 'Event-Driven Order Processing with Azure',
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7071/api',
    timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
  },
};

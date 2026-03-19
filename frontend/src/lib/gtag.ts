export const GA_ID = "G-QPK6Y5FKR2";

export const pageview = (url: string) => {
  window.gtag("config", GA_ID, {
    page_path: url,
  });
};
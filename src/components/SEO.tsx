import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  noIndex?: boolean;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function toAbsoluteUrl(value: string, siteUrl: string) {
  if (!value) {
    return '';
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const path = value.startsWith('/') ? value : `/${value}`;
  return `${trimTrailingSlash(siteUrl)}${path}`;
}

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  siteName = import.meta.env.VITE_GOVERNMENT_NAME || 'Local Government Website',
  noIndex = false,
}: SEOProps) {
  const location = useLocation();
  const siteUrl = trimTrailingSlash(
    import.meta.env.VITE_WEBSITE_URL || 'https://betteraparri.org'
  );
  const defaultTitle = `${siteName} - Official Government Website`;
  const defaultDescription =
    import.meta.env.VITE_SITE_DESCRIPTION ||
    `Official website of ${siteName}. Access government services, information, and resources.`;
  const defaultKeywords =
    import.meta.env.VITE_SITE_KEYWORDS ||
    'government, local government, services, public services, civic services';

  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const fullKeywords = keywords || defaultKeywords;
  const canonicalPath = location.pathname;
  const fullUrl = toAbsoluteUrl(url || canonicalPath, siteUrl);
  const fullImage = toAbsoluteUrl(
    image || import.meta.env.VITE_OG_IMAGE_URL || '/og-image.jpg',
    siteUrl
  );
  const twitterHandle = import.meta.env.VITE_TWITTER_HANDLE || '';
  const robots = noIndex ? 'noindex, nofollow' : 'index, follow';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: siteName,
    url: siteUrl,
    logo: fullImage,
    areaServed: {
      '@type': 'AdministrativeArea',
      name: `${import.meta.env.VITE_PROVINCE || 'Cagayan'}, ${
        import.meta.env.VITE_REGION || 'Philippines'
      }`,
    },
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      <meta name="author" content={siteName} />
      <meta name="robots" content={robots} />
      <meta name="language" content="English" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:alt" content={`${siteName} preview`} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#0066eb" />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />

      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}

import { Navigate, useParams } from 'react-router-dom';
import Document from './Document';
import ServiceGuide from '../components/services/ServiceGuide';
import { getServiceGuide, guideHref } from '../data/serviceGuides';

/**
 * `/services/:category/:documentSlug`
 *
 * Shows the structured plain-language guide when one exists for the
 * slug, otherwise falls back to the markdown document.
 */
export default function ServiceDocument() {
  const { category, documentSlug } = useParams();
  const guide = getServiceGuide(documentSlug);

  if (!guide) {
    return <Document categoryType="service" />;
  }

  // Keep one canonical URL per guide if it is reached via another category.
  if (guide.category !== category) {
    return <Navigate to={guideHref(guide)} replace />;
  }

  return <ServiceGuide key={guide.slug} guide={guide} />;
}

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TestListingLayout from '../components/ui/TestListingLayout';

/* ──────────────────────────────────────────────────────────────────
   TEST LISTING BY SLUG PAGE
   Route: /test-listing/:slug  and  /lab-tests-category/:categorySlug

   This is a thin wrapper over TestListingLayout — it just resolves
   the slug to a config, sets document.title, then delegates all
   filtering, sorting and pagination to the shared layout.
────────────────────────────────────────────────────────────────── */

interface SlugConfig {
  title: string;
  breadcrumb: string;
  accent: string;
  trendingMode?: boolean;
  packagesOnly?: boolean;
  defaultCategory?: string;
}

/* Known slug → config */
const SLUG_CONFIG: Record<string, SlugConfig> = {
  'top-booked-tests': {
    title: '🔥 Top Booked Tests',
    breadcrumb: 'Top Booked Tests',
    accent: '#C2410C',
    trendingMode: true,
  },
  'women-wellness': {
    title: '💜 Women Wellness',
    breadcrumb: 'Women Wellness',
    accent: '#BE185D',
    defaultCategory: "Women's Health",
  },
  'all-lab-tests': {
    title: '🔬 All Lab Tests',
    breadcrumb: 'All Tests',
    accent: '#0D7C7C',
  },
};

/* Category­slug humaniser: "bone-health" → "Bone Health" */
const humanise = (slug: string): string =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

interface TestListingBySlugPageProps {
  slugOverride?: string;
}

const TestListingBySlugPage: React.FC<TestListingBySlugPageProps> = ({ slugOverride }) => {
  const { slug, categorySlug } = useParams<{ slug?: string; categorySlug?: string }>();

  const activeSlug = slugOverride || slug;

  // Resolve config — for /lab-tests-category/:categorySlug, always a category page
  const isCategoryRoute = !!categorySlug;
  const config: SlugConfig = SLUG_CONFIG[activeSlug ?? ''] ?? (() => {
    const label = categorySlug ? humanise(categorySlug) : (activeSlug ? humanise(activeSlug) : 'Tests');
    return {
      title: `🔬 ${label}`,
      breadcrumb: label,
      accent: '#0D7C7C',
      defaultCategory: label,
    };
  })();

  // SEO: page title
  useEffect(() => {
    const clean = config.title.replace(/^\S+\s/, '');
    document.title = `${clean} — MedSync Lab Tests`;
  }, [config.title]);

  return (
    <TestListingLayout
      title={config.title}
      breadcrumb={config.breadcrumb}
      accent={config.accent}
      trendingMode={config.trendingMode}
      packagesOnly={config.packagesOnly}
      defaultCategory={config.defaultCategory}
      hideCategoryFilter={isCategoryRoute}
    />
  );
};

export default TestListingBySlugPage;

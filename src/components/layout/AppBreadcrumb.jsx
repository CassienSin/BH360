import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { ChevronRight } from 'lucide-react';
import { useT } from '../../context/LanguageContext';

/**
 * Returns an array of breadcrumb segments for nested routes,
 * or null for top-level routes (breadcrumb not needed there).
 * Each segment: { labelKey: string, path?: string }
 * The last segment has no path (current page, not clickable).
 */
const getCrumbs = (pathname) => {
  if (pathname.startsWith('/incidents/create')) {
    return [
      { labelKey: 'nav_incidents', path: '/incidents' },
      { labelKey: 'page_report_incident' },
    ];
  }
  if (/^\/incidents\/[^/]+$/.test(pathname)) {
    return [
      { labelKey: 'nav_incidents', path: '/incidents' },
      { labelKey: 'page_incident_details' },
    ];
  }
  if (pathname.startsWith('/tanod/performance')) {
    return [
      { labelKey: 'nav_tanod_management', path: '/tanod' },
      { labelKey: 'page_performance_insights' },
    ];
  }
  return null; // top-level — caller handles
};

/**
 * AppBreadcrumb
 * - Nested routes: renders a MUI Breadcrumbs trail (Parent > Current).
 * - Top-level routes: renders the plain page title string.
 *
 * @param {string} pageTitle  Human-readable title for the current page.
 */
const AppBreadcrumb = ({ pageTitle }) => {
  const location = useLocation();
  const { t } = useT();
  const crumbs = getCrumbs(location.pathname);

  if (!crumbs) {
    // Top-level page — just show the title
    return (
      <Typography
        variant="h6"
        component="span"
        sx={{ fontWeight: 600, color: 'text.primary' }}
      >
        {pageTitle}
      </Typography>
    );
  }

  return (
    <Breadcrumbs
      separator={<ChevronRight size={14} />}
      aria-label="breadcrumb"
      sx={{ '& .MuiBreadcrumbs-separator': { mx: 0.5 } }}
    >
      {crumbs.map((crumb, i) =>
        crumb.path ? (
          <Link
            key={crumb.path}
            component={RouterLink}
            to={crumb.path}
            underline="hover"
            color="text.secondary"
            variant="body2"
            fontWeight={500}
            sx={{ '&:hover': { color: 'primary.main' } }}
          >
            {t(crumb.labelKey)}
          </Link>
        ) : (
          <Typography key={i} variant="body2" color="text.primary" fontWeight={700}>
            {t(crumb.labelKey)}
          </Typography>
        )
      )}
    </Breadcrumbs>
  );
};

export default AppBreadcrumb;

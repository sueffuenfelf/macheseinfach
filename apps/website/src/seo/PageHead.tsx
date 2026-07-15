import { Helmet } from 'react-helmet-async';
import type { ToolVariant } from '../tools/types';
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from './site-config';
import { jsonLdWebApplication, type RouteMeta } from './static-routes';

type PageHeadProps = {
    variant?: ToolVariant | null;
    fallbackTitle?: string;
    description?: string;
    canonicalPath?: string;
};

function buildMetaFromProps({
    variant,
    fallbackTitle = SITE_NAME,
    description,
    canonicalPath,
}: PageHeadProps): RouteMeta {
    const title = variant?.seo.title ?? `${fallbackTitle} — ${SITE_NAME}`;
    const desc = description ?? variant?.seo.description ?? DEFAULT_DESCRIPTION;
    const path = canonicalPath ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
    return {
        path,
        title,
        description: desc,
        h1: variant?.seo.h1,
        canonical: `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`,
        variant: variant ?? undefined,
    };
}

export function PageHead(props: PageHeadProps) {
    const meta = buildMetaFromProps(props);
    const ogImage = `${SITE_URL}/brand/logo.svg`;

    return (
        <Helmet>
            <title>{meta.title}</title>
            <meta name="description" content={meta.description} />
            <link rel="canonical" href={meta.canonical} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:title" content={meta.title} />
            <meta property="og:description" content={meta.description} />
            <meta property="og:url" content={meta.canonical} />
            <meta property="og:image" content={ogImage} />
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={meta.title} />
            <meta name="twitter:description" content={meta.description} />
            {meta.variant ? (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLdWebApplication(meta))}
                </script>
            ) : null}
        </Helmet>
    );
}

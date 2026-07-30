import { Helmet } from 'react-helmet-async';
import { defaultOgImage } from './head-tags';
import type { RouteMeta } from './route-meta';
import { robotsDirectiveForRoute, SITE_NAME } from './site-config';

type PageHeadProps = {
    meta: RouteMeta;
};

/** Runtime document head — mirrors build-time static SEO injection. */
export function PageHead({ meta }: PageHeadProps) {
    const ogImage = defaultOgImage();

    return (
        <Helmet>
            <html lang="de" />
            <title>{meta.title}</title>
            <meta name="description" content={meta.description} />
            <meta name="robots" content={robotsDirectiveForRoute(meta.noindex)} />
            <link rel="canonical" href={meta.canonical} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="de_DE" />
            <meta property="og:title" content={meta.title} />
            <meta property="og:description" content={meta.description} />
            <meta property="og:url" content={meta.canonical} />
            <meta property="og:image" content={ogImage} />
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={meta.title} />
            <meta name="twitter:description" content={meta.description} />
            {(meta.jsonLd ?? []).map((schema) => (
                <script key={JSON.stringify(schema)} type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            ))}
        </Helmet>
    );
}

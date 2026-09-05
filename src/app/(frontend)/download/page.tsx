import Link from "next/link";
import { Metadata } from 'next';
import { getSeoData } from '@/app/admin/settings/seo/seoStore';
import { createPageMetadata } from '@/utils/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('seo_download');
  return createPageMetadata(seo, '/download');
}

export default function DownloadRedirectPage() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: 'window.location.replace("/resources/");',
        }}
      />
      <main className="container py-5">
        <p>
          Redirecting to <Link href="/resources/">resources</Link>.
        </p>
      </main>
    </>
  );
}

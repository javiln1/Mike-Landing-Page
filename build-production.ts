import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const sourceDirectory = join(import.meta.dir, "design-options");
const outputDirectory = join(import.meta.dir, "dist");
const metaPixelId = "1276913444308503";

function metaPixel(conversionEvent?: "Schedule") {
  const conversionTracking = conversionEvent ? `\n      fbq('track', '${conversionEvent}');` : "";

  return `
    <!-- Meta Pixel -->
    <script>
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
      (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${metaPixelId}');
      fbq('track', 'PageView');${conversionTracking}
    </script>
    <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1" alt="" /></noscript>
    <!-- End Meta Pixel -->`;
}

function productionHtml(html: string, canonicalPath: string, conversionEvent?: "Schedule") {
  return html
    .replace(/\s*<meta name="robots" content="noindex" \/>/, "")
    .replace(/\s*<nav class="option-switcher"[\s\S]*?<\/nav>/, "")
    .replaceAll('href="option-1.html"', 'href="/"')
    .replaceAll('href="index.html"', 'href="/"')
    .replace(
      "</head>",
      `    <link rel="canonical" href="https://theremotesalesacademy.com${canonicalPath}" />\n${metaPixel(conversionEvent)}\n  </head>`,
    );
}

await mkdir(outputDirectory, { recursive: true });

const pages = [
  { source: "option-1.html", target: "index.html", canonicalPath: "/" },
  { source: "booking.html", target: "booking.html", canonicalPath: "/booking" },
  { source: "confirmation-page.html", target: "confirmation-page.html", canonicalPath: "/confirmation-page" },
  { source: "not-qualified.html", target: "not-qualified.html", canonicalPath: "/not-qualified" },
];

for (const page of pages) {
  const html = await Bun.file(join(sourceDirectory, page.source)).text();
  await Bun.write(join(outputDirectory, page.target), productionHtml(html, page.canonicalPath, page.conversionEvent));
}

for (const asset of ["shared.css", "shared.js"]) {
  await Bun.write(join(outputDirectory, asset), Bun.file(join(sourceDirectory, asset)));
}

await mkdir(join(outputDirectory, "assets"), { recursive: true });
for (const asset of [
  "vsl-remote-sales-poster.jpg",
  "vsl-remote-sales-h264.mp4",
  "money-back-guarantee.mp4",
  "placement-companies.mp4",
  "video-thumbnail.png",
  "win-story-1.png",
  "win-story-2.png",
  "client1.jpg",
  "client2.jpg",
  "client3.jpg",
]) {
  await copyFile(join(import.meta.dir, "assets", asset), join(outputDirectory, "assets", asset));
}

await Bun.write(join(outputDirectory, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: https://theremotesalesacademy.com/sitemap.xml\n");
await Bun.write(
  join(outputDirectory, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://theremotesalesacademy.com/</loc></url>\n</urlset>\n`,
);

console.log(`Built ${pages.length} production pages in ${outputDirectory}`);

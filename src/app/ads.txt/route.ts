// AdSense asks for /ads.txt naming the publisher allowed to sell ads here.
// Built from NEXT_PUBLIC_ADSENSE_CLIENT (ca-pub-…), so there is nothing to edit by hand.

export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();
  const publisher = client?.replace(/^ca-/, "");
  if (!publisher || !/^pub-\d+$/.test(publisher)) return new Response("Not found\n", { status: 404 });
  return new Response(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}

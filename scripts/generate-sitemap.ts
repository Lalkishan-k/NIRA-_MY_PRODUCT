import { buildAndSaveSitemap } from '../src/utils/sitemap.ts';

async function main() {
  console.log('🗺️  [ELA naturals Build] Generating sitemap.xml & robots.txt for search engine indexing...');
  try {
    const result = await buildAndSaveSitemap();
    console.log(`✅ [ELA naturals Build] Successfully generated sitemap with ${result.totalUrls} canonical URLs.`);
    result.writtenFiles.forEach(file => console.log(`   📄 Output: ${file}`));
  } catch (error) {
    console.error('❌ [ELA naturals Build] Error generating sitemap.xml:', error);
    process.exit(1);
  }
}

main();

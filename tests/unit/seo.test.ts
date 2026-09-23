import {describe,it,expect} from 'vitest';
import {ProjectSchema,toPublicProject} from '../../src/lib/content-schema';
import {project} from '../fixtures/project';
import {buildManifest,paginationPath} from '../../src/lib/routes';
import {structuredData,serializeStructuredData} from '../../src/lib/seo';

describe('publication manifest and SEO',()=>{
  const projects=Array.from({length:49},(_,index)=>toPublicProject(ProjectSchema.parse(project({id:`project-${index}`,slug:`project-${index}`,name:`Project ${index}`}))));
  const routes=buildManifest(projects,[]);
  it('creates finite real pages and correct next/previous paths',()=>{
    const second=routes.find(r=>r.path==='/projects/page/2/')!;
    expect(second.projects).toHaveLength(24);
    expect(paginationPath(second,1)).toBe('/projects/');
    expect(paginationPath(second,3)).toBe('/projects/page/3/');
    expect(routes.find(r=>r.path==='/projects/page/4/')).toBeUndefined();
    expect(routes.find(r=>r.path==='/')?.projects).toHaveLength(12);
  });
  it('omits missing translations from routes and alternates, not from directory browsing',()=>{
    const untranslated={...projects[0]!,locales:{en:projects[0]!.locales.en,zh:null}};
    const manifest=buildManifest([untranslated],[]);
    expect(manifest.find(r=>r.path==='/zh/projects/project-0/')).toBeUndefined();
    expect(manifest.find(r=>r.path==='/projects/project-0/')?.counterpart).toBeNull();
    expect(manifest.find(r=>r.path==='/zh/projects/')?.projects).toHaveLength(1);
  });
  it('structured lists mirror visible records, without fake ratings',()=>{
    const second=routes.find(r=>r.path==='/projects/page/2/')!;
    const graph=structuredData(second,'Projects · 2','https://example.org','Jev Atlas');
    const serialized=JSON.stringify(graph);
    expect(serialized).toContain('CollectionPage');
    expect(serialized).toContain('BreadcrumbList');
    expect(serialized).toContain('Jev Atlas');
    expect(serialized).not.toContain('aggregateRating');
    const collection=graph['@graph'][0] as {mainEntity:{itemListElement:unknown[]}};
    expect(collection.mainEntity.itemListElement).toHaveLength(24);
  });
  it('does not treat a new source check as a material content update',()=>{
    expect(routes.find(r=>r.kind==='project')?.lastmod).not.toBe(projects[0]!.checked_at);
  });
  it('escapes script markup in JSON-LD',()=>{
    const serialized=serializeStructuredData({name:'</script><img onerror=alert(1)>'});
    expect(serialized).not.toContain('<');
    expect(JSON.parse(serialized).name).toContain('</script>');
  });
});

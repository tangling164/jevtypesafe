import { describe, expect, it } from 'vitest';
import { searchProjects, parseSearch, serializeSearch, decodeSearchIndex, type SearchRecord } from '../../src/lib/search';
const records: SearchRecord[] = [
  {id:'a',slug:'a',name:'Alpha',owner:'alice',summary:'Text routing',category:'routing',tags:['agent'],ecosystem:'jev',source_status:'open_source',local_install:true,demo_url:null,stars:2,first_published_at:'2026-09-01',repo_updated_at:null,href:'/projects/a/'},
  {id:'b',slug:'b',name:'Beta',owner:'bob',summary:'Review',category:'review',tags:['agent'],ecosystem:'jev_like',source_status:'source_available',local_install:null,demo_url:'https://example.org',stars:null,first_published_at:'2026-09-02',repo_updated_at:null,href:'/projects/b/'},
  {id:'c',slug:'c',name:'Gamma',owner:null,summary:'Text routing',category:'routing',tags:[],ecosystem:'jev_integration',source_status:'open_source',local_install:false,demo_url:null,stars:0,first_published_at:'2026-09-03',repo_updated_at:null,href:'/projects/c/'},
];
describe('search', () => {
  it('rejects corrupt index rows before rendering or sorting', () => {
    const valid = {schema_version:1,locale:'en',projects:records};
    expect(decodeSearchIndex(valid,'en')).toEqual(records);
    for(const mutation of [{tags:[null]},{id:undefined},{stars:'10'},{href:'//evil.example/'},{ecosystem:'pretend'},{local_install:'yes'}]){
      expect(()=>decodeSearchIndex({...valid,projects:[{...records[0],...mutation}]},'en')).toThrow();
    }
    expect(()=>decodeSearchIndex(valid,'zh')).toThrow();
  });
  it('matches NFKC names, owner, summary and tags', () => {
    expect(searchProjects(records,parseSearch('?q=ＡＬＰＨＡ')).map(p=>p.id)).toEqual(['a']);
    expect(searchProjects(records,parseSearch('?q=alice')).map(p=>p.id)).toEqual(['a']);
    expect(searchProjects(records,parseSearch('?q=agent'))).toHaveLength(2);
  });
  it('uses OR within a dimension and AND across dimensions', () => {
    expect(searchProjects(records,parseSearch('?ecosystem=jev&ecosystem=jev_like&category=routing')).map(p=>p.id)).toEqual(['a']);
  });
  it('keeps unknown capabilities out of explicit filters and unknown stars last', () => {
    expect(searchProjects(records,parseSearch('?usage=local')).map(p=>p.id)).toEqual(['a']);
    expect(searchProjects(records,parseSearch('?sort=stars')).map(p=>p.id)).toEqual(['a','c','b']);
  });
  it('restores filters and clamps invalid page without accepting arbitrary enums', () => {
    const state = parseSearch('?q=hi&category=data&category=review&usage=online&page=2&sort=stars');
    expect(parseSearch(serializeSearch(state))).toEqual(state);
    expect(parseSearch('?page=-8&sort=bad&ecosystem=bad').page).toBe(1);
    expect(parseSearch('?ecosystem=bad').ecosystem).toEqual([]);
  });
});

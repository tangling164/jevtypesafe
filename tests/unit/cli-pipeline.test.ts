import {describe,it,expect} from 'vitest';
import {repositoryTarget,parseRepositorySnapshot,prepareReview} from '../../src/lib/ingest/repository';
import {project} from '../fixtures/project';
import {ProjectSchema} from '../../src/lib/content-schema';

describe('offline repository review pipeline',()=>{
  it('normalizes repository links without fetching arbitrary URLs',()=>{
    expect(repositoryTarget('https://github.com/owner/repo.git?utm_source=foo')).toBe('owner/repo');
    expect(repositoryTarget('https://github.com/owner/repo/tree/main')).toBe('owner/repo');
    expect(repositoryTarget('https://github.com.evil.example/owner/repo')).toBeNull();
    expect(repositoryTarget('https://github.com/login')).toBeNull();
  });
  it('rejects fake or incomplete GitHub metadata',()=>{
    expect(()=>parseRepositorySnapshot({id:'not-a-number'})).toThrow();
  });
  it('preserves published text and manual values while queuing license changes',()=>{
    const existing=ProjectSchema.parse(project({repository_id:'42'}));
    const snapshot=parseRepositorySnapshot({id:42,name:'renamed',full_name:'owner/renamed',html_url:'https://github.com/owner/renamed',owner:{login:'owner'},description:'New description',stargazers_count:99,updated_at:'2026-09-21T00:00:00Z',archived:false,fork:false,license:null,readme:'public facts',commit:'a'.repeat(40)});
    const result=prepareReview([snapshot],[existing],[{id:existing.id,stars:7}],[]);
    expect(result.review[0]?.project.id).toBe(existing.id);
    expect(result.review[0]?.project.slug).toBe(existing.slug);
    expect(result.review[0]?.project.stars).toBe(7);
    expect(result.review[0]?.project.locales.en).toEqual(existing.locales.en);
    expect(result.review[0]?.reasons).toContain('license_changed');
    expect(existing.stars).toBe(42);
  });
  it('deduplicates snapshots and excludes tombstones from review and generation',()=>{
    const snapshot=parseRepositorySnapshot({id:42,name:'repo',full_name:'owner/repo',html_url:'https://github.com/owner/repo',owner:{login:'owner'},description:null,stargazers_count:1,updated_at:'2026-09-21T00:00:00Z',archived:false,fork:false,license:null,readme:'facts',commit:'a'.repeat(40)});
    const result=prepareReview([snapshot,snapshot],[],[],[{id:'github-42'}]);
    expect(result.review).toEqual([]);expect(result.jobs).toEqual([]);
  });
});

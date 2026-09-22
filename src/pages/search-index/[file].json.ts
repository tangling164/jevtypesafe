import {createSearchIndex} from '../../lib/search-index';
export function getStaticPaths(){return (['en','zh'] as const).map(locale=>{const index=createSearchIndex(locale); return {params:{file:index.file},props:{body:index.body}};});}
export function GET({props}:{props:{body:string}}){return new Response(props.body,{headers:{'Content-Type':'application/json; charset=utf-8'}});}

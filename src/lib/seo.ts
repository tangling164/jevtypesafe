import {pagePath,projectPath,type Route} from './routes';

export function structuredData(route:Route,title:string,siteUrl:string){
  const absolute=(path:string)=>new URL(path,siteUrl).href;
  const breadcrumbs=[{name:'Jev Builds Directory',item:absolute(pagePath(route.locale))}];
  if(route.kind!=='home')breadcrumbs.push({name:title,item:absolute(route.path)});
  const list=['home','directory','category'].includes(route.kind);
  return {'@context':'https://schema.org','@graph':[
    {'@type':list?'CollectionPage':'WebPage','@id':absolute(route.path),name:title,url:absolute(route.path),inLanguage:route.locale==='zh'?'zh-Hans':'en',
      ...(list?{mainEntity:{'@type':'ItemList',numberOfItems:route.projects.length,itemListElement:route.projects.map((project,index)=>({'@type':'ListItem',position:(route.page-1)*24+index+1,name:project.name,url:absolute(projectPath(project,route.locale))}))}}:{})},
    {'@type':'BreadcrumbList',itemListElement:breadcrumbs.map((crumb,index)=>({'@type':'ListItem',position:index+1,...crumb}))},
  ]};
}
export function serializeStructuredData(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c');}

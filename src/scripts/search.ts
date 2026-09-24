import {dictionary} from '../i18n';
import {parseSearch,serializeSearch,searchProjects,decodeSearchIndex,type SearchRecord} from '../lib/search';
const root=document.querySelector<HTMLElement>('#search-app');
if(root){
  const locale=root.dataset.locale==='zh'?'zh':'en';
  const t=dictionary(locale);
  const form=root.querySelector<HTMLFormElement>('#search-form')!;
  const status=root.querySelector<HTMLElement>('#search-status')!;
  const results=root.querySelector<HTMLOListElement>('#search-results')!;
  const pagination=root.querySelector<HTMLElement>('#search-pagination')!;
  const retry=root.querySelector<HTMLButtonElement>('#retry-search')!;
  let records:SearchRecord[]|null=null;
  let state=parseSearch(location.search);
  let timer:ReturnType<typeof setTimeout>|undefined;
  function restore(){
    (form.elements.namedItem('q') as HTMLInputElement).value=state.q;
    (form.elements.namedItem('sort') as HTMLSelectElement).value=state.sort;
    form.querySelectorAll<HTMLInputElement>('input[type=checkbox]').forEach(input=>input.checked=(state[input.name as 'category'|'ecosystem'|'source'|'usage']).includes(input.value));
  }
  function render(){
    if(!records)return;
    const filtered=searchProjects(records,state);
    const pages=Math.max(1,Math.ceil(filtered.length/24));state.page=Math.min(state.page,pages);
    status.textContent=filtered.length?`${filtered.length} ${t.results}`:t.noResults;
    root!.querySelector('#filter-count')!.textContent=`(${state.category.length+state.ecosystem.length+state.source.length+state.usage.length})`;
    results.replaceChildren();pagination.replaceChildren();
    for(const [index,project] of filtered.slice((state.page-1)*24,state.page*24).entries()){
      const li=document.createElement('li');
      const article=document.createElement('article');article.className='project-row search-project-row';
      const number=document.createElement('span');number.className='project-index';number.setAttribute('aria-hidden','true');number.textContent=String(index+1).padStart(2,'0');
      const main=document.createElement('div');main.className='project-main';
      const heading=document.createElement('h3');
      const link=document.createElement('a');link.href=project.href;link.textContent=project.name;heading.append(link);
      const owner=document.createElement('p');owner.className='project-owner';owner.textContent=project.owner??'';
      const summary=document.createElement('p');summary.className='muted text-sm';summary.textContent=project.summary;
      main.append(heading);if(project.owner)main.append(owner);main.append(summary);
      const data=document.createElement('dl');data.className='project-data';
      const facts:Array<[string,string]>=[[locale==='zh'?'分类':'Category',project.category],[t.stars,project.stars===null?'—':project.stars.toLocaleString(locale)]];
      for(const [label,value] of facts){
        const group=document.createElement('div');const term=document.createElement('dt');const detail=document.createElement('dd');term.textContent=label;detail.textContent=value;group.append(term,detail);data.append(group);
      }
      const projectStatus=document.createElement('div');projectStatus.className='project-status';projectStatus.setAttribute('aria-label',locale==='zh'?'项目状态':'Project status');
      for(const label of [t[project.source_status as 'open_source']??project.source_status,t[project.ecosystem as 'jev']??project.ecosystem,...(project.local_install?[t.local]:[])]){
        const badge=document.createElement('span');badge.className='badge';badge.textContent=label;projectStatus.append(badge);
      }
      const actions=document.createElement('div');actions.className='project-actions';
      const action=document.createElement('a');action.href=project.href;action.className='button text-xs search-result-action';action.textContent=`${t.details} →`;actions.append(action);
      if(project.demo_url){const demo=document.createElement('a');demo.href=project.demo_url;demo.rel='noopener';demo.className='button text-xs';demo.textContent=`${t.demo} ↗`;actions.append(demo);}
      article.append(number,main,data,projectStatus,actions);li.append(article);results.append(li);
    }
    for(const [page,label] of [[state.page-1,t.previous],[state.page+1,t.next]] as const){
      if(page<1||page>pages)continue;
      const button=document.createElement('button');button.className='button';button.textContent=label;button.onclick=()=>{state.page=page;updateUrl();render();};pagination.append(button);
    }
  }
  function updateUrl(){const query=serializeSearch(state);history.pushState(null,'',`${location.pathname}${query?'?'+query:''}`);const lang=document.querySelector<HTMLAnchorElement>('#language-switch');if(lang)lang.search=query;}
  function update(){state=parseSearch(new URLSearchParams(new FormData(form) as unknown as Record<string,string>));updateUrl();render();}
  form.addEventListener('submit',event=>{event.preventDefault();clearTimeout(timer);update();});
  form.addEventListener('change',()=>{clearTimeout(timer);update();});
  form.querySelector('#q')!.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(update,150);});
  root.querySelector('#clear-filters')!.addEventListener('click',()=>{clearTimeout(timer);state=parseSearch('');restore();updateUrl();render();});
  root.querySelector('#close-filters')!.addEventListener('click',()=>{const details=root.querySelector<HTMLDetailsElement>('#filters-panel')!;details.open=false;details.querySelector('summary')!.focus();});
  addEventListener('popstate',()=>{clearTimeout(timer);state=parseSearch(location.search);restore();render();const lang=document.querySelector<HTMLAnchorElement>('#language-switch');if(lang)lang.search=location.search;});
  async function load(){
    status.textContent=t.loading;retry.hidden=true;
    try{
      const response=await fetch(root!.dataset.index!,{signal:AbortSignal.timeout(10_000)});if(!response.ok)throw Error('index');
      const index=await response.json();
      records=decodeSearchIndex(index,root!.dataset.locale!);render();
    }catch{records=null;results.replaceChildren();pagination.replaceChildren();status.textContent=t.indexFailed;retry.hidden=false;}
  }
  retry.onclick=load;restore();void load();
}

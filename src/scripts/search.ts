import {dictionary} from '../i18n';
import {parseSearch,serializeSearch,searchProjects,decodeSearchIndex,type SearchRecord} from '../lib/search';
const root=document.querySelector<HTMLElement>('#search-app');
if(root){
  const t=dictionary(root.dataset.locale==='zh'?'zh':'en');
  const form=root.querySelector<HTMLFormElement>('#search-form')!;
  const status=root.querySelector<HTMLElement>('#search-status')!;
  const results=root.querySelector<HTMLUListElement>('#search-results')!;
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
    for(const project of filtered.slice((state.page-1)*24,state.page*24)){
      const li=document.createElement('li');
      const article=document.createElement('article');article.className='project-row search-project-row';
      const main=document.createElement('div');main.className='project-main';
      const mark=document.createElement('span');mark.className='project-monogram';mark.setAttribute('aria-hidden','true');mark.textContent=project.name.slice(0,1).toUpperCase();
      const copy=document.createElement('div');copy.className='min-w-0';
      const heading=document.createElement('h3');
      const link=document.createElement('a');link.href=project.href;link.textContent=project.name;heading.append(link);
      const summary=document.createElement('p');summary.className='muted text-sm';summary.textContent=project.summary;
      const badge=document.createElement('span');badge.className='badge';badge.textContent=t[project.source_status as 'open_source']??project.source_status;
      const action=document.createElement('a');action.href=project.href;action.className='search-result-action';action.textContent=`${t.details} →`;
      copy.append(heading,summary,badge);main.append(mark,copy);article.append(main,action);li.append(article);results.append(li);
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

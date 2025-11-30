const JAVA_HOSTS = ['play.craftify.cz','axolotl.hostify.cz:37480','94.112.255.118:37480'];
const buildUrl = host => `https://api.mcsrvstat.us/2/${encodeURIComponent(host)}`;

const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const playerCount = document.getElementById('player-count');
const playerMax = document.getElementById('player-max');
const serverVersion = document.getElementById('server-version');
const toast = document.getElementById('toast');

function showToast(text){
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),1500);
}

async function fetchStatus(host){
  const res = await fetch(buildUrl(host),{cache:'no-store'});
  if(!res.ok) throw new Error('status');
  return res.json();
}

function setStatus(state,text,data){
  statusDot.classList.remove('online','offline','warn');
  statusDot.classList.add(state);
  statusText.textContent = text;
  const pc = data && data.players && typeof data.players.online === 'number' ? data.players.online : 0;
  const pm = data && data.players && typeof data.players.max === 'number' ? data.players.max : 0;
  playerCount.textContent = pc;
  playerMax.textContent = pm;
  if(data && data.version){ serverVersion.textContent = data.version; }
}

async function updateJavaStatus(){
  try{
    let firstData = null;
    for(const host of JAVA_HOSTS){
      try{
        const data = await fetchStatus(host);
        if(!firstData) firstData = data;
        if(data.online){ setStatus('online','Server je online',data); return; }
      }catch{}
    }
    if(firstData){
      const srvActive = !!(firstData.debug && firstData.debug.srv);
      const pingTimeout = !!(firstData.debug && firstData.debug.error && firstData.debug.error.ping);
      if(srvActive || pingTimeout){ setStatus('warn','Nelze ověřit stav (ping timeout / SRV)',firstData); return; }
      setStatus('offline','Server je offline',firstData);
    }else{ setStatus('offline','Nelze načíst stav',null); }
  }catch{ setStatus('offline','Nelze načíst stav',null); }
}

function bindCopy(){
  document.querySelectorAll('.copy-btn').forEach(el=>{
    el.addEventListener('click',()=>{
      const v = el.getAttribute('data-copy');
      if(!v) return;
      navigator.clipboard.writeText(v).then(()=>showToast('Zkopírováno: '+v));
    });
  });
}

bindCopy();
updateJavaStatus();
setInterval(updateJavaStatus,30000);

/* Mobile nav */
const mobileNav = document.getElementById('mobile-nav-select');
if(mobileNav){
  const current = location.pathname.split('/').pop() || 'index.html';
  Array.from(mobileNav.options).forEach(opt=>{
    if(opt.value === current) opt.selected = true;
  });
  mobileNav.addEventListener('change',()=>{
    const url = mobileNav.value;
    location.href = url;
  });
}

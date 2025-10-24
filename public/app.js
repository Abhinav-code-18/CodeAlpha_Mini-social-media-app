// Frontend interactions - aligned to MongoDB responses
const api = (path, opts={}) => {
  const uid = document.getElementById('userSelect').value;
  const headers = opts.headers || {};
  if(uid) headers['X-User-Id'] = uid;
  const final = fetch('/api'+path, {...opts, headers: {...headers, 'Content-Type': 'application/json'} });
  return final.then(r => r.json());
};

async function loadUsers(){
  const users = await api('/users', {method:'GET'});
  const sel = document.getElementById('userSelect');
  if(!Array.isArray(users)) { sel.innerHTML = '<option value="">--guest--</option>'; return; }
  sel.innerHTML = '<option value="">--guest--</option>' + users.map(u=>`<option value="${u._id}">${u.display_name} (@${u.username})</option>`).join('');
  sel.addEventListener('change', ()=>{ loadProfile(); loadFeed(); });
}

async function loadProfile(){
  const uid = document.getElementById('userSelect').value;
  const el = document.getElementById('profileCard');
  if(!uid){
    el.innerHTML = '<h2>Not signed in</h2><p class="small">Select a user to act as them for demo actions (post, like, follow)</p>';
    return;
  }
  const user = await api('/users/'+uid, {method:'GET'});
  el.innerHTML = `<h2>${user.display_name}</h2><p class="small">@${user.username}</p><p>${user.bio||''}</p>
    <p class="small">Followers: ${user.followers} · Following: ${user.following}</p>`;
}

async function loadFeed(){
  const feed = document.getElementById('feed');
  feed.innerHTML = '<p class="small">Loading...</p>';
  const posts = await api('/posts', {method:'GET'});
  if(!Array.isArray(posts)){ feed.innerHTML = '<p class="small">Error loading feed</p>'; return;}
  feed.innerHTML = posts.map(renderPost).join('');
  attachPostHandlers();
}

function renderPost(p){
  const id = p._id || p.id;
  const content = escapeHtml(p.content);
  const created = new Date(p.created_at).toLocaleString();
  return `<article class="post" data-id="${id}">
    <div class="meta"><div><span class="author">${p.display_name}</span> <span class="small">@${p.username}</span></div><div class="small">${created}</div></div>
    <div class="content">${content}</div>
    <div class="actions">
      <button class="btn-like" data-id="${id}">♡ <span class="small like-count">${p.like_count||0}</span></button>
      <button class="btn-comment" data-id="${id}">💬 <span class="small comment-count">${p.comment_count||0}</span></button>
    </div>
    <div class="comments" id="comments-${id}" style="display:none"></div>
  </article>`;
}

function attachPostHandlers(){
  document.querySelectorAll('.btn-like').forEach(b=>{
    b.onclick = async (e)=>{
      const id = b.getAttribute('data-id');
      await api('/like',{method:'POST', body: JSON.stringify({target_type:'post', target_id: id})});
      await loadFeed();
    };
  });
  document.querySelectorAll('.btn-comment').forEach(b=>{
    b.onclick = async (e)=>{
      const id = b.getAttribute('data-id');
      const box = document.getElementById('comments-'+id);
      if(box.style.display === 'none'){ await showComments(id); box.style.display = 'block'; }
      else { box.style.display = 'none'; }
    };
  });
}

async function showComments(postId){
  const box = document.getElementById('comments-'+postId);
  box.innerHTML = '<p class="small">Loading comments...</p>';
  const comments = await api('/posts/'+postId+'/comments', {method:'GET'});
  const html = (comments||[]).map(c=>`<div class="comment"><div><div class="who">${c.display_name}</div><div class="small">@${c.username}</div></div><div style="flex:1"><div class="small">${escapeHtml(c.content)}</div></div></div>`).join('');
  box.innerHTML = html + `<div style="margin-top:8px"><input id="cinput-${postId}" placeholder="Write a comment..." style="width:70%;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.04)"><button data-id="${postId}" class="btn-comment-post" style="margin-left:8px;padding:8px 10px;border-radius:8px;border:none;background:var(--accent);color:#022">Comment</button></div>`;
  box.querySelector('.btn-comment-post').onclick = async ()=>{
    const val = document.getElementById('cinput-'+postId).value;
    if(!val) return alert('comment empty');
    await api('/posts/'+postId+'/comments',{method:'POST', body: JSON.stringify({content:val})});
    await showComments(postId);
    await loadFeed();
  };
}

function escapeHtml(s){ return (s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

document.getElementById('btnPost').onclick = async ()=>{
  const content = document.getElementById('postContent').value;
  if(!content) return alert('empty');
  await api('/posts',{method:'POST', body: JSON.stringify({content})});
  document.getElementById('postContent').value = '';
  await loadFeed();
};

(async ()=>{ await loadUsers(); await loadFeed(); await loadProfile(); })();

document.addEventListener('DOMContentLoaded', () => {
  AOS.init();

  /* ===== Dark mode ===== */
  const darkToggle = document.getElementById('darkModeToggle');
  const theme = localStorage.getItem('theme') || 'light';
  if (theme === 'dark') document.body.classList.add('theme-dark');
  darkToggle?.addEventListener('click', () => {
    document.body.classList.toggle('theme-dark');
    localStorage.setItem('theme', document.body.classList.contains('theme-dark') ? 'dark' : 'light');
  });

  /* ===== Mobile menu height toggle ===== */
  const menuButton = document.getElementById('menu');
  const header = document.getElementById('header');
  let headerVisible = false;
  menuButton?.addEventListener('click', () => {
    header.style.height = headerVisible ? '70px' : '270px';
    headerVisible = !headerVisible;
  });

  /* ===== Gate auth ===== */
  const authGate = document.getElementById('authGate');
  const loginForm = document.getElementById('gateLogin');
  const registerForm = document.getElementById('gateRegister');
  const rememberMe = document.getElementById('rememberMe');
  const tabBtns = document.querySelectorAll('.tab-btn');

  function showGateTab(which) {
    tabBtns.forEach(tb => tb.classList.toggle('active', tb.dataset.tab === which));
    loginForm.classList.toggle('active', which === 'login');
    registerForm.classList.toggle('active', which === 'register');
  }
  tabBtns.forEach(tb => tb.addEventListener('click', () => showGateTab(tb.dataset.tab)));

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (!currentUser) {
    authGate.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  } else {
    authGate.style.display = 'none';
    document.body.style.overflow = '';
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('input[type="email"]').value.trim();
    const password = loginForm.querySelector('input[type="password"]').value.trim();
    const ok = window.authSystem.login(email, password);
    if (ok) {
      if (rememberMe?.checked) localStorage.setItem('rememberMe', '1');
      authGate.style.display = 'none';
      document.body.style.overflow = '';
      toast('Login successful!', 'success');
    }
  });

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = registerForm.querySelector('input[type="text"]').value.trim();
    const email = registerForm.querySelector('input[type="email"]').value.trim();
    const pwd = registerForm.querySelectorAll('input[type="password"]')[0].value.trim();
    const conf = registerForm.querySelectorAll('input[type="password"]')[1].value.trim();
    const ok = window.authSystem.register(name, email, pwd, conf);
    if (ok) {
      authGate.style.display = 'none';
      document.body.style.overflow = '';
      toast('Registration successful!', 'success');
    }
  });

  /* ===== Render products (main + goodies) ===== */
  const grid = document.getElementById('productGrid');
  const goodiesGrid = document.getElementById('goodiesGrid');

  function productCard(p){
    return `<article class="product" data-category="${p.category}" data-price="${p.price}" data-aos="fade-up" data-aos-delay="100">
      <div class="product-image">
        <img class="main-image" src="${p.image}" alt="${p.name}" loading="lazy">
        <img class="effect-image" src="${p.hoverImage||p.image}" alt="${p.name} hover" loading="lazy">
        ${p.badge?`<span class="badge-tag">${p.badge}</span>`:''}
        <button class="quick-view" aria-label="Quick view"><i class="fa-solid fa-eye"></i></button>
        <button class="wishlist-toggle" aria-label="Add to wishlist"><i class="fa-solid fa-heart"></i></button>
      </div>
      <div class="product-details">
        <p class="product-name">${p.name}</p>
        <p class="product-price">Price - $${p.price.toFixed(2)}${p.unit?`/${p.unit}`:''}</p>
        <div class="rating">${'★'.repeat(Math.round(p.rating||4))}${'☆'.repeat(5-Math.round(p.rating||4))}</div>
        <button class="product-button add-to-cart" data-name="${p.name}" data-price="$${p.price.toFixed(2)}" data-image="${p.image}">Add To Cart</button>
      </div>
    </article>`;
  }

  function renderCatalog(){
    grid.innerHTML = PRODUCTS.map(productCard).join('');
    bindCardEvents(grid);
  }
  function renderGoodies(){
    const goodies = PRODUCTS.filter(p=>p.category==='Goodies' && p.popular);
    goodiesGrid.innerHTML = goodies.map(productCard).join('');
    bindCardEvents(goodyiesParent=goodiesGrid);
  }

  function bindCardEvents(parent){
    parent.querySelectorAll('.add-to-cart').forEach(btn=>{
      btn.addEventListener('click',(e)=>{
        e.preventDefault();
        const product = { name: btn.dataset.name, price: btn.dataset.price, image: btn.dataset.image };
        cart.addItem(product);
        toast(`Added ${product.name} to cart!`, 'success');
      });
    });
    parent.querySelectorAll('.wishlist-toggle').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const card = btn.closest('.product');
        const name = card.querySelector('.product-name').textContent;
        const image = card.querySelector('.main-image').src;
        const priceText = card.querySelector('.product-price').textContent;
        wishlist.toggle({ name, image, price: priceText.match(/\$[0-9.]+/)?.[0]||'$0' });
        btn.classList.toggle('active');
      });
    });
    parent.querySelectorAll('.quick-view').forEach(qv=>{
      qv.addEventListener('click',()=>{
        const card = qv.closest('.product');
        const name = card.querySelector('.product-name').textContent;
        const priceText = card.querySelector('.product-price').textContent;
        const img = card.querySelector('.main-image').src;
        quickViewModal.querySelector('.modal-body').innerHTML = `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
            <img src="${img}" alt="${name}" style="width:100%;border-radius:12px;object-fit:cover" />
            <div>
              <h3>${name}</h3>
              <p>${priceText}</p>
              <button class="btn" id="quickAdd">Add to Cart</button>
            </div>
          </div>`;
        quickViewModal.style.display='block';
        addRecentlyViewed(name);
        document.getElementById('quickAdd').addEventListener('click',()=>{
          cart.addItem({ name, price: priceText.match(/\$[0-9.]+/)?.[0]||'$0', image: img });
          toast(`Added ${name} to cart!`, 'success');
        });
      });
    });
  }

  renderCatalog();
  renderGoodies();

  /* ===== Filters, search, sort, pagination on main grid ===== */
  const categorySelect = document.getElementById('categorySelect');
  const priceRange = document.getElementById('priceRange');
  const priceDisplay = document.getElementById('priceDisplay');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const pagination = document.getElementById('pagination');

  let currentPage = 1;
  const PAGE_SIZE = 8;

  function parsePrice(str){ const m = String(str).match(/\$\s*([0-9]+(?:\.[0-9]{1,2})?)/); return m?parseFloat(m[1]):0; }

  function getFiltered(){
    const category = categorySelect.value;
    const maxPrice = parseFloat(priceRange.value);
    const term = searchInput.value.trim().toLowerCase();
    return PRODUCTS.filter(p => (category==='All' || p.category===category) && p.price <= maxPrice + 0.0001 && (!term || p.name.toLowerCase().includes(term)));
  }

  function sorted(list){
    const sorter = {
      'popular': (a,b) => (b.popular?1:0)-(a.popular?1:0),
      'priceAsc': (a,b) => a.price - b.price,
      'priceDesc': (a,b) => b.price - a.price,
      'nameAsc': (a,b) => a.name.localeCompare(b.name),
      'nameDesc': (a,b) => b.name.localeCompare(a.name)
    }[sortSelect.value] || (()=>0);
    return list.slice().sort(sorter);
  }

  function renderPage(){
    const list = sorted(getFiltered());
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const visible = list.slice(start, start + PAGE_SIZE);
    grid.innerHTML = visible.map(productCard).join('');
    bindCardEvents(grid);
    // pagination
    pagination.innerHTML = '';
    for(let i=1;i<=totalPages;i++){
      const btn = document.createElement('button');
      btn.className = 'page-btn' + (i===currentPage?' active':'');
      btn.textContent = i;
      btn.addEventListener('click',()=>{ currentPage=i; renderPage(); window.scrollTo({top:document.getElementById('catalog').offsetTop-80, behavior:'smooth'}); });
      pagination.appendChild(btn);
    }
  }

  priceDisplay.textContent = `$${Number(priceRange.value).toFixed(2)}`;
  priceRange.addEventListener('input', () => { priceDisplay.textContent = `$${Number(priceRange.value).toFixed(2)}`; currentPage=1; renderPage(); });
  categorySelect.addEventListener('change', () => { currentPage=1; renderPage(); });
  sortSelect.addEventListener('change', () => { currentPage=1; renderPage(); });
  searchInput.addEventListener('input', () => { currentPage=1; renderPage(); });

  renderPage();

  // Goodies nav scroll
  document.querySelectorAll('a[data-scroll="goodies"]').forEach(a=>a.addEventListener('click', (e)=>{ e.preventDefault(); document.getElementById('goodies').scrollIntoView({behavior:'smooth'}); }));

  /* ===== Cart ===== */
  const cart = new ShoppingCart();
  const cartIcon = document.getElementById('cartBtn');
  const cartModal = document.getElementById('cartModal');
  const closeCart = cartModal.querySelector('.close-cart');
  cartIcon.addEventListener('click', () => { cartModal.style.display='block'; cart.render(); });
  closeCart.addEventListener('click', () => { cartModal.style.display='none'; });
  window.addEventListener('click', (e)=>{ if(e.target===cartModal) cartModal.style.display='none'; });

  /* ===== Wishlist ===== */
  const wishlist = new Wishlist({ countEl: document.getElementById('wishlistCount') });
  const wishlistBtn = document.getElementById('wishlistBtn');
  const wishlistModal = document.getElementById('wishlistModal');
  const closeWishlist = wishlistModal.querySelector('.close-wishlist');
  wishlistBtn.addEventListener('click', () => { wishlistModal.style.display='block'; wishlist.render(); });
  closeWishlist.addEventListener('click', () => { wishlistModal.style.display='none'; });
  window.addEventListener('click', (e)=>{ if(e.target===wishlistModal) wishlistModal.style.display='none'; });

  /* ===== Quick View & Recently Viewed ===== */
  const quickViewModal = document.getElementById('quickViewModal');
  const quickClose = quickViewModal.querySelector('.close-modal');
  function addRecentlyViewed(name){
    const rv = JSON.parse(localStorage.getItem('recentlyViewed')||'[]');
    const idx = rv.indexOf(name); if(idx>=0) rv.splice(idx,1);
    rv.unshift(name); if(rv.length>5) rv.pop();
    localStorage.setItem('recentlyViewed', JSON.stringify(rv));
    renderRecentlyViewed();
  }
  function renderRecentlyViewed(){
    const rv = JSON.parse(localStorage.getItem('recentlyViewed')||'[]');
    const list = document.getElementById('recentlyViewed');
    list.innerHTML = rv.map(n=>`<li>${n}</li>`).join('');
  }
  renderRecentlyViewed();
  quickClose.addEventListener('click', () => { quickViewModal.style.display='none'; });
  window.addEventListener('click', (e)=>{ if(e.target===quickViewModal) quickViewModal.style.display='none'; });

  /* ===== Profile modal ===== */
  const profileModal = document.getElementById('profileModal');
  const profileClose = profileModal.querySelector('.close-modal');
  const userBtn = document.getElementById('userBtn');
  userBtn.addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('currentUser')||'null');
    if (!user) { authGate.style.display='flex'; document.body.style.overflow='hidden'; showGateTab('login'); return; }
    profileModal.querySelector('.user-name').textContent = `Name: ${user.name}`;
    profileModal.querySelector('.user-email').textContent = `Email: ${user.email}`;
    profileModal.style.display = 'block';
  });
  profileClose.addEventListener('click', () => { profileModal.style.display='none'; });
  profileModal.querySelector('.logout-btn').addEventListener('click', () => {
    window.authSystem.logout();
    profileModal.style.display='none';
    authGate.style.display='flex';
    document.body.style.overflow='hidden';
  });

  /* ===== Newsletter ===== */
  const subscribeForm = document.getElementById('subscribeForm');
  const subscribeEmail = document.getElementById('subscribeEmail');
  subscribeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = subscribeEmail.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) return alert('Please enter a valid email address.');
    toast(`Thank you for subscribing: ${email}`, 'success');
    subscribeEmail.value='';
  });

  /* ===== Toast helper ===== */
  function toast(message, type='info'){
    const div = document.createElement('div');
    div.className = 'success-message';
    div.textContent = message;
    if(type==='error') div.style.background='#e53935';
    document.body.appendChild(div);
    setTimeout(()=>div.remove(),2200);
  }
});

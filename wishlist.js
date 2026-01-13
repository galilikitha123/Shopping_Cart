class Wishlist {
  constructor(opts={}){ this.items = JSON.parse(localStorage.getItem('wishlist'))||[]; this.countEl = opts.countEl || document.getElementById('wishlistCount'); this.updateCount(); }
  save(){ localStorage.setItem('wishlist', JSON.stringify(this.items)); }
  updateCount(){ if(this.countEl){ this.countEl.textContent=String(this.items.length); this.countEl.classList.remove('bump'); void this.countEl.offsetWidth; this.countEl.classList.add('bump'); } }
  toggle(product){ const idx=this.items.findIndex(i=>i.name===product.name); if(idx>=0){ this.items.splice(idx,1); } else { this.items.push(product); } this.save(); this.updateCount(); this.render(); }
  remove(name){ this.items = this.items.filter(i=>i.name!==name); this.save(); this.updateCount(); this.render(); }
  render(){ const modal=document.getElementById('wishlistModal'); if(!modal) return; const content=modal.querySelector('.wishlist-content'); content.innerHTML=''; if(this.items.length===0){ content.innerHTML='<p class="empty-cart">Your wishlist is empty</p>'; return; } this.items.forEach(item=>{ const row=document.createElement('div'); row.className='wishlist-item'; row.innerHTML=`
      <img src="${item.image}" alt="${item.name}">
      <div>
        <strong>${item.name}</strong>
        <div style="color:#666">${item.price||''}</div>
      </div>
      <div style="display:flex;gap:.5rem;align-items:center">
        <button class="wishlist-add">Add to Cart</button>
        <button class="remove-wishlist">Remove</button>
      </div>`; content.appendChild(row);
      row.querySelector('.wishlist-add').addEventListener('click',()=>{
        const cart = new ShoppingCart();
        cart.addItem({ name:item.name, price:item.price||'$0', image:item.image });
      });
      row.querySelector('.remove-wishlist').addEventListener('click',()=>this.remove(item.name));
    });
  }
}

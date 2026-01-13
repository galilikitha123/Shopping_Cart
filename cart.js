class ShoppingCart {
  constructor(){ this.items = JSON.parse(localStorage.getItem('cart'))||[]; this.updateCartCount(); }
  save(){ localStorage.setItem('cart', JSON.stringify(this.items)); }
  updateCartCount(){ const c = this.items.reduce((t,i)=>t+i.quantity,0); const el=document.querySelector('.cart-count'); if(el){ el.textContent=String(c); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); el.style.display = c>0 ? 'flex' : 'none'; } }
  addItem(product){ const price = parseFloat(String(product.price).replace(/[^0-9.]/g,''))||0; const ex=this.items.find(i=>i.name===product.name); if(ex) ex.quantity+=1; else this.items.push({name:product.name,price,quantity:1,image:product.image}); this.save(); this.updateCartCount(); this.render(); const content=document.querySelector('.cart-modal-content'); if(content) content.scrollTop=0; }
  removeItem(name){ this.items = this.items.filter(i=>i.name!==name); this.save(); this.updateCartCount(); this.render(); }
  updateQuantity(name,q){ const item=this.items.find(i=>i.name===name); if(!item) return; item.quantity=Math.max(0,parseInt(q,10)||0); if(item.quantity<=0) this.removeItem(name); else { this.save(); this.updateCartCount(); this.render(); } }
  total(){ return this.items.reduce((t,i)=>t+i.price*i.quantity,0).toFixed(2); }
  render(){ const modal=document.getElementById('cartModal'); if(!modal) return; const content = modal.querySelector('.cart-content'); content.innerHTML=''; if(this.items.length===0){ content.innerHTML='<p class="empty-cart">Your cart is empty</p>'; return; } this.items.forEach(item=>{ const row=document.createElement('div'); row.className='cart-item'; row.innerHTML=`
      <img src="${item.image}" alt="${item.name}">
      <div>
        <strong>${item.name}</strong>
        <div style="color:#666">Price: $${item.price.toFixed(2)}</div>
        <div class="quantity-controls">
          <button class="quantity-btn minus">-</button>
          <input type="number" class="quantity-input" min="1" value="${item.quantity}">
          <button class="quantity-btn plus">+</button>
        </div>
      </div>
      <button class="remove-item">×</button>`; content.appendChild(row);
      const minus=row.querySelector('.minus'); const plus=row.querySelector('.plus'); const input=row.querySelector('.quantity-input'); const remove=row.querySelector('.remove-item');
      minus.addEventListener('click',()=>this.updateQuantity(item.name,item.quantity-1));
      plus.addEventListener('click',()=>this.updateQuantity(item.name,item.quantity+1));
      input.addEventListener('change',(e)=>this.updateQuantity(item.name,e.target.value));
      remove.addEventListener('click',()=>this.removeItem(item.name));
    });
    const totalBar=document.createElement('div'); totalBar.className='cart-total'; totalBar.innerHTML=`<h3>Total: $${this.total()}</h3><button class="btn checkout-btn">Proceed to Checkout</button>`; content.appendChild(totalBar);
    totalBar.querySelector('.checkout-btn').addEventListener('click',()=>alert('Checkout is a demo. Integrate with your backend/payment gateway.'));
  }
}

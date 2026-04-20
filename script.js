/* ==========================================================================
   PREMIUM STORE - GENEL JAVASCRIPT MANTIĞI
   ========================================================================== */

// 1. GLOBAL DEĞİŞKENLER
let cart = [];
let total = 0;
let orijinalFiyat = 0;
let guncelFiyat = 0;
let indirimAktif = false;

// Sayfa yüklendiğinde hangi sayfada olduğumuzu kontrol et ve ilgili başlatıcıyı çalıştır
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cartPanel')) {
        // Ana Sayfadayız (index.html)
        console.log("Mağaza sayfası yüklendi.");
    } else if (document.getElementById('payForm')) {
        // Ödeme Sayfasındayız (odeme.html)
        baslatOdemeSayfasi();
    }
});

/* ==========================================================================
   MAĞAZA VE SEPET FONKSİYONLARI (index.html)
   ========================================================================== */

   function addToCart(name, price) {
    cart.push({ name, price });
    total += price;
    updateUI();
    
    // Sepet yazısını salla (Mikro etkileşim)
    const cartTrigger = document.querySelector('.cart-trigger');
    cartTrigger.classList.add('cart-shake');
    
    // 0.4 saniye sonra sallanma sınıfını kaldır ki tekrar eklenebilsin
    setTimeout(() => {
        cartTrigger.classList.remove('cart-shake');
    }, 400);

    // Apple tarzı: Ürün eklenince sepeti otomatik ama yumuşakça aç
    if (!document.getElementById('cartPanel').classList.contains('active')) {
        setTimeout(() => {
            toggleCart();
        }, 300);
    }
}

function updateUI() {
    const cartCount = document.getElementById('cart-count');
    const totalPrice = document.getElementById('total');
    const list = document.getElementById('cartList');

    if (cartCount) cartCount.innerText = cart.length;
    if (totalPrice) totalPrice.innerText = total.toLocaleString('tr-TR') + " TL";
    
    if (list) {
        list.innerHTML = "";
        if (cart.length === 0) {
            list.innerHTML = `<p style="text-align:center; color:#86868b; margin-top:50px;">Çantanız boş.</p>`;
        }
        cart.forEach((item, i) => {
            list.innerHTML += `
                <div class="cart-item">
                    <div>
                        <b>${item.name}</b><br>
                        <small style="color:#86868b">${item.price.toLocaleString('tr-TR')} TL</small>
                    </div>
                    <button onclick="removeItem(${i})" style="background:none; border:none; color:#0066cc; cursor:pointer; font-size:0.8rem">Kaldır</button>
                </div>`;
        });
    }
}

function removeItem(i) {
    total -= cart[i].price;
    cart.splice(i, 1);
    updateUI();
}

function toggleCart() {
    const panel = document.getElementById('cartPanel');
    const overlay = document.getElementById('overlay');
    if (panel) panel.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

function goCheckout() {
    if (cart.length === 0) return alert("Çantanız boş!");
    localStorage.setItem('toplamTutar', total);
    window.location.href = 'odeme.html';
}

/* ==========================================================================
   ÖDEME SAYFASI FONKSİYONLARI (odeme.html)
   ========================================================================== */

function baslatOdemeSayfasi() {
    const kaydedilenVeri = localStorage.getItem('toplamTutar');
    if (kaydedilenVeri && kaydedilenVeri !== "0") {
        orijinalFiyat = Number(kaydedilenVeri);
        guncelFiyat = orijinalFiyat;
        tutarYazdir();
        odemeDinleyicileriniKur();
    } else {
        window.location.href = 'index.html';
    }
}

function tutarYazdir() {
    const tutarAlani = document.getElementById('gosterilecek-tutar');
    if (tutarAlani) tutarAlani.innerText = guncelFiyat.toLocaleString('tr-TR') + " TL";
}

function handlePromo() {
    const input = document.getElementById('kupon-kodu');
    const btn = document.getElementById('promo-btn');
    const yazi = document.getElementById('indirim-yazisi');

    if (!indirimAktif) {
        if (input.value.trim().toUpperCase() === "GEMINI10") {
            guncelFiyat = orijinalFiyat * 0.90;
            indirimAktif = true;
            btn.innerText = "Kaldır";
            btn.classList.add('remove-btn');
            input.disabled = true;
            if (yazi) yazi.style.display = "block";
        } else {
            alert("Geçersiz kod!");
        }
    } else {
        guncelFiyat = orijinalFiyat;
        indirimAktif = false;
        btn.innerText = "Uygula";
        btn.classList.remove('remove-btn');
        input.disabled = false;
        input.value = "";
        if (yazi) yazi.style.display = "none";
    }
    tutarYazdir();
}

function odemeDinleyicileriniKur() {
    // 1. İsim Senkronizasyonu
    const nameInput = document.getElementById('card-holder') || document.querySelector('input[placeholder="Ad Soyad"]');
    const vName = document.getElementById('v-name');
    
    if (nameInput && vName) {
        nameInput.addEventListener('input', (e) => {
            vName.innerText = e.target.value.toUpperCase() || "AD SOYAD";
        });
    }

    // 2. Kart Numarası Senkronizasyonu
    const cardInput = document.getElementById('card-num');
    const vNumber = document.getElementById('v-number');
    const typeLabel = document.getElementById('v-type');

    if (cardInput && vNumber) {
        cardInput.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            let formatted = v.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = formatted;
            
            vNumber.innerText = formatted || "•••• •••• •••• ••••";

            // Kart tipi belirleme
            if (typeLabel) {
                if (v.startsWith('4')) {
                    typeLabel.innerText = "VISA";
                    typeLabel.style.color = "#1A1F71";
                } else if (v.startsWith('5')) {
                    typeLabel.innerText = "Mastercard";
                    typeLabel.style.color = "#EB001B";
                } else {
                    typeLabel.innerText = "CARD";
                    typeLabel.style.color = "#1d1d1f";
                }
            }
        });
    }

    // 3. Tarih Senkronizasyonu
    const expInput = document.getElementById('exp-date');
    const vExpiry = document.getElementById('v-expiry');

    if (expInput && vExpiry) {
        expInput.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
            e.target.value = v;
            vExpiry.innerText = v || "AA/YY";
        });
    }
}


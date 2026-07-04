document.documentElement.classList.remove('no-js');

/* ==========================================================================
   Reveal on scroll
   ========================================================================== */
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  items.forEach(function (item) { observer.observe(item); });
})();

/* ==========================================================================
   Mobile nav + search panel + cart drawer toggles
   ========================================================================== */
(function () {
  var menuToggles = document.querySelectorAll('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  var hamburgerBtn = document.querySelector('.header-menu-toggle');

  function openMobileNav() {
    if (!mobileNav) return;
    mobileNav.setAttribute('data-open', '');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-open');
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'true');
  }
  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.removeAttribute('data-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
  }
  menuToggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (mobileNav && mobileNav.hasAttribute('data-open')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav && mobileNav.hasAttribute('data-open')) closeMobileNav();
  });

  var searchToggles = document.querySelectorAll('[data-search-toggle]');
  var searchPanel = document.querySelector('[data-search-panel]');
  searchToggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!searchPanel) return;
      if (searchPanel.hasAttribute('data-open')) {
        searchPanel.removeAttribute('data-open');
      } else {
        searchPanel.setAttribute('data-open', '');
        var input = searchPanel.querySelector('input[type="search"]');
        if (input) input.focus();
      }
    });
  });

  var cartToggles = document.querySelectorAll('[data-cart-toggle]');
  var cartDrawer = document.querySelector('[data-cart-drawer]');
  function openCart() { if (cartDrawer) { cartDrawer.setAttribute('data-open', ''); cartDrawer.setAttribute('aria-hidden', 'false'); } }
  function closeCart() { if (cartDrawer) { cartDrawer.removeAttribute('data-open'); cartDrawer.setAttribute('aria-hidden', 'true'); } }
  cartToggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!cartDrawer) return;
      cartDrawer.hasAttribute('data-open') ? closeCart() : openCart();
    });
  });
  window.KaiuOpenCart = openCart;
})();

/* ==========================================================================
   Cart helpers (Ajax API)
   ========================================================================== */
var Kaiu = (function () {
  function refreshCartCount(count) {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = count; });
  }

  function refreshDrawer() {
    fetch('/?section_id=cart-drawer')
      .then(function (res) { return res.text(); })
      .then(function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var newDrawer = doc.querySelector('[data-cart-drawer]');
        var currentDrawer = document.querySelector('[data-cart-drawer]');
        if (newDrawer && currentDrawer) {
          var wasOpen = currentDrawer.hasAttribute('data-open');
          currentDrawer.innerHTML = newDrawer.innerHTML;
          if (wasOpen) currentDrawer.setAttribute('data-open', '');
          bindDrawerEvents();
        }
      });
  }

  function updateCartUI() {
    fetch('/cart.js')
      .then(function (res) { return res.json(); })
      .then(function (cart) {
        refreshCartCount(cart.item_count);
        refreshDrawer();
      });
  }

  function addToCart(id, quantity, button) {
    var textEl = button ? button.querySelector('[data-add-to-cart-text]') : null;
    var originalText = textEl ? textEl.textContent : null;
    if (button) button.disabled = true;
    if (textEl) textEl.textContent = 'Adding…';

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: id, quantity: quantity })
    })
      .then(function (res) { return res.json(); })
      .then(function () {
        if (textEl) textEl.textContent = 'Added';
        updateCartUI();
        if (window.KaiuOpenCart) window.KaiuOpenCart();
        setTimeout(function () {
          if (textEl && originalText) textEl.textContent = originalText;
          if (button) button.disabled = false;
        }, 1400);
      })
      .catch(function () {
        if (textEl) textEl.textContent = 'Error — try again';
        if (button) button.disabled = false;
      });
  }

  function changeQuantity(key, quantity) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity })
    }).then(function () {
      updateCartUI();
      if (document.querySelector('.cart-page')) window.location.reload();
    });
  }

  return { addToCart: addToCart, changeQuantity: changeQuantity, updateCartUI: updateCartUI };
})();

/* ==========================================================================
   Cart drawer + cart page line item interactions (event delegation)
   ========================================================================== */
function bindDrawerEvents() {
  document.querySelectorAll('[data-cart-line]').forEach(function (line) {
    var key = line.getAttribute('data-key');
    var qtyEl = line.querySelector('[data-qty-value]');

    var inc = line.querySelector('[data-qty-increase]');
    var dec = line.querySelector('[data-qty-decrease]');
    if (inc) inc.onclick = function () {
      var qty = parseInt(qtyEl.textContent, 10) + 1;
      Kaiu.changeQuantity(key, qty);
    };
    if (dec) dec.onclick = function () {
      var qty = Math.max(0, parseInt(qtyEl.textContent, 10) - 1);
      Kaiu.changeQuantity(key, qty);
    };

    var remove = line.querySelector('[data-cart-remove]');
    if (remove) remove.onclick = function () { Kaiu.changeQuantity(key, 0); };
  });
}
document.addEventListener('DOMContentLoaded', bindDrawerEvents);

/* Cart page (non-drawer) lines use the same data attributes */
document.addEventListener('click', function (e) {
  var line = e.target.closest('.cart-page__line');
  if (!line) return;
  var key = line.getAttribute('data-key');

  if (e.target.closest('[data-qty-increase]')) {
    var span = line.querySelector('[data-qty-value]');
    Kaiu.changeQuantity(key, parseInt(span.textContent, 10) + 1);
  }
  if (e.target.closest('[data-qty-decrease]')) {
    var span2 = line.querySelector('[data-qty-value]');
    Kaiu.changeQuantity(key, Math.max(0, parseInt(span2.textContent, 10) - 1));
  }
  if (e.target.closest('[data-cart-remove]')) {
    Kaiu.changeQuantity(key, 0);
  }
});

/* ==========================================================================
   Product form: quantity stepper, variant switching, add to cart
   ========================================================================== */
document.querySelectorAll('[data-product-form]').forEach(function (form) {
  var qtyInput = form.querySelector('[data-qty-input]');
  var incBtn = form.querySelector('[data-qty-increase]');
  var decBtn = form.querySelector('[data-qty-decrease]');
  var variantIdInput = form.querySelector('[data-variant-id]');
  var addBtn = form.querySelector('[data-add-to-cart]');
  var section = form.closest('section');
  var variantsJsonEl = section ? section.querySelector('[data-product-json]') : null;
  var variants = variantsJsonEl ? JSON.parse(variantsJsonEl.textContent) : [];
  var priceEl = section ? section.querySelector('[data-product-price]') : null;

  if (incBtn) incBtn.addEventListener('click', function () {
    qtyInput.value = Math.max(1, parseInt(qtyInput.value || 1, 10) + 1);
  });
  if (decBtn) decBtn.addEventListener('click', function () {
    qtyInput.value = Math.max(1, parseInt(qtyInput.value || 1, 10) - 1);
  });

  var optionGroups = form.querySelectorAll('[data-option-index]');
  var selections = {};

  optionGroups.forEach(function (group) {
    var index = group.getAttribute('data-option-index');
    var active = group.querySelector('.is-active');
    if (active) selections[index] = active.getAttribute('data-value');
  });

  form.querySelectorAll('[data-option-value]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var index = btn.getAttribute('data-option-index');
      var value = btn.getAttribute('data-value');
      selections[index] = value;

      btn.closest('.product-option__values').querySelectorAll('.product-option__value').forEach(function (b) {
        b.classList.remove('is-active');
      });
      btn.classList.add('is-active');

      var match = variants.find(function (v) {
        var opts = [v.option1, v.option2, v.option3];
        return Object.keys(selections).every(function (i) { return opts[i] === selections[i]; });
      });

      if (match) {
        variantIdInput.value = match.id;
        if (priceEl) {
          priceEl.innerHTML = match.compare_at_price && match.compare_at_price > match.price
            ? '<span class="product-card__price--sale">' + formatMoney(match.price) + '</span><span class="product-card__price--compare">' + formatMoney(match.compare_at_price) + '</span>'
            : formatMoney(match.price);
        }
        if (addBtn) {
          addBtn.disabled = !match.available;
          var textEl = addBtn.querySelector('[data-add-to-cart-text]');
          if (textEl) textEl.textContent = match.available ? 'Add to Selection' : 'Sold Out';
        }
        if (match.featured_image && match.featured_image.src) {
          var mainImg = document.querySelector('[data-main-image]');
          if (mainImg) mainImg.src = match.featured_image.src.replace(/(\.[a-zA-Z]+)(\?|$)/, '_1400x$1$2');
        }
      } else if (addBtn) {
        addBtn.disabled = true;
        var t = addBtn.querySelector('[data-add-to-cart-text]');
        if (t) t.textContent = 'Unavailable';
      }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var id = variantIdInput.value;
    var quantity = parseInt(qtyInput.value || 1, 10);
    Kaiu.addToCart(id, quantity, addBtn);
  });
});

function formatMoney(cents) {
  return '$' + (cents / 100).toFixed(2);
}

/* ==========================================================================
   Product gallery thumbnails
   ========================================================================== */
document.querySelectorAll('[data-product-gallery]').forEach(function (gallery) {
  var mainImg = gallery.querySelector('[data-main-image]');
  gallery.querySelectorAll('[data-thumb]').forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      gallery.querySelectorAll('[data-thumb]').forEach(function (t) { t.classList.remove('is-active'); });
      thumb.classList.add('is-active');
      if (mainImg) mainImg.src = thumb.getAttribute('data-full');
    });
  });
});

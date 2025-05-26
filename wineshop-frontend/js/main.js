(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner(0);


    // Fixed Navbar
    $(window).scroll(function () {
        if ($(window).width() < 992) {
            if ($(this).scrollTop() > 55) {
                $('.fixed-top').addClass('shadow');
            } else {
                $('.fixed-top').removeClass('shadow');
            }
        } else {
            if ($(this).scrollTop() > 55) {
                $('.fixed-top').addClass('shadow').css('top', -55);
            } else {
                $('.fixed-top').removeClass('shadow').css('top', 0);
            }
        } 
    });
    
    
   // Back to top button
   $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
        $('.back-to-top').fadeIn('slow');
    } else {
        $('.back-to-top').fadeOut('slow');
    }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Testimonial carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 2000,
        center: false,
        dots: true,
        loop: true,
        margin: 25,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:1
            },
            992:{
                items:2
            },
            1200:{
                items:2
            }
        }
    });


    // vegetable carousel
    $(".vegetable-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        center: false,
        dots: true,
        loop: true,
        margin: 25,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            },
            1200:{
                items:4
            }
        }
    });


    // Modal Video
    $(document).ready(function () {
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data("src");
        });
        console.log($videoSrc);

        $('#videoModal').on('shown.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })

        $('#videoModal').on('hide.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc);
        })
    });



    // Product Quantity
    $('.quantity button').on('click', function () {
        var button = $(this);
        var oldValue = button.parent().parent().find('input').val();
        if (button.hasClass('btn-plus')) {
            var newVal = parseFloat(oldValue) + 1;
        } else {
            if (oldValue > 0) {
                var newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = 0;
            }
        }
        button.parent().parent().find('input').val(newVal);
    });

})(jQuery);

// Lớp giỏ hàng
class Cart {
    constructor() {
        this.items = this.loadCart();
    }

    // Lấy giỏ hàng từ localStorage
    loadCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    // Lưu giỏ hàng vào localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    // Thêm sản phẩm vào giỏ hàng
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartCount();
    }

    // Xóa sản phẩm khỏi giỏ hàng
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
    }

    // Cập nhật số lượng sản phẩm
    updateQuantity(productId, newQuantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
        }
    }

    // Tính tổng số lượng sản phẩm
    getTotalCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Tính tổng giá trị giỏ hàng
    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Cập nhật số lượng hiển thị trên icon giỏ hàng
    updateCartCount() {
        const count = this.getTotalCount();
        const cartCountElements = document.querySelectorAll('.cart-count');

        cartCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    // Hiển thị giỏ hàng trên trang cart.html
    displayCart() {
        if (!document.querySelector('.table')) return;

        const cartTableBody = document.querySelector('.table tbody');
        const cartTotalElement = document.querySelector('.cart-total');

        if (this.items.length === 0) {
            cartTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Your cart is empty</td></tr>';
            return;
        }

        cartTableBody.innerHTML = this.items.map(item => `
            <tr>
                <th scope="row">
                    <div class="d-flex align-items-center">
                        <img src="${item.image}" class="img-fluid me-5 rounded-circle" style="width: 80px; height: 80px;" alt="">
                    </div>
                </th>
                <td>
                    <p class="mb-0 mt-4">${item.name}</p>
                </td>
                <td>
                    <p class="mb-0 mt-4">${item.price.toFixed(2)} $</p>
                </td>
                <td>
                    <div class="input-group quantity mt-4" style="width: 100px;">
                        <div class="input-group-btn">
                            <button class="btn btn-sm btn-minus rounded-circle bg-light border" data-id="${item.id}">
                                <i class="fa fa-minus"></i>
                            </button>
                        </div>
                        <input type="text" class="form-control form-control-sm text-center border-0" value="${item.quantity}">
                        <div class="input-group-btn">
                            <button class="btn btn-sm btn-plus rounded-circle bg-light border" data-id="${item.id}">
                                <i class="fa fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </td>
                <td>
                    <p class="mb-0 mt-4">${(item.price * item.quantity).toFixed(2)} $</p>
                </td>
                <td>
                    <button class="btn btn-md rounded-circle bg-light border mt-4 remove-item" data-id="${item.id}">
                        <i class="fa fa-times text-danger"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Tính toán tổng giá
        const subtotal = this.getTotalPrice();
        const shipping = 3.00; // Phí vận chuyển cố định
        const total = subtotal + shipping;

        // Cập nhật tổng giá
        document.querySelector('.subtotal-price').textContent = `$${subtotal.toFixed(2)}`;
        document.querySelector('.total-price').textContent = `$${total.toFixed(2)}`;
    }
}

// Khởi tạo giỏ hàng
const cart = new Cart();

// Cập nhật số lượng giỏ hàng khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    cart.updateCartCount();
    cart.displayCart();

    // Xử lý sự kiện cho nút thêm vào giỏ hàng
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productElement = e.target.closest('.fruite-item');
            const product = {
                id: productElement.dataset.id || Math.random().toString(36).substr(2, 9),
                name: productElement.querySelector('h4').textContent,
                price: parseFloat(productElement.querySelector('.fw-bold').textContent.replace('$', '')),
                image: productElement.querySelector('img').src,
                description: productElement.querySelector('p').textContent
            };

            cart.addItem(product);

            // Hiển thị thông báo
            alert(`${product.name} has been added to your cart!`);
        });
    });

    // Xử lý sự kiện cho trang cart.html
    document.querySelector('.table')?.addEventListener('click', (e) => {
        // Xử lý nút xóa
        if (e.target.closest('.remove-item')) {
            const productId = e.target.closest('.remove-item').dataset.id;
            cart.removeItem(productId);
            cart.displayCart();
        }

        // Xử lý nút tăng số lượng
        if (e.target.closest('.btn-plus')) {
            const productId = e.target.closest('.btn-plus').dataset.id;
            const input = e.target.closest('.input-group').querySelector('input');
            const newQuantity = parseInt(input.value) + 1;
            input.value = newQuantity;
            cart.updateQuantity(productId, newQuantity);
            cart.displayCart();
        }

        // Xử lý nút giảm số lượng
        if (e.target.closest('.btn-minus')) {
            const productId = e.target.closest('.btn-minus').dataset.id;
            const input = e.target.closest('.input-group').querySelector('input');
            let newQuantity = parseInt(input.value) - 1;

            if (newQuantity < 1) newQuantity = 1;

            input.value = newQuantity;
            cart.updateQuantity(productId, newQuantity);
            cart.displayCart();
        }
    });

    // Xử lý nút thanh toán
    document.querySelector('.proceed-checkout')?.addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });
});
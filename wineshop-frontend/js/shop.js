// Cấu hình chung
// Cấu hình chung
const CONFIG = {
    API_BASE_URL: 'https://congnghephanmem-wj83.onrender.com/api/product', // URL backend API mới
    CURRENCY_SYMBOL: '$',
    DEFAULT_BRAND_LABEL: 'none'
};


// Class quản lý trạng thái ứng dụng (AppState)
// 2.2 Cập nhật trạng thái bộ lọc (brand, alcohol, maxPrice)
class AppState {
    constructor() {
        this.selectedBrand = null;        // brand được chọn
        this.selectedAlcohol = null;      // nồng độ cồn được chọn
        this.selectedMaxPrice = null;     // giá tối đa được chọn
        this.minPrice = null;             // khoảng giá tối thiểu
        this.maxPrice = null;             // khoảng giá tối đa
    }

    // Cập nhật khoảng giá (min, max), mặc định chọn giá tối đa làm giá chọn
    updatePriceRange(min, max) {
        this.minPrice = min;
        this.maxPrice = max;
        this.selectedMaxPrice = max; // Mặc định chọn maxPrice là giá tối đa có thể
    }
}

const state = new AppState(); // Khởi tạo trạng thái ứng dụng

// Dịch vụ gọi API backend
class ApiService {
    // Lấy khoảng giá min, max từ backend (Bước 2.7, 2.8, 2.9)
    static async getPriceRange() {
        try {
            const res = await fetch(`${CONFIG.API_BASE_URL}/price-range`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return data; // Trả về {minPrice, maxPrice}
        } catch (e) {
            console.error('Lỗi khi lấy khoảng giá:', e);
        }
    }

    // Gửi API GET lọc sản phẩm theo bộ lọc (Bước 2.3 kiểm tra + 2.4 gửi request)
    static async getFilteredProducts(filters) {
        try {
            // 2.3 Kiểm tra tham số lọc hợp lệ (ví dụ maxPrice >= 0)
            if (filters.maxPrice && filters.maxPrice < 0) {
                console.error('Giá tối đa không hợp lệ');
                return []; // Không gửi request nếu không hợp lệ (Luồng thay thế 2.12)
            }
            // 2.4 Tạo query param và gọi API lọc sản phẩm
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });
            // Gọi API backend với query params
            return await $.get(`${CONFIG.API_BASE_URL}/filter?${queryParams.toString()}`);
        } catch (error) {
            console.error('Lỗi khi lọc sản phẩm:', error);
            throw error;
        }
    }

    // Lấy danh sách thương hiệu (Bước 2.14 chuẩn bị dữ liệu)
    static async getBrands() {
        try {
            return await $.get(`${CONFIG.API_BASE_URL}/brands`);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách thương hiệu:', error);
            return [];
        }
    }

    // Lấy danh sách nồng độ cồn (Bước 2.14 chuẩn bị dữ liệu)
    static async getAlcohols() {
        try {
            return await $.get(`${CONFIG.API_BASE_URL}/alcohols`);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách nồng độ:', error);
            return [];
        }
    }
}

// UI Components quản lý hiển thị trên giao diện
class UIComponents {
    // Thanh trượt chọn giá (2.2 cập nhật AppState & 2.11 render UI)
    static priceSlider = {
        init(min, max) {
            $('#rangeInput').attr({ min, max }).val(max); // Set thuộc tính min, max cho input slider
            this.update(max); // Cập nhật hiển thị giá trị slider
        },
        update(value) {
            $('#amount').val(`${CONFIG.CURRENCY_SYMBOL}${value}`); // Hiển thị giá trị đã chọn lên UI
        }
    };

    // Hiển thị danh sách sản phẩm (2.10 nhận JSON, 2.11 render UI)
    static products = {
        render(products) {
            const container = $('#productContainer');
            container.empty(); // Xóa dữ liệu cũ
            if (!products.length) {
                container.html('<p>Không tìm thấy sản phẩm phù hợp.</p>'); // Hiển thị nếu không có kết quả
                return;
            }
            // Tạo html card cho từng sản phẩm
            const html = products.map(this.createCard).join('');
            container.html(html);
        },

        createCard(product) {
            // Mỗi card sản phẩm hiển thị thông tin (ảnh, tên, mô tả, giá, thương hiệu)
            return `
                <div class="col-md-6 col-lg-6 col-xl-4">
                    <div class="rounded position-relative fruite-item">
                        <div class="fruite-img">
                            <img src="img/${product.image}" class="img-fluid w-100 rounded-top" alt="${product.name}">
                        </div>
                        <div class="text-white bg-secondary px-3 py-1 rounded position-absolute" style="top: 10px; left: 10px;">
                            ${product.brand?.name || CONFIG.DEFAULT_BRAND_LABEL}
                        </div>
                        <div class="p-4 border border-secondary border-top-0 rounded-bottom">
                            <h4>${product.name}</h4>
                            <p>${product.description || ''}</p>
                            <div class="d-flex justify-content-between flex-lg-wrap">
                                <p class="text-dark fs-5 fw-bold mb-0">${CONFIG.CURRENCY_SYMBOL}${product.price}</p>
                                <a href="#" class="btn border border-secondary rounded-pill px-3 text-primary">
                                    <i class="fa fa-shopping-bag me-2 text-primary"></i> Thêm vào giỏ
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    };

    // Hiển thị danh sách thương hiệu (2.14 load filter options)
    static brands = {
        render(brands) {
            // Tạo danh sách thương hiệu dạng <li> với link chọn
            const html = brands.map(name => `
                <li>
                    <div class="d-flex justify-content-between fruite-name">
                        <a href="#"><i class="fas fa-wine-bottle me-2 text-primary"></i>${name}</a>
                    </div>
                </li>
            `).join('');
            $('#brands').html(html);
        }
    };

    // Hiển thị danh sách nồng độ cồn (2.14 load filter options)
    static concentrations = {
        render(alcohols) {
            // Sắp xếp nồng độ cồn tăng dần
            const sorted = alcohols.sort((a, b) => a - b);
            // Tạo checkbox list nồng độ cồn
            const html = sorted.map(value => `
                <div class="mb-2">
                    <input type="checkbox" class="me-2" value="${value}">
                    <label>${value} %</label>
                </div>
            `).join('');
            $('#concentrations').html(html);
        }
    };
}

// Service xử lý logic bộ lọc và gọi API (2.14, 2.17, 2.25)
class FilterService {
    // Áp dụng bộ lọc và gọi API lấy danh sách sản phẩm (2.14 & 2.17)
    static async apply() {
        try {
            // Gọi API lọc với tham số lấy từ trạng thái AppState (2.1 → 2.2)
            const products = await ApiService.getFilteredProducts({
                brand: state.selectedBrand,
                alcohol: state.selectedAlcohol,
                maxPrice: state.selectedMaxPrice
            });
            // 2.10 & 2.11: Nhận dữ liệu JSON và render UI sản phẩm
            UIComponents.products.render(products);
        } catch (error) {
            console.error('Lỗi khi áp dụng bộ lọc:', error);
        }
    }

    // Tải danh sách thương hiệu và nồng độ cồn để hiển thị filter (2.14)
    static async loadFilterOptions() {
        try {
            const [brands, alcohols] = await Promise.all([
                ApiService.getBrands(),    // Lấy danh sách thương hiệu
                ApiService.getAlcohols()   // Lấy danh sách nồng độ cồn
            ]);
            UIComponents.brands.render = function (brands) {
                const html = brands.map(name => `
        <li>
            <div class="d-flex justify-content-between fruite-name">
                <a href="#" class="${state.selectedBrand === name ? 'active' : ''}">
                    <i class="fas fa-wine-bottle me-2 text-primary"></i>${name}
                </a>
            </div>
        </li>
    `).join('');
                $('#brands').html(html);
            };
            // Render filter brand
            UIComponents.concentrations.render(alcohols); // Render filter alcohol
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu bộ lọc:', error);
        }
    }
}

// Xử lý sự kiện người dùng (2.1 chọn filter, 2.15 thay đổi filter, 2.16 cập nhật AppState)
class EventHandlers {
    static init() {
        this.initPriceSlider(); // Khởi tạo thanh trượt giá (2.7, 2.8, 2.9)
        this.attachEvents();    // Gán sự kiện cho filter (2.1, 2.15)
    }

    // Khởi tạo thanh trượt giá, lấy khoảng giá từ backend (2.7, 2.8, 2.9)
    static async initPriceSlider() {
        try {
            const range = await ApiService.getPriceRange();   // Lấy minPrice, maxPrice từ backend
            state.updatePriceRange(range.minPrice, range.maxPrice); // Cập nhật AppState (2.2)
            UIComponents.priceSlider.init(range.minPrice, range.maxPrice); // Cập nhật UI slider (2.11)
            await FilterService.apply();           // Load sản phẩm với filter mặc định (2.14, 2.17)
            await FilterService.loadFilterOptions(); // Load danh sách filter (2.14)
        } catch (error) {
            console.error('Lỗi khởi tạo khoảng giá:', error);
            // fallback: vẫn load filter và sản phẩm mặc dù lỗi lấy giá
            await FilterService.loadFilterOptions();
            await FilterService.apply();
        }
    }

    // Gán sự kiện cho bộ lọc (2.1 & 2.15 thao tác người dùng, 2.2 & 2.16 cập nhật AppState)
    static attachEvents() {
        // Thay đổi thanh trượt giá (maxPrice)
        $('#rangeInput').on('input', function () {
            state.selectedMaxPrice = $(this).val();       // Cập nhật trạng thái (2.2 & 2.16)
            UIComponents.priceSlider.update(state.selectedMaxPrice); // Cập nhật UI giá hiển thị (2.11)
            FilterService.apply(); // Gọi lại API lọc sản phẩm (2.17)
        });

        // Chọn thương hiệu
        $('#brands').on('click', 'a', function (e) {
            e.preventDefault();
            state.selectedBrand = $(this).text().trim(); // Cập nhật trạng thái (2.2 & 2.16)
            FilterService.apply(); // Gọi lại API lọc sản phẩm (2.17)
        });

        // Chọn nồng độ cồn (checkbox)
        $('#concentrations').on('change', 'input[type=checkbox]', function () {
            // Nếu checked thì cập nhật selectedAlcohol, ngược lại set null (chỉ chọn 1 checkbox)
            state.selectedAlcohol = $(this).is(':checked') ? $(this).val() : null;
            FilterService.apply(); // Gọi lại API lọc sản phẩm (2.17)
        });
    }
}

// Khi trang được tải xong, khởi tạo toàn bộ (2.14 vòng lặp khi thay đổi filter nhiều lần)
$(document).ready(() => EventHandlers.init());

// Reset bộ lọc về mặc định khi bấm nút reload
$('#resetFilters').on('click', function (e) {
    e.preventDefault();

    // Reset trạng thái AppState
    state.selectedBrand = null;
    state.selectedAlcohol = null;
    state.selectedMaxPrice = state.maxPrice;

    // Reset UI: slider, brand highlight, checkbox
    $('#rangeInput').val(state.maxPrice);
    UIComponents.priceSlider.update(state.maxPrice);

    // Bỏ chọn brand
    $('#brands a').removeClass('active');

    // Bỏ chọn tất cả checkbox
    $('#concentrations input[type=checkbox]').prop('checked', false);

    // Gọi lại API lọc sản phẩm với filter mặc định
    FilterService.apply();
});

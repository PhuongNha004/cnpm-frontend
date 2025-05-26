const API_BASE = "https://congnghephanmem-wj83.onrender.com/api/auth";

const fetchFormData = async (url, data) => {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(data).toString()
    });

    const result = await response.json().catch(() => ({}));

    console.log("Fetch response status:", response.status);
    console.log("Fetch response body:", result);

    if (!response.ok) {
        const message = result?.message || "Đã xảy ra lỗi";
        throw new Error(message);
    }

    return result;
};


const register = async () => {
    const username = document.getElementById("regUsername")?.value?.trim();
    const password = document.getElementById("regPassword")?.value?.trim();
    const resultElement = document.getElementById("regResult");

    resultElement.innerText = "";  // Xóa kết quả trước đó

    try {
        const data = await fetchFormData(`${API_BASE}/register`, { username, password });
        resultElement.innerText = `✅ ${data.message || "Đăng ký thành công"}`;
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        resultElement.innerText = `❌ ${error.message}`;
    }
};

const login = async () => {
    const username = document.getElementById("loginUsername")?.value?.trim();
    const password = document.getElementById("loginPassword")?.value?.trim();
    const resultElement = document.getElementById("loginResult");

    resultElement.innerText = "";  // Xóa kết quả trước đó

    try {
        const data = await fetchFormData(`${API_BASE}/login`, { username, password });

		console.log(data);  // Kiểm tra nội dung của response

		    setTimeout(() => {
		        window.location.href = "index.html";  // Chuyển hướng nếu có token
		    }, 100);


    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        resultElement.innerText = `❌ ${error.message}`;

        // Chuyển hướng sau khi đăng nhập thất bại (tùy thuộc vào logic của bạn)
        setTimeout(() => {
            window.location.href = "404.html";  // Thay đổi trang chuyển hướng theo nhu cầu
        }, 1000);
    }
};

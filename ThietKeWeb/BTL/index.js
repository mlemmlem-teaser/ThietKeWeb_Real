// Home Page JavaScript
// Handles home page functionality and user authentication checks

// Check if user is logged in and redirect accordingly
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
        const user = JSON.parse(currentUser);
        // Update page title to welcome user
        try {
            document.title = `Welcome, ${user.email}`;
        } catch (e) {}
        
        // Update auth buttons in navbar
        const authActions = document.getElementById('auth-actions');
        if (authActions) {
            authActions.innerHTML = `
                <span class="user-info">Welcome, ${user.email}</span>
                <a href="#" class="btn btn-link" onclick="logout()">Logout</a>
            `;
        }
        
        // If user is admin, add admin link
        if (user.role === 'admin') {
            // Support both old nav (.nav-list) and new header nav (.tab)
            const navList = document.querySelector('.nav-list');
            const tabNav = document.querySelector('nav.tab');
            if (navList) {
                const adminLi = document.createElement('li');
                adminLi.innerHTML = '<a href="src/admin/dashboard/dashboard.html" class="nav-link">Admin Panel</a>';
                navList.appendChild(adminLi);
            } else if (tabNav) {
                const adminA = document.createElement('a');
                adminA.href = 'src/admin/dashboard/dashboard.html';
                adminA.className = 'tablinks';
                adminA.innerHTML = '<i class="fa-solid fa-gauge"></i> Admin';
                tabNav.appendChild(adminA);
            }
        }
    }
});

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.reload();
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function() {
        if (this.href && !this.href.includes('#')) {
            this.style.opacity = '0.7';
            this.style.pointerEvents = 'none';
            
            setTimeout(() => {
                this.style.opacity = '1';
                this.style.pointerEvents = 'auto';
            }, 1000);
        }
    });
});

//Mở đầu tab động 
function openTab(evt, cityName) {
    
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}
//Toàn bộ headder động
//CONTACT_FUNCTION
function scrollToForm() {
    // 1. Lấy phần tử đích bằng ID (advise-contact)
    const targetElement = document.getElementById('advise-contact');
    
    // 2. Kiểm tra và thực hiện cuộn
    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center' 
        });
    }
}
//Hiệu ứng nút bấm đầu 
const clickFormBtn = document.getElementById("click-form");
const clickBuyBtn = document.getElementById("click-buy");

// --- HIỆU ỨNG KHI DI CHUỘT VÀO (HOVER IN) ---
if (clickFormBtn && clickBuyBtn) {
    clickFormBtn.addEventListener("mouseenter", function() {
        clickBuyBtn.style.backgroundColor = "transparent";
        clickBuyBtn.style.color = "#ffffff";
        clickBuyBtn.style.border = "0.5px solid #ffffffff";
    });

// --- HIỆU ỨNG KHI RỜI CHUỘT (HOVER OUT) ---
    clickFormBtn.addEventListener("mouseleave", function() {
        clickBuyBtn.style.backgroundColor = "#335c96"; 
        clickBuyBtn.style.border = "none";        
    });
}
//Tạo hiệu ứng nút 
const buttons = document.querySelectorAll(".btn");
buttons.forEach((button) => {
  button.addEventListener("click", function(e){
    //lấy tọa độ button so với vp
    const buttonRect=e.target.getBoundingClientRect();
    console.log(buttonRect);
    //Lấy tọa độ chuột so với vp
    const x=e.clientX;
    const y=e.clientY;
    console.log(x,y);
    //Tính tọa đô chuột click so với button
    const xInside = x-buttonRect.left;
    const yInside=y-buttonRect.top;
    //Thêm thẻ span , để thêm class circle 
    const hinhTron =document.createElement("span");
    hinhTron.classList.add("circle")
    hinhTron.style.top=yInside+"px";
    hinhTron.style.left=xInside+"px";
    this.appendChild(hinhTron);
    setTimeout(()=> hinhTron.remove(),500);
  });
});
//Tạo hiệu ứng form thông báo khi nhập sai
const adviseForm = document.getElementById("advise-contact");
if (adviseForm) adviseForm.addEventListener("submit", function(event) {
  event.preventDefault();
  
  const name = document.getElementById("username").value.trim();
  const moblie = document.getElementById("moblie").value.trim();
  
  // Lấy các element hiển thị lỗi riêng cho từng trường
  const nameError = document.getElementById("name-error");
  const moblieError = document.getElementById("moblie-error");
  
  // Reset tất cả thông báo lỗi
  nameError.textContent = "";
  moblieError.textContent = "";
  
  let hasError = false;
  
  // Kiểm tra tên
  if (name === "") {
    nameError.textContent = "⚠️ Bạn chưa nhập tên!";
    hasError = true;
  }
  
  // Kiểm tra số điện thoại
  if (moblie === "") {
    moblieError.textContent = "⚠️ Bạn chưa nhập số điện thoại!";
    hasError = true;
  } else {
    const mobliePattern = /^0\d{9}$/;
    if (!mobliePattern.test(moblie)) {
      moblieError.textContent = "⚠️ Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0!";
      hasError = true;
    }
  }
  
  // Nếu có lỗi thì dừng lại
  if (hasError) {
    return;
  }
  
  // Nếu đúng hết
  alert("✅ Gửi thành công!");
  this.reset();
});


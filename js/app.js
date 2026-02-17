// ========================================
// البرمجة الرئيسية للتطبيق
// ========================================

// التحقق من تسجيل الدخول عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// تهيئة الصفحة حسب نوعها
function initializePage() {
    const currentPage = getCurrentPage();
    
    switch(currentPage) {
        case 'index':
            setupLoginPage();
            break;
        case 'home':
            setupHomePage();
            break;
        case 'installments':
            setupInstallmentsPage();
            break;
        case 'map':
            // الخريطة لها كود خاص في الصفحة نفسها
            break;
        case 'news':
            // صفحة الأخبار ثابتة
            break;
    }
}

// معرفة الصفحة الحالية
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().split('.')[0];
    return page || 'index';
}

// ========================================
// صفحة تسجيل الدخول
// ========================================
function setupLoginPage() {
    const loginForm = document.getElementById('loginForm');
    const nationalIdInput = document.getElementById('nationalId');
    const inputHint = document.getElementById('inputHint');
    
    if (!loginForm) return;
    
    // التحقق من الأرقام فقط أثناء الكتابة
    nationalIdInput.addEventListener('input', function(e) {
        // السماح بالأرقام فقط
        this.value = this.value.replace(/[^0-9]/g, '');
        
        // تحديث رسالة التلميح
        const length = this.value.length;
        if (length === 0) {
            inputHint.textContent = 'الرقم القومي مكون من 14 رقم';
            inputHint.style.color = '#7f8c8d';
        } else if (length < 14) {
            inputHint.textContent = `باقي ${14 - length} رقم`;
            inputHint.style.color = '#f39c12';
        } else {
            inputHint.textContent = '✓ الرقم مكتمل';
            inputHint.style.color = '#27ae60';
        }
    });
    
    // معالجة تسجيل الدخول
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nationalId = nationalIdInput.value.trim();
        
        // التحقق من طول الرقم القومي
        if (nationalId.length !== 14) {
            showError('الرقم القومي يجب أن يكون 14 رقم');
            return;
        }
        
        // البحث عن العميل
        const customer = findCustomer(nationalId);
        
        if (customer) {
            // حفظ بيانات العميل في LocalStorage
            localStorage.setItem('currentCustomer', JSON.stringify(customer));
            localStorage.setItem('isLoggedIn', 'true');
            
            // الانتقال للصفحة الرئيسية
            window.location.href = 'home.html';
        } else {
            showError('الرقم القومي غير مسجل في النظام. يرجى التواصل معنا.');
        }
    });
}

// عرض رسالة خطأ
function showError(message) {
    // إزالة رسالة الخطأ السابقة إن وجدت
    const oldError = document.querySelector('.error-message');
    if (oldError) oldError.remove();
    
    // إنشاء رسالة الخطأ
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: #fee;
        color: #c33;
        padding: 15px;
        border-radius: 10px;
        margin-top: 15px;
        text-align: center;
        font-weight: bold;
        animation: shake 0.5s;
    `;
    errorDiv.textContent = message;
    
    // إضافة الرسالة بعد الفورم
    const form = document.getElementById('loginForm');
    form.parentNode.insertBefore(errorDiv, form.nextSibling);
    
    // إزالة الرسالة بعد 5 ثواني
    setTimeout(() => errorDiv.remove(), 5000);
}

// ========================================
// الصفحة الرئيسية
// ========================================
function setupHomePage() {
    // التحقق من تسجيل الدخول
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }
    
    const customer = getCurrentCustomer();
    if (!customer) {
        window.location.href = 'index.html';
        return;
    }
    
    // عرض اسم المستخدم
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = customer['الاسم'];
    }
    
    // عرض بيانات الوحدة
    displayUnitInfo(customer);
    
    // عرض ملخص الأقساط
    displayInstallmentsSummary(customer);
}

// عرض بيانات الوحدة
function displayUnitInfo(customer) {
    const elements = {
        buildingNo: document.getElementById('buildingNo'),
        unitNo: document.getElementById('unitNo'),
        totalPrice: document.getElementById('totalPrice'),
        remaining: document.getElementById('remaining')
    };
    
    if (elements.buildingNo) {
        elements.buildingNo.textContent = customer['رقم العمارة'];
    }
    if (elements.unitNo) {
        elements.unitNo.textContent = customer['رقم الشقة'];
    }
    if (elements.totalPrice) {
        elements.totalPrice.textContent = formatNumber(customer['إجمالي ثمن الوحدة']);
    }
    if (elements.remaining) {
        elements.remaining.textContent = formatNumber(customer['المتبقي من ثمن الوحدة']);
    }
}

// عرض ملخص الأقساط
function displayInstallmentsSummary(customer) {
    const summaryContainer = document.getElementById('installmentsSummary');
    if (!summaryContainer) return;
    
    const installments = [
        {
            number: 'القسط الأول',
            amount: customer['القسط الأول'],
            dueDate: customer['اخر موعد القسط الأول']
        },
        {
            number: 'القسط الثاني',
            amount: customer['القسط الثانى'],
            dueDate: customer['اخر موعد القسط الثانى']
        },
        {
            number: 'القسط الثالث',
            amount: customer['القسط الثالث'],
            dueDate: customer['اخر موعد القسط الثالث']
        }
    ];
    
    summaryContainer.innerHTML = '';
    
    installments.forEach(installment => {
        const status = getInstallmentStatus(installment.dueDate);
        const statusText = status === 'paid' ? 'مدفوع' : status === 'due' ? 'مستحق قريباً' : 'معلق';
        
        const installmentDiv = document.createElement('div');
        installmentDiv.className = `installment-item ${status}`;
        installmentDiv.innerHTML = `
            <div class="installment-info">
                <div class="installment-number">${installment.number}</div>
                <div class="installment-date">آخر موعد: ${formatDate(installment.dueDate)}</div>
            </div>
            <div class="installment-amount">${formatNumber(installment.amount)} ج</div>
            <span class="installment-status ${status}">${statusText}</span>
        `;
        
        summaryContainer.appendChild(installmentDiv);
    });
}

// ========================================
// صفحة الأقساط التفصيلية
// ========================================
function setupInstallmentsPage() {
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }
    
    const customer = getCurrentCustomer();
    if (!customer) {
        window.location.href = 'index.html';
        return;
    }
    
    // عرض معلومات العميل
    const clientNameElement = document.getElementById('clientName');
    const clientUnitElement = document.getElementById('clientUnit');
    
    if (clientNameElement) {
        clientNameElement.textContent = customer['الاسم'];
    }
    if (clientUnitElement) {
        clientUnitElement.textContent = `عمارة ${customer['رقم العمارة']} - شقة ${customer['رقم الشقة']}`;
    }
    
    // عرض جدول الأقساط
    displayInstallmentsTable(customer);
    
    // عرض ملخص المدفوعات
    displayPaymentSummary(customer);
}

// عرض جدول الأقساط
function displayInstallmentsTable(customer) {
    const tableContainer = document.getElementById('installmentsTable');
    if (!tableContainer) return;
    
    const installments = [
        {
            number: 1,
            name: 'القسط الأول',
            amount: customer['القسط الأول'],
            startDate: customer['موعد بداية القسط الأول'],
            dueDate: customer['اخر موعد القسط الأول']
        },
        {
            number: 2,
            name: 'القسط الثاني',
            amount: customer['القسط الثانى'],
            startDate: customer['موعد بداية القسط الثانى'],
            dueDate: customer['اخر موعد القسط الثانى']
        },
        {
            number: 3,
            name: 'القسط الثالث',
            amount: customer['القسط الثالث'],
            startDate: customer['موعد بداية القسط الثالث'],
            dueDate: customer['اخر موعد القسط الثالث']
        }
    ];
    
    let tableHTML = `
        <table class="installments-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>القسط</th>
                    <th>المبلغ</th>
                    <th>من تاريخ</th>
                    <th>إلى تاريخ</th>
                    <th>الحالة</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    installments.forEach(installment => {
        const status = getInstallmentStatus(installment.dueDate);
        const statusText = status === 'paid' ? 'مدفوع' : status === 'due' ? 'مستحق' : 'معلق';
        
        tableHTML += `
            <tr>
                <td>${installment.number}</td>
                <td>${installment.name}</td>
                <td><strong>${formatNumber(installment.amount)} جنيه</strong></td>
                <td>${formatDate(installment.startDate)}</td>
                <td>${formatDate(installment.dueDate)}</td>
                <td><span class="status-badge ${status}">${statusText}</span></td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    tableContainer.innerHTML = tableHTML;
}

// عرض ملخص المدفوعات
function displayPaymentSummary(customer) {
    const summaryTotal = document.getElementById('summaryTotal');
    const summaryInstallments = document.getElementById('summaryInstallments');
    const summaryRemaining = document.getElementById('summaryRemaining');
    
    const totalInstallments = customer['القسط الأول'] + customer['القسط الثانى'] + customer['القسط الثالث'];
    
    if (summaryTotal) {
        summaryTotal.textContent = formatNumber(customer['إجمالي ثمن الوحدة']) + ' جنيه';
    }
    if (summaryInstallments) {
        summaryInstallments.textContent = formatNumber(totalInstallments) + ' جنيه';
    }
    if (summaryRemaining) {
        summaryRemaining.textContent = formatNumber(customer['المتبقي من ثمن الوحدة']) + ' جنيه';
    }
}

// ========================================
// دوال مساعدة
// ========================================

// التحقق من تسجيل الدخول
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// الحصول على بيانات العميل الحالي
function getCurrentCustomer() {
    const customerData = localStorage.getItem('currentCustomer');
    return customerData ? JSON.parse(customerData) : null;
}

// تسجيل الخروج
function logout() {
    localStorage.removeItem('currentCustomer');
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}

// إضافة animation للأخطاء
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

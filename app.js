
let data = [];

// تحميل البيانات من ملف JSON في مجلد data
fetch('data/payment_data.json')
    .then(response => response.json())
    .then(jsonData => {
        data = jsonData; // تخزين البيانات لاستخدامها لاحقًا
        console.log('Data loaded:', data); // التحقق من البيانات
    })
    .catch(error => {
        console.error('Error loading JSON file:', error);
    });

// البحث عن الرقم القومي
function searchData() {
    const nationalId = document.getElementById('nationalId').value.trim(); // إزالة المسافات
    console.log('Searching for ID:', nationalId); // طباعة الرقم القومي المدخل

    // البحث في البيانات عن الرقم القومي المدخل
    const result = data.find(item => item['الرقم القومي'].trim() === nationalId);

    if (result) {
        console.log('Result found:', result); // طباعة البيانات إذا تم العثور عليها
        document.getElementById('result').style.display = 'block'; // إظهار النتيجة
        document.getElementById('name').textContent = result['الاسم'];
        document.getElementById('buildingNumber').textContent = result['رقم العمارة'];
        document.getElementById('apartmentNumber').textContent = result['رقم الشقة'];
        document.getElementById('totalPrice').textContent = result['إجمالي ثمن الوحدة'];
        document.getElementById('installment1').textContent = result['القسط الأول'];
        document.getElementById('installment1StartDate').textContent = result['موعد بداية القسط الأول'];
        document.getElementById('installment1EndDate').textContent = result['آخر موعد القسط الأول'];
        document.getElementById('installment2').textContent = result['القسط الثاني'];
        document.getElementById('installment2StartDate').textContent = result['موعد بداية القسط الثاني'];
        document.getElementById('installment2EndDate').textContent = result['آخر موعد القسط الثاني'];
        document.getElementById('installment3').textContent = result['القسط الثالث'];
        document.getElementById('installment3StartDate').textContent = result['موعد بداية القسط الثالث'];
        document.getElementById('installment3EndDate').textContent = result['آخر موعد القسط الثالث'];
        document.getElementById('remainingAmount').textContent = result['المتبقي من ثمن الوحدة'];
    } else {
        console.log('No result found for this ID');
        alert('الرقم القومي غير موجود!');
        document.getElementById('result').style.display = 'none'; // إخفاء النتيجة إذا لم يتم العثور عليها
    }
}

export const renderList = (patients) => {
  const list = document.getElementById('patientsList');

  if (patients.length === 0) {
    list.innerHTML = '<p class="empty-state">هنوز بیماری ثبت نشده...</p>';
    return;
  }

  list.innerHTML = patients.map(p => `
    <div class="card" data-id="${p.id}">
      <h3>${p.name}</h3>
            <p>سن: ${p.age ?? 'ثبت نشده'} | تلفن: ${p.phone ?? 'ثبت نشده'}</p>

      <button class="delete-btn">حذف</button>
    </div>
  `).join('');
};

export const getFormData = () => {
  return {
    name: document.getElementById('name').value.trim(),
    age: document.getElementById('age').value,
    phone: document.getElementById('phone').value.trim()
  };
};

export const clearForm = () => {
  document.getElementById('name').value = '';
  document.getElementById('age').value = '';
  document.getElementById('phone').value = '';
};

export const updateStats = (patients) => {
  // کل بیماران
  document.getElementById('totalPatients').textContent = patients.length;

  // بیماران امروز
  const today = new Date().toLocaleDateString('fa-IR');
  const newToday = patients.filter(p => p.date === today).length;
  document.getElementById('newPatients').textContent = newToday;
};

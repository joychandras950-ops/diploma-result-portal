(() => {
  const DATA_URL = './results-index.json.gz';
  const form = document.getElementById('searchForm');
  const input = document.getElementById('rollInput');
  const button = document.getElementById('searchButton');
  const message = document.getElementById('message');
  const result = document.getElementById('result');
  let index = null;
  let portalConfig = { institute: 'Feni Government Computer Institute', developerName: 'Joy Chondro Sarker', facebook: 'https://www.facebook.com/joy.chondro.sarker.2024' };

  async function loadPortalConfig() {
    try {
      const response = await fetch('./developer.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Developer config unavailable');
      const config = await response.json();
      portalConfig = { ...portalConfig, ...config };
      const name = byId('developerName');
      const link = byId('developerFacebook');
      const institute = byId('developerInstitute');
      if (name && portalConfig.developerName) name.textContent = portalConfig.developerName;
      if (link && portalConfig.facebook) link.href = portalConfig.facebook;
      if (institute && portalConfig.institute) institute.textContent = portalConfig.institute;
    } catch (_) { /* Built-in defaults keep the footer working. */ }
  }

  const byId = id => document.getElementById(id);
  function showMessage(text, error = false) {
    message.textContent = text;
    message.classList.toggle('error', error);
    message.classList.remove('hidden');
  }
  async function loadIndex() {
    try {
      const response = await fetch(DATA_URL);
      if (!response.ok) throw new Error(`ডেটা ফাইল পাওয়া যায়নি (${response.status})`);
      const compressed = await response.arrayBuffer();
      if (!('DecompressionStream' in window)) throw new Error('এই ব্রাউজারে GZIP ডেটা খোলার সুবিধা নেই। আপডেটেড Chrome ব্যবহার করুন।');
      const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
      const jsonText = await new Response(stream).text();
      index = JSON.parse(jsonText);
      showMessage(`ডেটা প্রস্তুত — মোট ${Object.keys(index).length.toLocaleString('en-US')}টি রোল নম্বরের রেকর্ড রয়েছে।`);
      if (input.value.trim()) search(input.value.trim());
    } catch (error) {
      showMessage(`${error.message} নিশ্চিত করুন যে index.html এবং results-index.json.gz একই ফোল্ডারে আছে এবং ওয়েব সার্ভার থেকে চালানো হচ্ছে।`, true);
    }
  }
  function search(roll) {
    result.classList.add('hidden');
    if (!index) return showMessage('ডেটা এখনো লোড হয়নি। একটু পরে আবার চেষ্টা করুন।', true);
    if (!/^\d+$/.test(roll)) return showMessage('সঠিক রোল নম্বর লিখুন।', true);
    const records = index[roll];
    if (!records || !records.length) return showMessage('এই রোল নম্বরের কোনো ফলাফল পাওয়া যায়নি। রোল নম্বরটি যাচাই করে আবার চেষ্টা করুন।', true);
    const record = records.slice().sort((a,b) => Number(b.semester || 0) - Number(a.semester || 0))[0];
    byId('institute').textContent = portalConfig.institute || record.institute || 'তথ্য নেই';
    byId('category').textContent = record.category || 'Diploma in Engineering';
    byId('regulation').textContent = record.regulation || 'তথ্য নেই';
    byId('rollValue').textContent = roll;
    byId('status').textContent = record.status || 'তথ্য নেই';
    byId('status').className = record.status === 'PASS' ? 'pass' : '';

    const gpas = record.gpas || {};
    const semesters = Object.keys(gpas).sort((a,b) => Number(a)-Number(b));
    const list = byId('semesterList');
    list.replaceChildren();
    semesters.forEach(sem => {
      const value = Number(gpas[sem]);
      const row = document.createElement('div');
      row.className = `semester-row${Number(sem) === Number(record.semester) ? ' latest' : ''}`;
      const name = document.createElement('div'); name.className = 'semester-name'; const ordinal = {'1':'১ম','2':'২য়','3':'৩য়','4':'৪র্থ','5':'৫ম','6':'৬ষ্ঠ','7':'৭ম','8':'৮ম'}[String(sem)] || `${sem}ম`; name.textContent = `${ordinal} সেমিস্টার`;
      const track = document.createElement('div'); track.className = 'bar-track';
      const fill = document.createElement('div'); fill.className = 'bar-fill'; fill.style.width = `${Math.max(0, Math.min(100, value / 4 * 100))}%`; track.append(fill);
      const gpa = document.createElement('div'); gpa.className = 'gpa'; gpa.textContent = Number.isFinite(value) ? value.toFixed(2) : gpas[sem];
      row.append(name, track, gpa); list.append(row);
    });
    byId('semesterNote').textContent = semesters.length ? `এই রেকর্ডে ${semesters.length}টি সেমিস্টারের GPA পাওয়া গেছে।` : 'এই রেকর্ডে সেমিস্টারভিত্তিক GPA পাওয়া যায়নি।';
    byId('semesterNote').classList.toggle('hidden', semesters.length === 0);
    byId('cgpaNotice').classList.toggle('hidden', record.cgpa !== null && record.cgpa !== undefined && record.cgpa !== '');
    byId('sourceInfo').textContent = `তথ্যসূত্র: ${record.file || 'ফলাফল ডেটাবেস'}${record.page ? ` • PDF পৃষ্ঠা ${record.page}` : ''}`;
    message.classList.add('hidden');
    result.classList.remove('hidden');
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const roll = input.value.trim();
    button.disabled = true;
    search(roll);
    button.disabled = false;
  });
  loadPortalConfig();
  loadIndex();
})();

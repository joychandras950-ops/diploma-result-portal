(() => {
  const DATA_URL = './results-index.json.gz';
  const form = document.getElementById('searchForm');
  const input = document.getElementById('rollInput');
  const button = document.getElementById('searchButton');
  const message = document.getElementById('message');
  const result = document.getElementById('result');
  let index = null;
  let portalConfig = { developerName: 'Joy Chondro Sarker', facebook: 'https://www.facebook.com/joy.chondro.sarker.2024' };

  async function loadPortalConfig() {
    try {
      const response = await fetch('./developer.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Developer config unavailable');
      const config = await response.json();
      portalConfig = { developerName: config.developerName || portalConfig.developerName, facebook: config.facebook || portalConfig.facebook };
      const name = byId('developerName');
      const link = byId('developerFacebook');
      if (name && portalConfig.developerName) name.textContent = portalConfig.developerName;
      if (link && portalConfig.facebook) link.href = portalConfig.facebook;
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
    const sortedRecords = records.slice().sort((a,b) => Number(b.semester || 0) - Number(a.semester || 0));
    const record = sortedRecords[0];
    // শিক্ষার্থীর প্রতিষ্ঠান শুধু তার নিজের JSON রেকর্ড থেকে নাও; Developer config কখনো fallback নয়।
    const studentInstitute = sortedRecords.find(item => String(item.institute || '').trim())?.institute;
    byId('institute').textContent = String(studentInstitute || '').trim() || 'প্রতিষ্ঠানের তথ্য ডেটাবেজে নেই';
    byId('category').textContent = record.category || 'Diploma in Engineering';
    byId('regulation').textContent = record.regulation || 'তথ্য নেই';
    byId('rollValue').textContent = roll;
    byId('status').textContent = record.status || 'তথ্য নেই';
    byId('status').className = record.status === 'PASS' ? 'pass' : '';

    const gpas = Object.assign({}, ...sortedRecords.slice().reverse().map(item => item.gpas || {}));
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
    // Referred subjects are identified from raw ref_sub fields; subjects array
    // is used only as a fallback when a record explicitly contains a ref marker.
    const referredBySemester = new Map();
    const failBySemester = new Map();
    const parseCodes = value => [...new Set(String(value || '').match(/\d{4,6}\s*\([A-Za-z]+\)/g) || [])].map(x => x.replace(/\s+/g, ''));

    sortedRecords.forEach(item => {
      const raw = String(item.raw || '');
      const refMatch = raw.match(/(?:ref_sub|reffered_sub|referred_sub)\s*[-:=]\s*([\s\S]*?)(?=,?\s*(?:gpa\d+|expelled_sub)\s*[-:=]|$)/i);
      const hasRefMarker = Boolean(refMatch) || /\bgpa\d+\s*:\s*ref\b/i.test(raw);
      let refCodes = refMatch ? parseCodes(refMatch[1]) : [];
      if (!refCodes.length && hasRefMarker) refCodes = parseCodes((item.subjects || []).join(', '));
      if (refCodes.length) {
        const key = String(item.semester || 'তথ্য নেই');
        const set = referredBySemester.get(key) || new Set();
        refCodes.forEach(code => set.add(code));
        referredBySemester.set(key, set);
      }
      const allCodes = parseCodes((item.subjects || []).join(', '));
      const refSet = new Set(refCodes);
      const failedCodes = allCodes.filter(code => !refSet.has(code));
      if (String(item.status || '').toUpperCase() === 'FAIL' && failedCodes.length) {
        const key = String(item.semester || 'তথ্য নেই');
        const set = failBySemester.get(key) || new Set();
        failedCodes.forEach(code => set.add(code));
        failBySemester.set(key, set);
      }
    });

    const renderSubjectGroups = (groups, listId, cardClass, codesClass, chipClass, headingSuffix) => {
      const list = byId(listId);
      list.replaceChildren();
      [...groups.entries()].sort((a,b) => Number(a[0]) - Number(b[0])).forEach(([sem, set]) => {
        const codes = [...set];
        const card = document.createElement('div');
        card.className = cardClass;
        const heading = document.createElement('strong');
        const ordinals = {'1':'১ম','2':'২য়','3':'৩য়','4':'৪র্থ','5':'৫ম','6':'৬ষ্ঠ','7':'৭ম','8':'৮ম'};
        heading.textContent = `${ordinals[String(sem)] || sem} সেমিস্টার — ${codes.length}টি ${headingSuffix}`;
        const box = document.createElement('div');
        box.className = codesClass;
        codes.forEach(code => {
          const chip = document.createElement('span');
          chip.className = chipClass;
          chip.textContent = code;
          box.append(chip);
        });
        card.append(heading, box);
        list.append(card);
      });
      return [...groups.values()].reduce((sum, set) => sum + set.size, 0);
    };

    const failTotal = renderSubjectGroups(failBySemester, 'failSemesterList', 'fail-semester-card', 'fail-codes', 'fail-code', 'বিষয়ে অকৃতকার্য');
    byId('failSummary').classList.toggle('hidden', failTotal === 0);
    byId('failTotal').textContent = `${failTotal.toLocaleString('bn-BD')}টি`;

    const referredTotal = renderSubjectGroups(referredBySemester, 'referredSemesterList', 'referred-semester-card', 'referred-codes', 'referred-code', 'রেফার্ড বিষয়');
    byId('referredSummary').classList.toggle('hidden', referredTotal === 0);
    byId('referredTotal').textContent = `${referredTotal.toLocaleString('bn-BD')}টি`;
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

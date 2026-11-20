# Diploma Result Portal Hub — Design Update

GitHub Repository-এর root folder-এ `index.html`, `results-index.json.gz`, `developer-photo.jpg` এবং প্রয়োজনীয় PDF files রাখুন।

এই আপডেটে ওয়েবসাইটের UI থেকে PDF তালিকা ও PDF খোলার লিংক সরানো হয়েছে। ফলাফল কার্ডে রোল, সেমিস্টার/ক্যাটাগরি, পাওয়া GPA/CGPA (যদি snippet-এ নির্ভরযোগ্যভাবে থাকে) এবং মূল রেকর্ডের অংশ দেখানো হবে।

GitHub Pages: Settings → Pages → Deploy from a branch → `main` → `/(root)` → Save.

গুরুত্বপূর্ণ: Public GitHub repository-তে PDF ফাইল থাকলে সেগুলো URL বা repository থেকে সরাসরি পাওয়া সম্ভব। শুধু ওয়েবসাইটের UI থেকে লুকানো হয়; সম্পূর্ণ private করতে private backend/storage প্রয়োজন।

// ===================== AUTH =====================
const AUTH_KEY='edumanage_auth_v8';
const MENTOR_USERS_KEY='edumanage_mentor_users_v8';
const STUDENT_USERS_KEY='edumanage_student_users_v9';
const ADMIN_CRED_KEY='edumanage_admin_cred_v1';

// Admin login/parolni o'zi o'zgartira oladi (localStorage'da saqlanadi)
function getAdminCred(){
  try{
    const c=JSON.parse(localStorage.getItem(ADMIN_CRED_KEY)||'null');
    if(c&&c.login&&c.pass) return c;
  }catch(e){}
  return {login:'admin',pass:'admin123'};
}
function saveAdminCred(login,pass){
  localStorage.setItem(ADMIN_CRED_KEY,JSON.stringify({login:login,pass:pass}));
}

// Admin har doim bor, mentorlar va talabalar localStorage da saqlanadi
function getUsers(){
  const ac=getAdminCred();
  const base=[{login:ac.login,pass:ac.pass,name:'Admin',role:'Super Admin'}];
  try{
    const extras=JSON.parse(localStorage.getItem(MENTOR_USERS_KEY)||'[]');
    const studs=JSON.parse(localStorage.getItem(STUDENT_USERS_KEY)||'[]');
    return base.concat(extras).concat(studs);
  }catch(e){return base;}
}
function saveMentorUsers(arr){localStorage.setItem(MENTOR_USERS_KEY,JSON.stringify(arr));}
function getMentorUsers(){try{return JSON.parse(localStorage.getItem(MENTOR_USERS_KEY)||'[]');}catch(e){return[];}
}
function saveStudentUsers(arr){localStorage.setItem(STUDENT_USERS_KEY,JSON.stringify(arr));}
function getStudentUsers(){try{return JSON.parse(localStorage.getItem(STUDENT_USERS_KEY)||'[]');}catch(e){return[];}}

function checkAuth(){try{const a=JSON.parse(localStorage.getItem(AUTH_KEY)||'{}');return !!a.loggedIn;}catch(e){return false;}}
function getCurrentUser(){try{return JSON.parse(localStorage.getItem(AUTH_KEY)||'{}')}catch(e){return{};}}
function isMentorRole(){return getCurrentUser().role==='Mentor';}
function isStudentRole(){return getCurrentUser().role==='Talaba';}

function doLogin(){
  const user=document.getElementById('login-user').value.trim();
  const pass=document.getElementById('login-pass').value.trim();
  const found=getUsers().find(u=>u.login===user&&u.pass===pass);
  const errEl=document.getElementById('login-err');
  if(!found){
    errEl.style.display='block';
    ['login-user','login-pass'].forEach(id=>{const el=document.getElementById(id);el.classList.add('field-error');setTimeout(()=>el.classList.remove('field-error'),500);});
    document.getElementById('login-pass').value='';document.getElementById('login-pass').focus();return;
  }
  errEl.style.display='none';
  // Mentor uchun currentTab ni to'g'ri o'rnatib saqlash
  const isMentor=found.role==='Mentor';
  const isStudent=found.role==='Talaba';
  if(isMentor){
    try{
      const ui=JSON.parse(localStorage.getItem(UI_KEY)||'{}');
      ui.tab='mentor-dash';
      localStorage.setItem(UI_KEY,JSON.stringify(ui));
    }catch(e){}
  }
  if(isStudent){
    try{
      const ui=JSON.parse(localStorage.getItem(UI_KEY)||'{}');
      ui.tab='student-my';
      localStorage.setItem(UI_KEY,JSON.stringify(ui));
    }catch(e){}
  }
  if(!isMentor&&!isStudent){
    // Admin: always reset to dashboard to avoid leftover student/mentor tabs
    try{
      const ui=JSON.parse(localStorage.getItem(UI_KEY)||'{}');
      ui.tab='dashboard';
      localStorage.setItem(UI_KEY,JSON.stringify(ui));
    }catch(e){}
  }
  localStorage.setItem(AUTH_KEY,JSON.stringify({loggedIn:true,name:found.name,role:found.role,mentorName:found.mentorName||null,studentId:found.studentId||null,studentName:found.studentName||null}));
  showApp();
}
function doLogout(){if(!confirm('Tizimdan chiqasizmi?'))return;localStorage.removeItem(AUTH_KEY);location.reload();}
function showApp(){
  document.getElementById('login-screen').style.display='none';
  document.getElementById('app').style.display='flex';
  initApp();
  updateVideoNavLabels();
  if(isMentorRole()){
    setupMentorView();
  } else if(isStudentRole()){
    setupStudentView();
  }
}

// Mentor view: adminning ko'p bo'limlari yashiriladi
function setupMentorView(){
  const cu=getCurrentUser();
  // Sidebar tugmalarini yashir
  ['nav-dashboard','nav-courses','nav-groups','nav-mentors','nav-students','nav-finance','nav-settings'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.style.display='none';
  });
  // Mentor uchun kerakli tugmalar
  ['nav-mentor-dash','nav-mentors-my','nav-mentor-chat','nav-mentor-ai','nav-tests-mentor','nav-grades-mentor','nav-mentor-videos','nav-settings'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.style.display='flex';
  });
  const btnReset=document.getElementById('btn-reset');const btnExport=document.getElementById('btn-export');
  if(btnReset)btnReset.style.display='none';
  if(btnExport)btnExport.style.display='none';
  const uName=document.querySelector('.u-name');const uRole=document.querySelector('.u-role');
  if(uName)uName.textContent=cu.name||'Mentor';
  if(uRole)uRole.textContent='Mentor';
  const av=document.querySelector('.u-av');if(av)av.textContent=(cu.name||'M').substring(0,2).toUpperCase();
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  const myPanel=document.getElementById('panel-mentor-dash');
  if(myPanel)myPanel.classList.add('active');
  const navMyEl=document.getElementById('nav-mentor-dash');
  if(navMyEl)navMyEl.classList.add('active');
  currentTab='mentor-dash';
  updateTopbar('mentor-dash');
  renderMentorDashboard();
  const ncMT=document.getElementById('nc-tests-mentor');if(ncMT)ncMT.textContent=D.tests.length;
}

function setupStudentView(){
  const cu=getCurrentUser();
  // Sidebar - faqat student menyulari ko'rinsin
  ['nav-courses','nav-groups','nav-mentors','nav-students','nav-finance','nav-settings',
   'nav-dashboard','nav-mentor-dash','nav-mentors-my','nav-mentor-chat','nav-tests-mentor','nav-grades-mentor','nav-tests','nav-grades'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.style.display='none';
  });
  // Talaba uchun kerakli tugmalar
  ['nav-student-my','nav-student-schedule','nav-student-rating','nav-student-grades','nav-student-tests','nav-student-chat','nav-student-ai','nav-student-videos','nav-student-goals','nav-settings'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.style.display='flex';
  });
  // Test count badge
  const ncST=document.getElementById('nc-student-tests');
  if(ncST){
    const studentId=cu.studentId?parseInt(cu.studentId):null;
    const s=studentId?D.students.find(x=>x.id===studentId):null;
    const grp=s?D.groups.find(x=>x.id===s.groupId):null;
    const cnt=grp?(D.tests||[]).filter(t=>t.groupId===grp.id).length:0;
    if(cnt>0){ncST.textContent=cnt;ncST.style.display='flex';}
  }
  const btnReset=document.getElementById('btn-reset');const btnExport=document.getElementById('btn-export');
  if(btnReset)btnReset.style.display='none';
  if(btnExport)btnExport.style.display='none';
  const uName=document.querySelector('.u-name');const uRole=document.querySelector('.u-role');
  const studentId2=cu.studentId?parseInt(cu.studentId):null;
  const savedDisplay=_uiSettings['studentDisplayName_'+(studentId2||'')];
  const showName=savedDisplay||(cu.studentName||cu.name||'Talaba');
  const roleLbl=LANG==='ru'?'Студент':LANG==='en'?'Student':'Talaba';
  if(uName)uName.textContent=showName;
  if(uRole)uRole.textContent=roleLbl;
  const av=document.querySelector('.u-av');if(av)av.textContent=showName.substring(0,2).toUpperCase();
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  const myPanel=document.getElementById('panel-student-my');
  if(myPanel)myPanel.classList.add('active');
  const navMy=document.getElementById('nav-student-my');
  if(navMy)navMy.classList.add('active');
  currentTab='student-my';
  updateTopbar('student-my');
  renderStudentDashboard();
}

// ===================== STUDENT DASHBOARD =====================
function calcStudentRating(studentId, groupId){
  // Barcha oylardagi davomat bo'yicha reyting hisoblash (0-100)
  if(!D.attendance)return 0;
  let totalPresent=0,totalMarked=0;
  const keys=Object.keys(D.attendance).filter(k=>k.startsWith('att_'+groupId+'_'));
  keys.forEach(attKey=>{
    const sKey='s'+studentId;
    const sAtt=D.attendance[attKey]?.[sKey]||{};
    for(let l=1;l<=LESSON_COUNT;l++){
      const v=sAtt['l'+l]||'';
      if(v==='K'){totalPresent++;totalMarked++;}
      else if(v==='Y'||v==='S'){totalMarked++;}
    }
  });
  if(!totalMarked)return 0;
  return Math.round(totalPresent/totalMarked*100);
}

function calcGroupRating(groupId){
  // Guruh ichidagi barcha talabalar reytingini hisoblash
  const students=D.students.filter(s=>s.groupId===groupId);
  return students.map(s=>({
    id:s.id,name:s.name,status:s.status,isDebtor:s.isDebtor,
    rating:calcStudentRating(s.id,groupId)
  })).sort((a,b)=>b.rating-a.rating);
}

function renderStudentDashboard(){
  const wrap=document.getElementById('student-my-wrap');if(!wrap)return;
  const cu=getCurrentUser();
  const studentId=cu.studentId?parseInt(cu.studentId):null;
  const s=studentId?D.students.find(x=>x.id===studentId):null;

  if(!s){
    const notFoundLbl=LANG==='ru'?'Студент не найден':LANG==='en'?'Student not found':'Talaba topilmadi';
    const addLbl=LANG==='ru'?'Администратор должен добавить вас в систему':LANG==='en'?'Admin needs to add you to the system':'Admin sizni tizimga qo\'shishi kerak';
    wrap.innerHTML=`<div style="text-align:center;padding:60px 20px;color:var(--text3)"><div style="font-size:48px;margin-bottom:16px">🧑‍💻</div><div style="font-size:16px;font-weight:600">${notFoundLbl}</div><div style="font-size:13px;margin-top:8px">${addLbl}</div></div>`;
    return;
  }

  // Use custom display name if set
  const displayName = _uiSettings['studentDisplayName_'+studentId] || s.name;

  const grp=D.groups.find(x=>x.id===s.groupId);
  const mentorName=grp?grp.mentor:'—';
  const rating=calcStudentRating(s.id,s.groupId);
  const groupRatings=grp?calcGroupRating(s.groupId):[];
  const myRank=groupRatings.findIndex(x=>x.id===s.id)+1;
  const totalStudents=groupRatings.length;

  // Davomat statistikasi (joriy oy)
  const now=new Date();const cm=now.getMonth(),cy=now.getFullYear();
  const attKey='att_'+(s.groupId)+'_'+cy+'_'+cm;
  const sKey='s'+s.id;
  const sAtt=(D.attendance&&D.attendance[attKey]&&D.attendance[attKey][sKey])||{};
  let present=0,absent=0,excused=0;
  for(let l=1;l<=LESSON_COUNT;l++){const v=sAtt['l'+l]||'';if(v==='K')present++;else if(v==='Y')absent++;else if(v==='S')excused++;}
  const marked=present+absent+excused;
  const pct=marked>0?Math.round(present/marked*100):0;

  // Reyting badge rangi
  const ratingColor=rating>=80?'var(--teal-text)':rating>=60?'var(--amber-text)':'var(--orange-text)';
  const ratingEmoji=rating>=80?'🏆':rating>=60?'📈':'📉';
  const statusBadge={Aktiv:'b-teal',Faolsiz:'b-gray',Muzlatilgan:'b-blue',Probatsiya:'b-amber',Arxiv:'b-purple'};
  const statusIcon={Aktiv:'✅',Faolsiz:'⛔',Muzlatilgan:'❄️',Probatsiya:'🔶',Arxiv:'📦'};
  const DAY_FULL={Du:'Dushanba',Se:'Seshanba',Ch:'Chorshanba',Pa:'Payshanba',Ju:'Juma',Sh:'Shanba'};

  // Barcha oylar bo'yicha davomat
  let allMonthsHtml='';
  if(grp&&D.attendance){
    const keys=Object.keys(D.attendance).filter(k=>k.startsWith('att_'+s.groupId+'_')).sort();
    const monthNames=getMonthNames(true);
    keys.forEach(attKey=>{
      const parts=attKey.split('_');const yr=parseInt(parts[3]),mn=parseInt(parts[4]);
      const sAtt2=D.attendance[attKey]?.[sKey]||{};
      let p=0,a=0,e=0;
      for(let l=1;l<=LESSON_COUNT;l++){const v=sAtt2['l'+l]||'';if(v==='K')p++;else if(v==='Y')a++;else if(v==='S')e++;}
      const m2=p+a+e;if(!m2)return;
      const pct2=Math.round(p/m2*100);
      const c2=pct2>=80?'var(--teal-text)':pct2>=60?'var(--amber-text)':'var(--orange-text)';
      allMonthsHtml+=`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--bg2);border-radius:var(--r-md);border:1px solid var(--border);margin-bottom:6px">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:90px">${monthNames[mn]||mn} ${yr}</div>
        <div style="flex:1;height:8px;background:var(--bg4);border-radius:4px;overflow:hidden"><div style="height:100%;width:${pct2}%;background:${c2};border-radius:4px;transition:width .4s"></div></div>
        <span style="font-size:12px;font-weight:800;color:${c2};min-width:36px;text-align:right">${pct2}%</span>
        <span style="font-size:10px;color:var(--text3)">K:${p} Y:${a} S:${e}</span>
      </div>`;
    });
  }

  // Guruh reytingi jadvali
  let rankHtml='';
  groupRatings.forEach((r,idx)=>{
    const isMe=r.id===s.id;
    const rc=r.rating>=80?'var(--teal-text)':r.rating>=60?'var(--amber-text)':'var(--orange-text)';
    const rgBg=r.rating>=80?'var(--teal)':r.rating>=60?'var(--amber)':'var(--orange)';
    const medal=idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':`<span style="font-size:12px;font-weight:800;color:var(--text3)">${idx+1}</span>`;
    rankHtml+=`<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:var(--r-md);border:${isMe?'2px solid var(--accent)':'1.5px solid var(--border)'};background:${isMe?'var(--accent-light)':'var(--bg2)'};margin-bottom:6px;transition:.15s">
      <span style="font-size:${idx<3?'18px':'13px'};min-width:28px;text-align:center">${medal}</span>
      <div class="av ${AV_CLS[idx%5]}" style="width:32px;height:32px;font-size:11px;flex-shrink:0;border:2px solid ${isMe?'var(--accent)':'transparent'}">${ini(r.name)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:${isMe?'800':'600'};color:${isMe?'var(--accent-text)':'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.name}${isMe?' 👈':''}</div>
        <div style="height:5px;background:var(--bg4);border-radius:3px;margin-top:5px;overflow:hidden"><div style="height:100%;width:${r.rating}%;background:${rgBg};border-radius:3px"></div></div>
      </div>
      <span style="font-size:15px;font-weight:900;color:${rc};min-width:46px;text-align:right">${r.rating}%</span>
    </div>`;
  });

  wrap.innerHTML=`
  <div style="padding:0 0 24px">
    <!-- Salom banner -->
    <div style="background:linear-gradient(135deg,var(--accent),var(--teal));border-radius:var(--r-lg);padding:22px 24px;color:#fff;margin-bottom:20px;position:relative;overflow:hidden">
      <div style="position:absolute;right:-20px;top:-20px;font-size:120px;opacity:.08;pointer-events:none">🎓</div>
      <div style="font-size:13px;opacity:.85;font-weight:500">${LANG==='ru'?'Добро пожаловать,':LANG==='en'?'Welcome,':'Xush kelibsiz,'}</div>
      <div style="font-size:24px;font-weight:800;letter-spacing:-.5px;margin:4px 0">${displayName}</div>
      <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">
        <span style="background:rgba(255,255,255,.2);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">📚 ${grp?grp.course:'—'}</span>
        <span style="background:rgba(255,255,255,.2);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">👥 ${grp?grp.name:'—'} ${LANG==='ru'?'группа':LANG==='en'?'group':'guruhi'}</span>
        <span style="background:rgba(255,255,255,.2);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">🎓 ${mentorName}</span>
      </div>
    </div>

    <!-- Asosiy kartochkalar -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px">
      <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:16px 18px;text-align:center;box-shadow:var(--shadow-sm);cursor:pointer;transition:.15s" onclick="showStudentDetailPopup('rating')" onmouseover="this.style.transform='translateY(-2px)';this.style.borderColor='var(--accent)'" onmouseout="this.style.transform='';this.style.borderColor='var(--border2)'">
        <div style="font-size:32px;font-weight:900;color:${ratingColor}">${ratingEmoji} ${rating}%</div>
        <div style="font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-top:4px">${LANG==='ru'?'Общий рейтинг':LANG==='en'?'Overall Rating':'Umumiy reyting'}</div>
        <div style="font-size:10px;color:var(--accent-text);margin-top:3px">${LANG==='ru'?'Нажмите →':LANG==='en'?'Click →':'Bosing →'}</div>
      </div>
      <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:16px 18px;text-align:center;box-shadow:var(--shadow-sm);cursor:pointer;transition:.15s" onclick="go('student-rating',document.getElementById('nav-student-rating'))" onmouseover="this.style.transform='translateY(-2px)';this.style.borderColor='var(--accent)'" onmouseout="this.style.transform='';this.style.borderColor='var(--border2)'">
        <div style="font-size:32px;font-weight:900;color:var(--accent)">${myRank?myRank+'/'+(totalStudents):'—'}</div>
        <div style="font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-top:4px">${LANG==='ru'?'Место в группе':LANG==='en'?'Group Rank':"Guruh o'rni"}</div>
        <div style="font-size:10px;color:var(--accent-text);margin-top:3px">${LANG==='ru'?'Нажмите →':LANG==='en'?'Click →':'Bosing →'}</div>
      </div>
      <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:16px 18px;text-align:center;box-shadow:var(--shadow-sm);cursor:pointer;transition:.15s" onclick="showStudentDetailPopup('attendance')" onmouseover="this.style.transform='translateY(-2px)';this.style.borderColor='var(--accent)'" onmouseout="this.style.transform='';this.style.borderColor='var(--border2)'">
        <div style="font-size:32px;font-weight:900;color:${pct>=80?'var(--teal-text)':pct>=60?'var(--amber-text)':'var(--orange-text)'}">${pct}%</div>
        <div style="font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-top:4px">${LANG==='ru'?'Посещаемость':LANG==='en'?'This Month Att.':'Bu oy davomat'}</div>
        <div style="font-size:10px;color:var(--accent-text);margin-top:3px">${LANG==='ru'?'Нажмите →':LANG==='en'?'Click →':'Bosing →'}</div>
      </div>
      <div style="background:var(--bg);border:1.5px solid ${s.isDebtor?'var(--orange)':'var(--teal)'};border-radius:var(--r-lg);padding:16px 18px;text-align:center;box-shadow:var(--shadow-sm);cursor:pointer;transition:.15s" onclick="showStudentDetailPopup('debt')" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
        <div style="font-size:28px;font-weight:900;color:${s.isDebtor?'var(--orange-text)':'var(--teal-text)'}">${s.isDebtor?(LANG==='ru'?'💸 Должник':LANG==='en'?'💸 Debtor':'💸 Qarzdor'):(LANG==='ru'?"✅ Оплачено":LANG==='en'?"✅ Paid":"✅ To'lagan")}</div>
        <div style="font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-top:4px">${LANG==='ru'?'Статус оплаты':LANG==='en'?'Payment Status':"To'lov holati"}</div>
        <div style="font-size:10px;color:var(--accent-text);margin-top:3px">Bosing →</div>
      </div>
    </div>

        <!-- Shaxsiy ma'lumotlar + dars jadvali -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
      <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:18px 20px;box-shadow:var(--shadow-sm)">
        <div style="font-size:14px;font-weight:800;margin-bottom:14px;color:var(--text)">${LANG==='ru'?'👤 Личные данные':LANG==='en'?'👤 Personal Info':"👤 Shaxsiy ma'lumotlar"}</div>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:13px">
          <div style="display:flex;gap:8px"><span style="color:var(--text3);min-width:110px">${LANG==='ru'?'📱 Телефон':LANG==='en'?'📱 Phone':'📱 Telefon'}</span><span style="font-weight:600;color:var(--text)">${s.phone||'—'}</span></div>
          <div style="display:flex;gap:8px"><span style="color:var(--text3);min-width:110px">${LANG==='ru'?'🎂 Дата рожд.':LANG==='en'?'🎂 Birthday':"🎂 Tug'ilgan"}</span><span style="font-weight:600;color:var(--text)">${fmtDate(s.birthDate)}</span></div>
          <div style="display:flex;gap:8px"><span style="color:var(--text3);min-width:110px">${LANG==='ru'?'📅 Добавлен':LANG==='en'?'📅 Joined':"📅 Qo'shilgan"}</span><span style="font-weight:600;color:var(--text)">${fmtDate(s.joinDate)}</span></div>
          <div style="display:flex;gap:8px"><span style="color:var(--text3);min-width:110px">${LANG==='ru'?'📊 Статус':LANG==='en'?'📊 Status':'📊 Holat'}</span><span class="badge ${statusBadge[s.status]||'b-gray'}">${statusIcon[s.status]||''} ${s.status}</span></div>
          ${s.parentName?`<div style="display:flex;gap:8px"><span style="color:var(--text3);min-width:110px">${LANG==='ru'?'👪 Родители':LANG==='en'?'👪 Parent':"👪 Ota-ona"}</span><span style="font-weight:600;color:var(--text)">${s.parentName}</span></div>`:''}
          ${s.parentPhone?`<div style="display:flex;gap:8px"><span style="color:var(--text3);min-width:110px">${LANG==='ru'?'📞 Тел. родит.':LANG==='en'?'📞 Parent tel.':"📞 Ota tel."}</span><span style="font-weight:600;color:var(--text)">${s.parentPhone}</span></div>`:''}
        </div>
      </div>
      <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:18px 20px;box-shadow:var(--shadow-sm)">
        <div style="font-size:14px;font-weight:800;margin-bottom:14px;color:var(--text)">${LANG==='ru'?'📅 Расписание':LANG==='en'?'📅 Schedule':'📅 Dars jadvali'}</div>
        ${grp?`
        <div style="display:flex;flex-direction:column;gap:8px;font-size:13px">
          <div style="display:flex;gap:8px"><span style="color:var(--text3);min-width:80px">${LANG==='ru'?'⏰ Время':LANG==='en'?'⏰ Time':'⏰ Vaqt'}</span><span style="font-weight:700;color:var(--accent)">${grp.timeStart||'—'} – ${grp.timeEnd||'—'}</span></div>
          <div style="display:flex;gap:8px"><span style="color:var(--text3);min-width:80px">${LANG==='ru'?'🚪 Кабинет':LANG==='en'?'🚪 Room':'🚪 Xona'}</span><span style="font-weight:700;color:var(--teal-text)">${grp.room||'—'}-xona</span></div>
          <div style="display:flex;gap:8px;align-items:flex-start"><span style="color:var(--text3);min-width:80px">${LANG==='ru'?'📆 Дни':LANG==='en'?'📆 Days':'📆 Kunlar'}</span><div style="display:flex;flex-wrap:wrap;gap:4px">${(grp.days||[]).map(d=>`<span style="background:var(--accent-light);color:var(--accent-text);padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;border:1px solid var(--accent)">${DAY_FULL[d]||d}</span>`).join('')}</div></div>
          <div style="display:flex;gap:8px"><span style="color:var(--text3);min-width:80px">${LANG==='ru'?'🎓 Ментор':LANG==='en'?'🎓 Mentor':'🎓 Mentor'}</span><span style="font-weight:600;color:var(--text)">${grp.mentor||'—'}</span></div>
          <div style="display:flex;gap:8px"><span style="color:var(--text3);min-width:80px">${LANG==='ru'?'📋 Начало':LANG==='en'?'📋 Start':'📋 Boshlanish'}</span><span style="font-weight:600;color:var(--text)">${fmtDate(grp.startDate)}</span></div>
        </div>`:'<div style="color:var(--text3);font-size:13px">Guruh topilmadi</div>'}
      </div>
    </div>

    <!-- Bu oy davomat tafsiloti -->
    <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:18px 20px;box-shadow:var(--shadow-sm);margin-bottom:20px">
      <div style="font-size:14px;font-weight:800;margin-bottom:14px;color:var(--text)">${LANG==='ru'?'📋 Посещаемость в этом месяце':LANG==='en'?'📋 This Month Attendance':'📋 Bu oy davomati'} · <span style="color:var(--text3);font-weight:500;font-size:12px">${LANG==='ru'?'П=Пришёл, Н=Нет, У=Уважит.':LANG==='en'?'P=Present, A=Absent, E=Excused':"K=Keldi, Y=Yo'q, S=Sababli"}</span></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
        ${Array.from({length:LESSON_COUNT},(_,i)=>{
          const v=sAtt['l'+(i+1)]||'';
          const styleMap={'':'background:var(--bg3);border-color:var(--border2);color:var(--text3)','K':'background:var(--teal-light);border-color:var(--teal);color:var(--teal-text)','Y':'background:var(--amber-light);border-color:var(--amber);color:var(--amber-text)','S':'background:var(--purple-light);border-color:var(--purple);color:var(--purple-text)'};
          return `<div style="display:flex;flex-direction:column;align-items:center;gap:3px"><span style="font-size:9px;color:var(--text3)">${i+1}</span><div style="${styleMap[v]||styleMap['']};width:32px;height:28px;border-radius:6px;border:1.5px solid;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;font-family:'JetBrains Mono',monospace">${v||'·'}</div></div>`;
        }).join('')}
      </div>
      <div style="display:flex;gap:10px;font-size:12px">
        <span style="background:var(--teal-light);color:var(--teal-text);padding:4px 10px;border-radius:10px;font-weight:700">${LANG==='ru'?'✅ Пришёл':LANG==='en'?'✅ Present':'✅ Keldi'}: ${present}</span>
        <span style="background:var(--amber-light);color:var(--amber-text);padding:4px 10px;border-radius:10px;font-weight:700">${LANG==='ru'?'❌ Отсутствует':LANG==='en'?'❌ Absent':"❌ Yo'q"}: ${absent}</span>
        <span style="background:var(--purple-light);color:var(--purple-text);padding:4px 10px;border-radius:10px;font-weight:700">${LANG==='ru'?'📝 Уважит.':LANG==='en'?'📝 Excused':'📝 Sababli'}: ${excused}</span>
        <span style="background:var(--bg4);color:var(--text2);padding:4px 10px;border-radius:10px;font-weight:700">${LANG==='ru'?'📊 Посещ.':LANG==='en'?'📊 Attend.':'📊 Davomat'}: ${pct}%</span>
      </div>
    </div>

    <!-- Oylar bo'yicha davomat -->
    ${allMonthsHtml?`<div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:18px 20px;box-shadow:var(--shadow-sm);margin-bottom:20px">
      <div style="font-size:14px;font-weight:800;margin-bottom:14px;color:var(--text)">${LANG==='ru'?'📈 Посещаемость по месяцам':LANG==='en'?'📈 Monthly Attendance':'📈 Barcha oylar davomati'}</div>
      ${allMonthsHtml}
    </div>`:''}

    <!-- Guruh reytingi -->
    ${rankHtml?`<div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:18px 20px;box-shadow:var(--shadow-sm)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div style="font-size:14px;font-weight:800;color:var(--text)">🏆 ${LANG==='ru'?'Рейтинг группы':LANG==='en'?'Group Rating':'Guruh reytingi'}</div>
        <span style="background:var(--accent-light);color:var(--accent-text);padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">${myRank?myRank+'/'+totalStudents:'—'}</span>
      </div>
      ${rankHtml}
    </div>`:''}

    <!-- Tezkor navigatsiya -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:20px">
      <button class="btn" onclick="go('student-schedule',document.getElementById('nav-student-schedule'))" style="padding:14px 10px;display:flex;flex-direction:column;align-items:center;gap:6px;background:var(--bg2);border:1.5px solid var(--border2);border-radius:var(--r-lg);cursor:pointer;font-size:13px;font-weight:700;color:var(--text)"><span style="font-size:22px">📅</span>${LANG==='ru'?'Расписание':LANG==='en'?'Schedule':'Dars jadvali'}</button>
      <button class="btn" onclick="go('student-rating',document.getElementById('nav-student-rating'))" style="padding:14px 10px;display:flex;flex-direction:column;align-items:center;gap:6px;background:var(--bg2);border:1.5px solid var(--border2);border-radius:var(--r-lg);cursor:pointer;font-size:13px;font-weight:700;color:var(--text)"><span style="font-size:22px">🏆</span>${LANG==='ru'?'Рейтинг':LANG==='en'?'Rating':'Reyting'}</button>
      <button class="btn" onclick="go('student-grades',document.getElementById('nav-student-grades'))" style="padding:14px 10px;display:flex;flex-direction:column;align-items:center;gap:6px;background:var(--bg2);border:1.5px solid var(--border2);border-radius:var(--r-lg);cursor:pointer;font-size:13px;font-weight:700;color:var(--text)"><span style="font-size:22px">🏅</span>${LANG==='ru'?'Оценки':LANG==='en'?'Grades':'Baholash'}</button>
      <button class="btn" onclick="go('student-tests',document.getElementById('nav-student-tests'))" style="padding:14px 10px;display:flex;flex-direction:column;align-items:center;gap:6px;background:var(--bg2);border:1.5px solid var(--border2);border-radius:var(--r-lg);cursor:pointer;font-size:13px;font-weight:700;color:var(--text)"><span style="font-size:22px">📝</span>${LANG==='ru'?'Тесты':LANG==='en'?'Tests':'Testlar'}</button>
      <button class="btn" onclick="go('student-chat',document.getElementById('nav-student-chat'))" style="padding:14px 10px;display:flex;flex-direction:column;align-items:center;gap:6px;background:var(--bg2);border:1.5px solid var(--border2);border-radius:var(--r-lg);cursor:pointer;font-size:13px;font-weight:700;color:var(--text)"><span style="font-size:22px">💬</span>${LANG==='ru'?'Чат':LANG==='en'?'Chat':'Chat'}</button>
      <button class="btn" onclick="go('student-goals',document.getElementById('nav-student-goals'))" style="padding:14px 10px;display:flex;flex-direction:column;align-items:center;gap:6px;background:var(--accent-light);border:1.5px solid var(--accent);border-radius:var(--r-lg);cursor:pointer;font-size:13px;font-weight:700;color:var(--accent-text)"><span style="font-size:22px">🎯</span>${LANG==='ru'?'Цели':LANG==='en'?'Goals':'Maqsadlar'}</button>
    </div>

    ${renderStudentFunFeatures(s, grp, pct, rating, myRank, totalStudents)}
  </div>`;
}

function renderStudentFunFeatures(s, grp, pct, rating, myRank, totalStudents){
  // 1. Streak (consecutive days present this month based on attendance)
  const streakDays = calcStudentStreak(s.id, s.groupId);

  // 2. Next lesson countdown
  const nextLessonInfo = getNextLessonInfo(grp);

  // 3. Motivational quote
  const quotes = {
    uz: [
      {q:"Muvaffaqiyat — bu tasodif emas, balki izchil harakat natijasidir.", a:"Albert Einstein"},
      {q:"Bugun o'rganmagan narsa — ertaga imkoniyat bo'ladi.", a:"EduManage"},
      {q:"Bilim — eng yaxshi investitsiyadir.", a:"Benjamin Franklin"},
      {q:"Har bir dars seni maqsadingga bir qadam yaqinlashtiradi.", a:"EduManage"},
      {q:"Qiyin yo'l ko'pincha to'g'ri yo'ldir.", a:"EduManage"},
    ],
    ru: [
      {q:"Успех — это не случайность, а результат последовательных усилий.", a:"Альберт Эйнштейн"},
      {q:"То, чего ты не узнал сегодня — станет возможностью завтра.", a:"EduManage"},
      {q:"Знание — лучшая инвестиция.", a:"Бенджамин Франклин"},
      {q:"Каждый урок приближает тебя к цели на один шаг.", a:"EduManage"},
      {q:"Трудный путь — зачастую правильный путь.", a:"EduManage"},
    ],
    en: [
      {q:"Success is not an accident — it's the result of consistent effort.", a:"Albert Einstein"},
      {q:"What you don't learn today becomes an opportunity tomorrow.", a:"EduManage"},
      {q:"Knowledge is the best investment.", a:"Benjamin Franklin"},
      {q:"Every lesson brings you one step closer to your goal.", a:"EduManage"},
      {q:"The hard path is often the right path.", a:"EduManage"},
    ]
  };
  const qArr = quotes[LANG]||quotes.uz;
  const qDay = new Date().getDate() % qArr.length;
  const quote = qArr[qDay];

  // 4. Achievements
  const achievements = calcStudentAchievements(s.id, s.groupId, pct, rating, myRank, totalStudents);

  // 5. Goal from settings
  const goal = _uiSettings.studentGoal||'';

  const streakLbl=LANG==='ru'?'Серия посещений':LANG==='en'?'Attendance Streak':'Davomat seriyasi';
  const streakDayLbl=LANG==='ru'?'дн.':LANG==='en'?'days':'kun';
  const nextLsnLbl=LANG==='ru'?'Следующий урок':LANG==='en'?'Next Lesson':'Keyingi dars';
  const todayLbl=LANG==='ru'?'Сегодня!':LANG==='en'?'Today!':'Bugun!';
  const achLbl=LANG==='ru'?'Мои достижения':LANG==='en'?'My Achievements':'Mening yutuqlarim';
  const myGoalLbl=LANG==='ru'?'Моя цель':LANG==='en'?'My Goal':'Mening maqsadim';
  const setGoalLbl=LANG==='ru'?'Установить в целях →':LANG==='en'?'Set in Goals →':'Maqsadlarda belgilash →';
  const motiveLbl=LANG==='ru'?'Мотивация дня':LANG==='en'?'Quote of the Day':'Kunlik ilhom';

  const achieveHtml = achievements.map((a,ai)=>{
    const tipId='ach-tip-'+ai;
    const howToUz=['Davomat reytingingizni 80%+ ga yetkazing. Darslarga muntazam keling, dars o\'tkazmang.','Oyda 90% va undan ko\'proq darslarga keling. Sababsiz dars o\'tkazmaslik kerak.','Guruhda davomat bo\'yicha 1-o\'ringa chiqing. Barcha guruh o\'rtoqlaridan yuqori bo\'ling.','100% davomat — birorta ham dars o\'tkazmaslik. Har bir darsga kelib turing!','"Maqsadlarim" bo\'limiga o\'tib birinchi o\'quv maqsadingizni qo\'shing.','"Maqsadlarim" bo\'limida kamida 1 ta maqsadni "Bajarildi" deb belgilang.'];
    const howToRu=['Набери рейтинг 80%+. Ходи на уроки регулярно, не пропускай занятия.','Посещай 90%+ уроков в месяц. Не пропускай занятия без уважительной причины.','Стань лучшим в группе по посещаемости. Обгони всех одногруппников.','100% посещаемость — ни одного пропуска. Приходи на каждый урок!','Перейди в "Мои цели" и добавь первую учебную цель.','В разделе "Мои цели" отметь хотя бы 1 цель как выполненную.'];
    const howToEn=['Get your rating to 80%+. Come to lessons regularly, don\'t skip classes.','Attend 90%+ lessons per month. Don\'t skip without a valid reason.','Become #1 in your group by attendance. Outperform all your groupmates.','100% attendance — not a single skip. Show up to every lesson!','Go to "My Goals" and add your first learning goal.','In "My Goals", mark at least 1 goal as completed.'];
    const howArr=LANG==='ru'?howToRu:LANG==='en'?howToEn:howToUz;
    const howTo=howArr[ai]||a.desc;
    const earnedLabel=LANG==='ru'?'\u2705 Bajarildi!':LANG==='en'?'\u2705 Achieved!':'\u2705 Erishildi!';
    const howLabel=LANG==='ru'?'\ud83d\udca1 Qanday olish mumkin?':LANG==='en'?'\ud83d\udca1 How to earn?':'\ud83d\udca1 Qanday olish mumkin?';
    const detailLabel=LANG==='ru'?'batafsil':LANG==='en'?'details':'batafsil';
    const congratsText=LANG==='ru'?'Tabriklaymiz! Siz bu yutuqni qo\'lga kiritdingiz.':LANG==='en'?'Congratulations! You earned this badge.':'Tabriklaymiz! Siz bu yutuqni qo\'lga kiritdingiz.';
    const bg=a.earned?'linear-gradient(135deg,var(--teal-light),var(--bg2))':'var(--bg3)';
    const border=a.earned?'var(--teal)':'var(--border2)';
    const iconBg=a.earned?'var(--teal)':'var(--bg4)';
    const shadow=a.earned?'0 2px 12px rgba(13,148,136,.13)':'none';
    const nameClr=a.earned?'var(--teal-text)':'var(--text2)';
    const tipBorder=a.earned?'var(--teal)':'var(--border2)';
    const tipBg=a.earned?'rgba(13,148,136,.07)':'var(--bg4)';
    const labelClr=a.earned?'var(--teal-text)':'var(--accent-text)';
    const statusIco=a.earned?'<span style="font-size:20px">\u2705</span>':'<span style="font-size:18px;opacity:.4">\ud83d\udd12</span>';
    return '<div onclick="(function(){var t=document.getElementById(\''+tipId+'\');if(t)t.style.display=t.style.display===\'none\'?\'block\':\'none\';})()" style="cursor:pointer;background:'+bg+';border:2px solid '+border+';border-radius:14px;overflow:hidden;transition:box-shadow .2s;box-shadow:'+shadow+'" onmouseover="this.style.boxShadow=\'0 4px 18px rgba(0,0,0,.13)\'" onmouseout="this.style.boxShadow=\''+shadow+'\'">'
    +'<div style="display:flex;align-items:center;gap:12px;padding:13px 16px">'
    +'<div style="width:44px;height:44px;border-radius:12px;background:'+iconBg+';display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;opacity:'+(a.earned?1:.45)+'">'+a.icon+'</div>'
    +'<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:800;color:'+nameClr+'">'+a.name+'</div><div style="font-size:11px;color:var(--text3);margin-top:2px">'+a.desc+'</div></div>'
    +'<div style="display:flex;flex-direction:column;align-items:center;gap:3px;flex-shrink:0">'+statusIco+'<span style="font-size:9px;color:var(--text3);font-weight:700">'+detailLabel+' \u25be</span></div>'
    +'</div>'
    +'<div id="'+tipId+'" style="display:none;padding:10px 16px 14px;border-top:1.5px dashed '+tipBorder+';background:'+tipBg+'">'
    +'<div style="font-size:11px;font-weight:700;color:'+labelClr+';text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">'+(a.earned?earnedLabel:howLabel)+'</div>'
    +'<div style="font-size:12px;color:var(--text2);line-height:1.7">'+(a.earned?congratsText:howTo)+'</div>'
    +'</div>'
    +'</div>';
  }).join('');

  return `
  <!-- Fun Features Block -->
  <div style="margin-top:20px;display:flex;flex-direction:column;gap:16px">

    <!-- Row 1: Streak + Next Lesson -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <!-- Streak -->
      <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:16px 18px;box-shadow:var(--shadow-sm);text-align:center">
        <div style="font-size:36px;margin-bottom:4px">🔥</div>
        <div style="font-size:32px;font-weight:900;color:var(--orange-text)">${streakDays}</div>
        <div style="font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px">${streakLbl}</div>
        <div style="font-size:10px;color:var(--text3);margin-top:3px">${streakDays} ${streakDayLbl} ketma-ket</div>
      </div>
      <!-- Next Lesson -->
      <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:16px 18px;box-shadow:var(--shadow-sm);text-align:center">
        <div style="font-size:36px;margin-bottom:4px">⏰</div>
        <div style="font-size:18px;font-weight:800;color:var(--accent-text)">${nextLessonInfo.label}</div>
        <div style="font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-top:4px">${nextLsnLbl}</div>
        <div style="font-size:10px;color:var(--text3);margin-top:3px">${nextLessonInfo.detail}</div>
      </div>
    </div>

    <!-- Motivational Quote -->
    <div style="background:linear-gradient(135deg,var(--purple-light),var(--bg2));border:1.5px solid var(--purple);border-radius:var(--r-lg);padding:18px 20px;position:relative;overflow:hidden">
      <div style="position:absolute;right:10px;top:10px;font-size:60px;opacity:.06">💬</div>
      <div style="font-size:11px;font-weight:700;color:var(--purple-text);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">✨ ${motiveLbl}</div>
      <div style="font-size:14px;font-weight:600;color:var(--text);line-height:1.6;font-style:italic">"${quote.q}"</div>
      <div style="font-size:11px;color:var(--text3);margin-top:8px;font-weight:600">— ${quote.a}</div>
    </div>

    <!-- Goal -->
    <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:16px 20px;box-shadow:var(--shadow-sm);display:flex;align-items:center;gap:14px;cursor:pointer" onclick="go('student-goals',document.getElementById('nav-student-goals'))">
      <div style="font-size:32px">🎯</div>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">${myGoalLbl}</div>
        <div style="font-size:14px;font-weight:600;color:${goal?'var(--text)':'var(--text3)'};margin-top:3px">${goal||`<span style="color:var(--accent-text);font-size:12px">${setGoalLbl}</span>`}</div>
      </div>
      <span style="color:var(--text3);font-size:16px">→</span>
    </div>


  </div>`;
}

function calcStudentStreak(studentId, groupId){
  if(!D.attendance) return 0;
  let streak=0;
  const now=new Date();
  // Check last 30 days for streak
  for(let d=0;d<30;d++){
    const dd=new Date(now);dd.setDate(now.getDate()-d);
    const key='att_'+groupId+'_'+dd.getFullYear()+'_'+dd.getMonth();
    const dayAtt=D.attendance[key];
    if(!dayAtt) continue;
    const sk='s'+studentId;
    const sAtt=dayAtt[sk]||{};
    const hasPresent=Object.values(sAtt).some(v=>v==='K');
    if(hasPresent) streak++;
    else if(d>0) break;
  }
  return streak;
}

function getNextLessonInfo(grp){
  if(!grp) return {label:'—',detail:'—'};
  const DAY_MAP={Du:1,Se:2,Ch:3,Pa:4,Ju:5,Sh:6};
  const DAY_NAMES_UZ={Du:'Dushanba',Se:'Seshanba',Ch:'Chorshanba',Pa:'Payshanba',Ju:'Juma',Sh:'Shanba'};
  const DAY_NAMES_RU={Du:'Пн',Se:'Вт',Ch:'Ср',Pa:'Чт',Ju:'Пт',Sh:'Сб'};
  const DAY_NAMES_EN={Du:'Mon',Se:'Tue',Ch:'Wed',Pa:'Thu',Ju:'Fri',Sh:'Sat'};
  const now=new Date();
  const today=now.getDay(); // 0=Sun,1=Mon
  if(!grp.days||!grp.days.length) return {label:'—',detail:grp.timeStart||'—'};
  let minDiff=7;
  let nextDay=null;
  grp.days.forEach(d=>{
    const num=DAY_MAP[d]||0;
    let diff=num-today;
    if(diff<0) diff+=7;
    if(diff===0){
      // Check if lesson time hasn't passed today
      const [h,m]=(grp.timeStart||'09:00').split(':').map(Number);
      const lessonMin=h*60+m;
      const nowMin=now.getHours()*60+now.getMinutes();
      if(nowMin<=lessonMin) diff=0;
      else diff=7;
    }
    if(diff<minDiff){minDiff=diff;nextDay=d;}
  });
  if(!nextDay) return {label:'—',detail:grp.timeStart||'—'};
  const dayName=LANG==='ru'?DAY_NAMES_RU[nextDay]:LANG==='en'?DAY_NAMES_EN[nextDay]:DAY_NAMES_UZ[nextDay];
  if(minDiff===0){
    const todayLbl=LANG==='ru'?'Сегодня':LANG==='en'?'Today':'Bugun';
    return {label:todayLbl+' 🎉',detail:grp.timeStart+' · '+grp.room+'-xona'};
  }
  if(minDiff===1){
    const tomorrowLbl=LANG==='ru'?'Завтра':LANG==='en'?'Tomorrow':'Ertaga';
    return {label:tomorrowLbl+' 📅',detail:dayName+' · '+grp.timeStart};
  }
  const inLbl=LANG==='ru'?'Через '+minDiff+' дн.':LANG==='en'?'In '+minDiff+' days':''+minDiff+' kundan';
  return {label:inLbl,detail:dayName+' · '+grp.timeStart};
}

function calcStudentAchievements(studentId, groupId, pct, rating, myRank, totalStudents){
  const LANG_=LANG;
  const ach=[
    {
      icon:'⭐',
      name:LANG_==='ru'?'Отличник':LANG_==='en'?'Top Student':'A\'lochi',
      desc:LANG_==='ru'?'Рейтинг 80%+':LANG_==='en'?'Rating 80%+':'Reyting 80%+',
      earned:rating>=80
    },
    {
      icon:'🔥',
      name:LANG_==='ru'?'Активный':LANG_==='en'?'Active Learner':'Faol o\'quvchi',
      desc:LANG_==='ru'?'Посещаемость 90%+':LANG_==='en'?'Attendance 90%+':'Davomat 90%+',
      earned:pct>=90
    },
    {
      icon:'🥇',
      name:LANG_==='ru'?'Лидер группы':LANG_==='en'?'Group Leader':'Guruh lideri',
      desc:LANG_==='ru'?'1-е место в группе':LANG_==='en'?'1st place in group':'Guruhda 1-o\'rin',
      earned:myRank===1
    },
    {
      icon:'💯',
      name:LANG_==='ru'?'Идеальное посещение':LANG_==='en'?'Perfect Attendance':'Mukammal davomat',
      desc:LANG_==='ru'?'100% посещаемость':LANG_==='en'?'100% attendance':'100% davomat',
      earned:pct>=100
    },
    {
      icon:'🎯',
      name:LANG_==='ru'?'Целеустремлённый':LANG_==='en'?'Goal Setter':'Maqsadli',
      desc:LANG_==='ru'?'Цель установлена':LANG_==='en'?'Goal is set':'Maqsad belgilangan',
      earned:!!(_uiSettings.studentGoal)
    },
    {
      icon:'🏅',
      name:LANG_==='ru'?'Достигатель':LANG_==='en'?'Achiever':'Maqsadga yetuvchi',
      desc:LANG_==='ru'?'Выполнена 1 цель':LANG_==='en'?'1 goal completed':'1 maqsad bajarildi',
      earned:(()=>{try{const goals=JSON.parse(localStorage.getItem('edumanage_student_goals')||'[]');return goals.filter(g=>g.done).length>=1;}catch(e){return false;}})()
    },
  ];
  return ach;
}

// ===================== CONSTANTS =====================
const MONTHS_UZ=['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
const MONTHS_FULL_UZ=['yanvar','fevral','mart','aprel','may','iyun','iyul','avgust','sentabr','oktabr','noyabr','dekabr'];
const MONTHS_FULL_RU=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
const MONTHS_FULL_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_RU=['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const MONTHS_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const SOURCES=["Qayerdan kelgan","Ko'chadan","Instagram","Telegram","Do'stdan","Reklama","YouTube","Boshqa"];
const AV_CLS=['av-a','av-b','av-c','av-d','av-e'];
const SUBJECTS=['Frontend','Backend','UI/UX Design','Python/Django','Mobile Development','Data Science','DevOps','Grafik Dizayn','Digital Marketing','Ingliz tili','Boshqa'];
const COURSE_COLORS=['b-blue','b-teal','b-purple','b-orange','b-pink','b-amber','b-green'];
const COURSE_TOP=['card-course-0','card-course-1','card-course-2','card-course-3','card-course-4'];
const DAYS=['Du','Se','Ch','Pa','Ju','Sh'];
const PER_PAGE=20;
const LESSON_COUNT=12;
const MENTOR_SALARY_PCT=0.20;

// ===================== I18N (FIX #2) =====================
// Full translations for all languages

function t(key){ return (TRANSLATIONS[LANG]||TRANSLATIONS['uz'])[key]||key; }

// Get localized month names array
function getMonthNames(short=false){
  if(LANG==='ru') return short?MONTHS_RU:MONTHS_FULL_RU.map(m=>m.charAt(0).toUpperCase()+m.slice(1));
  if(LANG==='en') return short?MONTHS_EN:MONTHS_FULL_EN;
  return short?MONTHS_UZ:MONTHS_FULL_UZ.map(m=>m.charAt(0).toUpperCase()+m.slice(1));
}
function getMonthName(idx, short=false){ return getMonthNames(short)[idx]||''; }

// Format date with locale
function fmtDate(d){
  if(!d)return '—';
  const dt=new Date(d+'T00:00:00');
  if(isNaN(dt))return '—';
  const day=dt.getDate(), mon=dt.getMonth(), yr=dt.getFullYear();
  if(LANG==='ru') return day+' '+MONTHS_FULL_RU[mon]+' '+yr+' г.';
  if(LANG==='en') return MONTHS_FULL_EN[mon]+' '+day+', '+yr;
  return day+'-'+MONTHS_FULL_UZ[mon]+', '+yr+'-yil';
}

// FIX #3 - Attendance date formatting: "12 aprel", "12 April", "12 апреля"
function fmtAttDate(day, monthIdx, year){
  if(LANG==='ru') return day+' '+MONTHS_FULL_RU[monthIdx]+' '+year;
  if(LANG==='en') return MONTHS_FULL_EN[monthIdx]+' '+day+', '+year;
  return day+'-'+MONTHS_FULL_UZ[monthIdx]+', '+year+'-yil';
}

let LANG='uz',currentTab='dashboard';
// L is a live alias for LANG (used throughout for i18n shorthand)
Object.defineProperty(window,'L',{get:()=>LANG,configurable:true});
let groupPage=1,pendingDelCb=null,pendingDelName='',_uploadedFile=null,_uploadedPhoto=null,_expFilter='';
const TRANSLATIONS = {
  uz: {
    menu:'Menyu', dashboard:'Dashboard', courses:'Kurslar', groups:'Guruhlar',
    mentors:'Mentorlar', students:'Talabalar', finance:'Moliya', settings:'Sozlamalar',
    super_admin:'Super Admin', logout:'Chiqish',
    add_course:'+ Kurs qo\'shish', add_group:'+ Guruh qo\'shish',
    add_mentor:'+ Mentor qo\'shish', add_student:'+ Talaba qo\'shish',
    search_course:'Kurs qidirish...', search_group:'Guruh qidirish...',
    search_mentor:'Mentor qidirish...', search_student:'Talaba qidirish...',
    all_courses:'Barcha kurslar', all_mentors:'Barcha mentorlar',
    all_duration:'Barcha davomiylik', all_days:'Barcha kunlar',
    all_status:'Barcha holat', all_payment:'Barcha to\'lov',
    all_direction:'Barcha yo\'nalish', all_exp:'Barchasi',
    debtor:LANG==='ru'?'💸 Должник':LANG==='en'?'💸 Debtor':'💸 Qarzdor', paid:'✅ To\'lagan',
    exp_filter:'Tajriba:', exp_5plus:'5+ yil',
    cancel:'Bekor', save:'💾 Saqlash', close:'Yopish', edit_btn:'✏️ Tahrirlash',
    sett_name_title:'CRM Nomi', sett_name_sub:'Tizim nomini o\'zgartiring',
    sett_crm_name_label:'CRM Nomi', sett_preview:'Ko\'rinish:',
    sett_save:'💾 Saqlash', sett_logo_title:'CRM Logotipi',
    sett_logo_sub:'Sidebar va login ekranidagi rasm',
    sett_logo_current:'Joriy logotip',
    sett_logo_hint:'JPG, PNG, WEBP · Max 2MB · 64×64 tavsiya',
    sett_upload_click:'Bosib yuklang', sett_logo_remove:'🗑 Logotipni o\'chirish',
    sett_theme_title:'Fon va Rang Sxemasi', sett_theme_sub:'Yorug\' yoki qorong\'i rejim tanlang',
    theme_light:'☀️ Yorug\'', theme_dark:'🌙 Qorong\'i', theme_auto:'🔄 Avtomatik',
    sett_font_title:'Matn o\'lchami', sett_font_sub:'Interfeys yozuvlari katta-kichikligini sozlang',
    font_sm:'Kichik', font_md:'O\'rta', font_lg:'Katta', font_xl:'Juda katta',
    sett_accent_title:'Asosiy rang', sett_accent_sub:'Tugmalar va belgilar rangi',
    sett_data_title:'Ma\'lumotlar', sett_data_sub:'Export, import va tozalash',
    dashboard_title:'Dashboard', dashboard_sub:'Umumiy ko\'rinish',
    courses_title:'Kurslar', courses_sub:'Barcha kurslar',
    groups_title:'Guruhlar', groups_sub:LANG==='ru'?'Все группы':LANG==='en'?'All groups':'Barcha guruhlar',
    mentors_title:'Mentorlar', mentors_sub:'Barcha mentorlar',
    students_title:'Talabalar', students_sub:'Barcha talabalar',
    finance_title:'💰 Moliya', finance_sub:'Kirim · Chiqim · Mentor oylik',
    settings_title:'Sozlamalar', settings_sub:'Tizim sozlamalari',
    // Attendance days
    att_monday:'Du', att_tuesday:'Se', att_wednesday:'Ch',
    att_thursday:'Pa', att_friday:'Ju', att_saturday:'Sh',
    came:'Keldi', absent_word:'Yo\'q', excused:'Sababli',
    // Months
    jan:'Yanvar', feb:'Fevral', mar:'Mart', apr:'Aprel', may_:'May',
    jun:'Iyun', jul:'Iyul', aug:'Avgust', sep:'Sentabr',
    oct:'Oktabr', nov:'Noyabr', dec:'Dekabr',
    // Finance
    income:'Kirim', expense:'Chiqim', salary:'Mentor oylik',
    all_:'Barchasi',
    goals:'Maqsadlar', goals_title:'Maqsadlarim', goals_sub:'O\'quv maqsadlaringizni belgilang',
    theme_snow:'❄️ Qor',
    nav_mentor_dash:'Dashboard', nav_my_schedule:'Mening jadvalim', nav_chat:'Chat',
    nav_tests:'Testlar', nav_grades:'Baholash',
    nav_student_dash:'Dashboard', nav_schedule:'Dars jadvali', nav_rating:'Guruh reytingi',
  },
  ru: {
    menu:'Меню', dashboard:'Главная', courses:'Курсы', groups:'Группы',
    mentors:'Менторы', students:'Студенты', finance:'Финансы', settings:'Настройки',
    super_admin:'Супер Админ', logout:'Выйти',
    add_course:'+ Добавить курс', add_group:'+ Добавить группу',
    add_mentor:'+ Добавить ментора', add_student:'+ Добавить студента',
    search_course:'Поиск курса...', search_group:'Поиск группы...',
    search_mentor:'Поиск ментора...', search_student:'Поиск студента...',
    all_courses:'Все курсы', all_mentors:'Все менторы',
    all_duration:'Все длительности', all_days:'Все дни',
    all_status:'Все статусы', all_payment:'Все оплаты',
    all_direction:'Все направления', all_exp:'Все',
    debtor:'💸 Должник', paid:'✅ Оплатил',
    exp_filter:'Опыт:', exp_5plus:'5+ лет',
    cancel:'Отмена', save:'💾 Сохранить', close:'Закрыть', edit_btn:'✏️ Редактировать',
    sett_name_title:'Название CRM', sett_name_sub:'Изменить название системы',
    sett_crm_name_label:'Название CRM', sett_preview:'Вид:',
    sett_save:'💾 Сохранить', sett_logo_title:'Логотип CRM',
    sett_logo_sub:'Изображение в сайдбаре и на экране входа',
    sett_logo_current:'Текущий логотип',
    sett_logo_hint:'JPG, PNG, WEBP · Макс 2MB · 64×64 рекомендуется',
    sett_upload_click:'Нажмите для загрузки', sett_logo_remove:'🗑 Удалить логотип',
    sett_theme_title:'Фон и цветовая схема', sett_theme_sub:'Выберите светлый или тёмный режим',
    theme_light:'☀️ Светлый', theme_dark:'🌙 Тёмный', theme_auto:'🔄 Авто',
    sett_font_title:'Размер текста', sett_font_sub:'Настройте размер шрифта интерфейса',
    font_sm:'Мелкий', font_md:'Средний', font_lg:'Крупный', font_xl:'Очень крупный',
    sett_accent_title:'Основной цвет', sett_accent_sub:'Цвет кнопок и значков',
    sett_data_title:'Данные', sett_data_sub:'Экспорт, импорт и очистка',
    dashboard_title:'Главная', dashboard_sub:'Общий обзор',
    courses_title:'Курсы', courses_sub:'Все курсы',
    groups_title:'Группы', groups_sub:'Все группы',
    mentors_title:'Менторы', mentors_sub:'Все менторы',
    students_title:'Студенты', students_sub:'Все студенты',
    finance_title:'💰 Финансы', finance_sub:'Доход · Расход · Зарплаты',
    settings_title:'Настройки', settings_sub:'Системные настройки',
    att_monday:'Пн', att_tuesday:'Вт', att_wednesday:'Ср',
    att_thursday:'Чт', att_friday:'Пт', att_saturday:'Сб',
    came:'Пришёл', absent_word:'Отсутствует', excused:'Уважит.',
    jan:'Янв', feb:'Фев', mar:'Мар', apr:'Апр', may_:'Май',
    jun:'Июн', jul:'Июл', aug:'Авг', sep:'Сен',
    oct:'Окт', nov:'Ноя', dec:'Дек',
    income:'Доход', expense:'Расход', salary:'Зарплата',
    all_:'Все',
    goals:'Цели', goals_title:'Мои цели', goals_sub:'Установите свои учебные цели',
    theme_snow:'❄️ Снег',
    nav_mentor_dash:'Дашборд', nav_my_schedule:'Моё расписание', nav_chat:'Чат',
    nav_tests:'Тесты', nav_grades:'Оценки',
    nav_student_dash:'Дашборд', nav_schedule:'Расписание', nav_rating:'Рейтинг группы',
  },
  en: {
    menu:'Menu', dashboard:'Dashboard', courses:'Courses', groups:'Groups',
    mentors:'Mentors', students:'Students', finance:'Finance', settings:'Settings',
    super_admin:'Super Admin', logout:'Logout',
    add_course:'+ Add Course', add_group:'+ Add Group',
    add_mentor:'+ Add Mentor', add_student:'+ Add Student',
    search_course:'Search course...', search_group:'Search group...',
    search_mentor:'Search mentor...', search_student:'Search student...',
    all_courses:'All courses', all_mentors:'All mentors',
    all_duration:'All durations', all_days:'All days',
    all_status:'All statuses', all_payment:'All payments',
    all_direction:'All directions', all_exp:'All',
    debtor:'💸 Debtor', paid:'✅ Paid',
    exp_filter:'Experience:', exp_5plus:'5+ yrs',
    cancel:'Cancel', save:'💾 Save', close:'Close', edit_btn:'✏️ Edit',
    sett_name_title:'CRM Name', sett_name_sub:'Change system name',
    sett_crm_name_label:'CRM Name', sett_preview:'Preview:',
    sett_save:'💾 Save', sett_logo_title:'CRM Logo',
    sett_logo_sub:'Image in sidebar and login screen',
    sett_logo_current:'Current logo',
    sett_logo_hint:'JPG, PNG, WEBP · Max 2MB · 64×64 recommended',
    sett_upload_click:'Click to upload', sett_logo_remove:'🗑 Remove logo',
    sett_theme_title:'Background & Color Scheme', sett_theme_sub:'Choose light or dark mode',
    theme_light:'☀️ Light', theme_dark:'🌙 Dark', theme_auto:'🔄 Auto',
    sett_font_title:'Text Size', sett_font_sub:'Adjust interface font size',
    font_sm:'Small', font_md:'Medium', font_lg:'Large', font_xl:'Extra Large',
    sett_accent_title:'Accent Color', sett_accent_sub:'Color of buttons and icons',
    sett_data_title:'Data', sett_data_sub:'Export, import and reset',
    dashboard_title:'Dashboard', dashboard_sub:'General overview',
    courses_title:'Courses', courses_sub:'All courses',
    groups_title:'Groups', groups_sub:'All groups',
    mentors_title:'Mentors', mentors_sub:'All mentors',
    students_title:'Students', students_sub:'All students',
    finance_title:'💰 Finance', finance_sub:'Income · Expense · Mentor salary',
    settings_title:'Settings', settings_sub:'System settings',
    att_monday:'Mon', att_tuesday:'Tue', att_wednesday:'Wed',
    att_thursday:'Thu', att_friday:'Fri', att_saturday:'Sat',
    came:'Present', absent_word:'Absent', excused:'Excused',
    jan:'Jan', feb:'Feb', mar:'Mar', apr:'Apr', may_:'May',
    jun:'Jun', jul:'Jul', aug:'Aug', sep:'Sep',
    oct:'Oct', nov:'Nov', dec:'Dec',
    income:'Income', expense:'Expense', salary:'Mentor salary',
    all_:'All',
    goals:'Goals', goals_title:'My Goals', goals_sub:'Set your learning goals',
    theme_snow:'❄️ Snow',
    nav_mentor_dash:'Dashboard', nav_my_schedule:'My Schedule', nav_chat:'Chat',
    nav_tests:'Tests', nav_grades:'Grades',
    nav_student_dash:'Dashboard', nav_schedule:'Schedule', nav_rating:'Group Rating',
  }
};
let _finModal_type=null,_finModal_editId=null;
let _finMonth=new Date().getMonth(),_finYear=new Date().getFullYear();

const UI_KEY='edumanage_ui_v8';
let _uiSettings={lang:'uz',tab:'dashboard',theme:'auto',fontSize:'md',accent:'blue',crmName:'EduManage',crmLogo:null};

// Helper functions
function fmtMoney(n){return Math.round(n).toLocaleString('uz-UZ');}
function fmtDateTime(iso){
  if(!iso)return '—';
  const dt=new Date(iso);
  const d=dt.getDate(), m=dt.getMonth(), h=dt.getHours(), min=dt.getMinutes();
  const monthNames=getMonthNames(true);
  return d+' '+monthNames[m]+' '+dt.getHours().toString().padStart(2,'0')+':'+dt.getMinutes().toString().padStart(2,'0');
}
function todayStr(){return new Date().toISOString().slice(0,10);}
function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),2800);}
const ini=n=>n.trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();

// Apply i18n translations to DOM
function applyTranslations(){
  // Topbar lang tugmalarini yangilash
  ['uz','ru','en'].forEach(l=>{
    const btn=document.getElementById('lb-'+l);
    if(btn){btn.classList.toggle('active',LANG===l);}
  });
  // Nav labels
  document.querySelectorAll('[data-t]').forEach(el=>{
    const key=el.getAttribute('data-t');
    const val=t(key);
    if(val!==key) el.textContent=val;
  });
  // Placeholders
  document.querySelectorAll('[data-ph]').forEach(el=>{
    const key=el.getAttribute('data-ph');
    const val=t(key);
    if(val!==key) el.placeholder=val;
  });
  // Select options with data-t
  document.querySelectorAll('option[data-t]').forEach(el=>{
    const key=el.getAttribute('data-t');
    const val=t(key);
    if(val!==key) el.textContent=val;
  });
}

// ===================== UI SETTINGS =====================
function loadUI(){
  try{const u=JSON.parse(localStorage.getItem(UI_KEY)||'{}');_uiSettings=Object.assign({},_uiSettings,u);LANG=_uiSettings.lang||'uz';currentTab=_uiSettings.tab||'dashboard';}catch(e){}
}
function saveUI(){
  _uiSettings.lang=LANG;_uiSettings.tab=currentTab;
  try{localStorage.setItem(UI_KEY,JSON.stringify(_uiSettings));}catch(e){}
}

// FIX #6 - Font size must affect ALL elements via CSS variable
function applyUISettings(){
  const body=document.body;
  body.classList.remove('theme-light','theme-dark','theme-snow');
  if(_uiSettings.theme==='light')body.classList.add('theme-light');
  else if(_uiSettings.theme==='dark')body.classList.add('theme-dark');
  else if(_uiSettings.theme==='snow')body.classList.add('theme-snow');

  // FIX #6: Remove all font size classes and re-apply properly
  body.classList.remove('fs-sm','fs-md','fs-lg','fs-xl');
  const fs=_uiSettings.fontSize||'md';
  body.classList.add('fs-'+fs);
  // Also set --ui-font-size CSS variable explicitly on :root
  const fsMap={sm:'12px',md:'14px',lg:'16px',xl:'19px'};
  document.documentElement.style.setProperty('--ui-font-size', fsMap[fs]||'14px');
  document.documentElement.style.fontSize = fsMap[fs]||'14px';

  body.classList.remove('accent-teal','accent-purple','accent-orange','accent-rose','accent-green');
  if(_uiSettings.accent&&_uiSettings.accent!=='blue')body.classList.add('accent-'+_uiSettings.accent);

  const name=_uiSettings.crmName||'EduManage';
  document.getElementById('sidebar-crm-name').textContent=name;

  // FIX #1: Login screen title must use saved CRM name
  const loginCrmName=document.getElementById('login-crm-name');
  if(loginCrmName) loginCrmName.textContent=name;

  document.title=name+' CRM';
  applyLogo();
  applyTranslations();
}

// FIX #1: Apply logo to login screen too
function applyLogo(){
  const logo=_uiSettings.crmLogo;
  const name=_uiSettings.crmName||'EduManage';
  const fl=name[0]||'E';

  // Sidebar logo
  const slm=document.getElementById('sidebar-logo-mark');
  if(slm){
    if(logo) slm.innerHTML=`<img src="${logo}" style="width:38px;height:38px;object-fit:cover;border-radius:var(--r-lg)">`;
    else slm.innerHTML=`<span style="color:#fff;font-weight:700;font-size:18px">${fl}</span>`;
  }

  // FIX #1: Login logo - use saved logo and name
  const llm=document.getElementById('login-logo-img-wrap');
  if(llm){
    if(logo) llm.innerHTML=`<img src="${logo}" style="width:52px;height:52px;object-fit:cover;border-radius:var(--r-lg)">`;
    else llm.innerHTML=`<span style="color:#fff;font-weight:800;font-size:22px">${fl}</span>`;
  }

  // FIX #1: Login CRM name
  const loginName=document.getElementById('login-crm-name');
  if(loginName) loginName.textContent=name;

  // Settings logo preview
  const sp=document.getElementById('sett-logo-preview');
  if(sp){
    if(logo) sp.innerHTML=`<img src="${logo}" style="width:64px;height:64px;object-fit:cover;border-radius:16px">`;
    else{sp.innerHTML=`<span style="color:#fff;font-weight:800;font-size:26px">${fl}</span>`;sp.style.background='linear-gradient(135deg,var(--accent),var(--teal))';}
  }
}

// Settings panel
// Settings panel
function renderSettingsPanel(){
  const inp=document.getElementById('sett-crm-name');if(inp)inp.value=_uiSettings.crmName||'EduManage';
  const prev=document.getElementById('sett-name-preview');if(prev)prev.textContent=_uiSettings.crmName||'EduManage';
  applyLogo();
  ['light','auto','snow'].forEach(th=>{const el=document.getElementById('theme-'+th);if(el)el.classList.toggle('selected',_uiSettings.theme===th);});
  ['sm','md','lg','xl'].forEach(s=>{const el=document.getElementById('fs-'+s);if(el)el.classList.toggle('selected',(_uiSettings.fontSize||'md')===s);});
  document.querySelectorAll('.accent-swatch').forEach(sw=>sw.classList.toggle('selected',sw.dataset.color===(_uiSettings.accent||'blue')));
  // Mentor/Student creds kartochkasi faqat adminga ko'rsatiladi
  const credsCard=document.getElementById('mentor-creds-card');
  if(credsCard)credsCard.style.display=(isMentorRole()||isStudentRole())?'none':'';
  const stuCredsCard=document.getElementById('student-creds-card');
  if(stuCredsCard)stuCredsCard.style.display=(isMentorRole()||isStudentRole())?'none':'';
  // Admin o'z login/parolini o'zgartirish kartochkasi — faqat admin
  const adminCredsCard=document.getElementById('admin-creds-card');
  if(adminCredsCard){
    adminCredsCard.style.display=(isMentorRole()||isStudentRole())?'none':'';
    if(!isMentorRole()&&!isStudentRole()){
      const ac=getAdminCred();
      const li=document.getElementById('sett-admin-login');if(li)li.value=ac.login;
      const pi=document.getElementById('sett-admin-pass');if(pi)pi.value='';
      const pi2=document.getElementById('sett-admin-pass2');if(pi2)pi2.value='';
      const cur=document.getElementById('sett-admin-current');if(cur)cur.textContent=ac.login;
    }
  }
  // CRM nom va logotip kartochkalari faqat adminga ko'rsatiladi
  const nameCard=document.getElementById('sett-name-card');
  if(nameCard)nameCard.style.display=(isMentorRole()||isStudentRole())?'none':'';
  const logoCard=document.getElementById('sett-logo-card');
  if(logoCard)logoCard.style.display=(isMentorRole()||isStudentRole())?'none':'';
  // Student profile & motivation cards
  const profileCard=document.getElementById('student-profile-card');
  const motivCard=document.getElementById('student-motivation-card');
  if(profileCard) profileCard.style.display=isStudentRole()?'flex':'none';
  // Motivation card sozlamalardan olib tashlandi — alohida "Maqsadlar" menusida
  if(motivCard) motivCard.style.display='none';
  if(isStudentRole()){
    renderStudentProfileCard();
  }
  // Also hide admin-only cards from students/mentors
  ['sett-name-title','sett-logo-title','mentor-creds-card','student-creds-card'].forEach(id=>{
    const el=document.getElementById(id);
  });
  applyTranslations();
  // Render mentor credentials section if in settings
  setTimeout(()=>{renderMentorCredsList();renderStudentCredsList();},10);
}

function renderStudentProfileCard(){
  const cu=getCurrentUser();
  const studentId=cu.studentId?parseInt(cu.studentId):null;
  const s=studentId?D.students.find(x=>x.id===studentId):null;
  const body=document.getElementById('student-profile-card-body');
  if(!body)return;
  // Update header
  const title=document.getElementById('spc-title');
  const sub=document.getElementById('spc-sub');
  const L=LANG;
  if(title)title.textContent=L==='ru'?'Mening profilim':L==='en'?'My Profile':'Mening profilim';
  if(sub)sub.textContent=L==='ru'?'Sozlamalar':L==='en'?'Settings':'Sozlamalar';

  const savedDisplay=_uiSettings['studentDisplayName_'+(studentId||'')];
  const currentDisplay=savedDisplay||(s?s.name:'');
  const nameLbl=L==='ru'?'Ko\'rsatma ism':L==='en'?'Display name':'Ko\'rsatma ism';
  const saveLbl=L==='ru'?'Saqlash':L==='en'?'Save':'Saqlash';
  const hintLbl=L==='ru'?'Faqat sizga ko\'rinadi':L==='en'?'Only visible to you':'Faqat sizga ko\'rinadi';

  // Theme / lang / accent / font — same as mentor dash but student style
  const isDark=_uiSettings&&_uiSettings.theme==='dark';
  const curLang=LANG||'uz';
  const curAccent=_uiSettings.accent||'blue';
  const curFs=_uiSettings.fontSize||'md';
  const accentColors=[{k:'blue',c:'#3b82f6'},{k:'teal',c:'#0d9488'},{k:'purple',c:'#7c3aed'},{k:'orange',c:'#ea580c'},{k:'rose',c:'#e11d48'},{k:'green',c:'#059669'}];

  body.innerHTML=`
    <!-- Avatar + name block -->
    <div style="display:flex;align-items:center;gap:16px;padding:18px;background:linear-gradient(135deg,var(--accent-light),var(--bg2));border-radius:14px;margin-bottom:20px;border:1.5px solid var(--accent)">
      <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--teal));display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#fff;flex-shrink:0;border:3px solid rgba(255,255,255,.3)">${ini(currentDisplay||'?')}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:17px;font-weight:900;color:var(--text);letter-spacing:-.3px">${currentDisplay||'—'}</div>
        <div style="font-size:11px;color:var(--accent-text);font-weight:700;margin-top:2px">🎓 ${s?(D.groups.find(g=>g.id===s.groupId)||{name:'—'}).name:'—'}</div>
      </div>
    </div>

    <!-- Name edit -->
    <div style="margin-bottom:20px">
      <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">${nameLbl}</div>
      <div style="display:flex;gap:8px">
        <input type="text" id="student-display-name-inp" value="${currentDisplay.replace(/"/g,'&quot;')}" placeholder="${nameLbl}" style="flex:1;border-radius:10px;border:1.5px solid var(--border2);padding:9px 13px;font-size:14px;font-weight:600;background:var(--bg);color:var(--text)">
        <button onclick="saveStudentDisplayName()" style="background:var(--accent);color:#fff;border:none;border-radius:10px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer">${saveLbl}</button>
      </div>
      <div style="font-size:11px;color:var(--text3);margin-top:5px">ℹ️ ${hintLbl}</div>
    </div>

    <div style="height:1px;background:var(--border);margin-bottom:20px"></div>

    <!-- Theme -->
    <div style="margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">${L==='ru'?'Mavzu':L==='en'?'Theme':'Mavzu'}</div>
      <div style="display:flex;gap:8px">
        <button onclick="setTheme('light');renderStudentProfileCard()" style="flex:1;padding:8px;border-radius:10px;border:2px solid ${!isDark?'var(--accent)':'var(--border2)'};background:${!isDark?'var(--accent-light)':'var(--bg3)'};color:${!isDark?'var(--accent-text)':'var(--text2)'};font-size:13px;font-weight:700;cursor:pointer">☀️ Yorug'</button>
        <button onclick="setTheme('dark');renderStudentProfileCard()" style="flex:1;padding:8px;border-radius:10px;border:2px solid ${isDark?'var(--accent)':'var(--border2)'};background:${isDark?'var(--accent-light)':'var(--bg3)'};color:${isDark?'var(--accent-text)':'var(--text2)'};font-size:13px;font-weight:700;cursor:pointer">🌙 Qorong'i</button>
      </div>
    </div>

    <!-- Language -->
    <div style="margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">${L==='ru'?'Til':L==='en'?'Language':'Til'}</div>
      <div style="display:flex;gap:8px">
        ${['uz','ru','en'].map(l=>`<button onclick="setLang('${l}',this);renderStudentProfileCard()" class="lang-btn${curLang===l?' active':''}" style="flex:1;padding:8px;border-radius:10px;border:2px solid ${curLang===l?'var(--accent)':'var(--border2)'};background:${curLang===l?'var(--accent-light)':'var(--bg3)'};color:${curLang===l?'var(--accent-text)':'var(--text2)'};font-size:13px;font-weight:700;cursor:pointer">${l==='uz'?'🇺🇿 UZ':l==='ru'?'🇷🇺 РУ':'🇬🇧 EN'}</button>`).join('')}
      </div>
    </div>

    <!-- Accent color -->
    <div style="margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">${L==='ru'?'Rang':L==='en'?'Color':'Rang'}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${accentColors.map(a=>`<button onclick="setAccent('${a.k}',this);renderStudentProfileCard()" title="${a.k}" style="width:36px;height:36px;border-radius:50%;background:${a.c};border:3px solid ${curAccent===a.k?'#fff':'transparent'};outline:3px solid ${curAccent===a.k?a.c:'transparent'};cursor:pointer;transition:.15s"></button>`).join('')}
      </div>
    </div>

    <!-- Font size -->
    <div>
      <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">${L==='ru'?'Shrift':L==='en'?'Font size':'Shrift'}</div>
      <div style="display:flex;gap:8px">
        ${[['sm','S — Kichik'],['md','M — O\'rta'],['lg','L — Katta'],['xl','XL — Juda katta']].map(([k,lbl])=>`<button onclick="setFontSize('${k}');renderStudentProfileCard()" style="flex:1;padding:7px 4px;border-radius:10px;border:2px solid ${curFs===k?'var(--accent)':'var(--border2)'};background:${curFs===k?'var(--accent-light)':'var(--bg3)'};color:${curFs===k?'var(--accent-text)':'var(--text2)'};font-size:11px;font-weight:700;cursor:pointer">${lbl}</button>`).join('')}
      </div>
    </div>
  `;
}

function saveStudentDisplayName(){
  const inp=document.getElementById('student-display-name-inp');
  if(!inp)return;
  const val=inp.value.trim();
  if(!val){toast('⚠️ Ism bo\'sh bo\'lmasin!');return;}
  const cu=getCurrentUser();
  const studentId=cu.studentId?parseInt(cu.studentId):null;
  _uiSettings['studentDisplayName_'+(studentId||'')]=val;
  saveUI();
  // Update sidebar username display
  const uname=document.querySelector('.u-name');
  if(uname) uname.textContent=val;
  toast('✅ Ism saqlandi: '+val);
  renderStudentProfileCard();
}

function renderStudentMotivationCard(){
  const body=document.getElementById('student-motivation-card-body');
  if(!body)return;
  const title=document.getElementById('smc-title');
  const sub=document.getElementById('smc-sub');
  const goalTitle=LANG==='ru'?'Моя цель':LANG==='en'?'My Goal':'Maqsadim';
  const goalSub=LANG==='ru'?'Установите учебную цель':LANG==='en'?'Set your study goal':'O\'quv maqsadingizni belgilang';
  if(title) title.textContent=goalTitle;
  if(sub) sub.textContent=goalSub;
  const saved=_uiSettings.studentGoal||'';
  const goalLbl=LANG==='ru'?'Моя цель на этот курс':LANG==='en'?'My goal for this course':'Bu kurs uchun maqsadim';
  const phLbl=LANG==='ru'?'Например: освоить React, найти работу...':LANG==='en'?'E.g.: Learn React, get a job...':'Masalan: React o\'rganish, ish topish...';
  const saveLbl=LANG==='ru'?'💾 Сохранить':LANG==='en'?'💾 Save':'💾 Saqlash';
  body.innerHTML=`
    <div class="fg">
      <label style="font-size:12px;font-weight:600;color:var(--text3)">${goalLbl}</label>
      <input type="text" id="student-goal-inp" value="${saved.replace(/"/g,'&quot;')}" placeholder="${phLbl}" style="margin-top:4px">
    </div>
    <button class="btn btn-primary sett-save-btn" onclick="saveStudentGoal()" style="margin-top:12px">${saveLbl}</button>`;
}

function getStudentGoals(){
  const list=_uiSettings.studentGoals;
  if(Array.isArray(list))return list;
  // migrate old single goal
  const old=_uiSettings.studentGoal||'';
  return old?[{id:Date.now(),text:old,done:false}]:[];
}
function saveStudentGoals(goals){
  _uiSettings.studentGoals=goals;
  _uiSettings.studentGoal=(goals.find(g=>!g.done)||goals[0]||{text:''}).text;
  saveUI();
}
function addStudentGoal(){
  const inp=document.getElementById('new-goal-inp');
  if(!inp)return;
  const text=inp.value.trim();
  if(!text){toast('⚠️ Maqsad matni bo\'sh bo\'lmasin!');return;}
  const goals=getStudentGoals();
  goals.push({id:Date.now(),text,done:false});
  saveStudentGoals(goals);
  inp.value='';
  renderStudentGoalsPage();
  toast('🎯 Maqsad qo\'shildi!');
}
function toggleStudentGoal(id){
  const goals=getStudentGoals();
  const g=goals.find(x=>x.id===id);
  if(g){g.done=!g.done;if(g.done)g.doneAt=new Date().toISOString();}
  saveStudentGoals(goals);
  renderStudentGoalsPage();
  if(g&&g.done)toast('🏆 Maqsadga yetdingiz!');
}
function deleteStudentGoal(id){
  let goals=getStudentGoals();
  goals=goals.filter(x=>x.id!==id);
  saveStudentGoals(goals);
  renderStudentGoalsPage();
  toast('🗑 Maqsad o\'chirildi');
}
// keep old saveStudentGoal for settings card compat
function saveStudentGoal(){
  const inp=document.getElementById('student-goal-inp');
  if(!inp)return;
  const text=inp.value.trim();
  if(!text)return;
  const goals=getStudentGoals();
  goals.push({id:Date.now(),text,done:false});
  saveStudentGoals(goals);
  toast('🎯 Maqsad saqlandi!');
}

function renderStudentGoalsPage(){
  const body=document.getElementById('student-goals-panel-body');
  if(!body)return;
  const goals=getStudentGoals();
  const doneGoals=goals.filter(g=>g.done).length;
  const progPct=goals.length?Math.round(doneGoals/goals.length*100):0;

  // Labels
  const L=LANG;
  const lbl={
    title:     L==='ru'?'Мои цели':L==='en'?'My Goals':'Mening maqsadlarim',
    addPh:     L==='ru'?'Yangi maqsad yozing...':L==='en'?'Write a new goal...':'Yangi maqsad yozing...',
    addBtn:    L==='ru'?'Qo\'shish':L==='en'?'Add':'Qo\'shish',
    emptyT:    L==='ru'?'Hali maqsad yo\'q':L==='en'?'No goals yet':'Hali maqsad yo\'q',
    emptySub:  L==='ru'?'Birinchi maqsadingizni qo\'shing':L==='en'?'Add your first goal':'Birinchi maqsadingizni qo\'shing',
    done:      L==='ru'?'Bajarildi':L==='en'?'Done':'Bajarildi',
    active:    L==='ru'?'Jarayonda':L==='en'?'In progress':'Jarayonda',
    del:       L==='ru'?'O\'chirish':L==='en'?'Delete':'O\'chirish',
    achTitle:  L==='ru'?'Yutuqlar':L==='en'?'Achievements':'Yutuqlar',
    achSub:    L==='ru'?'earned':L==='en'?'earned':'qo\'lga kiritildi',
    quote:     (()=>{const q={uz:['Har bir dars seni maqsadingga yaqinlashtiradi.','Bugungi mehnat, ertangi muvaffaqiyat.','Bilim — eng qimmatli boylik.'],ru:['Каждый урок — шаг к цели.','Сегодняшний труд — завтрашний успех.','Знание — самое ценное.'],en:['Every lesson is a step forward.','Today\'s effort is tomorrow\'s success.','Knowledge is priceless.']};const a=q[L]||q.uz;return a[Math.floor(Date.now()/86400000)%a.length];})(),
  };

  // Achievements data
  const cu=getCurrentUser();
  const studentId=cu.studentId?parseInt(cu.studentId):null;
  const s=studentId?D.students.find(x=>x.id===studentId):null;
  const grp=s?D.groups.find(g=>g.id===s.groupId):null;
  const allInGrp=grp?D.students.filter(st=>st.groupId===grp.id):[];
  const attData=D.attendance||{};
  function getAtt(sid){const sk='s'+sid;let pr=0,tot=0;Object.keys(attData).forEach(k=>{const d=attData[k];if(d&&d[sk])Object.values(d[sk]).forEach(v=>{if(v==='K'||v==='Y'||v==='S'){tot++;if(v==='K')pr++;}});});return tot?Math.round(pr/tot*100):0;}
  const attPct=s?getAtt(s.id):0;
  const ratings=allInGrp.map(st=>({id:st.id,p:getAtt(st.id)})).sort((a,b)=>b.p-a.p);
  const rank=ratings.findIndex(r=>r.id===(s?s.id:0))+1;
  const saved=goals.length>0;
  const howUz=['Darslarga muntazam keling, davomat 80%+ bo\'lsin.','Oyda 90%+ darslarga keling, sababsiz o\'tkazmang.','Guruhda davomat bo\'yicha 1-o\'ringa chiqing.','100% davomat — birorta ham o\'tkazmaslik!','Maqsadlar bo\'limiga birinchi maqsad qo\'shing.','Kamida 1 maqsadni bajarildi deb belgilang.'];
  const howRu=['Ходи регулярно, рейтинг 80%+.','Посещай 90%+ уроков в месяц.','Стань 1-м в группе по посещаемости.','100% посещаемость — ни одного пропуска!','Добавь первую цель в разделе Цели.','Отметь хотя бы 1 цель выполненной.'];
  const howEn=['Come regularly, rating 80%+.','Attend 90%+ lessons per month.','Be #1 in group by attendance.','100% attendance — zero skips!','Add your first goal here.','Mark at least 1 goal as done.'];
  const howArr=L==='ru'?howRu:L==='en'?howEn:howUz;
  const achList=[
    {icon:'🎓',name:L==='ru'?'A\'lochi':L==='en'?'Top Student':'A\'lochi',earned:attPct>=80},
    {icon:'⚡',name:L==='ru'?'Faol':L==='en'?'Active':'Faol o\'quvchi',earned:attPct>=90},
    {icon:'👑',name:L==='ru'?'Lider':L==='en'?'Leader':'Guruh lideri',earned:rank===1&&allInGrp.length>1},
    {icon:'💎',name:L==='ru'?'Ideal':L==='en'?'Perfect':'Mukammal',earned:attPct===100},
    {icon:'🎯',name:L==='ru'?'Maqsadli':L==='en'?'Goal Setter':'Maqsadli',earned:saved},
    {icon:'🏅',name:L==='ru'?'Yetuvchi':L==='en'?'Achiever':'Yetuvchi',earned:doneGoals>=1},
  ];
  const earnedCount=achList.filter(a=>a.earned).length;

  // Goals HTML
  const goalsHtml=goals.length?goals.map((g,gi)=>`
    <div style="position:relative;display:flex;align-items:center;gap:0;margin-bottom:10px">
      <div style="position:absolute;left:22px;top:0;bottom:0;width:2px;background:${g.done?'var(--teal)':'var(--accent)'};opacity:.25;z-index:0"></div>
      <div style="position:relative;z-index:1;width:46px;flex-shrink:0;display:flex;justify-content:center">
        <button onclick="toggleStudentGoal(${g.id})" style="width:36px;height:36px;border-radius:50%;border:3px solid ${g.done?'var(--teal)':'var(--accent)'};background:${g.done?'var(--teal)':'transparent'};cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;color:${g.done?'#fff':'var(--accent)'};transition:.2s;flex-shrink:0">${g.done?'✓':'○'}</button>
      </div>
      <div style="flex:1;background:${g.done?'var(--bg3)':'var(--bg)'};border:1.5px solid ${g.done?'var(--border)':'var(--accent)'};border-radius:12px;padding:11px 14px;margin-left:6px;box-shadow:${g.done?'none':'0 2px 8px rgba(59,130,246,.1)'}">
        <div style="font-size:13px;font-weight:${g.done?500:700};color:${g.done?'var(--text3)':'var(--text)'};text-decoration:${g.done?'line-through':'none'}">${g.text}</div>
        <div style="font-size:11px;margin-top:3px;color:${g.done?'var(--teal-text)':'var(--accent-text)'};">${g.done?'🏆 '+lbl.done:'🔥 '+lbl.active}</div>
      </div>
      <button onclick="deleteStudentGoal(${g.id})" style="margin-left:8px;background:none;border:none;cursor:pointer;color:var(--text3);font-size:16px;padding:6px;border-radius:8px;flex-shrink:0" onmouseover="this.style.color='var(--orange-text)'" onmouseout="this.style.color='var(--text3)'" title="${lbl.del}">🗑</button>
    </div>`).join(''):`
    <div style="text-align:center;padding:48px 20px;display:flex;flex-direction:column;align-items:center;gap:10px">
      <div style="font-size:48px;opacity:.3">🎯</div>
      <div style="font-size:14px;font-weight:800;color:var(--text)">${lbl.emptyT}</div>
      <div style="font-size:12px;color:var(--text3)">${lbl.emptySub}</div>
    </div>`;

  // Achievements HTML — hexagonal badge grid
  const achHtml=achList.map((a,ai)=>`
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;min-width:80px" title="${howArr[ai]}">
      <div style="position:relative;width:60px;height:60px">
        <svg width="60" height="60" viewBox="0 0 60 60" style="position:absolute;top:0;left:0">
          <polygon points="30,3 55,16 55,44 30,57 5,44 5,16" fill="${a.earned?'var(--teal)':'var(--bg4)'}" stroke="${a.earned?'var(--teal-text)':'var(--border2)'}" stroke-width="2" opacity="${a.earned?1:.6}"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px;opacity:${a.earned?1:.35}">${a.icon}</div>
        ${a.earned?'<div style="position:absolute;top:-4px;right:-4px;width:18px;height:18px;background:#22c55e;border-radius:50%;border:2px solid var(--bg);display:flex;align-items:center;justify-content:center;font-size:9px">✓</div>':''}
      </div>
      <div style="font-size:10px;font-weight:700;color:${a.earned?'var(--teal-text)':'var(--text3)'};text-align:center;line-height:1.2">${a.name}</div>
    </div>`).join('');

  body.innerHTML=`
  <div style="max-width:720px;margin:0 auto;padding:4px 0 32px">

    <!-- TOP HERO BANNER -->
    <div style="background:linear-gradient(135deg,var(--accent) 0%,var(--teal) 100%);border-radius:20px;padding:24px 28px;margin-bottom:20px;position:relative;overflow:hidden;color:#fff">
      <div style="position:absolute;right:-20px;top:-20px;font-size:130px;opacity:.06;pointer-events:none">🎯</div>
      <div style="position:absolute;left:-10px;bottom:-20px;font-size:100px;opacity:.05;pointer-events:none">⭐</div>
      <div style="font-size:11px;font-weight:700;opacity:.75;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">${lbl.title}</div>
      <div style="font-size:28px;font-weight:900;letter-spacing:-.5px;margin-bottom:12px">${goals.length?progPct+'% bajarildi':'Hali maqsad yo\'q'}</div>
      ${goals.length?`
      <div style="background:rgba(255,255,255,.2);border-radius:99px;height:8px;overflow:hidden;margin-bottom:8px">
        <div style="background:#fff;height:100%;border-radius:99px;width:${progPct}%;transition:width .6s ease"></div>
      </div>
      <div style="font-size:12px;opacity:.85">${doneGoals} / ${goals.length} ta maqsad · ${earnedCount}/6 yutuq</div>
      `:`<div style="font-size:13px;opacity:.75">Pastdagi maydonga birinchi maqsadingizni yozing</div>`}
    </div>

    <!-- ADD GOAL -->
    <div style="background:var(--bg);border:2px dashed var(--accent);border-radius:16px;padding:16px 18px;margin-bottom:20px;display:flex;gap:10px;align-items:center">
      <span style="font-size:22px">✏️</span>
      <input type="text" id="new-goal-inp" placeholder="${lbl.addPh}" onkeydown="if(event.key==='Enter')addStudentGoal()" style="flex:1;background:transparent;border:none;outline:none;font-size:14px;font-weight:600;color:var(--text)">
      <button onclick="addStudentGoal()" style="background:var(--accent);color:#fff;border:none;border-radius:10px;padding:8px 18px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap">+ ${lbl.addBtn}</button>
    </div>

    <!-- GOALS LIST -->
    <div style="margin-bottom:24px">
      ${goalsHtml}
    </div>

    <!-- QUOTE STRIPE -->
    <div style="background:var(--bg2);border-left:4px solid var(--accent);border-radius:0 12px 12px 0;padding:14px 18px;margin-bottom:24px;font-size:13px;font-style:italic;color:var(--text2);line-height:1.7">
      ✨ "${lbl.quote}"
    </div>

    <!-- ACHIEVEMENTS -->
    <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:18px;padding:20px 22px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
        <div>
          <div style="font-size:14px;font-weight:800;color:var(--text)">🏆 ${lbl.achTitle}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px">${earnedCount}/6 ${lbl.achSub}</div>
        </div>
        <div style="background:var(--accent-light);color:var(--accent-text);border:1.5px solid var(--accent);border-radius:99px;padding:4px 14px;font-size:13px;font-weight:800">${earnedCount}/6</div>
      </div>
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px">
        ${achHtml}
      </div>
    </div>

  </div>`;
}

function previewCrmName(){const val=document.getElementById('sett-crm-name').value||'EduManage';const prev=document.getElementById('sett-name-preview');if(prev)prev.textContent=val;}
function saveCrmName(){
  const val=(document.getElementById('sett-crm-name').value||'').trim()||'EduManage';
  _uiSettings.crmName=val;saveUI();applyUISettings();
  toast('✅ CRM nomi saqlandi: '+val);
}
function handleLogoUpload(input){
  const file=input.files[0];if(!file)return;
  if(!file.type.startsWith('image/')){toast('⚠️ Faqat rasm fayli!');return;}
  if(file.size>2*1024*1024){toast('⚠️ Rasm 2MB dan kichik bo\'lsin!');return;}
  const reader=new FileReader();
  reader.onload=e=>{_uiSettings.crmLogo=e.target.result;saveUI();applyLogo();renderSettingsPanel();toast('✅ Logotip saqlandi!');};
  reader.readAsDataURL(file);
}
function removeLogo(){_uiSettings.crmLogo=null;saveUI();applyLogo();renderSettingsPanel();toast('🗑 Logotip o\'chirildi');}
function setTheme(th){_uiSettings.theme=th;saveUI();applyUISettings();renderSettingsPanel();}

// FIX #6: Font size change must instantly affect everything
function setFontSize(s){
  _uiSettings.fontSize=s;
  saveUI();
  applyUISettings();
  renderSettingsPanel();
  // Re-render current panel so font size is applied to dynamic content too
  if(currentTab) updateTopbar(currentTab);
  toast('🔤 Shrift o\'zgartirildi');
}
function setAccent(color,el){_uiSettings.accent=color;saveUI();applyUISettings();renderSettingsPanel();toast('🌈 Rang o\'zgartirildi!');}

// ===================== DATA =====================
const STORAGE_KEY='edumanage_crm_v8';

const DEFAULT_DATA={
  nextId:100,attendance:{},finance:[],
  courses:[
    {id:1,name:'Frontend Development',duration:'11 oy',price:'1 200 000',status:'Faol'},
    {id:2,name:'Backend Development',duration:'11 oy',price:'1 200 000',status:'Faol'},
    {id:3,name:'UI/UX Design',duration:'8 oy',price:'900 000',status:'Faol'},
    {id:4,name:'Python & Django',duration:'10 oy',price:'1 100 000',status:'Faol'},
  ],
  groups:[
    {id:1,name:'BE-1',course:'Backend Development',mentor:'Bobur Toshmatov',status:'Faol',startDate:'2026-01-10',days:['Du','Ch','Ju'],room:'8',timeStart:'10:00',timeEnd:'12:00'},
    {id:2,name:'FE-1',course:'Frontend Development',mentor:'Alisher Karimov',status:'Faol',startDate:'2026-01-05',days:['Du','Ch','Ju'],room:'12',timeStart:'09:00',timeEnd:'11:00'},
    {id:3,name:'FE-2',course:'Frontend Development',mentor:'Malika Yusupova',status:'Faol',startDate:'2026-02-15',days:['Se','Pa','Sh'],room:'5',timeStart:'14:00',timeEnd:'16:00'},
    {id:4,name:'PY-1',course:'Python & Django',mentor:'Alisher Karimov',status:'Faol',startDate:'2026-02-01',days:['Du','Ch','Ju'],room:'7',timeStart:'16:00',timeEnd:'18:00'},
    {id:5,name:'UX-1',course:'UI/UX Design',mentor:'Gulnora Rahimova',status:'Faol',startDate:'2026-03-01',days:['Se','Pa'],room:'3',timeStart:'13:00',timeEnd:'15:00'},
  ],
  mentors:[
    {id:1,name:'Alisher Karimov',phone:'+998901112233',subject:'Frontend',joinDate:'2025-09-01',experience:'3 yil',email:'alisher@edu.uz',telegram:'@alisher_k',address:'Toshkent, Yunusobod',age:'27',resume:'',resumeFile:null,photo:null},
    {id:2,name:'Bobur Toshmatov',phone:'+998933334455',subject:'Backend',joinDate:'2025-10-01',experience:'4 yil',email:'bobur@edu.uz',telegram:'@bobur_t',address:'Toshkent, Mirzo Ulugbek',age:'29',resume:'',resumeFile:null,photo:null},
    {id:3,name:'Gulnora Rahimova',phone:'+998944445566',subject:'UI/UX Design',joinDate:'2026-01-10',experience:'3 yil',email:'gulnora@edu.uz',telegram:'@gulnora_r',address:'Toshkent, Shayxontohur',age:'26',resume:'',resumeFile:null,photo:null},
    {id:4,name:'Malika Yusupova',phone:'+998912223344',subject:'Frontend',joinDate:'2025-11-15',experience:'2 yil',email:'malika@edu.uz',telegram:'@malika_y',address:'Toshkent, Chilonzor',age:'25',resume:'',resumeFile:null,photo:null},
  ],
  students:[
    {id:1,name:'Doniyor Ergashev',phone:'+998933456789',groupId:1,status:'Aktiv',joinDate:'2026-01-10',isDebtor:false,source:'Telegram',birthDate:'2001-12-03',parentName:'Mansur Ergashev',parentPhone:'+998933330033',notes:''},
    {id:2,name:'Jasur Mirzayev',phone:'+998901234567',groupId:2,status:'Aktiv',joinDate:'2026-01-05',isDebtor:false,source:"Ko'chadan",birthDate:'2002-05-12',parentName:'Kamoliddin Mirzayev',parentPhone:'+998901110011',notes:''},
    {id:3,name:'Maftuna Xoliqova',phone:'+998944567890',groupId:5,status:'Aktiv',joinDate:'2026-03-01',isDebtor:false,source:"Do'stdan",birthDate:'2003-03-17',parentName:'Hamida Xoliqova',parentPhone:'+998944440044',notes:''},
    {id:4,name:'Nargiza Qodirova',phone:'+998912345678',groupId:3,status:'Aktiv',joinDate:'2026-02-15',isDebtor:true,source:'Instagram',birthDate:'2003-08-22',parentName:'Zulfiya Qodirova',parentPhone:'+998912220022',notes:''},
    {id:5,name:'Sardor Nazarov',phone:'+998955678901',groupId:2,status:'Probatsiya',joinDate:'2026-01-07',isDebtor:true,source:'Instagram',birthDate:'2002-07-29',parentName:'Firdavs Nazarov',parentPhone:'+998955550055',notes:''},
    {id:6,name:'Zulfiya Tursunova',phone:'+998976789012',groupId:1,status:'Muzlatilgan',joinDate:'2026-01-10',isDebtor:true,source:'Telegram',birthDate:'2004-01-08',parentName:'Olim Tursunov',parentPhone:'+998976660066',notes:''},
  ]
};

function loadData(){
  try{
    const r=localStorage.getItem(STORAGE_KEY);
    if(r){const p=JSON.parse(r);const d=Object.assign({},DEFAULT_DATA,p);if(!d.attendance)d.attendance={};if(!d.finance)d.finance=[];if(!d.gradingCriteria)d.gradingCriteria={};if(!d.grades)d.grades={};if(!d.tests)d.tests=[];if(!d.testResults)d.testResults={};return d;}
  }catch(e){}
  const d=JSON.parse(JSON.stringify(DEFAULT_DATA));d.attendance={};d.finance=[];d.gradingCriteria={};d.grades={};d.tests=[];d.testResults={};return d;
}
function saveData(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify({nextId:D.nextId,courses:D.courses,groups:D.groups,mentors:D.mentors,students:D.students,attendance:D.attendance||{},finance:D.finance||[],gradingCriteria:D.gradingCriteria||{},grades:D.grades||{},tests:D.tests||[],testResults:D.testResults||{}}));updateStorageBadge(true);}
  catch(e){updateStorageBadge(false);}
}
function updateStorageBadge(ok){
  const el=document.getElementById('storage-status');if(!el)return;
  el.textContent=ok?'💾 Saqlangan':'⚠️ Saqlanmadi';
  el.style.background=ok?'var(--teal-light)':'var(--amber-light)';
  el.style.color=ok?'var(--teal-text)':'var(--amber-text)';
}
function resetData(){
  if(!confirm('Barcha ma\'lumotlar o\'chiriladi?'))return;
  localStorage.removeItem(STORAGE_KEY);
  D=JSON.parse(JSON.stringify(DEFAULT_DATA));D.attendance={};D.finance=[];
  groupPage=1;updateCounts();updateGroupFilters();updateStudentCourseFilter();renderAll();toast('🔄 Qayta tiklandi');
}
let D={};
function newId(){return ++D.nextId;}
function updateCounts(){
  document.getElementById('nc-courses').textContent=D.courses.length;
  document.getElementById('nc-groups').textContent=D.groups.length;
  document.getElementById('nc-mentors').textContent=D.mentors.length;
  document.getElementById('nc-students').textContent=D.students.length;
  const ncTests=document.getElementById('nc-tests');if(ncTests)ncTests.textContent=D.tests.length;
}
function groupStudentCount(gid){return D.students.filter(s=>s.groupId===gid).length;}
function groupLabel(gid){const g=D.groups.find(x=>x.id===gid);return g?g.name+' ('+g.course.split(' ')[0]+')':'—';}
function studentCourse(s){const g=D.groups.find(x=>x.id===s.groupId);return g?g.course:'';}
function autoGroupName(courseName){
  if(!courseName)return '';
  const w=courseName.split(/\s+/);const prefix=w.length>=2?(w[0][0]+w[1][0]).toUpperCase():courseName.substring(0,2).toUpperCase();
  const count=D.groups.filter(g=>g.course===courseName).length;return prefix+'-'+(count+1);
}
function generateStudentId(id){return 'STD-'+new Date().getFullYear()+'-'+String(id).padStart(4,'0');}
function getCourseDuration(courseName){const c=D.courses.find(x=>x.name===courseName);return c?c.duration:'—';}
function getCoursePrice(courseName){const c=D.courses.find(x=>x.name===courseName);if(!c)return 0;return parseInt((c.price||'0').replace(/\s/g,'').replace(/[^\d]/g,''))||0;}
function getLessonPrice(courseName){const cp=getCoursePrice(courseName);return cp>0?Math.round(cp/LESSON_COUNT):0;}
function getExpYears(expStr){if(!expStr)return 0;const m=expStr.match(/(\d+)/);return m?parseInt(m[1]):0;}
function openLightbox(src){document.getElementById('lightbox-img').src=src;document.getElementById('lightbox').classList.add('open');}
function closeLightbox(){document.getElementById('lightbox').classList.remove('open');document.getElementById('lightbox-img').src='';}
function timeToMin(t_){if(!t_)return 0;const[h,m]=t_.split(':').map(Number);return h*60+m;}
function checkRoomConflict(room,timeStart,timeEnd,editId){
  if(!room||!timeStart||!timeEnd)return null;
  const newS=timeToMin(timeStart),newE=timeToMin(timeEnd);
  for(const g of D.groups){
    if(editId&&g.id===editId)continue;if(g.room!==room)continue;if(!g.timeStart||!g.timeEnd)continue;
    const gS=timeToMin(g.timeStart),gE=timeToMin(g.timeEnd);
    if(newS<gE&&newE>gS)return g;
  }
  return null;
}
function liveCheckConflict(editId){
  const room=(document.getElementById('f-room')?.value||'').trim();
  const ts=document.getElementById('f-timestart')?.value||'';
  const te=document.getElementById('f-timeend')?.value||'';
  const warn=document.getElementById('room-conflict-warn');if(!warn)return;
  if(ts&&te&&timeToMin(te)<=timeToMin(ts)){warn.classList.add('show');warn.innerHTML=`⚠️ <b>Tugash vaqti boshlanish vaqtidan katta bo'lishi kerak!</b>`;return;}
  if(!room||!ts||!te){warn.classList.remove('show');return;}
  const conflict=checkRoomConflict(room,ts,te,editId||null);
  if(conflict){warn.classList.add('show');warn.innerHTML=`⚠️ <b>To'qnashuv!</b> Xona ${room} da ${conflict.name} guruhi allaqachon ${conflict.timeStart}–${conflict.timeEnd} vaqtida band.`;}
  else{warn.classList.remove('show');}
}
function phoneOnlyDigits(el){el.value=el.value.replace(/[^\d+]/g,'');}
function setExpFilter(val,btn){
  _expFilter=val;
  document.querySelectorAll('.exp-pill').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderMentors();
}
function mentorPhotoSrc(m){if(m&&m.photo&&m.photo.data&&m.photo.type)return `data:${m.photo.type};base64,${m.photo.data}`;return null;}
function mentorAvatarHtml(m,idx,size='sm'){
  const src=mentorPhotoSrc(m);
  if(src){const cls=size==='lg'?'av-photo-lg':'av-photo';return `<img class="${cls}" src="${src}" alt="${m.name}" onclick="event.stopPropagation();openLightbox('${src}')">`;}
  const cls=size==='lg'?'detail-av':'av';
  const style=size==='lg'?' style="font-size:24px;width:68px;height:68px;border-radius:50%"':'';
  return `<div class="${cls} ${AV_CLS[idx%5]}"${style}>${ini(m.name)}</div>`;
}
function updateGroupFilters(){
  const cs=document.getElementById('fg-course');const ms=document.getElementById('fg-mentor');if(!cs||!ms)return;
  const cv=cs.value,mv=ms.value;
  cs.innerHTML=`<option value="">${t('all_courses')}</option>`+D.courses.map(c=>`<option value="${c.name}" ${cv===c.name?'selected':''}>${c.name}</option>`).join('');
  ms.innerHTML=`<option value="">${t('all_mentors')}</option>`+D.mentors.map(m=>`<option value="${m.name}" ${mv===m.name?'selected':''}>${m.name}</option>`).join('');
}
function updateStudentCourseFilter(){
  const sel=document.getElementById('filter-student-course');if(!sel)return;
  const v=sel.value;
  sel.innerHTML=`<option value="">${t('all_direction')}</option>`+D.courses.map(c=>`<option value="${c.name}" ${v===c.name?'selected':''}>${c.name}</option>`).join('');
}

// Language switcher - FIX #2: re-render ALL panels
function setLang(lang,btn){
  LANG=lang;
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  saveUI();
  applyTranslations();
  updateVideoNavLabels();
  applyUISettings();
  updateGroupFilters();
  updateStudentCourseFilter();
  updateTopbar(currentTab);
  // Re-render current panel to update dynamic content
  renderAll();
  if(currentTab==='finance') renderFinance();
  if(currentTab==='settings') setTimeout(()=>renderSettingsPanel(),50);
  if(currentTab==='tests') renderTestsPanel();
  if(currentTab==='grades') renderGradesPanel();
  if(currentTab==='mentor-dash') renderMentorDashboard();if(currentTab==='mentor-ai'&&typeof renderMentorAI==='function')renderMentorAI();if(currentTab==='student-ai'&&typeof renderStudentAI==='function')renderStudentAI();
  if(currentTab==='mentors-my') renderMySchedule();
  if(currentTab==='mentor-chat') renderMentorChat();
  if(currentTab==='grades') renderGradesPanel();
  if(currentTab==='tests') renderTestsPanel();
  if(currentTab==='student-my') renderStudentDashboard();
  if(currentTab==='student-schedule') renderStudentSchedulePage();
  if(currentTab==='student-rating') renderStudentRatingPage();
  if(currentTab==='student-grades') renderStudentGradesPage();
  if(currentTab==='student-tests') renderStudentTestsPage();
  if(currentTab==='student-chat') renderStudentChatPage();
  if(currentTab==='student-goals') renderStudentGoalsPage();
  if(currentTab==='mentor-videos') renderMentorVideos();
  if(currentTab==='student-videos') renderStudentVideos();
}

// ===================== FINANCE (FIX #5) =====================
// Finance now supports multiple years, not just 2026
function getAvailableFinanceYears(){
  const years=new Set();
  const now=new Date();
  years.add(now.getFullYear());
  years.add(2026); // always include
  if(D.finance){
    D.finance.forEach(tx=>{
      const y=new Date(tx.date).getFullYear();
      if(y>2020&&y<2100) years.add(y);
    });
  }
  return Array.from(years).sort();
}

function getFinanceForMonth(month,year){
  if(!D.finance)D.finance=[];
  return D.finance.filter(tx=>{
    const d=new Date(tx.date);
    return d.getFullYear()===year && d.getMonth()===month;
  });
}

// FIX #5: Month nav shows both months AND year selector
function renderFinanceMonthNav(){
  const nav=document.getElementById('fin-month-nav');
  const years=getAvailableFinanceYears();
  const monthNames=getMonthNames(true);

  // Year buttons + month buttons
  let html='';
  // Year selector row
  html+=`<div style="display:flex;align-items:center;gap:4px;padding:4px 8px;border-right:1px solid var(--border);flex-shrink:0">`;
  years.forEach(y=>{
    html+=`<button class="fin-month-btn ${y===_finYear?'active':''}" onclick="setFinYear(${y})" style="font-weight:800">${y}</button>`;
  });
  html+=`</div>`;
  // Month buttons
  monthNames.forEach((m,idx)=>{
    html+=`<button class="fin-month-btn ${idx===_finMonth&&_finYear===_finYear?'active':''}" onclick="setFinMonth(${idx},${_finYear})" ${idx===_finMonth?'style="background:linear-gradient(135deg,var(--accent),var(--teal));color:#fff;box-shadow:var(--shadow-sm)"':''}>${m}</button>`;
  });

  nav.innerHTML=html;
  setTimeout(()=>{const a=nav.querySelector('.active[style]');if(a)a.scrollIntoView({block:'nearest',inline:'center'});},50);
}

function setFinYear(y){
  _finYear=y;
  renderFinance();
}
function setFinMonth(m,y){_finMonth=m;_finYear=y;renderFinance();}

function renderFinanceSummary(){
  const txs=getFinanceForMonth(_finMonth,_finYear);
  let totalIncome=0,totalExpense=0,totalSalary=0;
  txs.forEach(tx=>{
    if(tx.type==='income')totalIncome+=tx.amount;
    else if(tx.type==='expense')totalExpense+=tx.amount;
    else if(tx.type==='salary')totalSalary+=tx.amount;
  });
  const balance=totalIncome-(totalExpense+totalSalary);
  const monthName=getMonthName(_finMonth,false)+' '+_finYear;

  document.getElementById('fin-summary-row').innerHTML=`
    <div class="fin-summary-card fin-sc-income">
      <div class="fin-sc-icon">💚</div>
      <div class="fin-sc-val" style="color:var(--teal-text)">${fmtMoney(totalIncome)} so'm</div>
      <div class="fin-sc-label">${t('income')} — ${monthName}</div>
    </div>
    <div class="fin-summary-card fin-sc-expense">
      <div class="fin-sc-icon">🔴</div>
      <div class="fin-sc-val" style="color:var(--orange-text)">${fmtMoney(totalExpense)} so'm</div>
      <div class="fin-sc-label">${t('expense')} — ${monthName}</div>
    </div>
    <div class="fin-summary-card fin-sc-salary">
      <div class="fin-sc-icon">🎓</div>
      <div class="fin-sc-val" style="color:var(--purple-text)">${fmtMoney(totalSalary)} so'm</div>
      <div class="fin-sc-label">${t('salary')} — ${monthName}</div>
    </div>
    <div class="fin-summary-card fin-sc-balance">
      <div class="fin-sc-icon">${balance>=0?'📈':'📉'}</div>
      <div class="fin-sc-val" style="color:${balance>=0?'var(--accent-text)':'var(--orange-text)'}">${balance>=0?'+':''}${fmtMoney(balance)} so'm</div>
      <div class="fin-sc-label">Balans — ${monthName}</div>
    </div>
  `;
}

function renderFinanceList(){
  const filterType=document.getElementById('fin-filter-type')?.value||'';
  let txs=getFinanceForMonth(_finMonth,_finYear);
  if(filterType)txs=txs.filter(tx=>tx.type===filterType);
  txs=txs.slice().sort((a,b)=>new Date(b.date)-new Date(a.date));

  const container=document.getElementById('fin-transactions');
  if(!txs.length){
    container.innerHTML=`<div class="empty"><div class="empty-ic">💰</div><div class="empty-txt">Bu oyda tranzaksiya yo'q</div></div>`;
    return;
  }
  const typeIcon={income:'💚',expense:'🔴',salary:'🎓'};
  const typeClass={income:'fin-tx-income',expense:'fin-tx-expense',salary:'fin-tx-salary'};
  const typeName={income:t('income'),expense:t('expense'),salary:t('salary')};
  const amountClass={income:'fin-tx-amount-income',expense:'fin-tx-amount-expense',salary:'fin-tx-amount-salary'};
  const sign={income:'+',expense:'−',salary:'−'};

  container.innerHTML=`
    <div class="fin-tx-header">
      <div></div>
      <div>Nomi / Tavsif</div>
      <div>Sana</div>
      <div>Tur</div>
      <div>Summa</div>
      <div style="text-align:right">Amal</div>
    </div>
    ${txs.map(tx=>`
      <div class="fin-tx-row">
        <div><div class="fin-tx-icon ${typeClass[tx.type]}">${typeIcon[tx.type]}</div></div>
        <div>
          <div class="fin-tx-name">${tx.title||'—'}</div>
          <div class="fin-tx-desc">${tx.description||''}</div>
        </div>
        <div style="font-size:12px;color:var(--text2)">${fmtDateTime(tx.date)}</div>
        <div><span class="badge ${tx.type==='income'?'b-teal':tx.type==='salary'?'b-purple':'b-orange'}">${typeName[tx.type]}</span></div>
        <div class="${amountClass[tx.type]}">${sign[tx.type]}${fmtMoney(tx.amount)} so'm</div>
        <div style="text-align:right"><button class="fin-tx-del" onclick="deleteFinTx(${tx.id})" title="O'chirish">🗑</button></div>
      </div>
    `).join('')}
  `;
}

// FIX #5: Update filter select options with translated text
function renderFinance(){
  // Update filter options with current language
  const filterSel=document.getElementById('fin-filter-type');
  if(filterSel){
    const curVal=filterSel.value;
    filterSel.innerHTML=`
      <option value="">${t('all_')}</option>
      <option value="income">💚 ${t('income')}</option>
      <option value="expense">🔴 ${t('expense')}</option>
      <option value="salary">🎓 ${t('salary')}</option>
    `;
    filterSel.value=curVal;
  }
  renderFinanceMonthNav();
  renderFinanceSummary();
  renderFinanceList();
}

function deleteFinTx(id){
  if(!confirm('Bu tranzaksiyani o\'chirasizmi?'))return;
  D.finance=D.finance.filter(tx=>tx.id!==id);
  saveData();renderFinance();toast('🗑 O\'chirildi');
}

function openFinModal(type,data={}){
  _finModal_type=type;_finModal_editId=data.id||null;
  const titles={income:'💚 '+t('income')+' qo\'shish',expense:'🔴 '+t('expense')+' qo\'shish'};
  document.getElementById('fin-modal-title').textContent=titles[type]||'Qo\'shish';
  const today=new Date().toISOString().slice(0,16);
  document.getElementById('fin-modal-body').innerHTML=`
    <div class="fg"><label>Nomi <span class="req">*</span></label>
      <input id="fin-title" placeholder="${type==='income'?'Masalan: Jasur Mirzayev to\'lovi':'Masalan: Internet to\'lovi'}" value="${data.title||''}">
    </div>
    <div class="fg"><label>Tavsif (ixtiyoriy)</label>
      <textarea id="fin-desc" rows="2" placeholder="Qo'shimcha ma'lumot...">${data.description||''}</textarea>
    </div>
    <div class="form-row">
      <div class="fg"><label>Summa (so'm) <span class="req">*</span></label>
        <input id="fin-amount" type="number" min="0" placeholder="500 000" value="${data.amount||''}">
      </div>
      <div class="fg"><label>Sana va vaqt <span class="req">*</span></label>
        <input id="fin-date" type="datetime-local" value="${data.date?data.date.slice(0,16):today}">
      </div>
    </div>
    ${type==='income'?`
    <div class="fg"><label>Talaba (ixtiyoriy)</label>
      <select id="fin-student">
        <option value="">— Talabani tanlang —</option>
        ${D.students.map(s=>`<option value="${s.id}" ${data.studentId==s.id?'selected':''}>${s.name} — ${groupLabel(s.groupId)}</option>`).join('')}
      </select>
    </div>`:''}
  `;
  document.getElementById('fin-overlay').classList.add('open');
  setTimeout(()=>document.getElementById('fin-title')?.focus(),100);
}
function closeFinModal(){document.getElementById('fin-overlay').classList.remove('open');}
function saveFinTransaction(){
  const title=(document.getElementById('fin-title')?.value||'').trim();
  const amount=parseFloat(document.getElementById('fin-amount')?.value||0);
  const date=document.getElementById('fin-date')?.value;
  if(!title){toast('⚠️ Nomni kiriting!');return;}
  if(!amount||amount<=0){toast('⚠️ Summani kiriting!');return;}
  if(!date){toast('⚠️ Sanani kiriting!');return;}
  const studentId=document.getElementById('fin-student')?.value||null;
  const tx={
    id:newId(),
    type:_finModal_type,
    title,
    description:(document.getElementById('fin-desc')?.value||'').trim(),
    amount,
    date:new Date(date).toISOString(),
    studentId:studentId?parseInt(studentId):null,
    createdAt:new Date().toISOString()
  };
  if(!D.finance)D.finance=[];
  D.finance.push(tx);
  saveData();closeFinModal();renderFinance();
  if(tx.type==='income'&&tx.studentId){
    const s=D.students.find(x=>x.id===tx.studentId);
    if(s&&s.isDebtor){s.isDebtor=false;s.status='Aktiv';saveData();updateCounts();renderStudents();toast('✅ Kirim qo\'shildi + '+s.name+' qarzdorlikdan chiqdi!');}
    else toast('✅ Kirim qo\'shildi!');
  }else{
    toast('✅ '+(tx.type==='income'?'Kirim':'Chiqim')+' qo\'shildi!');
  }
}

function openMentorSalaryModal(){
  const monthName=getMonthName(_finMonth,false)+' '+_finYear;
  const txs=getFinanceForMonth(_finMonth,_finYear);
  const paidSalaries=txs.filter(t_=>t_.type==='salary');

  const mentorRows=D.mentors.map(m=>{
    const mGroups=D.groups.filter(g=>g.mentor===m.name);
    const mStudentIds=D.students.filter(s=>mGroups.some(g=>g.id===s.groupId)).map(s=>s.id);
    let mentorIncome=0;
    txs.filter(t_=>t_.type==='income'&&t_.studentId&&mStudentIds.includes(t_.studentId)).forEach(t_=>mentorIncome+=t_.amount);
    if(mentorIncome===0){
      mGroups.forEach(g=>{
        const grpStudents=D.students.filter(s=>s.groupId===g.id);
        const cp=getCoursePrice(g.course);const lp=cp>0?Math.round(cp/LESSON_COUNT):0;
        grpStudents.forEach(s=>{
          const attKey='att_'+g.id+'_'+_finYear+'_'+_finMonth;
          const sAtt=(D.attendance[attKey]&&D.attendance[attKey]['s'+s.id])||{};
          let ky=0;for(let l=1;l<=LESSON_COUNT;l++){const v=sAtt['l'+l]||'';if(v==='K'||v==='Y')ky++;}
          mentorIncome+=ky*lp;
        });
      });
    }
    const salary=Math.round(mentorIncome*MENTOR_SALARY_PCT);
    const isPaid=paidSalaries.some(t_=>t_.mentorId===m.id);
    return {mentor:m,mentorIncome,salary,isPaid,mGroups,mStudentIds};
  });

  document.getElementById('salary-modal-body').innerHTML=`
    <div style="background:var(--purple-light);border:1px solid rgba(124,58,237,.2);border-radius:var(--r-md);padding:12px 16px;margin-bottom:16px;font-size:13px;color:var(--purple-text)">
      💡 <b>Qoida:</b> Har bir mentor o'z talabalarining to'lovlaridan <b>20%</b> oladi. Bu oy: <b>${monthName}</b>
    </div>
    <div style="overflow-x:auto">
      <table class="salary-table">
        <thead>
          <tr>
            <th>Mentor</th><th>Guruhlar</th><th>Talabalar to'lovi</th><th>Oylik (20%)</th><th>${L==='ru'?'Статус':L==='en'?'Status':'Holat'}</th><th>Amal</th>
          </tr>
        </thead>
        <tbody>
          ${mentorRows.map((row,i)=>`
            <tr>
              <td><div style="display:flex;align-items:center;gap:8px">${mentorAvatarHtml(row.mentor,i,'sm')}<div><b>${row.mentor.name}</b><br><span style="font-size:11px;color:var(--text3)">${row.mentor.subject}</span></div></div></td>
              <td>${row.mGroups.map(g=>`<span class="badge b-blue" style="margin:2px">${g.name}</span>`).join('')||'—'}</td>
              <td style="font-weight:700;color:var(--teal-text)">${fmtMoney(row.mentorIncome)} so'm</td>
              <td style="font-weight:800;color:var(--purple-text);font-size:15px">${fmtMoney(row.salary)} so'm</td>
              <td>${row.isPaid?'<span class="salary-paid-badge">✅ To\'landi</span>':'<span class="badge b-amber">⏳ Kutilmoqda</span>'}</td>
              <td>${row.isPaid?'':`<button class="salary-pay-btn" onclick="paySalary(${row.mentor.id},'${row.mentor.name}',${row.salary})">💸 To'lash</button>`}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div style="margin-top:16px;padding:12px 16px;background:var(--bg3);border-radius:var(--r-md);font-size:13px;color:var(--text2)">
      Jami oylik: <b style="color:var(--purple-text)">${fmtMoney(mentorRows.reduce((s,r)=>s+r.salary,0))} so'm</b> · 
      To'landi: <b style="color:var(--teal-text)">${mentorRows.filter(r=>r.isPaid).length} ta mentor</b>
    </div>
  `;
  document.getElementById('salary-overlay').classList.add('open');
}
function closeMentorSalaryModal(){document.getElementById('salary-overlay').classList.remove('open');}
window.paySalary=function(mentorId,mentorName,amount){
  if(!confirm(`${mentorName}ga ${fmtMoney(amount)} so'm oylik to'lansinmi?`))return;
  if(!D.finance)D.finance=[];
  const date=new Date(_finYear,_finMonth,15).toISOString();
  D.finance.push({
    id:newId(),
    type:'salary',
    title:`${mentorName} — Oylik (20%)`,
    description:`${getMonthName(_finMonth,false)} ${_finYear} oyi uchun mentor oyligi`,
    amount,
    date,
    mentorId,
    createdAt:new Date().toISOString()
  });
  saveData();
  toast('✅ '+mentorName+' oylik to\'landi: '+fmtMoney(amount)+' so\'m');
  openMentorSalaryModal();
  renderFinance();
};

// ===================== ATTENDANCE (FIX #3) =====================
let _attGid=null,_attMonth=null,_attYear=null;
function showGroupStudents(gid){
  const g=D.groups.find(x=>x.id===gid);if(!g)return;
  _attGid=gid;window._attGid=gid;
  if(_attMonth===null){const now=new Date();_attYear=now.getFullYear();_attMonth=now.getMonth();}
  document.getElementById('stat-modal-title').textContent=g.name+' — 📋 Davomat';
  const cnt=D.students.filter(s=>s.groupId===gid).length;
  document.getElementById('att-group-info').textContent=g.course+' · 🎓 '+g.mentor+' · 🚪 Xona '+g.room+' · 👥 '+cnt+' ta talaba';
  _renderAttMonthNav();_renderAttTable(gid,_attMonth,_attYear);
  document.getElementById('stat-overlay').classList.add('open');
}

function _renderAttMonthNav(){
  const nav=document.getElementById('att-month-nav');
  const monthNames=getMonthNames(true);
  // FIX #5: Support multiple years in attendance too
  const curYear=_attYear||new Date().getFullYear();
  const years=[2025, 2026, new Date().getFullYear()].filter((v,i,a)=>a.indexOf(v)===i).sort();

  let html='';
  // Year selector
  html+=`<div style="display:flex;align-items:center;gap:4px;padding:4px 8px;border-right:1px solid var(--border);flex-shrink:0">`;
  years.forEach(y=>{
    html+=`<button class="att-month-btn ${y===curYear?'att-month-active':''}" onclick="_setAttYear(${y})" style="font-weight:800">${y}</button>`;
  });
  html+=`</div>`;
  // Month buttons
  monthNames.forEach((m,idx)=>{
    html+=`<button class="att-month-btn ${idx===_attMonth&&curYear===_attYear?'att-month-active':''}" onclick="_setAttMonth(${idx},${curYear})">${m}</button>`;
  });

  nav.innerHTML=html;
  setTimeout(()=>{const a=nav.querySelector('.att-month-active');if(a)a.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});},50);
}

window._setAttYear=function(y){_attYear=y;_renderAttMonthNav();_renderAttTable(_attGid,_attMonth,_attYear);};
function _setAttMonth(month,year){_attMonth=month;_attYear=year;_renderAttMonthNav();_renderAttTable(_attGid,_attMonth,_attYear);}

function _renderAttTable(gid,month,year){
  if(!D.attendance)D.attendance={};
  const attKey='att_'+gid+'_'+year+'_'+month;
  if(!D.attendance[attKey])D.attendance[attKey]={};
  const students=D.students.filter(s=>s.groupId===gid);
  const grp=D.groups.find(x=>x.id===gid);

  // FIX #3: Show full date in month label e.g. "1-yanvar, 2026-yil"
  const monthLabel=getMonthName(month,false)+' '+year;
  const coursePrice=grp?getCoursePrice(grp.course):0;
  const lessonPrice=coursePrice>0?Math.round(coursePrice/LESSON_COUNT):0;

  if(!students.length){document.getElementById('att-table-wrap').innerHTML=`<div class="empty"><div class="empty-ic">🧑‍💻</div><div class="empty-txt">Ma'lumot yo'q</div></div>`;return;}

  const statusBadge={Aktiv:'b-teal',Faolsiz:'b-gray',Muzlatilgan:'b-blue',Probatsiya:'b-amber',Arxiv:'b-purple'};
  const COL_W=46,NAME_W=180,RESULT_W=240;
  const minW=NAME_W+LESSON_COUNT*COL_W+RESULT_W;

  // FIX #3: Generate lesson column headers with dates
  // Calculate dates for each lesson based on group's schedule days and month
  function getLessonDates(groupDays, yr, mon){
    const dayMap={Du:1,Se:2,Ch:3,Pa:4,Ju:5,Sh:6}; // 0=Sun,1=Mon...6=Sat
    const days=(groupDays||[]).map(d=>dayMap[d]||0).filter(d=>d>0);
    if(!days.length) return Array.from({length:LESSON_COUNT},(_,i)=>null);
    const dates=[];
    const daysInMonth=new Date(yr,mon+1,0).getDate();
    for(let day=1;day<=daysInMonth&&dates.length<LESSON_COUNT;day++){
      const dt=new Date(yr,mon,day);
      if(days.includes(dt.getDay())) dates.push(day);
    }
    // Pad if needed
    while(dates.length<LESSON_COUNT) dates.push(null);
    return dates;
  }

  const lessonDates=getLessonDates(grp?grp.days:[],year,month);

  let th=`<th style="min-width:${NAME_W}px;text-align:left;padding:10px 14px;font-size:12px;font-weight:700;color:var(--text2);border-bottom:2px solid var(--border2);position:sticky;left:0;background:var(--bg2);z-index:3;white-space:nowrap;box-shadow:2px 0 4px rgba(0,0,0,.06)">Talaba <span style="font-weight:400;color:var(--text3)">(${monthLabel})</span></th>`;
  for(let l=1;l<=LESSON_COUNT;l++){
    const d=lessonDates[l-1];
    // FIX #3: Show date under lesson number
    const dateStr=d?`<div style="font-size:9px;color:var(--text3);margin-top:2px">${d}-${getMonthName(month,true).slice(0,3)}</div>`:'';
    th+=`<th style="min-width:${COL_W}px;text-align:center;padding:6px 3px;font-size:12px;font-weight:700;color:var(--text2);border-bottom:2px solid var(--border2)">${l}${dateStr}</th>`;
  }
  th+=`<th style="min-width:${RESULT_W}px;text-align:center;padding:8px 6px;font-size:11px;font-weight:700;color:var(--text2);border-bottom:2px solid var(--border2);position:sticky;right:0;background:var(--bg2);z-index:3;box-shadow:-2px 0 4px rgba(0,0,0,.06)">Natija · To'lov</th>`;

  let rows='';
  students.forEach((s,idx)=>{
    const sKey='s'+s.id;
    if(!D.attendance[attKey][sKey])D.attendance[attKey][sKey]={};
    const sAtt=D.attendance[attKey][sKey];
    let present=0,absent=0,excused=0;
    for(let l=1;l<=LESSON_COUNT;l++){const v=sAtt['l'+l]||'';if(v==='K')present++;else if(v==='Y')absent++;else if(v==='S')excused++;}
    const marked=present+absent+excused;const kPlusY=present+absent;
    const pct=marked>0?Math.round(present/marked*100):0;
    const pctColor=pct>=80?'var(--teal-text)':pct>=60?'var(--amber-text)':'var(--orange-text)';
    const toPay=kPlusY*lessonPrice;const isFullAtt=(marked>=LESSON_COUNT);
    let cells='';
    for(let l=1;l<=LESSON_COUNT;l++){
      const v=sAtt['l'+l]||'';
      const styleMap={'':'background:var(--bg3);border-color:var(--border2);color:var(--text3)','K':'background:var(--teal-light);border-color:var(--teal);color:var(--teal-text)','Y':'background:var(--amber-light);border-color:var(--amber);color:var(--amber-text)','S':'background:var(--purple-light);border-color:var(--purple);color:var(--purple-text)'};
      const labelMap={'':'·','K':'K','Y':'Y','S':'S'};
      // FIX #3: Show date tooltip on hover
      const dateD=lessonDates[l-1];
      const dateTip=dateD?fmtAttDate(dateD,month,year):'';
      const tooltipHtml=`<div class="att-tip" id="tip-${attKey}-${sKey}-l${l}"><button class="att-tip-btn att-tip-k" onclick="event.stopPropagation();setAtt('${attKey}','${sKey}','l${l}','K')">K</button><button class="att-tip-btn att-tip-y" onclick="event.stopPropagation();setAtt('${attKey}','${sKey}','l${l}','Y')">Y</button><button class="att-tip-btn att-tip-s" onclick="event.stopPropagation();setAtt('${attKey}','${sKey}','l${l}','S')">S</button><button class="att-tip-btn att-tip-clear" onclick="event.stopPropagation();setAtt('${attKey}','${sKey}','l${l}','')">✕</button>${dateTip?`<span style="font-size:10px;color:var(--text3);margin-left:4px">${dateTip}</span>`:''}</div>`;
      cells+=`<td style="text-align:center;padding:5px 3px;border-bottom:1px solid var(--border)"><div class="att-cell-wrap" onclick="event.stopPropagation();toggleAttTip('tip-${attKey}-${sKey}-l${l}')"><button style="${styleMap[v]||styleMap['']};display:inline-flex;align-items:center;justify-content:center;width:34px;height:30px;border-radius:6px;border:1.5px solid;cursor:pointer;font-size:12px;font-weight:700;font-family:'JetBrains Mono',monospace;transition:all .12s;" title="${dateTip}">${labelMap[v]||'·'}</button>${tooltipHtml}</div></td>`;
    }
    const resultHtml=`<div style="font-size:12px;font-weight:800;color:${pctColor};margin-bottom:4px">${pct}% davomat</div><div style="display:flex;justify-content:center;gap:4px;margin-bottom:5px;flex-wrap:wrap"><span style="font-size:10px;padding:2px 6px;border-radius:10px;background:var(--teal-light);color:var(--teal-text);font-weight:700">K:${present}</span><span style="font-size:10px;padding:2px 6px;border-radius:10px;background:var(--amber-light);color:var(--amber-text);font-weight:700">Y:${absent}</span><span style="font-size:10px;padding:2px 6px;border-radius:10px;background:var(--purple-light);color:var(--purple-text);font-weight:700">S:${excused}</span><span style="font-size:10px;padding:2px 6px;border-radius:10px;background:var(--bg4);color:var(--text2);font-weight:700">📚${marked}/${LESSON_COUNT}</span></div>${isFullAtt?`<div style="font-size:10px;padding:3px 8px;border-radius:10px;background:var(--orange-light);color:var(--orange-text);font-weight:700;margin-bottom:5px">💸 Qarzdor</div>`:''}${lessonPrice>0?`<div style="font-size:10px;color:var(--text3);font-weight:500;margin-bottom:2px">${kPlusY} dars × ${fmtMoney(lessonPrice)} so'm</div><div style="font-size:13px;font-weight:800;color:${toPay>0?'var(--orange-text)':'var(--teal-text)'}">💰 ${fmtMoney(toPay)} so'm</div>`:''}`;
    const rowBg=idx%2===0?'background:var(--bg2)':'background:var(--bg3)';
    rows+=`<tr style="${rowBg};transition:background .15s" onmouseover="this.style.background='var(--accent-light)'" onmouseout="this.style.background='${idx%2===0?'var(--bg2)':'var(--bg3)'}'"><td style="padding:8px 14px;border-bottom:1px solid var(--border);position:sticky;left:0;${rowBg};z-index:1;box-shadow:2px 0 4px rgba(0,0,0,.04)"><div style="display:flex;align-items:center;gap:8px"><div class="av ${AV_CLS[idx%5]}" style="width:30px;height:30px;font-size:10px;flex-shrink:0">${ini(s.name)}</div><div style="min-width:0"><div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:115px">${s.name}</div><span class="badge ${statusBadge[s.status]||'b-gray'}" style="font-size:9px;padding:2px 5px;margin-top:2px;display:inline-block">${s.status}</span>${isFullAtt?`<span class="badge b-orange" style="font-size:9px;padding:2px 5px;margin-top:2px;display:inline-block">💸</span>`:''}</div></div></td>${cells}<td style="text-align:center;padding:6px 10px;border-bottom:1px solid var(--border);position:sticky;right:0;${rowBg};z-index:1;box-shadow:-2px 0 4px rgba(0,0,0,.04)">${resultHtml}</td></tr>`;
  });

  let footTotalToPay=0;
  students.forEach(s=>{const sKey='s'+s.id;const sAtt=(D.attendance[attKey][sKey])||{};let ky=0;for(let l=1;l<=LESSON_COUNT;l++){const v=sAtt['l'+l]||'';if(v==='K'||v==='Y')ky++;}footTotalToPay+=ky*lessonPrice;});
  const footRow=lessonPrice>0?`<tr style="background:var(--bg3)"><td colspan="${LESSON_COUNT+2}" style="padding:10px 14px;font-size:12px;font-weight:600;color:var(--text2);border-top:2px solid var(--border2)">📊 ${monthLabel} · 1 dars = <b style="color:var(--accent-text)">${fmtMoney(lessonPrice)} so'm</b> · Jami: <b style="color:var(--orange-text)">${fmtMoney(footTotalToPay)} so'm</b></td></tr>`:'';
  document.getElementById('att-table-wrap').innerHTML=`<div class="att-table-scroll"><table style="width:100%;border-collapse:collapse;min-width:${minW}px;background:var(--bg2)"><thead style="position:sticky;top:0;z-index:4;background:var(--bg2)"><tr>${th}</tr></thead><tbody>${rows}${footRow}</tbody></table></div>`;
}

window.toggleAttTip=function(tipId){const tip=document.getElementById(tipId);if(!tip)return;const isOpen=tip.classList.contains('open');document.querySelectorAll('.att-tip.open').forEach(t_=>t_.classList.remove('open'));if(!isOpen)tip.classList.add('open');};
document.addEventListener('click',function(){document.querySelectorAll('.att-tip.open').forEach(t_=>t_.classList.remove('open'));});
window.setAtt=function(attKey,sKey,lKey,val){
  if(!D.attendance)D.attendance={};
  if(!D.attendance[attKey])D.attendance[attKey]={};
  if(!D.attendance[attKey][sKey])D.attendance[attKey][sKey]={};
  if(!val)delete D.attendance[attKey][sKey][lKey];else D.attendance[attKey][sKey][lKey]=val;
  saveData();
  const studentId=parseInt(sKey.replace('s',''));if(!isNaN(studentId))checkAndMarkDebtorIfFullAttendance(studentId);
  const ind=document.getElementById('att-save-indicator');if(ind){ind.textContent='✅ Saqlandi';clearTimeout(ind._t);ind._t=setTimeout(()=>ind.textContent='',2000);}
  _renderAttTable(_attGid,_attMonth,_attYear);
};

function calcStudentMonthStats(studentId,groupId,year,month){
  const attKey='att_'+groupId+'_'+year+'_'+month;
  const sKey='s'+studentId;
  const sAtt=(D.attendance[attKey]&&D.attendance[attKey][sKey])||{};
  let present=0,absent=0,excused=0;
  for(let l=1;l<=LESSON_COUNT;l++){const v=sAtt['l'+l]||'';if(v==='K')present++;else if(v==='Y')absent++;else if(v==='S')excused++;}
  const marked=present+absent+excused;const kPlusY=present+absent;
  return{present,absent,excused,marked,kPlusY};
}
function calcStudentAllMonthsDebt(studentId,groupId){
  const results=[];
  const grp=D.groups.find(x=>x.id===groupId);if(!grp)return results;
  const coursePrice=getCoursePrice(grp.course);
  const lessonPrice=coursePrice>0?Math.round(coursePrice/LESSON_COUNT):0;
  for(let yr=2025;yr<=new Date().getFullYear()+1;yr++){
    for(let m=0;m<12;m++){
      const stats=calcStudentMonthStats(studentId,groupId,yr,m);
      if(stats.marked>0){
        const toPay=stats.kPlusY*lessonPrice;
        const isFullMonth=(stats.marked>=LESSON_COUNT);
        results.push({month:m,year:yr,label:getMonthName(m,false)+' '+yr,...stats,coursePrice,lessonPrice,toPay,isFullMonth});
      }
    }
  }
  return results;
}
function checkAndMarkDebtorIfFullAttendance(studentId){
  const s=D.students.find(x=>x.id===studentId);if(!s||!s.groupId)return;
  let becameDebtor=false;
  for(let yr=2025;yr<=new Date().getFullYear()+1;yr++){
    for(let month=0;month<12;month++){
      const stats=calcStudentMonthStats(studentId,s.groupId,yr,month);
      if(stats.marked>=LESSON_COUNT){becameDebtor=true;break;}
    }
    if(becameDebtor)break;
  }
  if(becameDebtor){
    let changed=false;
    if(!s.isDebtor){s.isDebtor=true;changed=true;}
    if(s.status==='Aktiv'){s.status='Probatsiya';changed=true;}
    if(changed){saveData();updateCounts();renderStudents();renderDashboard();toast('💸 '+s.name+' — Probatsiya + Qarzdor belgilandi!');}
  }
}
function markStudentPaid(studentId){
  const s=D.students.find(x=>x.id===studentId);if(!s)return;
  const grp=D.groups.find(x=>x.id===s.groupId);
  if(grp){
    const totalToPay=calcStudentAllMonthsDebt(s.id,s.groupId).reduce((sum,m)=>sum+m.toPay,0);
    if(totalToPay>0&&!D.finance)D.finance=[];
    if(totalToPay>0){
      D.finance.push({
        id:newId(),type:'income',
        title:s.name+' — To\'lov',
        description:grp.name+' guruhi · '+grp.course,
        amount:totalToPay,
        date:new Date().toISOString(),
        studentId:s.id,
        createdAt:new Date().toISOString()
      });
    }
  }
  for(let yr=2025;yr<=new Date().getFullYear()+1;yr++){
    for(let month=0;month<12;month++){
      const attKey='att_'+s.groupId+'_'+yr+'_'+month;const sKey='s'+studentId;
      if(!D.attendance[attKey]||!D.attendance[attKey][sKey])continue;
      const stats=calcStudentMonthStats(studentId,s.groupId,yr,month);
      if(stats.marked>=LESSON_COUNT)D.attendance[attKey][sKey]={};
    }
  }
  s.isDebtor=false;s.status='Aktiv';
  saveData();updateCounts();renderStudents();renderDashboard();
  toast('✅ '+s.name+' — To\'lov qabul qilindi!');
  openDetailStudent(studentId);
}

// ===================== RENDER COURSES (FIX #3) =====================
function renderCourses(){
  const q=(document.getElementById('s-course').value||'').toLowerCase();
  const items=D.courses.filter(c=>c.name.toLowerCase().includes(q));
  const g=document.getElementById('course-grid');
  if(!items.length){g.innerHTML=`<div class="empty"><div class="empty-ic">📚</div><div class="empty-txt">Kurs topilmadi</div></div>`;return;}
  g.innerHTML=items.map((c,i)=>{
    const grps=D.groups.filter(gr=>gr.course===c.name).length;
    const stds=D.students.filter(s=>studentCourse(s)===c.name).length;
    const lp=getLessonPrice(c.name);
    // FIX #3: Show full course info - duration, price, lesson price, rule
    return `<div class="card ${COURSE_TOP[i%5]}">
      <div class="card-head">
        <div class="card-title">${c.name}</div>
        <span class="badge ${c.status==='Faol'?COURSE_COLORS[i%7]:'b-gray'}">${c.status}</span>
      </div>
      <div class="card-body">
        <div><span>⏱ Davomiyligi:</span><b>${c.duration}</b></div>
        <div><span>💰 Kurs narxi:</span><b>${c.price} so'm</b></div>
        <div><span>📐 1 dars narxi:</span><b>${fmtMoney(lp)} so'm</b></div>
        <div><span>👥 Guruhlar:</span><b>${grps} ta guruh</b></div>
        <div><span>🧑‍💻 Talabalar:</span><b>${stds} ta talaba</b></div>
        <div style="margin-top:8px;padding:8px 10px;background:var(--accent-light);border-radius:var(--r-sm);font-size:11px;color:var(--accent-text);line-height:1.6">
          💡 <b>To'lov qoidasi:</b> K va Y — yechiladi · S — yechilmaydi · 12 dars = Qarzdor
        </div>
      </div>
      <div class="card-foot">
        <button class="btn btn-sm" onclick="editItem('course',${c.id})">✏️ Tahrirlash</button>
        <button class="btn btn-sm btn-del-outline" onclick="showDelModal('${c.name.replace(/'/g,"\\'")}',()=>execDelCourse(${c.id}))">🗑 O'chirish</button>
      </div>
    </div>`;
  }).join('');
}

// ===================== RENDER GROUPS =====================
function resetGroupPage(){groupPage=1;}
function renderGroups(){
  const q=(document.getElementById('s-group').value||'').toLowerCase();
  const fc=(document.getElementById('fg-course')?.value||'');
  const fm=(document.getElementById('fg-mentor')?.value||'');
  const fd=(document.getElementById('fg-duration')?.value||'');
  const fday=(document.getElementById('fg-days')?.value||'');
  const fst=(document.getElementById('fg-status')?.value||'');
  let items=D.groups.filter(g=>{
    const mQ=!q||g.name.toLowerCase().includes(q)||g.course.toLowerCase().includes(q)||g.mentor.toLowerCase().includes(q);
    const mC=!fc||g.course===fc;const mM=!fm||g.mentor===fm;
    const dur=getCourseDuration(g.course);const durNum=parseInt(dur)||0;
    let mD=true;if(fd==='1-5')mD=durNum>=1&&durNum<=5;else if(fd==='5-12')mD=durNum>5&&durNum<=12;
    const mDay=!fday||(g.days||[]).includes(fday);const mSt=!fst||g.status===fst;
    return mQ&&mC&&mM&&mD&&mDay&&mSt;
  });
  items.sort((a,b)=>a.name.localeCompare(b.name));
  const total=items.length;const pages=Math.max(1,Math.ceil(total/PER_PAGE));
  if(groupPage>pages)groupPage=pages;
  const start=(groupPage-1)*PER_PAGE;const paged=items.slice(start,start+PER_PAGE);
  const grid=document.getElementById('group-grid');
  if(!total){grid.innerHTML=`<div class="empty"><div class="empty-ic">👥</div><div class="empty-txt">Guruh topilmadi</div></div>`;document.getElementById('group-pagination').innerHTML='';return;}
  grid.innerHTML=paged.map(g=>{
    const cnt=groupStudentCount(g.id);
    const dur=getCourseDuration(g.course);
    const timeStr=(g.timeStart&&g.timeEnd)?g.timeStart+'–'+g.timeEnd:'—';
    const daysHtml=(g.days||[]).map(d=>`<span class="day-pill">${d}</span>`).join('');
    const statusBadge=g.status==='Man etilgan'?'b-orange':g.status==='Faol'?'b-teal':'b-gray';
    return `<div class="card"><div class="card-head"><div class="card-title">${g.name}</div><span class="badge ${statusBadge}">${g.status}</span></div><div class="card-body"><div><span>📚 Kurs:</span><b>${g.course}</b></div><div><span>🎓 Mentor:</span><b>${g.mentor}</b></div><div><span>🧑‍💻 Talabalar:</span><b><span class="badge b-blue" onclick="showGroupStudents(${g.id})" style="cursor:pointer;font-size:12px">${cnt} ta →</span></b></div><div><span>📅 Boshlanish:</span><b>${fmtDate(g.startDate)}</b></div><div><span>📆 Davomiylik:</span><b>${dur}</b></div><div><span>🚪 Xona:</span><b>${g.room||'—'}</b><span style="margin-left:8px">⏰</span><b>${timeStr}</b></div><div class="days-badges" style="margin-top:10px">${daysHtml}</div></div><div class="card-foot"><button class="btn btn-sm" onclick="showGroupStudents(${g.id})" style="background:var(--teal-light);color:var(--teal-text);border-color:rgba(13,148,136,.3)">${L==='ru'?'📋 Посещаемость':L==='en'?'📋 Attendance':'📋 Davomat'}</button><button class="btn btn-sm" onclick="showMentorGroupRating(${g.id})" style="background:var(--purple-light);color:var(--purple-text);border-color:rgba(124,58,237,.3)">🏆 Reyting</button><button class="btn btn-sm" onclick="go('grades',document.getElementById('nav-grades'));setTimeout(()=>selectGradeGroup(${g.id}),150)" style="background:var(--amber-light);color:var(--amber-text);border-color:rgba(217,119,6,.3)">🏅 Baholash</button><button class="btn btn-sm" onclick="go('tests',document.getElementById('nav-tests'));setTimeout(()=>filterTestsByGroup(${g.id}),150)" style="background:var(--teal-light);color:var(--teal-text);border-color:rgba(13,148,136,.3)">${L==='ru'?'📝 Тесты':L==='en'?'📝 Tests':'📝 Testlar'}</button><button class="btn btn-sm" onclick="editItem('group',${g.id})">✏️</button><button class="btn btn-sm btn-del-outline" onclick="delItem('group',${g.id})">🗑</button></div></div>`;
  }).join('');
  let pgHtml=`<button class="pg-btn" onclick="setGroupPage(${groupPage-1})" ${groupPage===1?'disabled':''}>‹ Oldingi</button>`;
  const maxBtns=7;let pStart=Math.max(1,groupPage-3);let pEnd=Math.min(pages,pStart+maxBtns-1);
  if(pEnd-pStart<maxBtns-1)pStart=Math.max(1,pEnd-maxBtns+1);
  for(let i=pStart;i<=pEnd;i++)pgHtml+=`<button class="pg-btn ${i===groupPage?'active':''}" onclick="setGroupPage(${i})">${i}</button>`;
  pgHtml+=`<button class="pg-btn" onclick="setGroupPage(${groupPage+1})" ${groupPage===pages?'disabled':''}>Keyingi ›</button>`;
  pgHtml+=`<span class="pg-info">${start+1}–${Math.min(start+PER_PAGE,total)} / ${total}</span>`;
  document.getElementById('group-pagination').innerHTML=pgHtml;
}
function setGroupPage(p){groupPage=p;renderGroups();document.getElementById('scroll').scrollTop=0;}

// ===================== RENDER MENTORS =====================
function renderMentors(){
  const q=(document.getElementById('s-mentor').value||'').toLowerCase();
  let items=D.mentors.filter(m=>{
    const mQ=m.name.toLowerCase().includes(q)||m.subject.toLowerCase().includes(q);if(!mQ)return false;
    if(!_expFilter)return true;const yrs=getExpYears(m.experience);
    if(_expFilter==='5+')return yrs>=5;return yrs===parseInt(_expFilter);
  });
  items.sort((a,b)=>a.name.localeCompare(b.name));
  const el=document.getElementById('mentor-list');
  if(!items.length){el.innerHTML=`<div class="empty"><div class="empty-ic">🎓</div><div class="empty-txt">Mentor topilmadi</div></div>`;return;}
  el.innerHTML=items.map((m,i)=>{
    const gc=D.groups.filter(g=>g.mentor===m.name).length;
    const sc=D.students.filter(s=>D.groups.some(g=>g.id===s.groupId&&g.mentor===m.name)).length;
    return `<div class="list-item" onclick="openDetailMentor(${m.id})">${mentorAvatarHtml(m,i,'sm')}<div class="li-info"><div class="li-name">${m.name}</div><div class="li-sub">📱 ${m.phone} · ${m.subject}${m.experience?' · '+m.experience:''}</div><div class="li-tags"><span class="badge b-purple">${gc} guruh</span><span class="badge b-teal">${sc} talaba</span><span class="badge b-gray">📅 ${fmtDate(m.joinDate)}</span></div></div><div class="li-right" onclick="event.stopPropagation()"><button class="btn btn-sm" onclick="editItem('mentor',${m.id})">✏️ Tahrirlash</button><button class="btn btn-sm btn-del-outline" onclick="delItem('mentor',${m.id})">🗑 O'chirish</button></div></div>`;
  }).join('');
}

// ===================== RENDER STUDENTS =====================
function renderStudents(){
  const q=(document.getElementById('s-student').value||'').toLowerCase();
  const sf=document.getElementById('filter-student-status').value;
  const df=document.getElementById('filter-student-debt').value;
  const cf=document.getElementById('filter-student-course')?.value||'';
  let items=D.students.filter(s=>{
    const gl=groupLabel(s.groupId).toLowerCase();
    const mQ=!q||s.name.toLowerCase().includes(q)||gl.includes(q)||(s.source||'').toLowerCase().includes(q);
    const mS=!sf||s.status===sf;const mD=df===''||(df==='1'&&s.isDebtor)||(df==='0'&&!s.isDebtor);
    const mC=!cf||studentCourse(s)===cf;return mQ&&mS&&mD&&mC;
  });
  items.sort((a,b)=>a.name.localeCompare(b.name));
  const el=document.getElementById('student-list');
  if(!items.length){el.innerHTML=`<div class="empty"><div class="empty-ic">🧑‍💻</div><div class="empty-txt">Talaba topilmadi</div></div>`;return;}
  const sb=s=>{const m={Aktiv:'b-teal',Faolsiz:'b-gray',Muzlatilgan:'b-blue',Probatsiya:'b-amber',Arxiv:'b-purple'};const ic={Aktiv:'✅',Faolsiz:'⛔',Muzlatilgan:'❄️',Probatsiya:'🔶',Arxiv:'📦'};return `<span class="badge ${m[s.status]||'b-gray'}">${ic[s.status]||''} ${s.status}</span>`;};
  el.innerHTML=items.map((s,i)=>`<div class="list-item" onclick="openDetailStudent(${s.id})"><div class="av ${AV_CLS[i%5]}">${ini(s.name)}</div><div class="li-info"><div class="li-name">${s.name}</div><div class="li-sub">📱 ${s.phone} · ${groupLabel(s.groupId)}</div><div class="li-tags">${sb(s)}<span class="badge ${s.isDebtor?'b-orange':'b-teal'}">${s.isDebtor?L==='ru'?'💸 Должник':L==='en'?'💸 Debtor':'💸 Qarzdor':'✅ To\'lagan'}</span><span class="badge b-purple">📍 ${s.source||'—'}</span><span class="badge b-blue">📅 ${fmtDate(s.joinDate)}</span></div></div><div class="li-right" onclick="event.stopPropagation()"><button class="btn btn-sm" onclick="editItem('student',${s.id})">✏️ Tahrirlash</button><button class="btn btn-sm btn-del-outline" onclick="delItem('student',${s.id})">🗑 O'chirish</button></div></div>`).join('');
}

// ===================== DASHBOARD =====================
let activeStatChip=null;
function renderDashboard(){
  const active=D.students.filter(s=>s.status==='Aktiv').length;
  const debtors=D.students.filter(s=>s.isDebtor).length;
  const archived=D.students.filter(s=>s.status==='Arxiv').length;
  const inactive=D.students.filter(s=>s.status==='Faolsiz').length;
  const now=new Date();const cm=now.getMonth(),cy=now.getFullYear();
  const txs=getFinanceForMonth(cm,cy);
  const monthIncome=txs.filter(tx=>tx.type==='income').reduce((s,tx)=>s+tx.amount,0);
  const monthExpense=txs.filter(tx=>tx.type==='expense'||tx.type==='salary').reduce((s,tx)=>s+tx.amount,0);
  const chips=[
    {key:'courses',val:D.courses.length,label:t('courses'),color:'var(--accent)'},
    {key:'groups',val:D.groups.length,label:t('groups'),color:'var(--teal)'},
    {key:'mentors',val:D.mentors.length,label:t('mentors'),color:'var(--purple)'},
    {key:'students',val:D.students.length,label:t('students'),color:'var(--teal-text)'},
    {key:'active',val:active,label:'Aktiv',color:'var(--teal-text)'},
    {key:'debtors',val:debtors,label:'Qarzdor',color:'var(--orange)'},
    {key:'archived',val:archived,label:'Arxiv',color:'var(--text3)'},
    {key:'inactive',val:inactive,label:'Faolsiz',color:'var(--amber-text)'},
    {key:'income',val:fmtMoney(monthIncome),label:'Bu oy kirim',color:'var(--teal-text)'},
    {key:'expense',val:fmtMoney(monthExpense),label:'Bu oy chiqim',color:'var(--orange-text)'},
  ];
  document.getElementById('dash-stats-row').innerHTML=chips.map(c=>`<div class="stat-chip ${activeStatChip===c.key?'active-chip':''}" onclick="showStatDetail('${c.key}')"><div class="sc-val" style="color:${c.color};${c.key==='income'||c.key==='expense'?'font-size:20px':''}">${c.val}</div><div class="sc-label">${c.label}</div></div>`).join('');
  if(activeStatChip)renderStatDetail(activeStatChip);
  const srcCount={};SOURCES.slice(1).forEach(s=>srcCount[s]=0);
  D.students.forEach(s=>{if(srcCount[s.source]!==undefined)srcCount[s.source]++;});
  const srcMax=Math.max(...Object.values(srcCount),1);
  const cols=['var(--accent)','var(--purple)','var(--teal)','var(--indigo)','var(--amber)','var(--teal)','var(--orange)'];
  const crsData=D.courses.map(c=>({name:c.name.split(' ')[0],count:D.students.filter(s=>studentCourse(s)===c.name).length}));
  const crsMax=Math.max(...crsData.map(c=>c.count),1);
  document.getElementById('dash-charts').innerHTML=`
    <div class="chart-box"><div class="chart-title">Manba bo'yicha talabalar</div>
      ${Object.entries(srcCount).map(([s,v],i)=>`<div class="bar-item"><div class="bar-label">${s}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round(v/srcMax*100)}%;background:${cols[i%cols.length]}"></div></div><div class="bar-val">${v}</div></div>`).join('')}
    </div>
    <div class="chart-box"><div class="chart-title">Kurs bo'yicha talabalar</div>
      ${crsData.map((c,i)=>`<div class="bar-item"><div class="bar-label">${c.name}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round(c.count/crsMax*100)}%;background:${cols[i%cols.length]}"></div></div><div class="bar-val">${c.count}</div></div>`).join('')}
    </div>`;
}
function showStatDetail(key){activeStatChip=activeStatChip===key?null:key;renderDashboard();}
function renderStatDetail(key){
  let html='',title='';
  if(key==='income'||key==='expense'){
    const now=new Date();const cm=now.getMonth();const cy=now.getFullYear();
    const txs=getFinanceForMonth(cm,cy).filter(tx=>key==='income'?tx.type==='income':(tx.type==='expense'||tx.type==='salary'));
    title=key==='income'?'Bu oy kirimi':'Bu oy chiqimi';
    html=txs.length?txs.map(tx=>`<div class="stat-list-item"><span style="font-size:18px">${tx.type==='income'?'💚':'🔴'}</span><span style="flex:1;font-weight:600">${tx.title}</span><span style="font-size:12px;color:var(--text2)">${fmtDateTime(tx.date)}</span><span class="badge ${tx.type==='income'?'b-teal':'b-orange'}">${fmtMoney(tx.amount)} so'm</span></div>`).join(''):`<div class="empty"><div class="empty-ic">💰</div><div class="empty-txt">Ma'lumot yo'q</div></div>`;
  }else if(key==='courses'){
    title=t('courses');
    html=D.courses.map((c,i)=>`<div class="stat-list-item"><span class="badge ${COURSE_COLORS[i%7]}">${c.name.split(' ')[0]}</span><span style="flex:1;font-weight:600">${c.name}</span><span style="font-size:12px;color:var(--text2)">${c.duration} · ${c.price} so'm</span><span class="badge ${c.status==='Faol'?'b-teal':'b-gray'}">${c.status}</span></div>`).join('');
  }else if(key==='groups'){
    title=t('groups');
    html=D.groups.map(g=>`<div class="stat-list-item" onclick="closeStatDetail();setTimeout(()=>showGroupStudents(${g.id}),100)" style="cursor:pointer"><span class="badge b-blue">${g.name}</span><span style="flex:1;font-weight:600">${g.course}</span><span style="font-size:12px;color:var(--text2)">${g.mentor}</span><span class="badge b-teal" style="margin-left:6px">👥 ${groupStudentCount(g.id)}</span><span class="badge ${g.status==='Faol'?'b-teal':'b-gray'}" style="margin-left:6px">${g.status}</span></div>`).join('');
  }else if(key==='mentors'){
    title=t('mentors');
    html=D.mentors.map((m,i)=>`<div class="stat-list-item">${mentorAvatarHtml(m,i,'sm')}<span style="flex:1;font-weight:600">${m.name}</span><span style="font-size:12px;color:var(--text2)">${m.phone}</span><span class="badge b-purple" style="margin-left:8px">${m.subject}</span></div>`).join('');
  }else{
    const titleMap={students:t('students'),active:'Aktiv talabalar',debtors:'Qarzdorlar',archived:'Arxiv',inactive:'Faolsizlar'};
    title=titleMap[key];
    let items=D.students;
    if(key==='active')items=items.filter(s=>s.status==='Aktiv');
    else if(key==='debtors')items=items.filter(s=>s.isDebtor);
    else if(key==='archived')items=items.filter(s=>s.status==='Arxiv');
    else if(key==='inactive')items=items.filter(s=>s.status==='Faolsiz');
    const sb=s=>{const m={Aktiv:'b-teal',Faolsiz:'b-gray',Muzlatilgan:'b-blue',Probatsiya:'b-amber',Arxiv:'b-purple'};return `<span class="badge ${m[s.status]||'b-gray'}">${s.status}</span>`;};
    html=items.map((s,i)=>`<div class="stat-list-item" onclick="closeStatDetail();goStudentDetail(${s.id})" style="cursor:pointer"><div class="av ${AV_CLS[i%5]}" style="width:32px;height:32px;font-size:11px">${ini(s.name)}</div><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px">${s.name}</div><div style="font-size:11px;color:var(--text2)">${s.phone} · ${groupLabel(s.groupId)}</div></div>${sb(s)}<span class="badge ${s.isDebtor?'b-orange':'b-teal'}" style="margin-left:6px">${s.isDebtor?L==='ru'?'💸 Должник':L==='en'?'💸 Debtor':'💸 Qarzdor':'✅ To\'lagan'}</span></div>`).join('');
    if(!items.length)html=`<div class="empty"><div class="empty-ic">🧑‍💻</div><div class="empty-txt">Ma'lumot yo'q</div></div>`;
  }
  document.getElementById('dash-detail-area').innerHTML=`<div class="dash-detail-box"><div class="dash-detail-title">${title}</div><div class="list-box" style="box-shadow:none;border:none">${html}</div></div>`;
}
function closeStatDetail(){activeStatChip=null;document.getElementById('dash-detail-area').innerHTML='';}
function goStudentDetail(id){go('students',document.getElementById('nav-students'));setTimeout(()=>openDetailStudent(id),100);}

// ===================== MENTOR DETAIL =====================
function openDetailMentor(id){
  const m=D.mentors.find(x=>x.id===id);if(!m)return;
  const groups=D.groups.filter(g=>g.mentor===m.name);
  const students=D.students.filter(s=>groups.some(g=>g.id===s.groupId));
  const frozen=groups.filter(g=>g.status!=='Faol').length;
  const idx=D.mentors.indexOf(m);
  document.getElementById('detail-title').textContent='🎓 Mentor profili';
  document.getElementById('detail-foot').innerHTML=`<button class="btn" onclick="closeDetail()">${L==='ru'?'Закрыть':L==='en'?'Close':'Yopish'}</button><button class="btn btn-primary" onclick="closeDetail();editItem('mentor',${id})">✏️ Tahrirlash</button>`;
  const photoSrc=mentorPhotoSrc(m);
  let profileAvatarHtml=photoSrc?`<img class="av-photo-lg" src="${photoSrc}" alt="${m.name}" onclick="openLightbox('${photoSrc}')" style="cursor:zoom-in">`:`<div class="detail-av ${AV_CLS[idx%5]}" style="font-size:24px;width:68px;height:68px;border-radius:50%">${ini(m.name)}</div>`;
  let fileHtml='';
  if(m.resumeFile){
    const isImg=m.resumeFile.type&&m.resumeFile.type.startsWith('image/');
    // FIX #4: Clicking file/image opens lightbox (large view) for images, download for files
    if(isImg){
      const imgSrc=`data:${m.resumeFile.type};base64,${m.resumeFile.data}`;
      fileHtml=`<div class="detail-groups" style="margin-top:12px"><div class="dg-title">🖼 Yuklangan rasm</div><img src="${imgSrc}" class="detail-resume-img" onclick="openLightbox('${imgSrc}')" style="cursor:zoom-in;transition:transform .2s" onmouseover="this.style.transform='scale(1.01)'" onmouseout="this.style.transform='scale(1)'"><div style="font-size:11px;color:var(--text3);margin-top:6px;text-align:center">🔍 Rasmni kattalashtirish uchun bosing</div></div>`;
    } else {
      fileHtml=`<div class="detail-groups" style="margin-top:12px"><div class="dg-title">📎 Yuklangan fayl</div><div class="file-preview" style="cursor:pointer" onclick="downloadBase64('${m.resumeFile.data}','${m.resumeFile.name}','${m.resumeFile.type}')"><span style="font-size:20px">📄</span><span class="file-preview-name">${m.resumeFile.name}</span><span class="badge b-blue">⬇ Yuklab olish</span></div></div>`;
    }
  }
  const groupsHtml=groups.length?`<div class="detail-groups"><div class="dg-title">Guruhlar (${groups.length})</div>${groups.map(g=>{const sc=D.students.filter(s=>s.groupId===g.id).length;return `<div class="dg-item" onclick="closeDetail();_attMonth=null;setTimeout(()=>showGroupStudents(${g.id}),150)" style="cursor:pointer" onmouseover="this.style.background='var(--accent-light)'" onmouseout="this.style.background='var(--bg3)'"><span><b>${g.name}</b> <span style="color:var(--text2)">· ${g.course}</span></span><div style="display:flex;gap:6px"><span class="badge b-blue">👥 ${sc} ta</span><span class="badge b-teal">📋 Davomat →</span><span class="badge ${g.status==='Faol'?'b-teal':'b-gray'}">${g.status}</span></div></div>`;}).join('')}</div>`:'';
  document.getElementById('detail-body').innerHTML=`<div class="detail-profile">${profileAvatarHtml}<div><div class="detail-name">${m.name}</div><div class="detail-role">${m.subject}${m.experience?' · '+m.experience:''}</div><div class="detail-id">Qo'shilgan: ${fmtDate(m.joinDate)}</div></div></div><div class="detail-stats"><div class="detail-stat"><div class="ds-val" style="color:var(--accent)">${groups.length}</div><div class="ds-label">Guruhlar</div></div><div class="detail-stat"><div class="ds-val" style="color:var(--teal-text)">${students.length}</div><div class="ds-label">Talabalar</div></div><div class="detail-stat"><div class="ds-val" style="color:var(--purple)">0</div><div class="ds-label">Bitiruvchi</div></div><div class="detail-stat"><div class="ds-val" style="color:var(--amber-text)">${frozen}</div><div class="ds-label">Muzlatilgan</div></div></div><div class="detail-fields"><div class="df-item"><div class="df-label">📱 Telefon</div><div class="df-val">${m.phone||'—'}</div></div><div class="df-item"><div class="df-label">📧 Email</div><div class="df-val">${m.email||'—'}</div></div><div class="df-item"><div class="df-label">✈️ Telegram</div><div class="df-val">${m.telegram||'—'}</div></div><div class="df-item"><div class="df-label">📍 Yashash joyi</div><div class="df-val">${m.address||'—'}</div></div></div>${m.resume?`<div class="detail-groups" style="margin-top:12px"><div class="dg-title">📄 Bio / Rezyume</div><div class="history-box">${m.resume}</div></div>`:''}${fileHtml}${groupsHtml}`;
  document.getElementById('detail-overlay').classList.add('open');
}
function downloadBase64(data,name,type){const a=document.createElement('a');a.href=`data:${type};base64,${data}`;a.download=name;a.click();}
function formatBytes(b){if(!b)return '—';if(b<1024)return b+'B';if(b<1048576)return Math.round(b/1024)+'KB';return (b/1048576).toFixed(1)+'MB';}

// ===================== STUDENT DETAIL =====================
let _currentDetailStudentId=null;
function openDetailStudent(id){
  _currentDetailStudentId=id;
  const s=D.students.find(x=>x.id===id);if(!s)return;
  const idx=D.students.indexOf(s);
  const grp=D.groups.find(x=>x.id===s.groupId);
  const mentorName=grp?grp.mentor:null;
  const coursePrice=grp?getCoursePrice(grp.course):0;
  const lessonPrice=coursePrice>0?Math.round(coursePrice/LESSON_COUNT):0;
  const sm={Aktiv:'b-teal',Faolsiz:'b-gray',Muzlatilgan:'b-blue',Probatsiya:'b-amber',Arxiv:'b-purple'};
  const si={Aktiv:'✅',Faolsiz:'⛔',Muzlatilgan:'❄️',Probatsiya:'🔶',Arxiv:'📦'};
  document.getElementById('detail-title').textContent='🧑‍💻 Talaba profili';
  const footHtml=s.isDebtor
    ?`<button class="btn" onclick="closeDetail()">${L==='ru'?'Закрыть':L==='en'?'Close':'Yopish'}</button><button class="btn btn-pay-green" onclick="markStudentPaid(${id})">✅ To'landi</button><button class="btn btn-primary" onclick="closeDetail();editItem('student',${id})">✏️ Tahrirlash</button>`
    :`<button class="btn" onclick="closeDetail()">${L==='ru'?'Закрыть':L==='en'?'Close':'Yopish'}</button><button class="btn btn-primary" onclick="closeDetail();editItem('student',${id})">✏️ Tahrirlash</button>`;
  document.getElementById('detail-foot').innerHTML=footHtml;
  const monthData=grp?calcStudentAllMonthsDebt(s.id,s.groupId):[];
  let totalPresent=0,totalAbsent=0,totalExcused=0,totalKY=0,totalToPay=0;
  monthData.forEach(m=>{totalPresent+=m.present;totalAbsent+=m.absent;totalExcused+=m.excused;totalKY+=m.kPlusY;totalToPay+=m.toPay;});
  let debtHtml='';
  if(grp&&coursePrice>0){
    const monthRows=monthData.map(m=>{
      const pct=m.marked>0?Math.round(m.present/m.marked*100):0;
      const rowAccent=m.isFullMonth?'pay-row-full':m.kPlusY>0?'pay-row-partial':'pay-row-empty';
      return `<div class="pay-month-card ${rowAccent}"><div class="pay-mc-top"><span class="pay-mc-month">📅 ${m.label}</span>${m.isFullMonth?`<span class="pay-badge-debtor">💸 Qarzdor</span>`:''}<span class="pay-mc-pct" style="color:${pct>=80?'var(--teal-text)':pct>=50?'var(--amber-text)':'var(--orange-text)'}">${pct}%</span></div><div class="pay-mc-pills"><span class="pay-pill-k">✅ K: <b>${m.present}</b></span><span class="pay-pill-y">⚠️ Y: <b>${m.absent}</b></span><span class="pay-pill-s">💬 S: <b>${m.excused}</b></span><span class="pay-pill-info">📚 ${m.marked}/${LESSON_COUNT}</span></div><div class="pay-mc-calc"><div class="pay-mc-formula"><span class="pay-formula-chip pay-fc-ky">${m.kPlusY} dars (K+Y)</span><span style="font-size:13px;color:var(--text3)">×</span><span class="pay-formula-chip pay-fc-price">${fmtMoney(m.lessonPrice)} so'm</span><span style="font-size:13px;color:var(--text3)">=</span><span class="pay-formula-chip pay-fc-total" style="color:${m.toPay>0?'var(--orange-text)':'var(--teal-text)'}">💰 ${fmtMoney(m.toPay)} so'm</span></div></div></div>`;
    }).join('');
    debtHtml=`<div class="pay-block"><div class="pay-header"><div class="pay-header-left"><div class="pay-header-title">💰 To'lov hisobi</div><div class="pay-header-status ${s.isDebtor?'pay-status-debtor':'pay-status-paid'}">${s.isDebtor?L==='ru'?'💸 Должник':L==='en'?'💸 Debtor':'💸 Qarzdor':'✅ To\'lagan'}</div></div><div class="pay-header-rule"><div class="pay-rule-item">📚 ${LESSON_COUNT} dars/oy</div><div class="pay-rule-item">💵 ${fmtMoney(lessonPrice)} so'm/dars</div></div></div><div class="pay-formula-explain"><div class="pfe-item pfe-k"><div class="pfe-icon">✅</div><div><div class="pfe-title">K — Keldi</div><div class="pfe-desc">Yechiladi</div></div></div><div class="pfe-item pfe-y"><div class="pfe-icon">⚠️</div><div><div class="pfe-title">Y — Yo'q</div><div class="pfe-desc">Yechiladi</div></div></div><div class="pfe-item pfe-s"><div class="pfe-icon">💬</div><div><div class="pfe-title">S — Sababli</div><div class="pfe-desc">Yechilmaydi</div></div></div><div class="pfe-item pfe-full"><div class="pfe-icon">💸</div><div><div class="pfe-title">12 dars = Qarzdor</div><div class="pfe-desc">Probatsiya</div></div></div></div>${monthData.length>0?`<div class="pay-total-stats"><div class="pay-ts-item pay-ts-k"><div class="pay-ts-num">${totalPresent}</div><div class="pay-ts-lbl">✅ Keldi</div></div><div class="pay-ts-item pay-ts-y"><div class="pay-ts-num">${totalAbsent}</div><div class="pay-ts-lbl">⚠️ Yo'q</div></div><div class="pay-ts-item pay-ts-s"><div class="pay-ts-num">${totalExcused}</div><div class="pay-ts-lbl">💬 Sababli</div></div><div class="pay-ts-item pay-ts-ky"><div class="pay-ts-num">${totalKY}</div><div class="pay-ts-lbl">📚 To'lanadigan</div></div></div>`:''}<div class="pay-info-grid"><div class="pay-info-item"><div class="pay-info-lbl">🎓 Mentor</div><div class="pay-info-val">${mentorName||'—'}</div></div><div class="pay-info-item pay-info-accent"><div class="pay-info-lbl">👥 Guruh</div><div class="pay-info-val">${grp.name}</div></div><div class="pay-info-item pay-info-teal"><div class="pay-info-lbl">💰 Oylik</div><div class="pay-info-val">${fmtMoney(coursePrice)} so'm</div></div></div><div class="pay-months-wrap">${monthData.length===0?`<div class="pay-nodata">Hali davomat kiritilmagan</div>`:monthRows}</div>${monthData.length>0?`<div class="pay-summary-bar"><span>Jami (K+Y): <b style="color:var(--text)">${totalKY} dars</b></span><span>To'lash kerak: <b style="color:var(--orange-text)">${fmtMoney(totalToPay)} so'm</b></span></div>`:''} ${s.isDebtor?`<button class="pay-main-btn" onclick="markStudentPaid(${id})">✅ To'landi — Qarzdorlikni yopish</button>`:''}</div>`;
  }
  document.getElementById('detail-body').innerHTML=`<div class="detail-profile"><div class="detail-av ${AV_CLS[idx%5]}" style="font-size:24px;width:68px;height:68px">${ini(s.name)}</div><div><div class="detail-name">${s.name}</div><div class="detail-role">${grp?grp.name+' — '+grp.course:'—'}</div><div class="detail-id">${generateStudentId(s.id)}</div><div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><span class="badge ${sm[s.status]||'b-gray'}">${si[s.status]||''} ${s.status}</span><span class="badge ${s.isDebtor?'b-orange':'b-teal'}">${s.isDebtor?L==='ru'?'💸 Должник':L==='en'?'💸 Debtor':'💸 Qarzdor':'✅ To\'lagan'}</span></div></div></div><div class="detail-fields"><div class="df-item"><div class="df-label">📱 Telefon</div><div class="df-val">${s.phone||'—'}</div></div><div class="df-item"><div class="df-label">🎂 Tug'ilgan</div><div class="df-val">${s.birthDate?fmtDate(s.birthDate):'—'}</div></div><div class="df-item"><div class="df-label">👨‍👩‍👦 Ota-onasi</div><div class="df-val">${s.parentName||'—'}</div></div><div class="df-item"><div class="df-label">📞 Ota-ona tel</div><div class="df-val">${s.parentPhone||'—'}</div></div><div class="df-item"><div class="df-label">📍 Manba</div><div class="df-val">${s.source||'—'}</div></div><div class="df-item"><div class="df-label">📅 Qo'shilgan</div><div class="df-val">${fmtDate(s.joinDate)}</div></div>${grp?`<div class="df-item"><div class="df-label">👥 Guruh</div><div class="df-val">${grp.name}</div></div><div class="df-item"><div class="df-label">🎓 Mentor</div><div class="df-val">${grp.mentor||'—'}</div></div>`:''}</div>${debtHtml}<div class="detail-groups" style="margin-top:12px"><div class="dg-title">📋 Izohlar</div><div class="history-box">${s.notes||'Hozircha izoh yo\'q.'}</div></div>`;
  document.getElementById('detail-overlay').classList.add('open');
}
function closeDetail(){document.getElementById('detail-overlay').classList.remove('open');}
function closeStatModal(){document.getElementById('stat-overlay').classList.remove('open');_attGid=null;_attMonth=null;_attYear=null;}

// ===================== FORMS =====================
function setupFileUpload(){
  const dz=document.getElementById('resume-drop');const fi=document.getElementById('resume-file-input');if(!dz||!fi)return;
  dz.addEventListener('click',()=>fi.click());
  dz.addEventListener('dragover',e=>{e.preventDefault();dz.style.borderColor='var(--accent)';});
  dz.addEventListener('dragleave',()=>{dz.style.borderColor='';});
  dz.addEventListener('drop',e=>{e.preventDefault();dz.style.borderColor='';handleFile(e.dataTransfer.files[0]);});
  fi.addEventListener('change',()=>handleFile(fi.files[0]));
  const pi=document.getElementById('mentor-photo-input');if(!pi)return;
  pi.addEventListener('change',()=>handlePhotoFile(pi.files[0]));
}
function handleFile(file){
  if(!file)return;if(file.size>5*1024*1024){alert("Fayl 5MB dan kichik bo'lishi kerak!");return;}
  const reader=new FileReader();
  reader.onload=e=>{const b64=e.target.result.split(',')[1];_uploadedFile={name:file.name,type:file.type,size:file.size,data:b64};renderFilePreview();};
  reader.readAsDataURL(file);
}
function handlePhotoFile(file){
  if(!file)return;if(!file.type.startsWith('image/')){alert("Faqat rasm fayli!");return;}
  if(file.size>5*1024*1024){alert("Rasm 5MB dan kichik bo'lishi kerak!");return;}
  const reader=new FileReader();
  reader.onload=e=>{const b64=e.target.result.split(',')[1];_uploadedPhoto={name:file.name,type:file.type,size:file.size,data:b64};renderPhotoPreview();};
  reader.readAsDataURL(file);
}
function renderPhotoPreview(){
  const wrap=document.getElementById('mentor-photo-preview-wrap');if(!wrap)return;
  if(_uploadedPhoto){
    const src=`data:${_uploadedPhoto.type};base64,${_uploadedPhoto.data}`;
    wrap.innerHTML=`<div class="mentor-photo-upload" style="border-style:solid;border-color:var(--accent)"><div class="mentor-photo-preview"><img src="${src}" alt="preview"></div><div class="mentor-photo-info"><p>✅ ${_uploadedPhoto.name}</p><span>${formatBytes(_uploadedPhoto.size)}</span></div><div style="display:flex;flex-direction:column;gap:6px"><button type="button" class="mentor-photo-btn" onclick="openLightbox('${src}')">🔍 Ko'rish</button><button type="button" class="mentor-photo-btn" style="border-color:var(--orange);color:var(--orange-text);background:var(--orange-light)" onclick="removePhoto()">✕ O'chirish</button></div></div><input type="file" id="mentor-photo-input" accept="image/*" style="display:none">`;
    const pi=document.getElementById('mentor-photo-input');if(pi)pi.addEventListener('change',()=>handlePhotoFile(pi.files[0]));
  }else{
    wrap.innerHTML=`<div class="mentor-photo-upload" onclick="document.getElementById('mentor-photo-input').click()" style="cursor:pointer"><div class="mentor-photo-preview">📷</div><div class="mentor-photo-info"><p>Rasm yuklash uchun bosing</p><span>JPG, PNG, WEBP · Max 5MB</span></div><button type="button" class="mentor-photo-btn">+ Rasm</button></div><input type="file" id="mentor-photo-input" accept="image/*" style="display:none">`;
    const pi=document.getElementById('mentor-photo-input');if(pi)pi.addEventListener('change',()=>handlePhotoFile(pi.files[0]));
  }
}
function removePhoto(){_uploadedPhoto=null;renderPhotoPreview();}
function renderFilePreview(){
  const prev=document.getElementById('file-preview-area');if(!prev)return;
  if(_uploadedFile){
    const isImg=_uploadedFile.type&&_uploadedFile.type.startsWith('image/');
    prev.innerHTML=`<div class="file-preview"><span style="font-size:18px">${isImg?'🖼':'📄'}</span><span class="file-preview-name">${_uploadedFile.name}</span><span class="file-preview-size">${formatBytes(_uploadedFile.size)}</span><button class="file-remove" onclick="removeFile()">✕</button></div>`;
  }else{prev.innerHTML='';}
}
function removeFile(){_uploadedFile=null;const fi=document.getElementById('resume-file-input');if(fi)fi.value='';renderFilePreview();}
function validateRequired(fields){
  let ok=true;
  fields.forEach(f=>{
    const el=document.getElementById(f.id);if(!el)return;
    const val=(el.tagName==='SELECT'?el.value:(el.value||'')).trim();
    if(!val){
      el.classList.add('field-error');ok=false;
      el.addEventListener('input',function rem(){el.classList.remove('field-error');el.removeEventListener('input',rem);},{once:true});
      el.addEventListener('change',function rem(){el.classList.remove('field-error');el.removeEventListener('change',rem);},{once:true});
    }else{el.classList.remove('field-error');}
  });
  return ok;
}

function formCourse(d={}){
  return `<div class="fg"><label>Kurs nomi <span class="req">*</span></label><input id="f-name" value="${d.name||''}" placeholder="Masalan: Frontend Development"></div><div class="form-row"><div class="fg"><label>Davomiyligi <span class="req">*</span></label><input id="f-dur" value="${d.duration||''}" placeholder="11 oy"></div><div class="fg"><label>Narxi (so'm/oy) <span class="req">*</span></label><input id="f-price" value="${d.price||''}" placeholder="1 200 000"></div></div><div class="fg" style="background:var(--accent-light);border-radius:var(--r-md);padding:10px 12px;font-size:12px;color:var(--accent-text)">💡 1 dars narxi = oylik narx ÷ ${LESSON_COUNT} · K/Y yechiladi · S yechilmaydi · 12 dars = Qarzdor</div><div class="fg"><label>Holat</label><select id="f-status"><option ${(!d.status||d.status==='Faol')?'selected':''}>Faol</option><option ${d.status==='Arxiv'?'selected':''}>Arxiv</option></select></div>`;
}
function formGroup(d={}){
  const firstCourse=d.course||(D.courses[0]?.name||'');
  const suggestedName=d.name||autoGroupName(firstCourse);
  const dur=getCourseDuration(firstCourse);
  const today=todayStr();
  return `<div class="conflict-warn" id="room-conflict-warn"></div><div class="form-row"><div class="fg"><label>Guruh nomi <span class="req">*</span></label><input id="f-name" value="${suggestedName}" placeholder="FE-1"></div><div class="fg"><label>Holat</label><select id="f-status"><option ${(!d.status||d.status==='Faol')?'selected':''}>Faol</option><option ${d.status==='Arxiv'?'selected':''}>Arxiv</option><option ${d.status==='Man etilgan'?'selected':''}>Man etilgan</option></select></div></div><div class="fg"><label>Kurs <span class="req">*</span></label><select id="f-course" onchange="updateGroupNameFromCourse(${d.id||0});updateGroupDuration()"><option value="">Barcha kurslar</option>${D.courses.map(c=>`<option value="${c.name}" ${(d.course||firstCourse)===c.name?'selected':''}>${c.name}</option>`).join('')}</select></div><div class="fg"><label>Mentor <span class="req">*</span></label><select id="f-mentor">${D.mentors.map(m=>`<option ${d.mentor===m.name?'selected':''}>${m.name}</option>`).join('')}</select></div><div class="fg"><label>📆 Kurs davomiyligi (avtomatik)</label><input id="f-dur-display" value="${dur}" readonly style="background:var(--bg3);cursor:default;opacity:.75"></div><div class="section-divider">Jadval</div><div class="form-row"><div class="fg"><label>Boshlanish sanasi <span class="req">*</span></label><input type="date" id="f-start" value="${d.startDate||today}"></div></div><div class="form-row3"><div class="fg"><label>🚪 Xona raqami</label><input id="f-room" value="${d.room||''}" placeholder="12" oninput="liveCheckConflict(${d.id||0})"></div><div class="fg"><label>⏰ Boshlanish vaqti</label><input type="time" id="f-timestart" value="${d.timeStart||'09:00'}" onchange="liveCheckConflict(${d.id||0})"></div><div class="fg"><label>⏰ Tugash vaqti</label><input type="time" id="f-timeend" value="${d.timeEnd||'11:00'}" onchange="liveCheckConflict(${d.id||0})"></div></div><div class="fg"><label>Dars kunlari</label><div class="days-pick">${DAYS.map((day,i)=>`<input class="day-cb" type="checkbox" id="d${i}" value="${day}" ${(d.days||[]).includes(day)?'checked':''}><label class="day-lb" for="d${i}">${day}</label>`).join('')}</div></div>`;
}
function updateGroupNameFromCourse(editId){const sel=document.getElementById('f-course');if(!sel||editId)return;const ni=document.getElementById('f-name');if(ni)ni.value=autoGroupName(sel.value);updateGroupDuration();}
function updateGroupDuration(){const sel=document.getElementById('f-course');if(!sel)return;const di=document.getElementById('f-dur-display');if(di)di.value=getCourseDuration(sel.value)||'—';}
function formMentor(d={}){
  _uploadedFile=d.resumeFile?{...d.resumeFile}:null;_uploadedPhoto=d.photo?{...d.photo}:null;
  return `<div class="section-divider" style="padding-top:0;margin-top:0">📸 Mentor rasmi</div><div id="mentor-photo-preview-wrap"></div><div class="fg"><label>Ism Familiya <span class="req">*</span></label><input id="f-name" value="${d.name||''}" placeholder="Alisher Karimov"></div><div class="form-row"><div class="fg"><label>Telefon <span class="req">*</span></label><input id="f-phone" value="${d.phone||''}" placeholder="+998 90 111 22 33" oninput="phoneOnlyDigits(this)" inputmode="numeric"></div><div class="fg"><label>Yoshi <span class="req">*</span></label><input id="f-age" value="${d.age||''}" placeholder="27" type="number" min="18" max="70"></div></div><div class="form-row"><div class="fg"><label>Yo'nalish <span class="req">*</span></label><select id="f-subj">${SUBJECTS.map(s=>`<option value="${s}" ${(d.subject||'')===s?'selected':''}>${s}</option>`).join('')}</select></div><div class="fg"><label>Tajriba <span class="req">*</span></label><input id="f-exp" value="${d.experience||''}" placeholder="2 yil"></div></div><div class="section-divider">Aloqa</div><div class="form-row"><div class="fg"><label>Email <span class="req">*</span></label><input id="f-email" value="${d.email||''}" placeholder="email@edu.uz" type="email"></div><div class="fg"><label>Telegram <span class="req">*</span></label><input id="f-tg" value="${d.telegram||''}" placeholder="@username"></div></div><div class="fg"><label>Yashash joyi <span class="req">*</span></label><input id="f-addr" value="${d.address||''}" placeholder="Toshkent, Yunusobod"></div><div class="fg"><label>Ishga kirgan sana <span class="req">*</span></label><input type="date" id="f-join" value="${d.joinDate||todayStr()}"></div><div class="fg"><label>Bio / Matn rezyume <span class="req">*</span></label><textarea id="f-resume" rows="2" placeholder="Mentor haqida qisqacha...">${d.resume||''}</textarea></div><div class="section-divider">📎 Rezyume fayl (PDF yoki rasm)</div><div class="fg"><div class="file-drop" id="resume-drop"><input type="file" id="resume-file-input" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"><div class="file-drop-ic">📂</div><div class="file-drop-txt">Faylni bu yerga tashlang yoki bosing<br><span style="font-size:11px;color:var(--text3)">PDF, JPG, PNG, DOC · Max 5MB</span></div></div><div id="file-preview-area"></div></div>`;
}
function formStudent(d={}){
  if(!D.groups.length)return `<div class="del-warning">⚠️ Avval guruh qo'shing!</div>`;
  const groupOpts=D.groups.map(g=>`<option value="${g.id}" ${d.groupId===g.id?'selected':''}>${g.name} — ${g.course} (${fmtDate(g.startDate)})</option>`).join('');
  const srcOpts=SOURCES.map(s=>`<option value="${s}" ${(d.source||SOURCES[0])===s?'selected':''}>${s}</option>`).join('');
  const existFirst=d.firstName||(d.name?(d.name.split(' ')[0]||''):'');
  const existLast=d.lastName||(d.name?(d.name.split(' ').slice(1).join(' ')||''):'');
  return `<div class="modal-section-label">👤 Shaxsiy ma'lumot</div><div class="form-row"><div class="fg"><label>Ism <span class="req">*</span></label><input id="f-firstname" value="${existFirst}" placeholder="Jasur"></div><div class="fg"><label>Familiya <span class="req">*</span></label><input id="f-lastname" value="${existLast}" placeholder="Mirzayev"></div></div><div class="form-row"><div class="fg"><label>📱 Tel raqami <span class="req">*</span></label><input id="f-phone" value="${d.phone||''}" placeholder="+998 90 123 45 67" oninput="phoneOnlyDigits(this)" inputmode="numeric"></div><div class="fg"><label>🎂 Tug'ilgan sana <span class="req">*</span></label><input type="date" id="f-birth" value="${d.birthDate||''}"></div></div><div class="fg"><label>👥 Guruh <span class="req">*</span></label><select id="f-group">${groupOpts}</select></div><div class="modal-section-label">👨‍👩‍👦 Ota-ona</div><div class="form-row"><div class="fg"><label>Ota-ona ismi</label><input id="f-parent" value="${d.parentName||''}" placeholder="Kamoliddin Mirzayev"></div><div class="fg"><label>📞 Ota-ona tel raqami</label><input id="f-pphone" value="${d.parentPhone||''}" placeholder="+998 90 000 00 00" oninput="phoneOnlyDigits(this)" inputmode="numeric"></div></div><div class="modal-section-label">⚙️ Holat va manba</div><div class="form-row"><div class="fg"><label>Faollik holati</label><select id="f-status"><option value="Aktiv" ${(!d.status||d.status==='Aktiv')?'selected':''}>✅ Aktiv</option><option value="Faolsiz" ${d.status==='Faolsiz'?'selected':''}>⛔ Faolsiz</option><option value="Muzlatilgan" ${d.status==='Muzlatilgan'?'selected':''}>❄️ Muzlatilgan</option><option value="Probatsiya" ${d.status==='Probatsiya'?'selected':''}>🔶 Probatsiya</option><option value="Arxiv" ${d.status==='Arxiv'?'selected':''}>📦 Arxiv</option></select></div><div class="fg"><label>To'lov holati</label><select id="f-debt"><option value="0" ${!d.isDebtor?'selected':''}>✅ To'lagan</option><option value="1" ${d.isDebtor?'selected':''}>💸 Qarzdor</option></select></div></div><div class="form-row"><div class="fg"><label>📍 Manba</label><select id="f-src">${srcOpts}</select></div><div class="fg"><label>📅 Qo'shilgan sana</label><input type="date" id="f-join" value="${d.joinDate||todayStr()}"></div></div><div class="fg"><label>💬 Izohlar</label><textarea id="f-notes" rows="3" placeholder="Talaba haqida izoh...">${d.notes||''}</textarea></div>`;
}

let _modalType=null,_editId=null;
function openModal(type,data={}){
  _modalType=type;_editId=data.id||null;
  const isEdit=!!data.id;
  const titles={
    course:isEdit?'Kursni tahrirlash':'Yangi kurs',
    group:isEdit?'Guruhni tahrirlash':'Yangi guruh',
    mentor:isEdit?'Mentorni tahrirlash':'Yangi mentor',
    student:isEdit?'Talabani tahrirlash':'Yangi talaba'
  };
  document.getElementById('m-title').textContent=titles[type];
  const fns={course:formCourse,group:formGroup,mentor:formMentor,student:formStudent};
  document.getElementById('m-body').innerHTML=fns[type](data);
  document.getElementById('overlay').classList.add('open');
  if(type==='mentor'){setTimeout(()=>{setupFileUpload();renderFilePreview();renderPhotoPreview();},80);}
  if(type==='group'&&data.id){setTimeout(()=>liveCheckConflict(data.id),80);}
  setTimeout(()=>document.getElementById('f-name')?.focus(),120);
}
function closeModal(){document.getElementById('overlay').classList.remove('open');_uploadedFile=null;_uploadedPhoto=null;}
function saveModal(){
  const type=_modalType,isEdit=!!_editId;
  let req=[];
  if(type==='course')req=[{id:'f-name'},{id:'f-dur'},{id:'f-price'}];
  else if(type==='group')req=[{id:'f-name'},{id:'f-course'},{id:'f-start'}];
  else if(type==='mentor')req=[{id:'f-name'},{id:'f-phone'},{id:'f-age'},{id:'f-subj'},{id:'f-exp'},{id:'f-email'},{id:'f-tg'},{id:'f-addr'},{id:'f-join'},{id:'f-resume'}];
  else if(type==='student')req=[{id:'f-firstname'},{id:'f-lastname'},{id:'f-phone'},{id:'f-group'}];
  if(!validateRequired(req)){toast('⚠️ Majburiy maydonlarni to\'ldiring!');return;}
  const nameEl=document.getElementById('f-name');const name=nameEl?nameEl.value.trim():'';
  if(type==='group'){
    const ts=document.getElementById('f-timestart').value||'';const te=document.getElementById('f-timeend').value||'';const room=(document.getElementById('f-room').value||'').trim();
    if(ts&&te&&timeToMin(te)<=timeToMin(ts)){toast('⚠️ Tugash vaqti boshlanish vaqtidan katta bo\'lishi kerak!');return;}
    if(room&&ts&&te){const conflict=checkRoomConflict(room,ts,te,isEdit?_editId:null);if(conflict){toast('🚫 Xona band!');return;}}
    const days=DAYS.filter((_,i)=>document.getElementById('d'+i)?.checked);
    const d={name,course:document.getElementById('f-course').value,mentor:document.getElementById('f-mentor').value,status:'Faol',startDate:document.getElementById('f-start').value,days,room,timeStart:ts,timeEnd:te};
    if(isEdit)Object.assign(D.groups.find(x=>x.id===_editId),d);else{d.id=newId();D.groups.push(d);}
    updateGroupFilters();renderGroups();closeModal();saveData();updateCounts();
    if(document.getElementById('panel-dashboard').classList.contains('active'))renderDashboard();
    toast(isEdit?'✅ Yangilandi!':'✅ Qo\'shildi!');return;
  }
  if(type==='course'){
    const d={name,duration:document.getElementById('f-dur').value.trim(),price:document.getElementById('f-price').value.trim(),status:document.getElementById('f-status').value};
    if(isEdit)Object.assign(D.courses.find(x=>x.id===_editId),d);else{d.id=newId();D.courses.push(d);}
    updateGroupFilters();updateStudentCourseFilter();renderCourses();closeModal();saveData();updateCounts();
    if(document.getElementById('panel-dashboard').classList.contains('active'))renderDashboard();
    toast(isEdit?'✅ Yangilandi!':'✅ Qo\'shildi!');return;
  }
  if(type==='mentor'){
    const age=parseInt((document.getElementById('f-age').value||'0').trim());
    if(!age||age<18){toast('⚠️ Mentor yoshi 18 dan katta bo\'lishi kerak!');document.getElementById('f-age').focus();return;}
    const tg=(document.getElementById('f-tg').value||'').trim();
    if(!tg.startsWith('@')){toast('⚠️ Telegram username @ belgisi bilan boshlanishi kerak!');document.getElementById('f-tg').focus();return;}
    const d={name,phone:document.getElementById('f-phone').value.trim(),subject:document.getElementById('f-subj').value,experience:document.getElementById('f-exp').value.trim(),age:String(age),email:document.getElementById('f-email').value.trim(),telegram:tg,address:document.getElementById('f-addr').value.trim(),joinDate:document.getElementById('f-join').value,resume:document.getElementById('f-resume').value.trim(),resumeFile:_uploadedFile,photo:_uploadedPhoto};
    if(isEdit)Object.assign(D.mentors.find(x=>x.id===_editId),d);else{d.id=newId();D.mentors.push(d);}
    updateGroupFilters();renderMentors();closeModal();saveData();updateCounts();
    if(document.getElementById('panel-dashboard').classList.contains('active'))renderDashboard();
    toast(isEdit?'✅ Yangilandi!':'✅ Qo\'shildi!');return;
  }
  if(type==='student'){
    const birth=document.getElementById('f-birth').value||'';
    if(!birth){toast('⚠️ Tug\'ilgan sanani kiriting!');document.getElementById('f-birth').focus();return;}
    const firstName=(document.getElementById('f-firstname').value||'').trim();
    const lastName=(document.getElementById('f-lastname').value||'').trim();
    const fullName=firstName+(lastName?' '+lastName:'');
    const groupId=parseInt(document.getElementById('f-group').value);
    const d={firstName,lastName,name:fullName,phone:document.getElementById('f-phone').value.trim(),joinDate:document.getElementById('f-join').value,birthDate:birth,parentName:document.getElementById('f-parent').value.trim(),parentPhone:document.getElementById('f-pphone').value.trim(),groupId,status:document.getElementById('f-status').value,isDebtor:document.getElementById('f-debt').value==='1',source:document.getElementById('f-src').value,notes:document.getElementById('f-notes').value.trim()};
    if(isEdit)Object.assign(D.students.find(x=>x.id===_editId),d);else{d.id=newId();D.students.push(d);}
    renderStudents();renderGroups();renderCourses();closeModal();saveData();updateCounts();
    if(document.getElementById('panel-dashboard').classList.contains('active'))renderDashboard();
    toast(isEdit?'✅ Yangilandi!':'✅ Qo\'shildi!');return;
  }
}
function editItem(type,id){const map={course:D.courses,group:D.groups,mentor:D.mentors,student:D.students};openModal(type,map[type].find(x=>x.id===id));}
function delItem(type,id){
  const map={course:D.courses,group:D.groups,mentor:D.mentors,student:D.students};
  const item=map[type].find(x=>x.id===id);
  if(!item)return;
  const displayName=item.name||(item.firstName?(item.firstName+(item.lastName?' '+item.lastName:'')):'');
  showDelModal(displayName,()=>{
    const key={course:'courses',group:'groups',mentor:'mentors',student:'students'}[type];
    D[key]=D[key].filter(x=>x.id!==id);
    const rnds={course:renderCourses,group:renderGroups,mentor:renderMentors,student:renderStudents};
    rnds[type]();
    if(type==='student'||type==='group'){renderGroups();renderCourses();}
    if(type==='mentor')updateGroupFilters();
    saveData();updateCounts();
    if(document.getElementById('panel-dashboard').classList.contains('active'))renderDashboard();
    toast('\u{1F5D1} O\'chirildi');
  });
}
function showDelModal(name,cb){
  pendingDelName=name;pendingDelCb=cb;
  document.getElementById('del-target-name').textContent=name;
  document.getElementById('del-input').value='';
  const btn=document.getElementById('del-confirm-btn');
  btn.disabled=true;btn.style.opacity='.4';btn.style.cursor='not-allowed';
  document.getElementById('del-overlay').classList.add('open');
  setTimeout(()=>document.getElementById('del-input').focus(),120);
}
function closeDelModal(){document.getElementById('del-overlay').classList.remove('open');pendingDelCb=null;pendingDelName='';}
function checkDelInput(){
  const val=document.getElementById('del-input').value;
  const btn=document.getElementById('del-confirm-btn');const inp=document.getElementById('del-input');
  const match=val===pendingDelName;
  btn.disabled=!match;btn.style.opacity=match?'1':'.4';btn.style.cursor=match?'pointer':'not-allowed';
  inp.classList.toggle('valid',match&&val.length>0);
}
function executeDelete(){if(pendingDelCb)pendingDelCb();closeDelModal();}
function execDelCourse(id){D.courses=D.courses.filter(x=>x.id!==id);renderCourses();saveData();updateCounts();toast('🗑 O\'chirildi');}

function updateTopbar(tab){
  const L=LANG;
  const titles={
    dashboard:t('dashboard_title'),courses:t('courses_title'),groups:t('groups_title'),
    mentors:t('mentors_title'),students:t('students_title'),finance:t('finance_title'),settings:t('settings_title'),
    'mentor-dash': L==='ru'?'📊 Дашборд ментора':L==='en'?'📊 Mentor Dashboard':'📊 Mentor Dashboard',
    'mentors-my':  L==='ru'?'📅 Моё расписание':L==='en'?'📅 My Schedule':'📅 Mening jadvalim',
    'mentor-chat': L==='ru'?'💬 Чат со студентами':L==='en'?'💬 Student Chat':'💬 Talabalar bilan chat',
    'student-my':  L==='ru'?'🏠 Моя панель':L==='en'?'🏠 My Dashboard':'🏠 Dashboard',
    tests:         L==='ru'?'📝 Тесты':L==='en'?'📝 Tests':'📝 Testlar',
    grades:        L==='ru'?'🏅 Оценки':L==='en'?'🏅 Grades':'🏅 Baholash',
    'student-schedule': L==='ru'?'📅 Расписание':L==='en'?'📅 Schedule':'📅 Dars jadvali',
    'student-rating':   L==='ru'?'🏆 Рейтинг группы':L==='en'?'🏆 Group Rating':'🏆 Guruh reytingi',
    'student-grades':   L==='ru'?'🏅 Мои оценки':L==='en'?'🏅 My Grades':'🏅 Baholash',
    'student-tests':    L==='ru'?'📝 Тесты':L==='en'?'📝 Tests':'📝 Testlar',
    'student-chat':     L==='ru'?'💬 Чат':L==='en'?'💬 Chat':'💬 Chat',
    'student-goals':    L==='ru'?'🎯 Мои цели':L==='en'?'🎯 My Goals':'🎯 Maqsadlarim',
    'mentor-videos':    L==='ru'?'🎬 Видеоуроки':L==='en'?'🎬 Video Lessons':'🎬 Video Darsliklar',
    'student-videos':   L==='ru'?'🎬 Видеоуроки':L==='en'?'🎬 Video Lessons':'🎬 Video Darsliklar',
  };
  const subs={
    dashboard:t('dashboard_sub'),courses:t('courses_sub'),groups:t('groups_sub'),
    mentors:t('mentors_sub'),students:t('students_sub'),finance:t('finance_sub'),settings:t('settings_sub'),
    'mentor-dash':      L==='ru'?'Личные данные · Группы · Зарплата · Активные студенты':L==='en'?'Personal · Groups · Salary · Active Students':'Shaxsiy ma\'lumotlar · Guruhlar · Oylik · Aktiv talabalar',
    'mentors-my':       L==='ru'?'Дни уроков · Время · Номер кабинета':L==='en'?'Lesson days · Time · Room':'Dars kunlari · vaqti · xona raqami',
    'mentor-chat':      L==='ru'?'Прямое общение со студентами':L==='en'?'Direct messaging with students':'Talabalar bilan to\'g\'ridan-to\'g\'ri yozishuv',
    'student-my':       L==='ru'?'Посещаемость · Рейтинг · Оплата':L==='en'?'Attendance · Rating · Payment':'Davomat · Reyting · To\'lov holati',
    tests:              L==='ru'?'Тесты по группам — загружает ментор':L==='en'?'Group tests — uploaded by mentor':'Guruh bo\'yicha testlar — mentor yuklaydi',
    grades:             L==='ru'?'Критерии оценки для каждой группы':L==='en'?'Grading criteria per group':'Har bir guruh uchun alohida baholash mezonlari',
    'student-schedule': L==='ru'?'Время · Кабинет · Дни занятий':L==='en'?'Time · Room · Lesson days':'Vaqt · Xona · Dars kunlari',
    'student-rating':   L==='ru'?'Ваше место в группе · % посещаемости':L==='en'?'Your rank · Attendance %':'Guruh ichida o\'rningiz · Davomat foizi',
    'student-grades':   L==='ru'?'Критерии · Итоговая оценка':L==='en'?'Criteria · Final Grade':'Baholash mezonlari · Yakuniy ball',
    'student-tests':    L==='ru'?'Тесты группы · Результаты':L==='en'?'Group tests · Results':'Guruh testlari · Natijalar',
    'student-chat':     L==='ru'?'Общение с ментором':L==='en'?'Chat with mentor':'Mentor bilan yozishuv',
    'student-goals':    L==='ru'?'Цели · Достижения · Мотивация':L==='en'?'Goals · Achievements · Motivation':'Maqsadlar · Yutuqlar · Motivatsiya',
  };
  document.getElementById('tb-title').textContent=titles[tab]||tab;
  document.getElementById('tb-sub').textContent=subs[tab]||'';
}
function go(tab,el){
  const _sb=document.getElementById('sidebar');const _ov=document.getElementById('sidebar-overlay');
  if(_sb)_sb.classList.remove('open');if(_ov)_ov.classList.remove('open');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  if(el)el.classList.add('active');
  const panelEl=document.getElementById('panel-'+tab);
  if(panelEl)panelEl.classList.add('active');
  currentTab=tab;saveUI();updateTopbar(tab);
  if(tab==='dashboard')renderDashboard();
  if(tab==='finance')renderFinance();
  if(tab==='settings'){setTimeout(()=>renderSettingsPanel(),50);}
  if(tab==='mentor-dash')renderMentorDashboard();if(tab==='mentor-ai'&&typeof renderMentorAI==='function')renderMentorAI();if(tab==='student-ai'&&typeof renderStudentAI==='function')renderStudentAI();
  if(tab==='mentors-my')renderMySchedule();
  if(tab==='mentor-chat')renderMentorChat();
  if(tab==='student-my')renderStudentDashboard();
  if(tab==='tests')renderTestsPanel();
  if(tab==='grades')renderGradesPanel();
  if(tab==='student-schedule')renderStudentSchedulePage();
  if(tab==='student-rating')renderStudentRatingPage();
  if(tab==='student-grades')renderStudentGradesPage();
  if(tab==='student-tests')renderStudentTestsPage();
  if(tab==='student-chat')renderStudentChatPage();
  if(tab==='student-goals')renderStudentGoalsPage();
  if(tab==='mentor-videos')renderMentorVideos();
  if(tab==='student-videos')renderStudentVideos();
  document.getElementById('scroll').scrollTop=0;
}
function renderAll(){
  if(!isMentorRole()&&!isStudentRole()){
    renderCourses();renderGroups();renderMentors();renderStudents();renderDashboard();
  }
  applyTranslations();
}
function exportData(){
  const blob=new Blob([JSON.stringify({courses:D.courses,groups:D.groups,mentors:D.mentors,students:D.students,attendance:D.attendance,finance:D.finance},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='edumanage_'+todayStr()+'.json';a.click();
  toast('📥 Yuklab olindi!');
}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeModal();closeDetail();closeDelModal();closeStatModal();closeLightbox();closeFinModal();closeMentorSalaryModal();}
});

function initApp(){
  D=loadData();loadUI();
  if(!D.attendance)D.attendance={};
  if(!D.finance)D.finance=[];
  if(!D.gradingCriteria)D.gradingCriteria={};
  if(!D.grades)D.grades={};
  if(!D.tests)D.tests=[];
  if(!D.testResults)D.testResults={};
  D.mentors.forEach(m=>{if(!('photo' in m))m.photo=null;});
  D.students.forEach(s=>{if(!s.firstName){const parts=(s.name||'').split(' ');s.firstName=parts[0]||'';s.lastName=parts.slice(1).join(' ')||'';}});

  // FIX #1: Apply logo/name BEFORE showing app
  applyUISettings();

  // Init finance month to current
  const now=new Date();
  _finMonth=now.getMonth();
  _finYear=now.getFullYear();

  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.remove('active'));
  const lb=document.getElementById('lb-'+LANG);if(lb)lb.classList.add('active');

  // Mentor bo'lsa FAQAT kerakli ma'lumotlarni yuklaymiz, admin panellarini render qilmaymiz
  if(isMentorRole()){
    // Mentor uchun minimal init
    updateCounts();
    currentTab='mentor-dash';
  } else if(isStudentRole()){
    // Student uchun minimal init
    updateCounts();
    currentTab='student-my';
    // Student tab'lari uchun saqlash
    try{
      const ui=JSON.parse(localStorage.getItem(UI_KEY)||'{}');
      const validStudTabs=['student-my','student-schedule','student-rating','student-grades','student-tests','student-chat','student-goals'];
      if(!validStudTabs.includes(ui.tab)) ui.tab='student-my';
      currentTab=ui.tab;
    }catch(e){currentTab='student-my';}
  } else {
    // Admin uchun to'liq init - tests/grades nav yashirin (faqat mentor uchun)
    ['nav-tests','nav-grades','nav-mentor-dash','nav-mentors-my','nav-mentor-chat','nav-mentor-ai','nav-tests-mentor','nav-grades-mentor','nav-student-my','nav-student-schedule','nav-student-rating','nav-student-grades','nav-student-tests','nav-student-chat','nav-student-ai','nav-student-goals'].forEach(id=>{
      const el=document.getElementById(id);if(el)el.style.display='none';
    });
    updateCounts();updateGroupFilters();updateStudentCourseFilter();
    renderCourses();renderGroups();renderMentors();renderStudents();renderDashboard();
    const navEl=document.getElementById('nav-'+currentTab);
    go(currentTab,navEl||document.getElementById('nav-dashboard'));
  }
  updateStorageBadge(true);
  applyTranslations();
}

// ===================== ADMIN SELF CREDENTIALS =====================
function saveAdminCredentials(){
  const login=(document.getElementById('sett-admin-login').value||'').trim();
  const pass=(document.getElementById('sett-admin-pass').value||'').trim();
  const pass2=(document.getElementById('sett-admin-pass2').value||'').trim();
  if(!login||login.length<3){toast('⚠️ Login kamida 3 ta belgi!');return;}
  if(!pass||pass.length<4){toast('⚠️ Parol kamida 4 ta belgi!');return;}
  if(pass!==pass2){toast('⚠️ Parollar bir xil emas!');return;}
  // Login mentor/talaba bilan to'qnashmasin
  const others=getMentorUsers().concat(getStudentUsers());
  if(others.some(u=>u.login===login)){toast('⚠️ Bu login boshqa foydalanuvchida bor!');return;}
  saveAdminCred(login,pass);
  // Joriy sessiyani yangilash
  try{
    const a=JSON.parse(localStorage.getItem(AUTH_KEY)||'{}');
    if(a&&a.loggedIn&&a.role==='Super Admin'){
      localStorage.setItem(AUTH_KEY,JSON.stringify(Object.assign(a,{name:'Admin'})));
    }
  }catch(e){}
  toast('✅ Admin login va parol yangilandi!');
  document.getElementById('sett-admin-pass').value='';
  document.getElementById('sett-admin-pass2').value='';
  const cur=document.getElementById('sett-admin-current');if(cur)cur.textContent=login;
}

// ===================== MENTOR CREDENTIALS (ADMIN) =====================
function saveMentorCredentials(){
  const sel=document.getElementById('sett-mentor-select');
  const login=(document.getElementById('sett-mentor-login').value||'').trim();
  const pass=(document.getElementById('sett-mentor-pass').value||'').trim();
  const mentorName=sel.options[sel.selectedIndex]?.text||'';
  if(!sel.value){toast('⚠️ Mentor tanlang!');return;}
  if(!login||login.length<2){toast('⚠️ Login kamida 2 ta belgi!');return;}
  if(!pass||pass.length<4){toast('⚠️ Parol kamida 4 ta belgi!');return;}
  // Login boshqa foydalanuvchida bormi?
  const existing=getMentorUsers();
  const conflict=existing.find(u=>u.login===login&&u.mentorId!==sel.value);
  if(conflict){toast('⚠️ Bu login allaqachon band!');return;}
  // Eski yozuvni o'chirib yangi qo'sh
  const filtered=existing.filter(u=>u.mentorId!==sel.value);
  filtered.push({login,pass,name:mentorName,role:'Mentor',mentorId:sel.value,mentorName:mentorName});
  saveMentorUsers(filtered);
  toast('✅ '+mentorName+' uchun login/parol saqlandi!');
  renderMentorCredsList();
  document.getElementById('sett-mentor-login').value='';
  document.getElementById('sett-mentor-pass').value='';
}

function renderMentorCredsList(){
  const listEl=document.getElementById('mentor-creds-list');if(!listEl)return;
  const sel=document.getElementById('sett-mentor-select');
  // Populate mentor select
  if(sel){
    const cur=sel.value;
    sel.innerHTML='<option value="">— Mentor tanlang —</option>'+D.mentors.map(m=>`<option value="${m.id}" ${String(m.id)===String(cur)?'selected':''}>${m.name}</option>`).join('');
    // If selected mentor has creds, prefill
    if(cur){
      const u=getMentorUsers().find(u=>String(u.mentorId)===String(cur));
      if(u){
        document.getElementById('sett-mentor-login').value=u.login;
        document.getElementById('sett-mentor-pass').value=u.pass;
      }
    }
  }
  const users=getMentorUsers();
  if(!users.length){listEl.innerHTML='<div style="font-size:12px;color:var(--text3);padding:6px 0">Hali hech bir mentorga login berilmagan.</div>';return;}
  listEl.innerHTML='<div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">Hisob berilgan mentorlar:</div>'+users.map(u=>`
    <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--bg2);border-radius:var(--r-md);border:1px solid var(--border);margin-bottom:6px">
      <span style="font-weight:600;font-size:13px;flex:1">${u.name}</span>
      <span style="font-size:12px;color:var(--text2);font-family:'JetBrains Mono',monospace">${u.login}</span>
      <button class="btn btn-sm btn-del-outline" style="padding:3px 8px;font-size:11px" onclick="deleteMentorCredential('${u.mentorId}')">✕ O'chirish</button>
    </div>`).join('');
}

function deleteMentorCredential(mentorId){
  if(!confirm('Bu mentorning login/paroli o\'chirilsinmi?'))return;
  const filtered=getMentorUsers().filter(u=>String(u.mentorId)!==String(mentorId));
  saveMentorUsers(filtered);
  renderMentorCredsList();
  toast('🗑 Login/parol o\'chirildi');
}

// ===================== STUDENT CREDENTIALS =====================
function saveStudentCredentials(){
  const sel=document.getElementById('sett-student-select');
  const login=(document.getElementById('sett-student-login').value||'').trim();
  const pass=(document.getElementById('sett-student-pass').value||'').trim();
  const studentName=sel.options[sel.selectedIndex]?.text||'';
  if(!sel.value){toast('⚠️ Talaba tanlang!');return;}
  if(!login||login.length<2){toast('⚠️ Login kamida 2 ta belgi!');return;}
  if(!pass||pass.length<4){toast('⚠️ Parol kamida 4 ta belgi!');return;}
  const existing=getStudentUsers();
  const conflict=existing.find(u=>u.login===login&&u.studentId!==sel.value);
  if(conflict){toast('⚠️ Bu login allaqachon band!');return;}
  // login=admin yoki mentor loginlari bilan to'qnashmasin
  const allUsers=getUsers();
  const adminConflict=allUsers.find(u=>u.login===login&&String(u.studentId||'')!==String(sel.value));
  if(adminConflict){toast('⚠️ Bu login boshqa foydalanuvchida bor!');return;}
  const filtered=existing.filter(u=>String(u.studentId)!==String(sel.value));
  filtered.push({login,pass,name:studentName,role:'Talaba',studentId:sel.value,studentName:studentName});
  saveStudentUsers(filtered);
  toast('✅ '+studentName+' uchun login/parol saqlandi!');
  renderStudentCredsList();
  document.getElementById('sett-student-login').value='';
  document.getElementById('sett-student-pass').value='';
}

function renderStudentCredsList(){
  const listEl=document.getElementById('student-creds-list');if(!listEl)return;
  const sel=document.getElementById('sett-student-select');
  if(sel){
    const cur=sel.value;
    sel.innerHTML='<option value="">— Talaba tanlang —</option>'+D.students.map(s=>`<option value="${s.id}" ${String(s.id)===String(cur)?'selected':''}>${s.name} — ${groupLabel(s.groupId)}</option>`).join('');
    if(cur){
      const u=getStudentUsers().find(u=>String(u.studentId)===String(cur));
      if(u){
        document.getElementById('sett-student-login').value=u.login;
        document.getElementById('sett-student-pass').value=u.pass;
      }
    }
  }
  const users=getStudentUsers();
  if(!users.length){listEl.innerHTML='<div style="font-size:12px;color:var(--text3);padding:6px 0">Hali hech bir talabaga login berilmagan.</div>';return;}
  listEl.innerHTML='<div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">Login berilgan talabalar:</div>'+users.map(u=>`
    <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--bg2);border-radius:var(--r-md);border:1px solid var(--border);margin-bottom:6px">
      <span style="font-weight:600;font-size:13px;flex:1">${u.name}</span>
      <span style="font-size:12px;color:var(--text2);font-family:'JetBrains Mono',monospace">${u.login}</span>
      <button class="btn btn-sm btn-del-outline" style="padding:3px 8px;font-size:11px" onclick="deleteStudentCredential('${u.studentId}')">✕ O'chirish</button>
    </div>`).join('');
}

function deleteStudentCredential(studentId){
  if(!confirm('Bu talabaning login/paroli o\'chirilsinmi?'))return;
  const filtered=getStudentUsers().filter(u=>String(u.studentId)!==String(studentId));
  saveStudentUsers(filtered);
  renderStudentCredsList();
  toast('🗑 Talaba login/paroli o\'chirildi');
}

// ===================== MENTOR MY SCHEDULE =====================
function showMentorGroupRating(gid){
  const g=D.groups.find(x=>x.id===gid);if(!g)return;
  const ratings=calcGroupRating(gid);
  const AV_CLS_LOCAL=['av-a','av-b','av-c','av-d','av-e'];
  let html=`<div style="font-size:13px;color:var(--text3);margin-bottom:14px">📚 ${g.course} · 👥 ${ratings.length} ta talaba</div>`;
  if(!ratings.length){html+='<div style="color:var(--text3);text-align:center;padding:20px">Talaba yo\'q</div>';}
  else{
    const statusBadge={Aktiv:'b-teal',Faolsiz:'b-gray',Muzlatilgan:'b-blue',Probatsiya:'b-amber',Arxiv:'b-purple'};
    ratings.forEach((r,idx)=>{
      const rc=r.rating>=80?'var(--teal-text)':r.rating>=60?'var(--amber-text)':'var(--orange-text)';
      const medal=idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':`${idx+1}.`;
      html+=`<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:var(--r-md);border:1px solid var(--border);background:var(--bg2);margin-bottom:5px">
        <span style="font-size:16px;min-width:28px;text-align:center">${medal}</span>
        <div class="av ${AV_CLS_LOCAL[idx%5]}" style="width:30px;height:30px;font-size:10px;flex-shrink:0">${ini(r.name)}</div>
        <span style="flex:1;font-size:13px;font-weight:600;color:var(--text)">${r.name}</span>
        <span class="badge ${statusBadge[r.status]||'b-gray'}" style="font-size:10px">${r.status}</span>
        ${r.isDebtor?'<span class="badge b-orange" style="font-size:10px">💸</span>':''}
        <span style="font-size:15px;font-weight:800;color:${rc};min-width:42px;text-align:right">${r.rating}%</span>
      </div>`;
    });
  }
  document.getElementById('detail-title').textContent='🏆 '+g.name+' — Guruh reytingi';
  document.getElementById('detail-body').innerHTML=html;
  document.getElementById('detail-foot').innerHTML=`<button class="btn" onclick="closeDetail()">${L==='ru'?'Закрыть':L==='en'?'Close':'Yopish'}</button>`;
  document.getElementById('detail-overlay').classList.add('open');
}
function renderMySchedule(){
  const wrap=document.getElementById('my-schedule-wrap');if(!wrap)return;
  const L=LANG;
  const cu=getCurrentUser();
  const mentorName=cu.mentorName||cu.name;
  // Mentorga tegishli guruhlarni topish
  const myGroups=D.groups.filter(g=>g.mentor===mentorName);
  const DAY_FULL=L==='ru'?{Du:'Понедельник',Se:'Вторник',Ch:'Среда',Pa:'Четверг',Ju:'Пятница',Sh:'Суббота'}:L==='en'?{Du:'Monday',Se:'Tuesday',Ch:'Wednesday',Pa:'Thursday',Ju:'Friday',Sh:'Saturday'}:{Du:'Dushanba',Se:'Seshanba',Ch:'Chorshanba',Pa:'Payshanba',Ju:'Juma',Sh:'Shanba'};
  const DAY_ORDER={Du:1,Se:2,Ch:3,Pa:4,Ju:5,Sh:6};
  const DAY_KEYS=['Du','Se','Ch','Pa','Ju','Sh'];

  if(!myGroups.length){
    wrap.innerHTML=`<div style="text-align:center;padding:60px 20px;color:var(--text3)"><div style="font-size:48px;margin-bottom:16px">📅</div><div style="font-size:16px;font-weight:600">Sizga biriktirilgan guruh yo'q</div><div style="font-size:13px;margin-top:8px">Admin sizni guruhlarga biriktirishi kerak</div></div>`;
    return;
  }

  // Haftalik jadval qurilish
  const weekRows=DAY_KEYS.map(dayKey=>{
    const groupsOnDay=myGroups.filter(g=>(g.days||[]).includes(dayKey))
      .sort((a,b)=>(a.timeStart||'').localeCompare(b.timeStart||''));
    if(!groupsOnDay.length)return '';
    const cells=groupsOnDay.map(g=>{
      const students=D.students.filter(s=>s.groupId===g.id);
      return `<div style="display:inline-flex;flex-direction:column;gap:4px;background:var(--accent-light);border:1.5px solid var(--accent);border-radius:var(--r-md);padding:8px 14px;min-width:160px">
        <div style="font-size:13px;font-weight:800;color:var(--text)">${g.name}</div>
        <div style="font-size:11px;color:var(--text2)">📚 ${g.course}</div>
        <div style="font-size:12px;font-weight:700;color:var(--accent)">⏰ ${g.timeStart||'—'} – ${g.timeEnd||'—'}</div>
        <div style="display:flex;gap:8px;align-items:center;font-size:11px;color:var(--text2)">
          <span>🚪 <b style="color:var(--teal-text)">${g.room||'—'}-${L==='ru'?'кабинет':L==='en'?'room':'xona'}</b></span>
          <span>👥 ${students.length} ta</span>
        </div>
      </div>`;
    }).join('');
    return `<tr>
      <td style="font-size:12px;font-weight:700;color:var(--text3);white-space:nowrap;padding:8px 14px 8px 0;vertical-align:top;border-right:2px solid var(--border2);width:90px">${DAY_FULL[dayKey]}</td>
      <td style="padding:8px 0 8px 14px"><div style="display:flex;flex-wrap:wrap;gap:8px">${cells}</div></td>
    </tr>`;
  }).filter(Boolean).join('');

  // Sort groups by day order then time for card list
  const sorted=[...myGroups].sort((a,b)=>{
    const da=Math.min(...(a.days||[]).map(d=>DAY_ORDER[d]||9));
    const db=Math.min(...(b.days||[]).map(d=>DAY_ORDER[d]||9));
    if(da!==db)return da-db;
    return (a.timeStart||'').localeCompare(b.timeStart||'');
  });

  let groupCards=sorted.map(g=>{
    const daysHtml=(g.days||[]).map(d=>`<span style="display:inline-flex;align-items:center;justify-content:center;padding:3px 12px;background:var(--accent-light);color:var(--accent-text);border-radius:20px;font-size:12px;font-weight:700;border:1px solid var(--accent)">${DAY_FULL[d]||d}</span>`).join('');
    const students=D.students.filter(s=>s.groupId===g.id);
    const activeStudents=students.filter(s=>s.status==='Aktiv').length;
    const debtors=students.filter(s=>s.isDebtor).length;
    return `<div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:20px 22px;margin-bottom:16px;box-shadow:var(--shadow-sm)">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div>
          <div style="font-size:18px;font-weight:800;letter-spacing:-.4px;color:var(--text)">${g.name}</div>
          <div style="font-size:13px;color:var(--text2);margin-top:3px">📚 ${g.course}</div>
        </div>
        <span class="badge ${g.status==='Faol'?'b-teal':g.status==='Arxiv'?'b-gray':'b-orange'}">${g.status}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 10px">
        ${daysHtml}
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:10px">
        <div style="background:var(--bg2);border-radius:var(--r-md);padding:10px 14px;border:1px solid var(--border)">
          <div style="font-size:10px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px">⏰ Vaqt</div>
          <div style="font-size:16px;font-weight:800;color:var(--accent);margin-top:4px">${g.timeStart||'—'} – ${g.timeEnd||'—'}</div>
        </div>
        <div style="background:var(--bg2);border-radius:var(--r-md);padding:10px 14px;border:1px solid var(--border)">
          <div style="font-size:10px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px">🚪 Xona</div>
          <div style="font-size:22px;font-weight:800;color:var(--teal-text);margin-top:4px">${g.room||'—'}</div>
        </div>
        <div style="background:var(--bg2);border-radius:var(--r-md);padding:10px 14px;border:1px solid var(--border)">
          <div style="font-size:10px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px">🧑‍💻 Talabalar</div>
          <div style="font-size:22px;font-weight:800;color:var(--purple);margin-top:4px">${students.length} <span style="font-size:13px;font-weight:500;color:var(--text3)">ta</span></div>
          ${debtors>0?`<div style="font-size:11px;color:var(--orange-text);margin-top:2px">💸 ${debtors} qarzdor</div>`:''}
        </div>
        <div style="background:var(--bg2);border-radius:var(--r-md);padding:10px 14px;border:1px solid var(--border)">
          <div style="font-size:10px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px">📅 Boshlanish</div>
          <div style="font-size:13px;font-weight:700;color:var(--text);margin-top:4px">${fmtDate(g.startDate)}</div>
        </div>
      </div>
      <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary btn-sm" onclick="_attMonth=null;showGroupStudents(${g.id})" style="font-size:12px;padding:7px 14px">📋 Davomat qilish</button>
        <button class="btn btn-sm" onclick="showMentorGroupRating(${g.id})" style="font-size:12px;padding:7px 14px;background:var(--purple-light);color:var(--purple-text);border-color:rgba(124,58,237,.3)">🏆 Guruh reytingi</button>
        <button class="btn btn-sm" onclick="go('grades',document.getElementById('nav-grades-mentor'));setTimeout(()=>selectGradeGroup(${g.id}),150)" style="font-size:12px;padding:7px 14px;background:var(--amber-light);color:var(--amber-text);border-color:rgba(217,119,6,.3)">🏅 Baholash</button>
        <button class="btn btn-sm" onclick="go('tests',document.getElementById('nav-tests-mentor'));setTimeout(()=>filterTestsByGroup(${g.id}),150)" style="font-size:12px;padding:7px 14px;background:var(--teal-light);color:var(--teal-text);border-color:rgba(13,148,136,.3)">${L==='ru'?'📝 Тесты':L==='en'?'📝 Tests':'📝 Testlar'}</button>
      </div>
    </div>`;
  }).join('');

  wrap.innerHTML=`
    <div style="padding:0 0 20px">
      <div style="font-size:22px;font-weight:800;letter-spacing:-.5px;color:var(--text)">📅 Mening dars jadvalim</div>
      <div style="font-size:13px;color:var(--text2);margin-top:4px">Salom, <b>${mentorName}</b> — sizda <b>${myGroups.length}</b> ta guruh bor</div>
    </div>

    <!-- Haftalik jadval -->
    <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:18px 20px;margin-bottom:24px;box-shadow:var(--shadow-sm)">
      <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:14px">📆 Haftalik jadval</div>
      <table style="width:100%;border-collapse:collapse">
        <tbody>${weekRows}</tbody>
      </table>
    </div>

    <!-- Guruh kartochkalari -->
    <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:14px">🗂 Guruhlar tafsiloti</div>
    ${groupCards}`;
}

// FIX #1: Also apply logo/name on login screen before login
(function(){
  loadUI();
  applyLogo();
  // Update login screen name
  const loginName=document.getElementById('login-crm-name');
  if(loginName) loginName.textContent=_uiSettings.crmName||'EduManage';
  // Login hint - faqat admin demo hintini ko'rsatadi
  const hint=document.querySelector('.login-hint');
  if(hint) hint.textContent='🔐 Admin: admin/admin123 · Mentor/Talaba: Settings dan bering';
})();

if(checkAuth()){showApp();}
else{
  document.getElementById('login-screen').style.display='flex';
  document.getElementById('app').style.display='none';
  setTimeout(()=>document.getElementById('login-user').focus(),100);
}
// ===================== GRADING SYSTEM =====================
let _gradesGroupId = null;
let _gradesEditCritId = null;

function renderGradesPanel() {
  const wrap = document.getElementById('grades-wrap');
  if (!wrap) return;
  const isMentor = isMentorRole();
  const cu = getCurrentUser();
  let accessGroups = D.groups;
  if (isMentor) {
    const mName = cu.mentorName || cu.name;
    accessGroups = D.groups.filter(g => g.mentor === mName);
  }
  if (!accessGroups.length) {
    wrap.innerHTML = `<div class="empty"><div class="empty-ic">🏅</div><div class="empty-txt">Guruh topilmadi</div></div>`;
    return;
  }
  const selGroupId = _gradesGroupId || accessGroups[0].id;
  const groupOptHtml = accessGroups.map(g => `<option value="${g.id}" ${g.id===selGroupId?'selected':''}>${g.name} — ${g.course}</option>`).join('');
  const selGroup = D.groups.find(x => x.id === selGroupId);
  if (selGroup) _gradesGroupId = selGroup.id;
  const criteriaArr = (D.gradingCriteria && D.gradingCriteria[selGroupId]) || [];
  const students = D.students.filter(s => s.groupId === selGroupId && s.status !== 'Arxiv');

  // Criteria table
  let critHtml = '';
  if (criteriaArr.length) {
    critHtml = `<div class="grade-crit-list">${criteriaArr.map(c => {
      const warnColor = c.weight > 100 ? 'var(--orange-text)' : 'var(--teal-text)';
      return `<div class="grade-crit-item">
        <div class="grade-crit-name">${c.name}</div>
        <div class="grade-crit-meta">Max: <b>${c.maxScore}</b> ball &nbsp;·&nbsp; Og\'irlik: <b style="color:${warnColor}">${c.weight}%</b></div>
        <div class="grade-crit-actions">
          <button class="btn btn-sm" onclick="openEditCriteria(${selGroupId},'${c.id}')">✏️</button>
          <button class="btn btn-sm btn-del-outline" onclick="deleteCriteria(${selGroupId},'${c.id}')">🗑</button>
        </div>
      </div>`;
    }).join('')}</div>`;
    const totalWeight = criteriaArr.reduce((s,c) => s+c.weight, 0);
    const weightStatus = totalWeight === 100 ? `<span style="color:var(--teal-text);font-weight:700">✅ Jami: ${totalWeight}%</span>` : `<span style="color:var(--orange-text);font-weight:700">⚠️ ${L==='ru'?'Итого':L==='en'?'Total':'Jami'}: ${totalWeight}% ${L==='ru'?'(должно быть 100%)':L==='en'?'(must be 100%)':"(100% bo'lishi kerak)"}</span>`;
    critHtml = `<div class="grade-weight-status">${weightStatus}</div>` + critHtml;
  } else {
    critHtml = `<div style="color:var(--text3);font-size:13px;padding:12px 0">${L==='ru'?'Критерии не добавлены':L==='en'?'No criteria added yet':'Hali mezon qo\'shilmagan'}</div>`;
  }

  // Add criteria form
  const editC = _gradesEditCritId ? criteriaArr.find(x=>x.id===_gradesEditCritId) : null;
  const critFormHtml = `<div class="grade-add-crit-form">
    <div class="form-row">
      <div class="fg"><label>${L==='ru'?'Mezon nomi':L==='en'?'Criterion':'Mezon nomi'}</label><input id="gc-name" value="${editC?editC.name:''}" placeholder="Uy vazifasi / Imtihon / Faollik..."></div>
      <div class="fg"><label>${L==='ru'?'Макс балл':L==='en'?'Max score':'Max ball'}</label><input type="number" id="gc-max" value="${editC?editC.maxScore:100}" min="1" max="1000" style="width:90px"></div>
      <div class="fg"><label>${L==='ru'?'Вес (%)':L==='en'?'Weight (%)':'Og\'irlik (%)'}</label><input type="number" id="gc-weight" value="${editC?editC.weight:30}" min="1" max="100" style="width:90px"></div>
    </div>
    <button class="btn btn-primary btn-sm" onclick="saveCriteria(${selGroupId})">${editC?L==='ru'?'✅ Обновить':L==='en'?'✅ Update':'✅ Yangilash':L==='ru'?'➕ Добавить критерий':L==='en'?'➕ Add Criterion':'➕ Mezon qo\'shish'}</button>
    ${editC?`<button class="btn btn-sm" onclick="_gradesEditCritId=null;renderGradesPanel()" style="margin-left:8px">${L==='ru'?'Отмена':L==='en'?'Cancel':'Bekor'}</button>`:''}
  </div>`;

  // Student grades table
  let gradeTableHtml = '';
  if (criteriaArr.length && students.length) {
    const headerCols = criteriaArr.map(c => `<th style="white-space:nowrap;font-size:12px;padding:8px 12px;background:var(--bg3);color:var(--text2);font-weight:700">${c.name}<br><span style="font-size:10px;font-weight:500;color:var(--text3)">max ${c.maxScore}</span></th>`).join('');
    const gradeRows = students.map((s,i) => {
      const sg = (D.grades[selGroupId] && D.grades[selGroupId][s.id]) || {};
      const cellsHtml = criteriaArr.map(c => {
        const val = sg[c.id] !== undefined ? sg[c.id] : '';
        return `<td style="padding:4px 6px;text-align:center"><input type="number" class="grade-input" value="${val}" min="0" max="${c.maxScore}" placeholder="—" onchange="saveStudentGrade(${selGroupId},${s.id},'${c.id}',this.value,${c.maxScore})" style="width:60px;text-align:center;padding:5px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);color:var(--text);font-size:13px;font-weight:600"></td>`;
      }).join('');
      const totalData = calcStudentWeightedScore(s.id, selGroupId);
      const scoreColor = totalData.score >= 85 ? 'var(--teal-text)' : totalData.score >= 70 ? 'var(--accent-text)' : totalData.score >= 55 ? 'var(--amber-text)' : 'var(--orange-text)';
      const letter = getGradeLetter(totalData.score);
      return `<tr style="border-bottom:1px solid var(--border)" data-grade-student="${s.id}">
        <td style="padding:8px 12px;font-weight:600;font-size:13px;white-space:nowrap">
          <div style="display:flex;align-items:center;gap:8px">
            <div class="av ${AV_CLS[i%5]}" style="width:28px;height:28px;font-size:10px;flex-shrink:0">${ini(s.name)}</div>
            <div>
              <div style="font-size:12px;color:var(--text)">${s.firstName||s.name.split(' ')[0]} <b>${s.lastName||s.name.split(' ').slice(1).join(' ')}</b></div>
              <div style="font-size:10px;color:var(--text3)">${groupLabel(s.groupId)}</div>
            </div>
          </div>
        </td>
        ${cellsHtml}
        <td style="padding:8px 12px;text-align:center;font-weight:800;font-size:15px" class="grade-total-score" style="color:${scoreColor}">${totalData.filled?totalData.score+'%':'-'}</td>
        <td style="padding:8px 12px;text-align:center" class="grade-letter-cell"><span class="grade-letter-badge grade-${letter.toLowerCase()}">${letter}</span></td>
      </tr>`;
    }).join('');

    gradeTableHtml = `<div style="overflow-x:auto;margin-top:20px">
      <table style="width:100%;border-collapse:collapse;background:var(--bg2);border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--shadow-sm)">
        <thead>
          <tr>
            <th style="padding:10px 12px;text-align:left;font-size:12px;background:var(--bg3);color:var(--text2);font-weight:700;border-bottom:2px solid var(--border2)">${L==='ru'?'Студент':L==='en'?'Student':'Talaba'}</th>
            ${headerCols}
            <th style="padding:10px 12px;font-size:12px;background:var(--bg3);color:var(--text2);font-weight:700;text-align:center;border-bottom:2px solid var(--border2)">Umumiy</th>
            <th style="padding:10px 12px;font-size:12px;background:var(--bg3);color:var(--text2);font-weight:700;text-align:center;border-bottom:2px solid var(--border2)">Baho</th>
          </tr>
        </thead>
        <tbody>${gradeRows}</tbody>
      </table>
    </div>`;
  } else if (!criteriaArr.length) {
    gradeTableHtml = '';
  } else {
    gradeTableHtml = `<div class="empty" style="margin-top:16px"><div class="empty-ic">🧑‍💻</div><div class="empty-txt">Bu guruhda talaba yo'q</div></div>`;
  }

  wrap.innerHTML = `
    <div class="grade-panel-wrap">
      <div class="grade-top-row">
        <div class="fg" style="flex:0 0 300px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">👥 Guruh tanlang</label>
          <select onchange="_gradesGroupId=parseInt(this.value);_gradesEditCritId=null;renderGradesPanel()" style="width:100%">${groupOptHtml}</select>
        </div>
        <div style="flex:1"></div>
        <button class="btn btn-sm" onclick="exportGrades(${selGroupId})" style="background:var(--teal-light);color:var(--teal-text);border-color:rgba(13,148,136,.3)">📥 CSV yuklash</button>
      </div>

      <div class="grade-section">
        <div class="grade-section-title">⚙️ Baholash mezonlari — ${selGroup?selGroup.name:''}</div>
        <div style="font-size:12px;color:var(--text3);margin-bottom:14px">Har bir guruh uchun alohida mezonlar belgilanadi. Og'irliklar yig'indisi 100% bo'lishi kerak.</div>
        ${critHtml}
        <div style="margin-top:16px;border-top:1px solid var(--border);padding-top:16px">
          <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:12px">${editC?'✏️ Mezonni tahrirlash':'➕ Yangi mezon qo\'shish'}</div>
          ${critFormHtml}
        </div>
      </div>

      ${criteriaArr.length ? `<div class="grade-section">
        <div class="grade-section-title">📊 Talabalar baholari — ${selGroup?selGroup.name:''}</div>
        <div style="font-size:12px;color:var(--text3);margin-bottom:8px">Ball kiriting · Umumiy og'irlik bo'yicha hisoblash avtomatik</div>
        ${gradeTableHtml}
      </div>` : ''}
    </div>`;
}

function selectGradeGroup(groupId) {
  _gradesGroupId = groupId;
  _gradesEditCritId = null;
  renderGradesPanel();
}

function saveCriteria(groupId) {
  const name = (document.getElementById('gc-name').value || '').trim();
  const maxScore = parseInt(document.getElementById('gc-max').value) || 100;
  const weight = parseInt(document.getElementById('gc-weight').value) || 0;
  if (!name) { toast('⚠️ Mezon nomini kiriting!'); return; }
  if (weight < 1 || weight > 100) { toast('⚠️ Og\'irlik 1—100 orasida!'); return; }
  if (!D.gradingCriteria[groupId]) D.gradingCriteria[groupId] = [];
  if (_gradesEditCritId) {
    const c = D.gradingCriteria[groupId].find(x => x.id === _gradesEditCritId);
    if (c) { c.name = name; c.maxScore = maxScore; c.weight = weight; }
    _gradesEditCritId = null;
    toast('✅ Mezon yangilandi!');
  } else {
    const newId = 'c_' + Date.now();
    D.gradingCriteria[groupId].push({ id: newId, name, maxScore, weight });
    toast('✅ Mezon qo\'shildi!');
  }
  saveData();
  renderGradesPanel();
}

function openEditCriteria(groupId, critId) {
  _gradesEditCritId = critId;
  _gradesGroupId = groupId;
  renderGradesPanel();
  setTimeout(() => {
    const el = document.getElementById('gc-name');
    if (el) el.focus();
  }, 100);
}

function deleteCriteria(groupId, critId) {
  if (!confirm('Bu mezon o\'chirilsinmi? Unga tegishli barcha baholar ham o\'chadi!')) return;
  if (D.gradingCriteria[groupId]) {
    D.gradingCriteria[groupId] = D.gradingCriteria[groupId].filter(x => x.id !== critId);
  }
  if (D.grades[groupId]) {
    Object.values(D.grades[groupId]).forEach(sg => { delete sg[critId]; });
  }
  saveData();
  toast('🗑 Mezon o\'chirildi');
  renderGradesPanel();
}

function saveStudentGrade(groupId, studentId, criteriaId, val, maxScore) {
  const score = Math.min(maxScore, Math.max(0, parseFloat(val) || 0));
  if (!D.grades[groupId]) D.grades[groupId] = {};
  if (!D.grades[groupId][studentId]) D.grades[groupId][studentId] = {};
  if (val === '' || val === null || val === undefined) {
    delete D.grades[groupId][studentId][criteriaId];
  } else {
    D.grades[groupId][studentId][criteriaId] = score;
  }
  saveData();
  // Update this student's total score & letter badge inline (no full re-render)
  const total = calcStudentWeightedScore(studentId, groupId);
  const letter = getGradeLetter(total.score);
  const scoreColor = total.score >= 85 ? 'var(--teal-text)' : total.score >= 70 ? 'var(--accent-text)' : total.score >= 55 ? 'var(--amber-text)' : 'var(--orange-text)';
  // Find all rows and update the matching student row
  document.querySelectorAll('[data-grade-student]').forEach(row => {
    if (parseInt(row.dataset.gradeStudent) === studentId) {
      const scoreCell = row.querySelector('.grade-total-score');
      const letterCell = row.querySelector('.grade-letter-cell');
      if (scoreCell) { scoreCell.textContent = total.filled ? total.score+'%' : '-'; scoreCell.style.color = scoreColor; }
      if (letterCell) {
        letterCell.innerHTML = `<span class="grade-letter-badge grade-${letter.toLowerCase()}">${letter}</span>`;
      }
    }
  });
}

function calcStudentWeightedScore(studentId, groupId) {
  const criteriaArr = (D.gradingCriteria && D.gradingCriteria[groupId]) || [];
  const maxScore = criteriaArr.reduce((s,c) => s + (c.maxScore||0), 0);
  if (!criteriaArr.length) return { score: 0, maxScore: 0, letter: '—', filled: false };
  const sg = (D.grades[groupId] && D.grades[groupId][studentId]) || {};
  let totalWeight = 0, weightedSum = 0, hasAny = false;
  let rawScore = 0;
  criteriaArr.forEach(c => {
    if (sg[c.id] !== undefined) {
      const pct = Math.min(100, (sg[c.id] / c.maxScore) * 100);
      weightedSum += pct * c.weight;
      totalWeight += c.weight;
      rawScore += sg[c.id];
      hasAny = true;
    }
  });
  if (!hasAny || totalWeight === 0) return { score: 0, maxScore, letter: '—', filled: false };
  const score = Math.round(weightedSum / totalWeight);
  return { score, maxScore, rawScore, letter: getGradeLetter(score), filled: true };
}

function getGradeLetter(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 55) return 'D';
  return 'F';
}

function exportGrades(groupId) {
  const group = D.groups.find(x => x.id === groupId);
  const criteriaArr = (D.gradingCriteria && D.gradingCriteria[groupId]) || [];
  const students = D.students.filter(s => s.groupId === groupId);
  let csv = 'Ism,Familiya,Telefon,' + criteriaArr.map(c => c.name).join(',') + ',Umumiy (%),Baho\n';
  students.forEach(s => {
    const sg = (D.grades[groupId] && D.grades[groupId][s.id]) || {};
    const scores = criteriaArr.map(c => sg[c.id] !== undefined ? sg[c.id] : '').join(',');
    const total = calcStudentWeightedScore(s.id, groupId);
    csv += `${s.firstName||''},${s.lastName||''},${s.phone||''},${scores},${total.filled?total.score:''},${total.filled?getGradeLetter(total.score):''}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (group ? group.name : 'group') + '_baholar.csv';
  a.click();
  toast('📥 CSV yuklandi!');
}

// ===================== TEST SYSTEM =====================
let _testsPanelGroupFilter = null;
let _activeTestId = null;
let _testTimer = null;
let _testAnswers = {};
let _testTimeLeft = 0;
let _editTestId = null;
let _testQuestions = [];

function renderTestsPanel() {
  const wrap = document.getElementById('tests-wrap');
  if (!wrap) return;
  const L=LANG;
  const isMentor = isMentorRole();
  const cu = getCurrentUser();

  let accessGroups = D.groups;
  if (isMentor) {
    const mName = cu.mentorName || cu.name;
    accessGroups = D.groups.filter(g => g.mentor === mName);
  }

  const gFilterVal = _testsPanelGroupFilter || '';
  const groupFilterOpts = `<option value="">Barcha guruhlar</option>` + accessGroups.map(g => `<option value="${g.id}" ${gFilterVal==g.id?'selected':''}>${g.name} — ${g.course}</option>`).join('');

  const visibleTests = D.tests.filter(t => {
    if (gFilterVal && t.groupId && String(t.groupId) !== String(gFilterVal)) return false;
    if (isMentor) {
      const mName = cu.mentorName || cu.name;
      const accessGroupIds = D.groups.filter(g => g.mentor === mName).map(g => g.id);
      if (t.groupId && !accessGroupIds.includes(t.groupId)) return false;
    }
    return true;
  });

  const testsListHtml = visibleTests.length ? visibleTests.map(t => {
    const grp = t.groupId ? D.groups.find(g => g.id === t.groupId) : null;
    const qCount = (t.questions || []).length;
    const resultCount = D.testResults[t.id] ? Object.keys(D.testResults[t.id]).length : 0;
    return `<div class="test-card">
      <div class="test-card-top">
        <div>
          <div class="test-card-title">${t.title}</div>
          <div class="test-card-meta">
            <span class="badge b-blue">👥 ${grp ? grp.name : L==='ru'?'Все группы':L==='en'?'All groups':'Barcha guruhlar'}</span>
            <span class="badge b-purple">❓ ${qCount} ${L==='ru'?'вопросов':L==='en'?'questions':'ta savol'}</span>
            <span class="badge b-amber">⏱ ${t.timeLimit || 30} daqiqa</span>
            <span class="badge b-teal">📊 ${resultCount} ${L==='ru'?'результатов':L==='en'?'results':'ta natija'}</span>
          </div>
        </div>
        <div class="test-card-actions">
          <button class="btn btn-sm" onclick="openTestResults(${t.id})">📊 Natijalar</button>
          <button class="btn btn-sm" onclick="openEditTest(${t.id})">✏️ Tahrirlash</button>
          <button class="btn btn-sm btn-del-outline" onclick="deleteTest(${t.id})">🗑</button>
        </div>
      </div>
    </div>`;
  }).join('') : `<div class="empty"><div class="empty-ic">📝</div><div class="empty-txt">${L==='ru'?'Тестов ещё нет':L==='en'?'No tests yet':"Hali test yo'q"}</div></div>`;

  wrap.innerHTML = `
    <div class="tests-panel-wrap">
      <div class="tests-top-bar">
        <select class="fsel" onchange="_testsPanelGroupFilter=this.value?parseInt(this.value)||this.value:null;renderTestsPanel()" style="min-width:220px">${groupFilterOpts}</select>
        <button class="btn btn-primary" onclick="openCreateTestModal()">${L==='ru'?'➕ Создать тест':L==='en'?'➕ Create test':L==='ru'?'➕ Создать тест':L==='en'?'➕ Create test':'➕ Yangi test yaratish'}</button>
      </div>
      <div class="tests-list">${testsListHtml}</div>
    </div>
    <div id="test-modal-overlay" class="overlay" onclick="if(event.target===this)closeTestModal()">
      <div class="modal" id="test-modal" style="max-width:700px;max-height:90vh;overflow-y:auto">
        <div class="modal-head"><div class="modal-title" id="test-modal-title">Yangi test</div><button class="modal-close" onclick="closeTestModal()">✕</button></div>
        <div class="modal-body" id="test-modal-body"></div>
        <div class="modal-foot"><button class="btn" onclick="closeTestModal()">${L==='ru'?'Отмена':L==='en'?'Cancel':'Bekor'}</button><button class="btn btn-primary" onclick="saveTest()">${L==='ru'?'💾 Сохранить':L==='en'?'💾 Save':'💾 Saqlash'}</button></div>
      </div>
    </div>
    <div id="test-results-overlay" class="overlay" onclick="if(event.target===this)closeTestResultsModal()">
      <div class="modal" style="max-width:700px;max-height:90vh;overflow-y:auto">
        <div class="modal-head"><div class="modal-title" id="test-results-title">Test natijalari</div><button class="modal-close" onclick="closeTestResultsModal()">✕</button></div>
        <div class="modal-body" id="test-results-body"></div>
        <div class="modal-foot"><button class="btn" onclick="closeTestResultsModal()">${L==='ru'?'Закрыть':L==='en'?'Close':'Yopish'}</button></div>
      </div>
    </div>`;
}

function filterTestsByGroup(groupId) {
  _testsPanelGroupFilter = groupId;
  renderTestsPanel();
}

function openCreateTestModal() {
  _editTestId = null;
  _testQuestions = [];
  renderTestFormModal({});
}

function openEditTest(id) {
  _editTestId = id;
  const t = D.tests.find(x => x.id === id);
  if (!t) return;
  _testQuestions = JSON.parse(JSON.stringify(t.questions || []));
  renderTestFormModal(t);
}

function renderTestFormModal(t) {
  const isMentor = isMentorRole();
  const cu = getCurrentUser();
  let availableGroups = D.groups;
  if (isMentor) {
    const mName = cu.mentorName || cu.name;
    availableGroups = D.groups.filter(g => g.mentor === mName);
  }
  const groupOpts = (!isMentor ? `<option value="">Barcha guruhlar</option>` : '') + availableGroups.map(g => `<option value="${g.id}" ${t.groupId==g.id?'selected':''}>${g.name} — ${g.course}</option>`).join('');
  const qHtml = _testQuestions.map((q, qi) => renderQuestionEdit(q, qi)).join('');
  document.getElementById('test-modal-title').textContent = _editTestId ? (LANG==='ru'?'✏️ Редактировать тест':LANG==='en'?'✏️ Edit test':'✏️ Testni tahrirlash') : (LANG==='ru'?'➕ Создать тест':LANG==='en'?'➕ Create test':'➕ Yangi test yaratish')
  document.getElementById('test-modal-body').innerHTML = `
    <div class="modal-section-label">📋 Test ma'lumoti</div>
    <div class="fg"><label>${L==='ru'?'Название теста':L==='en'?'Test title':'Test nomi'} <span class="req">*</span></label><input id="tf-title" value="${t.title||''}" placeholder="JavaScript asoslari testi"></div>
    <div class="form-row">
      <div class="fg"><label>${L==='ru'?'Группа':L==='en'?'Group':'Guruh'}</label><select id="tf-group">${groupOpts}</select></div>
      <div class="fg"><label>${L==='ru'?'⏱ Время (мин.)':L==='en'?'⏱ Time (min.)':'⏱ Vaqt (daqiqa)'}</label><input type="number" id="tf-time" value="${t.timeLimit||30}" min="5" max="180" style="width:100px"></div>
    </div>
    <div class="modal-section-label" style="margin-top:16px">❓ Savollar (${_testQuestions.length} ${L==='ru'?'кол-во':L==='en'?'count':'ta'})</div>
    <div id="test-questions-list">${qHtml}</div>
    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-sm" onclick="addQuestion()" style="background:var(--teal-light);color:var(--teal-text);border-color:rgba(13,148,136,.3)">${L==='ru'?'➕ Добавить вопрос':L==='en'?'➕ Add question':"➕ Savol qo'shish"}</button>
      <button class="btn btn-sm" onclick="importTestFromFile()" style="background:var(--purple-light);color:var(--purple-text);border-color:rgba(124,58,237,.3)">${L==='ru'?'📤 Загрузить из файла':L==='en'?'📤 Upload from file':'📤 Fayldan yuklash'}</button>
      <input type="file" id="tf-file-input" accept=".json,.txt" style="display:none" onchange="handleTestFileImport(this)">
    </div>`;
  document.getElementById('test-modal-overlay').classList.add('open');
}

function renderQuestionEdit(q, qi) {
  const opts = ['A','B','C','D'];
  const optsHtml = opts.map((lbl, oi) => `
    <div class="q-option-row">
      <input type="radio" name="q${qi}_correct" value="${oi}" ${q.correct===oi?'checked':''} onchange="_testQuestions[${qi}].correct=${oi}" id="qo_${qi}_${oi}">
      <label for="qo_${qi}_${oi}" style="font-weight:600;color:var(--text2);min-width:20px">${lbl})</label>
      <input class="q-opt-input" id="qopt_${qi}_${oi}" value="${(q.options&&q.options[oi])||''}" placeholder="Variant ${lbl}..." oninput="_testQuestions[${qi}].options=_testQuestions[${qi}].options||['','','',''];_testQuestions[${qi}].options[${oi}]=this.value">
    </div>`).join('');
  return `<div class="question-edit-card" id="qcard_${qi}">
    <div class="qcard-header">
      <span class="qcard-num">❓ ${qi+1}-savol</span>
      <button class="btn btn-sm btn-del-outline" style="padding:2px 8px;font-size:11px" onclick="removeQuestion(${qi})">✕</button>
    </div>
    <div class="fg" style="margin-bottom:10px">
      <input id="qtxt_${qi}" value="${q.text||''}" placeholder="Savol matnini kiriting..." oninput="_testQuestions[${qi}].text=this.value" style="font-weight:600">
    </div>
    <div class="q-options">${optsHtml}</div>
  </div>`;
}

function addQuestion() {
  _testQuestions.push({ id: 'q_'+Date.now()+'_'+_testQuestions.length, text: '', options: ['','','',''], correct: _testQuestions.length % 4 });
  document.getElementById('test-questions-list').innerHTML = _testQuestions.map((q,qi) => renderQuestionEdit(q,qi)).join('');
}

function removeQuestion(qi) {
  _testQuestions.splice(qi, 1);
  document.getElementById('test-questions-list').innerHTML = _testQuestions.map((q,i) => renderQuestionEdit(q,i)).join('');
}

function importTestFromFile() {
  document.getElementById('tf-file-input').click();
}

function handleTestFileImport(inp) {
  const file = inp.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.title) document.getElementById('tf-title').value = data.title;
      if (data.timeLimit) document.getElementById('tf-time').value = data.timeLimit;
      if (Array.isArray(data.questions)) {
        _testQuestions = data.questions.map((q,i) => ({
          id: q.id || 'q_'+Date.now()+'_'+i,
          text: q.text || '',
          options: q.options || ['','','',''],
          correct: typeof q.correct === 'number' ? q.correct : 0
        }));
        document.getElementById('test-questions-list').innerHTML = _testQuestions.map((q,qi) => renderQuestionEdit(q,qi)).join('');
        toast('✅ ' + _testQuestions.length + ' ta savol yuklandi!');
      }
    } catch(err) {
      toast('❌ Fayl formatida xato! JSON bo\'lishi kerak.');
    }
  };
  reader.readAsText(file);
  inp.value = '';
}

function saveTest() {
  const title = (document.getElementById('tf-title').value || '').trim();
  if (!title) { toast('⚠️ Test nomini kiriting!'); return; }
  if (!_testQuestions.length) { toast('⚠️ Kamida 1 ta savol qo\'shing!'); return; }
  const invalid = _testQuestions.find(q => !q.text.trim() || (q.options||[]).some(o => !o.trim()));
  if (invalid) { toast('⚠️ Barcha savol va variantlarni to\'ldiring!'); return; }
  const groupIdVal = document.getElementById('tf-group').value;
  const groupId = groupIdVal ? parseInt(groupIdVal) : null;
  const cu = getCurrentUser();
  // Mentor faqat o'z guruhiga test qo'sha oladi
  if (isMentorRole() && groupId) {
    const mName = cu.mentorName || cu.name;
    const myGroup = D.groups.find(g => g.id === groupId && g.mentor === mName);
    if (!myGroup) { toast('⚠️ Siz faqat o\'z guruhingizga test qo\'sha olasiz!'); return; }
  }
  if (isMentorRole() && !groupId) { toast('⚠️ Guruhni tanlang!'); return; }
  const timeLimit = parseInt(document.getElementById('tf-time').value) || 30;
  const testData = { title, groupId, timeLimit, questions: _testQuestions, createdBy: cu.name || cu.role, createdAt: todayStr() };
  if (_editTestId) {
    Object.assign(D.tests.find(x => x.id === _editTestId), testData);
    toast('✅ Test yangilandi!');
  } else {
    testData.id = newId();
    D.tests.push(testData);
    toast('✅ Test yaratildi!');
  }
  saveData();
  const ncTests = document.getElementById('nc-tests');
  if (ncTests) ncTests.textContent = D.tests.length;
  closeTestModal();
  renderTestsPanel();
}

function deleteTest(id) {
  if (!confirm('Bu test o\'chirilsinmi? Barcha natijalar ham o\'chadi!')) return;
  D.tests = D.tests.filter(x => x.id !== id);
  if (D.testResults[id]) delete D.testResults[id];
  saveData();
  const ncTests = document.getElementById('nc-tests');
  if (ncTests) ncTests.textContent = D.tests.length;
  toast('🗑 Test o\'chirildi');
  renderTestsPanel();
}

function openTestResults(testId) {
  const t = D.tests.find(x => x.id === testId);
  if (!t) return;
  const results = D.testResults[testId] || {};
  document.getElementById('test-results-title').textContent = '📊 ' + t.title + ' — Natijalar';
  const resultEntries = Object.entries(results).map(([sid, r]) => {
    const s = D.students.find(x => String(x.id) === String(sid));
    return { student: s, result: r };
  }).filter(x => x.student).sort((a,b) => b.result.score - a.result.score);

  if (!resultEntries.length) {
    document.getElementById('test-results-body').innerHTML = `<div class="empty"><div class="empty-ic">📊</div><div class="empty-txt">Hali hech kim test topshirmagan</div></div>`;
  } else {
    const rows = resultEntries.map((e, i) => {
      const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
      const sc = e.result.score;
      const clr = sc>=85?'var(--teal-text)':sc>=70?'var(--accent-text)':sc>=55?'var(--amber-text)':'var(--orange-text)';
      const date = e.result.completedAt ? new Date(e.result.completedAt).toLocaleString('uz') : '—';
      return `<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:var(--r-md);background:var(--bg2);border:1px solid var(--border);margin-bottom:5px">
        <span style="font-size:16px;min-width:24px">${medal||''}</span>
        <div style="flex:1"><div style="font-weight:700;font-size:13px">${e.student.firstName||''} ${e.student.lastName||e.student.name}</div><div style="font-size:11px;color:var(--text3)">${date}</div></div>
        <span style="font-size:18px;font-weight:800;color:${clr}">${sc}%</span>
        <span class="grade-letter-badge grade-${getGradeLetter(sc).toLowerCase()}">${getGradeLetter(sc)}</span>
      </div>`;
    }).join('');
    const avg = Math.round(resultEntries.reduce((s,e) => s+e.result.score, 0) / resultEntries.length);
    document.getElementById('test-results-body').innerHTML = `
      <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">
        <div style="background:var(--teal-light);border-radius:var(--r-md);padding:10px 18px;text-align:center"><div style="font-size:20px;font-weight:800;color:var(--teal-text)">${resultEntries.length}</div><div style="font-size:11px;color:var(--text3)">Topshirdi</div></div>
        <div style="background:var(--accent-light);border-radius:var(--r-md);padding:10px 18px;text-align:center"><div style="font-size:20px;font-weight:800;color:var(--accent-text)">${avg}%</div><div style="font-size:11px;color:var(--text3)">O'rtacha</div></div>
        <div style="background:var(--purple-light);border-radius:var(--r-md);padding:10px 18px;text-align:center"><div style="font-size:20px;font-weight:800;color:var(--purple-text)">${(t.questions||[]).length}</div><div style="font-size:11px;color:var(--text3)">Savollar</div></div>
      </div>
      ${rows}`;
  }
  document.getElementById('test-results-overlay').classList.add('open');
}

function closeTestModal() { document.getElementById('test-modal-overlay').classList.remove('open'); _editTestId=null; _testQuestions=[]; }
function closeTestResultsModal() { document.getElementById('test-results-overlay').classList.remove('open'); }

// ===================== STUDENT TEST TAKING =====================
function renderStudentTests(studentId, groupId) {
  if (!groupId) return '';
  const myTests = D.tests.filter(t => !t.groupId || t.groupId === groupId);
  if (!myTests.length) return `<div style="color:var(--text3);font-size:13px;padding:16px 0">Hozircha test yo'q.</div>`;
  return myTests.map(t => {
    const result = (D.testResults[t.id] && D.testResults[t.id][studentId]);
    const done = !!result;
    const scoreClr = done ? (result.score>=85?'var(--teal-text)':result.score>=55?'var(--amber-text)':'var(--orange-text)') : 'var(--text3)';
    return `<div class="student-test-card">
      <div style="flex:1">
        <div style="font-weight:700;font-size:14px;color:var(--text)">${t.title}</div>
        <div style="font-size:12px;color:var(--text3);margin-top:4px">❓ ${(t.questions||[]).length} savol · ⏱ ${t.timeLimit||30} daqiqa</div>
        ${done ? `<div style="font-size:12px;color:${scoreClr};font-weight:700;margin-top:6px">✅ Natija: ${result.score}% — ${getGradeLetter(result.score)}</div>` : ''}
      </div>
      <div>
        ${done ? `<span class="badge b-teal" style="font-size:12px">✅ Bajarildi</span>` : `<button class="btn btn-primary btn-sm" onclick="startStudentTest(${t.id},${studentId})">▶️ Boshlash</button>`}
      </div>
    </div>`;
  }).join('');
}

function renderStudentGrades(studentId, groupId) {
  if (!groupId) return '';
  const criteriaArr = (D.gradingCriteria && D.gradingCriteria[groupId]) || [];
  if (!criteriaArr.length) return `<div style="color:var(--text3);font-size:13px;padding:16px 0">Hozircha baholash mezonlari kiritilmagan.</div>`;
  const sg = (D.grades[groupId] && D.grades[groupId][studentId]) || {};
  const rows = criteriaArr.map(c => {
    const score = sg[c.id];
    const pct = score !== undefined ? Math.round((score/c.maxScore)*100) : null;
    const barClr = pct===null?'var(--border2)':pct>=85?'var(--teal)':pct>=70?'var(--accent)':pct>=55?'var(--amber)':'var(--orange)';
    return `<div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:13px;font-weight:600;color:var(--text)">${c.name}</span>
        <span style="font-size:13px;font-weight:800;color:${barClr}">${score!==undefined?score+'/'+c.maxScore:'—'}</span>
      </div>
      <div style="height:7px;background:var(--bg4);border-radius:10px;overflow:hidden">
        <div style="height:100%;width:${pct||0}%;background:${barClr};border-radius:10px;transition:width .4s"></div>
      </div>
      <div style="font-size:11px;color:var(--text3);margin-top:3px">Og'irlik: ${c.weight}% · ${pct!==null?pct+'%':'Kiritilmagan'}</div>
    </div>`;
  }).join('');
  const total = calcStudentWeightedScore(studentId, groupId);
  const letter = total.filled ? getGradeLetter(total.score) : '—';
  const letterClr = total.score>=85?'var(--teal-text)':total.score>=70?'var(--accent-text)':total.score>=55?'var(--amber-text)':'var(--orange-text)';
  return `<div>${rows}</div>
    ${total.filled ? `<div style="display:flex;align-items:center;gap:12px;background:var(--bg3);border-radius:var(--r-md);padding:12px 16px;margin-top:8px;border:1px solid var(--border2)">
      <div style="font-size:13px;color:var(--text2);font-weight:600">Yakuniy ball:</div>
      <div style="font-size:22px;font-weight:900;color:${letterClr}">${total.score}%</div>
      <span class="grade-letter-badge grade-${letter.toLowerCase()}" style="font-size:16px;padding:4px 14px">${letter}</span>
    </div>` : ''}`;
}

function startStudentTest(testId, studentId) {
  const t = D.tests.find(x => x.id === testId);
  if (!t || !t.questions || !t.questions.length) { toast(LANG==='ru'?'⚠️ В тесте нет вопросов!':LANG==='en'?'⚠️ No questions in test!':'⚠️ Test savolsiz!'); return; }
  const existResult = D.testResults[testId] && D.testResults[testId][studentId];
  if (existResult) { toast(LANG==='ru'?'Вы уже сдали этот тест!':LANG==='en'?'You have already taken this test!':'Bu testni allaqachon topshirgansiz!'); return; }
  _activeTestId = testId;
  _testAnswers = {};
  _testTimeLeft = (t.timeLimit || 30) * 60;
  renderTestTakingUI(testId, studentId);
}

function renderTestTakingUI(testId, studentId) {
  const t = D.tests.find(x => x.id === testId);
  if (!t) return;
  const wrap = document.getElementById('student-tests-wrap');
  if (!wrap) return;
  const optLabels = ['A','B','C','D'];
  const qHtml = t.questions.map((q,qi) => {
    // Shuffle option indices so answers appear in random order each time
    const shuffledIdx = [0,1,2,3].sort(() => Math.random() - 0.5);
    const optsHtml = shuffledIdx.map((origIdx, newPos) => {
      const opt = (q.options||[])[origIdx] || '';
      return `
      <label class="test-option-label" id="topt_${qi}_${origIdx}">
        <input type="radio" name="tq${qi}" value="${origIdx}" onchange="_testAnswers[${qi}]=${origIdx};highlightTestOption(${qi},${origIdx})">
        <span class="test-option-badge">${optLabels[origIdx]}</span>
        <span class="test-option-text">${opt}</span>
      </label>`;
    }).join('');
    return `<div class="test-q-card">
      <div class="test-q-num">${LANG==='ru'?`Вопрос ${qi+1}/${t.questions.length}`:LANG==='en'?`Question ${qi+1}/${t.questions.length}`:`Savol ${qi+1}/${t.questions.length}`}</div>
      <div class="test-q-text">${q.text}</div>
      <div class="test-q-options">${optsHtml}</div>
    </div>`;
  }).join('');
  wrap.innerHTML = `
    <div class="test-taking-wrap">
      <div class="test-taking-header">
        <div>
          <div style="font-size:18px;font-weight:800;color:var(--text)">${t.title}</div>
          <div style="font-size:12px;color:var(--text3);margin-top:2px">${t.questions.length} ${LANG==='ru'?'вопросов':LANG==='en'?'questions':'savol'}</div>
        </div>
        <div class="test-timer" id="test-timer-display">⏱ --:--</div>
      </div>
      <div class="test-questions-scroll">${qHtml}</div>
      <div class="test-submit-bar">
        <span style="font-size:13px;color:var(--text3)" id="test-answered-count">${LANG==='ru'?`0/${t.questions.length} ответов`:LANG==='en'?`0/${t.questions.length} answered`:`0/${t.questions.length} javob berildi`}</span>
        <button class="btn btn-primary" onclick="submitStudentTest(${testId},${studentId})">${LANG==='ru'?'✅ Завершить тест':LANG==='en'?'✅ Submit test':'✅ Testni yakunlash'}</button>
      </div>
    </div>`;

  // Start timer
  if (_testTimer) clearInterval(_testTimer);
  _testTimer = setInterval(() => {
    _testTimeLeft--;
    const m = Math.floor(_testTimeLeft/60), s = _testTimeLeft%60;
    const disp = document.getElementById('test-timer-display');
    if (disp) {
      disp.textContent = `⏱ ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      if (_testTimeLeft <= 60) disp.style.color = 'var(--orange-text)';
      if (_testTimeLeft <= 10) disp.style.background = 'var(--orange-light)';
    }
    if (_testTimeLeft <= 0) {
      clearInterval(_testTimer);
      toast('⏰ Vaqt tugadi! Avtomatik topshirildi.');
      submitStudentTest(testId, studentId, true);
    }
  }, 1000);
}

function highlightTestOption(qi, oi) {
  // Update answered count
  const t = D.tests.find(x => x.id === _activeTestId);
  if (!t) return;
  const cnt = document.getElementById('test-answered-count');
  if (cnt) cnt.textContent = Object.keys(_testAnswers).length + '/' + t.questions.length + ' javob berildi';
  // Highlight selected
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById('topt_'+qi+'_'+i);
    if (el) el.classList.toggle('selected', i === oi);
  }
}

function submitStudentTest(testId, studentId, autoSubmit) {
  if (_testTimer) { clearInterval(_testTimer); _testTimer = null; }
  const t = D.tests.find(x => x.id === testId);
  if (!t) return;
  const answered = Object.keys(_testAnswers).length;
  if (!autoSubmit && answered < t.questions.length) {
    if (!confirm(`${t.questions.length - answered} ta savol javobsiz. Baribir topshirasizmi?`)) return;
  }
  // Calculate score
  let correct = 0;
  t.questions.forEach((q, qi) => {
    if (_testAnswers[qi] === q.correct) correct++;
  });
  const score = Math.round((correct / t.questions.length) * 100);
  if (!D.testResults[testId]) D.testResults[testId] = {};
  D.testResults[testId][studentId] = {
    score,
    correct,
    total: t.questions.length,
    answers: { ..._testAnswers },
    completedAt: new Date().toISOString()
  };
  saveData();
  _activeTestId = null;
  _testAnswers = {};
  // Show result
  renderStudentTestResult(testId, studentId, score, correct, t.questions.length);
}

function renderStudentTestResult(testId, studentId, score, correct, total) {
  const wrap = document.getElementById('student-tests-wrap');
  if (!wrap) return;
  const t = D.tests.find(x => x.id === testId);
  const letter = getGradeLetter(score);
  const clr = score>=85?'var(--teal-text)':score>=70?'var(--accent-text)':score>=55?'var(--amber-text)':'var(--orange-text)';
  const emoji = score>=85?'🏆':score>=70?'🎉':score>=55?'👍':'💪';
  wrap.innerHTML = `
    <div style="text-align:center;padding:40px 20px;max-width:500px;margin:0 auto">
      <div style="font-size:64px;margin-bottom:16px">${emoji}</div>
      <div style="font-size:28px;font-weight:900;color:${clr}">${score}%</div>
      <div style="font-size:14px;color:var(--text2);margin-top:8px">${correct}/${total} to'g'ri javob</div>
      <span class="grade-letter-badge grade-${letter.toLowerCase()}" style="font-size:20px;padding:6px 20px;margin:16px auto;display:inline-block">${letter}</span>
      <div style="font-size:16px;font-weight:700;color:var(--text);margin-top:8px">${t?t.title:''}</div>
      <div style="margin-top:24px">
        <button class="btn btn-primary" onclick="renderStudentTestsPage()" style="padding:10px 28px;font-size:14px">⬅️ Testlarga qaytish</button>
      </div>
    </div>`;
}

// Patch renderStudentDashboard to include grades, tests and chat at bottom
const _origRenderStudentDashboard = renderStudentDashboard;
renderStudentDashboard = function() {
  _origRenderStudentDashboard();
  setTimeout(() => {
    const wrap = document.getElementById('student-my-wrap');
    if (!wrap) return;
    const cu = getCurrentUser();
    const studentId = cu.studentId ? parseInt(cu.studentId) : null;
    const s = studentId ? D.students.find(x => x.id === studentId) : null;
    if (!s) return;
    const groupId = s.groupId;
    const chatSectionHtml = typeof renderStudentChatSection === 'function'
      ? `<div id="stud-chat-section">${renderStudentChatSection(studentId)}</div>` : '';
    const extraHtml = `
      <div style="margin-top:24px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-lg);padding:20px 22px;box-shadow:var(--shadow-sm)">
        <div style="font-size:15px;font-weight:800;color:var(--text);margin-bottom:4px">🏅 Mening baholarim</div>
        <div style="font-size:12px;color:var(--text3);margin-bottom:14px">Guruh mezonlari bo'yicha baholar</div>
        ${renderStudentGrades(studentId, groupId)}
      </div>
      <div style="margin-top:18px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-lg);padding:20px 22px;box-shadow:var(--shadow-sm)">
        <div style="font-size:15px;font-weight:800;color:var(--text);margin-bottom:4px">📝 Mening testlarim</div>
        <div style="font-size:12px;color:var(--text3);margin-bottom:14px">Guruhingiz uchun testlar</div>
        ${renderStudentTests(studentId, groupId)}
      </div>
      ${chatSectionHtml}`;
    wrap.insertAdjacentHTML('beforeend', extraHtml);
    // scroll chat to bottom
    setTimeout(()=>{const a=document.getElementById('stud-chat-msgs');if(a)a.scrollTop=a.scrollHeight;},60);
  }, 50);
};

// ===================== MENTOR DASHBOARD =====================
function renderMentorDashboard(){
  const wrap=document.getElementById('mentor-dash-wrap');if(!wrap)return;
  const cu=getCurrentUser();
  const mentorName=cu.mentorName||cu.name;
  const mentor=D.mentors.find(m=>m.name===mentorName);
  const myGroups=D.groups.filter(g=>g.mentor===mentorName);
  const myStudents=D.students.filter(s=>myGroups.some(g=>g.id===s.groupId));
  const activeStudents=myStudents.filter(s=>s.status==='Aktiv');
  const debtors=myStudents.filter(s=>s.isDebtor);

  // Oylik hisoblash (joriy oy, 20%)
  const now=new Date();
  const curMonth=now.getMonth();const curYear=now.getFullYear();
  const txs=(D.finance||[]).filter(tx=>{const d=new Date(tx.date);return d.getFullYear()===curYear&&d.getMonth()===curMonth&&tx.type==='income';});
  const myStudentIds=myStudents.map(s=>s.id);
  let mentorIncome=0;
  txs.filter(tx=>tx.studentId&&myStudentIds.includes(tx.studentId)).forEach(tx=>mentorIncome+=tx.amount);
  if(mentorIncome===0){
    myGroups.forEach(g=>{
      const cp=getCoursePrice(g.course);const lp=cp>0?Math.round(cp/LESSON_COUNT):0;
      D.students.filter(s=>s.groupId===g.id).forEach(s=>{
        const attKey='att_'+g.id+'_'+curYear+'_'+curMonth;
        const sAtt=(D.attendance[attKey]&&D.attendance[attKey]['s'+s.id])||{};
        let ky=0;for(let l=1;l<=LESSON_COUNT;l++){const v=sAtt['l'+l]||'';if(v==='K'||v==='Y')ky++;}
        mentorIncome+=ky*lp;
      });
    });
  }
  const mySalary=Math.round(mentorIncome*MENTOR_SALARY_PCT);

  // Mentor profil qismi
  const photoHtml=mentor?mentorAvatarHtml(mentor,0,'lg'):`<div class="detail-av av-a" style="font-size:24px;width:68px;height:68px;border-radius:50%">${(mentorName||'M').substring(0,2).toUpperCase()}</div>`;
  const monthNames=L==='ru'?['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']:L==='en'?['January','February','March','April','May','June','July','August','September','October','November','December']:['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];

  // Guruh kartochkalari (qisqacha)
  const groupCardsHtml=myGroups.map((g,i)=>{
    const gStudents=D.students.filter(s=>s.groupId===g.id);
    const gActive=gStudents.filter(s=>s.status==='Aktiv').length;
    const gDebtors=gStudents.filter(s=>s.isDebtor).length;
    const DAY_FULL={Du:'Du',Se:'Se',Ch:'Ch',Pa:'Pa',Ju:'Ju',Sh:'Sh'};
    const daysStr=(g.days||[]).map(d=>DAY_FULL[d]||d).join(', ');
    return `<div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:16px 18px;box-shadow:var(--shadow-sm)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div>
          <div style="font-size:15px;font-weight:800;color:var(--text)">${g.name}</div>
          <div style="font-size:11px;color:var(--text2);margin-top:2px">📚 ${g.course}</div>
        </div>
        <span class="badge ${g.status==='Faol'?'b-teal':'b-gray'}">${g.status}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
        <div style="background:var(--bg2);border-radius:var(--r-md);padding:8px 10px;border:1px solid var(--border)">
          <div style="color:var(--text3);font-size:10px;font-weight:700;text-transform:uppercase">⏰ Vaqt</div>
          <div style="font-weight:700;color:var(--accent);margin-top:2px">${g.timeStart||'—'}–${g.timeEnd||'—'}</div>
          <div style="color:var(--text3);font-size:11px">${daysStr}</div>
        </div>
        <div style="background:var(--bg2);border-radius:var(--r-md);padding:8px 10px;border:1px solid var(--border)">
          <div style="color:var(--text3);font-size:10px;font-weight:700;text-transform:uppercase">👥 Talabalar</div>
          <div style="font-weight:700;color:var(--purple);margin-top:2px;font-size:15px">${gStudents.length} <span style="font-size:11px;color:var(--text3)">ta</span></div>
          <div style="color:var(--teal-text);font-size:11px">✅ ${gActive} aktiv${gDebtors>0?` · 💸 ${gDebtors} qarzdor`:''}</div>
        </div>
      </div>
      <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-sm btn-primary" onclick="go('mentors-my',document.getElementById('nav-mentors-my'))" style="font-size:11px;padding:5px 10px">${L==='ru'?'📅 Расписание':L==='en'?'📅 Schedule':'📅 Jadval'}</button>
        <button class="btn btn-sm" onclick="_attMonth=null;showGroupStudents(${g.id})" style="font-size:11px;padding:5px 10px">${L==='ru'?'📋 Посещаемость':L==='en'?'📋 Attendance':'📋 Davomat'}</button>
        <button class="btn btn-sm" onclick="go('grades',document.getElementById('nav-grades-mentor'));setTimeout(()=>selectGradeGroup(${g.id}),150)" style="font-size:11px;padding:5px 10px;background:var(--amber-light);color:var(--amber-text)">${L==='ru'?'🏅 Оценки':L==='en'?'🏅 Grades':'🏅 Baholar'}</button>
        <button class="btn btn-sm" onclick="go('tests',document.getElementById('nav-tests-mentor'));setTimeout(()=>filterTestsByGroup(${g.id}),150)" style="font-size:11px;padding:5px 10px;background:var(--teal-light);color:var(--teal-text)">${L==='ru'?'📝 Тесты':L==='en'?'📝 Tests':'📝 Testlar'}</button>
      </div>
    </div>`;
  }).join('');

  // Aktiv talabalar jadvali (top 8)
  const topStudents=activeStudents.slice(0,8);
  const studTableHtml=topStudents.length?`
    <div style="overflow-x:auto;margin-top:4px">
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="border-bottom:2px solid var(--border2)">
          <th style="text-align:left;padding:8px 10px;font-size:11px;color:var(--text3);font-weight:700">${L==='ru'?'Студент':L==='en'?'Student':'Talaba'}</th>
          <th style="text-align:left;padding:8px 10px;font-size:11px;color:var(--text3);font-weight:700">${L==='ru'?'Группа':L==='en'?'Group':'Guruh'}</th>
          <th style="text-align:center;padding:8px 10px;font-size:11px;color:var(--text3);font-weight:700">${L==='ru'?'Статус':L==='en'?'Status':'Holat'}</th>
          <th style="text-align:right;padding:8px 10px;font-size:11px;color:var(--text3);font-weight:700">${L==='ru'?'Оплата':L==='en'?'Payment':"To'lov"}</th>
        </tr></thead>
        <tbody>${topStudents.map((s,i)=>{
          const grp=myGroups.find(g=>g.id===s.groupId);
          return `<tr style="border-bottom:1px solid var(--border);cursor:pointer;transition:.12s" onclick="showMentorStudentDetail(${s.id})" onmouseover="this.style.background='var(--accent-light)'" onmouseout="this.style.background=''">
            <td style="padding:8px 10px;font-size:13px;font-weight:600"><div style="display:flex;align-items:center;gap:8px"><div class="av ${AV_CLS[i%5]}" style="width:26px;height:26px;font-size:9px;flex-shrink:0">${ini(s.name)}</div>${s.name}</div></td>
            <td style="padding:8px 10px;font-size:12px;color:var(--text2)">${grp?grp.name:'—'}</td>
            <td style="padding:8px 10px;text-align:center"><span class="badge b-teal" style="font-size:10px">${L==='ru'?'✅ Актив':L==='en'?'✅ Active':'✅ Aktiv'}</span></td>
            <td style="padding:8px 10px;text-align:right"><span class="${s.isDebtor?'badge b-orange':'badge b-teal'}" style="font-size:10px">${s.isDebtor?L==='ru'?'💸 Должник':L==='en'?'💸 Debtor':'💸 Qarzdor':L==='ru'?'✅ Оплачен':L==='en'?'✅ Paid':"✅ To'lagan"}</span></td>
          </tr>`;
        }).join('')}</tbody>
      </table>
      ${activeStudents.length>8?`<div style="font-size:12px;color:var(--text3);padding:8px 10px">${L==='ru'?`+ ещё ${activeStudents.length-8} активных студентов`:L==='en'?`+ ${activeStudents.length-8} more active students`:`+ yana ${activeStudents.length-8} ta aktiv talaba`}</div>`:''}
    </div>`:'<div style="color:var(--text3);font-size:13px;padding:12px 0">Aktiv talabalar yo\'q</div>';

  const isDark=_uiSettings&&_uiSettings.theme==='dark';
  const curLang=LANG||'uz';
  const curAccent=_uiSettings.accent||'blue';
  const curFs=_uiSettings.fontSize||'md';
  const themeLabel=LANG==='ru'?'Тема':LANG==='en'?'Theme':'Mavzu';
  const langLabel=LANG==='ru'?'Язык':LANG==='en'?'Language':'Til';
  const colorLabel=LANG==='ru'?'Цвет':LANG==='en'?'Color':'Rang';
  const fontLabel=LANG==='ru'?'Шрифт':LANG==='en'?'Font':'Shrift';
  const accentColors=[
    {k:'blue',  c:'#3b82f6'},
    {k:'teal',  c:'#0d9488'},
    {k:'purple',c:'#7c3aed'},
    {k:'orange',c:'#ea580c'},
    {k:'rose',  c:'#e11d48'},
    {k:'green', c:'#059669'},
  ];
  wrap.innerHTML=`<div style="padding:0 0 24px">
    <!-- Profil banner -->
    <div style="background:linear-gradient(135deg,var(--accent),var(--teal));border-radius:var(--r-lg);padding:22px 24px;color:#fff;margin-bottom:22px;position:relative;overflow:hidden">
      <div style="position:absolute;right:-10px;top:-10px;font-size:110px;opacity:.07;pointer-events:none">🎓</div>
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <div style="width:64px;height:64px;border-radius:50%;overflow:hidden;border:3px solid rgba(255,255,255,.4);flex-shrink:0;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:#fff">${mentor&&mentorPhotoSrc(mentor)?`<img src="${mentorPhotoSrc(mentor)}" style="width:100%;height:100%;object-fit:cover">`:(mentorName||'M').substring(0,2).toUpperCase()}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;opacity:.8">Xush kelibsiz,</div>
          <div style="font-size:24px;font-weight:800;letter-spacing:-.5px">${mentorName}</div>
          ${mentor?`<div style="font-size:13px;opacity:.85;margin-top:3px">📚 ${mentor.subject} · 💼 ${mentor.experience||'—'}</div>`:''}
        </div>
      </div>
      ${mentor?`<div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
        ${mentor.phone?`<span style="background:rgba(255,255,255,.2);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600">📱 ${mentor.phone}</span>`:''}
        ${mentor.email?`<span style="background:rgba(255,255,255,.2);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600">✉️ ${mentor.email}</span>`:''}
        ${mentor.telegram?`<span style="background:rgba(255,255,255,.2);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600">💬 ${mentor.telegram}</span>`:''}
      </div>`:''}
    </div>

    <!-- Statistika kartochkalar -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:22px">
      <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:16px 18px;text-align:center;box-shadow:var(--shadow-sm);cursor:pointer;transition:.15s" onclick="showMentorStatDetail('groups')" onmouseover="this.style.transform='translateY(-2px)';this.style.borderColor='var(--accent)'" onmouseout="this.style.transform='';this.style.borderColor='var(--border2)'">
        <div style="font-size:32px;font-weight:900;color:var(--accent)">${myGroups.length}</div>
        <div style="font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-top:4px">${L==='ru'?'Группы':L==='en'?'Groups':'Guruhlar'}</div>
        <div style="font-size:10px;color:var(--accent-text);margin-top:3px">${L==='ru'?'Нажмите →':L==='en'?'Click →':'Bosing →'}</div>
      </div>
      <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:16px 18px;text-align:center;box-shadow:var(--shadow-sm);cursor:pointer;transition:.15s" onclick="showMentorStatDetail('active')" onmouseover="this.style.transform='translateY(-2px)';this.style.borderColor='var(--teal)'" onmouseout="this.style.transform='';this.style.borderColor='var(--border2)'">
        <div style="font-size:32px;font-weight:900;color:var(--teal-text)">${activeStudents.length}</div>
        <div style="font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-top:4px">${L==='ru'?'Активные студенты':L==='en'?'Active students':'Aktiv talabalar'}</div>
        <div style="font-size:10px;color:var(--teal-text);margin-top:3px">${L==='ru'?'Нажмите →':L==='en'?'Click →':'Bosing →'}</div>
      </div>
      <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:16px 18px;text-align:center;box-shadow:var(--shadow-sm);cursor:pointer;transition:.15s" onclick="showMentorStatDetail('all')" onmouseover="this.style.transform='translateY(-2px)';this.style.borderColor='var(--purple)'" onmouseout="this.style.transform='';this.style.borderColor='var(--border2)'">
        <div style="font-size:32px;font-weight:900;color:var(--purple-text)">${myStudents.length}</div>
        <div style="font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-top:4px">${L==='ru'?'Всего студентов':L==='en'?'Total students':'Jami talabalar'}</div>
        <div style="font-size:10px;color:var(--purple-text);margin-top:3px">${L==='ru'?'Нажмите →':L==='en'?'Click →':'Bosing →'}</div>
      </div>
      <div style="background:var(--bg);border:1.5px solid ${debtors.length>0?'var(--orange)':'var(--teal)'};border-radius:var(--r-lg);padding:16px 18px;text-align:center;box-shadow:var(--shadow-sm);cursor:pointer;transition:.15s" onclick="showMentorStatDetail('debtors')" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
        <div style="font-size:28px;font-weight:900;color:${debtors.length>0?'var(--orange-text)':'var(--teal-text)'}">${debtors.length>0?'💸 '+debtors.length:'✅ 0'}</div>
        <div style="font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-top:4px">${L==='ru'?'Должники':L==='en'?'Debtors':'Qarzdorlar'}</div>
        <div style="font-size:10px;color:var(--accent-text);margin-top:3px">${L==='ru'?'Нажмите →':L==='en'?'Click →':'Bosing →'}</div>
      </div>
      <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:16px 18px;text-align:center;box-shadow:var(--shadow-sm)">
        <div style="font-size:22px;font-weight:900;color:var(--purple-text)">${fmtMoney(mySalary)}<span style="font-size:13px"> so'm</span></div>
        <div style="font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-top:4px">${monthNames[curMonth]} ${L==='ru'?'зарплата (20%)':L==='en'?'salary (20%)':'oyligi (20%)'}</div>
      </div>
    </div>
    <!-- Ikki ustun: Guruhlar + Aktiv talabalar -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
      <div>
        <div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:12px">${L==='ru'?'🗂 Мои группы':L==='en'?'🗂 My Groups':'🗂 Mening guruhlarim'}</div>
        ${myGroups.length?groupCardsHtml:`<div style="color:var(--text3);font-size:13px;padding:12px 0">${L==='ru'?'Группы не назначены':L==='en'?'No groups assigned':'Sizga guruh biriktirilmagan'}</div>`}
      </div>
      <div>
        <div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:12px">${L==='ru'?'✅ Активные студенты':L==='en'?'✅ Active students':'✅ Aktiv talabalar'}</div>
        <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:16px;box-shadow:var(--shadow-sm)">
          ${studTableHtml}
        </div>
      </div>
    </div>
  </div>`;
}

// ===================== MENTOR CHAT =====================
// Chat storage key: mentor_chat_{mentorName}_{studentId}
function getMentorChatKey(mentorName, studentId){ return 'mchat_'+btoa(mentorName).replace(/=/g,'')+'_'+studentId; }
function getMentorChats(mentorName){
  try{ return JSON.parse(localStorage.getItem('mchat_list_'+btoa(mentorName).replace(/=/g,''))||'{}'); }catch(e){return{};}
}
function saveMentorChats(mentorName, obj){ localStorage.setItem('mchat_list_'+btoa(mentorName).replace(/=/g,''), JSON.stringify(obj)); }
function getMentorChatMessages(mentorName, studentId){
  try{ return JSON.parse(localStorage.getItem(getMentorChatKey(mentorName, studentId))||'[]'); }catch(e){return[];}
}
function saveMentorChatMessages(mentorName, studentId, msgs){ localStorage.setItem(getMentorChatKey(mentorName, studentId), JSON.stringify(msgs)); }

let _chatSelectedStudent=null;

function renderMentorChat(){
  const wrap=document.getElementById('mentor-chat-wrap');if(!wrap)return;
  const L=LANG;
  const cu=getCurrentUser();
  const mentorName=cu.mentorName||cu.name;
  const myGroups=D.groups.filter(g=>g.mentor===mentorName);
  const myStudents=D.students.filter(s=>myGroups.some(g=>g.id===s.groupId)&&s.status!=='Arxiv');

  if(!myStudents.length){
    wrap.innerHTML=`<div style="text-align:center;padding:60px 20px;color:var(--text3)"><div style="font-size:48px;margin-bottom:16px">💬</div><div style="font-size:16px;font-weight:600">${L==='ru'?'Нет студентов':L==='en'?'No students':"Talabalar yo'q"}</div><div style="font-size:13px;margin-top:8px">${L==='ru'?'В ваших группах пока нет студентов':L==='en'?"No students in your groups yet":"Sizning guruhlaringizda hali talabalar yo'q"}</div></div>`;
    return;
  }

  if(!_chatSelectedStudent) _chatSelectedStudent=myStudents[0].id;
  const selSt=myStudents.find(s=>s.id===_chatSelectedStudent)||myStudents[0];
  const msgs=getMentorChatMessages(mentorName, selSt.id);

  // sidebar: talabalar ro'yxati
  const studentListHtml=myStudents.map((s,i)=>{
    const grp=myGroups.find(g=>g.id===s.groupId);
    const lastMsgs=getMentorChatMessages(mentorName,s.id);
    const last=lastMsgs.length?lastMsgs[lastMsgs.length-1]:null;
    const isActive=s.id===selSt.id;
    const unread=lastMsgs.filter(m=>!m.read&&m.from==='student').length;
    return `<div onclick="_chatSelectedStudent=${s.id};renderMentorChat()" style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border);background:${isActive?'var(--accent-light)':'var(--bg)'};transition:background .15s" onmouseover="if(!${isActive})this.style.background='var(--bg2)'" onmouseout="if(!${isActive})this.style.background='var(--bg)'">
      <div class="av ${AV_CLS[i%5]}" style="width:36px;height:36px;font-size:12px;flex-shrink:0">${ini(s.name)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;color:${isActive?'var(--accent-text)':'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.name}${unread>0?`<span style="background:var(--accent);color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:10px;margin-left:6px">${unread}</span>`:''}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${grp?grp.name:'—'}${last?` · ${last.text.substring(0,20)}...`:` · ${L==='ru'?'Нет сообщений':L==='en'?'No messages':"Xabar yo'q"}`}</div>
      </div>
    </div>`;
  }).join('');

  // Messages area
  const msgsHtml=msgs.length?msgs.map(m=>{
    const isMentor=m.from==='mentor';
    const time=m.time?new Date(m.time).toLocaleTimeString('uz-UZ',{hour:'2-digit',minute:'2-digit'}):'';
    return `<div style="display:flex;justify-content:${isMentor?'flex-end':'flex-start'};margin-bottom:10px">
      <div style="max-width:70%;background:${isMentor?'var(--accent)':'var(--bg2)'};color:${isMentor?'#fff':'var(--text)'};padding:10px 14px;border-radius:${isMentor?'14px 14px 4px 14px':'14px 14px 14px 4px'};font-size:13px;line-height:1.5;box-shadow:var(--shadow-sm)">
        ${m.text}
        <div style="font-size:10px;opacity:.7;margin-top:4px;text-align:right">${time}${isMentor?' ✓':''}</div>
      </div>
    </div>`;
  }).join(''):`<div style="text-align:center;padding:40px 20px;color:var(--text3)"><div style="font-size:40px;margin-bottom:10px">💬</div><div>${L==='ru'?'Нет сообщений. Напишите первым!':L==='en'?'No messages yet. Say hello!':"Hali xabar yo'q. Birinchi xabarni yuboring!"}</div></div>`;

  wrap.innerHTML=`<div style="display:flex;height:calc(100vh - 120px);min-height:400px;gap:0;border:1px solid var(--border2);border-radius:var(--r-lg);overflow:hidden;background:var(--bg)">
    <!-- Talabalar ro'yxati sidebar -->
    <div style="width:260px;flex-shrink:0;border-right:1px solid var(--border2);overflow-y:auto;background:var(--bg2)">
      <div style="padding:14px;border-bottom:1px solid var(--border2);font-size:14px;font-weight:800;color:var(--text)">${L==='ru'?'💬 Студенты':L==='en'?'💬 Students':'💬 Talabalar'}</div>
      ${studentListHtml}
    </div>
    <!-- Chat area -->
    <div style="flex:1;display:flex;flex-direction:column;min-width:0">
      <!-- Header -->
      <div style="padding:12px 16px;border-bottom:1px solid var(--border2);background:var(--bg2);display:flex;align-items:center;gap:10px">
        <div class="av ${AV_CLS[myStudents.findIndex(s=>s.id===selSt.id)%5]}" style="width:36px;height:36px;font-size:12px;flex-shrink:0">${ini(selSt.name)}</div>
        <div>
          <div style="font-size:14px;font-weight:700;color:var(--text)">${selSt.name}</div>
          <div style="font-size:11px;color:var(--text3)">${(myGroups.find(g=>g.id===selSt.groupId)||{}).name||'—'} · <span class="badge b-teal" style="font-size:9px">${selSt.status}</span></div>
        </div>
      </div>
      <!-- Messages -->
      <div id="chat-msgs-area" style="flex:1;overflow-y:auto;padding:16px">
        ${msgsHtml}
      </div>
      <!-- Input -->
      <div style="padding:12px 16px;border-top:1px solid var(--border2);background:var(--bg2);display:flex;gap:8px;align-items:flex-end">
        <textarea id="chat-input-text" placeholder="${L==='ru'?'Написать сообщение...':L==='en'?'Type a message...':'Xabar yozing...'}" rows="2" style="flex:1;resize:none;padding:10px 14px;border:1.5px solid var(--border2);border-radius:12px;background:var(--bg);color:var(--text);font-size:13px;font-family:inherit;outline:none" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMentorMessage('${mentorName.replace(/'/g,"\\'")}',${selSt.id});}"></textarea>
        <button class="btn btn-primary" onclick="sendMentorMessage('${mentorName.replace(/'/g,"\\'")}',${selSt.id})" style="padding:10px 18px;align-self:stretch">${L==='ru'?'➤ Отправить':L==='en'?'➤ Send':'➤ Yuborish'}</button>
      </div>
    </div>
  </div>`;

  // Scroll to bottom
  setTimeout(()=>{const area=document.getElementById('chat-msgs-area');if(area)area.scrollTop=area.scrollHeight;},50);
  // Mark student msgs as read
  const updated=msgs.map(m=>({...m,read:true}));
  saveMentorChatMessages(mentorName, selSt.id, updated);
}

function sendMentorMessage(mentorName, studentId){
  const inp=document.getElementById('chat-input-text');if(!inp)return;
  const text=(inp.value||'').trim();if(!text)return;
  const msgs=getMentorChatMessages(mentorName, studentId);
  msgs.push({from:'mentor',text,time:new Date().toISOString(),read:true});
  saveMentorChatMessages(mentorName, studentId, msgs);
  inp.value='';
  renderMentorChat();
}

// Also allow students to see/reply chat from their dashboard
function renderStudentChatSection(studentId){
  const cu=getCurrentUser();
  const s=D.students.find(x=>x.id===studentId);if(!s)return '';
  const grp=D.groups.find(g=>g.id===s.groupId);if(!grp||!grp.mentor)return '';
  const mentorName=grp.mentor;
  const msgs=getMentorChatMessages(mentorName, studentId);
  const msgsHtml=msgs.length?msgs.map(m=>{
    const isMentor=m.from==='mentor';
    const time=m.time?new Date(m.time).toLocaleTimeString('uz-UZ',{hour:'2-digit',minute:'2-digit'}):'';
    return `<div style="display:flex;justify-content:${isMentor?'flex-start':'flex-end'};margin-bottom:8px">
      <div style="max-width:75%;background:${isMentor?'var(--bg3)':'var(--accent)'};color:${isMentor?'var(--text)':'#fff'};padding:8px 12px;border-radius:${isMentor?'12px 12px 12px 4px':'12px 12px 4px 12px'};font-size:13px;line-height:1.5;box-shadow:var(--shadow-sm)">
        ${isMentor?`<div style="font-size:10px;font-weight:700;opacity:.7;margin-bottom:3px">🎓 ${mentorName}</div>`:''}
        ${m.text}
        <div style="font-size:10px;opacity:.6;text-align:right;margin-top:3px">${time}</div>
      </div>
    </div>`;
  }).join(''):`<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px">Xabar yo'q. Mentorga savol yuboring!</div>`;

  return `<div style="margin-top:20px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-lg);padding:20px 22px;box-shadow:var(--shadow-sm)">
    <div style="font-size:15px;font-weight:800;color:var(--text);margin-bottom:4px">💬 Mentor bilan chat</div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:14px">🎓 ${mentorName}</div>
    <div id="stud-chat-msgs" style="max-height:240px;overflow-y:auto;margin-bottom:12px;padding:4px 0">${msgsHtml}</div>
    <div style="display:flex;gap:8px">
      <input type="text" id="stud-chat-inp" placeholder="Savolingizni yozing..." style="flex:1;padding:9px 14px;border:1.5px solid var(--border2);border-radius:10px;background:var(--bg);color:var(--text);font-size:13px" onkeydown="if(event.key==='Enter')sendStudentMessage('${mentorName.replace(/'/g,"\\'")}',${studentId})">
      <button class="btn btn-primary btn-sm" onclick="sendStudentMessage('${mentorName.replace(/'/g,"\\'")}',${studentId})">➤</button>
    </div>
  </div>`;
}

function sendStudentMessage(mentorName, studentId){
  const inp=document.getElementById('stud-chat-inp');if(!inp)return;
  const text=(inp.value||'').trim();if(!text)return;
  const msgs=getMentorChatMessages(mentorName, studentId);
  msgs.push({from:'student',text,time:new Date().toISOString(),read:false});
  saveMentorChatMessages(mentorName, studentId, msgs);
  inp.value='';
  // Re-render chat section
  const chatWrap=document.getElementById('stud-chat-section');
  if(chatWrap){chatWrap.innerHTML=renderStudentChatSection(studentId);}
  // Scroll
  setTimeout(()=>{const a=document.getElementById('stud-chat-msgs');if(a)a.scrollTop=a.scrollHeight;},30);
}

// ===================== TALABA ALOHIDA SAHIFALAR =====================

// Helper: joriy talaba ma'lumotlarini olish
function getCurrentStudentInfo(){
  const cu=getCurrentUser();
  const studentId=cu.studentId?parseInt(cu.studentId):null;
  const s=studentId?D.students.find(x=>x.id===studentId):null;
  const grp=s?D.groups.find(x=>x.id===s.groupId):null;
  return {cu,studentId,s,grp};
}

// ===================== DARS JADVALI SAHIFASI =====================
function renderStudentSchedulePage(){
  const wrap=document.getElementById('student-schedule-wrap');if(!wrap)return;
  const {s,grp}=getCurrentStudentInfo();
  const notFoundLbl=LANG==='ru'?'Студент не найден':LANG==='en'?'Student not found':'Talaba topilmadi';
  const noGroupLbl=LANG==='ru'?'Группа не назначена':LANG==='en'?'No group assigned':'Guruh biriktirilmagan';
  if(!s){wrap.innerHTML=`<div style="text-align:center;padding:60px 20px;color:var(--text3)"><div style="font-size:48px">📅</div><div style="font-size:15px;font-weight:600;margin-top:12px">${notFoundLbl}</div></div>`;return;}
  if(!grp){wrap.innerHTML=`<div style="text-align:center;padding:60px 20px;color:var(--text3)"><div style="font-size:48px">👥</div><div style="font-size:15px;font-weight:600;margin-top:12px">${noGroupLbl}</div></div>`;return;}

  const DAY_SHORT_UZ={Du:'Du',Se:'Se',Ch:'Ch',Pa:'Pa',Ju:'Ju',Sh:'Sh'};
  const DAY_SHORT_RU={Du:'Пн',Se:'Вт',Ch:'Ср',Pa:'Чт',Ju:'Пт',Sh:'Сб'};
  const DAY_SHORT_EN={Du:'Mon',Se:'Tue',Ch:'Wed',Pa:'Thu',Ju:'Fri',Sh:'Sat'};
  const DAY_LONG_UZ={Du:'Dushanba',Se:'Seshanba',Ch:'Chorshanba',Pa:'Payshanba',Ju:'Juma',Sh:'Shanba'};
  const DAY_LONG_RU={Du:'Понедельник',Se:'Вторник',Ch:'Среда',Pa:'Четверг',Ju:'Пятница',Sh:'Суббота'};
  const DAY_LONG_EN={Du:'Monday',Se:'Tuesday',Ch:'Wednesday',Pa:'Thursday',Ju:'Friday',Sh:'Saturday'};
  const DAY_SHORT=LANG==='ru'?DAY_SHORT_RU:LANG==='en'?DAY_SHORT_EN:DAY_SHORT_UZ;
  const DAY_LONG=LANG==='ru'?DAY_LONG_RU:LANG==='en'?DAY_LONG_EN:DAY_LONG_UZ;

  const today=new Date();
  const todayDay=['Yak','Du','Se','Ch','Pa','Ju','Sh'][today.getDay()];
  const days=grp.days||[];
  const dayOrder=['Du','Se','Ch','Pa','Ju','Sh','Yak'];
  const todayIdx=dayOrder.indexOf(todayDay);
  let nextDay=null,daysUntil=999;
  days.forEach(d=>{
    const idx=dayOrder.indexOf(d);
    const diff=idx>=todayIdx?idx-todayIdx:7-(todayIdx-idx);
    if(diff<daysUntil){daysUntil=diff;nextDay=d;}
  });

  const todayLbl=LANG==='ru'?'Сегодня 🟢':LANG==='en'?'Today 🟢':'Bugun 🟢';
  const nextLbl=LANG==='ru'?'Следующий →':LANG==='en'?'Next →':'Keyingi →';
  const daysHtml=dayOrder.filter(d=>d!=='Yak').map(d=>{
    const active=days.includes(d);
    const isToday=d===todayDay&&active;
    const isNext=d===nextDay&&daysUntil>0;
    return `<div style="flex:1;min-width:72px;border-radius:var(--r-lg);border:2px solid ${isToday?'var(--teal)':isNext?'var(--accent)':'var(--border2)'};background:${isToday?'var(--teal-light)':isNext?'var(--accent-light)':active?'var(--bg2)':'var(--bg3)'};padding:14px 8px;text-align:center;opacity:${active?1:0.35}">
      <div style="font-size:11px;font-weight:700;color:${isToday?'var(--teal-text)':isNext?'var(--accent-text)':'var(--text3)'};text-transform:uppercase;letter-spacing:.5px">${DAY_SHORT[d]||d}</div>
      <div style="font-size:12px;font-weight:800;color:${isToday?'var(--teal-text)':isNext?'var(--accent-text)':'var(--text)'};margin-top:4px">${DAY_LONG[d]||d}</div>
      ${isToday?`<div style="font-size:10px;color:var(--teal-text);margin-top:4px;font-weight:700">${todayLbl}</div>`:''}
      ${isNext&&!isToday?`<div style="font-size:10px;color:var(--accent-text);margin-top:4px;font-weight:700">${nextLbl}</div>`:''}
      ${active&&!isToday&&!isNext?`<div style="font-size:18px;margin-top:4px">📚</div>`:''}
    </div>`;
  }).join('');

  const attStats=[];
  if(D.attendance){
    const keys=Object.keys(D.attendance).filter(k=>k.startsWith('att_'+grp.id+'_')).sort();
    const monthNames=getMonthNames(true);
    keys.forEach(k=>{
      const parts=k.split('_');const yr=parseInt(parts[3]),mn=parseInt(parts[4]);
      const sAtt=D.attendance[k]?.['s'+s.id]||{};
      let p=0,a=0,e=0;
      for(let l=1;l<=LESSON_COUNT;l++){const v=sAtt['l'+l]||'';if(v==='K')p++;else if(v==='Y')a++;else if(v==='S')e++;}
      if(p+a+e>0) attStats.push({yr,mn,p,a,e,pct:Math.round(p/(p+a+e)*100),label:(monthNames[mn]||mn)+' '+yr});
    });
  }

  const noAttLbl=LANG==='ru'?'Посещаемость ещё не отмечена':LANG==='en'?'No attendance recorded yet':'Hali davomat belgilanmagan';
  const attHtml=attStats.length?attStats.map(x=>{
    const c=x.pct>=80?'var(--teal-text)':x.pct>=60?'var(--amber-text)':'var(--orange-text)';
    const bc=x.pct>=80?'var(--teal-light)':x.pct>=60?'var(--amber-light)':'rgba(234,88,12,.08)';
    return `<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:${bc};border-radius:var(--r-md);border:1px solid var(--border)">
      <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:100px">${x.label}</div>
      <div style="flex:1;height:10px;background:var(--bg4);border-radius:5px;overflow:hidden"><div style="height:100%;width:${x.pct}%;background:${c};border-radius:5px;transition:width .4s"></div></div>
      <span style="font-size:13px;font-weight:800;color:${c};min-width:40px;text-align:right">${x.pct}%</span>
      <span style="font-size:11px;color:var(--text3)">K:${x.p} Y:${x.a} S:${x.e}</span>
    </div>`;
  }).join(''):`<div style="text-align:center;padding:30px;color:var(--text3);font-size:13px">${noAttLbl}</div>`;

  const schedLbl=LANG==='ru'?'Расписание занятий':LANG==='en'?'Class Schedule':'Dars jadvali';
  const groupWord=LANG==='ru'?'группа':LANG==='en'?'group':'guruhi';
  const weekLbl=LANG==='ru'?'📆 Расписание недели':LANG==='en'?'📆 Weekly Schedule':'📆 Haftalik jadval';
  const groupInfoLbl=LANG==='ru'?'ℹ️ О группе':LANG==='en'?'ℹ️ Group Info':'ℹ️ Guruh ma\'lumotlari';
  const mentorLbl=LANG==='ru'?'🎓 Ментор':LANG==='en'?'🎓 Mentor':'🎓 Mentor';
  const mentorRoleLbl=LANG==='ru'?'Ментор группы':LANG==='en'?'Group mentor':'Guruh mentori';
  const writeLbl=LANG==='ru'?'💬 Написать ментору →':LANG==='en'?'💬 Write to mentor →':'💬 Mentorga yozish →';
  const attHistLbl=LANG==='ru'?'📊 История посещаемости':LANG==='en'?'📊 Attendance History':'📊 Davomat tarixi';
  const todayClassLbl=LANG==='ru'?'🟢 Урок сегодня!':LANG==='en'?'🟢 Class today!':'🟢 Bugun dars bor!';
  const nextClassLbl=LANG==='ru'?`⏳ Следующий урок через ${daysUntil} дн.`:LANG==='en'?`⏳ Next class in ${daysUntil} day(s)`:`⏳ Keyingi dars: ${daysUntil} kundan`;
  const roomXona=LANG==='ru'?'-каб.':LANG==='en'?'-room':'-xona';
  const crsLbl=LANG==='ru'?'📚 Курс':LANG==='en'?'📚 Course':'📚 Kurs';
  const strtLbl=LANG==='ru'?'📋 Начало':LANG==='en'?'📋 Start':'📋 Boshlanish';
  const durLbl=LANG==='ru'?'⏱ Длит.':LANG==='en'?'⏱ Duration':'⏱ Davomiylik';
  const roomLabel=LANG==='ru'?'🚪 Кабинет':LANG==='en'?'🚪 Room':'🚪 Xona';
  const timeLabel=LANG==='ru'?'⏰ Время':LANG==='en'?'⏰ Time':'⏰ Vaqt';

  wrap.innerHTML=`<div style="padding:0 0 32px">
    <div style="background:linear-gradient(135deg,var(--teal),var(--accent));border-radius:var(--r-lg);padding:22px 26px;color:#fff;margin-bottom:20px;position:relative;overflow:hidden">
      <div style="position:absolute;right:-10px;top:-10px;font-size:100px;opacity:.08">📅</div>
      <div style="font-size:13px;opacity:.85">${schedLbl}</div>
      <div style="font-size:22px;font-weight:800;margin:4px 0">${grp.name} ${groupWord}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
        <span style="background:rgba(255,255,255,.2);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">⏰ ${grp.timeStart||'—'} – ${grp.timeEnd||'—'}</span>
        <span style="background:rgba(255,255,255,.2);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">🚪 ${grp.room||'—'}${roomXona}</span>
        <span style="background:rgba(255,255,255,.2);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">🎓 ${grp.mentor||'—'}</span>
        ${nextDay&&daysUntil===0?`<span style="background:rgba(255,255,255,.3);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">${todayClassLbl}</span>`:''}
        ${nextDay&&daysUntil>0?`<span style="background:rgba(255,255,255,.2);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">${nextClassLbl}</span>`:''}
      </div>
    </div>
    <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:20px 22px;margin-bottom:20px;box-shadow:var(--shadow-sm)">
      <div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:14px">${weekLbl}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${daysHtml}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
      <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:18px 20px;box-shadow:var(--shadow-sm)">
        <div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:14px">${groupInfoLbl}</div>
        <div style="display:flex;flex-direction:column;gap:9px;font-size:13px">
          <div style="display:flex;gap:8px"><span style="color:var(--text3);min-width:100px">${crsLbl}</span><span style="font-weight:600">${grp.course||'—'}</span></div>
          <div style="display:flex;gap:8px"><span style="color:var(--text3);min-width:100px">${strtLbl}</span><span style="font-weight:600">${fmtDate(grp.startDate)}</span></div>
          <div style="display:flex;gap:8px"><span style="color:var(--text3);min-width:100px">${durLbl}</span><span style="font-weight:600">${grp.duration||'—'}</span></div>
          <div style="display:flex;gap:8px"><span style="color:var(--text3);min-width:100px">${roomLabel}</span><span style="font-weight:600;color:var(--teal-text)">${grp.room||'—'}</span></div>
          <div style="display:flex;gap:8px"><span style="color:var(--text3);min-width:100px">${timeLabel}</span><span style="font-weight:700;color:var(--accent)">${grp.timeStart||'—'} – ${grp.timeEnd||'—'}</span></div>
        </div>
      </div>
      <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:18px 20px;box-shadow:var(--shadow-sm)">
        <div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:14px">${mentorLbl}</div>
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
          <div class="av av-0" style="width:48px;height:48px;font-size:18px;flex-shrink:0">${ini(grp.mentor||'M')}</div>
          <div>
            <div style="font-size:16px;font-weight:800;color:var(--text)">${grp.mentor||'—'}</div>
            <div style="font-size:12px;color:var(--text3);margin-top:2px">${mentorRoleLbl}</div>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" style="width:100%" onclick="go('student-chat',document.getElementById('nav-student-chat'))">${writeLbl}</button>
      </div>
    </div>
    <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:20px 22px;box-shadow:var(--shadow-sm)">
      <div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:16px">${attHistLbl}</div>
      <div style="display:flex;flex-direction:column;gap:8px">${attHtml}</div>
    </div>
  </div>`;
}
// ===================== GURUH REYTINGI SAHIFASI =====================
function renderStudentRatingPage(){
  const wrap=document.getElementById('student-rating-wrap');if(!wrap)return;
  const {s,grp}=getCurrentStudentInfo();
  const noDataLbl=LANG==='ru'?'Данные не найдены':LANG==='en'?'Data not found':'Ma\'lumot topilmadi';
  if(!s||!grp){wrap.innerHTML=`<div style="text-align:center;padding:60px;color:var(--text3)"><div style="font-size:48px">🏆</div><div style="font-size:15px;font-weight:600;margin-top:12px">${noDataLbl}</div></div>`;return;}

  const ratings=calcGroupRating(grp.id);
  const myRank=ratings.findIndex(x=>x.id===s.id)+1;
  const myRating=calcStudentRating(s.id,grp.id);
  const statusBadge={Aktiv:'b-teal',Faolsiz:'b-gray',Muzlatilgan:'b-blue',Probatsiya:'b-amber',Arxiv:'b-purple'};

  const topHtml=ratings.slice(0,3).map((r,idx)=>{
    const medal=['🥇','🥈','🥉'][idx];
    const isMe=r.id===s.id;
    const c=r.rating>=80?'var(--teal-text)':r.rating>=60?'var(--amber-text)':'var(--orange-text)';
    const heights=['80px','64px','52px'];
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;flex:1">
      <div class="av ${AV_CLS[idx%5]}" style="width:52px;height:52px;font-size:18px;border:3px solid ${isMe?'var(--accent)':'transparent'}">${ini(r.name)}</div>
      <div style="font-size:12px;font-weight:700;color:${isMe?'var(--accent-text)':'var(--text)'};text-align:center;max-width:90px">${r.name}${isMe?' 👈':''}</div>
      <div style="font-size:11px;font-weight:800;color:${c}">${r.rating}%</div>
      <div style="width:100%;height:${heights[idx]};background:${c};border-radius:var(--r-md) var(--r-md) 0 0;opacity:.8;position:relative">
        <div style="position:absolute;top:-24px;left:50%;transform:translateX(-50%);font-size:20px">${medal}</div>
      </div>
    </div>`;
  }).join('');

  const youLbl=LANG==='ru'?'(Вы)':LANG==='en'?'(You)':'(Siz)';
  const listHtml=ratings.map((r,idx)=>{
    const isMe=r.id===s.id;
    const rc=r.rating>=80?'var(--teal-text)':r.rating>=60?'var(--amber-text)':'var(--orange-text)';
    const rgBg=r.rating>=80?'var(--teal)':r.rating>=60?'var(--amber)':'var(--orange)';
    const medal=idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':`${idx+1}`;
    return `<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:var(--r-md);border:${isMe?'2px solid var(--accent)':'1.5px solid var(--border)'};background:${isMe?'var(--accent-light)':'var(--bg2)'};margin-bottom:6px;transition:.2s">
      <span style="font-size:${idx<3?'16px':'13px'};min-width:30px;text-align:center;font-weight:800">${medal}</span>
      <div class="av ${AV_CLS[idx%5]}" style="width:34px;height:34px;font-size:12px;flex-shrink:0;border:${isMe?'2px solid var(--accent)':'2px solid transparent'}">${ini(r.name)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:${isMe?700:500};color:${isMe?'var(--accent-text)':'var(--text)'}">${r.name}${isMe?' '+youLbl:''}</div>
        <div style="height:4px;background:var(--bg4);border-radius:2px;margin-top:4px;overflow:hidden"><div style="height:100%;width:${r.rating}%;background:${rgBg};border-radius:2px"></div></div>
      </div>
      ${r.isDebtor?`<span style="font-size:11px;color:var(--orange-text);font-weight:700">💸</span>`:''}
      <span style="font-size:14px;font-weight:800;color:${rc};min-width:46px;text-align:right">${r.rating}%</span>
    </div>`;
  }).join('');

  const ratingColor=myRating>=80?'var(--teal-text)':myRating>=60?'var(--amber-text)':'var(--orange-text)';
  const ratingTitle=LANG==='ru'?'Рейтинг группы':LANG==='en'?'Group Rating':'Guruh reytingi';
  const groupWord=LANG==='ru'?'группа':LANG==='en'?'group':'guruhi';
  const myRankLbl=LANG==='ru'?`Ваше место: ${myRank}/${ratings.length}`:LANG==='en'?`Your rank: ${myRank}/${ratings.length}`:`Sizning o'rningiz: ${myRank}/${ratings.length}`;
  const myRatingLbl=LANG==='ru'?`Ваш рейтинг: ${myRating}%`:LANG==='en'?`Your rating: ${myRating}%`:`Reytingiz: ${myRating}%`;
  const top3Lbl=LANG==='ru'?'🏅 Топ 3 студента':LANG==='en'?'🏅 Top 3 Students':'🏅 Top 3 talaba';
  const fullListLbl=LANG==='ru'?'📋 Полный рейтинг':LANG==='en'?'📋 Full Ranking':'📋 To\'liq reyting';
  const byAttLbl=LANG==='ru'?'(по посещаемости)':LANG==='en'?'(by attendance)':'(davomat foizi bo\'yicha)';

  wrap.innerHTML=`<div style="padding:0 0 32px">
    <div style="background:linear-gradient(135deg,var(--accent),#7c3aed);border-radius:var(--r-lg);padding:22px 26px;color:#fff;margin-bottom:20px;position:relative;overflow:hidden">
      <div style="position:absolute;right:-10px;top:-10px;font-size:100px;opacity:.08">🏆</div>
      <div style="font-size:13px;opacity:.85">${ratingTitle}</div>
      <div style="font-size:22px;font-weight:800;margin:4px 0">${grp.name} ${groupWord}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
        <span style="background:rgba(255,255,255,.2);padding:4px 14px;border-radius:20px;font-size:13px;font-weight:700">${myRankLbl}</span>
        <span style="background:rgba(255,255,255,.2);padding:4px 14px;border-radius:20px;font-size:13px;font-weight:700">${myRatingLbl}</span>
      </div>
    </div>
    ${ratings.length>=2?`<div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:24px 22px 0;margin-bottom:20px;box-shadow:var(--shadow-sm)">
      <div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:20px">${top3Lbl}</div>
      <div style="display:flex;align-items:flex-end;gap:12px;padding-top:32px">${topHtml}</div>
    </div>`:''}
    <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:20px 22px;box-shadow:var(--shadow-sm)">
      <div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:14px">${fullListLbl} <span style="font-size:12px;font-weight:500;color:var(--text3)">${byAttLbl}</span></div>
      <div>${listHtml}</div>
    </div>
  </div>`;
}
// ===================== BAHOLASH SAHIFASI (TALABA) =====================
function renderStudentGradesPage(){
  const wrap=document.getElementById('student-grades-wrap');if(!wrap)return;
  const {s,grp}=getCurrentStudentInfo();
  const noDataLbl = LANG==='ru'?'Данные не найдены':LANG==='en'?'Data not found':'Ma\'lumot topilmadi';
  if(!s||!grp){wrap.innerHTML=`<div style="text-align:center;padding:60px;color:var(--text3)"><div style="font-size:48px">🏅</div><div style="font-size:15px;font-weight:600;margin-top:12px">${noDataLbl}</div></div>`;return;}

  const weightedData=calcStudentWeightedScore(s.id,grp.id);
  const score=weightedData.score; // already percentage (weighted)
  const letter=weightedData.letter;
  const filled=weightedData.filled;
  const criteria=D.gradingCriteria?.[grp.id]||[];
  const grades=D.grades?.[grp.id]?.[s.id]||{};
  const gradeColor=score>=90?'var(--teal-text)':score>=80?'var(--accent-text)':score>=70?'var(--amber-text)':'var(--orange-text)';

  const noCriteriaLbl = LANG==='ru'?'Критерии оценки не добавлены':LANG==='en'?'No grading criteria added':'Baholash mezonlari qo\'shilmagan';
  const criteriaLbl = LANG==='ru'?'Результаты по критериям':LANG==='en'?'Results by Criteria':'Mezonlar bo\'yicha natijalar';
  const weightLbl = LANG==='ru'?'Вес':LANG==='en'?'Weight':'Og\'irlik';
  const scoreLbl = LANG==='ru'?'Балл':LANG==='en'?'Score':'Ball';
  const notEnteredLbl = LANG==='ru'?'Не введено':LANG==='en'?'Not entered':'Kiritilmagan';
  const finalGradeLbl = LANG==='ru'?'Итоговая оценка':LANG==='en'?'Final Grade':'Yakuniy baho';
  const totalPctLbl = LANG==='ru'?'Общий процент':LANG==='en'?'Total Percent':'Umumiy foiz';
  const gradingResultsLbl = LANG==='ru'?'Результаты оценки':LANG==='en'?'Grading Results':'Baholash natijalari';
  const noCriteriaYetLbl = LANG==='ru'?'Ещё нет критериев. Ментор добавит их.':LANG==='en'?'No criteria yet. Mentor will add them.':'Hali mezon yo\'q. Mentor qo\'shganda ko\'rinadi.';

  const criteriaHtml=criteria.length?criteria.map(c=>{
    const val=grades[c.id];
    const hasVal = val !== undefined && val !== null;
    const pct2=hasVal && c.maxScore>0?Math.round(val/c.maxScore*100):0;
    const cc=!hasVal?'var(--text3)':pct2>=80?'var(--teal-text)':pct2>=60?'var(--amber-text)':'var(--orange-text)';
    const barBg=!hasVal?'var(--bg4)':pct2>=80?'var(--teal)':pct2>=60?'var(--amber)':'var(--orange)';
    return `<div style="background:var(--bg2);border:1.5px solid var(--border);border-radius:var(--r-md);padding:16px 18px;transition:.15s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div>
          <div style="font-size:13px;font-weight:700;color:var(--text)">${c.name}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px">${weightLbl}: <b>${c.weight}%</b></div>
        </div>
        <div style="text-align:right">
          <div style="font-size:20px;font-weight:900;color:${cc}">${hasVal?val:'—'}<span style="font-size:11px;font-weight:500;color:var(--text3)">/${c.maxScore}</span></div>
          <div style="font-size:11px;font-weight:700;color:${cc}">${hasVal?pct2+'%':notEnteredLbl}</div>
        </div>
      </div>
      <div style="height:10px;background:var(--bg4);border-radius:6px;overflow:hidden"><div style="height:100%;width:${pct2}%;background:${barBg};border-radius:6px;transition:width .6s ease"></div></div>
    </div>`;
  }).join(''):`<div style="text-align:center;padding:40px 20px;color:var(--text3)"><div style="font-size:40px;margin-bottom:10px">📋</div><div style="font-size:13px;font-weight:600">${noCriteriaYetLbl}</div></div>`;

  wrap.innerHTML=`<div style="padding:0 0 32px">
    <!-- Banner -->
    <div style="background:linear-gradient(135deg,var(--amber),var(--accent));border-radius:var(--r-lg);padding:22px 26px;color:#fff;margin-bottom:20px;position:relative;overflow:hidden">
      <div style="position:absolute;right:-10px;top:-10px;font-size:100px;opacity:.08">🏅</div>
      <div style="font-size:13px;opacity:.85">${gradingResultsLbl}</div>
      <div style="font-size:22px;font-weight:800;margin:4px 0">${s.name}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
        <span style="background:rgba(255,255,255,.25);padding:4px 14px;border-radius:20px;font-size:13px;font-weight:700">📚 ${grp.name}</span>
        <span style="background:rgba(255,255,255,.25);padding:4px 14px;border-radius:20px;font-size:13px;font-weight:700">🎓 ${grp.mentor||'—'}</span>
        ${filled?`<span style="background:rgba(255,255,255,.3);padding:4px 14px;border-radius:20px;font-size:14px;font-weight:800">🏅 ${letter} · ${score}%</span>`:''}
      </div>
    </div>

    <!-- Umumiy natija -->
    ${filled?`<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
      <div style="background:var(--bg);border:2px solid ${gradeColor};border-radius:var(--r-lg);padding:20px;text-align:center;box-shadow:var(--shadow-sm)">
        <div style="font-size:56px;font-weight:900;color:${gradeColor}">${letter}</div>
        <div style="font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-top:4px">${finalGradeLbl}</div>
      </div>
      <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:20px;text-align:center;box-shadow:var(--shadow-sm)">
        <div style="font-size:40px;font-weight:900;color:${gradeColor}">${score}%</div>
        <div style="font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-top:4px">${totalPctLbl}</div>
        <div style="width:100%;height:10px;background:var(--bg4);border-radius:6px;margin-top:10px;overflow:hidden"><div style="height:100%;width:${score}%;background:${gradeColor};border-radius:6px;transition:width .6s"></div></div>
      </div>
    </div>`:''}

    <!-- Mezonlar bo'yicha tafsilot -->
    <div style="background:var(--bg);border:1.5px solid var(--border2);border-radius:var(--r-lg);padding:20px 22px;box-shadow:var(--shadow-sm)">
      <div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:16px">📋 ${criteriaLbl}</div>
      <div style="display:flex;flex-direction:column;gap:10px">${criteriaHtml}</div>
    </div>

  </div>`;
}

// ===================== TESTLAR SAHIFASI (TALABA) =====================
function renderStudentTestsPage(){
  const wrap=document.getElementById('student-tests-wrap');if(!wrap)return;
  const {s,grp}=getCurrentStudentInfo();
  if(!s||!grp){wrap.innerHTML=`<div style="text-align:center;padding:60px;color:var(--text3)"><div style="font-size:48px">📝</div><div style="font-size:15px;font-weight:600;margin-top:12px">Ma'lumot topilmadi</div></div>`;return;}

  const tests=(D.tests||[]).filter(t=>t.groupId===grp.id);

  if(!tests.length){
    wrap.innerHTML=`<div style="text-align:center;padding:60px;color:var(--text3)"><div style="font-size:48px">📝</div><div style="font-size:15px;font-weight:600;margin-top:12px">Hozircha testlar yo'q</div><div style="font-size:13px;margin-top:8px">Mentor test qo'shganda bu yerda ko'rinadi</div></div>`;
    return;
  }

  const testsHtml=tests.map(t=>{
    const result=D.testResults?.[t.id]?.[s.id];
    const done=!!result;
    const pct=done?Math.round(result.score/t.questions.length*100):null;
    const pc=done?(pct>=80?'var(--teal-text)':pct>=60?'var(--amber-text)':'var(--orange-text)'):null;
    const startLbl=LANG==='ru'?'▶ Начать тест':LANG==='en'?'▶ Start Test':'▶ Testni boshlash';
    const doneLbl=LANG==='ru'?'Завершён ✅':LANG==='en'?'Completed ✅':'Yakunlandi ✅';
    const newLbl=LANG==='ru'?'Новый 🆕':LANG==='en'?'New 🆕':'Yangi 🆕';
    const qLbl=LANG==='ru'?'вопросов':LANG==='en'?'questions':'ta savol';
    const minLbl=LANG==='ru'?'мин':LANG==='en'?'min':'daqiqa';
    return `<div style="background:var(--bg);border:2px solid ${done?'var(--border2)':'var(--accent)'};border-radius:var(--r-lg);padding:18px 20px;box-shadow:var(--shadow-sm);cursor:${done?'default':'pointer'};transition:.15s"
      ${!done?`onclick="startStudentTest(${t.id},${s.id})"
      onmouseover="if(!${done})this.style.transform='translateY(-2px)';this.style.boxShadow='var(--shadow)'"
      onmouseout="this.style.transform='';this.style.boxShadow='var(--shadow-sm)'"`:''}>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
        <div style="flex:1">
          <div style="font-size:15px;font-weight:800;color:var(--text)">${t.title}</div>
          <div style="font-size:12px;color:var(--text3);margin-top:4px">📚 ${grp.course} · ${t.questions.length} ${qLbl}${t.timeLimit?` · ⏱ ${t.timeLimit} ${minLbl}`:''}</div>
        </div>
        ${done?`<div style="text-align:center;background:var(--bg2);border-radius:var(--r-md);padding:10px 16px;border:1px solid var(--border)">
          <div style="font-size:20px;font-weight:900;color:${pc}">${pct}%</div>
          <div style="font-size:10px;color:var(--text3);">${result.score}/${t.questions.length}</div>
        </div>`:`<span style="background:var(--accent-light);color:var(--accent-text);padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;border:1px solid var(--accent)">${newLbl}</span>`}
      </div>
      <div style="margin-top:14px">
        ${done?`<div style="display:flex;gap:8px;align-items:center">
          <div style="flex:1;height:8px;background:var(--bg4);border-radius:4px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${pc};border-radius:4px"></div></div>
          <span style="font-size:12px;font-weight:700;color:var(--text3)">${doneLbl}</span>
        </div>`
        :`<div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--accent-light);border-radius:var(--r-md);border:1px dashed var(--accent)">
          <span style="font-size:13px;color:var(--accent-text);font-weight:700">👆 ${startLbl}</span>
        </div>`}
      </div>
    </div>`;
  }).join('');

  const done=tests.filter(t=>D.testResults?.[t.id]?.[s.id]).length;
  wrap.innerHTML=`<div style="padding:0 0 32px">
    <!-- Banner -->
    <div style="background:linear-gradient(135deg,#0d9488,#0ea5e9);border-radius:var(--r-lg);padding:22px 26px;color:#fff;margin-bottom:20px;position:relative;overflow:hidden">
      <div style="position:absolute;right:-10px;top:-10px;font-size:100px;opacity:.08">📝</div>
      <div style="font-size:13px;opacity:.85">Testlar</div>
      <div style="font-size:22px;font-weight:800;margin:4px 0">${grp.name} guruhi</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
        <span style="background:rgba(255,255,255,.2);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">📝 ${tests.length} ta test</span>
        <span style="background:rgba(255,255,255,.2);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">✅ ${done} ta yakunlangan</span>
        <span style="background:rgba(255,255,255,.2);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">⏳ ${tests.length-done} ta qolgan</span>
      </div>
    </div>
    <div id="student-test-taking-wrap"></div>
    <div style="display:flex;flex-direction:column;gap:12px">${testsHtml}</div>
  </div>`;
}

// ===================== CHAT SAHIFASI (ALOHIDA) =====================
function renderStudentChatPage(){
  const wrap=document.getElementById('student-chat-wrap');if(!wrap)return;
  const {s,grp}=getCurrentStudentInfo();
  if(!s||!grp){
    wrap.innerHTML=`<div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:var(--text3)"><div style="font-size:48px">💬</div><div style="font-size:15px;font-weight:600">Ma'lumot topilmadi</div></div>`;
    return;
  }
  const mentorName=grp.mentor||'';
  const msgs=getMentorChatMessages(mentorName,s.id)||[];
  const msgsHtml=msgs.length?msgs.map(m=>{
    const isMe=m.from==='student';
    const time=new Date(m.ts).toLocaleTimeString('uz',{hour:'2-digit',minute:'2-digit'});
    const date=new Date(m.ts).toLocaleDateString('uz',{day:'2-digit',month:'short'});
    return `<div style="display:flex;justify-content:${isMe?'flex-end':'flex-start'};margin-bottom:10px">
      <div style="max-width:72%;padding:10px 14px;border-radius:${isMe?'16px 4px 16px 16px':'4px 16px 16px 16px'};background:${isMe?'var(--accent)':'var(--bg3)'};color:${isMe?'#fff':'var(--text)'};font-size:13px;line-height:1.5;box-shadow:var(--shadow-sm)">
        <div style="font-size:10px;opacity:.7;margin-bottom:4px;font-weight:600">${isMe?'Siz':'🎓 '+mentorName} · ${date} ${time}</div>
        ${m.text}
      </div>
    </div>`;
  }).join(''):`<div style="text-align:center;padding:40px;color:var(--text3)"><div style="font-size:48px;margin-bottom:12px">💬</div><div style="font-size:14px;font-weight:600">Hali xabar yo'q</div><div style="font-size:12px;margin-top:6px">Mentorga savol yuboring!</div></div>`;

  wrap.innerHTML=`
    <div style="padding:16px 20px;border-bottom:1px solid var(--border);background:var(--bg2);flex-shrink:0;display:flex;align-items:center;gap:12px">
      <div class="av av-0" style="width:40px;height:40px;font-size:14px;flex-shrink:0">${ini(mentorName||'M')}</div>
      <div><div style="font-size:15px;font-weight:800;color:var(--text)">${mentorName||'—'}</div><div style="font-size:11px;color:var(--text3)">Guruh mentori · ${grp.name}</div></div>
    </div>
    <div id="student-chat-page-msgs" style="flex:1;overflow-y:auto;padding:16px 20px;background:var(--bg)">${msgsHtml}</div>
    <div style="padding:12px 16px;border-top:1px solid var(--border);background:var(--bg2);flex-shrink:0;display:flex;gap:8px">
      <input type="text" id="student-chat-page-inp" placeholder="${L==='ru'?'Написать сообщение...':L==='en'?'Type a message...':'Xabar yozing...'}" style="flex:1;padding:10px 14px;border:1.5px solid var(--border2);border-radius:12px;background:var(--bg);color:var(--text);font-size:13px" onkeydown="if(event.key==='Enter')sendStudentChatPageMsg()">
      <button class="btn btn-primary" onclick="sendStudentChatPageMsg()" style="padding:10px 18px">➤</button>
    </div>`;

  // Scroll to bottom
  setTimeout(()=>{const m=document.getElementById('student-chat-page-msgs');if(m)m.scrollTop=m.scrollHeight;},50);
}

function sendStudentChatPageMsg(){
  const {s,grp}=getCurrentStudentInfo();
  if(!s||!grp)return;
  const inp=document.getElementById('student-chat-page-inp');
  const text=(inp?.value||'').trim();
  if(!text)return;
  const mentorName=grp.mentor||'';
  const msgs=getMentorChatMessages(mentorName,s.id)||[];
  msgs.push({from:'student',text,ts:Date.now()});
  saveMentorChatMessages(mentorName,s.id,msgs);
  inp.value='';
  renderStudentChatPage();
}

// Dashboard da click qilinganda tafsilot ko'rsatish (talaba)
function showStudentDetailPopup(field){
  const {s,grp}=getCurrentStudentInfo();
  if(!s)return;
  const DAY_FULL={Du:'Dushanba',Se:'Seshanba',Ch:'Chorshanba',Pa:'Payshanba',Ju:'Juma',Sh:'Shanba'};

  let html='',title='';
  if(field==='rating'){
    title='🏆 Reyting tafsiloti';
    const ratings=grp?calcGroupRating(grp.id):[];
    const myRank=ratings.findIndex(x=>x.id===s.id)+1;
    const statusBadge={Aktiv:'b-teal',Faolsiz:'b-gray',Muzlatilgan:'b-blue',Probatsiya:'b-amber',Arxiv:'b-purple'};
    const listHtml=ratings.map((r,idx)=>{
      const isMe=r.id===s.id;
      const rc=r.rating>=80?'var(--teal-text)':r.rating>=60?'var(--amber-text)':'var(--orange-text)';
      const medal=idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':`${idx+1}.`;
      return `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:var(--r-md);border:1.5px solid ${isMe?'var(--accent)':'var(--border)'};background:${isMe?'var(--accent-light)':'var(--bg2)'};margin-bottom:5px">
        <span style="font-size:14px;min-width:28px;text-align:center">${medal}</span>
        <div class="av ${AV_CLS[idx%5]}" style="width:28px;height:28px;font-size:10px;flex-shrink:0">${ini(r.name)}</div>
        <span style="flex:1;font-size:13px;font-weight:${isMe?700:400};color:${isMe?'var(--accent-text)':'var(--text)'}">${r.name}${isMe?' (Siz)':''}</span>
        <span class="badge ${statusBadge[r.status]||'b-gray'}" style="font-size:10px">${r.status}</span>
        <span style="font-size:14px;font-weight:800;color:${rc}">${r.rating}%</span>
      </div>`;
    }).join('');
    html=`<div style="margin-bottom:12px;background:var(--accent-light);border-radius:var(--r-md);padding:12px 16px;border:1px solid var(--accent)"><span style="font-size:13px;font-weight:700;color:var(--accent-text)">Sizning o'rningiz: ${myRank}/${ratings.length} · Reyting: ${calcStudentRating(s.id,grp?.id)}%</span></div>${listHtml}`;
  } else if(field==='schedule'){
    title='📅 Dars jadvali';
    html=grp?`<div style="display:flex;flex-direction:column;gap:10px;font-size:14px">
      <div style="display:flex;gap:10px;align-items:center"><span style="color:var(--text3);min-width:100px">⏰ Vaqt</span><span style="font-weight:700;color:var(--accent);font-size:16px">${grp.timeStart||'—'} – ${grp.timeEnd||'—'}</span></div>
      <div style="display:flex;gap:10px;align-items:center"><span style="color:var(--text3);min-width:100px">🚪 Xona</span><span style="font-weight:700;color:var(--teal-text);font-size:16px">${grp.room||'—'}-xona</span></div>
      <div style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--text3);min-width:100px">📆 Kunlar</span><div style="display:flex;flex-wrap:wrap;gap:6px">${(grp.days||[]).map(d=>`<span style="background:var(--accent-light);color:var(--accent-text);padding:4px 12px;border-radius:12px;font-size:12px;font-weight:700;border:1px solid var(--accent)">${DAY_FULL[d]||d}</span>`).join('')}</div></div>
      <div style="display:flex;gap:10px;align-items:center"><span style="color:var(--text3);min-width:100px">🎓 Mentor</span><span style="font-weight:600">${grp.mentor||'—'}</span></div>
      <div style="display:flex;gap:10px;align-items:center"><span style="color:var(--text3);min-width:100px">📚 Kurs</span><span style="font-weight:600">${grp.course||'—'}</span></div>
      <div style="display:flex;gap:10px;align-items:center"><span style="color:var(--text3);min-width:100px">📋 Boshlanish</span><span style="font-weight:600">${fmtDate(grp.startDate)}</span></div>
    </div>`:'<div style="color:var(--text3)">Guruh topilmadi</div>';
  } else if(field==='debt'){
    title='💸 To\'lov holati';
    html=`<div style="text-align:center;padding:20px 0">
      <div style="font-size:56px">${s.isDebtor?'💸':'✅'}</div>
      <div style="font-size:20px;font-weight:800;margin-top:12px;color:${s.isDebtor?'var(--orange-text)':'var(--teal-text)'}">${s.isDebtor?'Qarzdor':'To\'lov qilingan'}</div>
      ${s.isDebtor?`<div style="font-size:13px;color:var(--text3);margin-top:8px">12 ta darsdan keyin avtomatik ravishda qarzdor sifatida belgilanadi</div>`:`<div style="font-size:13px;color:var(--text3);margin-top:8px">Barcha to'lovlar amalga oshirilgan</div>`}
      <div style="margin-top:16px;background:var(--bg2);border-radius:var(--r-md);padding:12px 16px;text-align:left">
        <div style="font-size:12px;color:var(--text3);margin-bottom:6px;font-weight:600">Talaba ma'lumotlari:</div>
        <div style="font-size:13px;display:flex;gap:8px"><span style="color:var(--text3)">Holat:</span><span class="badge ${s.status==='Aktiv'?'b-teal':'b-gray'}">${s.status}</span></div>
        ${s.phone?`<div style="font-size:13px;margin-top:6px;display:flex;gap:8px"><span style="color:var(--text3)">Telefon:</span><span style="font-weight:600">${s.phone}</span></div>`:''}
      </div>
    </div>`;
  } else if(field==='attendance'){
    title='📊 Davomat tafsiloti';
    const now=new Date();const cm=now.getMonth(),cy=now.getFullYear();
    const attKey='att_'+(s.groupId)+'_'+cy+'_'+cm;
    const sAtt=(D.attendance&&D.attendance[attKey]&&D.attendance[attKey]['s'+s.id])||{};
    let present=0,absent=0,excused=0;
    for(let l=1;l<=LESSON_COUNT;l++){const v=sAtt['l'+l]||'';if(v==='K')present++;else if(v==='Y')absent++;else if(v==='S')excused++;}
    const marked=present+absent+excused;
    const pct=marked>0?Math.round(present/marked*100):0;
    html=`<div>
      <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
        <span style="background:var(--teal-light);color:var(--teal-text);padding:6px 14px;border-radius:12px;font-weight:700;font-size:13px">✅ Keldi: ${present}</span>
        <span style="background:var(--amber-light);color:var(--amber-text);padding:6px 14px;border-radius:12px;font-weight:700;font-size:13px">❌ Yo'q: ${absent}</span>
        <span style="background:var(--purple-light);color:var(--purple-text);padding:6px 14px;border-radius:12px;font-weight:700;font-size:13px">📝 Sababli: ${excused}</span>
      </div>
      <div style="font-size:13px;font-weight:600;color:var(--text3);margin-bottom:8px">Bu oy (har bir dars):</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${Array.from({length:LESSON_COUNT},(_,i)=>{
          const v=sAtt['l'+(i+1)]||'';
          const styleMap={'':'background:var(--bg3);border-color:var(--border2);color:var(--text3)','K':'background:var(--teal-light);border-color:var(--teal);color:var(--teal-text)','Y':'background:var(--amber-light);border-color:var(--amber);color:var(--amber-text)','S':'background:var(--purple-light);border-color:var(--purple);color:var(--purple-text)'};
          return `<div style="display:flex;flex-direction:column;align-items:center;gap:3px"><span style="font-size:9px;color:var(--text3)">${i+1}</span><div style="${styleMap[v]||styleMap['']};width:32px;height:28px;border-radius:6px;border:1.5px solid;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;font-family:'JetBrains Mono',monospace">${v||'·'}</div></div>`;
        }).join('')}
      </div>
      <div style="margin-top:14px;font-size:16px;font-weight:800;color:${pct>=80?'var(--teal-text)':pct>=60?'var(--amber-text)':'var(--orange-text)'};text-align:center">${pct}% davomat</div>
    </div>`;
  }

  // Show in detail modal
  document.getElementById('detail-title').textContent=title;
  document.getElementById('detail-body').innerHTML=html;
  document.getElementById('detail-foot').innerHTML=`<button class="btn" onclick="closeDetail()">${L==='ru'?'Закрыть':L==='en'?'Close':'Yopish'}</button>`;
  document.getElementById('detail-overlay').classList.add('open');
}


// ===================== MENTOR DASHBOARD POPUP FUNKSIYALAR =====================

function showMentorStatDetail(type) {
  const cu = getCurrentUser();
  const mentorName = cu.mentorName || cu.name;
  const myGroups = D.groups.filter(g => g.mentor === mentorName);
  const myStudents = D.students.filter(s => myGroups.some(g => g.id === s.groupId));
  const activeStudents = myStudents.filter(s => s.status === 'Aktiv');
  const debtors = myStudents.filter(s => s.isDebtor);
  const DAY_FULL = {Du:'Du',Se:'Se',Ch:'Ch',Pa:'Pa',Ju:'Ju',Sh:'Sh'};
  const statusBadge = {Aktiv:'b-teal',Faolsiz:'b-gray',Muzlatilgan:'b-blue',Probatsiya:'b-amber',Arxiv:'b-purple'};
  let title = '', html = '';

  if (type === 'groups') {
    title = '🗂 Mening guruhlarim';
    html = myGroups.length ? myGroups.map(g => {
      const cnt = D.students.filter(s => s.groupId === g.id).length;
      const active = D.students.filter(s => s.groupId === g.id && s.status === 'Aktiv').length;
      const daysStr = (g.days||[]).map(d => DAY_FULL[d]||d).join(', ');
      return `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-md);padding:14px 16px;margin-bottom:8px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div style="font-size:14px;font-weight:800;color:var(--text)">${g.name}</div>
          <span class="badge ${g.status==='Faol'?'b-teal':'b-gray'}">${g.status}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px">
          <div><span style="color:var(--text3)">📚 Kurs: </span><b>${g.course}</b></div>
          <div><span style="color:var(--text3)">⏰ Vaqt: </span><b style="color:var(--accent)">${g.timeStart||'—'}–${g.timeEnd||'—'}</b></div>
          <div><span style="color:var(--text3)">🚪 Xona: </span><b>${g.room||'—'}</b></div>
          <div><span style="color:var(--text3)">📆 Kun: </span><b>${daysStr||'—'}</b></div>
          <div><span style="color:var(--text3)">👥 Talaba: </span><b>${cnt} ta (${active} aktiv)</b></div>
          <div><span style="color:var(--text3)">📋 Boshl: </span><b>${fmtDate(g.startDate)}</b></div>
        </div>
        <div style="margin-top:10px;display:flex;gap:6px">
          <button class="btn btn-sm btn-primary" style="font-size:11px" onclick="closeDetail();_attMonth=null;showGroupStudents(${g.id})">${L==='ru'?'📋 Посещаемость':L==='en'?'📋 Attendance':'📋 Davomat'}</button>
          <button class="btn btn-sm" style="font-size:11px;background:var(--purple-light);color:var(--purple-text)" onclick="closeDetail();showMentorGroupRating(${g.id})">🏆 Reyting</button>
        </div>
      </div>`;
    }).join('') : '<div style="color:var(--text3);padding:16px 0;text-align:center">Guruhlar yo\'q</div>';

  } else if (type === 'active') {
    title = '✅ Aktiv talabalar';
    html = activeStudents.length ? `<div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="border-bottom:2px solid var(--border2)">
          <th style="text-align:left;padding:7px 10px;font-size:11px;color:var(--text3)">${L==='ru'?'Студент':L==='en'?'Student':'Talaba'}</th>
          <th style="text-align:left;padding:7px 10px;font-size:11px;color:var(--text3)">${L==='ru'?'Группа':L==='en'?'Group':'Guruh'}</th>
          <th style="text-align:right;padding:7px 10px;font-size:11px;color:var(--text3)">${L==='ru'?'Оплата':L==='en'?'Payment':"To'lov"}</th>
        </tr></thead>
        <tbody>${activeStudents.map((s,i) => {
          const grp = myGroups.find(g => g.id === s.groupId);
          return `<tr style="border-bottom:1px solid var(--border);cursor:pointer;transition:.12s" onclick="closeDetail();setTimeout(()=>showMentorStudentDetail(${s.id}),200)" onmouseover="this.style.background='var(--bg2)'" onmouseout="this.style.background=''">
            <td style="padding:7px 10px"><div style="display:flex;align-items:center;gap:7px"><div class="av ${AV_CLS[i%5]}" style="width:24px;height:24px;font-size:9px;flex-shrink:0">${ini(s.name)}</div><span style="font-size:12px;font-weight:600">${s.name}</span></div></td>
            <td style="padding:7px 10px;font-size:12px;color:var(--text2)">${grp?grp.name:'—'}</td>
            <td style="padding:7px 10px;text-align:right"><span class="${s.isDebtor?'badge b-orange':'badge b-teal'}" style="font-size:10px">${s.isDebtor?'💸':'✅'}</span></td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>` : '<div style="color:var(--text3);padding:16px 0;text-align:center">Aktiv talabalar yo\'q</div>';

  } else if (type === 'all') {
    title = '👥 Barcha talabalar';
    const statusIcon = {Aktiv:'✅',Faolsiz:'⛔',Muzlatilgan:'❄️',Probatsiya:'🔶',Arxiv:'📦'};
    html = myStudents.length ? `<div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="border-bottom:2px solid var(--border2)">
          <th style="text-align:left;padding:7px 10px;font-size:11px;color:var(--text3)">${L==='ru'?'Студент':L==='en'?'Student':'Talaba'}</th>
          <th style="text-align:left;padding:7px 10px;font-size:11px;color:var(--text3)">${L==='ru'?'Статус':L==='en'?'Status':'Holat'}</th>
          <th style="text-align:right;padding:7px 10px;font-size:11px;color:var(--text3)">${L==='ru'?'Оплата':L==='en'?'Payment':"To'lov"}</th>
        </tr></thead>
        <tbody>${myStudents.map((s,i) => {
          const grp = myGroups.find(g => g.id === s.groupId);
          const rating = calcStudentRating(s.id, s.groupId);
          return `<tr style="border-bottom:1px solid var(--border);cursor:pointer;transition:.12s" onclick="closeDetail();setTimeout(()=>showMentorStudentDetail(${s.id}),200)" onmouseover="this.style.background='var(--bg2)'" onmouseout="this.style.background=''">
            <td style="padding:7px 10px"><div style="display:flex;align-items:center;gap:7px"><div class="av ${AV_CLS[i%5]}" style="width:24px;height:24px;font-size:9px;flex-shrink:0">${ini(s.name)}</div><div><div style="font-size:12px;font-weight:600">${s.name}</div><div style="font-size:10px;color:var(--text3)">${grp?grp.name:'—'}</div></div></div></td>
            <td style="padding:7px 10px"><span class="badge ${statusBadge[s.status]||'b-gray'}" style="font-size:10px">${statusIcon[s.status]||''} ${s.status}</span></td>
            <td style="padding:7px 10px;text-align:right"><span style="font-size:12px;font-weight:700;color:${rating>=80?'var(--teal-text)':rating>=60?'var(--amber-text)':'var(--orange-text)'}">${rating}%</span></td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>` : '<div style="color:var(--text3);padding:16px 0;text-align:center">Talabalar yo\'q</div>';

  } else if (type === 'debtors') {
    title = '💸 Qarzdor talabalar';
    html = debtors.length ? debtors.map((s,i) => {
      const grp = myGroups.find(g => g.id === s.groupId);
      const absences = calcAbsences(s.id, s.groupId);
      return `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(234,88,12,.06);border:1px solid rgba(234,88,12,.2);border-radius:var(--r-md);margin-bottom:7px;cursor:pointer" onclick="closeDetail();setTimeout(()=>showMentorStudentDetail(${s.id}),200)">
        <div class="av av-2" style="width:34px;height:34px;font-size:12px;flex-shrink:0">${ini(s.name)}</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:700;color:var(--text)">${s.name}</div>
          <div style="font-size:11px;color:var(--text3)">${grp?grp.name:'—'} · 📞 ${s.phone||'—'}</div>
          <div style="font-size:11px;color:var(--orange-text);margin-top:2px">⚠️ ${absences} ta dars o'tkazilgan</div>
        </div>
        <span style="font-size:22px">💸</span>
      </div>`;
    }).join('') : '<div style="text-align:center;padding:30px;color:var(--teal-text)"><div style="font-size:36px">✅</div><div style="font-size:14px;font-weight:600;margin-top:8px">Qarzdor yo\'q!</div></div>';
  }

  document.getElementById('detail-title').textContent = title;
  document.getElementById('detail-body').innerHTML = html;
  document.getElementById('detail-foot').innerHTML = `<button class="btn" onclick="closeDetail()">${L==='ru'?'Закрыть':L==='en'?'Close':'Yopish'}</button>`;
  document.getElementById('detail-overlay').classList.add('open');
}

// Mentor uchun: bitta talabaning to'liq ma'lumoti popup
function showMentorStudentDetail(studentId) {
  const s = D.students.find(x => x.id === studentId);
  if (!s) return;
  const grp = D.groups.find(g => g.id === s.groupId);
  const rating = calcStudentRating(s.id, s.groupId);
  const ratingColor = rating>=80?'var(--teal-text)':rating>=60?'var(--amber-text)':'var(--orange-text)';
  const statusBadge = {Aktiv:'b-teal',Faolsiz:'b-gray',Muzlatilgan:'b-blue',Probatsiya:'b-amber',Arxiv:'b-purple'};
  const statusIcon = {Aktiv:'✅',Faolsiz:'⛔',Muzlatilgan:'❄️',Probatsiya:'🔶',Arxiv:'📦'};

  // Joriy oy davomati
  const now = new Date(); const cm = now.getMonth(), cy = now.getFullYear();
  const attKey = 'att_'+(s.groupId)+'_'+cy+'_'+cm;
  const sAtt = (D.attendance&&D.attendance[attKey]&&D.attendance[attKey]['s'+s.id])||{};
  let present=0,absent=0,excused=0;
  for(let l=1;l<=LESSON_COUNT;l++){const v=sAtt['l'+l]||'';if(v==='K')present++;else if(v==='Y')absent++;else if(v==='S')excused++;}
  const marked=present+absent+excused;
  const pct=marked>0?Math.round(present/marked*100):0;
  const pctColor=pct>=80?'var(--teal-text)':pct>=60?'var(--amber-text)':'var(--orange-text)';

  // Davomat kataklari
  const cellsHtml = Array.from({length:LESSON_COUNT},(_,i)=>{
    const v=sAtt['l'+(i+1)]||'';
    const styleMap={'':'background:var(--bg3);border-color:var(--border2);color:var(--text3)','K':'background:var(--teal-light);border-color:var(--teal);color:var(--teal-text)','Y':'background:var(--amber-light);border-color:var(--amber);color:var(--amber-text)','S':'background:var(--purple-light);border-color:var(--purple);color:var(--purple-text)'};
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px"><span style="font-size:9px;color:var(--text3)">${i+1}</span><div style="${styleMap[v]||styleMap['']};width:28px;height:24px;border-radius:5px;border:1.5px solid;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;font-family:'JetBrains Mono',monospace">${v||'·'}</div></div>`;
  }).join('');

  // Guruh reytingidagi o'rni
  const ratings = grp ? calcGroupRating(grp.id) : [];
  const myRank = ratings.findIndex(x=>x.id===s.id)+1;

  // Baholash natijalari
  const {score, maxScore, letter} = calcStudentWeightedScore(s.id, s.groupId);

  const html = `<div>
    <!-- Shaxsiy banner -->
    <div style="background:linear-gradient(135deg,var(--accent),var(--teal));border-radius:var(--r-lg);padding:16px 18px;color:#fff;margin-bottom:16px;display:flex;align-items:center;gap:14px">
      <div class="av av-0" style="width:52px;height:52px;font-size:18px;flex-shrink:0;border:2px solid rgba(255,255,255,.4)">${ini(s.name)}</div>
      <div>
        <div style="font-size:18px;font-weight:800">${s.name}</div>
        <div style="font-size:12px;opacity:.85;margin-top:3px">${grp?grp.name:'—'} · ${grp?grp.course:'—'}</div>
        <span class="badge ${statusBadge[s.status]||'b-gray'}" style="font-size:10px;margin-top:4px">${statusIcon[s.status]||''} ${s.status}</span>
      </div>
    </div>

    <!-- Stat'lar -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
      <div style="background:var(--bg2);border-radius:var(--r-md);padding:10px;text-align:center;border:1px solid var(--border)">
        <div style="font-size:20px;font-weight:900;color:${ratingColor}">${rating}%</div>
        <div style="font-size:10px;color:var(--text3);font-weight:700;margin-top:2px">Reyting</div>
      </div>
      <div style="background:var(--bg2);border-radius:var(--r-md);padding:10px;text-align:center;border:1px solid var(--border)">
        <div style="font-size:20px;font-weight:900;color:${pctColor}">${pct}%</div>
        <div style="font-size:10px;color:var(--text3);font-weight:700;margin-top:2px">Bu oy davomat</div>
      </div>
      <div style="background:var(--bg2);border-radius:var(--r-md);padding:10px;text-align:center;border:1px solid ${s.isDebtor?'var(--orange)':'var(--teal)'}">
        <div style="font-size:16px;font-weight:900;color:${s.isDebtor?'var(--orange-text)':'var(--teal-text)'}">${s.isDebtor?'💸':'✅'}</div>
        <div style="font-size:10px;color:var(--text3);font-weight:700;margin-top:2px">To'lov</div>
      </div>
    </div>

    <!-- Ma'lumotlar -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;margin-bottom:14px">
      ${s.phone?`<div style="display:flex;gap:6px"><span style="color:var(--text3)">📱</span><b>${s.phone}</b></div>`:''}
      ${s.birthDate?`<div style="display:flex;gap:6px"><span style="color:var(--text3)">🎂</span><b>${fmtDate(s.birthDate)}</b></div>`:''}
      ${s.parentName?`<div style="display:flex;gap:6px"><span style="color:var(--text3)">👪</span><b>${s.parentName}</b></div>`:''}
      ${s.parentPhone?`<div style="display:flex;gap:6px"><span style="color:var(--text3)">📞</span><b>${s.parentPhone}</b></div>`:''}
      <div style="display:flex;gap:6px"><span style="color:var(--text3)">🏆</span><b>O'rin: ${myRank?myRank+'/'+ratings.length:'—'}</b></div>
      <div style="display:flex;gap:6px"><span style="color:var(--text3)">🏅</span><b>Baho: ${letter} (${score}/${maxScore})</b></div>
    </div>

    <!-- Bu oy davomat kataklari -->
    <div style="background:var(--bg2);border-radius:var(--r-md);padding:12px;border:1px solid var(--border);margin-bottom:14px">
      <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:8px">📋 Bu oy davomati</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">${cellsHtml}</div>
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
        <span style="background:var(--teal-light);color:var(--teal-text);padding:3px 8px;border-radius:8px;font-size:11px;font-weight:700">K:${present}</span>
        <span style="background:var(--amber-light);color:var(--amber-text);padding:3px 8px;border-radius:8px;font-size:11px;font-weight:700">Y:${absent}</span>
        <span style="background:var(--purple-light);color:var(--purple-text);padding:3px 8px;border-radius:8px;font-size:11px;font-weight:700">S:${excused}</span>
        <span style="font-size:11px;font-weight:700;color:${pctColor};padding:3px 8px">${pct}%</span>
      </div>
    </div>

    <!-- Harakatlar -->
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-primary btn-sm" onclick="closeDetail();_attMonth=null;showGroupStudents(${s.groupId})" style="font-size:11px">${L==='ru'?'📋 Посещаемость':L==='en'?'📋 Attendance':'📋 Davomat'}</button>
      <button class="btn btn-sm" style="font-size:11px;background:var(--purple-light);color:var(--purple-text)" onclick="closeDetail();showMentorGroupRating(${s.groupId})">🏆 Reyting</button>
      ${s.phone?`<a href="tel:${s.phone}" class="btn btn-sm" style="font-size:11px;text-decoration:none">📱 Qo'ng'iroq</a>`:''}
    </div>
  </div>`;

  document.getElementById('detail-title').textContent = '👤 ' + s.name;
  document.getElementById('detail-body').innerHTML = html;
  document.getElementById('detail-foot').innerHTML = `<button class="btn" onclick="closeDetail()">${L==='ru'?'Закрыть':L==='en'?'Close':'Yopish'}</button>`;
  document.getElementById('detail-overlay').classList.add('open');
}

// Talabaning umumiy yo'qlamalar soni
function calcAbsences(studentId, groupId) {
  if (!D.attendance) return 0;
  let total = 0;
  Object.keys(D.attendance).filter(k => k.startsWith('att_'+groupId+'_')).forEach(k => {
    const sAtt = D.attendance[k]?.['s'+studentId] || {};
    for (let l=1; l<=LESSON_COUNT; l++) {
      if (sAtt['l'+l]==='Y') total++;
    }
  });
  return total;
} 
// ===================== VIDEO DARSLIKLAR =====================
const VIDEO_BLOB_CACHE = {};

function getVideos() {
  try { return JSON.parse(localStorage.getItem('edumanage_videos_v1') || '[]'); } catch(e) { return []; }
}
function saveVideos(arr) {
  // Base64 fayl ma'lumotlarini localStorage da saqlaymiz
  localStorage.setItem('edumanage_videos_v1', JSON.stringify(arr));
}

function getMentorVideosForUser() {
  const cu = getCurrentUser();
  const all = getVideos();
  return all.filter(v => v.mentorName === (cu.mentorName || cu.name));
}

// ---- MENTOR VIDEO RENDER ----
function renderMentorVideos() {
  const wrap = document.getElementById('mentor-videos-wrap');
  if (!wrap) return;
  const cu = getCurrentUser();
  const vids = getMentorVideosForUser();
  const L = LANG;

  const addLbl = L==='ru'?'+ Добавить урок':L==='en'?'+ Add Lesson':'+ Darslik qo\'shish';
  const emptyLbl = L==='ru'?'Нет уроков. Добавьте первый!':L==='en'?'No lessons yet. Add the first!':'Hali darslik yo\'q. Birinchisini qo\'shing!';
  const countLbl = L==='ru'?'Всего уроков':L==='en'?'Total lessons':'Jami darslik';

  wrap.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px">
      <div style="font-size:14px;color:var(--text2)">
        ${countLbl}: <b style="color:var(--accent-text);font-size:16px">${vids.length}</b>
      </div>
      <button class="btn btn-primary" onclick="openVideoModal(null)" style="padding:10px 20px;font-size:14px;font-weight:700;border-radius:12px">
        🎬 ${addLbl}
      </button>
    </div>
    <div id="video-card-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px"></div>
  `;

  const grid = document.getElementById('video-card-grid');
  if (!vids.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:80px 20px;color:var(--text3)">
      <div style="font-size:64px;margin-bottom:16px">🎬</div>
      <div style="font-size:18px;font-weight:700;margin-bottom:8px">${emptyLbl}</div>
    </div>`;
    return;
  }
  grid.innerHTML = vids.map(v => renderVideoCard(v, true)).join('');

  // Badge count
  const nc = document.getElementById('nc-mentor-videos');
  if (nc) { nc.textContent = vids.length; nc.style.display = vids.length ? 'flex' : 'none'; }
}

// ---- STUDENT VIDEO RENDER ----
function renderStudentVideos() {
  const wrap = document.getElementById('student-videos-wrap');
  if (!wrap) return;
  const cu = getCurrentUser();
  const L = LANG;
  const studentId = cu.studentId ? parseInt(cu.studentId) : null;
  const s = studentId ? D.students.find(x => x.id === studentId) : null;
  const grp = s ? D.groups.find(x => x.id === s.groupId) : null;
  const mentorName = grp ? grp.mentor : null;

  const all = getVideos();
  const vids = all.filter(v => {
    if (!mentorName) return false;
    if (v.mentorName !== mentorName) return false;
    if (v.groupIds && v.groupIds.length > 0) {
      return grp && v.groupIds.includes(grp.id);
    }
    return true;
  });

  const countLbl = L==='ru'?'Доступно уроков':L==='en'?'Available lessons':'Mavjud darsliklar';
  const emptyLbl = L==='ru'?'Ментор ещё не добавил уроки':L==='en'?'Your mentor hasn\'t added lessons yet':'Mentoringiz hali darslik qo\'shmagan';

  wrap.innerHTML = `
    <div style="margin-bottom:24px;font-size:14px;color:var(--text2)">
      ${countLbl}: <b style="color:var(--accent-text);font-size:16px">${vids.length}</b>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px">
      ${vids.length ? vids.map(v => renderVideoCard(v, false)).join('') : `
        <div style="grid-column:1/-1;text-align:center;padding:80px 20px;color:var(--text3)">
          <div style="font-size:64px;margin-bottom:16px">🎬</div>
          <div style="font-size:18px;font-weight:700">${emptyLbl}</div>
        </div>`}
    </div>
  `;
}

// ---- VIDEO CARD ----
function renderVideoCard(v, isOwner) {
  const L = LANG;
  const isYt = v.type === 'youtube';
  const editLbl = L==='ru'?'Изменить':L==='en'?'Edit':'Tahrirlash';
  const delLbl = L==='ru'?'Удалить':L==='en'?'Delete':'O\'chirish';
  const watchLbl = L==='ru'?'Смотреть':L==='en'?'Watch':'Ko\'rish';
  const allGroupsLbl = L==='ru'?'Все группы':L==='en'?'All groups':L==='ru'?'Все группы':L==='en'?'All groups':'Barcha guruhlar';

  const groupNames = v.groupIds && v.groupIds.length
    ? v.groupIds.map(gid => { const g = D.groups.find(x => x.id === gid); return g ? g.name : ''; }).filter(Boolean).join(', ')
    : allGroupsLbl;

  let thumbHtml = '';
  if (isYt) {
    const ytId = extractYouTubeId(v.url);
    const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : '';
    thumbHtml = `<div style="position:relative;padding-bottom:56.25%;background:#000;border-radius:12px 12px 0 0;overflow:hidden;cursor:pointer" onclick="playYoutube('${v.url}','${v.id}')">
      ${thumb ? `<img src="${thumb}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">` : ''}
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.3)">
        <div style="width:56px;height:56px;background:#ff0000;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px">▶</div>
      </div>
    </div>`;
  } else {
    thumbHtml = `<div style="background:linear-gradient(135deg,var(--accent),#7c3aed);border-radius:12px 12px 0 0;padding:36px;text-align:center;cursor:pointer" onclick="playUploadedVideo(${v.id})">
      <div style="font-size:52px">▶️</div>
      <div style="color:#fff;font-size:13px;margin-top:8px;font-weight:600;opacity:0.9">${v.fileName||'video.mp4'}</div>
    </div>`;
  }

  return `<div style="background:var(--bg2);border:1.5px solid var(--border2);border-radius:14px;overflow:hidden;transition:box-shadow .2s;box-shadow:0 2px 8px rgba(0,0,0,.08)" onmouseover="this.style.boxShadow='0 8px 24px rgba(0,0,0,.15)'" onmouseout="this.style.boxShadow='0 2px 8px rgba(0,0,0,.08)'">
    ${thumbHtml}
    <div style="padding:14px">
      <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px;line-height:1.4">${v.title}</div>
      ${v.desc ? `<div style="font-size:12px;color:var(--text2);margin-bottom:8px;line-height:1.5">${v.desc}</div>` : ''}
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
        <span style="font-size:11px;padding:3px 10px;border-radius:20px;background:${isYt?'#fee2e2':'#ede9fe'};color:${isYt?'#dc2626':'#7c3aed'};font-weight:700">
          ${isYt ? '▶ YouTube' : '📁 Video'}
        </span>
        <span style="font-size:11px;padding:3px 10px;border-radius:20px;background:var(--bg3);color:var(--text3);font-weight:600">👥 ${groupNames}</span>
      </div>
      ${isOwner ? `<div style="display:flex;gap:8px">
        <button class="btn" style="flex:1;font-size:12px;padding:7px" onclick="openVideoModal(${v.id})">✏️ ${editLbl}</button>
        <button class="btn btn-del-outline" style="font-size:12px;padding:7px 12px" onclick="deleteVideo(${v.id})">🗑</button>
      </div>` : `<button class="btn btn-primary" style="width:100%;font-size:13px;padding:8px" onclick="${isYt ? `playYoutube('${v.url}','${v.id}')` : `playUploadedVideo(${v.id})`}">▶ ${watchLbl}</button>`}
    </div>
  </div>`;
}

function extractYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/shorts\/))([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function playYoutube(url, id) {
  const ytId = extractYouTubeId(url);
  if (!ytId) { toast('⚠️ YouTube URL noto\'g\'ri!'); return; }
  const ex = document.getElementById('video-player-overlay');
  if (ex) ex.remove();
  const overlay = document.createElement('div');
  overlay.id = 'video-player-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `
    <div style="position:relative;max-width:860px;width:95%;background:#000;border-radius:14px;overflow:hidden">
      <button onclick="document.getElementById('video-player-overlay').remove()" style="position:absolute;top:10px;right:12px;z-index:1;background:rgba(255,255,255,.2);border:none;color:#fff;font-size:20px;width:38px;height:38px;border-radius:50%;cursor:pointer;font-weight:700">✕</button>
      <div style="padding-bottom:56.25%;position:relative">
        <iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1" style="position:absolute;inset:0;width:100%;height:100%;border:0" allowfullscreen allow="autoplay"></iframe>
      </div>
    </div>`;
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
}

function playUploadedVideo(videoId) {
  const vids = getVideos();
  const v = vids.find(x => x.id === videoId);
  if (!v) return;
  let src = VIDEO_BLOB_CACHE[videoId] || v.fileData || null;
  if (!src) { toast('⚠️ Video topilmadi. Qayta yuklang.'); return; }
  const ex = document.getElementById('video-player-overlay');
  if (ex) ex.remove();
  const overlay = document.createElement('div');
  overlay.id = 'video-player-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `
    <div style="position:relative;max-width:860px;width:95%;background:#000;border-radius:14px;overflow:hidden">
      <button onclick="document.getElementById('video-player-overlay').remove()" style="position:absolute;top:10px;right:12px;z-index:1;background:rgba(255,255,255,.2);border:none;color:#fff;font-size:20px;width:38px;height:38px;border-radius:50%;cursor:pointer;font-weight:700">✕</button>
      <video controls autoplay style="width:100%;display:block;max-height:75vh" src="${src}"></video>
    </div>`;
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
}

// ---- VIDEO MODAL ----
let _editVideoId = null;

function openVideoModal(editId) {
  _editVideoId = editId;
  const cu = getCurrentUser();
  const v = editId ? getVideos().find(x => x.id === editId) : null;
  const L = LANG;

  const titleLbl = editId ? (L==='ru'?'Редактировать урок':L==='en'?'Edit Lesson':'Darslikni tahrirlash') : (L==='ru'?'Новый видеоурок':L==='en'?'New Video Lesson':'Yangi Video Darslik');
  const saveLbl = L==='ru'?'Сохранить':L==='en'?'Save':'Saqlash';
  const cancelLbl = L==='ru'?'Отмена':L==='en'?'Cancel':'Bekor qilish';
  const ytLbl = L==='ru'?'YouTube ссылка':L==='en'?'YouTube Link':'YouTube havola';
  const fileLbl = L==='ru'?'Видеофайл (MP4, WebM)':L==='en'?'Video file (MP4, WebM)':'Video fayl (MP4, WebM)';
  const nameLbl = L==='ru'?'Название урока':L==='en'?'Lesson Title':'Darslik nomi';
  const descLbl = L==='ru'?'Описание (необязательно)':L==='en'?'Description (optional)':'Tavsif (ixtiyoriy)';
  const groupLbl = L==='ru'?'Группы (пусто = все)':L==='en'?'Groups (empty = all)':'Guruhlar (bo\'sh = hammasi)';

  const mName = cu.mentorName || cu.name;
  const myGroups = D.groups.filter(g => g.mentor === mName);

  const groupOptions = myGroups.map(g =>
    `<label style="display:flex;align-items:center;gap:8px;padding:6px;border-radius:8px;cursor:pointer;background:var(--bg3);margin-bottom:4px">
      <input type="checkbox" value="${g.id}" ${v && v.groupIds && v.groupIds.includes(g.id) ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--accent)">
      <span style="font-size:13px;font-weight:600">${g.name}</span>
    </label>`
  ).join('');

  const modal = document.createElement('div');
  modal.id = 'video-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px';
  modal.innerHTML = `
    <div style="background:var(--bg);border-radius:20px;padding:28px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <h2 style="font-size:18px;font-weight:800;color:var(--text);margin:0">🎬 ${titleLbl}</h2>
        <button onclick="closeVideoModal()" style="background:var(--bg3);border:none;color:var(--text2);font-size:20px;width:36px;height:36px;border-radius:50%;cursor:pointer">✕</button>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:20px;background:var(--bg2);border-radius:12px;padding:4px">
        <button id="vtab-yt" onclick="switchVideoTab('yt')" style="flex:1;padding:10px;border:none;border-radius:10px;cursor:pointer;font-weight:700;font-size:13px;background:${!v||v.type==='youtube'?'var(--accent)':'transparent'};color:${!v||v.type==='youtube'?'#fff':'var(--text2)'}">▶ YouTube</button>
        <button id="vtab-file" onclick="switchVideoTab('file')" style="flex:1;padding:10px;border:none;border-radius:10px;cursor:pointer;font-weight:700;font-size:13px;background:${v&&v.type==='file'?'var(--accent)':'transparent'};color:${v&&v.type==='file'?'#fff':'var(--text2)'}">📁 ${fileLbl}</button>
      </div>

      <div id="vtab-yt-body" style="display:${v&&v.type==='file'?'none':'block'}">
        <div class="fg" style="margin-bottom:16px">
          <label style="font-size:12px;font-weight:700;color:var(--text3);display:block;margin-bottom:6px">${ytLbl}</label>
          <input type="text" id="v-url" value="${v&&v.url?v.url:''}" placeholder="https://youtu.be/..." style="width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);color:var(--text);font-size:14px">
        </div>
      </div>

      <div id="vtab-file-body" style="display:${v&&v.type==='file'?'block':'none'}">
        <div style="border:2px dashed var(--border2);border-radius:12px;padding:24px;text-align:center;cursor:pointer;background:var(--bg2);margin-bottom:16px" onclick="document.getElementById('v-file-input').click()">
          <div style="font-size:36px;margin-bottom:8px">📁</div>
          <div id="v-file-label" style="font-size:13px;font-weight:600;color:var(--text2)">${v&&v.fileName?v.fileName:'MP4 yoki WebM fayl tanlang'}</div>
          <input type="file" id="v-file-input" accept="video/mp4,video/webm,video/*" style="display:none" onchange="handleVideoFile(this)">
        </div>
      </div>

      <div class="fg" style="margin-bottom:16px">
        <label style="font-size:12px;font-weight:700;color:var(--text3);display:block;margin-bottom:6px">${nameLbl} *</label>
        <input type="text" id="v-title" value="${v?v.title:''}" placeholder="${L==='ru'?'Урок 1 — Введение':L==='en'?'Lesson 1 — Introduction':'1-dars — Kirish'}" style="width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);color:var(--text);font-size:14px">
      </div>

      <div class="fg" style="margin-bottom:16px">
        <label style="font-size:12px;font-weight:700;color:var(--text3);display:block;margin-bottom:6px">${descLbl}</label>
        <textarea id="v-desc" rows="2" placeholder="..." style="width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);color:var(--text);font-size:14px;resize:vertical">${v?v.desc||'':''}</textarea>
      </div>

      ${myGroups.length ? `<div class="fg" style="margin-bottom:20px">
        <label style="font-size:12px;font-weight:700;color:var(--text3);display:block;margin-bottom:8px">${groupLbl}</label>
        <div id="v-groups">${groupOptions}</div>
      </div>` : ''}

      <div style="display:flex;gap:12px">
        <button onclick="closeVideoModal()" style="flex:1;padding:12px;border:1.5px solid var(--border);background:transparent;border-radius:12px;cursor:pointer;font-weight:700;color:var(--text2)">${cancelLbl}</button>
        <button onclick="saveVideo()" style="flex:2;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:12px;cursor:pointer;font-weight:800;font-size:15px">💾 ${saveLbl}</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.onclick = e => { if (e.target === modal) closeVideoModal(); };
}

function switchVideoTab(tab) {
  const ytBody = document.getElementById('vtab-yt-body');
  const fileBody = document.getElementById('vtab-file-body');
  const ytBtn = document.getElementById('vtab-yt');
  const fileBtn = document.getElementById('vtab-file');
  if (tab === 'yt') {
    ytBody.style.display = 'block'; fileBody.style.display = 'none';
    ytBtn.style.background = 'var(--accent)'; ytBtn.style.color = '#fff';
    fileBtn.style.background = 'transparent'; fileBtn.style.color = 'var(--text2)';
  } else {
    ytBody.style.display = 'none'; fileBody.style.display = 'block';
    fileBtn.style.background = 'var(--accent)'; fileBtn.style.color = '#fff';
    ytBtn.style.background = 'transparent'; ytBtn.style.color = 'var(--text2)';
  }
}

let _vFileData = null;
let _vFileName = null;

function handleVideoFile(inp) {
  const file = inp.files[0];
  if (!file) return;
  const lbl = document.getElementById('v-file-label');
  if (lbl) lbl.textContent = file.name + ' (' + (file.size / 1024 / 1024).toFixed(1) + ' MB)';
  _vFileName = file.name;
  const reader = new FileReader();
  reader.onload = e => {
    _vFileData = e.target.result;
    const vid = document.createElement('video');
    vid.src = _vFileData;
    VIDEO_BLOB_CACHE['preview'] = _vFileData;
    toast('✅ Fayl yuklandi!');
  };
  reader.readAsDataURL(file);
}

function closeVideoModal() {
  const m = document.getElementById('video-modal');
  if (m) m.remove();
  _vFileData = null;
  _vFileName = null;
}

function saveVideo() {
  const cu = getCurrentUser();
  const title = (document.getElementById('v-title')?.value || '').trim();
  if (!title) { toast('⚠️ ' + (LANG==='ru'?'Введите название!':LANG==='en'?'Enter title!':'Nomi kiriting!')); return; }

  const isFileTab = document.getElementById('vtab-file-body')?.style.display !== 'none';
  const type = isFileTab ? 'file' : 'youtube';
  const url = document.getElementById('v-url')?.value?.trim() || '';

  if (type === 'youtube' && !url) { toast('⚠️ YouTube URL kiriting!'); return; }

  const groupCheckboxes = document.querySelectorAll('#v-groups input[type=checkbox]:checked');
  const groupIds = Array.from(groupCheckboxes).map(c => parseInt(c.value));
  const desc = document.getElementById('v-desc')?.value?.trim() || '';

  const vids = getVideos();
  const mName = cu.mentorName || cu.name;

  if (_editVideoId) {
    const idx = vids.findIndex(x => x.id === _editVideoId);
    if (idx !== -1) {
      vids[idx].title = title;
      vids[idx].desc = desc;
      vids[idx].groupIds = groupIds;
      vids[idx].type = type;
      if (type === 'youtube') { vids[idx].url = url; delete vids[idx].fileData; delete vids[idx].fileName; }
      if (type === 'file' && _vFileData) { vids[idx].fileData = _vFileData; vids[idx].fileName = _vFileName; VIDEO_BLOB_CACHE[_editVideoId] = _vFileData; }
    }
  } else {
    const newV = {
      id: Date.now(),
      type, title, desc, groupIds,
      mentorName: mName,
      createdAt: new Date().toLocaleDateString('uz-UZ')
    };
    if (type === 'youtube') newV.url = url;
    if (type === 'file' && _vFileData) { newV.fileData = _vFileData; newV.fileName = _vFileName; VIDEO_BLOB_CACHE[newV.id] = _vFileData; }
    vids.push(newV);
  }

  saveVideos(vids);
  closeVideoModal();
  toast('✅ ' + (LANG==='ru'?'Сохранено!':LANG==='en'?'Saved!':'Saqlandi!'));
  renderMentorVideos();

  // Badge yangilash
  const nc = document.getElementById('nc-mentor-videos');
  if (nc) { const cnt = getMentorVideosForUser().length; nc.textContent = cnt; nc.style.display = cnt ? 'flex' : 'none'; }
}

function deleteVideo(id) {
  const L = LANG;
  const confirmMsg = L==='ru'?'Удалить этот урок?':L==='en'?'Delete this lesson?':'Bu darslikni o\'chirasizmi?';
  if (!confirm(confirmMsg)) return;
  const vids = getVideos().filter(x => x.id !== id);
  saveVideos(vids);
  delete VIDEO_BLOB_CACHE[id];
  toast('🗑 ' + (L==='ru'?'Удалено':L==='en'?'Deleted':'O\'chirildi'));
  renderMentorVideos();
}

// nav label tarjima
function updateVideoNavLabels() {
  const L = LANG;
  const ml = document.getElementById('nav-mentor-videos-lbl');
  const sl = document.getElementById('nav-student-videos-lbl');
  const lbl = L==='ru'?'Видеоуроки':L==='en'?'Video Lessons':'Darsliklar';
  if (ml) ml.textContent = lbl;
  if (sl) sl.textContent = lbl;
}

window.toggleSidebar = function() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebar-overlay');
  if (!sb) return;
  const isOpen = sb.classList.contains('open');
  sb.classList.toggle('open', !isOpen);
  if (ov) ov.classList.toggle('open', !isOpen);
};

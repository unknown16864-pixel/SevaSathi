// ===== FIREBASE CONFIG (UNCHANGED) =====
const firebaseConfig = {
  apiKey: "AIzaSyAhkKwgc7k4PNCqNiA3869LREJ_3mQhBtQ",
  authDomain: "sevasathi-1667b.firebaseapp.com",
  projectId: "sevasathi-1667b",
  storageBucket: "sevasathi-1667b.firebasestorage.app",
  messagingSenderId: "6654259155",
  appId: "1:6654259155:web:9133ff27c069d421484926"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const $ = id => document.getElementById(id);
const show = el => el && el.classList.remove('hidden');
const hide = el => el && el.classList.add('hidden');

let role = null;

// Splash FIX (ensure always loads)
window.addEventListener("load", ()=>{
  setTimeout(()=>{
    hide($('splash'));
    show($('app'));
  },800);
});

// MENU
$('menuBtn')?.addEventListener('click', ()=>{
  $('sideMenu').classList.toggle('hidden');
});

// ROLE
$('roleHelper').onclick = ()=>{
  role='helper';
  hide($('chooseRole'));
  show($('auth'));
  $('authTitle').innerText='Register as Helper';
};

$('roleCustomer').onclick = ()=>{
  role='customer';
  hide($('chooseRole'));
  show($('auth'));
  $('authTitle').innerText='Register as Customer';
};

// AUTH
$('emailSignUp').onclick = async ()=>{
  const email = $('email').value;
  const pw = $('password').value;

  const user = await auth.createUserWithEmailAndPassword(email,pw);
  await saveUser(user.user);
};

$('emailSignIn').onclick = async ()=>{
  const email = $('email').value;
  const pw = $('password').value;

  const user = await auth.signInWithEmailAndPassword(email,pw);
  await saveUser(user.user);
};

// SAVE USER
async function saveUser(user){
  const ref = db.collection('users').doc(user.uid);
  const snap = await ref.get();

  if(!snap.exists){
    await ref.set({
      uid:user.uid,
      email:user.email,
      role: role || 'customer'
    });
  }

  const data = (await ref.get()).data();

  if(data.role === 'helper'){
    hide($('auth'));
    show($('profile'));
  } else {
    hide($('auth'));
    show($('settings')); // FIXED
  }
}

// ==========================
// 🔥 SHOW HELPERS (WORKING)
// ==========================
async function showHelpers(){
  hideAll();
  show($('helpersList'));

  const list = $('list');
  list.innerHTML = 'Loading...';

  const snap = await db.collection('users')
    .where('role','==','helper')
    .get();

  list.innerHTML='';

  snap.forEach(doc=>{
    const d = doc.data();

    const div = document.createElement('div');
    div.className='helper-card';

    div.innerHTML = `
      <h3>${d.displayName || 'No name'}</h3>
      <p>${(d.services||[]).join(', ')}</p>
      <button onclick="requestHire('${d.uid}')">Hire</button>
    `;

    list.appendChild(div);
  });
}

// ==========================
// 🔥 HIRE FIXED
// ==========================
window.requestHire = async function(helperUid){
  const user = auth.currentUser;

  await db.collection('hires').add({
    customer:user.uid,
    helper:helperUid,
    status:'requested',
    createdAt:firebase.firestore.FieldValue.serverTimestamp()
  });

  alert('Hire request sent');
};

// ==========================
// 🔥 BOOKINGS FIXED
// ==========================
$('bookingsBtn').onclick = ()=>{
  hideAll();

  const uid = auth.currentUser.uid;

  db.collection('users').doc(uid).get().then(doc=>{
    const r = doc.data().role;

    if(r==='helper'){
      show($('bookingsHelper'));

      db.collection('hires')
        .where('helper','==',uid)
        .onSnapshot(snap=>{
          const list = $('helperBookingsList');
          list.innerHTML='';

          snap.forEach(d=>{
            const data = d.data();

            list.innerHTML += `
              <div class="booking-card">
                Customer: ${data.customer}<br>
                Status: ${data.status}
              </div>
            `;
          });
        });

    } else {
      show($('bookingsCustomer'));

      db.collection('hires')
        .where('customer','==',uid)
        .onSnapshot(snap=>{
          const list = $('customerBookingsList');
          list.innerHTML='';

          snap.forEach(d=>{
            const data = d.data();

            list.innerHTML += `
              <div class="booking-card">
                Helper: ${data.helper}<br>
                Status: ${data.status}
              </div>
            `;
          });
        });
    }
  });
};

// ==========================
// NAVIGATION
// ==========================
$('settingsBtn').onclick = ()=>{
  hideAll();
  show($('settings'));
};

$('aboutBtn').onclick = ()=>{
  hideAll();
  show($('about'));
};

$('logoutBtn').onclick = ()=>{
  auth.signOut().then(()=>location.reload());
};

// ==========================
// HELPER
// ==========================
function hideAll(){
  [
    'auth','profile','helpersList','settings',
    'about','helperDashboard','chatSection',
    'bookingsCustomer','bookingsHelper'
  ].forEach(id=>$(id).classList.add('hidden'));
}

// ==========================
// AUTH STATE FIX
// ==========================
auth.onAuthStateChanged(user=>{
  if(!user){
    show($('chooseRole'));
    return;
  }

  db.collection('users').doc(user.uid).get().then(d=>{
    const r = d.data().role;

    hide($('chooseRole'));

    if(r==='helper'){
      show($('helperDashboard'));
    } else {
      show($('settings'));
    }
  });
});
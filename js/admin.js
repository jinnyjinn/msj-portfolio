// ─────────────────────────────────────────────
// MSJ Portfolio – Admin Panel Logic
// ─────────────────────────────────────────────

const ADMIN_PW   = 'msj2026';   // 비밀번호 (여기서 변경하세요)
const AUTH_KEY   = 'msj_admin_auth';
const VIDEOS_KEY = 'msj_admin_videos';
const CERTS_KEY  = 'msj_admin_certs';

const CATEGORIES = ['진로·진학', '취업·커리어', '환경·안전', 'AI·디지털', '기타'];

const CAT_COLORS = {
    '진로·진학':  '#2E5CB8',
    '취업·커리어': '#e07b2a',
    '환경·안전':  '#27ae60',
    'AI·디지털':  '#00C4B4',
    '기타':       '#888888',
};

const DEFAULT_VIDEOS = [
    { title: '#진로수업_251216',               embedId: 'zTIr3DhYgqs' },
    { title: '#진로탐색강의_251211',            embedId: 'MwJoE42HeHU' },
    { title: '#직업체험강의_여행기획자_251127',   embedId: '13bhQP277Wo' },
    { title: '#진로체험강의_뷰티크리에이터_251128', embedId: 'osjW7ednVLk' },
];

const DEFAULT_CERTS = [
    { url: 'assets/images/credentials/방과후지도사1급.jpg',                          alt: '방과후지도사 1급',         category: '진로·진학'  },
    { url: 'assets/images/credentials/직업체험프로그램 강사 2급.jpg',               alt: '직업체험프로그램 강사 2급', category: '취업·커리어' },
    { url: 'assets/images/credentials/지속가능환경교육지도사자격증.jpg',             alt: '지속가능환경교육지도사',    category: '환경·안전'  },
    { url: 'assets/images/credentials/환경교육사 3급자격증.jpg',                    alt: '환경교육사 3급',           category: '환경·안전'  },
    { url: 'assets/images/credentials/AI강사자격증.jpg',                            alt: 'AI강사자격증',             category: 'AI·디지털'  },
    { url: 'assets/images/credentials/AI콘텐츠제작전문가.jpg.png',                  alt: 'AI콘텐츠제작전문가',        category: 'AI·디지털'  },
    { url: 'assets/images/credentials/디지털콘텐츠전문가2급.jpg',                   alt: '디지털콘텐츠전문가 2급',    category: 'AI·디지털'  },
    { url: 'assets/images/credentials/인공지능(AI)교육전문가 자격증_20271231까지.jpg', alt: '인공지능(AI)교육전문가',  category: 'AI·디지털'  },
    { url: 'assets/images/credentials/보육교사자격증2급.jpg',                       alt: '보육교사 2급',             category: '기타'       },
];

// ── 유틸리티 ─────────────────────────────────

function extractYtId(input) {
    input = (input || '').trim();
    if (!input) return '';
    if (/^[\w-]{11}$/.test(input)) return input;
    const patterns = [
        /youtu\.be\/([\w-]{11})/,
        /[?&]v=([\w-]{11})/,
        /\/embed\/([\w-]{11})/,
        /\/shorts\/([\w-]{11})/,
    ];
    for (const re of patterns) {
        const m = input.match(re);
        if (m) return m[1];
    }
    return input;
}

function escHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(msg, duration = 2800) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), duration);
}

// ── 인증 ─────────────────────────────────────

function isLoggedIn() { return sessionStorage.getItem(AUTH_KEY) === '1'; }

function login(pw) {
    if (pw === ADMIN_PW) { sessionStorage.setItem(AUTH_KEY, '1'); return true; }
    return false;
}

function logout() { sessionStorage.removeItem(AUTH_KEY); location.reload(); }

// ── 데이터 로드 ───────────────────────────────

function loadVideos() {
    try { return JSON.parse(localStorage.getItem(VIDEOS_KEY)) || DEFAULT_VIDEOS; }
    catch { return DEFAULT_VIDEOS; }
}

function loadCerts() {
    try { return JSON.parse(localStorage.getItem(CERTS_KEY)) || DEFAULT_CERTS; }
    catch { return DEFAULT_CERTS; }
}

// ── 렌더링: 강의 영상 ─────────────────────────

function renderVideos(videos) {
    document.getElementById('video-list').innerHTML = videos.map((v, i) => `
        <div class="video-row">
            <label>영상 ${i + 1}</label>
            <div class="field-group">
                <input type="text" id="v-title-${i}"
                       placeholder="레이블 (예: #진로수업_251216)"
                       value="${escHtml(v.title)}" />
                <input type="text" id="v-url-${i}"
                       placeholder="YouTube URL 또는 영상 ID"
                       value="${escHtml(v.embedId)}" />
            </div>
        </div>
    `).join('');
}

function collectVideos() {
    return Array.from({ length: 4 }, (_, i) => ({
        title:   document.getElementById(`v-title-${i}`)?.value.trim() || '',
        embedId: extractYtId(document.getElementById(`v-url-${i}`)?.value || ''),
    }));
}

// ── 렌더링: 자격증 (카테고리 포함) ──────────────

let certs = [];

/** 카테고리 select 옵션 HTML 생성 */
function catOptions(selected) {
    return CATEGORIES.map(c =>
        `<option value="${c}" ${c === selected ? 'selected' : ''}>${c}</option>`
    ).join('');
}

function renderCerts() {
    document.getElementById('cert-list').innerHTML = certs.map((c, i) => {
        const color = CAT_COLORS[c.category] || CAT_COLORS['기타'];
        return `
        <div class="cert-row" id="cert-row-${i}">
            <input type="text" id="c-url-${i}"
                   placeholder="이미지 URL (예: assets/images/credentials/cert1.jpg)"
                   value="${escHtml(c.url)}" />
            <input type="text" id="c-alt-${i}"
                   placeholder="자격증명 (예: 환경교육사 2급)"
                   value="${escHtml(c.alt)}" />
            <select id="c-cat-${i}" onchange="onCatChange(${i})" style="border-left:3px solid ${color}">
                ${catOptions(c.category || '기타')}
            </select>
            <button class="remove-cert-btn" onclick="removeCert(${i})" title="삭제">✕</button>
        </div>`;
    }).join('');
}

function onCatChange(i) {
    const sel   = document.getElementById(`c-cat-${i}`);
    const color = CAT_COLORS[sel.value] || CAT_COLORS['기타'];
    sel.style.borderLeft = `3px solid ${color}`;
}

function addCert() {
    if (certs.length >= 6) { showToast('자격증은 최대 6개까지 추가할 수 있습니다.'); return; }
    certs.push({ url: '', alt: '', category: '기타' });
    renderCerts();
    document.getElementById(`c-url-${certs.length - 1}`)?.focus();
}

function removeCert(i) {
    certs.splice(i, 1);
    renderCerts();
}

function collectCerts() {
    return certs.map((_, i) => ({
        url:      document.getElementById(`c-url-${i}`)?.value.trim() || '',
        alt:      document.getElementById(`c-alt-${i}`)?.value.trim() || '',
        category: document.getElementById(`c-cat-${i}`)?.value || '기타',
    })).filter(c => c.url);
}

// ── 저장 / 초기화 ─────────────────────────────

function saveAll() {
    localStorage.setItem(VIDEOS_KEY, JSON.stringify(collectVideos()));

    const collected = collectCerts();
    if (collected.length === 0) {
        showToast('⚠️ 자격증 URL을 하나 이상 입력해주세요.');
        return;
    }
    localStorage.setItem(CERTS_KEY, JSON.stringify(collected));
    showToast('✅ 저장 완료! 메인 페이지를 새로고침하면 반영됩니다.');
}

function resetAll() {
    if (!confirm('모든 설정을 기본값으로 초기화할까요?')) return;
    localStorage.removeItem(VIDEOS_KEY);
    localStorage.removeItem(CERTS_KEY);
    certs = DEFAULT_CERTS.map(c => ({ ...c }));
    renderVideos(DEFAULT_VIDEOS);
    renderCerts();
    showToast('↺ 기본값으로 초기화되었습니다.');
}

// ── DOMContentLoaded ─────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const adminPanel  = document.getElementById('admin-panel');

    if (isLoggedIn()) {
        loginScreen.style.display = 'none';
        adminPanel.style.display  = 'block';
        initPanel();
    }

    document.getElementById('login-form').addEventListener('submit', e => {
        e.preventDefault();
        const pw = document.getElementById('pw-input').value;
        if (login(pw)) {
            loginScreen.style.display = 'none';
            adminPanel.style.display  = 'block';
            initPanel();
        } else {
            document.getElementById('login-error').style.display = 'block';
            document.getElementById('pw-input').value = '';
            document.getElementById('pw-input').focus();
        }
    });

    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('save-btn').addEventListener('click', saveAll);
    document.getElementById('reset-btn').addEventListener('click', resetAll);
    document.getElementById('add-cert-btn').addEventListener('click', addCert);
});

function initPanel() {
    renderVideos(loadVideos());
    certs = loadCerts().map(c => ({ ...c }));
    renderCerts();
}

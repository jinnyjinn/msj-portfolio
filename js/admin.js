// ─────────────────────────────────────────────
// MSJ Portfolio – Admin Panel Logic
// ─────────────────────────────────────────────

const ADMIN_PW      = 'msj2026';          // 비밀번호 (여기서 변경하세요)
const AUTH_KEY      = 'msj_admin_auth';
const VIDEOS_KEY    = 'msj_admin_videos';
const CERTS_KEY     = 'msj_admin_certs';

const DEFAULT_VIDEOS = [
    { title: '#진로수업_251216',              embedId: 'zTIr3DhYgqs' },
    { title: '#진로탐색강의_251211',           embedId: 'MwJoE42HeHU' },
    { title: '#직업체험강의_여행기획자_251127',  embedId: '13bhQP277Wo' },
    { title: '#진로체험강의_뷰티크리에이터_251128', embedId: 'osjW7ednVLk' },
];

const DEFAULT_CERTS = [
    { url: 'assets/images/credentials/cert1.png', alt: '자격증 1' },
    { url: 'assets/images/credentials/cert2.png', alt: '자격증 2' },
];

// ── 유틸리티 ─────────────────────────────────

/** YouTube URL / 단축URL / 순수 ID 에서 11자리 ID 추출 */
function extractYtId(input) {
    input = (input || '').trim();
    if (!input) return '';
    // 이미 ID만 입력된 경우 (11자, 영숫자 _ -)
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
    return input; // 알 수 없으면 그대로 반환
}

function showToast(msg, duration = 2500) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), duration);
}

// ── 인증 ─────────────────────────────────────

function isLoggedIn() {
    return sessionStorage.getItem(AUTH_KEY) === '1';
}

function login(pw) {
    if (pw === ADMIN_PW) {
        sessionStorage.setItem(AUTH_KEY, '1');
        return true;
    }
    return false;
}

function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    location.reload();
}

// ── 데이터 로드 / 저장 ─────────────────────────

function loadVideos() {
    try {
        return JSON.parse(localStorage.getItem(VIDEOS_KEY)) || DEFAULT_VIDEOS;
    } catch { return DEFAULT_VIDEOS; }
}

function loadCerts() {
    try {
        return JSON.parse(localStorage.getItem(CERTS_KEY)) || DEFAULT_CERTS;
    } catch { return DEFAULT_CERTS; }
}

// ── 렌더링: 강의 영상 ─────────────────────────

function renderVideos(videos) {
    const container = document.getElementById('video-list');
    container.innerHTML = videos.map((v, i) => `
        <div class="video-row">
            <label>영상 ${i + 1}</label>
            <div class="field-group">
                <input type="text"
                       id="v-title-${i}"
                       placeholder="레이블 (예: #진로수업_251216)"
                       value="${escHtml(v.title)}" />
                <input type="text"
                       id="v-url-${i}"
                       placeholder="YouTube URL 또는 영상 ID"
                       value="${escHtml(v.embedId)}" />
            </div>
        </div>
    `).join('');
}

/** 현재 폼 값에서 영상 데이터 수집 */
function collectVideos() {
    return Array.from({ length: 4 }, (_, i) => ({
        title:   document.getElementById(`v-title-${i}`)?.value.trim() || '',
        embedId: extractYtId(document.getElementById(`v-url-${i}`)?.value || ''),
    }));
}

// ── 렌더링: 자격증 ────────────────────────────

let certs = [];

function renderCerts() {
    const container = document.getElementById('cert-list');
    container.innerHTML = certs.map((c, i) => `
        <div class="cert-row" id="cert-row-${i}">
            <input type="text"
                   id="c-url-${i}"
                   placeholder="이미지 URL (예: assets/images/credentials/cert1.png)"
                   value="${escHtml(c.url)}"
                   oninput="previewCert(${i})" />
            <input type="text"
                   id="c-alt-${i}"
                   placeholder="설명 (예: 환경교육사 2급)"
                   value="${escHtml(c.alt)}" />
            <button class="remove-cert-btn" onclick="removeCert(${i})" title="삭제">✕</button>
        </div>
    `).join('');
}

function previewCert(i) {
    // 미리보기는 URL이 유효할 때 표시 (선택적 기능)
    const url = document.getElementById(`c-url-${i}`)?.value.trim();
    // 단순히 콘솔 확인 용도
    console.log('cert preview:', url);
}

function addCert() {
    if (certs.length >= 6) { showToast('자격증은 최대 6개까지 추가할 수 있습니다.'); return; }
    certs.push({ url: '', alt: '' });
    renderCerts();
    document.getElementById(`c-url-${certs.length - 1}`)?.focus();
}

function removeCert(i) {
    certs.splice(i, 1);
    renderCerts();
}

/** 현재 폼 값에서 자격증 데이터 수집 */
function collectCerts() {
    return certs.map((_, i) => ({
        url: document.getElementById(`c-url-${i}`)?.value.trim() || '',
        alt: document.getElementById(`c-alt-${i}`)?.value.trim() || '',
    })).filter(c => c.url);
}

// ── 저장 / 초기화 ─────────────────────────────

function saveAll() {
    // 영상
    const videos = collectVideos();
    localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos));

    // 자격증
    const collected = collectCerts();
    if (collected.length === 0) {
        showToast('자격증 URL을 하나 이상 입력해주세요.');
        return;
    }
    localStorage.setItem(CERTS_KEY, JSON.stringify(collected));

    showToast('✅ 저장되었습니다! 메인 페이지를 새로고침하면 반영됩니다.');
}

function resetAll() {
    if (!confirm('모든 설정을 기본값으로 초기화할까요?')) return;
    localStorage.removeItem(VIDEOS_KEY);
    localStorage.removeItem(CERTS_KEY);
    certs = [...DEFAULT_CERTS.map(c => ({ ...c }))];
    renderVideos(DEFAULT_VIDEOS);
    renderCerts();
    showToast('↺ 기본값으로 초기화되었습니다.');
}

// ── XSS 방지 ─────────────────────────────────

function escHtml(str) {
    return (str || '').replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;');
}

// ── 초기화 ───────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const adminPanel  = document.getElementById('admin-panel');

    // 이미 로그인된 경우 바로 패널 표시
    if (isLoggedIn()) {
        loginScreen.style.display = 'none';
        adminPanel.style.display  = 'block';
        initPanel();
    }

    // 로그인 폼
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

    // 로그아웃
    document.getElementById('logout-btn').addEventListener('click', logout);

    // 저장
    document.getElementById('save-btn').addEventListener('click', saveAll);

    // 초기화
    document.getElementById('reset-btn').addEventListener('click', resetAll);

    // 자격증 추가
    document.getElementById('add-cert-btn').addEventListener('click', addCert);
});

function initPanel() {
    // 영상 목록 렌더링
    renderVideos(loadVideos());

    // 자격증 목록 렌더링
    certs = loadCerts().map(c => ({ ...c }));
    renderCerts();
}

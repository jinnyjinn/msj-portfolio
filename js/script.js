// ── 카테고리 색상 맵 ──────────────────────────────────────────
const CAT_COLORS = {
    '진로·진학': '#2E5CB8',
    '취업·커리어': '#e07b2a',
    '환경·안전': '#27ae60',
    'AI·디지털': '#00C4B4',
    '기타': '#888888',
};

function getCatColor(cat) {
    return CAT_COLORS[cat] || CAT_COLORS['기타'];
}

function escHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Admin Override ──────────────────────────────────────────────
// localStorage에 저장된 관리자 데이터를 페이지에 반영
function loadAdminOverrides() {
    // 1. 강의 영상
    const videosRaw = localStorage.getItem('msj_admin_videos');
    if (videosRaw) {
        try {
            const videos = JSON.parse(videosRaw);
            videos.forEach((v, i) => {
                const iframe = document.getElementById(`video-iframe-${i + 1}`);
                const label  = document.getElementById(`video-label-${i + 1}`);
                if (iframe && v.embedId) {
                    iframe.src   = `https://www.youtube.com/embed/${v.embedId}`;
                    iframe.title = v.title || '';
                }
                if (label && v.title) label.textContent = v.title;
            });
        } catch (e) { console.warn('Admin videos parse error', e); }
    }

    // 2. 자격증 갤러리
    const certsRaw = localStorage.getItem('msj_admin_certs');
    if (certsRaw) {
        try {
            const certs = JSON.parse(certsRaw).filter(c => c.url);
            const grid  = document.getElementById('cert-grid');
            if (grid && certs.length > 0) {
                grid.innerHTML = certs.map(c => {
                    const cat   = c.category || '기타';
                    const color = getCatColor(cat);
                    return `
                    <div class="cert-card" data-category="${escHtml(cat)}">
                        <div class="cert-img-wrap">
                            <img src="${escHtml(c.url)}" alt="${escHtml(c.alt || '자격증')}">
                        </div>
                        <div class="cert-card-info">
                            <p class="cert-name">${escHtml(c.alt || '자격증')}</p>
                            <span class="cert-badge" style="background:${color}">${escHtml(cat)}</span>
                        </div>
                    </div>`;
                }).join('');
            }
        } catch (e) { console.warn('Admin certs parse error', e); }
    }
}

// ── 자격증 분야별 필터 탭 ────────────────────────────────────────
function initCertFilter() {
    const tabs = document.querySelectorAll('.cert-tab');

    // 현재 그리드에 존재하는 카테고리만 탭 표시
    function refreshTabVisibility() {
        const cats = new Set(
            [...document.querySelectorAll('.cert-card')].map(c => c.dataset.category)
        );
        tabs.forEach(tab => {
            const cat = tab.dataset.category;
            tab.style.display = (cat === '전체' || cats.has(cat)) ? '' : 'none';
        });
    }

    function filterCards(cat) {
        document.querySelectorAll('.cert-card').forEach(card => {
            card.style.display = (cat === '전체' || card.dataset.category === cat) ? '' : 'none';
        });
    }

    refreshTabVisibility();

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterCards(tab.dataset.category);
        });
    });

    // 이미지 클릭 시 라이트박스
    document.getElementById('cert-grid')?.addEventListener('click', e => {
        const img = e.target.closest('.cert-img-wrap img');
        if (!img) return;
        const lb = document.getElementById('cert-lightbox');
        document.getElementById('cert-lightbox-img').src = img.src;
        lb.classList.add('open');
    });
}

// ── 라이트박스 닫기 ──────────────────────────────────────────────
function closeLightbox() {
    document.getElementById('cert-lightbox')?.classList.remove('open');
}

// ── 카카오톡 ID 클립보드 복사 ──────────────────────────────────
function copyKakaoId() {
    navigator.clipboard.writeText('minbluesky').then(() => {
        const btn = document.querySelector('.kakao-copy-btn');
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 2000);
    });
}

// ── 강의 카드 → 자격증 탭 연동 ──────────────────────────────────
function initLectureCardLinks() {
    document.querySelectorAll('.lectures .card[data-cert-category]').forEach(card => {
        card.addEventListener('click', () => {
            const cat = card.dataset.certCategory;
            const tab = document.querySelector(`.cert-tab[data-category="${cat}"]`);
            if (!tab) return;

            // 탭 활성화 및 필터 적용
            document.querySelectorAll('.cert-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.cert-card').forEach(c => {
                c.style.display = (c.dataset.category === cat) ? '' : 'none';
            });

            // 자격증 섹션으로 스크롤
            document.getElementById('credentials')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // 0. 관리자 오버라이드 적용 → 자격증 탭 필터 초기화
    loadAdminOverrides();
    initCertFilter();
    initLectureCardLinks();

    // 1. Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // 2. Scroll Reveal Animation using Intersection Observer
    const revealElements = document.querySelectorAll('.scroll-reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Reveal only once
            }
        });
    }, {
        root: null,
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: "0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));


    // 3. Particle Network Animation (Canvas)
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particlesArray;

        // Colors: Science Blue (#2E5CB8), Bio Mint (#00C4B4)
        const colors = ['#2E5CB8', '#00C4B4'];

        // Mouse position
        let mouse = {
            x: null,
            y: null,
            radius: (canvas.height / 80) * (canvas.width / 80)
        }

        window.addEventListener('mousemove', (event) => {
            mouse.x = event.x;
            mouse.y = event.y;
        });

        // Resize event
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            mouse.radius = (canvas.height / 80) * (canvas.width / 80);
            init();
        });

        // Mouse out
        window.addEventListener('mouseout', () => {
            mouse.x = undefined;
            mouse.y = undefined;
        })

        // Particle Class
        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
            }

            // Method to draw individual particle
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            // Method to update particle position
            update() {
                // Check if particle is still within canvas
                if (this.x > canvas.width || this.x < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y > canvas.height || this.y < 0) {
                    this.directionY = -this.directionY;
                }

                // Check collision detection - mouse position / particle position
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx*dx + dy*dy);

                if (distance < mouse.radius + this.size) {
                    if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                        this.x += 10;
                    }
                    if (mouse.x > this.x && this.x > this.size * 10) {
                        this.x -= 10;
                    }
                    if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                        this.y += 10;
                    }
                    if (mouse.y > this.y && this.y > this.size * 10) {
                        this.y -= 10;
                    }
                }

                // Move particle
                this.x += this.directionX;
                this.y += this.directionY;

                // Draw particle
                this.draw();
            }
        }

        // Initialize particles
        function init() {
            particlesArray = [];
            let numberOfParticles = (canvas.height * canvas.width) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 3) + 1;
                let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * 2) - 1; // -1 to 1
                let directionY = (Math.random() * 2) - 1; 
                let color = colors[Math.floor(Math.random() * colors.length)];

                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        // Animation Loop
        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0,0, innerWidth, innerHeight);

            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connect();
        }

        // Connect particles with lines
        function connect() {
            let opacityValue = 1;
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) + 
                                   ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                    
                    if (distance < (canvas.width/7) * (canvas.height/7)) {
                        opacityValue = 1 - (distance/20000);
                        ctx.strokeStyle = 'rgba(46, 92, 184,' + opacityValue + ')'; // Use primary blue for lines
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        init();
        animate();
    }

    // 4. Navbar Scrollspy
    const allSections = document.querySelectorAll('section[id], header[id]');
    const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

    function updateActiveNav() {
        let currentId = '';
        allSections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 120) {
                currentId = section.getAttribute('id');
            }
        });
        navAnchors.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${currentId}`);
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
});

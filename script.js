// CaliQuest Interactive JavaScript - Optimized Version
document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // Initialize app if not already initialized
    if (!window.caliQuestApp) {
        window.caliQuestApp = new CaliQuestApp();
    }
    
    // Enhanced navigation with debouncing
    let navigationTimeout;
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear existing timeout
            if (navigationTimeout) {
                clearTimeout(navigationTimeout);
            }
            
            // Debounce navigation
            navigationTimeout = setTimeout(() => {
                const target = this.getAttribute('href').substring(1);
                if (window.caliQuestApp) {
                    window.caliQuestApp.handleNavigation(target);
                }
            }, 100);
        });
    });

    // Enhanced interactive elements with performance optimization
    const interactiveElements = {
        mapNodes: '.group.cursor-pointer',
        cards: '.card-hover',
        buttons: 'button:not([disabled])'
    };
    
    // Use event delegation for better performance
    document.body.addEventListener('click', function(e) {
        const target = e.target;
        
        // Handle map nodes
        if (target.closest(interactiveElements.mapNodes)) {
            const node = target.closest(interactiveElements.mapNodes);
            handleMapNodeClick(node);
        }
        
        // Handle card interactions
        if (target.closest(interactiveElements.cards)) {
            const card = target.closest(interactiveElements.cards);
            handleCardInteraction(card);
        }
    });
    
    // Optimized handlers
    function handleMapNodeClick(node) {
        // Add click animation with performance optimization
        requestAnimationFrame(() => {
            node.style.transform = 'scale(0.95)';
            setTimeout(() => {
                node.style.transform = '';
            }, 150);
        });
    }
    
    function handleCardInteraction(card) {
        // Enhanced hover effect with GPU acceleration
        card.style.transform = 'translateY(-2px) translateZ(0)';
        card.style.willChange = 'transform';
    }
    
    // Reset card transform on mouse leave
    document.body.addEventListener('mouseleave', function(e) {
        if (e.target.closest(interactiveElements.cards)) {
            const card = e.target.closest(interactiveElements.cards);
            card.style.transform = '';
            card.style.willChange = '';
        }
    }, true);

    // Enhanced progress bar animations with Intersection Observer
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const targetWidth = bar.style.width;
                bar.style.width = '0%';
                
                requestAnimationFrame(() => {
                    bar.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    bar.style.width = targetWidth;
                });
                
                progressObserver.unobserve(bar);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.bg-primary.rounded-full').forEach(bar => {
        if (bar.style.width) {
            progressObserver.observe(bar);
        }
    });

    // Enhanced mobile menu with better touch support
    function setupMobileMenu() {
        let mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        
        if (!mobileMenuBtn) {
            mobileMenuBtn = document.createElement('button');
            mobileMenuBtn.className = 'mobile-menu-btn md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-[#20484b] text-white';
            mobileMenuBtn.innerHTML = '<span class="material-symbols-outlined">menu</span>';
            mobileMenuBtn.setAttribute('aria-label', 'فتح القائمة');
            
            const header = document.querySelector('header .flex.items-center.justify-between');
            if (header) {
                header.appendChild(mobileMenuBtn);
            }
        }
        
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleMobileMenu();
        });
    }
    
    function toggleMobileMenu() {
        const nav = document.querySelector('header nav');
        if (nav) {
            const isOpen = nav.classList.contains('mobile-open');
            
            if (isOpen) {
                nav.classList.remove('mobile-open', 'flex', 'flex-col', 'absolute', 'top-16', 'left-0', 'right-0', 'bg-background-dark', 'border-b', 'border-white/10', 'p-4', 'gap-4');
                nav.classList.add('hidden');
            } else {
                nav.classList.remove('hidden');
                nav.classList.add('mobile-open', 'flex', 'flex-col', 'absolute', 'top-16', 'left-0', 'right-0', 'bg-background-dark', 'border-b', 'border-white/10', 'p-4', 'gap-4');
            }
        }
    }

    // Enhanced theme management with system preference detection
    function setupThemeManagement() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.documentElement.classList.add('dark');
        }
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                document.documentElement.classList.toggle('dark', e.matches);
            }
        });
    }

    // Enhanced stat counter animation with performance optimization
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        let lastTime = performance.now();
        
        function updateCounter(currentTime) {
            const deltaTime = currentTime - lastTime;
            
            if (deltaTime >= 16) {
                current += increment;
                if (current >= target) {
                    current = target;
                    element.textContent = Math.floor(current).toLocaleString('ar-EG');
                    return;
                }
                element.textContent = Math.floor(current).toLocaleString('ar-EG');
                lastTime = currentTime;
            }
            
            requestAnimationFrame(updateCounter);
        }
        
        requestAnimationFrame(updateCounter);
    }

    // Initialize counters with Intersection Observer
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const text = stat.textContent;
                const number = parseInt(text.replace(/[^0-9]/g, ''));
                
                if (!isNaN(number) && number > 0) {
                    animateCounter(stat, number);
                }
                
                counterObserver.unobserve(stat);
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('.text-4xl.font-black').forEach(stat => {
        counterObserver.observe(stat);
    });

    // Enhanced smooth scroll with polyfill support
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    e.preventDefault();
                    
                    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Enhanced parallax effect with throttling
    function setupParallax() {
        let ticking = false;
        
        function updateParallax() {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax-element');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px) translateZ(0)`;
            });
            
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestTick, { passive: true });
    }

    // Initialize all features
    function initializeFeatures() {
        setupMobileMenu();
        setupThemeManagement();
        setupSmoothScroll();
        setupParallax();
        
        // Add parallax class to hero elements
        const heroElements = document.querySelectorAll('.relative.py-20 > div');
        heroElements.forEach((element, index) => {
            element.classList.add('parallax-element');
            element.dataset.speed = 0.2 + (index * 0.1);
        });
    }

    // Initialize everything
    initializeFeatures();
    
    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', function() {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`🚀 CaliQuest loaded in ${loadTime}ms`);
        });
    }
    
    console.log('✅ CaliQuest platform initialized successfully!');
});

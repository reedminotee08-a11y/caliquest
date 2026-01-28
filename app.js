// CaliQuest Main Application
class CaliQuestApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'home';
        this.api = window.CaliQuestAPI;
        this.loadingStates = new Map();
        this.cache = new Map();
        this.init();
    }

    async init() {
        try {
            console.log('🚀 CaliQuest App Initializing...');
            
            // Check if user is logged in
            await this.checkAuthStatus();
            
            // Initialize UI components
            this.initializeUI();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadInitialData();
            
            console.log('✅ CaliQuest App Ready!');
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.showNotification('فشل في تحميل التطبيق', 'error');
        }
    }

    async checkAuthStatus() {
        try {
            if (!this.api || !this.api.supabase) {
                throw new Error('API or Supabase not available');
            }
            
            const { data: { session }, error } = await this.api.supabase.auth.getSession();
            if (error) throw error;
            
            if (session) {
                this.currentUser = session.user;
                await this.loadUserProfile();
                this.updateUIForLoggedInUser();
            }
        } catch (error) {
            console.log('No active session or auth check failed:', error);
            this.currentUser = null;
            this.updateUIForLoggedOutUser();
        }
    }

    async loadUserProfile() {
        try {
            if (!this.currentUser) return;
            
            this.userProfile = await this.api.getProfile(this.currentUser.id);
        } catch (error) {
            console.error('Error loading user profile:', error);
            // Don't create profile automatically - let user create it
            this.userProfile = null;
        }
    }

    async createDefaultProfile() {
        const defaultProfile = {
            username: this.currentUser.email.split('@')[0],
            display_name: this.currentUser.email.split('@')[0],
            level: 1,
            xp_total: 0,
            xp_current: 0,
            xp_required: 1000,
            fitness_level: 'beginner',
            streak_days: 0,
            total_workouts: 0
        };

        try {
            const { data, error } = await this.api.supabase
                .from('profiles')
                .insert({ id: this.currentUser.id, ...defaultProfile })
                .select()
                .single();

            if (error) throw error;
            this.currentUser.profile = data;
        } catch (error) {
            console.error('Error creating profile:', error);
        }
    }

    initializeUI() {
        // Initialize navigation
        this.setupNavigation();
        
        // Initialize modals
        this.setupModals();
        
        // Initialize forms
        this.setupForms();
        
        // Initialize animations
        this.setupAnimations();
        
        // Update UI based on auth status
        this.updateAuthUI();
    }

    setupNavigation() {
        // Navigation links
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    this.handleNavigation(link.getAttribute('href').substring(1));
                }
            });
        });

        // Mobile menu toggle
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
    }

    setupModals() {
        // Auth modal
        const authModal = document.getElementById('authModal');
        if (authModal) {
            this.setupAuthModal(authModal);
        }

        // Profile modal
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            this.setupProfileModal(profileModal);
        }

        // Settings modal
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            this.setupSettingsModal(settingsModal);
        }
    }

    setupAuthModal(modal) {
        const loginBtn = modal.querySelector('#loginBtn');
        const signupBtn = modal.querySelector('#signupBtn');
        const loginForm = modal.querySelector('#loginForm');
        const signupForm = modal.querySelector('#signupForm');
        const authTitle = modal.querySelector('#authTitle');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.showLoginForm();
            });
        }

        if (signupBtn) {
            signupBtn.addEventListener('click', () => {
                this.showSignupForm();
            });
        }

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e);
            });
        }

        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup(e);
            });
        }

        // Setup password strength checker
        this.setupPasswordStrengthChecker();

        // Setup form validation
        this.setupFormValidation();
    }

    setupPasswordStrengthChecker() {
        const passwordInput = document.getElementById('signupPassword');
        const strengthBar = document.getElementById('passwordStrength');
        const strengthText = document.getElementById('passwordStrengthText');

        if (passwordInput && strengthBar && strengthText) {
            passwordInput.addEventListener('input', () => {
                const password = passwordInput.value;
                const strength = this.calculatePasswordStrength(password);
                
                strengthBar.style.width = `${strength.percentage}%`;
                strengthBar.className = `h-full transition-all duration-300 ${strength.color}`;
                strengthText.textContent = strength.text;
                strengthText.className = `text-xs ${strength.textColor}`;
            });
        }
    }

    calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];

        if (password.length >= 8) score += 20;
        else feedback.push('8+ أحرف');

        if (password.length >= 12) score += 10;
        if (/[a-z]/.test(password)) score += 20;
        else feedback.push('حروف صغيرة');

        if (/[A-Z]/.test(password)) score += 20;
        else feedback.push('حروف كبيرة');

        if (/[0-9]/.test(password)) score += 20;
        else feedback.push('أرقام');

        if (/[^A-Za-z0-9]/.test(password)) score += 10;
        else feedback.push('رموز خاصة');

        if (score < 40) {
            return { percentage: score, color: 'bg-red-500', text: 'ضعيفة', textColor: 'text-red-400' };
        } else if (score < 60) {
            return { percentage: score, color: 'bg-yellow-500', text: 'متوسطة', textColor: 'text-yellow-400' };
        } else if (score < 80) {
            return { percentage: score, color: 'bg-blue-500', text: 'جيدة', textColor: 'text-blue-400' };
        } else {
            return { percentage: score, color: 'bg-green-500', text: 'قوية', textColor: 'text-green-400' };
        }
    }

    setupFormValidation() {
        // Username validation
        const usernameInput = document.getElementById('signupUsername');
        if (usernameInput) {
            usernameInput.addEventListener('input', () => {
                const username = usernameInput.value;
                const isValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);
                
                if (username.length > 0 && !isValid) {
                    usernameInput.classList.add('border-red-500');
                    usernameInput.classList.remove('border-white/20');
                } else {
                    usernameInput.classList.remove('border-red-500');
                    usernameInput.classList.add('border-white/20');
                }
            });
        }

        // Confirm password validation
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const passwordInput = document.getElementById('signupPassword');
        
        if (confirmPasswordInput && passwordInput) {
            confirmPasswordInput.addEventListener('input', () => {
                const password = passwordInput.value;
                const confirmPassword = confirmPasswordInput.value;
                
                if (confirmPassword.length > 0 && password !== confirmPassword) {
                    confirmPasswordInput.classList.add('border-red-500');
                    confirmPasswordInput.classList.remove('border-white/20');
                } else {
                    confirmPasswordInput.classList.remove('border-red-500');
                    confirmPasswordInput.classList.add('border-white/20');
                }
            });
        }
    }

    setupProfileModal(modal) {
        const saveBtn = modal.querySelector('#saveProfileBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveProfile();
            });
        }
    }

    setupSettingsModal(modal) {
        const saveBtn = modal.querySelector('#saveSettingsBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }
    }

    setupForms() {
        // Workout form
        const workoutForm = document.getElementById('workoutForm');
        if (workoutForm) {
            workoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleWorkoutSubmit(e);
            });
        }

        // Challenge form
        const challengeForm = document.getElementById('challengeForm');
        if (challengeForm) {
            challengeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleChallengeSubmit(e);
            });
        }

        // Profile setup form
        const profileSetupForm = document.getElementById('profileSetupForm');
        if (profileSetupForm) {
            profileSetupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProfileSetup(e);
            });
        }
    }

    setupAnimations() {
        // Page load animations
        this.animatePageLoad();

        // Scroll animations
        this.setupScrollAnimations();

        // Hover effects
        this.setupHoverEffects();

        // Loading states
        this.setupLoadingStates();
    }

    // Event Listeners for main buttons
    setupEventListeners() {
        // Auth buttons
        const loginBtns = document.querySelectorAll('.login-btn');
        loginBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthModal('login');
            });
        });

        const signupBtns = document.querySelectorAll('.signup-btn');
        signupBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthModal('signup');
            });
        });

        // Main action buttons
        const startJourneyBtn = document.querySelector('.start-journey-btn');
        if (startJourneyBtn) {
            startJourneyBtn.addEventListener('click', () => {
                if (this.currentUser) {
                    window.location.href = 'fitness_level_selection_step_2.html';
                } else {
                    this.showNotification('يجب تسجيل الدخول أولاً', 'warning');
                    this.showAuthModal('signup');
                }
            });
        }

        const viewCurriculumBtn = document.querySelector('.view-curriculum-btn');
        if (viewCurriculumBtn) {
            viewCurriculumBtn.addEventListener('click', () => {
                window.location.href = 'training_path_map_view.html';
            });
        }

        const getStartedBtn = document.querySelector('.get-started-btn');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => {
                if (this.currentUser) {
                    window.location.href = 'fitness_level_selection_step_2.html';
                } else {
                    this.showNotification('يجب تسجيل الدخول أولاً', 'warning');
                    this.showAuthModal('signup');
                }
            });
        }

        const exploreSkillsBtn = document.querySelector('.explore-skills-btn');
        if (exploreSkillsBtn) {
            exploreSkillsBtn.addEventListener('click', () => {
                window.location.href = 'training_path_map_view.html';
            });
        }

        // Quick access buttons
        const trainingMapBtn = document.querySelector('.training-map-btn');
        if (trainingMapBtn) {
            trainingMapBtn.addEventListener('click', () => {
                window.location.href = 'training_path_map_view.html';
            });
        }

        const challengesBtn = document.querySelector('.challenges-btn');
        if (challengesBtn) {
            challengesBtn.addEventListener('click', () => {
                window.location.href = 'weekly_challenges_hub.html';
            });
        }

        const workoutPlayerBtn = document.querySelector('.workout-player-btn');
        if (workoutPlayerBtn) {
            workoutPlayerBtn.addEventListener('click', () => {
                if (this.currentUser) {
                    window.location.href = 'workout_player_screen.html';
                } else {
                    this.showNotification('يجب تسجيل الدخول أولاً', 'warning');
                    this.showAuthModal('login');
                }
            });
        }

        const rewardsStoreBtn = document.querySelector('.rewards-store-btn');
        if (rewardsStoreBtn) {
            rewardsStoreBtn.addEventListener('click', () => {
                if (this.currentUser) {
                    window.location.href = 'caliquest_xp_rewards_store.html';
                } else {
                    this.showNotification('يجب تسجيل الدخول أولاً', 'warning');
                    this.showAuthModal('login');
                }
            });
        }

        // Logout button
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Profile button
        const profileBtn = document.querySelector('.profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                if (this.currentUser) {
                    window.location.href = 'user_profile_setup_step_1.html';
                } else {
                    this.showAuthModal('login');
                }
            });
        }

        // Settings button
        const settingsBtn = document.querySelector('.settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettingsModal();
            });
        }

        // Workout buttons
        const workoutBtns = document.querySelectorAll('.workout-btn');
        workoutBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.startWorkout(btn.dataset.workoutId);
            });
        });

        // Challenge buttons
        const challengeBtns = document.querySelectorAll('.challenge-btn');
        challengeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.acceptChallenge(btn.dataset.challengeId);
            });
        });

        // Reward buttons
        const rewardBtns = document.querySelectorAll('.reward-btn');
        rewardBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.redeemReward(btn.dataset.rewardId);
            });
        });

        // Map nodes
        const mapNodes = document.querySelectorAll('.map-node');
        mapNodes.forEach(node => {
            node.addEventListener('click', () => {
                this.handleMapNodeClick(node);
            });
        });

        // XP buttons
        const xpBtns = document.querySelectorAll('.xp-btn');
        xpBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleXPAction(btn.dataset.action);
            });
        });
    }

    async loadInitialData() {
        try {
            // Load dynamic stats first
            await this.loadDynamicStats();
            
            // Load training paths
            if (this.shouldLoadTrainingPaths()) {
                await this.loadTrainingPaths();
            }

            // Load challenges
            if (this.shouldLoadChallenges()) {
                await this.loadChallenges();
            }

            // Load leaderboard
            if (this.shouldLoadLeaderboard()) {
                await this.loadLeaderboard();
            }

            // Load achievements
            if (this.shouldLoadAchievements()) {
                await this.loadAchievements();
            }

            // Load rewards
            if (this.shouldLoadRewards()) {
                await this.loadRewards();
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    // Navigation Methods with better error handling
    handleNavigation(page) {
        try {
            this.currentPage = page;
            this.updateActiveNavigation(page);
            this.loadPageContent(page);
        } catch (error) {
            console.error('Navigation error:', error);
            this.showNotification('فشل في التنقل', 'error');
        }
    }

    updateActiveNavigation(page) {
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.classList.remove('text-primary', 'border-b-2', 'border-primary');
            const href = link.getAttribute('href');
            if (href && (href === `#${page}` || href.includes(page))) {
                link.classList.add('text-primary', 'border-b-2', 'border-primary');
            }
        });
    }

    loadPageContent(page) {
        // Show loading state
        this.showLoadingState('جاري التحميل...');

        // Load page content based on page type
        const pageRoutes = {
            'training': 'training_path_map_view.html',
            'challenges': 'weekly_challenges_hub.html', 
            'leaderboard': 'admin_dashboard_overview.html',
            'rewards': 'caliquest_xp_rewards_store.html',
            'database': 'database-admin.html',
            'profile': 'user_profile_setup_step_1.html',
            'workout': 'workout_player_screen.html'
        };

        const targetPage = pageRoutes[page];
        if (targetPage) {
            window.location.href = targetPage;
        } else {
            this.hideLoadingState();
            console.warn(`Unknown page: ${page}`);
        }
    }

    // Enhanced Auth Methods with better error handling
    async handleLogin(event) {
        const form = event.target;
        const email = form.email.value;
        const password = form.password.value;

        // Basic validation
        if (!email || !password) {
            this.showNotification('يرجى ملء جميع الحقول', 'warning');
            return;
        }

        try {
            this.showLoadingState('جاري تسجيل الدخول...');
            
            const data = await this.api.signIn(email, password);
            this.currentUser = data.user;
            
            await this.loadUserProfile();
            this.updateUIForLoggedInUser();
            this.hideAuthModal();
            this.showNotification('تم تسجيل الدخول بنجاح!', 'success');
            
            // Redirect based on user preference or last page
            const redirectPage = sessionStorage.getItem('redirectAfterLogin') || 'training';
            sessionStorage.removeItem('redirectAfterLogin');
            this.handleNavigation(redirectPage);
            
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = this.getAuthErrorMessage(error);
            this.showNotification(errorMessage, 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    async handleSignup(event) {
        const form = event.target;
        const email = form.email.value;
        const password = form.password.value;
        const username = form.username.value;
        const confirmPassword = form.confirmPassword?.value;

        // Enhanced validation
        if (!email || !password || !username) {
            this.showNotification('يرجى ملء جميع الحقول المطلوبة', 'warning');
            return;
        }

        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
            this.showNotification('اسم المستخدم يجب أن يكون 3-20 حرف، حروف وأرقام فقط', 'warning');
            return;
        }

        if (password.length < 8) {
            this.showNotification('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'warning');
            return;
        }

        if (confirmPassword && password !== confirmPassword) {
            this.showNotification('كلمات المرور غير متطابقة', 'warning');
            return;
        }

        const strength = this.calculatePasswordStrength(password);
        if (strength.percentage < 40) {
            this.showNotification('كلمة المرور ضعيفة جداً، يرجى اختيار كلمة أقوى', 'warning');
            return;
        }

        // Check terms acceptance
        const termsCheckbox = document.getElementById('terms');
        if (termsCheckbox && !termsCheckbox.checked) {
            this.showNotification('يجب الموافقة على شروط الخدمة وسياسة الخصوصية', 'warning');
            return;
        }

        try {
            this.showLoadingState('جاري إنشاء الحساب...');
            
            const userData = {
                username: username,
                display_name: username
            };
            
            const data = await this.api.signUp(email, password, userData);
            this.currentUser = data.user;
            
            // Note: Profile will be created separately after email verification
            this.updateUIForLoggedInUser();
            this.hideAuthModal();
            this.showNotification('تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني', 'success');
            
            // Load dynamic stats
            this.loadDynamicStats();
            
            // Redirect to profile setup after verification
            setTimeout(() => {
                this.handleNavigation('profile');
            }, 1500);
            
        } catch (error) {
            console.error('Signup error:', error);
            const errorMessage = this.getAuthErrorMessage(error);
            this.showNotification(errorMessage, 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    getAuthErrorMessage(error) {
        const errorMessages = {
            'Invalid login credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
            'User already registered': 'هذا المستخدم مسجل بالفعل',
            'Password should be at least 6 characters': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
            'Invalid email': 'البريد الإلكتروني غير صحيح',
            'Network request failed': 'فشل الاتصال بالشبكة، يرجى المحاولة مرة أخرى'
        };
        
        return errorMessages[error.message] || 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى';
    }

    async handleLogout() {
        try {
            await this.api.signOut();
            this.currentUser = null;
            this.updateUIForLoggedOutUser();
            this.showNotification('تم تسجيل الخروج بنجاح', 'info');
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('فشل في تسجيل الخروج', 'error');
        }
    }

    // Workout Methods
    async startWorkout(workoutId) {
        if (!this.currentUser) {
            this.showNotification('يجب تسجيل الدخول أولاً', 'warning');
            this.showAuthModal('login');
            return;
        }

        try {
            this.showLoadingState('جاري تحميل التمرين...');
            
            const workout = await this.getWorkoutDetails(workoutId);
            this.showWorkoutModal(workout);
            
        } catch (error) {
            console.error('Error starting workout:', error);
            this.showNotification('فشل في تحميل التمرين', 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    async completeWorkout(workoutId, stats) {
        try {
            this.showLoadingState('جاري حفظ التمرين...');
            
            const result = await this.api.completeWorkout(
                this.currentUser.id, 
                workoutId, 
                stats
            );
            
            this.updateUserXP(stats.xp_earned);
            this.showNotification('تم إكمال التمرين بنجاح! +' + stats.xp_earned + ' XP', 'success');
            
            // Check for achievements
            await this.checkAchievements();
            
        } catch (error) {
            console.error('Error completing workout:', error);
            this.showNotification('فشل في حفظ التمرين', 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    // Challenge Methods
    async acceptChallenge(challengeId) {
        if (!this.currentUser) {
            this.showNotification('يجب تسجيل الدخول أولاً', 'warning');
            this.showAuthModal('login');
            return;
        }

        try {
            this.showLoadingState('جاري قبول التحدي...');
            
            const result = await this.api.acceptChallenge(this.currentUser.id, challengeId);
            this.showNotification('تم قبول التحدي بنجاح!', 'success');
            
            // Update challenge button
            const btn = document.querySelector(`[data-challenge-id="${challengeId}"]`);
            if (btn) {
                btn.textContent = 'التحدي نشط';
                btn.classList.add('opacity-75', 'cursor-not-allowed');
                btn.disabled = true;
            }
            
        } catch (error) {
            console.error('Error accepting challenge:', error);
            this.showNotification('فشل في قبول التحدي', 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    // Reward Methods
    async redeemReward(rewardId) {
        if (!this.currentUser) {
            this.showNotification('يجب تسجيل الدخول أولاً', 'warning');
            this.showAuthModal('login');
            return;
        }

        try {
            this.showLoadingState('جاري استبدال المكافأة...');
            
            const success = await this.api.redeemReward(this.currentUser.id, rewardId);
            
            if (success) {
                this.showNotification('تم استبدال المكافأة بنجاح!', 'success');
                this.updateUserXP(-this.getRewardCost(rewardId)); // Deduct XP
            } else {
                this.showNotification('نقاط الخبرة غير كافية', 'warning');
            }
            
        } catch (error) {
            console.error('Error redeeming reward:', error);
            this.showNotification('فشل في استبدال المكافأة', 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    // Enhanced UI Update Methods with better state management
    updateUIForLoggedInUser() {
        // Update navigation
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            const displayName = this.currentUser.profile?.display_name || 'الملف الشخصي';
            const level = this.currentUser.profile?.level || 1;
            const xpCurrent = this.currentUser.profile?.xp_current || 0;
            const xpRequired = this.currentUser.profile?.xp_required || 1000;
            const xpPercentage = (xpCurrent / xpRequired) * 100;
            
            authButtons.innerHTML = `
                <div class="flex items-center gap-3">
                    <button class="profile-btn px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2">
                        <span class="material-symbols-outlined">account_circle</span>
                        <span class="hidden sm:inline">${displayName}</span>
                        <span class="text-xs bg-primary/20 px-2 py-1 rounded">مستوى ${level}</span>
                    </button>
                    <button class="logout-btn px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2">
                        <span class="material-symbols-outlined">logout</span>
                        <span class="hidden sm:inline">خروج</span>
                    </button>
                </div>
            `;
        }

        // Update user info in sidebar if exists
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            const displayName = this.currentUser.profile?.display_name || 'User';
            const level = this.currentUser.profile?.level || 1;
            const xpCurrent = this.currentUser.profile?.xp_current || 0;
            const xpRequired = this.currentUser.profile?.xp_required || 1000;
            const xpPercentage = (xpCurrent / xpRequired) * 100;
            
            userInfo.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span class="material-symbols-outlined text-primary">person</span>
                    </div>
                    <div>
                        <p class="font-bold">${displayName}</p>
                        <p class="text-sm text-white/70">مستوى ${level}</p>
                    </div>
                </div>
                <div class="mt-3">
                    <div class="flex justify-between text-sm mb-1">
                        <span>نقاط الخبرة</span>
                        <span>${xpCurrent.toLocaleString()}/${xpRequired.toLocaleString()}</span>
                    </div>
                    <div class="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                        <div class="bg-primary h-2 rounded-full transition-all duration-500" style="width: ${xpPercentage}%"></div>
                    </div>
                </div>
            `;
        }

        // Update page-specific elements
        this.updatePageSpecificElements();

        // Re-setup event listeners for new elements
        this.setupEventListeners();
    }

    updateUIForLoggedOutUser() {
        // Reset navigation
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.innerHTML = `
                <button class="login-btn px-5 h-10 text-sm font-bold border border-white/10 rounded-lg hover:bg-white/5 transition-colors">دخول</button>
                <button class="signup-btn px-5 h-10 bg-primary text-background-dark text-sm font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,238,255,0.4)] transition-all">تسجيل</button>
            `;
        }

        // Reset user info
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            userInfo.innerHTML = `
                <p class="text-white/50 text-center py-4">سجل الدخول للمتابعة</p>
            `;
        }

        // Update page-specific elements
        this.updatePageSpecificElements();

        // Re-setup event listeners
        this.setupEventListeners();
    }

    updatePageSpecificElements() {
        // Update elements that change based on auth status
        const elementsToUpdate = [
            '.start-journey-btn',
            '.get-started-btn', 
            '.workout-player-btn',
            '.rewards-store-btn',
            '.challenge-btn'
        ];

        elementsToUpdate.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (this.currentUser) {
                    element.classList.remove('opacity-50', 'cursor-not-allowed');
                    element.disabled = false;
                } else {
                    // Don't disable navigation buttons, just show auth modal when clicked
                    if (!element.classList.contains('nav-btn')) {
                        element.classList.add('opacity-50');
                    }
                }
            });
        });
    }

    updateAuthUI() {
        if (this.currentUser) {
            this.updateUIForLoggedInUser();
        } else {
            this.updateUIForLoggedOutUser();
        }
    }

    // Animation Methods
    animatePageLoad() {
        const elements = document.querySelectorAll('.fade-in-up');
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('animate-fadeInUp');
            }, index * 100);
        });
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fadeInUp');
                }
            });
        });

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    setupHoverEffects() {
        const cards = document.querySelectorAll('.card-hover');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    setupLoadingStates() {
        // Add loading spinners to buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (!btn.disabled) {
                    btn.classList.add('loading');
                    setTimeout(() => {
                        btn.classList.remove('loading');
                    }, 2000);
                }
            });
        });
    }

    // Utility Methods
    // Enhanced Notification System with better UX
    showNotification(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        const notificationId = `notification-${Date.now()}`;
        notification.id = notificationId;
        notification.className = `notification notification-${type} fixed top-20 right-6 px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-all duration-300 max-w-sm`; 
        
        const icons = {
            success: 'check_circle',
            error: 'error', 
            warning: 'warning',
            info: 'info'
        };
        
        const colors = {
            success: 'bg-green-500/90 text-white border-green-400',
            error: 'bg-red-500/90 text-white border-red-400',
            warning: 'bg-yellow-500/90 text-black border-yellow-400', 
            info: 'bg-primary/90 text-background-dark border-primary'
        };
        
        notification.classList.add(...colors[type].split(' '));
        notification.innerHTML = `
            <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-xl flex-shrink-0">${icons[type]}</span>
                <div class="flex-1">
                    <p class="font-medium">${message}</p>
                    ${type === 'warning' ? '<button class="text-xs underline mt-1 hover:opacity-80" onclick="this.parentElement.parentElement.parentElement.remove()">تجاهل</button>' : ''}
                </div>
                <button class="text-white/70 hover:text-white transition-colors" onclick="document.getElementById('${notificationId}').remove()">
                    <span class="material-symbols-outlined text-lg">close</span>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto-remove
        setTimeout(() => {
            const notif = document.getElementById(notificationId);
            if (notif) {
                notif.style.transform = 'translateX(120%)';
                setTimeout(() => {
                    if (notif.parentNode) {
                        notif.remove();
                    }
                }, 300);
            }
        }, duration);
        
        return notificationId;
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };
        return icons[type] || 'info';
    }

    // Enhanced Loading States with better performance
    showLoadingState(message = 'جاري التحميل...') {
        const loadingId = Date.now().toString();
        this.loadingStates.set(loadingId, { message, startTime: Date.now() });
        
        // Remove existing loaders if any
        this.hideLoadingState();
        
        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.setAttribute('data-loading-id', loadingId);
        loader.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-screen gap-4">
                <div class="spinner"></div>
                <p class="text-white text-lg">${message}</p>
                <div class="text-white/50 text-sm animate-pulse">يرجى الانتظار...</div>
            </div>
        `;
        
        document.body.appendChild(loader);
        
        // Auto-hide after 30 seconds to prevent stuck loaders
        setTimeout(() => {
            if (document.querySelector(`[data-loading-id="${loadingId}"]`)) {
                this.hideLoadingState();
                this.showNotification('استغرق الأمر وقتاً أطول من المتوقع', 'warning');
            }
        }, 30000);
        
        return loadingId;
    }

    hideLoadingState(loadingId = null) {
        if (loadingId) {
            const loader = document.querySelector(`[data-loading-id="${loadingId}"]`);
            if (loader) {
                loader.classList.add('hide');
                setTimeout(() => {
                    if (loader.parentNode) {
                        document.body.removeChild(loader);
                    }
                }, 300);
            }
            this.loadingStates.delete(loadingId);
        } else {
            // Remove all loaders
            const loaders = document.querySelectorAll('.loading-overlay');
            loaders.forEach(loader => {
                loader.classList.add('hide');
                setTimeout(() => {
                    if (loader.parentNode) {
                        document.body.removeChild(loader);
                    }
                }, 300);
            });
            this.loadingStates.clear();
        }
    }

    showAuthModal(type = 'login') {
        const modal = document.getElementById('authModal');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const authTitle = document.getElementById('authTitle');

        if (!modal) return;

        modal.classList.remove('hidden');
        modal.classList.add('flex');

        if (type === 'login') {
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
            loginBtn.classList.add('bg-primary', 'text-background-dark');
            loginBtn.classList.remove('text-white/70');
            signupBtn.classList.remove('bg-primary', 'text-background-dark');
            signupBtn.classList.add('text-white/70');
            authTitle.textContent = 'تسجيل الدخول';
        } else {
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
            signupBtn.classList.add('bg-primary', 'text-background-dark');
            signupBtn.classList.remove('text-white/70');
            loginBtn.classList.remove('bg-primary', 'text-background-dark');
            loginBtn.classList.add('text-white/70');
            authTitle.textContent = 'إنشاء حساب جديد';
        }

        // Focus first input
        setTimeout(() => {
            const firstInput = modal.querySelector('form:not(.hidden) input:first-of-type');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    hideAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            
            // Reset forms
            const forms = modal.querySelectorAll('form');
            forms.forEach(form => form.reset());
            
            // Reset validation states
            const inputs = modal.querySelectorAll('input');
            inputs.forEach(input => {
                input.classList.remove('border-red-500');
                input.classList.add('border-white/20');
            });
            
            // Reset password strength
            const strengthBar = document.getElementById('passwordStrength');
            const strengthText = document.getElementById('passwordStrengthText');
            if (strengthBar) strengthBar.style.width = '0%';
            if (strengthText) strengthText.textContent = '-';
        }
    }

    showProfileModal() {
        // Implementation for showing profile modal
        console.log('Show profile modal');
    }

    showSettingsModal() {
        // Implementation for showing settings modal
        console.log('Show settings modal');
    }

    toggleMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.toggle('active');
        }
    }

    // Data Loading Methods
    async loadTrainingPaths() {
        try {
            const paths = await this.api.getTrainingPaths();
            this.renderTrainingPaths(paths);
        } catch (error) {
            console.error('Error loading training paths:', error);
        }
    }

    async loadChallenges() {
        try {
            const challenges = await this.api.getChallenges();
            this.renderChallenges(challenges);
        } catch (error) {
            console.error('Error loading challenges:', error);
        }
    }

    async loadLeaderboard() {
        try {
            const leaderboard = await this.api.getLeaderboard();
            this.renderLeaderboard(leaderboard);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        }
    }

    async loadAchievements() {
        try {
            const achievements = await this.api.getAchievements();
            this.renderAchievements(achievements);
        } catch (error) {
            console.error('Error loading achievements:', error);
        }
    }

    async loadRewards() {
        try {
            const rewards = await this.api.getRewards();
            this.renderRewards(rewards);
        } catch (error) {
            console.error('Error loading rewards:', error);
        }
    }

    // Dynamic stats loading
    async loadDynamicStats() {
        try {
            // Simulate API call for stats
            const stats = await this.getPlatformStats();
            
            // Update community status
            const communityStatus = document.getElementById('communityStatus');
            if (communityStatus) {
                communityStatus.textContent = `${stats.activeUsers.toLocaleString('ar-EG')} رياضي نشط حالياً`;
            }
            
            // Update stats with animation
            this.animateStat('activeUsers', stats.activeUsers);
            this.animateStat('completedLevels', stats.completedLevels);
            this.animateStat('unlockedSkills', stats.unlockedSkills);
            
            // Update progress bars
            setTimeout(() => {
                this.updateStatBar('activeUsersBar', stats.activeUsersPercentage);
                this.updateStatBar('completedLevelsBar', stats.completedLevelsPercentage);
                this.updateStatBar('unlockedSkillsBar', stats.unlockedSkillsPercentage);
            }, 500);
            
        } catch (error) {
            console.error('Error loading stats:', error);
            // Set fallback values
            this.setFallbackStats();
        }
    }
    
    async getPlatformStats() {
        // Get real stats from database
        try {
            const { count: activeUsers, error: usersError } = await this.api.supabase
                .from(TABLES.PROFILES)
                .select('id', { count: 'exact', head: true });
            
            const { count: completedWorkouts, error: workoutsError } = await this.api.supabase
                .from(TABLES.USER_WORKOUTS)
                .select('id', { count: 'exact', head: true });
            
            const { count: unlockedSkills, error: skillsError } = await this.api.supabase
                .from(TABLES.USER_ACHIEVEMENTS)
                .select('id', { count: 'exact', head: true });
            
            if (usersError || workoutsError || skillsError) {
                throw new Error('Error fetching stats');
            }
            
            return {
                activeUsers: activeUsers || 0,
                completedLevels: completedWorkouts || 0,
                unlockedSkills: unlockedSkills || 0,
                activeUsersPercentage: Math.min(((activeUsers || 0) / 1000) * 100, 100),
                completedLevelsPercentage: Math.min(((completedWorkouts || 0) / 10000) * 100, 100),
                unlockedSkillsPercentage: Math.min(((unlockedSkills || 0) / 5000) * 100, 100)
            };
        } catch (error) {
            console.error('Error getting platform stats:', error);
            // Return fallback values
            return {
                activeUsers: 0,
                completedLevels: 0,
                unlockedSkills: 0,
                activeUsersPercentage: 0,
                completedLevelsPercentage: 0,
                unlockedSkillsPercentage: 0
            };
        }
    }
    
    setFallbackStats() {
        const communityStatus = document.getElementById('communityStatus');
        if (communityStatus) {
            communityStatus.textContent = 'انضم إلى مجتمع CaliQuest';
        }
        
        this.animateStat('activeUsers', 0);
        this.animateStat('completedLevels', 0);
        this.animateStat('unlockedSkills', 0);
    }
    
    animateStat(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const duration = 2000;
        const start = 0;
        const increment = targetValue / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= targetValue) {
                current = targetValue;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString('ar-EG');
        }, 16);
    }
    
    updateStatBar(elementId, percentage) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.width = `${percentage}%`;
        }
    }

    // Helper methods
    shouldLoadTrainingPaths() {
        return document.querySelector('.training-paths-container') !== null;
    }

    shouldLoadChallenges() {
        return document.querySelector('.challenges-container') !== null;
    }

    shouldLoadLeaderboard() {
        return document.querySelector('.leaderboard-container') !== null;
    }

    shouldLoadAchievements() {
        return document.querySelector('.achievements-container') !== null;
    }

    shouldLoadRewards() {
        return document.querySelector('.rewards-container') !== null;
    }

    // Additional helper methods for missing functionality
    getWorkoutDetails(workoutId) {
        return this.api.getWorkouts(workoutId).then(workouts => {
            return workouts.find(w => w.id === workoutId) || null;
        });
    }

    showWorkoutModal(workout) {
        // Implementation for showing workout modal
        console.log('Showing workout modal:', workout);
    }

    checkAchievements() {
        return this.api.getUserAchievements(this.currentUser.id);
    }

    updateUserXP(xpAmount) {
        return this.api.updateUserXP(this.currentUser.id, xpAmount);
    }

    getRewardCost(rewardId) {
        return this.api.getRewards().then(rewards => {
            const reward = rewards.find(r => r.id === rewardId);
            return reward ? reward.xp_cost : 100;
        });
    }

    handleMapNodeClick(node) {
        // Implementation for map node clicks
        console.log('Map node clicked:', node);
    }

    handleXPAction(action) {
        // Implementation for XP actions
        console.log('XP action:', action);
    }

    handleWorkoutSubmit(event) {
        // Implementation for workout form submission
        console.log('Workout submitted:', event);
    }

    handleChallengeSubmit(event) {
        // Implementation for challenge form submission
        console.log('Challenge submitted:', event);
    }

    handleProfileSetup(event) {
        // Implementation for profile setup
        console.log('Profile setup:', event);
    }

    saveProfile() {
        // Implementation for saving profile
        console.log('Saving profile...');
    }

    saveSettings() {
        // Implementation for saving settings
        console.log('Saving settings...');
    }

    renderLeaderboard(leaderboard) {
        console.log('Rendering leaderboard:', leaderboard);
    }

    renderAchievements(achievements) {
        console.log('Rendering achievements:', achievements);
    }

    renderRewards(rewards) {
        console.log('Rendering rewards:', rewards);
    }

    // Additional helper methods
    async getWorkoutDetails(workoutId) {
        // Implementation to get workout details
        return { id: workoutId, name: 'Sample Workout' };
    }

    showWorkoutModal(workout) {
        // Implementation to show workout modal
        console.log('Show workout modal:', workout);
    }

    getRewardCost(rewardId) {
        // Implementation to get reward cost
        return 100;
    }

    updateUserXP(amount) {
        if (this.currentUser && this.currentUser.profile) {
            this.currentUser.profile.xp_current += amount;
            this.updateAuthUI();
        }
    }

    async checkAchievements() {
        // Implementation to check for new achievements
        console.log('Checking achievements...');
    }

    handleMapNodeClick(node) {
        // Implementation for map node clicks
        console.log('Map node clicked:', node);
    }

    handleXPAction(action) {
        // Implementation for XP actions
        console.log('XP action:', action);
    }

    handleWorkoutSubmit(event) {
        // Implementation for workout form submission
        console.log('Workout submitted:', event);
    }

    handleChallengeSubmit(event) {
        // Implementation for challenge form submission
        console.log('Challenge submitted:', event);
    }

    handleProfileSetup(event) {
        // Implementation for profile setup
        console.log('Profile setup:', event);
    }

    saveProfile() {
        // Implementation for saving profile
        console.log('Save profile');
    }

    saveSettings() {
        // Implementation for saving settings
        console.log('Save settings');
    }

    showLoginForm() {
        this.showAuthModal('login');
    }

    showSignupForm() {
        this.showAuthModal('signup');
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.caliQuestApp = new CaliQuestApp();
});

// Export for global access
window.CaliQuestApp = CaliQuestApp;

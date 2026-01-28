(function () {
    'use strict';

    var CONFIG = {
        scrollThreshold: 50,
        mobileBreakpoint: 768,
        revealOffset: 30,
        revealDuration: 600
    };

    var SELECTORS = {
        header: '.header',
        navToggle: '.nav-toggle',
        navMobile: '.nav-mobile',
        navMobileLink: '.nav-mobile__link',
        anchorLink: 'a[href^="#"]',
        revealTargets: '.about, .philosophy, .brand, .contact, .editorial__item'
    };

    var CLASSES = {
        headerScrolled: 'header--scrolled',
        navMobileOpen: 'nav-mobile--open'
    };

    function HeaderController(element) {
        this.element = element;
        this.isScrolled = false;
    }

    HeaderController.prototype.update = function () {
        var shouldBeScrolled = window.scrollY > CONFIG.scrollThreshold;

        if (this.isScrolled !== shouldBeScrolled) {
            this.isScrolled = shouldBeScrolled;
            this.element.classList.toggle(CLASSES.headerScrolled, shouldBeScrolled);
        }
    };

    HeaderController.prototype.init = function () {
        var self = this;
        window.addEventListener('scroll', function () {
            self.update();
        }, { passive: true });
        this.update();
    };

    function MobileNavController(toggle, nav) {
        this.toggle = toggle;
        this.nav = nav;
        this.isOpen = false;
    }

    MobileNavController.prototype.open = function () {
        this.isOpen = true;
        this.toggle.setAttribute('aria-expanded', 'true');
        this.nav.classList.add(CLASSES.navMobileOpen);
        document.body.style.overflow = 'hidden';
    };

    MobileNavController.prototype.close = function () {
        this.isOpen = false;
        this.toggle.setAttribute('aria-expanded', 'false');
        this.nav.classList.remove(CLASSES.navMobileOpen);
        document.body.style.overflow = '';
    };

    MobileNavController.prototype.toggle_ = function () {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    };

    MobileNavController.prototype.init = function () {
        var self = this;

        this.toggle.addEventListener('click', function () {
            self.toggle_();
        });

        var links = this.nav.querySelectorAll(SELECTORS.navMobileLink);
        links.forEach(function (link) {
            link.addEventListener('click', function () {
                self.close();
            });
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth >= CONFIG.mobileBreakpoint && self.isOpen) {
                self.close();
            }
        });
    };

    function SmoothScrollController(headerElement) {
        this.headerElement = headerElement;
    }

    SmoothScrollController.prototype.scrollToTarget = function (target) {
        var headerHeight = this.headerElement.offsetHeight;
        var targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    };

    SmoothScrollController.prototype.init = function () {
        var self = this;
        var links = document.querySelectorAll(SELECTORS.anchorLink);

        links.forEach(function (link) {
            link.addEventListener('click', function (event) {
                var href = this.getAttribute('href');

                if (href === '#') {
                    return;
                }

                var target = document.querySelector(href);

                if (target) {
                    event.preventDefault();
                    self.scrollToTarget(target);
                }
            });
        });
    };

    function RevealController() {
        this.observer = null;
    }

    RevealController.prototype.createObserver = function () {
        var self = this;

        return new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    self.reveal(entry.target);
                    self.observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
    };

    RevealController.prototype.hide = function (element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(' + CONFIG.revealOffset + 'px)';
        element.style.transition = 'opacity ' + CONFIG.revealDuration + 'ms ease, transform ' + CONFIG.revealDuration + 'ms ease';
    };

    RevealController.prototype.reveal = function (element) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    };

    RevealController.prototype.init = function () {
        if (!('IntersectionObserver' in window)) {
            return;
        }

        var self = this;
        var elements = document.querySelectorAll(SELECTORS.revealTargets);

        if (elements.length === 0) {
            return;
        }

        this.observer = this.createObserver();

        elements.forEach(function (element) {
            self.hide(element);
            self.observer.observe(element);
        });
    };

    function init() {
        var header = document.querySelector(SELECTORS.header);
        var navToggle = document.querySelector(SELECTORS.navToggle);
        var navMobile = document.querySelector(SELECTORS.navMobile);

        if (header) {
            new HeaderController(header).init();
            new SmoothScrollController(header).init();
        }

        if (navToggle && navMobile) {
            new MobileNavController(navToggle, navMobile).init();
        }

        new RevealController().init();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

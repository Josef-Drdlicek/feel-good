(function () {
    'use strict';

    var CONFIG = {
        headerOffset: 120,
        observerRootMargin: '-20% 0px -70% 0px'
    };

    var SELECTORS = {
        section: '.bb-section',
        navLink: '.bb-nav__link'
    };

    var CLASSES = {
        navLinkActive: 'bb-nav__link--active'
    };

    function NavigationHighlighter(sections, links) {
        this.sections = sections;
        this.links = links;
        this.observer = null;
    }

    NavigationHighlighter.prototype.setActiveLink = function (sectionId) {
        var self = this;

        this.links.forEach(function (link) {
            var isActive = link.getAttribute('href') === '#' + sectionId;
            link.classList.toggle(CLASSES.navLinkActive, isActive);
        });
    };

    NavigationHighlighter.prototype.createObserver = function () {
        var self = this;

        return new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var sectionId = entry.target.getAttribute('id');
                    self.setActiveLink(sectionId);
                }
            });
        }, {
            rootMargin: CONFIG.observerRootMargin
        });
    };

    NavigationHighlighter.prototype.init = function () {
        var self = this;

        this.observer = this.createObserver();

        this.sections.forEach(function (section) {
            self.observer.observe(section);
        });
    };

    function SmoothScrollHandler(links) {
        this.links = links;
    }

    SmoothScrollHandler.prototype.scrollToTarget = function (target) {
        var targetPosition = target.getBoundingClientRect().top + window.scrollY - CONFIG.headerOffset;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    };

    SmoothScrollHandler.prototype.init = function () {
        var self = this;

        this.links.forEach(function (link) {
            link.addEventListener('click', function (event) {
                var targetId = this.getAttribute('href');
                var target = document.querySelector(targetId);

                if (target) {
                    event.preventDefault();
                    self.scrollToTarget(target);
                }
            });
        });
    };

    function init() {
        var sections = document.querySelectorAll(SELECTORS.section);
        var navLinks = document.querySelectorAll(SELECTORS.navLink);

        if (sections.length === 0 || navLinks.length === 0) {
            return;
        }

        new NavigationHighlighter(sections, navLinks).init();
        new SmoothScrollHandler(navLinks).init();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

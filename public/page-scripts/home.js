/* Home page route behavior. */
(function () {
  // In Next.js, page scripts can load AFTER DOMContentLoaded / window.load.
  // Also, vendor scripts (Swiper) may load after this file.
  function whenReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function whenWindowLoaded(fn) {
    if (document.readyState === "complete") {
      fn();
    } else {
      window.addEventListener("load", fn, { once: true });
    }
  }

  function whenSwiperReady(fn) {
    var tries = 0;
    (function check() {
      // eslint-disable-next-line no-undef
      if (typeof Swiper !== "undefined") {
        fn();
        return;
      }
      tries += 1;
      if (tries > 200) return; // ~10s max
      setTimeout(check, 50);
    })();
  }

  function whenMarqueeReady(fn) {
    var tries = 0;
    (function check() {
      if (window.jQuery && window.jQuery.fn && window.jQuery.fn.marquee) {
        fn(window.jQuery);
        return;
      }
      tries += 1;
      if (tries > 200) return; // ~10s max
      setTimeout(check, 50);
    })();
  }

  function initBrandPartners() {
    // DISABLED: React component BrandSlider.tsx now handles this
    // Brand partner slider is now managed by React component for better compatibility with Next.js routing
    console.log('[home.js] Brand slider initialization skipped - handled by React component');
    return;
    
    /* Original code disabled
    var brandPanel = document.querySelector(".panzer-cyber-brand-panel");
    var brandSliderElement = brandPanel ? brandPanel.querySelector(".brands-slider-three") : null;

    if (!brandSliderElement) return;

    whenSwiperReady(function () {
      // eslint-disable-next-line no-undef
      if (typeof Swiper === "undefined") return;

      var brandWrapper = brandSliderElement.querySelector(".swiper-wrapper");
      var brandPrevButton = brandPanel.querySelector(".panzer-brand-prev");
      var brandNextButton = brandPanel.querySelector(".panzer-brand-next");

      function resetButton(button) {
        if (!button) return null;
        var cleanButton = button.cloneNode(true);
        button.replaceWith(cleanButton);
        return cleanButton;
      }

      if (!brandWrapper) return;

      if (brandSliderElement.swiper && !brandSliderElement.swiper.destroyed) {
        brandSliderElement.swiper.destroy(true, true);
      }

      brandWrapper.querySelectorAll(".panzer-brand-loop-fill").forEach(function (slide) {
        slide.remove();
      });

      var brandSlides = brandWrapper.querySelectorAll(":scope > .swiper-slide");
      var brandSlideTotal = brandSlides.length;

      if (brandSlideTotal > 4 && brandSlideTotal % 2 !== 0 && brandSlides[0]) {
        var fillSlide = brandSlides[0].cloneNode(true);
        fillSlide.classList.add("panzer-brand-loop-fill");
        fillSlide.setAttribute("aria-hidden", "true");
        brandWrapper.appendChild(fillSlide);
        brandSlideTotal += 1;
      }

      brandPrevButton = resetButton(brandPrevButton);
      brandNextButton = resetButton(brandNextButton);

      // eslint-disable-next-line no-undef
      new Swiper(brandSliderElement, {
        slidesPerView: 2,
        slidesPerGroup: 2,
        spaceBetween: 18,
        centeredSlides: false,
        loop: brandSlideTotal > 4,
        loopAddBlankSlides: false,
        loopAdditionalSlides: 0,
        speed: 850,
        allowTouchMove: true,
        autoplay: {
          delay: 2400,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
          stopOnLastSlide: false,
        },
        observer: true,
        observeParents: true,
        navigation: {
          prevEl: brandPrevButton,
          nextEl: brandNextButton,
        },
        breakpoints: {
          0: { slidesPerView: 1, slidesPerGroup: 1 },
          576: { slidesPerView: 2, slidesPerGroup: 2 },
          767: { slidesPerView: 3, slidesPerGroup: 2 },
          854: { slidesPerView: 4, slidesPerGroup: 2 },
          1199: { slidesPerView: 4, slidesPerGroup: 2 },
        },
      });
    });
    */
  }

  function initHeroAndService() {
    var serviceScroller = document.querySelector(".panzer-scroll-service");
    var servicePrevButton = document.querySelector(".panzer-service-prev");
    var serviceNextButton = document.querySelector(".panzer-service-next");

    // NOTE: service card pin animation is now managed by the HomeServicePins
    // React component (src/components/frontend/HomeServicePins.tsx).
    // It handles re-initialization on every navigation to "/" reliably.
    // Do NOT init pins here to avoid double-initialization conflicts.
    function refreshServicePins() {
      // Handled by HomeServicePins React component
    }

    if (serviceScroller && servicePrevButton && serviceNextButton && !serviceScroller.dataset.panzerServiceReady) {
      serviceScroller.dataset.panzerServiceReady = "true";

      function getServiceStep() {
        var firstSlide = serviceScroller.querySelector(".swiper-slide");
        var wrapper = serviceScroller.querySelector(".swiper-wrapper");
        var gap = wrapper
          ? parseFloat(window.getComputedStyle(wrapper).columnGap || window.getComputedStyle(wrapper).gap)
          : 0;

        return firstSlide
          ? firstSlide.getBoundingClientRect().width + (Number.isNaN(gap) ? 0 : gap)
          : serviceScroller.clientWidth;
      }

      function moveServiceScroller(direction, event) {
        event.preventDefault();
        serviceScroller.scrollBy({
          left: direction * getServiceStep(),
          behavior: "smooth",
        });
      }

      servicePrevButton.addEventListener("click", function (event) {
        moveServiceScroller(-1, event);
      });

      serviceNextButton.addEventListener("click", function (event) {
        moveServiceScroller(1, event);
      });
    }

    refreshServicePins();

    if (serviceScroller && !serviceScroller.dataset.panzerServiceResizeReady) {
      serviceScroller.dataset.panzerServiceResizeReady = "true";
      var resizeTimer;

      window.addEventListener("resize", function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(refreshServicePins, 150);
      });
    }

    var sliderElement = document.querySelector(".panzer-cyber-slider");
    var currentElement = document.querySelector(".panzer-cyber-current");
    var totalElement = document.querySelector(".panzer-cyber-total");
    if (!sliderElement) return;

    whenSwiperReady(function () {
      // eslint-disable-next-line no-undef
      if (typeof Swiper === "undefined") return;

      var slideTotal = sliderElement.querySelectorAll(".swiper-wrapper > .swiper-slide").length;

      if (sliderElement.swiper && !sliderElement.swiper.destroyed) {
        sliderElement.swiper.destroy(true, true);
      }

      function formatSlideNumber(value) {
        return String(value).padStart(2, "0");
      }

      function updateSlideCounter(swiperInstance) {
        if (currentElement) currentElement.textContent = formatSlideNumber(swiperInstance.realIndex + 1);
        if (totalElement) totalElement.textContent = "/ " + formatSlideNumber(slideTotal);
      }

      function syncSlideVideos(swiperInstance) {
        var allVideos = sliderElement.querySelectorAll(".panzer-cyber-visual-video");
        var activeVideo = swiperInstance.slides[swiperInstance.activeIndex]
          ? swiperInstance.slides[swiperInstance.activeIndex].querySelector(".panzer-cyber-visual-video")
          : null;

        allVideos.forEach(function (videoElement) {
          if (videoElement !== activeVideo) videoElement.pause();
        });

        if (activeVideo) {
          activeVideo.muted = true;
          var playPromise = activeVideo.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () { });
          }
        }
      }

      // eslint-disable-next-line no-undef
      new Swiper(sliderElement, {
        effect: 'fade',
        fadeEffect: { crossFade: true },
        slidesPerView: 1,
        spaceBetween: 0,
        centeredSlides: false,
        loop: slideTotal > 1,
        rewind: false,
        speed: 900,
        grabCursor: true,
        watchSlidesProgress: true,
        observer: true,
        observeParents: true,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
          stopOnLastSlide: false,
        },
        navigation: {
          prevEl: ".panzer-cyber-prev",
          nextEl: ".panzer-cyber-next",
        },
        pagination: {
          el: ".panzer-cyber-pagination",
          clickable: true,
        },
        keyboard: {
          enabled: true,
        },
        a11y: {
          enabled: true,
        },
        on: {
          init: function () {
            updateSlideCounter(this);
            syncSlideVideos(this);
          },
          slideChange: function () {
            updateSlideCounter(this);
          },
          slideChangeTransitionEnd: function () {
            syncSlideVideos(this);
          },
        },
      });
    });
  }

  function initMarquee() {
    var marquee = document.querySelector(".tv-marquee-section .marquee_mode");
    if (!marquee) return;

    whenMarqueeReady(function ($) {
      var $marquee = $(marquee);

      if ($marquee.find(".js-marquee-wrapper").length) {
        $marquee.marquee("destroy");
      }

      $marquee.marquee({
        speed: 40,
        gap: 0,
        delayBeforeStart: 0,
        direction: "left",
        duplicated: true,
        pauseOnHover: true,
        startVisible: true,
      });
    });
  }

  whenWindowLoaded(initBrandPartners);
  whenReady(function () {
    initHeroAndService();
    initMarquee();
  });
})();

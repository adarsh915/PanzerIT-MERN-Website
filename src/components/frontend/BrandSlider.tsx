'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    Swiper: any;
  }
}

export function BrandSlider() {
  useEffect(() => {
    let swiperInstance: any = null
    let checkInterval: NodeJS.Timeout | null = null
    let timeoutId: NodeJS.Timeout | null = null

    function initBrandSlider() {
      if (typeof window === 'undefined' || !window.Swiper) {
        console.log('[BrandSlider] Swiper not available yet')
        return false
      }

      const brandPanel = document.querySelector('.panzer-cyber-brand-panel')
      const brandSliderElement = brandPanel ? brandPanel.querySelector('.brands-slider-three') : null

      if (!brandSliderElement) {
        console.log('[BrandSlider] Slider element not found')
        return false
      }

      console.log('[BrandSlider] ✅ Found slider element, initializing...')

      // Destroy existing instance
      if ((brandSliderElement as any).swiper && !(brandSliderElement as any).swiper.destroyed) {
        console.log('[BrandSlider] Destroying existing instance')
          ; (brandSliderElement as any).swiper.destroy(true, true)
      }

      const brandWrapper = brandSliderElement.querySelector('.swiper-wrapper')
      const brandPrevButton = brandPanel?.querySelector('.panzer-brand-prev')
      const brandNextButton = brandPanel?.querySelector('.panzer-brand-next')

      if (!brandWrapper) {
        console.log('[BrandSlider] ❌ Wrapper not found')
        return false
      }

      // Remove any loop fill slides from previous initialization
      brandWrapper.querySelectorAll('.panzer-brand-loop-fill').forEach((slide: Element) => {
        slide.remove()
      })

      const brandSlides = brandWrapper.querySelectorAll(':scope > .swiper-slide')
      let brandSlideTotal = brandSlides.length

      console.log('[BrandSlider] Found', brandSlideTotal, 'brand slides')

      // Duplicate slides for looping if less than required for viewport
      const minSlidesForLoop = 4
      if (brandSlideTotal < minSlidesForLoop && brandSlideTotal > 0) {
        const slidesToAdd = minSlidesForLoop - brandSlideTotal
        console.log('[BrandSlider] Duplicating slides...', slidesToAdd, 'times')
        for (let i = 0; i < slidesToAdd; i++) {
          const slideIndex = i % brandSlideTotal
          const clonedSlide = brandSlides[slideIndex].cloneNode(true) as Element
          clonedSlide.classList.add('panzer-brand-loop-fill')
          clonedSlide.setAttribute('aria-hidden', 'true')
          brandWrapper.appendChild(clonedSlide)
        }
        brandSlideTotal = brandWrapper.querySelectorAll(':scope > .swiper-slide').length
        console.log('[BrandSlider] Total slides after duplication:', brandSlideTotal)
      }

      // Add fill slide for odd numbers > 4 to make even groups
      if (brandSlideTotal > 4 && brandSlideTotal % 2 !== 0 && brandSlides[0]) {
        const fillSlide = brandSlides[0].cloneNode(true) as Element
        fillSlide.classList.add('panzer-brand-loop-fill')
        fillSlide.setAttribute('aria-hidden', 'true')
        brandWrapper.appendChild(fillSlide)
        brandSlideTotal += 1
        console.log('[BrandSlider] Added fill slide for even grouping, total:', brandSlideTotal)
      }

      console.log('[BrandSlider] Initializing Swiper with loop enabled...')

      // Initialize Swiper with loop always enabled
      swiperInstance = new window.Swiper(brandSliderElement, {
        slidesPerView: 2,
        slidesPerGroup: 2,
        spaceBetween: 18,
        centeredSlides: false,
        loop: true, // Always enable loop
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
          854: { slidesPerView: 5, slidesPerGroup: 2 },
          1199: { slidesPerView: 5, slidesPerGroup: 2 },
        },
        on: {
          init: function () {
            console.log('[BrandSlider] ✅✅✅ Swiper initialized successfully!')
          }
        }
      })

      console.log('[BrandSlider] Swiper instance created:', swiperInstance ? 'YES' : 'NO')
      return true
    }

    // Try initializing immediately
    if (window.Swiper) {
      const success = initBrandSlider()
      if (!success) {
        // If slider element not found, wait for it
        checkInterval = setInterval(() => {
          if (initBrandSlider()) {
            if (checkInterval) clearInterval(checkInterval)
          }
        }, 100)

        timeoutId = setTimeout(() => {
          if (checkInterval) clearInterval(checkInterval)
        }, 5000)
      }
    } else {
      // Wait for Swiper library to load
      checkInterval = setInterval(() => {
        if (window.Swiper) {
          if (initBrandSlider() && checkInterval) {
            clearInterval(checkInterval)
          }
        }
      }, 100)

      timeoutId = setTimeout(() => {
        if (checkInterval) clearInterval(checkInterval)
      }, 10000)
    }

    // Cleanup on unmount
    return () => {
      if (checkInterval) clearInterval(checkInterval)
      if (timeoutId) clearTimeout(timeoutId)
      if (swiperInstance && !swiperInstance.destroyed) {
        swiperInstance.destroy(true, true)
      }
    }
  }, [])

  return null // No wrapper needed
}

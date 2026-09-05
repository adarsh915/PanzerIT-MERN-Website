'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    Swiper: any;
  }
}

export function HeroSlider() {
  useEffect(() => {
    let swiperInstance: any = null
    let attemptCount = 0
    const maxAttempts = 50 // 5 seconds total

    function initSlider() {
      attemptCount++
      
      if (typeof window === 'undefined' || !window.Swiper) {
        return false
      }

      const sliderElement = document.querySelector('.panzer-cyber-slider')
      if (!sliderElement) {
        return false
      }

      // Destroy existing instance if it exists (from home.js or previous mount)
      if ((sliderElement as any).swiper && !(sliderElement as any).swiper.destroyed) {
        ;(sliderElement as any).swiper.destroy(true, true)
      }

      const slideTotal = sliderElement.querySelectorAll('.swiper-wrapper > .swiper-slide').length

      if (slideTotal === 0) {
        return false
      }

      // Initialize Swiper
      swiperInstance = new window.Swiper(sliderElement, {
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
          pauseOnMouseEnter: false, // Don't pause on slider hover
          stopOnLastSlide: false,
        },
        navigation: {
          prevEl: '.panzer-cyber-prev',
          nextEl: '.panzer-cyber-next',
        },
        pagination: {
          el: '.panzer-cyber-pagination',
          clickable: true,
        },
        keyboard: {
          enabled: true,
        },
        a11y: {
          enabled: true,
        },
        on: {
          init: function (this: any) {
            // Animate images on init
            setTimeout(() => {
              const visuals = document.querySelectorAll('.panzer-cyber-visual')
              visuals.forEach((visual: any) => {
                visual.style.opacity = '1'
                visual.style.transition = 'opacity 0.6s ease-in-out'
              })
            }, 100)
            // Explicitly start autoplay in case it didn't trigger
            if (this.autoplay) {
              this.autoplay.start()
            }
            
            // Add pause/resume only on progress bar (pagination) hover
            const pagination = document.querySelector('.panzer-cyber-pagination')
            if (pagination && this.autoplay) {
              pagination.addEventListener('mouseenter', () => {
                if (this.autoplay && this.autoplay.running) {
                  this.autoplay.stop()
                }
              })
              pagination.addEventListener('mouseleave', () => {
                if (this.autoplay && !this.autoplay.running) {
                  this.autoplay.start()
                }
              })
            }
          },
        },
      })

      return true
    }

    // Retry logic with interval
    const checkInterval = setInterval(() => {
      if (initSlider()) {
        clearInterval(checkInterval)
      } else if (attemptCount >= maxAttempts) {
        clearInterval(checkInterval)
      }
    }, 100) // Check every 100ms

    // Try initializing immediately
    if (window.Swiper) {
      if (initSlider()) {
        if (checkInterval) clearInterval(checkInterval)
      }
    }

    // Fallback interval to force slide changes if native autoplay is blocked by other scripts
    const manualAutoplayInterval = setInterval(() => {
      if (swiperInstance && !swiperInstance.destroyed) {
        swiperInstance.slideNext()
      }
    }, 5000)

    // Cleanup on unmount
    return () => {
      clearInterval(checkInterval)
      clearInterval(manualAutoplayInterval)
      if (swiperInstance && !swiperInstance.destroyed) {
        swiperInstance.destroy(true, true)
      }
    }
  }, []) // Empty dependency array - run once per mount

  return null // No wrapper needed
}

'use client'
import React, { useEffect, useRef } from 'react';

export default function ServiceSliderArrows() {
    const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const scrollSlider = (direction: 'prev' | 'next') => {
        const slider = document.querySelector('.panzer-scroll-service') as HTMLElement | null;
        if (!slider) return;

        const wrapper = slider.querySelector('.swiper-wrapper') || slider;
        const firstSlide = slider.querySelector('.swiper-slide');
        const sliderStyles = window.getComputedStyle(wrapper);
        const gap = parseFloat(sliderStyles.columnGap || sliderStyles.gap) || 0;

        const step = firstSlide ? firstSlide.getBoundingClientRect().width + gap : slider.clientWidth;

        slider.scrollBy({
            left: direction === 'prev' ? -step : step,
            behavior: 'smooth',
        });
    };

    // Auto-slide on mobile only
    useEffect(() => {
        const isMobile = () => window.innerWidth < 992;

        const startAutoplay = () => {
            if (!isMobile()) return;

            autoplayRef.current = setInterval(() => {
                const slider = document.querySelector('.panzer-scroll-service') as HTMLElement | null;
                if (!slider) return;

                const maxScroll = slider.scrollWidth - slider.clientWidth;
                // If at or near the end, jump back to start
                if (slider.scrollLeft >= maxScroll - 5) {
                    slider.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollSlider('next');
                }
            }, 3000);
        };

        const stopAutoplay = () => {
            if (autoplayRef.current) {
                clearInterval(autoplayRef.current);
                autoplayRef.current = null;
            }
        };

        startAutoplay();

        // Pause on manual touch
        const slider = document.querySelector('.panzer-scroll-service');
        slider?.addEventListener('touchstart', stopAutoplay, { passive: true });
        slider?.addEventListener('touchend', () => {
            setTimeout(startAutoplay, 3000);
        }, { passive: true });

        // Restart/stop on resize
        const onResize = () => {
            stopAutoplay();
            startAutoplay();
        };
        window.addEventListener('resize', onResize);

        return () => {
            stopAutoplay();
            slider?.removeEventListener('touchstart', stopAutoplay);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <div className="panzer-service-arrows">
            <button
                type="button"
                className="panzer-service-arrow panzer-service-prev"
                aria-label="Previous service"
                onClick={() => scrollSlider('prev')}
            >
                <i className="fa-solid fa-arrow-left"></i>
            </button>
            <button
                type="button"
                className="panzer-service-arrow panzer-service-next"
                aria-label="Next service"
                onClick={() => scrollSlider('next')}
            >
                <i className="fa-solid fa-arrow-right"></i>
            </button>
        </div>
    );
}

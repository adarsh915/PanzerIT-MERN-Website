module.exports = {
  plugins: {
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' && {
      '@fullhuman/postcss-purgecss': {
        content: [
          './src/app/**/*.{js,jsx,ts,tsx}',
          './src/components/**/*.{js,jsx,ts,tsx}',
          './public/**/*.html',
        ],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
        safelist: {
          // Standard safelist for static classes
          standard: [
            'html', 'body',
            'active', 'disabled', 'show', 'collapse', 'collapsing',
            'fade', 'modal-open', 'modal-backdrop',
            'dropdown-menu-end', 'dropdown-toggle',
            'panzer-field-error', 'panzer-error-msg',
            'current', 'service-item-pin',
          ],
          // Deep safelist - these patterns will match children too
          deep: [
            // Swiper - CRITICAL for slider functionality
            /^swiper/,
            
            // Font Awesome - all icon variants
            /^fa-/,
            /^fa$/,
            
            // Bootstrap dynamic color utilities
            /^bg-(primary|secondary|success|danger|warning|info|light|dark|white|transparent)/,
            /^text-(primary|secondary|success|danger|warning|info|light|dark|white|muted|body)/,
            /^border-(primary|secondary|success|danger|warning|info|light|dark|white)/,
            /^btn-(primary|secondary|success|danger|warning|info|light|dark|link|outline-)/,
            /^alert-(primary|secondary|success|danger|warning|info|light|dark)/,
            /^badge-(primary|secondary|success|danger|warning|info|light|dark)/,
            
            // Bootstrap subtle backgrounds (admin dashboard)
            /-(subtle|gradient)$/,
            
            // Avatar sizes
            /^avatar-/,
            
            // Spacing utilities (frequently used dynamically)
            /^[mtp][tblrxy]?-[0-5]$/,
            /^g-[0-5]$/,
            /^gap-[0-5]$/,
            
            // Flex utilities
            /^flex-/,
            /^align-/,
            /^justify-/,
            
            // Display utilities
            /^d-(none|block|inline|inline-block|flex|grid)/,
            
            // Animation classes
            /^animate/,
            /^wow/,
            /^fadeIn/,
            /^slideIn/,
            
            // Custom project prefixes
            /^panzer-/,
            /^service-/,
            /^choose-/,
            /^tv-/,
            
            // Flaticon
            /^flaticon-/,
            
            // Select2
            /^select2/,
            
            // Odometer
            /^odometer/,
            
            // Bootstrap components that might be dynamically created
            /^modal/,
            /^tooltip/,
            /^popover/,
            /^carousel/,
            /^accordion/,
            /^offcanvas/,
            /^toast/,
            /^Toastify/,
            
            // Form states
            /^is-(valid|invalid)/,
            /^was-validated/,
          ],
          // Greedy - match classes and their variants
          greedy: [
            /dropdown/,
            /collapse/,
            /nav-/,
            /navbar-/,
            /card-/,
            /list-group/,
            /table/,
            /form-/,
            /input-/,
            /btn-group/,
            /spinner/,
            /Toastify/,
            /toastify/,
          ],
        },
        // Don't remove font-face, keyframes, or CSS variables
        fontFace: true,
        keyframes: true,
        variables: true,
      },
    }),
  },
};

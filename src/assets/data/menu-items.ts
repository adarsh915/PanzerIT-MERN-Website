import { MenuItemType } from '@/types/menu'

const HIDDEN_MENU_KEYS = new Set([
  'calendar',
  'email',
  'file-manager',
  'components',
  'base-ui',
  'extended-ui',
  'icons',
  'charts',
  'forms',
  'tables',
  'maps',
  'pages',
  'auth',
  'errors',
  'more',
  'layouts',
  'multi-level',
  'invoice',
  'downloads',
])

const removeHiddenMenuItems = (items: MenuItemType[], role: string = 'admin'): MenuItemType[] =>
  items
    .filter((item) => !HIDDEN_MENU_KEYS.has(item.key))
    .filter((item) => {
      // Role-based filtering
      if (role === 'author') {
        // Authors can only see Dashboard, Media, Blog, Profile
        const allowedKeys = ['navigation', 'dashboard', 'media', 'blog', 'posts', 'profile'];
        return allowedKeys.includes(item.key);
      }
      if (role === 'manager') {
        // Managers cannot see Users, Settings
        const restrictedKeys = ['users', 'settings', 'settings-pages', 'settings-homepage', 'settings-header', 'settings-footer', 'settings-seo', 'settings-theme'];
        return !restrictedKeys.includes(item.key);
      }
      return true; // Admin sees everything (except hidden)
    })
    .map((item) => ({
      ...item,
      children: item.children ? removeHiddenMenuItems(item.children, role) : item.children,
    }))
    .filter((item) => !item.children || item.children.length > 0 || !item.isTitle);

// To get items by role
export const getMenuItemsByRole = (role: string = 'admin'): MenuItemType[] => {
  return removeHiddenMenuItems(MENU_ITEMS_DATA, role);
}

const MENU_ITEMS_DATA: MenuItemType[] = [
  {
    key: 'navigation',
    label: 'Navigation',
    isTitle: true,
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'tabler:dashboard',
    url: '/admin'
  },
  {
    key: 'calendar',
    label: 'Calendar',
    icon: 'tabler:calendar',
    url: '/admin/calendar'
  },
  {
    key: 'email',
    label: 'Email',
    icon: 'tabler:inbox',
    url: '/admin/email'
  },
  {
    key: 'file-manager',
    label: 'File Manager',
    icon: 'tabler:folder',
    url: '/admin/file-manager',
  },
  {
    key: 'users',
    label: 'Users',
    icon: 'tabler:users',
    url: '/admin/users',
  },
  {
    key: 'panzer-title',
    label: 'Panzer IT',
    isTitle: true,
  },
  {
    key: 'blog',
    label: 'Blog',
    icon: 'tabler:article',
    children: [
      {
        key: 'posts',
        label: 'Blog Posts',
        url: '/admin/posts',
        parentKey: 'blog',
      },
      {
        key: 'blog-categories',
        label: 'Blog Categories',
        url: '/admin/posts/categories',
        parentKey: 'blog',
      },
    ],
  },
  {
    key: 'solutions',
    label: 'Solutions & Services',
    icon: 'tabler:shield-check',
    children: [
      {
        key: 'solution-list',
        label: 'Solutions',
        url: '/admin/solutions',
        parentKey: 'solutions',
      },
      {
        key: 'solution-categories',
        label: 'Solution Categories',
        url: '/admin/solutions/categories',
        parentKey: 'solutions',
      },
    ],
  },
  {
    key: 'brands',
    label: 'Brands & Partners',
    icon: 'tabler:building-store',
    children: [
      {
        key: 'brand-list',
        label: 'Brands',
        url: '/admin/brands',
        parentKey: 'brands',
      },
      {
        key: 'brand-categories',
        label: 'Brand Categories',
        url: '/admin/brands/categories',
        parentKey: 'brands',
      },
    ],
  },
  {
    key: 'faqs',
    label: 'FAQs',
    icon: 'tabler:help',
    url: '/admin/faqs',
  },
  {
    key: 'resources',
    label: 'Resources',
    icon: 'tabler:folders',
    children: [
      {
        key: 'resource-list',
        label: 'Resources',
        url: '/admin/resources',
        parentKey: 'resources',
      },
      {
        key: 'resource-categories',
        label: 'Resource Categories',
        url: '/admin/resources/categories',
        parentKey: 'resources',
      },
    ],
  },
  {
    key: 'leads',
    label: 'Leads',
    icon: 'tabler:mail-opened',
    url: '/admin/leads',
  },
  {
    key: 'newsletter',
    label: 'Newsletter',
    icon: 'tabler:mail',
    url: '/admin/newsletter',
  },
  {
    key: 'downloads',
    label: 'Downloads',
    icon: 'tabler:download',
    url: '/admin/downloads',
  },
  {
    key: 'media',
    label: 'Media Library',
    icon: 'tabler:photo',
    url: '/admin/media',
  },
  {
    key: 'settings',
    label: 'Setting',
    icon: 'tabler:settings',
    children: [
      {
        key: 'settings-pages',
        label: 'Pages',
        parentKey: 'settings',
        children: [
          {
            key: 'settings-homepage',
            label: 'Homepage',
            url: '/admin/settings/pages/homepage',
            parentKey: 'settings-pages',
          },
        ],
      },
      {
        key: 'settings-header',
        label: 'Header',
        url: '/admin/settings/header',
        parentKey: 'settings',
      },
      {
        key: 'settings-footer',
        label: 'Footer',
        url: '/admin/settings/footer',
        parentKey: 'settings',
      },
      {
        key: 'settings-seo',
        label: 'Global SEO',
        url: '/admin/settings/seo',
        parentKey: 'settings',
      },
      {
        key: 'settings-custom-code',
        label: 'Custom Code',
        url: '/admin/settings/custom-code',
        parentKey: 'settings',
      },
      {
        key: 'settings-theme',
        label: 'Theme Colors',
        url: '/admin/settings/theme',
        parentKey: 'settings',
      },
    ],
  },
  {
    key: 'invoice',
    label: 'Invoice',
    icon: 'tabler:file-invoice',
    children: [
      {
        key: 'invoices',
        label: 'Invoices',
        url: '/admin/invoices',
        parentKey: 'invoice',
      },
      {
        key: 'view-invoices',
        label: 'View Invoices',
        url: '/admin/invoices/view-invoice',
        parentKey: 'invoice',
      },
      {
        key: 'create-invoices',
        label: 'Create Invoices',
        url: '/admin/invoices/create-invoices',
        parentKey: 'invoice',
      },
    ]
  },
  {
    key: 'pages',
    label: 'Pages',
    icon: 'tabler:files',
    children: [
      {
        key: 'starter-page',
        label: 'Starter Page',
        url: '/admin/pages/starter-page',
        parentKey: 'pages',
      },
      {
        key: 'pricing',
        label: 'Pricing',
        url: '/admin/pages/pricing',
        parentKey: 'pages',
      },
      {
        key: 'faqs',
        label: 'FAQs',
        url: '/admin/faqs',
        parentKey: 'pages',
      },
      {
        key: 'maintenance',
        label: 'Maintenance',
        url: '/admin/maintenance',
        parentKey: 'pages',
      },
      {
        key: 'timeline',
        label: 'Timeline',
        url: '/admin/pages/timeline',
        parentKey: 'pages',
      },
      {
        key: 'coming-soon',
        label: 'Coming Soon',
        url: '/admin/coming-soon',
        parentKey: 'pages',
      },
      {
        key: 'terms',
        label: 'Terms & Conditions',
        url: '/admin/pages/terms',
        parentKey: 'pages',
      },
      {
        key: 'error-404-alt',
        label: 'Error 404 Alt',
        url: '/admin/pages/error-404-alt',
        parentKey: 'pages',
      },
    ],
  },
  {
    key: 'auth',
    label: 'Auth Pages',
    icon: 'ri:lock-password-line',
    children: [
      {
        key: 'login',
        label: 'Login',
        url: '/admin/auth/login',
        parentKey: 'auth',
      },
      {
        key: 'register',
        label: 'Register',
        url: '/admin/auth/register',
        parentKey: 'auth',
      },
      {
        key: 'logout',
        label: 'Logout',
        url: '/admin/auth/logout',
        parentKey: 'auth',
      },
      {
        key: 'recover-password',
        label: 'Recover Password',
        url: '/admin/auth/recover-password',
        parentKey: 'auth',
      },
      {
        key: 'create-password',
        label: 'Create Password',
        url: '/admin/auth/create-password',
        parentKey: 'auth',
      },
      {
        key: 'lock-screen',
        label: 'Lock Screen',
        url: '/admin/auth/lock-screen',
        parentKey: 'auth',
      },
      {
        key: 'confirm-mail',
        label: 'Confirm Mail',
        url: '/admin/auth/confirm-mail',
        parentKey: 'auth',
      },
      {
        key: 'login-pin',
        label: 'Login with PIN',
        url: '/admin/auth/login-pin',
        parentKey: 'auth',
      },
    ],
  },
  {
    key: 'errors',
    label: 'Error Pages',
    icon: 'tabler:server-2',
    children: [
      {
        key: 'error-401',
        label: '401 Unauthorized',
        url: '/admin/errors/error-401',
        parentKey: 'errors',
      },
      {
        key: 'error-400',
        label: '400 Bad Request',
        url: '/admin/errors/error-400',
        parentKey: 'errors',
      },
      {
        key: 'error-403',
        label: '403 Forbidden',
        url: '/admin/errors/error-403',
        parentKey: 'errors',
      },
      {
        key: 'error-404',
        label: '404 Not Found',
        url: '/admin/errors/error-404',
        parentKey: 'errors',
      },
      {
        key: 'error-500',
        label: '500 Internal Server',
        url: '/admin/errors/error-500',
        parentKey: 'errors',
      },
      {
        key: 'service-unavailable',
        label: 'Service Unavailable',
        url: '/admin/errors/service-unavailable',
        parentKey: 'errors',
      },

    ]
  },
  {
    key: 'more',
    label: 'More',
    isTitle: true,
  },
  {
    key: 'layouts',
    label: 'Layouts',
    icon: 'tabler:layout',
    children: [
      {
        key: 'horizontal',
        label: 'Horizontal',
        url: '/admin/layouts/horizontal',
        parentKey: 'layouts',
        target: '_blank',
      },
      {
        key: 'detached',
        label: 'Detached',
        target: '_blank',
        url: '/admin/layouts/detached',
        parentKey: 'layouts',
      },
      {
        key: 'full-view',
        label: 'Full View',
        url: '/admin/layouts/full-view',
        parentKey: 'layouts',
        target: '_blank',
      },
      {
        key: 'fullscreen-view',
        label: 'FullScreen View',
        url: '/admin/layouts/fullscreen-view',
        parentKey: 'layouts',
        target: '_blank',
      },
      {
        key: 'hover-menu',
        label: 'Hover Menu',
        url: '/admin/layouts/hover-menu',
        parentKey: 'layouts',
        target: '_blank',
      },
      {
        key: 'compact',
        label: 'Compact',
        url: '/admin/layouts/compact',
        parentKey: 'layouts',
        target: '_blank',
      },
      {
        key: 'icon-view',
        label: 'Icon View',
        url: '/admin/layouts/icon-view',
        parentKey: 'layouts',
        target: '_blank',
      },
      {
        key: 'dark-mode',
        label: 'Dark Mode',
        url: '/admin/layouts/dark-mode',
        parentKey: 'layouts',
        target: '_blank',
      },
    ],
  },
  {
    key: 'multi-level',
    label: 'Multi Level',
    icon: 'tabler:box-multiple-3',
    children: [
      {
        key: 'second-level',
        label: 'Second Level',
        parentKey: 'multi-level',
        children: [
          {
            key: 'item11',
            label: 'Item 1',
            parentKey: 'second-level',
          },
          {
            key: 'item22',
            label: 'Item 2',
            parentKey: 'second-level',
          },
        ]
      },
      {
        key: 'third-level',
        label: 'Third Level',
        parentKey: 'multi-level',
        children: [
          {
            key: 'item1',
            label: 'Item 1',
            parentKey: 'third-level',
          },
          {
            key: 'item2',
            label: 'Item 2',
            parentKey: 'third-level',
            children: [
              {
                key: 'item2.1',
                label: 'Item 2.1',
                parentKey: 'item2',
              },
              {
                key: 'item2.2',
                label: 'Item 2.2',
                parentKey: 'item2',
              },
            ]
          },
        ]
      },
    ]
  },
  {
    key: 'components',
    label: 'Components',
    isTitle: true,
  },
  {
    key: 'base-ui',
    label: 'Base UI',
    icon: 'tabler:brightness',
    children: [
      {
        key: 'base-ui-accordions',
        label: 'Accordions',
        url: '/admin/ui/accordions',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-alerts',
        label: 'Alerts',
        url: '/admin/ui/alerts',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-avatars',
        label: 'Avatars',
        url: '/admin/ui/avatars',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-badges',
        label: 'Badges',
        url: '/admin/ui/badges',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-breadcrumb',
        label: 'Breadcrumb',
        url: '/admin/ui/breadcrumb',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-buttons',
        label: 'Buttons',
        url: '/admin/ui/buttons',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-cards',
        label: 'Cards',
        url: '/admin/ui/cards',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-carousel',
        label: 'Carousel',
        url: '/admin/ui/carousel',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-collapse',
        label: 'Collapse',
        url: '/admin/ui/collapse',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-dropdowns',
        label: 'Dropdowns',
        url: '/admin/ui/dropdowns',
        parentKey: 'base-ui',
      },
      {
        key: 'ul-ratio',
        label: 'Ratio',
        url: '/admin/ui/ratio',
        parentKey: 'base-ui',
      },
      {
        key: 'ul-grid',
        label: 'Grid',
        url: '/admin/ui/grid',
        parentKey: 'base-ui',
      },
      {
        key: 'ul-links',
        label: 'Links',
        url: '/admin/ui/links',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-list-group',
        label: 'List Group',
        url: '/admin/ui/list-group',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-modals',
        label: 'Modals',
        url: '/admin/ui/modals',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-notifications',
        label: 'Notifications',
        url: '/admin/ui/notifications',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-offcanvas',
        label: 'Offcanvas',
        url: '/admin/ui/offcanvas',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-placeholders',
        label: 'Placeholders',
        url: '/admin/ui/placeholders',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-pagination',
        label: 'Pagination',
        url: '/admin/ui/pagination',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-popovers',
        label: 'Popovers',
        url: '/admin/ui/popovers',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-progress',
        label: 'Progress',
        url: '/admin/ui/progress',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-spinners',
        label: 'Spinners',
        url: '/admin/ui/spinners',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-tabs',
        label: 'Tabs',
        url: '/admin/ui/tabs',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-tooltips',
        label: 'Tooltips',
        url: '/admin/ui/tooltips',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-typography',
        label: 'Typography',
        url: '/admin/ui/typography',
        parentKey: 'base-ui',
      },
      {
        key: 'base-ui-utilities',
        label: 'Utilities',
        url: '/admin/ui/utilities',
        parentKey: 'base-ui',
      },
    ]
  },
  {
    key: 'extended-ui',
    label: 'Extended UI',
    icon: 'tabler:alien',
    children: [
      {
        key: 'dragula',
        label: 'Dragula',
        url: '/admin/extended/dragula',
        parentKey: 'extended-ui',
      },
      {
        key: 'sweet-alert',
        label: 'Sweet Alert',
        url: '/admin/extended/sweet-alert',
        parentKey: 'extended-ui',
      },
      {
        key: 'ratings',
        label: 'Ratings',
        url: '/admin/extended/ratings',
        parentKey: 'extended-ui',
      },
      {
        key: 'scrollbar',
        label: 'Scrollbar',
        url: '/admin/extended/scrollbar',
        parentKey: 'extended-ui',
      },
    ]
  },
  {
    key: 'icons',
    label: 'Icons',
    icon: 'tabler:leaf',
    children: [
      {
        key: 'tabler',
        label: 'Tabler',
        url: '/admin/icons/tabler',
        parentKey: 'icons',
      },
      {
        key: 'solar',
        label: 'Solar',
        url: '/admin/icons/solar',
        parentKey: 'icons',
      },
    ]
  },
  {
    key: 'charts',
    label: 'Charts',
    icon: 'tabler:chart-arcs',
    children: [
      {
        key: 'area',
        label: 'Area',
        url: '/admin/charts/area',
        parentKey: 'charts',
      },
      {
        key: 'bar',
        label: 'Bar',
        url: '/admin/charts/bar',
        parentKey: 'charts',
      },
      {
        key: 'bubble',
        label: 'Bubble',
        url: '/admin/charts/bubble',
        parentKey: 'charts',
      },
      {
        key: 'candlestick',
        label: 'Candlestick',
        url: '/admin/charts/candlestick',
        parentKey: 'charts',
      },
      {
        key: 'column',
        label: 'Column',
        url: '/admin/charts/column',
        parentKey: 'charts',
      },
      {
        key: 'heatmap',
        label: 'Heatmap',
        url: '/admin/charts/heatmap',
        parentKey: 'charts',
      },
      {
        key: 'line',
        label: 'Line',
        url: '/admin/charts/line',
        parentKey: 'charts',
      },
      {
        key: 'mixed',
        label: 'Mixed',
        url: '/admin/charts/mixed',
        parentKey: 'charts',
      },
      {
        key: 'timeline-chart',
        label: 'Timeline',
        url: '/admin/charts/timeline',
        parentKey: 'charts',
      },
      {
        key: 'boxplot',
        label: 'Boxplot',
        url: '/admin/charts/boxplot',
        parentKey: 'charts',
      },
      {
        key: 'treemap',
        label: 'Treemap',
        url: '/admin/charts/treemap',
        parentKey: 'charts',
      },
      {
        key: 'pie',
        label: 'Pie',
        url: '/admin/charts/pie',
        parentKey: 'charts',
      },
      {
        key: 'radar',
        label: 'Radar',
        url: '/admin/charts/radar',
        parentKey: 'charts',
      },
      {
        key: 'radialBar',
        label: 'RadialBar',
        url: '/admin/charts/radialBar',
        parentKey: 'charts',
      },
      {
        key: 'scatter',
        label: 'Scatter',
        url: '/admin/charts/scatter',
        parentKey: 'charts',
      },
      {
        key: 'polar',
        label: 'Polar Area',
        url: '/admin/charts/polar',
        parentKey: 'charts',
      },
      {
        key: 'sparklines',
        label: 'Sparklines',
        url: '/admin/charts/sparklines',
        parentKey: 'charts',
      },
    ],
  },
  {
    key: 'forms',
    label: 'Forms',
    icon: 'tabler:forms',
    children: [
      {
        key: 'basic',
        label: 'Basic Elements',
        url: '/admin/forms/basic',
        parentKey: 'forms',
      },
      {
        key: 'inputmask',
        label: 'Inputmask',
        url: '/admin/forms/inputmask',
        parentKey: 'forms',
      },
      {
        key: 'picker',
        label: 'Picker',
        url: '/admin/forms/picker',
        parentKey: 'forms',
      },
      {
        key: 'select',
        label: 'Select',
        url: '/admin/forms/select',
        parentKey: 'forms',
      },
      {
        key: 'slider',
        label: 'Range Slider',
        url: '/admin/forms/slider',
        parentKey: 'forms',
      },
      {
        key: 'validation',
        label: 'Validation',
        url: '/admin/forms/validation',
        parentKey: 'forms',
      },
      {
        key: 'wizard',
        label: 'Wizard',
        url: '/admin/forms/wizard',
        parentKey: 'forms',
      },
      {
        key: 'file-uploads',
        label: 'File Uploads',
        url: '/admin/forms/file-uploads',
        parentKey: 'forms',
      },
      {
        key: 'editors',
        label: 'Editors',
        url: '/admin/forms/editors',
        parentKey: 'forms',
      },
      {
        key: 'layout',
        label: 'Layouts',
        url: '/admin/forms/layout',
        parentKey: 'forms',
      },
    ]
  },
  {
    key: 'tables',
    label: 'Tables',
    icon: 'tabler:table',
    children: [

      {
        key: 'basic-table',
        label: 'Basic Tables',
        url: '/admin/tables/basic-table',
        parentKey: 'tables',
      },
      {
        key: 'gridJs',
        label: 'GridJs Tables',
        url: '/admin/tables/gridJs',
        parentKey: 'tables',
      },
    ]
  },
  {
    key: 'maps',
    label: 'Maps',
    icon: 'tabler:map-pin',
    children: [
      {
        key: 'google',
        label: 'Google Maps',
        url: '/admin/maps/google',
        parentKey: 'maps',
      },
      {
        key: 'vector',
        label: 'Vector Maps',
        url: '/admin/maps/vector',
        parentKey: 'maps',
      },
      {
        key: 'vector',
        label: 'Leaflet Maps',
        url: '/admin/maps/leaflet',
        parentKey: 'maps',
      },
    ],
  },
]


export const MENU_ITEMS: MenuItemType[] = removeHiddenMenuItems(MENU_ITEMS_DATA)

const HORIZONTAL_MENU_ITEM_DATA: MenuItemType[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'tabler:dashboard',
    url: '/admin'
  },
  {
    key: 'apps',
    label: 'Apps',
    icon: 'tabler:apps',
    children: [
      {
        key: 'calendar',
        label: 'Calendar',
        url: '/admin/calendar',
        parentKey: 'apps'
      },
      {
        key: 'email',
        label: 'Email',
        url: '/admin/email',
        parentKey: 'apps'
      },
      {
        key: 'file-manager',
        label: 'File Manager',
        url: '/admin/file-manager',
        parentKey: 'apps'
      },
      {
        key: 'blog',
        label: 'Blog',
        parentKey: 'apps',
        children: [
          {
            key: 'posts',
            label: 'Blog Posts',
            url: '/admin/posts',
            parentKey: 'blog',
          },
          {
            key: 'blog-categories',
            label: 'Blog Categories',
            url: '/admin/posts/categories',
            parentKey: 'blog',
          },
        ],
      },
      {
        key: 'solutions',
        label: 'Solutions & Services',
        parentKey: 'apps',
        children: [
          {
            key: 'solution-list',
            label: 'Solutions',
            url: '/admin/solutions',
            parentKey: 'solutions',
          },
          {
            key: 'solution-categories',
            label: 'Solution Categories',
            url: '/admin/solutions/categories',
            parentKey: 'solutions',
          },
        ],
      },
      {
        key: 'brands',
        label: 'Brands & Partners',
        parentKey: 'apps',
        children: [
          {
            key: 'brand-list',
            label: 'Brands',
            url: '/admin/brands',
            parentKey: 'brands',
          },
          {
            key: 'brand-categories',
            label: 'Brand Categories',
            url: '/admin/brands/categories',
            parentKey: 'brands',
          },
        ],
      },
      {
        key: 'leads',
        label: 'Leads',
        url: '/admin/leads',
        parentKey: 'apps',
      },
      {
        key: 'downloads',
        label: 'Downloads',
        url: '/admin/downloads',
        parentKey: 'apps',
      },
      {
        key: 'media',
        label: 'Media Library',
        url: '/admin/media',
        parentKey: 'apps',
      },
      {
        key: 'invoices',
        label: 'Invoice',
        parentKey: 'apps',
        children: [
          {
            key: 'invoices',
            label: 'Invoices',
            url: '/admin/invoices',
            parentKey: 'invoice',
          },
          {
            key: 'view-invoices',
            label: 'View Invoices',
            url: '/admin/invoices/view-invoice',
            parentKey: 'invoice',
          },
          {
            key: 'create-invoices',
            label: 'Create Invoices',
            url: '/admin/invoices/create-invoices',
            parentKey: 'invoice',
          },
        ]
      },
    ]
  },
  {
    key: 'pages',
    label: 'Pages',
    icon: 'tabler:file-description',
    children: [
      {
        key: 'auth',
        label: 'Authentication',
        parentKey: 'pages',
        children: [
          {
            key: 'login',
            label: 'Login',
            url: '/admin/auth/login',
            parentKey: 'auth',
          },
          {
            key: 'register',
            label: 'Register',
            url: '/admin/auth/register',
            parentKey: 'auth',
          },
          {
            key: 'logout',
            label: 'Logout',
            url: '/admin/auth/logout',
            parentKey: 'auth',
          },
          {
            key: 'recover-password',
            label: 'Recover Password',
            url: '/admin/auth/recover-password',
            parentKey: 'auth',
          },
          {
            key: 'create-password',
            label: 'Create Password',
            url: '/admin/auth/create-password',
            parentKey: 'auth',
          },
          {
            key: 'lock-screen',
            label: 'Lock Screen',
            url: '/admin/auth/lock-screen',
            parentKey: 'auth',
          },
          {
            key: 'confirm-mail',
            label: 'Confirm Mail',
            url: '/admin/auth/confirm-mail',
            parentKey: 'auth',
          },
          {
            key: 'login-pin',
            label: 'Login with PIN',
            url: '/admin/auth/login-pin',
            parentKey: 'auth',
          },
        ]
      },
      {
        key: 'errors',
        label: 'Error Pages',
        parentKey: 'pages',
        children: [
          {
            key: 'error-401',
            label: '401 Unauthorized',
            url: '/admin/errors/error-401',
            parentKey: 'errors',
          },
          {
            key: 'error-400',
            label: '400 Bad Reques',
            url: '/admin/errors/error-400',
            parentKey: 'errors',
          },
          {
            key: 'error-403',
            label: '403 Forbidden',
            url: '/admin/errors/error-403',
            parentKey: 'errors',
          },
          {
            key: 'error-404',
            label: '404 Not Found',
            url: '/admin/errors/error-404',
            parentKey: 'errors',
          },
          {
            key: 'error-500',
            label: '500 Internal Server',
            url: '/admin/errors/error-500',
            parentKey: 'errors',
          },
          {
            key: 'service-unavailable',
            label: 'Service Unavailable',
            url: '/admin/errors/service-unavailable',
            parentKey: 'errors',
          },
        ]
      },
      {
        key: 'starter-page',
        label: 'Starter Page',
        url: '/admin/pages/starter-page',
        parentKey: 'pages',
      },
      {
        key: 'faq',
        label: 'FAQ',
        url: '/admin/pages/faqs',
        parentKey: 'pages',
      },
      {
        key: 'maintenance',
        label: 'Maintenance',
        url: '/admin/maintenance',
        parentKey: 'pages',
      },
      {
        key: 'timeline',
        label: 'Timeline',
        url: '/admin/pages/timeline',
        parentKey: 'pages',
      },
    ]
  },
  {
    key: 'components',
    label: 'Components',
    icon: 'tabler:components',
    children: [
      {
        key: 'base-ui',
        label: 'Base UI',
        children: [
          {
            key: 'base-ui-accordions',
            label: 'Accordions',
            url: '/admin/ui/accordions',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-alerts',
            label: 'Alerts',
            url: '/admin/ui/alerts',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-avatars',
            label: 'Avatars',
            url: '/admin/ui/avatars',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-badges',
            label: 'Badges',
            url: '/admin/ui/badges',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-breadcrumb',
            label: 'Breadcrumb',
            url: '/admin/ui/breadcrumb',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-buttons',
            label: 'Buttons',
            url: '/admin/ui/buttons',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-cards',
            label: 'Cards',
            url: '/admin/ui/cards',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-carousel',
            label: 'Carousel',
            url: '/admin/ui/carousel',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-collapse',
            label: 'Collapse',
            url: '/admin/ui/collapse',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-dropdowns',
            label: 'Dropdowns',
            url: '/admin/ui/dropdowns',
            parentKey: 'base-ui',
          },
          {
            key: 'ul-ratio',
            label: 'Ratio',
            url: '/admin/ui/ratio',
            parentKey: 'base-ui',
          },
          {
            key: 'ul-grid',
            label: 'Grid',
            url: '/admin/ui/grid',
            parentKey: 'base-ui',
          },
          {
            key: 'ul-links',
            label: 'Links',
            url: '/admin/ui/links',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-list-group',
            label: 'List Group',
            url: '/admin/ui/list-group',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-modals',
            label: 'Modals',
            url: '/admin/ui/modals',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-notifications',
            label: 'Notifications',
            url: '/admin/ui/notifications',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-offcanvas',
            label: 'Offcanvas',
            url: '/admin/ui/offcanvas',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-placeholders',
            label: 'Placeholders',
            url: '/admin/ui/placeholders',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-pagination',
            label: 'Pagination',
            url: '/admin/ui/pagination',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-popovers',
            label: 'Popovers',
            url: '/admin/ui/popovers',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-progress',
            label: 'Progress',
            url: '/admin/ui/progress',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-spinners',
            label: 'Spinners',
            url: '/admin/ui/spinners',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-tabs',
            label: 'Tabs',
            url: '/admin/ui/tabs',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-tooltips',
            label: 'Tooltips',
            url: '/admin/ui/tooltips',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-typography',
            label: 'Typography',
            url: '/admin/ui/typography',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-utilities',
            label: 'Utilities',
            url: '/admin/ui/utilities',
            parentKey: 'base-ui',
          },
        ]
      },
      {
        key: 'extended-ui',
        label: 'Extended UI',
        children: [
          {
            key: 'dragula',
            label: 'Dragula',
            url: '/admin/extended/dragula',
            parentKey: 'extended-ui',
          },
          {
            key: 'sweet-alert',
            label: 'Sweet Alert',
            url: '/admin/extended/sweet-alert',
            parentKey: 'extended-ui',
          },
          {
            key: 'ratings',
            label: 'Ratings',
            url: '/admin/extended/ratings',
            parentKey: 'extended-ui',
          },
          {
            key: 'scrollbar',
            label: 'Scrollbar',
            url: '/admin/extended/scrollbar',
            parentKey: 'extended-ui',
          },
        ]
      },
      {
        key: 'forms',
        label: 'Forms',
        children: [
          {
            key: 'basic',
            label: 'Basic Elements',
            url: '/admin/forms/basic',
            parentKey: 'forms',
          },
          {
            key: 'inputmask',
            label: 'Inputmask',
            url: '/admin/forms/inputmask',
            parentKey: 'forms',
          },
          {
            key: 'picker',
            label: 'Picker',
            url: '/admin/forms/picker',
            parentKey: 'forms',
          },
          {
            key: 'select',
            label: 'Select',
            url: '/admin/forms/select',
            parentKey: 'forms',
          },
          {
            key: 'slider',
            label: 'Range Slider',
            url: '/admin/forms/slider',
            parentKey: 'forms',
          },
          {
            key: 'validation',
            label: 'Validation',
            url: '/admin/forms/validation',
            parentKey: 'forms',
          },
          {
            key: 'wizard',
            label: 'Wizard',
            url: '/admin/forms/wizard',
            parentKey: 'forms',
          },
          {
            key: 'file-uploads',
            label: 'File Uploads',
            url: '/admin/forms/file-uploads',
            parentKey: 'forms',
          },
          {
            key: 'editors',
            label: 'Editors',
            url: '/admin/forms/editors',
            parentKey: 'forms',
          },
          {
            key: 'layouts',
            label: 'Layouts',
            url: '/admin/forms/layout',
            parentKey: 'forms',
          },
        ]
      },
      {
        key: 'charts',
        label: 'Charts',
        children: [
          {
            key: 'area',
            label: 'Area',
            url: '/admin/charts/area',
            parentKey: 'charts',
          },
          {
            key: 'bar',
            label: 'Bar',
            url: '/admin/charts/bar',
            parentKey: 'charts',
          },
          {
            key: 'bubble',
            label: 'Bubble',
            url: '/admin/charts/bubble',
            parentKey: 'charts',
          },
          {
            key: 'candlestick',
            label: 'Candlestick',
            url: '/admin/charts/candlestick',
            parentKey: 'charts',
          },
          {
            key: 'column',
            label: 'Column',
            url: '/admin/charts/column',
            parentKey: 'charts',
          },
          {
            key: 'heatmap',
            label: 'Heatmap',
            url: '/admin/charts/heatmap',
            parentKey: 'charts',
          },
          {
            key: 'line',
            label: 'Line',
            url: '/admin/charts/line',
            parentKey: 'charts',
          },
          {
            key: 'mixed',
            label: 'Mixed',
            url: '/admin/charts/mixed',
            parentKey: 'charts',
          },
          {
            key: 'timeline-chart',
            label: 'Timeline',
            url: '/admin/charts/timeline',
            parentKey: 'charts',
          },
          {
            key: 'boxplot',
            label: 'Boxplot',
            url: '/admin/charts/boxplot',
            parentKey: 'charts',
          },
          {
            key: 'treemap',
            label: 'Treemap',
            url: '/admin/charts/treemap',
            parentKey: 'charts',
          },
          {
            key: 'pie',
            label: 'Pie',
            url: '/admin/charts/pie',
            parentKey: 'charts',
          },
          {
            key: 'radar',
            label: 'Radar',
            url: '/admin/charts/radar',
            parentKey: 'charts',
          },
          {
            key: 'radialBar',
            label: 'RadialBar',
            url: '/admin/charts/radialBar',
            parentKey: 'charts',
          },
          {
            key: 'scatter',
            label: 'Scatter',
            url: '/admin/charts/scatter',
            parentKey: 'charts',
          },
          {
            key: 'polar',
            label: 'Polar Area',
            url: '/admin/charts/polar',
            parentKey: 'charts',
          },
          {
            key: 'sparklines',
            label: 'Sparklines',
            url: '/admin/charts/sparklines',
            parentKey: 'charts',
          },
        ],
      },
      {
        key: 'tables',
        label: 'Tables',
        children: [
          {
            key: 'basic-table',
            label: 'Basic Tables',
            url: '/admin/tables/basic-table',
            parentKey: 'tables',
          },
          {
            key: 'gridJs',
            label: 'GridJs Tables',
            url: '/admin/tables/gridJs',
            parentKey: 'tables',
          },
        ]
      },
      {
        key: 'icons',
        label: 'Icons',
        children: [
          {
            key: 'tabler',
            label: 'Tabler',
            url: '/admin/icons/tabler',
            parentKey: 'icons',
          },
          {
            key: 'solar',
            label: 'Solar',
            url: '/admin/icons/solar',
            parentKey: 'icons',
          },
        ]
      },
      {
        key: 'maps',
        label: 'Maps',
        children: [
          {
            key: 'google',
            label: 'Google Maps',
            url: '/admin/maps/google',
            parentKey: 'maps',
          },
          {
            key: 'vector',
            label: 'Vector Maps',
            url: '/admin/maps/vector',
            parentKey: 'maps',
          },
          {
            key: 'leaflet',
            label: 'Leaflet Maps',
            url: '/admin/maps/leaflet',
            parentKey: 'maps',
          },
        ]
      },
    ]
  },
  {
    key: 'layouts',
    label: 'Layouts',
    icon: 'tabler:layout',
    children: [
      {
        key: 'horizontal',
        label: 'Horizontal',
        url: '/admin/layouts/horizontal',
        parentKey: 'layouts',
        target: '_blank',
      },
      {
        key: 'detached',
        label: 'Detached',
        target: '_blank',
        url: '/admin/layouts/detached',
        parentKey: 'layouts',
      },
      {
        key: 'full-view',
        label: 'Full View',
        url: '/admin/layouts/full-view',
        parentKey: 'layouts',
        target: '_blank',
      },
      {
        key: 'fullscreen-view',
        label: 'FullScreen View',
        url: '/admin/layouts/fullscreen-view',
        parentKey: 'layouts',
        target: '_blank',
      },
      {
        key: 'hover-menu',
        label: 'Hover Menu',
        url: '/admin/layouts/hover-menu',
        parentKey: 'layouts',
        target: '_blank',
      },
      {
        key: 'compact',
        label: 'Compact',
        url: '/admin/layouts/compact',
        parentKey: 'layouts',
        target: '_blank',
      },
      {
        key: 'icon-view',
        label: 'Icon View',
        url: '/admin/layouts/icon-view',
        parentKey: 'layouts',
        target: '_blank',
      },
      {
        key: 'dark-mode',
        label: 'Dark Mode',
        url: '/admin/layouts/dark-mode',
        parentKey: 'layouts',
        target: '_blank',
      },
    ],
  },
]

export const HORIZONTAL_MENU_ITEM: MenuItemType[] = removeHiddenMenuItems(HORIZONTAL_MENU_ITEM_DATA)

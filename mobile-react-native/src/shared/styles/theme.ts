// Olímpio Design System - Mobile React Native
// Baseado no AppLayout.css do web-react

export const Colors = {
  // Primary - Azul Olímpio
  primary: '#265a88',
  primaryLight: '#337ab7',
  primaryDark: '#1e4d7a',
  primaryGradient: ['#337ab7', '#265a88'] as const,

  // Secondary - Dourado/Âmbar Olímpio
  gold: '#c2aa3c',
  goldLight: '#d4bb4a',
  goldDark: '#a89230',
  goldGradient: ['#c2aa3c', '#a89230'] as const,
  goldBg: '#f0e9c9',
  goldText: '#8a7420',

  // Background
  bgPrimary: '#f1f1f1',
  bgSecondary: '#ffffff',
  bgCard: '#ffffff',
  bgModal: '#ffffff',
  bgOverlay: 'rgba(29, 32, 37, 0.55)',

  // Header/Footer - Dark
  headerStart: '#2f333b',
  headerMid: '#24272e',
  headerEnd: '#1d2025',
  headerGradient: ['#2f333b', '#24272e', '#1d2025'] as const,
  headerBorder: '#c2aa3c',

  // Text
  textPrimary: '#1d2025',
  textSecondary: '#333333',
  textMuted: '#666666',
  textLight: '#999999',
  textPlaceholder: '#9a9a9a',
  textWhite: '#ffffff',
  textGold: '#e8d27a',
  textLink: '#265a88',
  textSelected: '#ffffff',
  textUnselected: '#cccccc',

  // Borders
  borderLight: '#e0e0e0',
  borderMedium: '#d3d3d3',
  borderDark: '#cccccc',
  borderGold: 'rgba(194, 170, 60, 0.15)',
  borderPrimary: '#c2aa3c',
  borderSecondary: '#3baae3',
  borderWidth: '3px',

  // Status
  success: '#2e7d32',
  successLight: '#4caf50',
  successBg: '#e8f5e9',
  warning: '#f57c00',
  warningBg: '#fff3e0',
  error: '#a61b29',
  errorLight: '#d32f2f',
  errorBg: '#fff0f0',
  errorBorder: '#f5c6cb',

  // Button variants
  btnBlue: '#265a88',
  btnBlueHover: '#1e4d7a',
  btnStop: '#339bb9',
  btnStopHover: '#2a8aa0',
  btnYellow: '#faa523',
  btnYellowHover: '#f09810',
  btnRed: '#b93f2a',
  btnRedHover: '#9a3323',
  btnGreen: '#57a957',
  btnGreenHover: '#4a924a',
  btnOrange: '#ff7f50',
  btnOrangeHover: '#e66b3d',
  btnBlack: '#3f3f3f',
  btnBlackHover: '#2d2d2d',
  btnPink: '#ff00ff',
  btnPinkHover: '#cc00cc',
  btnSky: '#53bfbf',
  btnSkyHover: '#307171',
  btnGrey: '#e6e6e6',
  btnGreyHover: '#abaebc',
  btnPurple: '#9585bf',
  btnPurpleHover: '#563d7c',
  btnBrown: '#8b4513',
  btnBrownHover: '#a0522d',

  // Shadows
  shadowLight: 'rgba(50, 50, 50, 0.15)',
  shadowMedium: 'rgba(50, 50, 50, 0.2)',
  shadowHeavy: 'rgba(50, 50, 50, 0.35)',
  shadowGold: 'rgba(194, 170, 60, 0.3)',

  // Notification badge
  badgeBg: '#d32f2f',
  badgeText: '#ffffff',

  // Search
  searchBg: '#fafafa',
  searchBorder: '#d3d3d3',
  searchFocusBorder: '#265a88',
  searchFocusShadow: 'rgba(51, 122, 183, 0.15)',

  // Accordion
  accordionHeaderStart: '#ffffff',
  accordionHeaderEnd: '#ededed',
  accordionHeaderHoverStart: '#f2f8fd',
  accordionHeaderHoverEnd: '#d9edf7',
  accordionHeaderActiveStart: '#337ab7',
  accordionHeaderActiveEnd: '#265a88',

  // Form
  formInputBorder: '#d3d3d3',
  formInputFocusBorder: '#337ab7',
  formInputFocusShadow: 'rgba(51, 122, 183, 0.15)',
  formInputDisabled: '#f5f5f5',
  formLabelColor: '#333333',
  formErrorBg: '#fff0f0',
  formErrorBorder: '#f5c6cb',
  formErrorText: '#a61b29',

  // Modal
  modalOverlay: 'rgba(29, 32, 37, 0.55)',
  modalBg: '#ffffff',
  modalHeaderStart: '#2f333b',
  modalHeaderEnd: '#24272e',
  modalHeaderBorder: '#c2aa3c',
  modalCloseBg: 'rgba(255, 255, 255, 0.1)',
  modalCloseHoverBg: 'rgba(194, 170, 60, 0.2)',
  modalCloseColor: '#e8d27a',
  modalCloseHoverColor: '#ffffff',

  // Dropdown
  dropdownBg: '#ffffff',
  dropdownBorder: '#d3d3d3',
  dropdownShadow: 'rgba(50, 50, 50, 0.35)',
  dropdownItemHover: '#f7f7f7',
  dropdownHeaderBg: '#f5f5f5',
  dropdownHeaderBorder: '#e0e0e0',

  // Table
  tableHeaderBg: '#f5f5f5',
  tableHeaderColor: '#333333',
  tableRowEven: '#fafafa',
  tableRowDetail: '#f4f7fa',
  tableBorder: '#e0e0e0',

  // Toggle/Boolean
  toggleOff: '#cccccc',
  toggleOn: '#2e7d32',
  toggleThumb: '#ffffff',
  toggleThumbShadow: 'rgba(0, 0, 0, 0.3)',

  // Page header
  pageHeaderBg: '#ffffff',
  pageHeaderBorder: '#d3d3d3',
  pageHeaderShadow: 'rgba(50, 50, 50, 0.15)',
  breadcrumbLink: '#265a88',
  breadcrumbCurrent: '#333333',
  breadcrumbSep: '#999999',

  // Help overlay
  helpTriggerBorder: '#c2aa3c',
  helpTriggerBgStart: '#337ab7',
  helpTriggerBgEnd: '#265a88',
  helpTriggerHoverStart: '#3d88c9',
  helpTriggerHoverEnd: '#2e6c9e',
  helpPanelBg: '#ffffff',
  helpPanelBorder: '#d3d3d3',
  helpPanelShadow: 'rgba(50, 50, 50, 0.35)',
  helpTitleBg: '#f5f5f5',
  helpTitleBorder: '#e0e0e0',

  // Upload
  uploadBorder: '#265a88',
  uploadBgStart: '#337ab7',
  uploadBgEnd: '#265a88',
  uploadHoverStart: '#3d88c9',
  uploadHoverEnd: '#2e6c9e',
  uploadClearBorder: '#c0392b',
  uploadClearColor: '#c0392b',
  uploadClearHoverBg: '#fdecea',

  // Report item tipo
  reportTipoBg: '#f0e9c9',
  reportTipoColor: '#8a7420',

  // Theme customization properties (synced with web-react ThemeContext)
  theme: {
    corPrimaria: '#2f333b',
    corSecundaria: '#3baae3',
    corBarra: '#24272e',
    corFundo: '#f1f1f1',
    corTexto: '#ffffff',
    corTextoSelecionado: '#ffffff',
    corTextoNaoSelecionado: '#cccccc',
    corBorda: '#c2aa3c',
    corDestaque: '#3baae3',
    corEmail: '#052B4E',
    espessuraBorda: '3px',
    corBordaPrimaria: '#c2aa3c',
    corBordaSecundaria: '#3baae3',
    posicaoLogo: 'left',
    loginPosicao: 'center',
    imagemFundo: '',
    bannerCabecalho: '',
    bannerRodape: '',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 3,
  md: 4,
  lg: 6,
  xl: 8,
  xxl: 12,
  round: 999,
};

export const Typography = {
  fontFamily: 'System', // React Native usa fonte do sistema
  fontFamilySerif: 'Georgia', // Para logo
  sizes: {
    xs: 10,
    sm: 11,
    md: 12,
    base: 13,
    lg: 14,
    xl: 15,
    xxl: 16,
    xxxl: 18,
    title: 20,
    heading: 24,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const Shadows = {
  small: {
    shadowColor: Colors.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.shadowMedium,
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.shadowHeavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modal: {
    shadowColor: '#1d2025',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 16,
  },
  gold: {
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const Layout = {
  headerHeight: 65,
  footerHeight: 35,
  maxContentWidth: 1400,
  contentPadding: 16,
  sidebarWidth: 280,
};

export const ZIndex = {
  dropdown: 50,
  modal: 1000,
  overlay: 999,
  tooltip: 200,
};
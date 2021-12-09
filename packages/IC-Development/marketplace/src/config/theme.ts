import { createTheme } from '@mui/material';
import { grey } from '@mui/material/colors';

declare module '@mui/material/styles/createTheme' {
  interface ThemeOptions {
    gradient: {
      [key: string]: string;
    };
  }
}

declare module '@mui/system' {
  interface Theme {
    gradient: {
      [key: string]: string;
    };
  }
}

declare module '@mui/material/styles/createPalette' {
  interface Palette {
    discord: PaletteColor;
  }
  interface PaletteOptions {
    discord: PaletteColor;
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsSizeOverrides {
    large: true;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    discord: true;
  }
  interface ButtonPropsVariantOverrides {
    gradient: true;
    gradientFail: true;
    gradientSuccess: true;
  }
}

const { palette } = createTheme();

export const theme = createTheme({
  components: {
    MuiTypography: {
      defaultProps: {},
    },
    MuiChip: {
      variants: [
        {
          props: { size: 'large' },
          style: {
            lineHeight: '20px',
            fontSize: '18px',
            borderRadius: '9999px',
            padding: '22px 4px',
          },
        },
      ],
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: 'none',
        },
      },
    },
    MuiButton: {
      variants: [
        {
          props: { size: 'large' },
          style: {
            lineHeight: '20px',
            fontSize: '22px',
            padding: '22px 22px',
            maxHeight: '66px',
          },
        },
      ],

      styleOverrides: {
        root: {
          borderRadius: '9999px',
          fontStyle: 'normal',
          fontWeight: 'bold',

          textAlign: 'center',
          textTransform: 'unset',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(27, 26, 32, 0.9)',
        },
      },
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#e1e8fd',
      light: '#fafbff',
      dark: '#c1c9e3',
      contrastText: '#000000',
    },
    secondary: {
      main: '#42dfff',
      light: '#b8f1fc',
      dark: '#42b3ff',
      contrastText: '#fffffff',
    },
    discord: {
      ...palette.augmentColor({
        color: {
          50: '#eef0fe',
          100: '#dee0fc',
          200: '#bcc1fa',
          300: '#9ba3f7',
          400: '#7984f5',
          500: '#5865f2',
          600: '#4651c2',
          700: '#353d91',
          800: '#232861',
          900: '#121430',
        },
      }),
    },
    background: {
      default: '#121212',
      paper: '#000000',
    },
    text: {
      primary: '#e1e8fd',
      secondary: '#615B6F',
      disabled: '#615B6F',
    },
    grey: {
      ...grey,
      A100: '#282B33',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
    fontSize: 14,
    fontWeightLight: 200,
    fontWeightRegular: 400,
    fontWeightBold: 700,

    button: {
      fontWeight: 600,
    },
  },
  gradient: {
    default: 'linear-gradient(90deg, #42DFFF 0%, #9D84FF 46.88%, #FF68C2 100%)',
    success: 'linear-gradient(90deg, #66FF45 0%, #30C712 48.44%, #20AD00 100%)',
    fail: 'linear-gradient(90deg, #FF646D 0%, #FF7E86 100%)',
  },
});

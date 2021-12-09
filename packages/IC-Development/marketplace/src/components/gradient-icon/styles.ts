import { styled } from '@mui/system';

export namespace GradientIconStyles {
  type IconContainerProps = {
    size: 'sm' | 'md' | 'lg';
  };

  const resize = (size: IconContainerProps['size'], base: number): number => {
    switch (size) {
      case 'sm':
        return base * 0.75;
      case 'lg':
        return base * 1.25;
      case 'md':
      default:
        return base;
    }
  };

  export const IconContainer = styled('div')<IconContainerProps>`
    position: relative;
    background-clip: padding-box;
    border: 2px solid transparent;
    border-radius: 9999px;
    width: ${({ theme, size }) => theme.spacing(resize(size, 5))};
    height: ${({ theme, size }) => theme.spacing(resize(size, 5))};

    & > span {
      font-size: ${({ size }) => resize(size, 20)}px;
      line-height: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: ${({ theme }) => theme.palette.background.default} !important;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      border-radius: 9999px;
    }

    &:before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      margin: -2px;
      border-radius: inherit;
      background: linear-gradient(
        93.07deg,
        #ffd719 0.61%,
        #f754d4 33.98%,
        #1fd1ec 65.84%,
        #48fa6b 97.7%
      );
    }
  `;
}

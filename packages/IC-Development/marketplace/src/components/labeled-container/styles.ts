import { styled } from '@mui/system';

export namespace LabeledContainerStyles {
  export const Container = styled('div')`
    display: flex;
    flex-direction: column;
    flex: 1;
  `;

  export const Label = styled('label')`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    color: ${({ theme }) => theme.palette.text.secondary};
    font-weight: bold;
    line-height: 20px;
    margin-bottom: 4px;

    & > .tooltip-icon {
      margin-top: 4px;
      margin-left: 4px;
    }
  `;

  export const DataRow = styled('div')`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    height: 50px;
    width: 100%;
    min-width: 100px;
  `;

  export type IconProps = {
    src: string;
  };
  export const Icon = styled('div')<IconProps>`
    background-image: url(${({ src }) => src});
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;

    width: 40px;
    height: 40px;
    margin-right: 10px;
  `;

  export const Data = styled('div')`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    flex: 1;
    font-weight: bold;
    line-height: 20px;
  `;
}

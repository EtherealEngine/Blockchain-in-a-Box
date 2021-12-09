import { StyledOptions } from '@mui/styled-engine';

export const notForwardProps: (
  props: PropertyKey[]
) => StyledOptions<any>['shouldForwardProp'] = (props) => {
  const set = new Set(props);
  return (prop) => !set.has(prop);
};

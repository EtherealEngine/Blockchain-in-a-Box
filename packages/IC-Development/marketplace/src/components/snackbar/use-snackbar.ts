import { AppSnackbarProps } from '@/components';
import { popSnackbar, pushSnackbar, useAppDispatch } from '@/store';

export const useSnackbar = () => {
  const dispatch = useAppDispatch();

  const push = (props: AppSnackbarProps) => {
    dispatch(pushSnackbar(props));
  };

  const pop = () => {
    dispatch(popSnackbar());
  };

  return {
    push,
    pop,
  };
};

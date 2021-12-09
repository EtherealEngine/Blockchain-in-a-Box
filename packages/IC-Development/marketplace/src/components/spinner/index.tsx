import { SpinnerStyles as Styled } from './styles';

export type SpinnerProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export const Spinner: React.FC<SpinnerProps> = (props) => {
  return (
    <Styled.Container {...props}>
      <svg className="spinner" width="50px" height="50px" viewBox="0 0 50 50">
        <circle
          className="path"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="5"
        />
      </svg>
    </Styled.Container>
  );
};

Spinner.displayName = 'Spinner';

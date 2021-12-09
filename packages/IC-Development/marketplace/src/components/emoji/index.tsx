import React, { HTMLProps } from 'react';

export type EmojiProps = HTMLProps<HTMLSpanElement> & {
  label: string;
};

export const Emoji: React.FC<EmojiProps> = ({ children, label, ...props }) => {
  return (
    <span role="img" aria-label={label} title={label} {...props}>
      {children}
    </span>
  );
};

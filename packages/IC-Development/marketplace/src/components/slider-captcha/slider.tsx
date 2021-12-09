import React, { useEffect, useRef, useState } from 'react';
import { CaptchaSliderStyles as Styled } from './styles';
import { calculateSliderPosition, calculatePositionPercentage } from './core';
import { CaptchaState, MovementRecorder, SliderProps } from './models';
import { GradientText } from '../gradient-text';
import { Emoji } from '../emoji';

export const Slider: React.FC<SliderProps> = ({
  onMovementComplete,
  captchaState,
  position,
  setPosition,
  isLoading,
}) => {
  const [dragging, setDragging] = useState(false);
  const [recordedMovement, setRecordedMovement] = useState<MovementRecorder>();

  const sliderRef = useRef<HTMLDivElement>();

  const handleDragStart = (): void => {
    if (captchaState !== CaptchaState.INITIAL) {
      return;
    }
    setDragging(true);
  };

  useEffect(() => {
    if (dragging) {
      const movementRecorder = {
        x: [],
        y: [],
      };
      const { left, right } = sliderRef.current.getBoundingClientRect();

      const moveCallback = (e: MouseEvent | TouchEvent): void => {
        const { clientX, clientY } = e instanceof MouseEvent ? e : e.touches[0];
        if (!clientX || !clientY) return movementEndCallback();
        movementRecorder.x.push(clientX);
        movementRecorder.y.push(clientY);
        setPosition(calculateSliderPosition(clientX, left, right));
      };

      const movementEndCallback = (): void => {
        setDragging(false);
      };

      window.addEventListener('mousemove', moveCallback);
      window.addEventListener('mouseup', movementEndCallback);
      window.addEventListener('touchmove', moveCallback);
      window.addEventListener('touchend', movementEndCallback);
      return () => {
        setRecordedMovement(movementRecorder);
        window.removeEventListener('mousemove', moveCallback);
        window.removeEventListener('mouseup', movementEndCallback);
        window.removeEventListener('touchmove', moveCallback);
        window.removeEventListener('touchend', movementEndCallback);
      };
    }
  }, [dragging]);

  useEffect(() => {
    if (recordedMovement) {
      onMovementComplete({
        movementTrack: recordedMovement,
        solution: position,
      });
    }
  }, [recordedMovement]);

  return (
    <Styled.SliderContainer ref={sliderRef}>
      <Styled.SliderTrail
        position={calculatePositionPercentage(position)}
        captchaState={captchaState}
      >
        {captchaState === CaptchaState.INITIAL && (
          <GradientText>Slide to finish the puzzle</GradientText>
        )}
      </Styled.SliderTrail>
      <Styled.SliderThumb
        position={calculatePositionPercentage(position)}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        {(() => {
          if (isLoading) {
            return <Styled.SliderThumbSpinner />;
          } else if (captchaState === CaptchaState.COMPLETED) {
            return <Emoji label="Check">✔️</Emoji>;
          } else if (captchaState === CaptchaState.FAILED) {
            return <Emoji label="Cross">❌</Emoji>;
          }
        })()}
      </Styled.SliderThumb>
    </Styled.SliderContainer>
  );
};

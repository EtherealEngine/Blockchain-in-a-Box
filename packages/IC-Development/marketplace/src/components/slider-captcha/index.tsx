import { Http, useHttp } from '@/integrations/http';
import { SessionChallengeToken, SessionVerifiedToken } from '@/models';
import { useDiscordStore } from '@/store';
import {
  createBearerToken,
  createLambdaUrl,
  LambdaEndpoint,
  parseToken,
} from '@/utils';
import React, { useEffect, useState } from 'react';
import { PreloadImage } from '../preload-image';
import { useSnackbar } from '../snackbar';
import { INITIAL_POSITION } from './constants';
import { createChallenge } from './core';
import { Jigsaw } from './jigsaw';
import {
  CaptchaState,
  CreateCaptchaResponse,
  MovementCompleteEvent,
  SliderCaptchaProps,
  VerifyCaptchaRequest,
  VerifyCaptchaResponse,
} from './models';
import { Slider } from './slider';
import { CaptchaSliderStyles as Styled } from './styles';

export const SliderCaptcha: React.FC<SliderCaptchaProps> = ({
  onComplete,
  prevStep,
}) => {
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [challenge, setChallenge] = useState<number>(createChallenge());
  const [state, setState] = useState<CaptchaState>(CaptchaState.INITIAL);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [sessionToken, setSessionToken] = useState<string>();
  const snackbar = useSnackbar();
  const { user: discordUser } = useDiscordStore();
  const [imageLoading, setImageLoading] = useState(true);

  const httpCreateCaptcha = useHttp<void, CreateCaptchaResponse>({
    method: 'get',
    url: createLambdaUrl(LambdaEndpoint.Create),
  });

  const httpVerifyCaptcha = useHttp<
    VerifyCaptchaRequest,
    VerifyCaptchaResponse
  >({
    method: 'post',
    url: createLambdaUrl(LambdaEndpoint.Verify),
  });

  useEffect(() => {
    const { response } = httpCreateCaptcha;
    if (!response) return;

    const { token, imageUrl } = response.data;
    const { challenge } = parseToken<SessionChallengeToken>(token);

    setSessionToken(token);
    setChallenge(challenge);
    setImageUrl(imageUrl);
  }, [httpCreateCaptcha.response]);

  useEffect(() => {
    const { error } = httpCreateCaptcha;
    if (!error) return;

    if (error['status'] === Http.StatusCode.Forbidden) {
      snackbar.push({
        message: 'You had already registered with that Discord ID',
        gradient: 'fail',
      });
      prevStep();
    } else {
      snackbar.push({
        message: `${error}`,
        gradient: 'fail',
      });
    }
  }, [httpCreateCaptcha.error]);

  useEffect(() => {
    const { response } = httpVerifyCaptcha;
    if (!response) return;
    onComplete(response.data.token);
    setState(CaptchaState.COMPLETED);
  }, [httpVerifyCaptcha.response]);

  useEffect(() => {
    if (!httpVerifyCaptcha.error) return;
    // TODO: treat error case
    setState(CaptchaState.FAILED);
  }, [httpVerifyCaptcha.error]);

  const handleMovementComplete = (event: MovementCompleteEvent): void => {
    httpVerifyCaptcha.request({
      body: event,
      headers: { Authorization: createBearerToken(sessionToken) },
    });
  };

  const handleRetry = (): void => {
    setState(CaptchaState.INITIAL);
    setPosition(INITIAL_POSITION);
    httpCreateCaptcha.request({
      params: {
        discordId: discordUser.id,
      },
    });
  };
  useEffect(handleRetry, []);

  if (httpCreateCaptcha.isLoading || imageLoading) {
    return (
      <Styled.Container>
        <PreloadImage src={imageUrl} onLoad={() => setImageLoading(false)} />
        <Styled.ContainerSpinner />
      </Styled.Container>
    );
  }

  return (
    <Styled.Container>
      <Jigsaw challenge={challenge} position={position} imageUrl={imageUrl} />
      <Slider
        onMovementComplete={handleMovementComplete}
        captchaState={state}
        position={position}
        setPosition={setPosition}
        isLoading={httpVerifyCaptcha.isLoading}
      />
      {state === CaptchaState.FAILED && (
        <Styled.RetryOverlay>
          <Styled.RetryButton onClick={handleRetry}>Retry</Styled.RetryButton>
        </Styled.RetryOverlay>
      )}
    </Styled.Container>
  );
};

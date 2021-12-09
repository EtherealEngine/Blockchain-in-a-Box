import { GradientButton, ModalLayoutStyles as StyledModal } from '@/components';
import { useNftController } from '@/integrations/nft/use-nft-controller';
import Modal from '@mui/material/Modal';
import { useMemo } from 'react';

const getModalContent = (totalNFTs: number) => {
  if (totalNFTs === 1) {
    return {
      title: 'You won a NFT!',
      message:
        'You were selected in the raffle and you won 1 of the 10,000 NFTs in the drop, let’s go! What now? We will drop the nft to your wallet’s address. So... what you waiting? Check it out!',
      buttonText: 'Reveal my NFT',
    };
  }
  if (totalNFTs > 1) {
    return {
      title: `You won ${totalNFTs} NFTs!`,
      message: `You were selected in the raffle and you won ${totalNFTs} of the 10,000 NFTs in the drop, let’s go! What now? We will drop the nft to your wallet’s address. So... what you waiting? Check it out!`,
      buttonText: 'Reveal my NFT',
    };
  }
  return {
    title: 'Sorry, you ngmi',
    message:
      'You did not win the raffle to get a NFT! We will be refunding the ICP to the Principal ID that you used to register shortly. A secondary marketplace is coming soon, where you will have the chance to buy a NFT. Thanks for joining!',
    buttonText: 'OK',
  };
};

export type ResultModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const ResultModal: React.FC<ResultModalProps> = ({ open, setOpen }) => {
  const { totalNfts } = useNftController();

  const { title, message, buttonText } = useMemo(
    () => getModalContent(totalNfts),
    [totalNfts]
  );

  return (
    <Modal open={open}>
      <StyledModal.Container>
        <StyledModal.Title>{title}</StyledModal.Title>
        <StyledModal.Text>{message}</StyledModal.Text>
        <StyledModal.Footer>
          <GradientButton
            onClick={() => setOpen(false)}
            size="large"
            autoFocus
            focusRipple={false}
          >
            {buttonText}
          </GradientButton>
        </StyledModal.Footer>
      </StyledModal.Container>
    </Modal>
  );
};

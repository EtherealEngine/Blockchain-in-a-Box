export const cutPrincipalId = (principalId: string) => {
  if (principalId) {
    const firstPart = principalId.slice(0, 5);
    const secondPart = principalId.slice(
      principalId.length - 3,
      principalId.length
    );

    return `${firstPart}...${secondPart}`;
  }
};

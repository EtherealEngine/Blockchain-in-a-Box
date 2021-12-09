// TODO: Remove when available to pull up from canister

export const nftAmount = {
  small: {
    Pearl: 1080,
    Opal: 948,
    Amethyst: 1565,
    Ruby: 695,
    Amber: 1093,
    Citrine: 1269,
    Moonstone: 1287,
    Emerald: 677,
    Sapphire: 885,
    Diamond: 501,
  },
  base: {
    Silver: 1277,
    Gold: 1294,
    Psychedelic: 713,
    Ice: 1090,
    Circuit: 898,
    Iridescent: 1138,
    Bronze: 1454,
    Lava: 736,
    Galaxy: 521,
    Crystal: 879,
  },
  large: {
    GreenOrb: 1377,
    BlueOrb: 1382,
    Flame: 1042,
    RedOrb: 1402,
    Sun: 1004,
    Molecule: 600,
    Crystal: 1098,
    Psychedelic: 522,
    Electricity: 1110,
    Galaxy: 463,
  },
  rim: {
    Engraved: 2078,
    Royal: 500,
    OliveBranch: 2989,
    Glass: 998,
    Wood: 934,
    BlackMarble: 991,
    Velvet: 522,
    CandyCane: 287,
    Diamond: 484,
    Rose: 217,
  },
};

export const getRarity = (totalNumber: number) => {
  return totalNumber / 100;
};

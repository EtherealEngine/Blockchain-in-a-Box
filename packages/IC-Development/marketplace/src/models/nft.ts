export type Trait = 'smallgem' | 'biggem' | 'base' | 'rim' | 'location';

export type MetadataKeys = Trait | 'location';

export interface NFT {
  id: number;
  key_val_data: { key: MetadataKeys; val: { TextContent: string } }[];
  purpose: {
    Render: null;
  };
}

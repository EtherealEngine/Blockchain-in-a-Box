# IC-NFT Marketplace under development

## Local Deployment:

- Install Rust and its toolchain using: 
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

- Install Rust to Wasm tool using:
```bash
rustup target add wasm32-unknown-unknown
```

- Install Dfinity IC using:
```bash
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```

- Start a local replica using:
```bash
dfx start --clean --background
```

- Find your principal ID using:
```bash
dfx identity get-principal
```
For exmaple: Principal Id: ```xe2qy-4f563-zsxiy-2zeyl-iqmgy-3ngju-nyg2u-2ntso-elzuh-gmcqy-hqe```

- Deploy the canisters using:
```bash
dfx deploy --argument='(principal "< Principal Id >", "BSKT", "BasketBall game", principal "< Principal Id>")
```

## Testing local deployment:

- ```dfx canister call nft <Name of call>```

- For example: ```dfx canister call nft nameDip721```

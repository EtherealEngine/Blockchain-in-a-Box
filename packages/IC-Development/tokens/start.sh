http://127.0.0.1:8000/?canisterId=<UI canister Id>

example: http://127.0.0.1:8000/?canisterId=r7inp-6aaaa-aaaaa-aaabq-cai

Enter your cannister id on browser in TextBox - i.e rrkah-fqaaa-aaaaa-aaaaq-cai

mainnet:
dfx ledger --network ic balance
dfx ledger account-id
dfx ledger --network ic create-canister fmkex-6viyx-ddaaz-dahpf-5pyj5-l5ru3-7tc6d-ibwc3-3v4bu-q4dv3-iae --amount .004
dfx identity --network ic deploy-wallet 4iifb-aqaaa-aaaam-aaaoa-cai


dfx wallet --network ic balance
dfx ledger --network ic top-up 4iifb-aqaaa-aaaam-aaaoa-cai --amount .011

dfx deploy --network ic --argument='(principal "fmkex-6viyx-ddaaz-dahpf-5pyj5-l5ru3-7tc6d-ibwc3-3v4bu-q4dv3-iae", "BSKT", "BasketBall game", principal "fmkex-6viyx-ddaaz-dahpf-5pyj5-l5ru3-7tc6d-ibwc3-3v4bu-q4dv3-iae")'
dfx canister --network ic call nft nameDip721
dfx canister --network ic call nft get_check
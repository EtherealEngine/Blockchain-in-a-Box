Deploy canister and mint nft

dfx ledger account-id

dfx ledger --network ic  balance

dfx identity get-principal

Incase issue with canister controller error just wipe the nft>ic from canister_ids.json

dfx canister --network ic create nft
"nft" canister created on network "ic" with canister id: "gdpio-4iaaa-aaaal-aacea-cai"

dfx canister --network ic status nft

dfx deploy nft --network ic --argument='(principal "eebku-xrimf-dmsbm-bisjx-yjffv-xwecv-v3bxj-v2brl-sq2l7-e4ng6-4ae", "BSKT", "Metasports Ball", principal "lj532-6iaaa-aaaah-qcc7a-cai", principal "utozz-siaaa-aaaam-qaaxq-cai")'

dfx canister --network ic call nft mintDip721 '(principal "eebku-xrimf-dmsbm-bisjx-yjffv-xwecv-v3bxj-v2brl-sq2l7-e4ng6-4ae", vec{} )'

dfx canister --network ic call nft listForSale '(0: nat64, 2: nat)'

========================================================================

dfx ledger --network ic create-canister eebku-xrimf-dmsbm-bisjx-yjffv-xwecv-v3bxj-v2brl-sq2l7-e4ng6-4ae --amount .35

dfx ledger account-id

dfx ledger --network ic  balance

dfx identity get-principal
eebku-xrimf-dmsbm-bisjx-yjffv-xwecv-v3bxj-v2brl-sq2l7-e4ng6-4ae

dfx ledger --network ic create-canister eebku-xrimf-dmsbm-bisjx-yjffv-xwecv-v3bxj-v2brl-sq2l7-e4ng6-4ae --amount .35
Transfer sent at BlockHeight: 1985318
Canister created with id: "h4h3z-7qaaa-aaaal-aacaq-cai"

dfx identity --network ic deploy-wallet h4h3z-7qaaa-aaaal-aacaq-cai

dfx start --clean --background

dfx deploy nft --network ic --argument='(principal "eebku-xrimf-dmsbm-bisjx-yjffv-xwecv-v3bxj-v2brl-sq2l7-e4ng6-4ae", "BSKT", "Metasports Ball", principal "lj532-6iaaa-aaaah-qcc7a-cai", principal "utozz-siaaa-aaaam-qaaxq-cai")'

Upgrading code for canister nft, with canister_id 4xztl-4aaaa-aaaal-aaarq-cai
The invocation to the wallet call forward method failed with the error: An error happened during the call: 5: Only the controllers of the canister 4xztl-4aaaa-aaaal-aaarq-cai can control it.
Canister's controllers: 4z36d-hqaaa-aaaal-aaaqq-cai
Sender's ID: h4h3z-7qaaa-aaaal-aacaq-cai

"nft" canister was already created on network "ic" and has canister id: "4xztl-4aaaa-aaaal-aaarq-cai"
"nft" canister created on network "ic" with canister id: "gdpio-4iaaa-aaaal-aacea-cai"

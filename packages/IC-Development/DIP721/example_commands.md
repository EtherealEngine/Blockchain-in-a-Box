##### prerequisite

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup target add wasm32-unknown-unknown

##### Start dfx
dfx start --clean --background

##### Deploy the cap canister
dfx deploy cap

Result 
The UI canister on the "local" network is "ryjl3-tyaaa-aaaaa-aaaba-cai"
Installing code for canister cap, with canister_id rrkah-fqaaa-aaaaa-aaaaq-cai

##### To get the principal
dfx identity get-principal

Result
eebku-xrimf-dmsbm-bisjx-yjffv-xwecv-v3bxj-v2brl-sq2l7-e4ng6-4ae

##### Deploy the wicp_test canister
dfx deploy wicp_test --argument=\
'("data:image/jpeg;base64,$(base64 ./WICP-logo.png)", "wicp_test","WICP_LOCAL", 8:nat8, 10000, principal "eebku-xrimf-dmsbm-bisjx-yjffv-xwecv-v3bxj-v2brl-sq2l7-e4ng6-4ae", 0, principal "eebku-xrimf-dmsbm-bisjx-yjffv-xwecv-v3bxj-v2brl-sq2l7-e4ng6-4ae", principal "rrkah-fqaaa-aaaaa-aaaaq-cai")'

Result
Installing code for canister wicp_test, with canister_id r7inp-6aaaa-aaaaa-aaabq-cai

##### Deploy
dfx deploy

##### Check the wicp canister id
dfx canister id wicp_test # Store this somewhere

Result
r7inp-6aaaa-aaaaa-aaabq-cai

##### Check the cap canister id
dfx canister id cap # Store this somewhere

Result
rrkah-fqaaa-aaaaa-aaaaq-cai

##### Install NFT canister
dfx canister install nft --argument\
'(principal "YOUR_PRINCIPAL_ID", "YOUR_SYMBOL", "YOUR_NFT_COLLECTION_NAME", principal "CAP_CANISTER_ID", principal "WICP_CANISTER_ID")'

dfx canister install nft --argument '(principal "eebku-xrimf-dmsbm-bisjx-yjffv-xwecv-v3bxj-v2brl-sq2l7-e4ng6-4ae", "BSKT", "Basketball game", principal "rrkah-fqaaa-aaaaa-aaaaq-cai", principal "r7inp-6aaaa-aaaaa-aaabq-cai")'

Result
Installing code for canister nft, with canister_id rkp4c-7iaaa-aaaaa-aaaca-cai

##### Minting the token in NFT
dfx canister call nft mintDip721 '(principal "eebku-xrimf-dmsbm-bisjx-yjffv-xwecv-v3bxj-v2brl-sq2l7-e4ng6-4ae", vec{} )'

##### After Minting
dfx canister call nft listForSale '(token_id: nat64, price: nat)'

dfx canister call nft listForSale '(0: nat64, 2: nat)'

--------------------------------------------------------
##### Create a New idenity

dfx identity new Alice

##### Set this new identity
dfx identity use Alice

##### This is for create canister for Alice
dfx canister id nft

Result
Creating a wallet canister on the local network.
The wallet canister on the "local" network for user "Alice" is "renrk-eyaaa-aaaaa-aaada-cai"
rkp4c-7iaaa-aaaaa-aaaca-cai

##### Approve canister for the spent
dfx canister --no-wallet call wicp_test approve '(principal "rkp4c-7iaaa-aaaaa-aaaca-cai", 1001)'

##### Check the ownership
dfx canister call nft ownerOfDip721 '(token_id: nat64)'
dfx canister call nft ownerOfDip721 '(0:nat64)'

##### Check Alice balance
dfx canister call wicp_test balanceOf '(principal "epo3h-th24s-5d63d-bp6cg-zatzt-se5sb-4tnud-tyqyo-y3jtw-6zhl3-cae")'

##### Buy NFT
dfx canister call nft buyDip721 '(1: nat64)'

##### Check the ownership
dfx canister call nft ownerOfDip721 '(token_id: nat64)'
dfx canister call nft ownerOfDip721 '(0:nat64)'

##### Check Alice balance
dfx canister call wicp_test balanceOf '(principal "epo3h-th24s-5d63d-bp6cg-zatzt-se5sb-4tnud-tyqyo-y3jtw-6zhl3-cae")'

-----------------------------------------------
##### In case Send some money to Alice

##### Go to Alice and get the Alice principal id

dfx identity use Alice

dfx identity get-principal

Result
epo3h-th24s-5d63d-bp6cg-zatzt-se5sb-4tnud-tyqyo-y3jtw-6zhl3-cae

##### Go back to default

dfx identity use default

##### Send some WICP to Alice
dfx canister call wicp_test transfer '(principal "epo3h-th24s-5d63d-bp6cg-zatzt-se5sb-4tnud-tyqyo-y3jtw-6zhl3-cae", 2000)'

##### Check Alice balance
dfx canister call wicp_test balanceOf '(principal "epo3h-th24s-5d63d-bp6cg-zatzt-se5sb-4tnud-tyqyo-y3jtw-6zhl3-cae")'


==============================================================


sudo dfx start --clean --background

sudo dfx deploy cap

sudo dfx deploy nft --argument '(principal "fmkex-6viyx-ddaaz-dahpf-5pyj5-l5ru3-7tc6d-ibwc3-3v4bu-q4dv3-iae", "BSKT", "Basketball game", principal "rrkah-fqaaa-aaaaa-aaaaq-cai")'

sudo dfx deploy nft --argument '(principal "eebku-xrimf-dmsbm-bisjx-yjffv-xwecv-v3bxj-v2brl-sq2l7-e4ng6-4ae", "BSKT", "Basketball game", principal "rrkah-fqaaa-aaaaa-aaaaq-cai")'

sudo icx --pem="/home/syed/.config/dfx/identity/default/identity.pem" update r7inp-6aaaa-aaaaa-aaabq-cai mintDip721 '(principal "hhrcb-xdthr-sdpve-w6p7a-qzpxg-2ihnw-ugagm-svvur-gi2qa-eydso-tqe", vec{} )' --candid=./nft/candid/nft.did

sudo icx --pem="/home/syed/.config/dfx/identity/default/identity.pem" query  r7inp-6aaaa-aaaaa-aaabq-cai totalSupplyDip721  --candid=./nft/candid/nft.did

sudo icx --pem="/home/syed/.config/dfx/identity/default/identity.pem" query  r7inp-6aaaa-aaaaa-aaabq-cai nameDip721  --candid=./nft/candid/nft.did

sudo icx --pem="/home/syed/.config/dfx/identity/default/identity.pem" query  r7inp-6aaaa-aaaaa-aaabq-cai symbolDip721  --candid=./nft/candid/nft.did

al
gqrhy-ozf7y-rb4nr-g5eix-tbden-2x3lk-rot3p-ybyca-tbjrx-eesge-kqe
def
ctwda-agbel-ek5s5-2zxdz-q4ipo-q2hns-x4uyx-qg3kw-2tvye-tlkls-yqe
wi
r7inp-6aaaa-aaaaa-aaabq-cai
cap
rrkah-fqaaa-aaaaa-aaaaq-cai
nft
rkp4c-7iaaa-aaaaa-aaaca-cai

sudo dfx deploy wicp_test --argument=\
'("data:image/jpeg;base64,$(base64 ./WICP-logo.png)", "wicp_test","wicp_TST", 8:nat8, 10000, principal "ctwda-agbel-ek5s5-2zxdz-q4ipo-q2hns-x4uyx-qg3kw-2tvye-tlkls-yqe", 0, principal "ctwda-agbel-ek5s5-2zxdz-q4ipo-q2hns-x4uyx-qg3kw-2tvye-tlkls-yqe", principal "r7inp-6aaaa-aaaaa-aaabq-cai")'

wicp_test
sudo dfx deploy wicp_test --argument='("data:image/jpeg;base64,$(base64 ./WICP-logo.png)", "wicp_test","WICP_LOCAL", 8:nat8, 100000, principal "ctwda-agbel-ek5s5-2zxdz-q4ipo-q2hns-x4uyx-qg3kw-2tvye-tlkls-yqe", 0, principal "ctwda-agbel-ek5s5-2zxdz-q4ipo-q2hns-x4uyx-qg3kw-2tvye-tlkls-yqe", principal "rrkah-fqaaa-aaaaa-aaaaq-cai")'

nft-reinstall
sudo dfx  deploy --mode reinstall  nft --argument '(principal "ctwda-agbel-ek5s5-2zxdz-q4ipo-q2hns-x4uyx-qg3kw-2tvye-tlkls-yqe", "BSKT", "Metasports Basketball", principal "rrkah-fqaaa-aaaaa-aaaaq-cai", principal "r7inp-6aaaa-aaaaa-aaabq-cai")'

sudo icx --pem="/root/.config/dfx/identity/Alice/identity.pem" update rkp4c-7iaaa-aaaaa-aaaca-cai  buyDip721 '(1 : nat)' --candid=./nft/candid/nft.did

sudo dfx canister --no-wallet call wicp_test approve '(principal "rkp4c-7iaaa-aaaaa-aaaca-cai", 1001)'

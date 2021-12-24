# do not run the script directly, copy/paste the commands to command line and execute one by one
# this example is just for showing how to deploy
dfx canister --network ic create wicp

cargo build --target wasm32-unknown-unknown --package rust --release \
	&& ic-cdk-optimizer target/wasm32-unknown-unknown/release/rust.wasm \
	-o target/wasm32-unknown-unknown/release/opt.wasm

# cap test canister id glh6n-uaaaa-aaaaj-aadya-cai
dfx canister --network ic install wicp \
	--argument="(\"data:image/jpeg;base64,$(base64 ./WICP-logo.png)\",\"wicp\",\"WICP\", 8:nat8, principal \"$(dfx identity get-principal)\", 0, principal \"$(dfx identity get-principal)\", principal \"glh6n-uaaaa-aaaaj-aadya-cai\")" \
  -m install


dfx identity get-principal

dfx ledger --network ic balance

dfx ledger --network ic transfer --amount 0.000001 "cc659fe529756bae6f72db9937c6c60cf7ad57eb4ac5f930a75748927aab469a" --memo 0
Transfer sent at BlockHeight: 1753510

dfx canister --no-wallet --network ic call utozz-siaaa-aaaam-qaaxq-cai mint '(null, 1753510:nat64)'    
(variant { Ok = 32 : nat })

dfx canister --network=ic --no-wallet call --query utozz-siaaa-aaaam-qaaxq-cai balanceOf "(principal \"33tol-jd3fp-oidcp-z7kgv-jdrvo-ejpo5-sby7e-jfbd2-nfwam-oxai6-kqe\")"      
(100 : nat)

dfx canister --network=ic --no-wallet call --query utozz-siaaa-aaaam-qaaxq-cai name "(principal \"33tol-jd3fp-oidcp-z7kgv-jdrvo-ejpo5-sby7e-jfbd2-nfwam-oxai6-kqe\")"
("WICP")

dfx canister --network=ic --no-wallet call --query utozz-siaaa-aaaam-qaaxq-cai owner "(principal \"33tol-jd3fp-oidcp-z7kgv-jdrvo-ejpo5-sby7e-jfbd2-nfwam-oxai6-kqe\")"
(principal "wwcl3-afeq7-24k7y-udtx2-hnmv4-id6fl-qickd-rk6xo-k5azw-xeq3q-7qe")

dfx canister --network=ic --no-wallet call --query utozz-siaaa-aaaam-qaaxq-cai totalSupply "(principal \"33tol-jd3fp-oidcp-z7kgv-jdrvo-ejpo5-sby7e-jfbd2-nfwam-oxai6-kqe\")"
(1_210_100 : nat)

dfx canister --network=ic --no-wallet call utozz-siaaa-aaaam-qaaxq-cai approve "(principal \"fmkex-6viyx-ddaaz-dahpf-5pyj5-l5ru3-7tc6d-ibwc3-3v4bu-q4dv3-iae\",1)" 
(variant { Ok = 33 : nat })

dfx canister --network ic call lj532-6iaaa-aaaah-qcc7a-cai get_token_contract_root_bucket "(record { canister=(principal \"utozz-siaaa-aaaam-qaaxq-cai\"); witness=(false:bool)})"

dfx canister --network ic call lj532-6iaaa-aaaah-qcc7a-cai get_token_contract_root_bucket "(record { canister=(principal \"33tol-jd3fp-oidcp-z7kgv-jdrvo-ejpo5-sby7e-jfbd2-nfwam-oxai6-kqe\"); witness=(false:bool)})"
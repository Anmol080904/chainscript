from web3 import Web3
import hashlib
from config.config import settings

class BlockchainService:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.ETHEREUM_RPC_URL))

        self.abi = [
            {
                "inputs": [{"internalType": "bytes32", "name": "hash", "type": "bytes32"}],
                "name": "sealVersion",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function",
            },
            {
                "inputs": [{"internalType": "bytes32", "name": "hash", "type": "bytes32"}],
                "name": "verifyVersion",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "view",
                "type": "function",
            },
        ]

        self.contract = self.w3.eth.contract(
            address=self.w3.to_checksum_address(settings.REMIX_CONTRACT_ADDRESS),
            abi=self.abi
        )

        self.account = self.w3.eth.account.from_key(settings.METAMASK_PRIVATE_KEY)

    def hash_content(self, content: str):
        return hashlib.sha256(content.encode()).hexdigest()

    async def seal_version(self, content: str):
        content_hash = self.hash_content(content)

        nonce = self.w3.eth.get_transaction_count(self.account.address)

        tx = self.contract.functions.sealVersion(
            self.w3.to_bytes(hexstr=content_hash)
        ).build_transaction({
            "from": self.account.address,
            "nonce": nonce,
            "gas": 200000,
            "gasPrice": self.w3.to_wei("10", "gwei"),
            "chainId": self.w3.eth.chain_id
        })

        signed_tx = self.w3.eth.account.sign_transaction(
            tx, private_key=settings.METAMASK_PRIVATE_KEY
        )

        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

        return {
            "content_hash": content_hash,
            "tx_hash": tx_hash.hex(),
            "block_number": receipt.blockNumber,
        }

    async def verify_version(self, content: str):
        content_hash = self.hash_content(content)
        
        try:
            is_valid = self.contract.functions.verifyVersion(
                self.w3.to_bytes(hexstr=content_hash)
            ).call()

            return {
                "verified": is_valid,
                "content_hash": content_hash
            }
        except Exception as e:
            print(f"BLOCKCHAIN_VERIFY_ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            raise e
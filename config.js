// ===============================
// CONFIG: KJC Packages • Referral • Auto-Stake (Public DApp)
// ===============================

// เครือข่ายที่ใช้ (BSC Mainnet)
window.NETWORK = { chainIdHex: "0x38" };

// ที่อยู่สัญญาและโทเคนที่เกี่ยวข้อง
window.ADDR = {
  CONTRACT: "0xf93DB01004C6Cf68f49de2e6bFfafB96C98201b7", // KJCPackageReferralAutoStake (ตัวใหม่)
  USDT:     "0x55d398326f99059fF775485246999027B3197955", // USDT BEP-20 (BSC)
  KJC:      "0x2FB9b0F45278D62dc13Dc9F826F78e8E3774047D"  // KJC Token
};

// ทศนิยมของโทเคน
window.DECIMALS = { USDT: 18, KJC: 18 };

// Minimal ERC20 ABI (ที่ต้องใช้ approve/allowance/balanceOf/decimals)
window.ERC20_MINI_ABI = [
  { "constant": true,  "inputs": [{"name":"_owner","type":"address"}], "name":"balanceOf", "outputs":[{"name":"balance","type":"uint256"}], "type":"function" },
  { "constant": true,  "inputs": [], "name":"decimals", "outputs":[{"name":"","type":"uint8"}], "type":"function" },
  { "constant": true,  "inputs": [{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}], "name":"allowance", "outputs":[{"name":"remaining","type":"uint256"}], "type":"function" },
  { "constant": false, "inputs": [{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}], "name":"approve", "outputs":[{"name":"success","type":"bool"}], "type":"function" }
];

// ===== ABI ของสัญญา Auto-Stake + Referral (ตามที่คุณให้มา) =====
window.SALE_ABI = [
  {"inputs":[{"internalType":"address","name":"usdt_","type":"address"},{"internalType":"address","name":"kjc_","type":"address"},{"internalType":"uint256","name":"aprBps","type":"uint256"},{"internalType":"uint256","name":"claimIntervalStake","type":"uint256"},{"internalType":"uint256","name":"lockDuration","type":"uint256"},{"internalType":"uint256","name":"ref1_bps","type":"uint256"},{"internalType":"uint256","name":"ref2_bps","type":"uint256"},{"internalType":"uint256","name":"ref3_bps","type":"uint256"},{"internalType":"uint256","name":"refClaimInterval","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"startTime","type":"uint256"}],"name":"AirdropStake","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"packageId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"usdtIn","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"kjcOut","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"stakeIndex","type":"uint256"}],"name":"BoughtAndAutoStaked","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amountUSDT","type":"uint256"}],"name":"ClaimReferral","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amountKJC","type":"uint256"}],"name":"ClaimStakeReward","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"usdtIn","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"kjcOut","type":"uint256"},{"indexed":false,"internalType":"bool","name":"active","type":"bool"}],"name":"PackageSet","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"aprBps","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"claimInt","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"lockDur","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"r1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"r2","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"r3","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"refClaimInt","type":"uint256"}],"name":"ParamsUpdated","type":"event"},
  {"anonymous":false,"inputs":[],"name":"Paused","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"ref","type":"address"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint8","name":"level","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"usdtAmt","type":"uint256"}],"name":"ReferralAccrued","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"ref","type":"address"}],"name":"ReferralBound","type":"event"},
  {"anonymous":false,"inputs":[],"name":"Unpaused","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"principalKJC","type":"uint256"}],"name":"Unstake","type":"event"},
  {"inputs":[],"name":"BPS_DENOM","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"CLAIM_INTERVAL_STAKE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"KJC","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"LOCK_DURATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"REF1_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"REF2_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"REF3_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"REF_CLAIM_INTERVAL","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"REWARD_APR_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"SECONDS_PER_YEAR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"USDT","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"accruedRefUSDT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address[]","name":"users","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"uint256","name":"startTime","type":"uint256"}],"name":"airdropStakes","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"packageId","type":"uint256"},{"internalType":"address","name":"ref","type":"address"}],"name":"buyPackage","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"canUnstake","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"claimReferralReward","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"claimStakingReward","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getStakeCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"lastRefClaimAt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"nextStakeClaimTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"name":"ownerWithdrawKJC","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"name":"ownerWithdrawUSDT","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"packageCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"packages","outputs":[{"internalType":"uint256","name":"usdtIn","type":"uint256"},{"internalType":"uint256","name":"kjcOut","type":"uint256"},{"internalType":"bool","name":"active","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"pendingStakeReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"referrerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"usdtIn","type":"uint256"},{"internalType":"uint256","name":"kjcOut","type":"uint256"},{"internalType":"bool","name":"active","type":"bool"}],"name":"setPackage","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"aprBps","type":"uint256"},{"internalType":"uint256","name":"claimIntervalStake","type":"uint256"},{"internalType":"uint256","name":"lockDuration","type":"uint256"},{"internalType":"uint256","name":"ref1_bps","type":"uint256"},{"internalType":"uint256","name":"ref2_bps","type":"uint256"},{"internalType":"uint256","name":"ref3_bps","type":"uint256"},{"internalType":"uint256","name":"refClaimInterval","type":"uint256"}],"name":"setParams","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"ref","type":"address"}],"name":"setReferrer","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakes","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"lastClaim","type":"uint256"},{"internalType":"bool","name":"withdrawn","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

// (ตัวช่วย debug เบาๆ)
console.log("✅ KJC Config Loaded");
console.log(window.ADDR.CONTRACT);

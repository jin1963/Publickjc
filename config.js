// ================================
// 🔧 CONFIG: สำหรับระบบ KJC Auto Stake + Referral
// ================================

// 🪙 เครือข่ายที่ใช้ (BSC Mainnet)
window.NETWORK = {
  name: "BNB Smart Chain",
  chainIdHex: "0x38", // 56 (mainnet)
};

// 💼 ที่อยู่สำคัญ
window.ADDR = {
  CONTRACT: "0xf93DB01004C6Cf68f49de2e6bFfafB96C98201b7", // Smart Contract หลัก
  USDT: "0x55d398326f99059fF775485246999027B3197955",     // USDT (BEP20)
  KJC:  "0x2FB9b0F45278D62dc13Dc9F826F78e8E3774047D",      // KJC Token
};

// 🧩 ABI ของสัญญาหลัก (ตัวเต็มจาก BscScan)
window.SALE_ABI = [
  {
    "inputs":[
      {"internalType":"address","name":"usdt_","type":"address"},
      {"internalType":"address","name":"kjc_","type":"address"},
      {"internalType":"uint256","name":"aprBps","type":"uint256"},
      {"internalType":"uint256","name":"claimIntervalStake","type":"uint256"},
      {"internalType":"uint256","name":"lockDuration","type":"uint256"},
      {"internalType":"uint256","name":"ref1_bps","type":"uint256"},
      {"internalType":"uint256","name":"ref2_bps","type":"uint256"},
      {"internalType":"uint256","name":"ref3_bps","type":"uint256"},
      {"internalType":"uint256","name":"refClaimInterval","type":"uint256"}
    ],
    "stateMutability":"nonpayable","type":"constructor"
  },
  {
    "anonymous":false,
    "inputs":[
      {"indexed":true,"internalType":"address","name":"user","type":"address"},
      {"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},
      {"indexed":false,"internalType":"uint256","name":"startTime","type":"uint256"}
    ],
    "name":"AirdropStake","type":"event"
  },
  {
    "anonymous":false,
    "inputs":[
      {"indexed":true,"internalType":"address","name":"user","type":"address"},
      {"indexed":true,"internalType":"uint256","name":"packageId","type":"uint256"},
      {"indexed":false,"internalType":"uint256","name":"usdtIn","type":"uint256"},
      {"indexed":false,"internalType":"uint256","name":"kjcOut","type":"uint256"},
      {"indexed":false,"internalType":"uint256","name":"stakeIndex","type":"uint256"}
    ],
    "name":"BoughtAndAutoStaked","type":"event"
  },
  {"inputs":[],"name":"packageCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"packages","outputs":[
    {"internalType":"uint256","name":"usdtIn","type":"uint256"},
    {"internalType":"uint256","name":"kjcOut","type":"uint256"},
    {"internalType":"bool","name":"active","type":"bool"}
  ],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"packageId","type":"uint256"},{"internalType":"address","name":"ref","type":"address"}],"name":"buyPackage","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getStakeCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"stakes","outputs":[
    {"internalType":"uint256","name":"amount","type":"uint256"},
    {"internalType":"uint256","name":"startTime","type":"uint256"},
    {"internalType":"uint256","name":"lastClaim","type":"uint256"},
    {"internalType":"bool","name":"withdrawn","type":"bool"}
  ],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"pendingStakeReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"claimStakingReward","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"claimReferralReward","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"accruedRefUSDT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"LOCK_DURATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"nextStakeClaimTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"REF1_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"REF2_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"REF3_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
];

// ✅ ใช้ร่วมกับ Web3.js
console.log("✅ KJC Config Loaded", window.ADDR.CONTRACT);

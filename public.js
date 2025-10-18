let web3, account, contract;

// === ฟังก์ชันแสดงข้อความ ===
function toast(msg, time = 3000) {
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.style.display = "block";
  setTimeout(() => (t.style.display = "none"), time);
}

// === เชื่อมต่อกระเป๋า ===
async function connectWallet() {
  try {
    const provider =
      window.ethereum ||
      window.bitkeep?.ethereum ||
      window.okxwallet?.ethereum ||
      window.bitget?.ethereum;

    if (!provider) return toast("❌ ไม่พบ Wallet (MetaMask / Bitget)");

    await provider.request({ method: "eth_requestAccounts" });
    web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    account = accounts[0];

    const chainId = await provider.request({ method: "eth_chainId" });
    if (chainId !== window.NETWORK.chainIdHex) {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: window.NETWORK.chainIdHex }],
      });
    }

    contract = new web3.eth.Contract(window.SALE_ABI, window.ADDR.CONTRACT);

    document.getElementById("walletAddr").textContent =
      `✅ ${account.slice(0, 6)}...${account.slice(-4)}`;
    document.getElementById("contractAddr").textContent = window.ADDR.CONTRACT;

    provider.on?.("accountsChanged", () => location.reload());
    provider.on?.("chainChanged", () => location.reload());

    loadUserData();
    toast("✅ เชื่อมต่อกระเป๋าเรียบร้อย");
  } catch (err) {
    console.error(err);
    toast("❌ เชื่อมต่อกระเป๋าล้มเหลว: " + err.message);
  }
}

// === โหลดข้อมูลผู้ใช้ ===
async function loadUserData() {
  try {
    // แสดง Referral Link
    const refLink = `${window.location.origin}?ref=${account}`;
    document.getElementById("refLink").value = refLink;

    // ดึงข้อมูล Stake
    const user = await contract.methods.users(account).call();
    const stake = web3.utils.fromWei(user.totalStaked || "0", "ether");
    const reward = web3.utils.fromWei(user.pendingStakeReward || "0", "ether");
    const ref = web3.utils.fromWei(user.referralRewards || "0", "ether");

    document.getElementById("stakeAmount").textContent = stake;
    document.getElementById("stakeReward").textContent = reward;
    document.getElementById("refReward").textContent = ref;
  } catch (e) {
    console.error(e);
    toast("⚠️ โหลดข้อมูลผู้ใช้ไม่สำเร็จ");
  }
}

// === ตั้ง Referrer ===
async function setReferrer() {
  try {
    const refAddr = document.getElementById("referrerInput").value;
    if (!web3.utils.isAddress(refAddr))
      return toast("❌ Address ไม่ถูกต้อง");

    await contract.methods.setReferrer(refAddr).send({ from: account });
    toast("✅ ตั้งค่าผู้อ้างอิงสำเร็จ");
  } catch (e) {
    console.error(e);
    toast("❌ ตั้งค่าผู้อ้างอิงล้มเหลว: " + e.message);
  }
}

// === เคลมรางวัล Referral ===
async function claimReferral() {
  try {
    await contract.methods.claimReferralReward().send({ from: account });
    toast("✅ เคลมรางวัล Referral สำเร็จ");
  } catch (e) {
    console.error(e);
    toast("❌ เคลมรางวัล Referral ล้มเหลว: " + e.message);
  }
}

// === เคลมรางวัล Stake ===
async function claimStake() {
  try {
    await contract.methods.claimStakingReward().send({ from: account });
    toast("✅ เคลมรางวัล Stake สำเร็จ");
  } catch (e) {
    console.error(e);
    toast("❌ เคลมรางวัล Stake ล้มเหลว: " + e.message);
  }
}

// === ผูกปุ่ม ===
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("connectBtn").addEventListener("click", connectWallet);
  document.getElementById("btnSetRef").addEventListener("click", setReferrer);
  document.getElementById("copyRefLink").addEventListener("click", () => {
    navigator.clipboard.writeText(
      document.getElementById("refLink").value
    );
    toast("📋 คัดลอกลิงก์แล้ว");
  });
  document.getElementById("claimRefBtn").addEventListener("click", claimReferral);
  document.getElementById("claimStakeBtn").addEventListener("click", claimStake);
});

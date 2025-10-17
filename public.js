// =====================================
// 🌟 PUBLIC DAPP - KJC AUTO STAKE SYSTEM
// =====================================

let web3, provider, account, sale;

// ────────────── UTILS ──────────────
const $ = id => document.getElementById(id);
const fmt = (v, dec = 18, dp = 4) => {
  try {
    const n = BigInt(v);
    const base = 10n ** BigInt(dec);
    const i = (n / base).toString();
    let d = (n % base).toString().padStart(dec, "0").slice(0, dp).replace(/0+$/, "");
    return d ? `${i}.${d}` : i;
  } catch { return v; }
};

// ────────────── CONNECT WALLET ──────────────
async function connectWallet() {
  try {
    provider =
      window.ethereum ||
      window.bitget?.ethereum ||
      window.okxwallet?.ethereum ||
      window.bitkeep?.ethereum;

    if (!provider) return alert("❌ ไม่พบ Wallet (MetaMask / Bitget / OKX)");

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

    sale = new web3.eth.Contract(window.SALE_ABI, window.ADDR.CONTRACT);

    $("wallet").textContent = `✅ ${account.slice(0, 6)}...${account.slice(-4)}`;
    $("status").textContent = "เชื่อมต่อสำเร็จ";
    $("contractAddr").textContent = window.ADDR.CONTRACT;

    provider.on?.("accountsChanged", () => location.reload());
    provider.on?.("chainChanged", () => location.reload());

    await loadPackages();
    await loadStakes();
    await loadReferral();

  } catch (e) {
    console.error(e);
    alert("❌ เชื่อมต่อไม่สำเร็จ: " + e.message);
  }
}

// ────────────── LOAD PACKAGES ──────────────
async function loadPackages() {
  try {
    const count = await sale.methods.packageCount().call();
    if (count == 0) {
      $("packages").innerHTML = `<p style="color:red;">❌ ยังไม่มีแพ็กเกจเปิดขาย</p>`;
      return;
    }

    let html = "";
    for (let i = 0; i < count; i++) {
      const pkg = await sale.methods.packages(i).call();
      if (!pkg.active) continue;
      html += `
        <div class="pkgBox">
          <h3>🎁 แพ็กเกจ ${i + 1}</h3>
          <p>USDT ใช้ซื้อ: <b>${fmt(pkg.usdtIn)}</b></p>
          <p>KJC ได้รับ: <b>${fmt(pkg.kjcOut)}</b></p>
          <button onclick="buyPackage(${i})">🛒 ซื้อแพ็กเกจนี้</button>
        </div>`;
    }
    $("packages").innerHTML = html || `<p style="color:red;">❌ ไม่มีแพ็กเกจ</p>`;
  } catch (e) {
    console.error(e);
    $("packages").innerHTML = `<p style="color:red;">❌ โหลดแพ็กเกจไม่สำเร็จ</p>`;
  }
}

// ────────────── BUY PACKAGE ──────────────
async function buyPackage(id) {
  try {
    const ref = $("refInput").value || "0x0000000000000000000000000000000000000000";
    await sale.methods.buyPackage(id, ref).send({ from: account });
    alert("✅ ซื้อสำเร็จและระบบ Stake อัตโนมัติแล้ว");
    await loadStakes();
  } catch (e) {
    console.error(e);
    alert("❌ ล้มเหลว: " + e.message);
  }
}

// ────────────── LOAD STAKES ──────────────
async function loadStakes() {
  try {
    const count = await sale.methods.getStakeCount(account).call();
    if (count == 0) {
      $("stakes").innerHTML = `<p style="color:orange;">ยังไม่มีการ Stake</p>`;
      return;
    }

    let html = "";
    for (let i = 0; i < count; i++) {
      const s = await sale.methods.stakes(account, i).call();
      const pending = await sale.methods.pendingStakeReward(account, i).call();
      const next = await sale.methods.nextStakeClaimTime(account, i).call();
      const now = Math.floor(Date.now() / 1000);

      html += `
        <div class="stakeBox">
          <h3>💎 Stake #${i + 1}</h3>
          <p>จำนวน: <b>${fmt(s.amount)} KJC</b></p>
          <p>เริ่ม: ${new Date(s.startTime * 1000).toLocaleString()}</p>
          <p>รางวัลค้างเคลม: ${fmt(pending)} KJC</p>
          <p>เคลมได้อีกครั้ง: ${
            next > now ? new Date(next * 1000).toLocaleString() : "✅ พร้อมเคลม"
          }</p>
          <button onclick="claimReward(${i})">💰 เคลมรางวัล</button>
        </div>`;
    }
    $("stakes").innerHTML = html;
  } catch (e) {
    console.error(e);
    $("stakes").innerHTML = `<p style="color:red;">❌ โหลด Stakes ไม่สำเร็จ</p>`;
  }
}

// ────────────── CLAIM STAKE REWARD ──────────────
async function claimReward(index) {
  try {
    await sale.methods.claimStakingReward(index).send({ from: account });
    alert("✅ เคลมรางวัลสำเร็จ");
    await loadStakes();
  } catch (e) {
    alert("❌ เคลมล้มเหลว: " + e.message);
  }
}

// ────────────── CLAIM REFERRAL ──────────────
async function claimReferral() {
  try {
    await sale.methods.claimReferralReward().send({ from: account });
    alert("✅ เคลมรางวัลแนะนำสำเร็จ");
  } catch (e) {
    alert("❌ เคลมล้มเหลว: " + e.message);
  }
}

// ────────────── LOAD REFERRAL INFO ──────────────
async function loadReferral() {
  try {
    const accrued = await sale.methods.accruedRefUSDT(account).call();
    $("refReward").textContent = `${fmt(accrued)} USDT`;
  } catch {
    $("refReward").textContent = "-";
  }
}

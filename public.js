/* public.js — DApp ฝั่งผู้ใช้
 * ใช้คู่กับ config.js ที่กำหนด window.NETWORK, window.ADDR, window.SALE_ABI, window.ERC20_MINI_ABI, window.DECIMALS
*/

let web3, provider, account;
let sale, usdt, kjc;

const el = (id)=>document.getElementById(id);
const nowSec = ()=>Math.floor(Date.now()/1000);

// -------- helpers --------
function toast(msg, type='info'){
  const box = el('toast');
  box.style.display='block';
  box.innerHTML = msg;
  box.style.borderColor = (type==='ok')? '#225b2a' : (type==='err')? '#5b2222' : '#1b1c25';
  setTimeout(()=>{ box.style.display='none'; }, 3800);
}
function fmtAmt(v, dec=18, dp=6){
  try{
    const s = BigInt(v).toString();
    if(dec===0) return s;
    const neg = s.startsWith('-');
    const raw = neg? s.slice(1): s;
    const pad = raw.padStart(dec+1,'0');
    const a = pad.slice(0, pad.length-dec);
    const b = pad.slice(pad.length-dec).replace(/0+$/,'');
    return (neg?'-':'') + (b? `${a}.${b.slice(0,dp)}`: a);
  }catch{ return v?.toString?.() ?? String(v); }
}
const fmtDate = ts => ts>0? new Date(Number(ts)*1000).toLocaleString() : '-';

// ---------- connect ----------
async function connect(){
  try{
    provider = window.ethereum;
    if(!provider) return toast('❌ ไม่พบ MetaMask/Wallet — โปรดเปิดด้วย DApp browser','err');
    await provider.request({ method:'eth_requestAccounts' });
    web3 = new Web3(provider);

    // switch chain
    const chainId = await web3.eth.getChainId();
    if (web3.utils.toHex(chainId) !== window.NETWORK.chainIdHex){
      await provider.request({ method:'wallet_switchEthereumChain', params:[{ chainId: window.NETWORK.chainIdHex }] });
    }

    account = (await web3.eth.getAccounts())[0];
    el('wallet').textContent = `✅ ${account.slice(0,6)}…${account.slice(-4)}`;
    el('ca').textContent = window.ADDR.CONTRACT;

    // instances
    sale = new web3.eth.Contract(window.SALE_ABI, window.ADDR.CONTRACT);
    usdt = new web3.eth.Contract(window.ERC20_MINI_ABI, window.ADDR.USDT);
    kjc  = new web3.eth.Contract(window.ERC20_MINI_ABI, window.ADDR.KJC);

    // listeners
    provider.on?.('accountsChanged', ()=>location.reload());
    provider.on?.('chainChanged', ()=>location.reload());

    hydrateRefFromUrlOrStore();
    updateMyRefLink();

    await refreshSystemState();
    await loadRefParams();
    await loadPackages();
    await refreshReferralBox();
    await loadStakes();
  }catch(e){
    console.error(e);
    toast(`เชื่อมต่อไม่สำเร็จ: ${e?.message||e}`,'err');
  }
}

// ---------- referral (input & link) ----------
function hydrateRefFromUrlOrStore(){
  const url = new URL(location.href);
  const urlRef = url.searchParams.get('ref');
  const lsRef  = localStorage.getItem('kjc_ref') || '';
  const candidate = urlRef || lsRef || '';
  if (candidate && /^0x[a-fA-F0-9]{40}$/.test(candidate)){
    el('refInput').value = candidate;
    localStorage.setItem('kjc_ref', candidate);
  }
}
function lockRef(){
  const r = el('refInput').value.trim();
  if (!r) return toast('กรุณาใส่ Referrer','err');
  if (!/^0x[a-fA-F0-9]{40}$/.test(r)) return toast('Referrer ไม่ถูกต้อง','err');
  localStorage.setItem('kjc_ref', r);
  toast('✅ บันทึก Referrer แล้ว','ok');
}
function updateMyRefLink(){
  if (!account) return;
  const link = `${location.origin}${location.pathname}?ref=${account}`;
  el('myRefLink').value = link;
  el('btnCopyMyRef').onclick = async ()=>{
    try{
      await navigator.clipboard.writeText(link);
      toast('คัดลอกลิงก์แล้ว ✅','ok');
    }catch{
      // fallback สำหรับบางมือถือ/เบราว์เซอร์
      el('myRefLink').select?.();
      toast('คัดลอกไม่สำเร็จ — ลองแตะค้างที่ช่องแล้วคัดลอกเอง','err');
    }
  };
}

// ---------- system state ----------
async function refreshSystemState(){
  try{
    const p = await sale.methods.paused().call();
    el('sysState').textContent = p ? '⏸️ Paused' : '▶️ Running';
  }catch{
    el('sysState').textContent = '—';
  }
}

// ---------- load referral params (info text) ----------
async function loadRefParams(){
  try{
    const [r1,r2,r3,intv] = await Promise.all([
      sale.methods.REF1_BPS().call(),
      sale.methods.REF2_BPS().call(),
      sale.methods.REF3_BPS().call(),
      sale.methods.REF_CLAIM_INTERVAL().call()
    ]);
    const days = Math.round(Number(intv)/86400);
    el('refBps').textContent = `${r1}/${r2}/${r3} bps (เคลมทุก ~${days} วัน)`;
  }catch{
    el('refBps').textContent = '-';
  }
}

// ---------- packages ----------
async function loadPackages(){
  const wrap = el('pkgWrap');
  wrap.innerHTML = 'กำลังโหลดแพ็กเกจ…';
  try{
    const [count, usdtDec, kjcDec] = await Promise.all([
      sale.methods.packageCount().call(),
      usdt.methods.decimals?.().call().catch(()=>window.DECIMALS?.USDT ?? 18),
      kjc.methods.decimals?.().call().catch(()=>window.DECIMALS?.KJC ?? 18),
    ]);

    // ตรวจ paused เพื่อปิดปุ่มซื้อ
    let paused = false;
    try { paused = await sale.methods.paused().call(); } catch {}

    wrap.innerHTML = '';
    const start = 0; // สัญญาใหม่เริ่มที่ 0
    for (let i=start; i<Number(count); i++){
      const p = await sale.methods.packages(i).call();
      if (!p.active) continue;
      const card = document.createElement('div');
      card.className = 'pkg';
      card.innerHTML = `
        <h3>แพ็กเกจ #${i}</h3>
        <div>จ่าย: <b>${fmtAmt(p.usdtIn, Number(usdtDec))}</b> USDT</div>
        <div>รับ: <b>${fmtAmt(p.kjcOut, Number(kjcDec))}</b> KJC</div>
        <button class="btnBuy" data-id="${i}" ${paused?'disabled':''}>ซื้อแพ็กเกจ</button>
        ${paused? '<div class="muted">* ระบบกำลัง Pause ชั่วคราว</div>':''}
      `;
      wrap.appendChild(card);
    }

    [...document.querySelectorAll('.btnBuy')].forEach(btn=>{
      btn.addEventListener('click', ()=>buyPackage(Number(btn.dataset.id)));
    });

    if (!wrap.innerHTML.trim()){
      wrap.innerHTML = '<div class="muted">ยังไม่มีแพ็กเกจที่เปิดขาย</div>';
    }
  }catch(e){
    console.error(e);
    wrap.innerHTML = '❌ โหลดแพ็กเกจไม่สำเร็จ';
  }
}

async function ensureAllowance(spender, amount){
  const a = await usdt.methods.allowance(account, spender).call();
  if (BigInt(a) >= BigInt(amount)) return true;
  toast('กำลังอนุมัติ USDT…');
  await usdt.methods.approve(spender, amount).send({ from: account });
  toast('อนุมัติ USDT สำเร็จ ✅','ok');
  return true;
}

async function buyPackage(id){
  try{
    const p = await sale.methods.packages(id).call();
    if (!p.active) return toast('แพ็กเกจนี้ถูกปิดแล้ว','err');

    // bind ref ครั้งแรก: DApp ส่ง setReferrer ให้ก่อนถ้ายังไม่เคยตั้ง
    let refAddr = el('refInput').value.trim() || localStorage.getItem('kjc_ref') || '';
    if (refAddr && !/^0x[a-fA-F0-9]{40}$/.test(refAddr)) return toast('Referrer ไม่ถูกต้อง','err');

    // ตั้ง ref (optional; สัญญาจะ bind ให้ตอนซื้อรอบแรกถ้ายังว่างด้วย)
    if (refAddr){
      try{
        const bound = await sale.methods.referrerOf(account).call();
        if (bound === '0x0000000000000000000000000000000000000000'){
          await sale.methods.setReferrer(refAddr).send({ from: account });
          toast('ตั้งผู้อ้างอิงสำเร็จ ✅','ok');
        }
      }catch{}
    }

    await ensureAllowance(window.ADDR.CONTRACT, p.usdtIn);

    toast('กำลังส่งธุรกรรมซื้อ + stake…');
    await sale.methods.buyPackage(id, refAddr || '0x0000000000000000000000000000000000000000').send({ from: account });
    toast('🎉 ซื้อสำเร็จและ Stake อัตโนมัติ', 'ok');

    if (refAddr) localStorage.setItem('kjc_ref', refAddr);
    await refreshReferralBox();
    await loadStakes();
  }catch(e){
    console.error(e);
    toast(`ซื้อไม่สำเร็จ: ${e?.message||e}`, 'err');
  }
}

// ---------- referral box ----------
async function refreshReferralBox(){
  try{
    const [acc, lastAt, intv] = await Promise.all([
      sale.methods.accruedRefUSDT(account).call(),
      sale.methods.lastRefClaimAt(account).call(),
      sale.methods.REF_CLAIM_INTERVAL().call()
    ]);
    el('refUsdt').textContent = `${fmtAmt(acc, window.DECIMALS?.USDT ?? 18)} USDT`;

    const next = Number(lastAt)===0 ? 0 : Number(lastAt)+Number(intv);
    if (next===0) el('refCountdown').textContent = 'พร้อมเคลม (ถ้ามียอด)';
    else {
      const rem = Math.max(0, next - nowSec());
      if (rem===0) el('refCountdown').textContent = 'พร้อมเคลม';
      else {
        const d = Math.floor(rem/86400);
        const h = Math.floor((rem%86400)/3600);
        const m = Math.floor((rem%3600)/60);
        el('refCountdown').textContent = `${d}d ${h}h ${m}m`;
      }
    }
  }catch{
    el('refUsdt').textContent = '-';
    el('refCountdown').textContent = '-';
  }
}

async function claimReferral(){
  try{
    toast('ส่งธุรกรรมเคลม Referral…');
    await sale.methods.claimReferralReward().send({ from: account });
    toast('เคลมสำเร็จ ✅','ok');
    await refreshReferralBox();
  }catch(e){
    toast(`เคลมไม่สำเร็จ: ${e?.message||e}`, 'err');
  }
}

// ---------- stakes ----------
async function loadStakes(){
  const box = el('stakes');
  box.innerHTML = 'กำลังโหลด stakes…';
  try{
    const [n, lockDur, kjcDec] = await Promise.all([
      sale.methods.getStakeCount(account).call(),
      sale.methods.LOCK_DURATION().call(),
      kjc.methods.decimals?.().call().catch(()=>window.DECIMALS?.KJC ?? 18),
    ]);

    let totalP = 0n, totalPend = 0n;
    box.innerHTML = '';

    if (Number(n)===0){
      el('totals').textContent = 'รวม Principal: 0 KJC • รอเคลม: 0 KJC';
      box.innerHTML = '<div class="muted">ยังไม่มีรายการ stake</div>';
      return;
    }

    for (let i=0;i<Number(n);i++){
      const s   = await sale.methods.stakes(account, i).call();
      const nct = await sale.methods.nextStakeClaimTime(account, i).call();
      const can = await sale.methods.canUnstake(account, i).call();
      const pr  = await sale.methods.pendingStakeReward(account, i).call();

      totalP   += BigInt(s.amount);
      totalPend+= BigInt(pr);

      const unlockTs = Number(s.startTime) + Number(lockDur);
      const now = nowSec();
      const daysRemain = Math.max(0, Math.ceil((unlockTs - now)/86400));

      const card = document.createElement('div');
      card.className = 'stake';
      card.innerHTML = `
        <div class="mono">Index #${i} ${s.withdrawn? '<span class="muted">(withdrawn)</span>':''}</div>
        <div>Principal: <b class="mono">${fmtAmt(s.amount, Number(kjcDec))}</b> KJC</div>
        <div>รอเคลม: <b class="mono">${fmtAmt(pr, Number(kjcDec))}</b> KJC</div>
        <div class="muted">เริ่ม: ${fmtDate(s.startTime)}</div>
        <div class="muted">เคลมถัดไป: ${fmtDate(nct)}</div>
        <div class="muted">ครบล็อก: ${fmtDate(unlockTs)} (${daysRemain} วัน)</div>
        <div class="actions">
          <button class="btnClaim" data-i="${i}" ${s.withdrawn?'disabled':''}>เคลมผลตอบแทน</button>
          <button class="btnUnstake" data-i="${i}" ${(!can || s.withdrawn)?'disabled':''}>Unstake</button>
        </div>
      `;
      box.appendChild(card);
    }

    el('totals').textContent =
      `รวม Principal: ${fmtAmt(totalP, Number(kjcDec))} KJC • รอเคลม: ${fmtAmt(totalPend, Number(kjcDec))} KJC`;

    // wire buttons
    document.querySelectorAll('.btnClaim').forEach(b=>{
      b.addEventListener('click', async ()=>{
        const i = Number(b.dataset.i);
        try{
          toast('กำลังเคลมผลตอบแทน…');
          await sale.methods.claimStakingReward(i).send({ from: account });
          toast('เคลมสำเร็จ ✅','ok');
          await loadStakes();
        }catch(e){ toast(`เคลมไม่สำเร็จ: ${e?.message||e}`, 'err'); }
      });
    });
    document.querySelectorAll('.btnUnstake').forEach(b=>{
      b.addEventListener('click', async ()=>{
        const i = Number(b.dataset.i);
        try{
          toast('กำลัง Unstake…');
          await sale.methods.unstake(i).send({ from: account });
          toast('Unstake สำเร็จ ✅','ok');
          await loadStakes();
        }catch(e){ toast(`Unstake ไม่สำเร็จ: ${e?.message||e}`, 'err'); }
      });
    });

  }catch(e){
    console.error(e);
    box.innerHTML = '❌ โหลด stakes ไม่สำเร็จ';
  }
}

// ---------- wire ----------
window.addEventListener('DOMContentLoaded', ()=>{
  el('btnConnect').addEventListener('click', connect);
  el('btnLockRef').addEventListener('click', lockRef);
  el('btnCopyMyRef').addEventListener('click', ()=>{}); // set ใน updateMyRefLink()
  el('btnClaimRef').addEventListener('click', claimReferral);
});

const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('app.js', 'utf8');
let lines = content.split('\n');

// Find the renderVendorPortal function body (the innerHTML line)
// It starts with "    $app.innerHTML=`<main" on line after "const highRisk"
const vendorInnerHTMLIdx = lines.findIndex(l => l.includes('Vendor operations') && l.includes('vendor-preview-header'));
if (vendorInnerHTMLIdx === -1) { console.error('Could not find vendor portal innerHTML line'); process.exit(1); }

// The next line should be "  }" closing the function
const closingBraceIdx = vendorInnerHTMLIdx + 1;

console.log(`Found vendor innerHTML at line ${vendorInnerHTMLIdx + 1}`);
console.log(`Closing brace at line ${closingBraceIdx + 1}: "${lines[closingBraceIdx].trim()}"`);

// Build the new vendor portal innerHTML and closing
const newVendorLines = `    $app.innerHTML=\`<main class="vendor-preview"><header class="vendor-preview-header"><div class="brand"><span class="brand-mark">Rx</span><div><strong>DME Direct</strong><small>Vendor workspace</small></div></div><div class="actions"><span class="pill green">ABC Home Medical</span><button class="btn small" data-action="vendor-logout">Sign out</button></div></header><div class="vendor-preview-body">\${titleBlock('Vendor operations','Operational Workspace','Fleet status, assigned orders, delivery proof, pickup management and SLA performance for ABC Home Medical.')}
      <section class="grid metrics"><div class="metric"><span>Total Fleet Size</span><strong>28</strong><small>Serialized units</small></div><div class="metric"><span>Available Units</span><strong>14</strong><small>Ready for dispatch</small></div><div class="metric"><span>On Route</span><strong>3</strong><small>Active deliveries</small></div><div class="metric"><span>Overdue for Pickup</span><strong>2</strong><small>Past scheduled return</small></div><div class="metric"><span>Current Load %</span><strong>68%</strong><small>Fleet utilization</small></div></section>
      \${highRisk.length?\`<section class="card" style="border-left:4px solid var(--red)"><div class="card-head"><div><h2>At-Risk Orders</h2><p class="muted">Orders with risk \u2265 50 require priority action and explanation.</p></div>\${pill(highRisk.length+' at risk','red')}</div><div class="list">\${highRisk.map(o=>{const reasons=[];if(Number(o.risk)>=60)reasons.push('Tight timeline');if(o.weather)reasons.push('Severe weather advisory');reasons.push('High current load (68%)');if(o.items.length>1)reasons.push('Multi-item order complexity');return \\\`<div class="row high"><div class="row-main"><strong>\\\${esc(o.id)} \u00b7 \\\${esc(o.patient)}</strong><small>\\\${esc(o.items.join(' \u00b7 '))}</small><small><strong>Why at risk:</strong> \\\${esc(reasons.join(' + '))}</small></div><div class="row-meta">\\\${pill('Risk '+o.risk,'red')} \\\${pill(o.status,statusClass(o.status))}</div></div>\\\`;}).join('')}</div></section>\`:''}
      <section class="card"><div class="card-head"><div><h2>Equipment Inventory</h2><p class="muted">Serialized equipment tracking \u00b7 ABC Home Medical fleet.</p></div></div><div class="list">\${inventory.map(i=>\`<div class="row"><div class="row-main"><strong>\${esc(i.serial)} \u00b7 \${esc(i.desc)}</strong><small>HCPCS \${esc(i.hcpcs)}\${i.patient!=='\u2014'?' \u00b7 Patient: '+esc(i.patient):''} \${i.daysOut?' \u00b7 '+i.daysOut+' days out':''}</small></div><div class="row-meta">\${pill(i.status,invStatusClass(i.status))}</div></div>\`).join('')}</div></section>
      <section class="card"><div class="card-head"><div><h2>Dispatched Orders & Delivery Proof</h2><p class="muted">Submit proof of delivery for dispatched orders.</p></div></div><div class="list">\${dispatched.map(o=>\`<div class="row \${o.risk>=50?'high':''}"><div class="row-main"><strong>\${esc(o.id)} \u00b7 \${esc(o.patient)}</strong><small>\${esc(o.items.join(' \u00b7 '))}</small><small><strong>Delivery ETA:</strong> \${esc(deliveryEta(o)||o.eta)}</small></div><div class="row-meta">\${pill(o.vendorProofSubmitted?'Proof Submitted':o.status,o.vendorProofSubmitted?'green':statusClass(o.status))}\${o.vendorSplit?' '+pill('Split Delivery','amber'):''}\${!o.vendorProofSubmitted?\\\`<button class="btn small" style="margin-top:6px" data-action="vendor-proof" data-vendor-order="\\\${o.id}">Submit Proof of Delivery</button>\\\`:''}<button class="btn small" style="margin-top:6px" data-action="vendor-split" data-vendor-order="\${o.id}">Split Fulfillment</button></div></div>\`).join('')||'<div class="empty">No dispatched orders.</div>'}</div></section>
      <section class="card"><div class="card-head"><div><h2>Pickup Management</h2><p class="muted">Respond to provider pickup requests within SLA window.</p></div></div><div class="list">\${pickupRequests.length?pickupRequests.map(o=>\`<div class="row"><div class="row-main"><strong>\${esc(o.id)} \u00b7 \${esc(o.patient)}</strong><small>\${esc(o.items.join(' \u00b7 '))}</small><small><strong>Pickup status:</strong> \${esc(o.pickup)} \u00b7 \${esc(pickupEta(o)||'Pending')}</small><small class="muted" style="color:var(--red)">\u23f1 Response required within 4 hours</small></div><div class="row-meta">\${pill(o.pickup,'amber')}\${o.pickup==='Requested'?\\\`<button class="btn small" style="margin-top:6px" data-action="vendor-accept-pickup" data-vendor-order="\\\${o.id}">Accept Pickup</button><button class="btn small" style="margin-top:6px" data-action="vendor-schedule-pickup" data-vendor-order="\\\${o.id}">Schedule Pickup</button>\\\`:''}</div></div>\`).join(''):'<div class="empty">No pickup requests pending.</div>'}</div></section>
      <section class="card"><div class="card-head"><div><h2>SLA Performance Scorecard</h2><p class="muted">Contract performance metrics \u00b7 current period.</p></div></div><div class="summary-strip"><div><span>On-Time Delivery Rate</span><strong>94%</strong></div><div><span>Pickup Response Time</span><strong>avg 2.1 hrs</strong></div><div><span>Order Completion Rate</span><strong>98%</strong></div><div><span>Contract Threshold</span><strong>90%</strong></div></div><div style="margin-top:12px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="width:140px;font-size:13px">On-Time Delivery</span><div style="flex:1;height:8px;background:#e8e8e8;border-radius:4px"><div style="width:94%;height:100%;background:var(--green);border-radius:4px"></div></div><small>94%</small></div><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="width:140px;font-size:13px">Completion Rate</span><div style="flex:1;height:8px;background:#e8e8e8;border-radius:4px"><div style="width:98%;height:100%;background:var(--green);border-radius:4px"></div></div><small>98%</small></div><div style="display:flex;align-items:center;gap:8px"><span style="width:140px;font-size:13px">Contract Threshold</span><div style="flex:1;height:8px;background:#e8e8e8;border-radius:4px"><div style="width:90%;height:100%;background:var(--amber);border-radius:4px"></div></div><small>90%</small></div></div></section>
      <div class="notice"><strong>Vendor preview active</strong><p>This sign-in demonstrates scoped vendor access. Provider approvals, ranking rules and other vendors remain unavailable.</p></div></div></main>\`;
  }`;

// Replace lines 182-183 with the new vendor portal
lines.splice(vendorInnerHTMLIdx, 2, ...newVendorLines.split('\n'));

// Now find the orderDrawer function and add split status display + split allocation button
const orderDrawerIdx = lines.findIndex(l => l.includes('function orderDrawer()'));
if (orderDrawerIdx !== -1) {
  // Find the "Order details" section inside orderDrawer and add split status after it
  // We'll add split allocation request button for case managers and split status display
  const drawerLine = lines[orderDrawerIdx];
  
  // Add split status display in order drawer - inject after "Modify order" button area
  const modifyIdx = lines.findIndex((l, i) => i >= orderDrawerIdx && l.includes('data-action="modify-order"'));
  if (modifyIdx !== -1) {
    const oldLine = lines[modifyIdx];
    // Add split allocation button for charge role and split status indicator
    lines[modifyIdx] = oldLine.replace(
      `<button class="btn small" data-action="modify-order">Modify order</button>`,
      `<button class="btn small" data-action="modify-order">Modify order</button>\${o.vendorSplit?\`<div class="notice" style="margin-top:10px"><strong>Split Delivery</strong><p>This order has been split across multiple deliveries. Reason: \${esc(o.splitReason||'Vendor-initiated split')}</p></div>\`:''}\${state.role==='charge'&&o.items.length>1&&!o.splitAllocation?\`<button class="btn small" style="margin-top:6px" data-action="request-split-allocation" data-split-order="\${o.id}">Request Split Allocation</button>\`:''}` 
    );
  }
}

// Find the event handler section and add new actions for vendor portal and split features
const vendorLogoutIdx = lines.findIndex(l => l.includes("action==='vendor-logout'"));
if (vendorLogoutIdx !== -1) {
  // Add new vendor actions after vendor-logout handler
  const afterVendorLogout = lines[vendorLogoutIdx];
  lines[vendorLogoutIdx] = afterVendorLogout + `
    else if(action==='vendor-proof'){vendorSubmitProof(t.dataset.vendorOrder||t.closest('[data-vendor-order]')?.dataset.vendorOrder);}
    else if(action==='vendor-split'){vendorSplitFulfillment(t.dataset.vendorOrder||t.closest('[data-vendor-order]')?.dataset.vendorOrder);}
    else if(action==='vendor-accept-pickup'){vendorAcceptPickup(t.dataset.vendorOrder||t.closest('[data-vendor-order]')?.dataset.vendorOrder);}
    else if(action==='vendor-schedule-pickup'){vendorSchedulePickup(t.dataset.vendorOrder||t.closest('[data-vendor-order]')?.dataset.vendorOrder);}
    else if(action==='confirm-vendor-proof'){confirmVendorProof();}
    else if(action==='confirm-vendor-split'){confirmVendorSplit();}
    else if(action==='request-split-allocation'){requestSplitAllocation(t.dataset.splitOrder||t.closest('[data-split-order]')?.dataset.splitOrder);}
    else if(action==='confirm-split-allocation'){confirmSplitAllocation();}`;
}

// Find where the actionModal function is and add the new modals for vendor-proof, vendor-split, split-allocation
const actionModalFnIdx = lines.findIndex(l => l.includes('function actionModal()'));
if (actionModalFnIdx !== -1) {
  // Find the line that has "return '';" at the end of actionModal
  let returnEmptyIdx = -1;
  for (let i = actionModalFnIdx; i < lines.length; i++) {
    if (lines[i].trim() === "return '';") {
      returnEmptyIdx = i;
      break;
    }
  }
  if (returnEmptyIdx !== -1) {
    // Add new modal cases before the "return '';" 
    const newModals = `    if(ui.actionModal==='vendor-proof'){const o=state.orders.find(x=>x.id===ui.modalId);if(!o)return '';return modalShell('Submit Proof of Delivery',o.id+' \u00b7 '+o.patient,\`<div class="summary-strip"><div><span>Photo</span><strong>\u25a7 Photo placeholder</strong></div><div><span>GPS</span><strong>40.7608, -111.8910</strong></div><div><span>Timestamp</span><strong>\${new Date().toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</strong></div></div><div class="field" style="margin-top:14px"><label>Recipient signature</label><div style="border:2px dashed #ccc;padding:30px;text-align:center;border-radius:8px;color:#999">\u270d Signature capture area</div></div><div class="field" style="margin-top:12px"><label>Delivery notes</label><textarea id="proofNotes" rows="3" placeholder="Equipment setup confirmed, condition documented"></textarea></div><button class="btn primary" style="width:100%;margin-top:15px" data-action="confirm-vendor-proof">Submit Delivery Proof</button>\`);}
    if(ui.actionModal==='vendor-split'){const o=state.orders.find(x=>x.id===ui.modalId);if(!o)return '';return modalShell('Split Fulfillment','Select items for split delivery and provide a reason.',\`<div class="check-list">\${o.items.map((item,idx)=>\`<label class="check"><input type="checkbox" data-split-item="\${idx}" checked><span>\${esc(item)}</span></label>\`).join('')}</div><div class="field" style="margin-top:14px"><label>Reason for split</label><textarea id="splitReason" rows="3" placeholder="Explain why fulfillment must be split (e.g., partial stock, equipment at different warehouses)"></textarea></div><button class="btn primary" style="width:100%;margin-top:15px" data-action="confirm-vendor-split">Confirm Split Fulfillment</button>\`);}
    if(ui.actionModal==='split-allocation'){const o=state.orders.find(x=>x.id===ui.modalId);if(!o)return '';const vendors=state.vendors;return modalShell('Request Split Allocation','Items not available from a single vendor. Request DON approval to split across vendors.',\`<div class="list">\${o.items.map((item,idx)=>\`<div class="row"><div class="row-main"><strong>\${esc(item)}</strong></div><div class="row-meta"><select data-alloc-vendor="\${idx}">\${vendors.map(v=>\`<option value="\${v.id}">\${esc(v.name)}</option>\`).join('')}</select></div></div>\`).join('')}</div><div class="field" style="margin-top:14px"><label>Clinical justification</label><textarea id="splitAllocReason" rows="3" placeholder="Document why a single vendor cannot fulfill all items"></textarea></div><button class="btn primary" style="width:100%;margin-top:15px" data-action="confirm-split-allocation">Submit for DON Approval</button>\`);}`;
    lines.splice(returnEmptyIdx, 0, newModals);
  }
}

// Add the new handler functions before render() call at the end
const renderCallIdx = lines.lastIndexOf('  render();');
if (renderCallIdx === -1) {
  // Try alternative
  const altIdx = lines.findIndex((l, i) => i > lines.length - 10 && l.trim() === 'render();');
}

const finalRenderIdx = lines.findIndex((l, i) => i > lines.length - 15 && l.trim() === 'render();');
const insertBeforeRender = finalRenderIdx !== -1 ? finalRenderIdx : lines.length - 3;

const newFunctions = `
  function vendorSubmitProof(orderId){if(!orderId)return;ui.actionModal='vendor-proof';ui.modalId=orderId;render();}
  function confirmVendorProof(){const o=state.orders.find(x=>x.id===ui.modalId);if(!o)return;o.vendorProofSubmitted=true;o.timeline.push('Proof of delivery submitted \u00b7 '+new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}));ui.actionModal=null;ui.modalId=null;save();toast('Proof of delivery submitted successfully.');render();}
  function vendorSplitFulfillment(orderId){if(!orderId)return;ui.actionModal='vendor-split';ui.modalId=orderId;render();}
  function confirmVendorSplit(){const o=state.orders.find(x=>x.id===ui.modalId);if(!o)return;const reason=(document.getElementById('splitReason')?.value||'').trim();if(!reason){toast('Provide a reason for the split fulfillment.');return;}o.vendorSplit=true;o.splitReason=reason;o.timeline.push('Split Fulfillment initiated \u00b7 '+reason);o.timeline.push('DON and Executive notified of split delivery \u00b7 '+new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}));addNotification(o.id+' split fulfillment.',o.patient+' \u00b7 Vendor initiated split: '+reason,o.id);ui.actionModal=null;ui.modalId=null;save();toast('Order marked as Split Delivery. Notifications sent.');render();}
  function vendorAcceptPickup(orderId){const o=state.orders.find(x=>x.id===orderId);if(!o)return;o.pickup='Accepted';o.timeline.push('Vendor accepted pickup request \u00b7 '+new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}));save();toast('Pickup accepted.');render();}
  function vendorSchedulePickup(orderId){const o=state.orders.find(x=>x.id===orderId);if(!o)return;o.pickup='Scheduled';o.pickupEta='Tomorrow \u00b7 10 AM\u201312 PM';o.timeline.push('Vendor scheduled pickup \u00b7 Tomorrow 10 AM\u201312 PM');save();toast('Pickup scheduled for tomorrow.');render();}
  function requestSplitAllocation(orderId){if(!orderId)return;ui.actionModal='split-allocation';ui.modalId=orderId;render();}
  function confirmSplitAllocation(){const o=state.orders.find(x=>x.id===ui.modalId);if(!o)return;const reason=(document.getElementById('splitAllocReason')?.value||'').trim();if(!reason){toast('Provide clinical justification for split allocation.');return;}const allocations=[];document.querySelectorAll('[data-alloc-vendor]').forEach(sel=>{allocations.push({item:o.items[Number(sel.dataset.allocVendor)],vendor:sel.value});});o.splitAllocation={reason,allocations,status:'Pending DON Approval',requestedBy:role().label,requestedAt:new Date().toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})};o.timeline.push('Split allocation requested \u00b7 Routed to DON for approval');addNotification(o.id+' split allocation requested.',o.patient+' \u00b7 Case Manager requests multi-vendor split. DON approval required.',o.id);ui.actionModal=null;ui.modalId=null;save();toast('Split allocation request submitted to DON.');render();}
`;

lines.splice(insertBeforeRender, 0, newFunctions);

// Join and write
content = lines.join('\n');

// Final branding pass - catch any remaining "BetterRX DME" instances in UI strings
// but preserve the localStorage key 'betterrx-provider-demo' as-is
content = content.replace(/BetterRX DME(?! Direct)/g, (match, offset) => {
  // Don't replace inside the localStorage key
  const context = content.substring(Math.max(0, offset - 30), offset + match.length + 30);
  if (context.includes('betterrx-provider-demo') || context.includes('localStorage')) return match;
  return 'DME Direct';
});

fs.writeFileSync('app.js', content, 'utf8');
console.log('Patch applied successfully. Lines: ' + content.split('\n').length);

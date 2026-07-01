import React, { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'

const defaultShop = {
  name: '',
  tagline: '',
  address: '',
  city: '',
  mobile: '',
  gstin: '',
  state: '',
  stateCode: '',
  bankName: '',
  accountName: '',
  branch: '',
  ifsc: '',
  upiId: '',
  gold24k: '',
  silver999: '',
}

const defaultBuyer = { name: '', address: '', state: '', stateCode: '', mobile: '' }

const newItem = () => ({
  id: Date.now() + Math.random(),
  description: '', hsn: '7113', pcs: 1,
  grossWt: '', netWt: '', rate: '', ratePer: '10g',
  making: '', makingType: 'fixed', hmChg: '0 fixed', amount: 0,
})

function calcAmount(item) {
  const net = parseFloat(item.netWt) || 0
  const rate = parseFloat(item.rate) || 0
  const making = parseFloat(item.making) || 0
  const perG = item.ratePer === '10g' ? rate / 10 : rate
  const base = net * perG
  const mkAmt = item.makingType === 'percent' ? base * making / 100 : net * making
  return +(base + mkAmt).toFixed(2)
}

function numToWords(n) {
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']
  if (n === 0) return 'Zero'
  const convert = (num) => {
    if (num < 20) return ones[num]
    if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? ' '+ones[num%10] : '')
    if (num < 1000) return ones[Math.floor(num/100)]+' Hundred'+(num%100 ? ' '+convert(num%100) : '')
    if (num < 100000) return convert(Math.floor(num/1000))+' Thousand'+(num%1000 ? ' '+convert(num%1000) : '')
    if (num < 10000000) return convert(Math.floor(num/100000))+' Lakh'+(num%100000 ? ' '+convert(num%100000) : '')
    return convert(Math.floor(num/10000000))+' Crore'+(num%10000000 ? ' '+convert(num%10000000) : '')
  }
  return convert(Math.floor(n)) + ' Only'
}

const Field = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
  <div>
    <label className="block text-xs font-medium text-ink-700/60 tracking-wide mb-1.5">{label}</label>
    <input type={type} placeholder={placeholder}
      className="w-full border border-gold-200/70 rounded-lg px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60 focus:border-gold-400 bg-white transition-shadow"
      value={value} onChange={e => onChange(e.target.value)} />
  </div>
)

const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-3 mb-5">
    <h2 className="playfair text-lg font-bold text-ink-900 tracking-wide">{children}</h2>
    <div className="flex-1 gold-rule" />
  </div>
)

export default function App() {
  const [tab, setTab] = useState('form')
  const [shop, setShop] = useState(defaultShop)
  const [invoiceNo, setInvoiceNo] = useState('2')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [buyer, setBuyer] = useState(defaultBuyer)
  const [items, setItems] = useState([newItem()])
  const [discount, setDiscount] = useState('0')
  const [payMode, setPayMode] = useState('Cash')
  const [cgstRate, setCgstRate] = useState('1.5')
  const [sgstRate, setSgstRate] = useState('1.5')

  const S = (k) => (v) => setShop(p => ({...p,[k]:v}))
  const B = (k) => (v) => setBuyer(p => ({...p,[k]:v}))
  const updateItem = (id, field, val) => setItems(prev => prev.map(it => {
    if (it.id !== id) return it
    const u = {...it,[field]:val}
    u.amount = calcAmount(u)
    return u
  }))
  const addItem = () => setItems(p => [...p, newItem()])
  const removeItem = (id) => setItems(p => p.filter(it => it.id !== id))

  const subtotal = items.reduce((s,it) => s+(it.amount||0), 0)
  const disc = parseFloat(discount)||0
  const taxable = subtotal - disc
  const cgst = +(taxable * (parseFloat(cgstRate)||0) / 100).toFixed(2)
  const sgst = +(taxable * (parseFloat(sgstRate)||0) / 100).toFixed(2)
  const total = taxable + cgst + sgst
  const rounded = Math.round(total)
  const roundOff = +(rounded - total).toFixed(2)

  const upiString = `upi://pay?pa=${encodeURIComponent(shop.upiId)}&pn=${encodeURIComponent(shop.name)}&am=${rounded}&cu=INR&tn=${encodeURIComponent('Invoice '+invoiceNo)}`

  const handlePrint = () => { setTab('preview'); setTimeout(() => window.print(), 300) }

  const fmtDate = (d) => {
    try { return new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'}) } catch { return d }
  }

  return (
    <div className="min-h-screen bg-[#f7f4ee]">
      <header className="no-print sticky top-0 z-50 bg-white/40 backdrop-blur-xl text-ink-900 shadow-lg border-b border-gold-300/40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="playfair text-xl font-bold gold-text">JewelX</span>
            <span className="text-ink-700/40 text-xs hidden sm:inline tracking-widest uppercase">Invoice Suite</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setTab('form')} className={`px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${tab==='form'?'bg-gold-400 text-ink-900':'bg-white/30 text-ink-700 hover:bg-white/50 border border-gold-400/30'}`}>Edit</button>
            <button onClick={() => setTab('preview')} className={`px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${tab==='preview'?'bg-gold-400 text-ink-900':'bg-white/30 text-ink-700 hover:bg-white/50 border border-gold-400/30'}`}>Preview</button>
            <button onClick={handlePrint} className="px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white transition-all">Print</button>
          </div>
        </div>
      </header>

      {tab === 'form' && (
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

          <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gold-200/50 p-5">
            <SectionTitle>Shop Details</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Shop Name" value={shop.name} onChange={S('name')} placeholder="Your Shop Name" />
              <Field label="Tagline" value={shop.tagline} onChange={S('tagline')} placeholder="e.g. We deal in all kinds of Gold & Silver Jewellery" />
              <Field label="Address" value={shop.address} onChange={S('address')} placeholder="Shop address" />
              <Field label="City & PIN" value={shop.city} onChange={S('city')} placeholder="City, State - PIN" />
              <Field label="Mobile" value={shop.mobile} onChange={S('mobile')} placeholder="10-digit mobile number" />
              <Field label="GSTIN" value={shop.gstin} onChange={S('gstin')} placeholder="22AAAAA0000A1Z5" />
              <Field label="State" value={shop.state} onChange={S('state')} placeholder="Your State" />
              <Field label="State Code" value={shop.stateCode} onChange={S('stateCode')} placeholder="e.g. 23" />
            </div>
            <div className="mt-5 pt-5 border-t border-gold-100">
              <h3 className="text-xs font-bold text-gold-700 mb-3 tracking-widest uppercase">Bank &amp; UPI Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Account Name" value={shop.accountName} onChange={S('accountName')} placeholder="Your Name" />
                <Field label="Bank Name" value={shop.bankName} onChange={S('bankName')} placeholder="e.g. State Bank of India" />
                <Field label="Branch" value={shop.branch} onChange={S('branch')} placeholder="Branch name" />
                <Field label="IFSC Code" value={shop.ifsc} onChange={S('ifsc')} placeholder="e.g. SBIN0000001" />
                <Field label="UPI ID" value={shop.upiId} onChange={S('upiId')} placeholder="yourname@upi" />
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-gold-100">
              <h3 className="text-xs font-bold text-gold-700 mb-3 tracking-widest uppercase">Today's Rates</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Gold 24K (₹/10g)" type="number" value={shop.gold24k} onChange={S('gold24k')} placeholder="0" />
                <Field label="Silver 999 (₹/kg)" type="number" value={shop.silver999} onChange={S('silver999')} placeholder="0" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gold-200/50 p-5">
            <SectionTitle>Invoice Details</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="Invoice No." value={invoiceNo} onChange={setInvoiceNo} />
              <div>
                <label className="block text-xs font-medium text-ink-700/60 tracking-wide mb-1.5">Date</label>
                <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)}
                  className="w-full border border-gold-200/70 rounded-lg px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60 focus:border-gold-400" />
              </div>
              <Field label="CGST %" type="number" value={cgstRate} onChange={setCgstRate} />
              <Field label="SGST %" type="number" value={sgstRate} onChange={setSgstRate} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gold-200/50 p-5">
            <SectionTitle>Buyer Details</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Full Name" value={buyer.name} onChange={B('name')} placeholder="Customer name" />
              <Field label="Address" value={buyer.address} onChange={B('address')} placeholder="Colony / Area" />
              <Field label="State" value={buyer.state} onChange={B('state')} placeholder="Customer's state" />
              <Field label="State Code" value={buyer.stateCode} onChange={B('stateCode')} placeholder="e.g. 23" />
              <Field label="Mobile No." value={buyer.mobile} onChange={B('mobile')} placeholder="10-digit number" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gold-200/50 p-5">
            <SectionTitle>Items</SectionTitle>
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={item.id} className="border border-gold-200/60 rounded-xl p-4 bg-[#fdfbf6]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gold-700 uppercase tracking-widest">Item {idx+1}</span>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 text-xs font-medium">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="col-span-2 sm:col-span-1 lg:col-span-1">
                      <label className="block text-xs font-medium text-ink-700/60 tracking-wide mb-1.5">Description</label>
                      <input className="w-full border border-gold-200/70 rounded-lg px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60 focus:border-gold-400"
                        value={item.description} onChange={e => updateItem(item.id,'description',e.target.value)} placeholder="Payal, Ring..." />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-700/60 tracking-wide mb-1.5">HSN</label>
                      <input className="w-full border border-gold-200/70 rounded-lg px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60 focus:border-gold-400"
                        value={item.hsn} onChange={e => updateItem(item.id,'hsn',e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-700/60 tracking-wide mb-1.5">Pcs</label>
                      <input type="number" className="w-full border border-gold-200/70 rounded-lg px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60 focus:border-gold-400"
                        value={item.pcs} onChange={e => updateItem(item.id,'pcs',e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-700/60 tracking-wide mb-1.5">Gross Wt (g)</label>
                      <input type="number" className="w-full border border-gold-200/70 rounded-lg px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60 focus:border-gold-400"
                        value={item.grossWt} onChange={e => updateItem(item.id,'grossWt',e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-700/60 tracking-wide mb-1.5">Net Wt (g)</label>
                      <input type="number" className="w-full border border-gold-200/70 rounded-lg px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60 focus:border-gold-400"
                        value={item.netWt} onChange={e => updateItem(item.id,'netWt',e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-700/60 tracking-wide mb-1.5">Rate (₹)</label>
                      <input type="number" className="w-full border border-gold-200/70 rounded-lg px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60 focus:border-gold-400"
                        value={item.rate} onChange={e => updateItem(item.id,'rate',e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-700/60 tracking-wide mb-1.5">Rate Per</label>
                      <select className="w-full border border-gold-200/70 rounded-lg px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60 focus:border-gold-400"
                        value={item.ratePer} onChange={e => updateItem(item.id,'ratePer',e.target.value)}>
                        <option value="10g">per 10g</option>
                        <option value="1g">per 1g</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-700/60 tracking-wide mb-1.5">Making Chg</label>
                      <input type="number" className="w-full border border-gold-200/70 rounded-lg px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60 focus:border-gold-400"
                        value={item.making} onChange={e => updateItem(item.id,'making',e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-700/60 tracking-wide mb-1.5">Making Type</label>
                      <select className="w-full border border-gold-200/70 rounded-lg px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60 focus:border-gold-400"
                        value={item.makingType} onChange={e => updateItem(item.id,'makingType',e.target.value)}>
                        <option value="fixed">₹/g (Fixed)</option>
                        <option value="percent">% (Percent)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-700/60 tracking-wide mb-1.5">HM Chg</label>
                      <input className="w-full border border-gold-200/70 rounded-lg px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60 focus:border-gold-400"
                        value={item.hmChg} onChange={e => updateItem(item.id,'hmChg',e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-3 text-right">
                    <span className="inline-block bg-gold-100/60 backdrop-blur-md border border-gold-300/50 text-gold-800 font-bold text-sm rounded-lg px-4 py-1.5 tracking-wide">
                      Amount: ₹{(item.amount||0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addItem} className="mt-4 w-full border-2 border-dashed border-gold-300/70 rounded-xl py-3 text-gold-700 text-sm font-semibold hover:bg-gold-50 transition-all">
              + Add Item
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gold-200/50 p-5">
            <SectionTitle>Summary &amp; Payment</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <Field label="Discount (₹)" type="number" value={discount} onChange={setDiscount} />
              <div>
                <label className="block text-xs font-medium text-ink-700/60 tracking-wide mb-1.5">Payment Mode</label>
                <select className="w-full border border-gold-200/70 rounded-lg px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60 focus:border-gold-400"
                  value={payMode} onChange={e => setPayMode(e.target.value)}>
                  {['Cash','UPI','Card','Bank Transfer','Cheque'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="bg-white/40 backdrop-blur-md border border-gold-200/60 rounded-xl p-4 space-y-1.5 text-sm">
              {[['Subtotal',subtotal.toFixed(2)],['Discount',disc.toFixed(2)],['Taxable Amount',taxable.toFixed(2)],[`CGST @${cgstRate}%`,cgst.toFixed(2)],[`SGST @${sgstRate}%`,sgst.toFixed(2)],['Round Off',roundOff.toFixed(2)]].map(([l,v])=>(
                <div key={l} className="flex justify-between text-ink-700/60"><span>{l}</span><span className="font-medium text-ink-900">₹{v}</span></div>
              ))}
              <div className="flex justify-between font-bold gold-text text-base border-t border-gold-300/50 pt-2 mt-2">
                <span>Total Amount</span><span>₹{rounded}</span>
              </div>
              <div className="text-xs text-ink-700/50 italic pt-1 tracking-wide">{numToWords(rounded).toUpperCase()}</div>
            </div>
          </div>

          <div className="flex gap-3 pb-8">
            <button onClick={() => setTab('preview')} className="flex-1 bg-white/40 backdrop-blur-md hover:bg-white/60 text-ink-900 py-3.5 rounded-xl font-bold tracking-wide transition-all border border-gold-400/50">
              Preview Bill
            </button>
            <button onClick={handlePrint} className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-3.5 rounded-xl font-bold tracking-wide transition-all">
              Print / PDF
            </button>
          </div>
        </div>
      )}

      {tab === 'preview' && (
        <div className="max-w-4xl mx-auto px-2 py-4 sm:px-4">
          <div className="print-area bg-white shadow-xl rounded-2xl overflow-hidden border border-gold-200/60" id="invoice">

            {/* Header */}
            <div className="bg-white/50 backdrop-blur-md p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <p className="text-[10px] text-ink-700/40 uppercase tracking-[0.2em] font-medium">Original For Recipient</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 flex items-center justify-center text-ink-900 text-xl font-bold playfair flex-shrink-0 shadow ring-1 ring-gold-200/40">
                      {shop.name.charAt(0)}
                    </div>
                    <div>
                      <h1 className="playfair text-2xl sm:text-3xl font-bold gold-text">{shop.name}</h1>
                      <p className="text-xs text-ink-700/60 italic">{shop.tagline}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-ink-700/70 space-y-0.5">
                    <p>{shop.address}</p>
                    <p>{shop.city}</p>
                    <p>Mobile No.: <strong className="text-ink-900">{shop.mobile}</strong> &nbsp;|&nbsp; GSTIN: <strong className="text-ink-900">{shop.gstin}</strong></p>
                    <p>State: <strong className="text-ink-900">{shop.state}</strong>, CODE: <strong className="text-ink-900">{shop.stateCode}</strong></p>
                  </div>
                </div>
                <div className="sm:text-right text-xs text-ink-700/70 space-y-1 flex-shrink-0">
                  <p className="text-base font-bold text-ink-900">Invoice No.: <span className="text-gold-700">{invoiceNo}</span></p>
                  <p>Invoice Dated: <strong className="text-ink-900">{fmtDate(invoiceDate)}</strong></p>
                  <div className="mt-2 bg-white/50 backdrop-blur-md border border-gold-300/50 rounded-xl p-3 text-left">
                    <p className="text-gold-700 font-bold text-xs mb-1 uppercase tracking-wide">Today's Rates</p>
                    <p>Gold 24K: <strong className="text-ink-900">₹{shop.gold24k}/10g</strong></p>
                    <p>Silver 999: <strong className="text-ink-900">₹{shop.silver999}/kg</strong></p>
                  </div>
                </div>
              </div>
            </div>
            <div className="gold-rule" />

            {/* Buyer */}
            <div className="px-5 sm:px-6 py-4 bg-[#fbf8f1] border-b border-gold-100">
              <p className="text-xs font-bold text-gold-700 uppercase tracking-widest mb-2">Buyer (Bill To)</p>
              <p className="font-bold text-ink-900 text-base">{buyer.name || 'Customer'}</p>
              <p className="text-xs text-ink-700/70">{buyer.address}</p>
              <p className="text-xs text-ink-700/70">State: <strong>{buyer.state}</strong>, CODE: {buyer.stateCode}</p>
              {buyer.mobile && <p className="text-xs text-ink-700/70">Mobile No.: <strong>{buyer.mobile}</strong></p>}
              <p className="text-xs text-ink-700/70">Place of Supply: <strong>{buyer.state}</strong></p>
            </div>

            {/* Items Table */}
            <div className="px-3 sm:px-5 py-4 overflow-x-auto">
              <table className="w-full text-xs min-w-max">
                <thead>
                  <tr className="bg-gold-100/60 backdrop-blur-md text-ink-900 text-left border-b border-gold-300/50">
                    {['S.No','Description of Goods','PCS','Gross Wt(G)','Net Wt(G)','Rate(₹)','Making(₹)','HM Chg(₹)','Amt.(₹)'].map(h=>(
                      <th key={h} className="px-2.5 py-2.5 font-medium tracking-wide whitespace-nowrap first:rounded-tl-lg last:rounded-tr-lg">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className={`border-b border-gold-100 last:border-0 ${idx%2===0?'bg-white':'bg-gold-50/50'}`}>
                      <td className="px-2.5 py-2.5 text-center">{idx+1}</td>
                      <td className="px-2.5 py-2.5 font-semibold text-ink-900">{item.description}</td>
                      <td className="px-2.5 py-2.5 text-center">{item.pcs}</td>
                      <td className="px-2.5 py-2.5">{item.grossWt} g</td>
                      <td className="px-2.5 py-2.5">{item.netWt} g</td>
                      <td className="px-2.5 py-2.5">{item.rate}/{item.ratePer}</td>
                      <td className="px-2.5 py-2.5">{item.making}/{item.makingType==='percent'?'%':'g'}</td>
                      <td className="px-2.5 py-2.5">{item.hmChg}</td>
                      <td className="px-2.5 py-2.5 font-bold text-right text-gold-700">₹{(item.amount||0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom */}
            <div className="px-5 sm:px-6 pb-6 border-t border-gold-100 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                {/* Bank + QR */}
                <div>
                  <h3 className="text-xs font-bold text-gold-700 uppercase tracking-widest mb-2">Company Bank Details</h3>
                  <div className="text-xs text-ink-700/70 space-y-0.5 mb-3">
                    <p>A/c No.: <strong className="text-ink-900">{shop.accountName}</strong></p>
                    <p>Bank Name: <strong className="text-ink-900">{shop.bankName}</strong></p>
                    <p>Branch: <strong className="text-ink-900">{shop.branch}</strong></p>
                    <p>IFSC Code: <strong className="text-ink-900">{shop.ifsc}</strong></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="border border-gold-300 rounded-xl p-2 bg-white shadow-sm flex-shrink-0">
                      <QRCodeSVG value={upiString} size={88} level="M" />
                    </div>
                    <div className="text-xs text-ink-700/70">
                      <p className="font-bold text-ink-900 mb-1">Scan QR code with UPI Apps to pay</p>
                      <p>UPI ID</p>
                      <p className="font-bold text-gold-700">{shop.upiId}</p>
                      <p className="mt-2 text-emerald-700 font-bold text-sm">₹{rounded}</p>
                    </div>
                  </div>
                </div>

                {/* Totals */}
                <div>
                  <div className="bg-white/50 backdrop-blur-md border border-gold-200/60 rounded-xl p-4">
                    <p className="font-bold gold-text mb-1">Subtotal Amount: {subtotal.toFixed(2)}</p>
                    <p className="text-xs text-ink-700/50 mb-3">Mode of Payment: {payMode}: ₹{rounded}</p>
                    <table className="w-full text-xs">
                      <tbody>
                        {[['Subtotal Amount',subtotal.toFixed(2)],['Discount',disc.toFixed(2)],['Taxable Amount',taxable.toFixed(2)],[`CGST @ ${cgstRate}%`,cgst.toFixed(2)],[`SGST @ ${sgstRate}%`,sgst.toFixed(2)],['Total',(taxable+cgst+sgst).toFixed(2)],['Round Off',roundOff.toFixed(2)]].map(([l,v])=>(
                          <tr key={l} className="border-b border-gold-300/30 last:border-0">
                            <td className="py-1 text-ink-700/60">{l}</td>
                            <td className="py-1 text-right font-medium text-ink-900">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="border-t-2 border-gold-400/50 mt-2 pt-2 flex justify-between font-bold gold-text text-sm">
                      <span>Total Amount</span><span>{rounded}</span>
                    </div>
                    <p className="text-xs text-ink-700/50 italic mt-2">
                      <strong className="text-ink-700/70">Total Amount in Words:</strong><br/>{numToWords(rounded).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Declaration */}
            <div className="px-5 sm:px-6 pb-5 border-t border-gold-100 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-ink-700 mb-1">Declaration:</p>
                  <p className="text-xs text-ink-700/60">We declare that this invoice shows the actual price of the goods described and all particulars are true and correct.</p>
                  <p className="text-xs font-bold text-ink-700 mt-3 mb-1">Terms and Conditions:</p>
                  <p className="text-xs text-ink-700/60">Payment should be made by A/c payee only.<br/>All disputes are subjected to Rewa jurisdiction only.<br/>E. &amp; O.E.</p>
                </div>
                <div className="flex items-end justify-end">
                  <div className="text-center">
                    <div className="w-36 border-b border-gold-300 mb-1 mx-auto"></div>
                    <p className="text-xs text-ink-700/60">Authorised Signature</p>
                    <p className="text-xs font-bold text-gold-700">for {shop.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="no-print flex gap-3 mt-4 pb-8">
            <button onClick={() => setTab('form')} className="flex-1 border-2 border-gold-400/60 bg-white/30 backdrop-blur-md text-ink-900 py-3 rounded-xl font-bold hover:bg-white/60 transition-all">← Edit</button>
            <button onClick={handlePrint} className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-3 rounded-xl font-bold transition-all">Print / Save PDF</button>
          </div>
        </div>
      )}

      <footer className="no-print text-center py-4 text-xs text-ink-700/40">
        Developed by Nitin Soni &middot; <a href="mailto:nitinsoni815@gmail.com" className="hover:text-gold-700 transition-colors">nitinsoni815@gmail.com</a>
      </footer>
    </div>
  )
}

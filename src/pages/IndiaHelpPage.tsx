import { AlertOctagon, CheckCircle2, ExternalLink, Landmark, PhoneCall, ShieldAlert } from 'lucide-react';

export function IndiaHelpPage() {
  return (
    <div className="space-y-8">
      {/* Critical Immediate Financial Loss Banner */}
      <div className="rounded-xl border border-red-800/60 bg-red-950/25 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertOctagon className="h-6 w-6 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-red-200">
              If money has already been lost, act within the Golden Hour
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed">
              Immediately contact your bank or payment provider (UPI app / card helpline) to freeze your account or block cards, then call the National Cybercrime Helpline at <strong className="font-mono text-white">1930</strong> and file an official complaint at <strong className="font-mono text-cyan-300">https://cybercrime.gov.in/</strong>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="rounded-lg border border-red-900/50 bg-[#060A13] p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400">National Cybercrime Helpline (24x7)</p>
              <p className="font-mono text-2xl font-bold text-slate-100 tabular-nums mt-0.5">1930</p>
            </div>
            <PhoneCall className="h-6 w-6 text-red-400 shrink-0" />
          </div>

          <a
            href="https://cybercrime.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-cyan-500/40 bg-[#060A13] p-4 flex items-center justify-between gap-4 hover:border-cyan-400 transition-colors"
          >
            <div>
              <p className="text-xs text-slate-400">National Cyber Crime Reporting Portal</p>
              <p className="font-mono text-sm font-semibold text-cyan-300 mt-1">
                https://cybercrime.gov.in/
              </p>
            </div>
            <ExternalLink className="h-5 w-5 text-cyan-400 shrink-0" />
          </a>
        </div>
      </div>

      {/* Step-by-Step Banking & UPI Fraud Response */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <Landmark className="h-4 w-4 text-cyan-400" />
            <h3>UPI, IMPS & Banking Fraud Response Steps</h3>
          </div>
          <ol className="space-y-3 text-xs text-slate-300 leading-relaxed list-decimal list-inside">
            <li>
              <strong className="text-slate-100">Contact your bank immediately:</strong> Call your bank’s official fraud helpline (found on the back of your debit/credit card or official website) to place an emergency hold on outgoing transfers and disable net banking/UPI if compromised.
            </li>
            <li>
              <strong className="text-slate-100">Dial 1930 immediately:</strong> Fast reporting to 1930 enables cyber police to trigger lien/freeze requests on the recipient’s beneficiary bank account before funds are withdrawn.
            </li>
            <li>
              <strong className="text-slate-100">Submit complaint on cybercrime.gov.in:</strong> Select “Report Financial Fraud”, enter the exact 12-digit UTR / UPI Transaction Reference number, transaction date/time, and amount.
            </li>
            <li>
              <strong className="text-slate-100">RBI Zero-Liability & Ombudsman awareness:</strong> Under RBI guidelines, notify your bank within 3 working days of an unauthorized electronic banking transaction. Escalate unresolved bank disputes via the RBI Integrated Ombudsman portal (<span className="font-mono text-cyan-300">cms.rbi.org.in</span>) and check RBI Sachet (<span className="font-mono text-cyan-300">sachet.rbi.org.in</span>) for unauthorized deposit/investment schemes.
            </li>
          </ol>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <ShieldAlert className="h-4 w-4 text-cyan-400" />
            <h3>Digital Evidence Preservation Checklist</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Do not delete chats, SMS logs, or transaction alerts before filing a report. Preserve these items cleanly:
          </p>
          <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-100">Transaction Receipts & UTR Numbers:</strong> Save full PDF bank statements and UPI app transaction detail screens showing the 12-digit UTR, recipient UPI ID, and timestamp.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-100">Uncropped Screenshots:</strong> Capture full-screen WhatsApp/SMS chats showing the sender’s phone number, profile, and message timestamps.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-100">Suspicious URLs & Email Headers:</strong> Copy the exact URL text (without clicking) and download original email headers (.eml) if scammed via email.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-100">Remove Remote Access Apps:</strong> If a scammer asked you to install AnyDesk, TeamViewer, or an unknown .apk, turn off mobile data/Wi-Fi, uninstall the app, and reset banking passwords from a clean device.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* RBI & Telecom Official Verification Portals */}
      <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 space-y-3">
        <h3 className="text-sm font-semibold text-slate-100">Verified Indian Official Portals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <a
            href="https://cybercrime.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-800 bg-[#060A13] p-4 hover:border-cyan-500/40 transition-colors space-y-1"
          >
            <p className="font-semibold text-cyan-300">National Cybercrime Portal</p>
            <p className="text-slate-400">Official MHA reporting portal for financial and cyber crimes.</p>
          </a>
          <a
            href="https://sancharsaathi.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-800 bg-[#060A13] p-4 hover:border-cyan-500/40 transition-colors space-y-1"
          >
            <p className="font-semibold text-cyan-300">Sanchar Saathi (Chakshu)</p>
            <p className="text-slate-400">Department of Telecommunications portal to report suspected fraud calls/SMS.</p>
          </a>
          <a
            href="https://cms.rbi.org.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-800 bg-[#060A13] p-4 hover:border-cyan-500/40 transition-colors space-y-1"
          >
            <p className="font-semibold text-cyan-300">RBI Complaint Management</p>
            <p className="text-slate-400">Reserve Bank of India Ombudsman for unresolved bank/UPI disputes.</p>
          </a>
        </div>
      </div>
    </div>
  );
}

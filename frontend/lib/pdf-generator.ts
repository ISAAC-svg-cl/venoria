/**
 * Professional PDF & Print Document Generator for Venoria
 * Generates official Contracts & Invoices with Luxury Venoria Branding
 */

export interface ContractPdfData {
  title: string;
  contractNumber: string;
  startDate?: string;
  endDate?: string;
  clientName?: string;
  clientEmail?: string;
  hallName?: string;
  totalAmount?: string;
  status: string;
  dateCreated?: string;
  currency?: string;
}

export interface InvoicePdfData {
  reference: string;
  amount: string;
  method: string;
  date: string;
  clientName?: string;
  hallName?: string;
  status: string;
  currency?: string;
}

export function generateContractPdf(data: ContractPdfData) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <title>Contrat_${data.contractNumber || "VENORIA"}</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          color: #1a2e26;
          background: #ffffff;
          margin: 0;
          padding: 0;
          font-size: 13px;
          line-height: 1.6;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #d4af37;
          padding-bottom: 18px;
          margin-bottom: 24px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand-logo {
          width: 38px;
          height: 38px;
          background: #142c26;
          color: #d4af37;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 20px;
        }
        .brand h1 {
          margin: 0;
          font-size: 20px;
          color: #142c26;
          letter-spacing: 2px;
        }
        .brand span {
          font-size: 11px;
          color: #888;
          display: block;
        }
        .doc-badge {
          background: #142c26;
          color: #d4af37;
          padding: 6px 14px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
        }
        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #142c26;
          border-bottom: 1px solid #eee;
          padding-bottom: 4px;
          margin: 20px 0 10px 0;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .info-box {
          background: #f9faf8;
          border: 1px solid #e5eae6;
          border-radius: 8px;
          padding: 12px 16px;
        }
        .info-box strong {
          display: block;
          color: #142c26;
          margin-bottom: 4px;
        }
        .info-box p {
          margin: 0;
          color: #555;
        }
        .clauses {
          margin: 20px 0;
          font-size: 12px;
          color: #444;
        }
        .clauses ol {
          padding-left: 18px;
        }
        .clauses li {
          margin-bottom: 6px;
        }
        .signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 40px;
          page-break-inside: avoid;
        }
        .sign-box {
          border: 1.5px dashed #ccc;
          border-radius: 8px;
          padding: 16px;
          height: 110px;
          background: #fafafa;
        }
        .sign-box p {
          margin: 0 0 8px 0;
          font-size: 11px;
          font-weight: 600;
          color: #142c26;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 11px;
          color: #999;
          border-top: 1px solid #eee;
          padding-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">
          <div class="brand-logo">V</div>
          <div>
            <h1>VENORIA</h1>
            <span>Gestion Événementielle & Salles de Prestige</span>
          </div>
        </div>
        <div class="doc-badge">CONTRAT OFFICIEL</div>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="margin: 0 0 6px 0; color: #142c26; font-size: 17px;">${data.title}</h2>
        <span style="color: #666; font-size: 12px;">Numéro de référence : <strong>${data.contractNumber || "CTR-" + Date.now().toString().slice(-6)}</strong> · Date : ${data.dateCreated || new Date().toLocaleDateString("fr-FR")}</span>
      </div>

      <div class="info-grid">
        <div class="info-box">
          <strong>L'Établissement Bailleur :</strong>
          <p>VENORIA Prestige & Domaines</p>
          <p>Direction des Événements & Réceptions</p>
          <p>contact@venoria.fr</p>
        </div>
        <div class="info-box">
          <strong>Le Preneur / Client :</strong>
          <p>${data.clientName || "Client Enregistré"}</p>
          <p>${data.clientEmail || "Coordonnées au dossier"}</p>
          <p>Statut du contrat : <strong style="color: #142c26;">${data.status === "signed" ? "Signé & Validé" : "En cours de validation"}</strong></p>
        </div>
      </div>

      <div class="section-title">CONDITIONS & ENGAGEMENTS</div>
      <div class="clauses">
        <ol>
          <li><strong>Objet de la convention :</strong> Mise à disposition privatisée de l'espace événementiel et des équipements associés pour la tenue de la réception convenue.</li>
          <li><strong>Dates & Horaires :</strong> Prise de possession du lieu le ${data.startDate || "Date convenue"} jusqu'au ${data.endDate || "Date convenue"}.</li>
          <li><strong>Règlement & Caution :</strong> Le preneur s'engage à respecter les consignes de sécurité, de volume sonore et la capacité maximale autorisée.</li>
          <li><strong>Assurance & Responsabilité :</strong> Le client atteste être couvert par une assurance responsabilité civile pour l'ensemble des convives et prestataires présents.</li>
        </ol>
      </div>

      <div class="signatures">
        <div class="sign-box">
          <p>Pour VENORIA (Signature & Cachet) :</p>
          <div style="color: #d4af37; font-weight: 700; margin-top: 30px;">[ Approuvé & Certifié ]</div>
        </div>
        <div class="sign-box">
          <p>Pour le Client (Mention manuscrite « Lu et approuvé ») :</p>
        </div>
      </div>

      <div class="footer">
        Document généré électroniquement par le système de gestion VENORIA · Tous droits réservés.
      </div>
      <script>
        window.onload = () => { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function generateInvoicePdf(data: InvoicePdfData) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <title>Reçu_Paiement_${data.reference.replace(/\\s+/g, "_")}</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          color: #1a2e26;
          background: #ffffff;
          margin: 0;
          padding: 0;
          font-size: 13px;
          line-height: 1.6;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #d4af37;
          padding-bottom: 18px;
          margin-bottom: 24px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand-logo {
          width: 38px;
          height: 38px;
          background: #142c26;
          color: #d4af37;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 20px;
        }
        .brand h1 {
          margin: 0;
          font-size: 20px;
          color: #142c26;
          letter-spacing: 2px;
        }
        .doc-badge {
          background: #142c26;
          color: #d4af37;
          padding: 6px 14px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
        }
        .invoice-box {
          background: #f9faf8;
          border: 1px solid #e5eae6;
          border-radius: 8px;
          padding: 16px 20px;
          margin: 20px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .invoice-box strong {
          font-size: 16px;
          color: #142c26;
        }
        .amount-highlight {
          font-size: 24px;
          font-weight: 800;
          color: #142c26;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 24px 0;
        }
        th {
          background: #142c26;
          color: #ffffff;
          padding: 10px 14px;
          text-align: left;
          font-size: 12px;
        }
        td {
          padding: 12px 14px;
          border-bottom: 1px solid #eee;
          font-size: 13px;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 11px;
          color: #999;
          border-top: 1px solid #eee;
          padding-top: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">
          <div class="brand-logo">V</div>
          <div>
            <h1>VENORIA</h1>
            <span style="font-size: 11px; color: #888;">Gestion Événementielle & Salles de Prestige</span>
          </div>
        </div>
        <div class="doc-badge">REÇU D'ENCAISSEMENT</div>
      </div>

      <div class="invoice-box">
        <div>
          <strong>${data.reference}</strong>
          <p style="margin: 4px 0 0 0; color: #666; font-size: 12px;">Date d'encaissement : ${data.date} · Moyen : ${data.method}</p>
        </div>
        <div class="amount-highlight">${data.amount}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>DÉSIGNATION / PRESTATION</th>
            <th>DATE</th>
            <th>MODE DE RÈGLEMENT</th>
            <th>STATUT</th>
            <th style="text-align: right;">MONTANT TOTAL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>${data.reference}</strong><br /><small style="color: #666;">Règlement enregistré sur compte sécurisé</small></td>
            <td>${data.date}</td>
            <td>${data.method}</td>
            <td><strong style="color: #142c26;">${data.status}</strong></td>
            <td style="text-align: right; font-weight: 700;">${data.amount}</td>
          </tr>
        </tbody>
      </table>

      <div style="background: #fdfdfd; border: 1px solid #eee; border-radius: 8px; padding: 14px; margin-top: 30px;">
        <strong style="color: #142c26; font-size: 12px;">Mention libératoire :</strong>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #666;">Le présent document atteste du bon encaissement de la somme susmentionnée au crédit du compte de l'établissement VENORIA. Ce reçu vaut quittance sous réserve d'encaissement effectif.</p>
      </div>

      <div class="footer">
        VENORIA · Établissement de Réceptions d'Exception · Reçu certifié conforme
      </div>
      <script>
        window.onload = () => { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

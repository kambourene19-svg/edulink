import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

export const generateTicketPDF = async (booking: any) => {
    // Générer le QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(booking.id, {
        margin: 1,
        width: 200,
        color: {
            dark: '#1e293b',
            light: '#ffffff'
        }
    });

    // Créer un élément invisible pour le ticket
    const element = document.createElement('div');
    element.style.width = '400px';
    element.style.padding = '40px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.background = '#fff';
    element.style.position = 'absolute';
    element.style.left = '-9999px';

    element.innerHTML = `
        <div style="border: 2px solid #2563eb; padding: 25px; border-radius: 12px; background-image: radial-gradient(#f1f5f9 1px, transparent 1px); background-size: 20px 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px;">
                <div>
                     <h1 style="color: #2563eb; margin: 0; font-size: 28px; letter-spacing: -1px;">FasoTicket</h1>
                     <p style="color: #64748b; font-size: 10px; margin: 0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Reçu de Voyage / E-Ticket</p>
                </div>
                <div style="text-align: right;">
                    <img src="${booking.schedule.route.company.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.schedule.route.company.name)}&background=random`}" 
                         style="width: 60px; height: 60px; border-radius: 8px; border: 1px solid #f1f5f9; object-fit: contain; background: white;" />
                </div>
            </div>
            
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <p style="font-size: 9px; color: #94a3b8; margin: 0; text-transform: uppercase; font-weight: bold;">Réf. Réservation</p>
                <p style="font-family: monospace; font-size: 16px; font-weight: bold; margin: 2px 0; color: #1e293b;">${booking.id.split('-')[0].toUpperCase()}</p>
            </div>

            <div style="margin-bottom: 25px;">
                <p style="font-size: 10px; color: #94a3b8; margin: 0; text-transform: uppercase; font-weight: bold;">Compagnie de Transport</p>
                <p style="font-size: 22px; font-weight: bold; margin: 5px 0; color: #1e293b;">${booking.schedule.route.company.name}</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 10px; margin-bottom: 25px; align-items: center;">
                <div>
                    <p style="font-size: 10px; color: #94a3b8; margin: 0; text-transform: uppercase;">Départ</p>
                    <p style="font-weight: bold; margin: 5px 0; font-size: 16px;">${booking.schedule.route.departureCity}</p>
                </div>
                <div style="color: #cbd5e1;">➝</div>
                <div style="text-align: right;">
                    <p style="font-size: 10px; color: #94a3b8; margin: 0; text-transform: uppercase;">Arrivée</p>
                    <p style="font-weight: bold; margin: 5px 0; font-size: 16px;">${booking.schedule.route.arrivalCity}</p>
                </div>
            </div>

            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <span style="font-size: 11px; color: #64748b; display: block; margin-bottom: 2px;">Date</span>
                        <span style="font-weight: bold; color: #334155;">${new Date(booking.schedule.departureTime).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div>
                        <span style="font-size: 11px; color: #64748b; display: block; margin-bottom: 2px;">Heure</span>
                        <span style="font-weight: bold; color: #334155;">${new Date(booking.schedule.departureTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div>
                        <span style="font-size: 11px; color: #64748b; display: block; margin-bottom: 2px;">Bus</span>
                        <span style="font-weight: bold; color: #334155;">${booking.schedule.bus?.plate || 'Standard'}</span>
                    </div>
                    <div>
                        <span style="font-size: 11px; color: #64748b; display: block; margin-bottom: 2px;">Siège</span>
                        <span style="background: #2563eb; color: #fff; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 14px;">N° ${booking.seatNumber}</span>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 25px;">
                <p style="font-size: 10px; color: #94a3b8; margin: 0; text-transform: uppercase; font-weight: bold;">Passager</p>
                <p style="font-weight: bold; margin: 5px 0; font-size: 16px;">${booking.user.fullName}</p>
                <p style="font-size: 12px; color: #64748b; margin: 0;">Tel: ${booking.user.phone}</p>
            </div>

            <div style="text-align: center; border-top: 2px dashed #e2e8f0; padding-top: 25px;">
                <p style="font-size: 9px; color: #94a3b8; margin-bottom: 10px; letter-spacing: 1px;">SCANNEZ CE CODE À L'EMBARQUEMENT</p>
                <div style="display: flex; justify-content: center; margin-bottom: 15px;">
                    <img src="${qrCodeDataUrl}" style="width: 130px; height: 130px; border: 4px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
                </div>
                <div style="background: #ecfdf5; color: #047857; padding: 10px; border-radius: 8px; display: inline-block; width: 100%;">
                    <p style="font-size: 10px; margin: 0; opacity: 0.8;">MONTANT PAYÉ</p>
                    <p style="font-size: 18px; font-weight: 900; margin: 2px 0;">${booking.schedule.route.price.toLocaleString()} FCFA</p>
                </div>
            </div>
        </div>
        <p style="font-size: 8px; color: #94a3b8; text-align: center; margin-top: 15px;">Ce document fait office de reçu de paiement et de titre de transport. - FasoTicket</p>
    `;

    document.body.appendChild(element);

    try {
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [canvas.width / 4, canvas.height / 4] // Ajuster la taille
        });

        pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
        pdf.save(`Ticket_FasoTicket_${booking.id.slice(0, 8)}.pdf`);
    } finally {
        document.body.removeChild(element);
    }
};

export const generateManifestPDF = async (manifest: any) => {
    const element = document.createElement('div');
    element.style.width = '800px';
    element.style.padding = '40px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.background = '#fff';
    element.style.position = 'absolute';
    element.style.left = '-9999px';

    const dateStr = new Date(manifest.schedule.departureTime).toLocaleDateString('fr-FR');
    const timeStr = new Date(manifest.schedule.departureTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    element.innerHTML = `
        <div style="border: 2px solid #000; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; text-transform: uppercase;">Manifeste de Voyage - FasoTicket</h1>
                <p style="font-size: 14px;">Document officiel pour transport de passagers</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; background: #f1f5f9; padding: 15px; border-radius: 8px;">
                <div>
                    <p><strong>TRAJET :</strong> ${manifest.schedule.route}</p>
                    <p><strong>BUS :</strong> ${manifest.schedule.bus}</p>
                </div>
                <div>
                    <p><strong>DATE :</strong> ${dateStr} à ${timeStr}</p>
                    <p><strong>NOMBRE DE PASSAGERS :</strong> ${manifest.schedule.confirmedCount} / ${manifest.schedule.totalSeats}</p>
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e2e8f0;">
                        <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left;">N° Siège</th>
                        <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left;">Nom Complet</th>
                        <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left;">Téléphone</th>
                        <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left;">N° Pièce</th>
                        <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left;">Émargement</th>
                    </tr>
                </thead>
                <tbody>
                    ${manifest.passengers.map((p: any) => `
                        <tr>
                            <td style="border: 1px solid #cbd5e1; padding: 10px; font-weight: bold;">${p.seat}</td>
                            <td style="border: 1px solid #cbd5e1; padding: 10px;">${p.name}</td>
                            <td style="border: 1px solid #cbd5e1; padding: 10px;">${p.phone}</td>
                            <td style="border: 1px solid #cbd5e1; padding: 10px;">${p.idCard || 'N/A'}</td>
                            <td style="border: 1px solid #cbd5e1; padding: 10px; width: 100px;"></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                <div style="text-align: center; width: 200px; border-top: 1px solid #000; padding-top: 10px;">Signature Chauffeur</div>
                <div style="text-align: center; width: 200px; border-top: 1px solid #000; padding-top: 10px;">Cachet Compagnie</div>
            </div>
        </div>
        <p style="font-size: 8px; color: #94a3b8; text-align: right; margin-top: 20px;">Généré le ${new Date().toLocaleString('fr-FR')}</p>
    `;

    document.body.appendChild(element);

    try {
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width / 2, canvas.height / 2]
        });

        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save(`Manifeste_${manifest.schedule.route.replace(' ➔ ', '_')}_${dateStr}.pdf`);
    } finally {
        document.body.removeChild(element);
    }
};

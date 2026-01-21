import * as XLSX from 'xlsx';

export const exportCustomersToExcel = (data, fileName = 'Liste') => {
  try {
    if (!data || data.length === 0) {
      throw new Error("Dışa aktarılacak veri bulunamadı.");
    }

    // Normalize data structure for export
    // Handles both database format (snake_case) and scraped format (mixed)
    const excelData = data.map(item => {
      // Logic to prefer scraped data fields if available
      const companyName = item.company_name || item.company_name_surname || item.name || '';
      const phone = item.phone || item.brand_rep_phone || '';
      const email = item.email || item.brand_rep_email || '';
      
      // Address might be in different fields
      let address = item.address || item.billing_address || item.raw_text || '';
      // Clean up raw text if it was used as fallback
      if (address.length > 200) address = address.substring(0, 200) + '...';

      return {
        "FİRMA ADI": companyName,
        "TELEFON": phone,
        "E-MAIL": email,
        "ADRES": address
      };
    });

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    
    // Set column widths for better readability
    const wscols = [
      { wch: 40 }, // Company Name
      { wch: 20 }, // Phone
      { wch: 30 }, // Email
      { wch: 60 }  // Address
    ];
    worksheet['!cols'] = wscols;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Katılımcı Listesi");

    // Generate filename
    const safeName = fileName.replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ\s-]/gi, '').trim() || 'Export';
    const finalFileName = safeName.toLowerCase().endsWith('.xlsx') 
      ? safeName 
      : `${safeName}.xlsx`;

    // Export file
    XLSX.writeFile(workbook, finalFileName);
    return { success: true };
  } catch (error) {
    console.error("Excel export failed:", error);
    return { success: false, error: error.message };
  }
};
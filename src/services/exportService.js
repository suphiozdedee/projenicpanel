import { supabase } from '@/lib/customSupabaseClient';
import { exportCustomersToExcel } from '@/lib/excelExport';

export const ExportService = {
  /**
   * Main function to handle the export process
   * @param {string} input - Can be a Fair ID, a URL containing a UUID, or (fallback) a fair name
   */
  async processExport(input) {
    try {
      if (!input) throw new Error("Lütfen geçerli bir fuar linki veya ID'si giriniz.");

      let fairId = null;
      let fairName = 'Fuar';

      // 1. Try to extract UUID from input (Link or direct ID)
      const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
      const match = input.match(uuidRegex);

      if (match) {
        fairId = match[0];
      } 
      
      // 2. Fetch Fair Details if we have an ID
      if (fairId) {
        const { data: fair, error: fairError } = await supabase
          .from('fairs')
          .select('id, fair_name')
          .eq('id', fairId)
          .single();
          
        if (fairError && fairError.code !== 'PGRST116') {
           console.error("Fair fetch error:", fairError);
           // Continue even if fair lookup fails, we might still search by ID, but won't have name
        }
        
        if (fair) {
            fairName = fair.fair_name;
        }
      } else {
        // Fallback: If no UUID found, maybe user typed a name. 
        // Note: The requirement strictly asked for Link/ID logic, but this is a safety net.
        // We'll skip this if strictly following ID logic, but for UX let's leave it as "Invalid ID"
        throw new Error("Girilen metin içerisinde geçerli bir Fuar ID'si veya Linki bulunamadı.");
      }

      // 3. Query Customers using the fair_ids array column
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .contains('fair_ids', [fairId]);

      if (customerError) throw customerError;

      if (!customers || customers.length === 0) {
        throw new Error(`"${fairName}" için kayıtlı müşteri bulunamadı.`);
      }

      // 4. Generate Excel
      const result = exportCustomersToExcel(customers, fairName);
      
      return { success: true, count: customers.length, fairName };

    } catch (error) {
      console.error("Export service error:", error);
      throw error;
    }
  }
};

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import MasterButton from '@/components/MasterButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CreateCustomerDialog({ isOpen, onClose, onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [fairs, setFairs] = useState([]);
  const [loadingFairs, setLoadingFairs] = useState(false);
  
  const [selectedFairIds, setSelectedFairIds] = useState([]);
  const [formData, setFormData] = useState({
      customer_name_surname: '',
      brand_rep_id: '',
      brand_rep_name: '',
      brand_rep_phone: '',
      brand_rep_email: '',
      company_name: '',
      billing_address: '',
      tax_office: '',
      tax_number: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchFairs();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .order('full_name');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchFairs = async () => {
    try {
      setLoadingFairs(true);
      const { data, error } = await supabase
        .from('fairs')
        .select('id, fair_name')
        .order('fair_name');
      
      if (error) throw error;
      
      setFairs(data || []);
    } catch (error) {
      console.error('Error fetching fairs:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Fuarlar yüklenirken bir sorun oluştu."
      });
    } finally {
      setLoadingFairs(false);
    }
  };

  const handleRepChange = (userId) => {
      const selectedUser = users.find(u => u.id === userId);
      if (selectedUser) {
          setFormData({
              ...formData,
              brand_rep_id: selectedUser.id,
              brand_rep_name: selectedUser.full_name,
              brand_rep_email: selectedUser.email
          });
      }
  };

  const toggleFair = (fairId) => {
      setSelectedFairIds(prev => 
          prev.includes(fairId) 
              ? prev.filter(id => id !== fairId)
              : [...prev, fairId]
      );
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      
      try {
          const { data, error } = await supabase
              .from('customers')
              .insert([{
                  customer_name_surname: formData.customer_name_surname,
                  brand_rep_id: formData.brand_rep_id || null,
                  brand_rep_name: formData.brand_rep_name,
                  brand_rep_phone: formData.brand_rep_phone,
                  brand_rep_email: formData.brand_rep_email,
                  company_name: formData.company_name,
                  billing_address: formData.billing_address,
                  tax_office: formData.tax_office,
                  tax_number: formData.tax_number,
                  fair_ids: selectedFairIds 
              }])
              .select()
              .single();

          if (error) throw error;

          toast({
              title: "Başarılı",
              description: "Müşteri başarıyla eklendi.",
              className: "bg-green-500/10 border-green-500 text-green-500"
          });

          // Reset form
          setFormData({ 
              customer_name_surname: '',
              brand_rep_id: '',
              brand_rep_name: '',
              brand_rep_phone: '',
              brand_rep_email: '',
              company_name: '',
              billing_address: '',
              tax_office: '',
              tax_number: '',
          });
          setSelectedFairIds([]);

          onSuccess(data);
          onClose();
      } catch (error) {
          console.error('Error creating customer:', error);
          toast({
              variant: "destructive",
              title: "Hata",
              description: "Müşteri eklenirken bir sorun oluştu."
          });
      } finally {
          setLoading(false);
      }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
           
           <div className="space-y-2 border-b border-zinc-800 pb-4">
               <h3 className="text-sm font-semibold text-blue-500 uppercase tracking-wider">Müşteri Bilgileri</h3>
               <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                       <Label>Müşteri Adı Soyadı</Label>
                       <Input 
                          value={formData.customer_name_surname} 
                          onChange={e => setFormData({...formData, customer_name_surname: e.target.value})}
                          className="bg-zinc-950 border-zinc-800 text-white"
                          required
                       />
                   </div>
                   
                   <div className="space-y-2">
                       <Label>Marka Temsilcisi</Label>
                       <Select onValueChange={handleRepChange} value={formData.brand_rep_id}>
                          <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                             <SelectValue placeholder="Temsilci Seçiniz" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                             {users.map(user => (
                               <SelectItem key={user.id} value={user.id}>
                                 {user.full_name || user.email}
                               </SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                   </div>
               </div>

               <div className="space-y-2">
                   <Label>Katıldığı Fuarlar (Çoklu Seçim)</Label>
                   <div className="bg-zinc-950 border border-zinc-800 rounded-md p-2">
                       {loadingFairs ? (
                           <div className="flex items-center justify-center py-4">
                               <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                           </div>
                       ) : fairs.length === 0 ? (
                           <div className="text-center py-4 text-zinc-500 text-sm">
                               Fuar bulunamadı
                           </div>
                       ) : (
                           <ScrollArea className="h-[120px] w-full pr-4">
                               <div className="space-y-2">
                                   {fairs.map((fair) => {
                                       const isSelected = selectedFairIds.includes(fair.id);
                                       return (
                                           <div 
                                               key={fair.id} 
                                               onClick={() => toggleFair(fair.id)}
                                               className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${
                                                   isSelected ? 'bg-blue-500/20 border border-blue-500/50' : 'hover:bg-zinc-900 border border-transparent'
                                               }`}
                                           >
                                               <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                                   isSelected ? 'bg-blue-500 border-blue-500' : 'border-zinc-600'
                                               }`}>
                                                   {isSelected && <Check className="w-3 h-3 text-white" />}
                                               </div>
                                               <span className={`text-sm ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                                                   {fair.fair_name}
                                               </span>
                                           </div>
                                       );
                                   })}
                               </div>
                           </ScrollArea>
                       )}
                   </div>
                   <div className="flex gap-2 flex-wrap mt-2">
                       {selectedFairIds.map(id => {
                           const fair = fairs.find(f => f.id === id);
                           return fair ? (
                               <Badge key={id} variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                                   {fair.fair_name}
                                   <button 
                                       type="button"
                                       className="ml-1 hover:text-red-500" 
                                       onClick={(e) => {
                                           e.stopPropagation();
                                           toggleFair(id);
                                       }}
                                   >
                                       ×
                                   </button>
                               </Badge>
                           ) : null;
                       })}
                   </div>
               </div>
           </div>

           <div className="space-y-2 border-b border-zinc-800 pb-4">
               <h3 className="text-sm font-semibold text-blue-500 uppercase tracking-wider">İletişim Bilgileri (Temsilci)</h3>
               <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                       <Label>Telefon</Label>
                       <Input 
                          value={formData.brand_rep_phone} 
                          onChange={e => setFormData({...formData, brand_rep_phone: e.target.value})}
                          className="bg-zinc-950 border-zinc-800 text-white"
                       />
                   </div>
                   <div className="space-y-2">
                       <Label>E-posta</Label>
                       <Input 
                          value={formData.brand_rep_email} 
                          onChange={e => setFormData({...formData, brand_rep_email: e.target.value})}
                          className="bg-zinc-950 border-zinc-800 text-white"
                          type="email"
                       />
                   </div>
               </div>
           </div>

           <div className="space-y-2">
               <h3 className="text-sm font-semibold text-blue-500 uppercase tracking-wider">Fatura Bilgileri</h3>
               <div className="space-y-2">
                   <Label>Firma Adı / Unvanı</Label>
                   <Input 
                      value={formData.company_name} 
                      onChange={e => setFormData({...formData, company_name: e.target.value})}
                      className="bg-zinc-950 border-zinc-800 text-white"
                      required
                      placeholder="Faturada görünecek firma adı"
                   />
               </div>
               <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                       <Label>Vergi Dairesi</Label>
                       <Input 
                          value={formData.tax_office} 
                          onChange={e => setFormData({...formData, tax_office: e.target.value})}
                          className="bg-zinc-950 border-zinc-800 text-white"
                       />
                   </div>
                   <div className="space-y-2">
                       <Label>Vergi Numarası</Label>
                       <Input 
                          value={formData.tax_number} 
                          onChange={e => setFormData({...formData, tax_number: e.target.value})}
                          className="bg-zinc-950 border-zinc-800 text-white"
                       />
                   </div>
               </div>
               <div className="space-y-2">
                   <Label>Adres</Label>
                   <Textarea 
                      value={formData.billing_address} 
                      onChange={e => setFormData({...formData, billing_address: e.target.value})}
                      className="bg-zinc-950 border-zinc-800 text-white min-h-[80px]"
                      placeholder="Fatura adresi..."
                   />
               </div>
           </div>

           <DialogFooter className="pt-4 gap-2">
               <MasterButton 
                   type="button" 
                   variant="outline" 
                   onClick={onClose}
                   disabled={loading}
               >
                   İptal
               </MasterButton>
               <MasterButton 
                   type="submit" 
                   variant="primary"
                   disabled={loading}
               >
                   {loading ? (
                       <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Kaydediliyor...
                       </>
                   ) : (
                       'Kaydet'
                   )}
               </MasterButton>
           </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

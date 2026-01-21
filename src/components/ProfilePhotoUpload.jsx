import React, { useRef, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Camera, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePhotoUpload({ className }) {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      // 1. Validation
      if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Sadece JPG, PNG veya WEBP formatları kabul edilir.",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Dosya boyutu 5MB'dan küçük olmalıdır.",
        });
        return;
      }

      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      // 2. Upload to Supabase Storage
      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      // Handle bucket not found by attempting to create it
      if (uploadError && (uploadError.message.includes('bucket not found') || uploadError.message.includes('The resource was not found'))) {
        console.log("Bucket 'avatars' not found. Attempting to create...");
        
        const { error: createBucketError } = await supabase.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: 5242880,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        });

        if (createBucketError) {
          console.error("Failed to create bucket:", createBucketError);
          // If we can't create it, we throw the original error to be handled below
        } else {
          // Retry upload if bucket creation succeeded
          const { error: retryError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });
          
          if (retryError) {
             uploadError = retryError;
          } else {
             uploadError = null; // Success on retry
          }
        }
      }

      if (uploadError) {
        // Check if bucket exists error
        if (uploadError.message.includes('bucket not found') || uploadError.message.includes('The resource was not found')) {
            throw new Error("Avatars depolama alanı bulunamadı. Lütfen sistem yöneticisi ile iletişime geçin.");
        }
        throw uploadError;
      }

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 4. Update Profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 5. Refresh Context
      await refreshUser();

      toast({
        title: "Başarılı",
        description: "Profil fotoğrafınız güncellendi.",
        className: "bg-green-500/10 border-green-500 text-green-500"
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Yükleme Başarısız",
        description: error.message || "Profil fotoğrafı yüklenirken bir sorun oluştu.",
      });
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const userInitials = user?.username?.substring(0, 2).toUpperCase() || 
                       user?.email?.substring(0, 2).toUpperCase() || "??";

  return (
    <div className={cn("relative group cursor-pointer", className)} onClick={triggerFileInput}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={uploading}
      />
      
      <div className="relative inline-block">
        <Avatar className="w-10 h-10 border-2 border-transparent group-hover:border-[#FF6200] transition-all duration-300 shadow-lg shadow-black/20">
          <AvatarImage src={user?.avatar_url} className="object-cover" />
          <AvatarFallback className="bg-gradient-to-br from-[#FF6200] to-red-600 text-white font-bold text-sm">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : userInitials}
          </AvatarFallback>
        </Avatar>

        {/* Edit Overlay */}
        <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
          {uploading ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Camera className="w-4 h-4 text-white drop-shadow-md" />
          )}
        </div>

        {/* Tiny Edit Icon Badge */}
        {!uploading && (
          <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-1 border border-zinc-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity delay-75">
             <Edit2 className="w-2.5 h-2.5 text-[#FF6200]" />
          </div>
        )}
      </div>
    </div>
  );
}
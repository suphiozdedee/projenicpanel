import React from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Lock, Globe, Palette, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

function SettingsView({ userRole, userData }) {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  const settingsSections = [
    {
      title: 'Profile Settings',
      icon: User,
      fields: [
        { label: 'Full Name', type: 'text', placeholder: 'John Doe' },
        { label: 'Email Address', type: 'email', placeholder: userData?.email || 'email@example.com', disabled: true },
        { label: 'Phone Number', type: 'tel', placeholder: '+1 234 567 8900' }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      fields: [
        { label: 'Email Notifications', type: 'checkbox', checked: true },
        { label: 'Project Updates', type: 'checkbox', checked: true },
        { label: 'Request Alerts', type: 'checkbox', checked: false }
      ]
    },
    {
      title: 'Security',
      icon: Lock,
      fields: [
        { label: 'Current Password', type: 'password', placeholder: '••••••••' },
        { label: 'New Password', type: 'password', placeholder: '••••••••' },
        { label: 'Confirm Password', type: 'password', placeholder: '••••••••' }
      ]
    }
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Database className="w-6 h-6 text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">Firebase Integration</h3>
            <p className="text-slate-400 text-sm mb-4">
              This dashboard uses Firebase for authentication and Firestore for real-time data management. 
              All changes are automatically synced across devices.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400">Connected and Active</span>
            </div>
          </div>
        </div>
      </div>

      {settingsSections.map((section, sectionIndex) => {
        const Icon = section.icon;
        return (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
            </div>

            <div className="space-y-4">
              {section.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="space-y-2">
                  {field.type === 'checkbox' ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`${section.title}-${fieldIndex}`}
                        defaultChecked={field.checked}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900/50 text-orange-500 focus:ring-orange-500/20"
                      />
                      <Label htmlFor={`${section.title}-${fieldIndex}`} className="text-slate-300 cursor-pointer">
                        {field.label}
                      </Label>
                    </div>
                  ) : (
                    <>
                      <Label htmlFor={`${section.title}-${fieldIndex}`} className="text-slate-300">
                        {field.label}
                      </Label>
                      <Input
                        id={`${section.title}-${fieldIndex}`}
                        type={field.type}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20 disabled:opacity-50"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}

      <div className="flex justify-end gap-3">
        <Button
          variant="ghost"
          className="text-slate-400 hover:text-white hover:bg-slate-700/50"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export default SettingsView;
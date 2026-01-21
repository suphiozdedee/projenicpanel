
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Trash2, CheckCircle, Mail, Settings, Bell, Search, Upload } from 'lucide-react';

export default function ButtonShowcase() {
  return (
    <div className="p-8 space-y-8 bg-[#0A0A0A] min-h-screen text-white">
      <h1 className="text-3xl font-bold text-[#FF6200]">Button Component Style Guide</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Variants */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary">Primary (Default)</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="success">Success</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link Button</Button>
            </div>
          </CardContent>
        </Card>

        {/* Sizes */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Sizes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="sm">Small (h-9)</Button>
              <Button size="default">Default (h-10)</Button>
              <Button size="lg">Large (h-12)</Button>
            </div>
            <div className="flex flex-wrap gap-4 items-center mt-4">
               <span className="text-sm text-zinc-400">Icon Sizes:</span>
               <Button size="iconSm" variant="secondary"><Settings className="w-4 h-4" /></Button>
               <Button size="icon" variant="secondary"><Settings className="w-5 h-5" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* States */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">States</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <Button isLoading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button variant="secondary" disabled>Disabled Sec</Button>
              <Button variant="destructive" isLoading>Deleting...</Button>
            </div>
          </CardContent>
        </Card>

        {/* With Icons */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">With Icons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <Button>
                <Mail className="mr-2 h-4 w-4" /> Send Email
              </Button>
              <Button variant="secondary">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Button>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Item
              </Button>
              <Button variant="success">
                <CheckCircle className="mr-2 h-4 w-4" /> Approve
              </Button>
              <Button variant="outline">
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Practical Examples */}
        <Card className="bg-zinc-900 border-zinc-800 col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Practical UI Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Toolbar Example */}
            <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg bg-black/40">
               <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm"><Search className="w-4 h-4 mr-2" /> Filter</Button>
                  <Button variant="ghost" size="sm">Sort By</Button>
               </div>
               <div className="flex items-center gap-2">
                  <Button variant="secondary" size="iconSm"><Bell className="w-4 h-4" /></Button>
                  <Button variant="primary" size="sm"><Upload className="w-4 h-4 mr-2" /> Export</Button>
               </div>
            </div>

            {/* Modal Footer Example */}
            <div className="flex justify-end gap-3 p-4 border border-zinc-800 rounded-lg bg-black/40">
               <Button variant="secondary">Cancel</Button>
               <Button variant="primary">Save Changes</Button>
            </div>

            {/* Destructive Action */}
            <div className="flex justify-between items-center p-4 border border-zinc-800 rounded-lg bg-black/40">
               <span className="text-zinc-400 text-sm">Delete this project permanently?</span>
               <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-2" /> Delete Project</Button>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}

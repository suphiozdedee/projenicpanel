import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Trash2, Save, X, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function DataPreviewTable({ initialData, onReset, onExport }) {
  const [data, setData] = useState(initialData);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    // Add temporary IDs for list management if not present
    const dataWithIds = initialData.map((item, index) => ({
      ...item,
      _tempId: index
    }));
    setData(dataWithIds);
  }, [initialData]);

  const handleDelete = (id) => {
    setData(prev => prev.filter(item => item._tempId !== id));
  };

  const handleEditStart = (item) => {
    setEditingId(item._tempId);
    setEditForm({ ...item });
  };

  const handleEditSave = () => {
    setData(prev => prev.map(item => 
      item._tempId === editingId ? { ...editForm } : item
    ));
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleExportClick = () => {
    // Strip temp IDs before exporting
    const cleanData = data.map(({ _tempId, ...rest }) => rest);
    onExport(cleanData);
  };

  if (!data || data.length === 0) return null;

  return (
    <Card className="glass-card bg-zinc-900/40 border-zinc-800 animate-in fade-in zoom-in-95 duration-300">
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="bg-[#FF6200] text-white text-xs px-2 py-1 rounded-full">{data.length} Kayıt</span>
              Önizleme ve Düzenleme
            </h3>
            <p className="text-sm text-zinc-500">Verileri dışa aktarmadan önce düzenleyebilir veya silebilirsiniz.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onReset} className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
              <RotateCcw className="w-4 h-4 mr-2" />
              Temizle
            </Button>
            <Button onClick={handleExportClick} className="bg-[#FF6200] hover:bg-[#FF8000] text-white">
              <Download className="w-4 h-4 mr-2" />
              Excel Olarak İndir
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-zinc-800 overflow-hidden">
          <div className="max-h-[500px] overflow-auto">
            <Table>
              <TableHeader className="bg-zinc-900/50 sticky top-0 z-10 backdrop-blur-sm">
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400 min-w-[200px]">FİRMA ADI</TableHead>
                  <TableHead className="text-zinc-400 min-w-[150px]">TELEFON</TableHead>
                  <TableHead className="text-zinc-400 min-w-[200px]">E-MAIL</TableHead>
                  <TableHead className="text-zinc-400 min-w-[300px]">ADRES</TableHead>
                  <TableHead className="text-right text-zinc-400 w-[100px]">İŞLEMLER</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row._tempId} className="border-zinc-800 hover:bg-zinc-900/30">
                    {editingId === row._tempId ? (
                      <>
                        <TableCell>
                          <Input 
                            value={editForm.firma_adi || ''} 
                            onChange={e => setEditForm({...editForm, firma_adi: e.target.value})}
                            className="h-8 bg-zinc-950 border-zinc-700 text-white"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={editForm.telefon || ''} 
                            onChange={e => setEditForm({...editForm, telefon: e.target.value})}
                            className="h-8 bg-zinc-950 border-zinc-700 text-white"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={editForm.email || ''} 
                            onChange={e => setEditForm({...editForm, email: e.target.value})}
                            className="h-8 bg-zinc-950 border-zinc-700 text-white"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={editForm.adres || ''} 
                            onChange={e => setEditForm({...editForm, adres: e.target.value})}
                            className="h-8 bg-zinc-950 border-zinc-700 text-white"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10" onClick={handleEditSave}>
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={handleEditCancel}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium text-zinc-200">{row.firma_adi || '-'}</TableCell>
                        <TableCell className="text-zinc-400">{row.telefon || '-'}</TableCell>
                        <TableCell className="text-zinc-400">{row.email || '-'}</TableCell>
                        <TableCell className="text-zinc-400 truncate max-w-[300px]" title={row.adres}>{row.adres || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-zinc-400 hover:text-white hover:bg-zinc-800"
                              onClick={() => handleEditStart(row)}
                            >
                              Düzenle
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                              onClick={() => handleDelete(row._tempId)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
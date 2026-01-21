import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const COLUMNS = [
  { id: 'todo', title: 'Yapılacaklar', color: 'bg-slate-800 border-orange-500/30' },
  { id: 'in_progress', title: 'Devam Ediyor', color: 'bg-slate-800 border-blue-500/30' },
  { id: 'done', title: 'Tamamlandı', color: 'bg-slate-800 border-green-500/30' }
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(taskList);
    }, (error) => {
      console.error("Görevler getirilirken hata oluştu:", error);
      toast({
        title: "Bağlantı Hatası",
        description: "Görevler getirilemedi. Lütfen bağlantınızı kontrol edin.",
        variant: "destructive"
      });
    });

    return () => unsubscribe();
  }, [currentUser, toast]);

  const handleSaveTask = async () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: "Başlık Gerekli",
        description: "Lütfen bir görev başlığı girin.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingTask) {
        await updateDoc(doc(db, 'tasks', editingTask.id), {
          title: newTaskTitle,
          description: newTaskDesc,
        });
        toast({ title: "Görev Güncellendi", description: "Göreviniz güncellendi." });
      } else {
        await addDoc(collection(db, 'tasks'), {
          title: newTaskTitle,
          description: newTaskDesc,
          status: 'todo',
          userId: currentUser.uid,
          createdAt: serverTimestamp()
        });
        toast({ title: "Görev Oluşturuldu", description: "Yapılacaklara yeni görev eklendi." });
      }
      closeDialog();
    } catch (error) {
      console.error("Görev kaydedilirken hata oluştu:", error);
      toast({ 
        title: "Hata", 
        description: "Görev kaydedilemedi. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await deleteDoc(doc(db, 'tasks', taskToDelete.id));
      toast({ title: "Görev Silindi" });
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error("Görev silinirken hata oluştu:", error);
      toast({
        title: "Hata",
        description: "Görev silinemedi.",
        variant: "destructive"
      });
    }
  };

  const openDeleteDialog = (task) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const handleMoveTask = async (task, direction) => {
    const currentIndex = COLUMNS.findIndex(col => col.id === task.status);
    if (currentIndex === -1) return;

    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < COLUMNS.length) {
      try {
        await updateDoc(doc(db, 'tasks', task.id), {
          status: COLUMNS[newIndex].id
        });
      } catch (error) {
        console.error("Görev taşınırken hata oluştu:", error);
      }
    }
  };

  const openNewTaskDialog = () => {
    setEditingTask(null);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setIsDialogOpen(true);
  };

  const openEditTaskDialog = (task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDesc(task.description);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingTask(null);
    setNewTaskTitle('');
    setNewTaskDesc('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-orange-500">Proje Panosu</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewTaskDialog} className="bg-orange-600 hover:bg-orange-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Yeni Görev
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Görevi Düzenle' : 'Yeni Görev Oluştur'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-slate-300">Başlık</Label>
                <Input
                  id="title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="örn., Ana Sayfayı Yeniden Tasarla"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-slate-300">Açıklama</Label>
                <Input
                  id="description"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Detayları ekle..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">İptal</Button>
              <Button onClick={handleSaveTask} className="bg-orange-600 hover:bg-orange-700 text-white">Görevi Kaydet</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Görevi Sil</DialogTitle>
          </DialogHeader>
          <p className="text-slate-300">Bu görevi silmek istediğinizden emin misiniz? Bu eylem geri alınamaz.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">İptal</Button>
            <Button onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Sil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <div key={column.id} className={`flex flex-col rounded-xl border border-slate-800 bg-slate-900/50 p-4 ${column.color} border-t-4`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-slate-200">{column.title}</h3>
              <span className="text-xs bg-slate-800 px-2 py-1 rounded-full text-slate-400 border border-slate-700">
                {tasks.filter(t => t.status === column.id).length}
              </span>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto min-h-[200px]">
              {tasks
                .filter(task => task.status === column.id)
                .map(task => (
                  <Card key={task.id} className="bg-slate-800 border-slate-700 shadow-md hover:border-orange-500/50 transition-colors group">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base text-slate-100">{task.title}</CardTitle>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-orange-400" onClick={() => openEditTaskDialog(task)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-400" onClick={() => openDeleteDialog(task)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {task.description && (
                      <CardContent className="p-4 pt-0 pb-2">
                        <p className="text-sm text-slate-400 line-clamp-2">{task.description}</p>
                      </CardContent>
                    )}
                    <CardFooter className="p-2 flex justify-between bg-slate-800/50 rounded-b-lg">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={column.id === 'todo'}
                        onClick={() => handleMoveTask(task, 'prev')}
                        className="h-7 px-2 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                      >
                        <ArrowLeft className="h-3 w-3 mr-1" /> Önceki
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={column.id === 'done'}
                        onClick={() => handleMoveTask(task, 'next')}
                        className="h-7 px-2 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                      >
                        Sonraki <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
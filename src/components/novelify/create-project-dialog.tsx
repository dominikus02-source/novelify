'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Loader2 } from 'lucide-react';
import { useNovelifyStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Language options with code mapping
const languageOptions = [
  { value: 'id', label: 'Indonesian' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'hi', label: 'Hindi' },
  { value: 'other', label: 'Other' },
];

const genreOptions = [
  'Fiction',
  'Fantasy',
  'Romance',
  'Mystery',
  'Thriller',
  'Sci-Fi',
  'Horror',
  'Drama',
  'Literary Fiction',
  'Historical Fiction',
  'Non-Fiction',
  'Other',
];

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const { setSelectedProject, setCurrentView, setProjects, projects } = useNovelifyStore();

  // Form state
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('id');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [plotOutline, setPlotOutline] = useState('');
  const [styleGuide, setStyleGuide] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState(false);

  // Reset form
  const resetForm = () => {
    setTitle('');
    setGenre('');
    setSourceLanguage('id');
    setTargetLanguage('en');
    setPlotOutline('');
    setStyleGuide('');
    setTitleError(false);
    setIsSubmitting(false);
  };

  // Handle dialog close
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate title
    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          genre: genre || null,
          sourceLanguage,
          targetLanguage,
          plotOutline: plotOutline.trim() || null,
          styleGuide: styleGuide.trim() || null,
        }),
      });

      if (res.ok) {
        const newProject = await res.json();

        // Update the projects list in the store
        setProjects([newProject, ...projects]);

        // Set the selected project and navigate
        setSelectedProject(newProject);
        setCurrentView('project');

        // Close and reset
        handleOpenChange(false);
      } else {
        const data = await res.json();
        console.error('Failed to create project:', data.error);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-white border-border/50">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber/10">
              <BookOpen className="size-5 text-amber" />
            </div>
            <div>
              <DialogTitle className="text-xl text-ink">Create New Novel</DialogTitle>
              <DialogDescription>
                Set up your novel project with the details below
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-2"
          >
            <Label htmlFor="title" className="text-ink">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter your novel title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) setTitleError(false);
              }}
              aria-invalid={titleError}
              className={titleError ? 'border-destructive focus-visible:border-destructive' : ''}
            />
            {titleError && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-sm text-destructive"
              >
                Title is required
              </motion.p>
            )}
          </motion.div>

          {/* Genre */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <Label className="text-ink">Genre</Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                {genreOptions.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Languages row */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-2">
              <Label className="text-ink">Source Language</Label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-ink">Target Language</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Plot Outline */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <Label className="text-ink">Plot Outline</Label>
            <Textarea
              placeholder="Describe the plot of your novel..."
              value={plotOutline}
              onChange={(e) => setPlotOutline(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </motion.div>

          {/* Writing Style */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-2"
          >
            <Label className="text-ink">Writing Style</Label>
            <Textarea
              placeholder="e.g., conversational, poetic, suspenseful"
              value={styleGuide}
              onChange={(e) => setStyleGuide(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </motion.div>

          {/* Actions */}
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber hover:bg-amber/90 text-ink font-semibold shadow-md transition-all hover:shadow-lg min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Novel'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
